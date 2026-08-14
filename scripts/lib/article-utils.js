const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const CONTENT_ROOT = path.join(process.cwd(), "content");
const LOCALES = ["en", "bn"];
const RETENTION_DAYS = Number(process.env.RETENTION_DAYS || 21);
const DEDUPE_WINDOW_HOURS = Number(process.env.DEDUPE_WINDOW_HOURS || 72);
const TITLE_SIMILARITY_THRESHOLD = Number(process.env.TITLE_SIMILARITY_THRESHOLD || 0.55);

const CATEGORY_KEYS = ["bangladesh", "international", "politics", "sports", "tech"];

const CATEGORY_PATTERNS = [
  {
    key: "sports",
    pattern:
      /\b(sport|cricket|football|soccer|fifa|uefa|premier league|la liga|nba|nfl|tennis|olympics?|world cup|wicket|goal|match|tournament|athlete|coach|bangladesh (premier|cricket)|bcb|t20|odi)\b/i
  },
  {
    key: "tech",
    pattern:
      /\b(tech|technology|ai\b|artificial intelligence|google|apple|microsoft|amazon|meta|smartphone|cyber|software|internet|startup|chip|semiconductor|robot)\b/i
  },
  {
    key: "politics",
    pattern:
      /\b(election|parliament|minister|president|prime minister|political|politics|vote|voting|party|congress|senate|cabinet|mp\b|awami|bnp|hasina|yunus|opposition)\b/i
  },
  {
    key: "bangladesh",
    pattern:
      /\b(bangladesh|dhaka|chittagong|chattogram|sylhet|khulna|rajshahi|barishal|rangpur|mymensingh|padma|bangla|bangladeshi|ctg)\b/i
  }
];

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "in",
  "on",
  "of",
  "for",
  "and",
  "to",
  "as",
  "is",
  "at",
  "by",
  "from",
  "with",
  "after",
  "over",
  "into",
  "about",
  "says",
  "say",
  "new",
  "amid",
  "as",
  "its"
]);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function contentDir(locale) {
  return path.join(CONTENT_ROOT, locale);
}

function articlePath(locale, slug) {
  return path.join(contentDir(locale), `${slug}.md`);
}

function listMarkdownFiles(locale) {
  const dir = contentDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((name) => name.endsWith(".md"));
}

function parseArticle(locale, fileName) {
  const filePath = path.join(contentDir(locale), fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const slug = data.slug || fileName.replace(/\.md$/, "");
  return {
    locale,
    fileName,
    filePath,
    slug,
    title: data.title || slug,
    date: data.date || "",
    timestamp: Date.parse(data.date || "") || 0,
    category: String(data.category || "general").toLowerCase(),
    tags: Array.isArray(data.tags) ? data.tags : [],
    image: data.image || "",
    imageAlt: data.imageAlt || data.title || "",
    excerpt: data.excerpt || "",
    sourceUrl: data.sourceUrl || "",
    sourceGuid: data.sourceGuid || "",
    sourceFeed: data.sourceFeed || "",
    body: content.trim(),
    data
  };
}

function loadArticles(locale) {
  return listMarkdownFiles(locale).map((fileName) => parseArticle(locale, fileName));
}

function baseSlug(slug) {
  return String(slug || "").replace(/-\d+$/, "");
}

function normalizeTitle(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .join(" ")
    .trim();
}

function titleTokens(title) {
  return new Set(normalizeTitle(title).split(" ").filter(Boolean));
}

function titleSimilarity(a, b) {
  const aTokens = titleTokens(a);
  const bTokens = titleTokens(b);
  if (aTokens.size === 0 || bTokens.size === 0) return 0;
  let intersection = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) intersection += 1;
  }
  return intersection / (aTokens.size + bTokens.size - intersection);
}

