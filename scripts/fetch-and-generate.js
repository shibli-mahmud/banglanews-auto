/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const Parser = require("rss-parser");
const slugify = require("slugify");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const parser = new Parser();
const MAX_ITEMS_PER_FEED = 5;
const MAX_ARTICLES_PER_RUN = Number(process.env.MAX_ARTICLES_PER_RUN || 25);
const REQUEST_DELAY_MS = Number(process.env.REQUEST_DELAY_MS || 4000);
const RETRY_LIMIT = Number(process.env.RETRY_LIMIT || 3);
const MIN_SUMMARY_LENGTH = 40;

const RSS_FEEDS = [
  "https://feeds.bbci.co.uk/news/rss.xml",
  "https://feeds.reuters.com/reuters/topNews",
  "https://rss.cnn.com/rss/edition.rss",
  "https://www.thedailystar.net/rss.xml",
  "https://www.prothomalo.com/feed",
  "https://bdnews24.com/feed/",
  "https://www.dhakatribune.com/feed"
];

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeYamlString(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\n", " ")
    .trim();
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
      const delay = Math.min(2000 * 2 ** (attempt - 1), 10000);
      console.warn(`${taskName} failed on attempt ${attempt}/${RETRY_LIMIT}: ${error.message}`);
      if (attempt < RETRY_LIMIT) {
        await sleep(delay);
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
  const prompt = `
You are a professional news journalist. Based on the following news headline and summary, write a complete, original news article.

Headline: ${headline}
Summary: ${summary}
Category: ${category}

Write the article in TWO versions:
1. English version (400-600 words, professional journalistic tone)
2. Bangla version (400-600 words, same content in Bangla)

Return ONLY a valid JSON object, no markdown, no backticks:
{
  "en": {
    "title": "English title here",
    "excerpt": "Short 2-sentence summary",
    "body": "Full article body in English...",
    "tags": ["tag1", "tag2", "tag3"],
    "category": "category name"
  },
  "bn": {
    "title": "Bangla title here",
    "excerpt": "Short Bangla summary",
    "body": "Full article body in Bangla...",
    "tags": ["ট্যাগ১", "ট্যাগ২"],
    "category": "বিভাগ"
  }
}`;

  return withRetry("Gemini rewrite", async () => {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const json = extractJsonObject(text);
    const parsed = JSON.parse(json);
    if (!parsed?.en?.body || !parsed?.bn?.body) {
      throw new Error("Gemini returned incomplete bilingual payload");
    }
    return parsed;
  });
}

function resolveUniqueSlug(baseSlug, enDir, bnDir) {
  let candidate = baseSlug;
  let counter = 1;
  while (
    fs.existsSync(path.join(enDir, `${candidate}.md`)) ||
    fs.existsSync(path.join(bnDir, `${candidate}.md`))
  ) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
  return candidate;
}

function extractSummary(item) {
  return (item.contentSnippet || item.content || item.summary || "").replace(/\s+/g, " ").trim();
}

function isValidFeedItem(item) {
  const title = (item.title || "").trim();
  const summary = extractSummary(item);
  return Boolean(title) && summary.length >= MIN_SUMMARY_LENGTH;
}

function buildMarkdown(payload, locale, slug, image, date) {
  const safeBody = (payload.body || "").trim();
  return `---
title: "${sanitizeYamlString(payload.title)}"
date: "${date}"
slug: "${slug}"
category: "${sanitizeYamlString(payload.category || "General")}"
tags: ${JSON.stringify(payload.tags || [])}
image: "${image}"
imageAlt: "${sanitizeYamlString(payload.title || "News image")}"
excerpt: "${sanitizeYamlString(payload.excerpt)}"
locale: "${locale}"
---

${safeBody}
`;
}

async function run() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const enDir = path.join(process.cwd(), "content", "en");
  const bnDir = path.join(process.cwd(), "content", "bn");
  ensureDir(enDir);
  ensureDir(bnDir);
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
        const category = item.categories?.[0] || "General";
        const rawSlug = slugify(headline, { lower: true, strict: true }).slice(0, 90);

        if (!rawSlug) continue;

        const slug = resolveUniqueSlug(rawSlug, enDir, bnDir);
        const enPath = path.join(enDir, `${slug}.md`);
        const bnPath = path.join(bnDir, `${slug}.md`);

        console.log(`Generating: ${headline}`);
        const image = (await fetchPexelsImage(`${headline} ${category}`)) || item.enclosure?.url || "";
        const rewritten = await rewriteArticle(headline, summary, category);
        const date = new Date(item.isoDate || Date.now()).toISOString();

        fs.writeFileSync(enPath, buildMarkdown(rewritten.en, "en", slug, image, date), "utf8");
        fs.writeFileSync(bnPath, buildMarkdown(rewritten.bn, "bn", slug, image, date), "utf8");
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
