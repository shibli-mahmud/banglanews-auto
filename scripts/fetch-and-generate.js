/* eslint-disable no-console */
const Parser = require("rss-parser");
const slugify = require("slugify");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  TITLE_SIMILARITY_THRESHOLD,
  DEDUPE_WINDOW_HOURS,
  loadArticles,
  baseSlug,
  titleSimilarity,
  inferCategory,
  writeMarkdown
} = require("./lib/article-utils");

const parser = new Parser();
const MAX_ITEMS_PER_FEED = Number(process.env.MAX_ITEMS_PER_FEED || 2);
const MAX_ARTICLES_PER_RUN = Number(process.env.MAX_ARTICLES_PER_RUN || 5);
const REQUEST_DELAY_MS = Number(process.env.REQUEST_DELAY_MS || 20000);
const RETRY_LIMIT = Number(process.env.RETRY_LIMIT || 3);
const RETRY_DELAY_MS = Number(process.env.RETRY_DELAY_MS || 30000);
const MIN_SUMMARY_LENGTH = 40;

const RSS_FEEDS = [
  "https://feeds.bbci.co.uk/news/rss.xml",
  "https://www.thedailystar.net/rss.xml",
  "https://en.prothomalo.com/feed",
  "https://www.newagebd.net/feed/rss"
];

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJsonObject(rawText) {
  const text = String(rawText || "").replace(/```json|```/g, "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in Gemini response");
  }
  return text.slice(start, end + 1);
}

async function withRetry(taskName, fn) {
  let lastError;
  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`${taskName} failed on attempt ${attempt}/${RETRY_LIMIT}: ${error.message}`);
      if (attempt < RETRY_LIMIT) {
        console.warn(`Waiting ${RETRY_DELAY_MS / 1000}s before retry...`);
        await sleep(RETRY_DELAY_MS);
      }
    }
  }
  throw lastError;
}

async function fetchPexelsImage(query) {
  if (!process.env.PEXELS_API_KEY) return "";
  return withRetry("Pexels image fetch", async () => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;
    const res = await fetch(url, {
      headers: { Authorization: process.env.PEXELS_API_KEY }
    });
    if (!res.ok) {
      throw new Error(`Pexels status ${res.status}`);
    }
    const data = await res.json();
    return data?.photos?.[0]?.src?.large2x ?? "";
  });
}

async function rewriteArticle(headline, summary, category) {
  const shortSummary = summary.slice(0, 280);
  const prompt = `Bilingual news JSON from headline/summary. EN+BN, 250-350 words each, journalistic.
Headline: ${headline}
Summary: ${shortSummary}
Category: ${category}
Use this exact category string for both en.category and bn.category: "${category}"
Return only JSON: {"en":{"title":"","excerpt":"","body":"","tags":[],"category":"${category}"},"bn":{"title":"","excerpt":"","body":"","tags":[],"category":"${category}"}}`;

  return withRetry("Gemini rewrite", async () => {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const json = extractJsonObject(text);
    const parsed = JSON.parse(json);
    if (!parsed?.en?.body || !parsed?.bn?.body) {
      throw new Error("Gemini returned incomplete bilingual payload");
    }
    parsed.en.category = category;
    parsed.bn.category = category;
    return parsed;
  });
}

function extractSummary(item) {
  return (item.contentSnippet || item.content || item.summary || "").replace(/\s+/g, " ").trim();
}

function isValidFeedItem(item) {
  const title = (item.title || "").trim();
  const summary = extractSummary(item);
  return Boolean(title) && summary.length >= MIN_SUMMARY_LENGTH;
}

function itemIdentity(item) {
  return {
    guid: String(item.guid || item.id || "").trim(),
    sourceUrl: String(item.link || "").trim()
  };
}

function buildDedupeIndex(existingArticles) {
  const windowMs = DEDUPE_WINDOW_HOURS * 60 * 60 * 1000;
  const now = Date.now();
  const recent = existingArticles.filter(
    (article) => !article.timestamp || now - article.timestamp <= windowMs * 2
  );
  return {
    slugs: new Set(existingArticles.map((article) => article.slug)),
    baseSlugs: new Set(existingArticles.map((article) => baseSlug(article.slug))),
    guids: new Set(existingArticles.map((article) => article.sourceGuid).filter(Boolean)),
    urls: new Set(existingArticles.map((article) => article.sourceUrl).filter(Boolean)),
    recent
  };
}