function isSameStory(articleA, articleB, threshold = TITLE_SIMILARITY_THRESHOLD) {
  if (baseSlug(articleA.slug) === baseSlug(articleB.slug)) return true;
  if (articleA.sourceGuid && articleB.sourceGuid && articleA.sourceGuid === articleB.sourceGuid) {
    return true;
  }
  if (articleA.sourceUrl && articleB.sourceUrl && articleA.sourceUrl === articleB.sourceUrl) {
    return true;
  }
  const windowMs = DEDUPE_WINDOW_HOURS * 60 * 60 * 1000;
  if (Math.abs((articleA.timestamp || 0) - (articleB.timestamp || 0)) > windowMs) return false;
  return titleSimilarity(articleA.title, articleB.title) >= threshold;
}

function defaultCategoryForFeed(feedUrl) {
  const url = String(feedUrl || "").toLowerCase();
  if (url.includes("bbc") || url.includes("reuters") || url.includes("cnn")) return "international";
  if (url.includes("thedailystar") || url.includes("prothomalo") || url.includes("newagebd") || url.includes("dhakatribune")) {
    return "bangladesh";
  }
  return "international";
}

function inferCategory({ title, excerpt, tags, feedUrl, rawCategory } = {}) {
  const haystack = `${title || ""} ${excerpt || ""} ${(tags || []).join(" ")} ${rawCategory || ""}`.toLowerCase();
  if (CATEGORY_PATTERNS[0].pattern.test(haystack)) return "sports";
  if (CATEGORY_PATTERNS[1].pattern.test(haystack)) return "tech";
  const fromFeed = defaultCategoryForFeed(feedUrl);
  const isBangladesh =
    CATEGORY_PATTERNS[3].pattern.test(haystack) || fromFeed === "bangladesh";
  if (isBangladesh) return "bangladesh";
  if (CATEGORY_PATTERNS[2].pattern.test(haystack)) return "politics";
  return fromFeed || "international";
}

function canonicalizeCategory(value, fallback = "international") {
  const key = String(value || "").toLowerCase().trim();
  if (CATEGORY_KEYS.includes(key)) return key;
  return inferCategory({ rawCategory: key, title: fallback === "international" ? "" : key }) || fallback;
}

function retentionCutoff(now = Date.now()) {
  return now - RETENTION_DAYS * 24 * 60 * 60 * 1000;
}

function deleteArticlePair(slug) {
  for (const locale of LOCALES) {
    const filePath = articlePath(locale, slug);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

function sanitizeYamlString(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\n", " ")
    .trim();
}

function writeMarkdown(locale, payload) {
  const filePath = articlePath(locale, payload.slug);
  const body = (payload.body || "").trim();
  const yaml = `---
title: "${sanitizeYamlString(payload.title)}"
date: "${payload.date}"
slug: "${payload.slug}"
category: "${sanitizeYamlString(payload.category)}"
tags: ${JSON.stringify(payload.tags || [])}
image: "${payload.image || ""}"
imageAlt: "${sanitizeYamlString(payload.imageAlt || payload.title || "News image")}"
excerpt: "${sanitizeYamlString(payload.excerpt)}"
locale: "${locale}"
sourceUrl: "${sanitizeYamlString(payload.sourceUrl)}"
sourceGuid: "${sanitizeYamlString(payload.sourceGuid)}"
sourceFeed: "${sanitizeYamlString(payload.sourceFeed)}"
---

${body}
`;
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, yaml, "utf8");
}

function rewriteFrontmatter(article, updates) {
  const next = { ...article.data, ...updates };
  const serialized = matter.stringify(article.body ? `${article.body}\n` : "", next);
  fs.writeFileSync(article.filePath, serialized, "utf8");
}

module.exports = {
  CONTENT_ROOT,
  LOCALES,
  RETENTION_DAYS,
  DEDUPE_WINDOW_HOURS,
  TITLE_SIMILARITY_THRESHOLD,
  CATEGORY_KEYS,
  ensureDir,
  contentDir,
  articlePath,
  listMarkdownFiles,
  parseArticle,
  loadArticles,
  baseSlug,
  normalizeTitle,
  titleSimilarity,
  isSameStory,
  defaultCategoryForFeed,
  inferCategory,
  canonicalizeCategory,
  retentionCutoff,
  deleteArticlePair,
  writeMarkdown,
  rewriteFrontmatter,
  sanitizeYamlString
};
