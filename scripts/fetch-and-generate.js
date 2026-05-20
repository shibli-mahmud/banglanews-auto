/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const Parser = require("rss-parser");
const slugify = require("slugify");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const parser = new Parser();

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

async function fetchPexelsImage(query) {
  if (!process.env.PEXELS_API_KEY) return "";
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;
  const res = await fetch(url, {
    headers: { Authorization: process.env.PEXELS_API_KEY }
  });
  if (!res.ok) return "";
  const data = await res.json();
  return data?.photos?.[0]?.src?.large2x ?? "";
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

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

function buildMarkdown(payload, locale, slug, image, date) {
  const safeBody = (payload.body || "").trim();
  return `---
title: "${(payload.title || "").replaceAll('"', '\\"')}"
date: "${date}"
slug: "${slug}"
category: "${payload.category || "General"}"
tags: ${JSON.stringify(payload.tags || [])}
image: "${image}"
imageAlt: "${(payload.title || "News image").replaceAll('"', '\\"')}"
excerpt: "${(payload.excerpt || "").replaceAll('"', '\\"')}"
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

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const items = (feed.items || []).slice(0, 3);

      for (const item of items) {
        const headline = item.title || "Untitled";
        const summary = item.contentSnippet || item.content || "";
        const category = item.categories?.[0] || "General";
        const slug = slugify(headline, { lower: true, strict: true }).slice(0, 90);

        if (!slug) continue;

        const enPath = path.join(enDir, `${slug}.md`);
        const bnPath = path.join(bnDir, `${slug}.md`);
        if (fs.existsSync(enPath) || fs.existsSync(bnPath)) continue;

        console.log(`Generating: ${headline}`);
        const image = await fetchPexelsImage(`${headline} ${category}`);
        const rewritten = await rewriteArticle(headline, summary, category);
        const date = new Date(item.isoDate || Date.now()).toISOString();

        fs.writeFileSync(enPath, buildMarkdown(rewritten.en, "en", slug, image, date), "utf8");
        fs.writeFileSync(bnPath, buildMarkdown(rewritten.bn, "bn", slug, image, date), "utf8");

        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    } catch (error) {
      console.error(`Failed feed: ${feedUrl}`, error.message);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