function findDuplicateReason(headline, slug, identity, index) {
  if (identity.guid && index.guids.has(identity.guid)) return `guid ${identity.guid}`;
  if (identity.sourceUrl && index.urls.has(identity.sourceUrl)) return `url ${identity.sourceUrl}`;
  if (index.slugs.has(slug) || index.baseSlugs.has(baseSlug(slug))) return `slug ${slug}`;
  const match = index.recent.find((article) => titleSimilarity(headline, article.title) >= TITLE_SIMILARITY_THRESHOLD);
  if (match) return `similar title "${match.title}"`;
  return null;
}

function rememberGenerated(index, article) {
  index.slugs.add(article.slug);
  index.baseSlugs.add(baseSlug(article.slug));
  if (article.sourceGuid) index.guids.add(article.sourceGuid);
  if (article.sourceUrl) index.urls.add(article.sourceUrl);
  index.recent.push(article);
}

async function run() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const index = buildDedupeIndex(loadArticles("en"));
  let generatedCount = 0;

  for (const feedUrl of RSS_FEEDS) {
    if (generatedCount >= MAX_ARTICLES_PER_RUN) {
      console.log(`Reached MAX_ARTICLES_PER_RUN=${MAX_ARTICLES_PER_RUN}. Stopping early.`);
      break;
    }
    try {
      console.log(`Reading feed: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      const items = (feed.items || []).filter(isValidFeedItem).slice(0, MAX_ITEMS_PER_FEED);
      console.log(`Processing ${items.length} items from feed.`);

      for (const item of items) {
        if (generatedCount >= MAX_ARTICLES_PER_RUN) {
          console.log(`Reached MAX_ARTICLES_PER_RUN=${MAX_ARTICLES_PER_RUN}. Stopping early.`);
          break;
        }
        const headline = item.title || "Untitled";
        const summary = extractSummary(item);
        const identity = itemIdentity(item);
        const slug = slugify(headline, { lower: true, strict: true }).slice(0, 90);
        if (!slug) continue;

        const duplicateReason = findDuplicateReason(headline, slug, identity, index);
        if (duplicateReason) {
          console.log(`Skip duplicate (${duplicateReason}): ${headline}`);
          continue;
        }

        const category = inferCategory({
          title: headline,
          excerpt: summary,
          tags: item.categories || [],
          feedUrl,
          rawCategory: item.categories?.[0]
        });

        console.log(`Generating: ${headline}`);
        const image = (await fetchPexelsImage(`${headline} ${category}`)) || item.enclosure?.url || "";
        const rewritten = await rewriteArticle(headline, summary, category);
        const date = new Date(item.isoDate || Date.now()).toISOString();

        const sharedMeta = {
          date,
          slug,
          category,
          image,
          sourceUrl: identity.sourceUrl,
          sourceGuid: identity.guid,
          sourceFeed: feedUrl
        };

        writeMarkdown("en", {
          ...sharedMeta,
          title: rewritten.en.title,
          excerpt: rewritten.en.excerpt,
          body: rewritten.en.body,
          tags: rewritten.en.tags,
          imageAlt: rewritten.en.title
        });
        writeMarkdown("bn", {
          ...sharedMeta,
          title: rewritten.bn.title,
          excerpt: rewritten.bn.excerpt,
          body: rewritten.bn.body,
          tags: rewritten.bn.tags,
          imageAlt: rewritten.bn.title
        });

        rememberGenerated(index, {
          slug,
          title: rewritten.en.title || headline,
          timestamp: Date.parse(date),
          sourceUrl: identity.sourceUrl,
          sourceGuid: identity.guid
        });
        generatedCount += 1;

        await sleep(REQUEST_DELAY_MS);
      }
    } catch (error) {
      console.error(`Failed feed: ${feedUrl}`, error.message);
    }
  }

  console.log(`Generation complete. New articles: ${generatedCount}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
