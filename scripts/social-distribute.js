/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const contentRoot = path.join(process.cwd(), "content");
const baseUrl = process.env.SITE_URL || "https://yourdomain.com";
const postLimit = Number(process.env.SOCIAL_POST_LIMIT || 6);
const postWindowHours = Number(process.env.SOCIAL_POST_WINDOW_HOURS || 2);

function listMarkdownFiles(locale) {
  const dir = path.join(contentRoot, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => path.join(dir, name));
}

function parseArticle(filePath, locale) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);
  const slug = data.slug || path.basename(filePath, ".md");
  const articleDate = new Date(data.date || fs.statSync(filePath).mtime.toISOString());
  return {
    locale,
    slug,
    title: data.title || slug,
    excerpt: data.excerpt || "",
    category: data.category || "General",
    tags: Array.isArray(data.tags) ? data.tags : [],
    date: articleDate,
    url: `${baseUrl}/${locale}/news/${slug}`
  };
}

function getRecentArticles() {
  const threshold = Date.now() - postWindowHours * 60 * 60 * 1000;
  const all = ["en", "bn"]
    .flatMap((locale) => listMarkdownFiles(locale).map((file) => parseArticle(file, locale)))
    .filter((article) => article.date.getTime() >= threshold)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  return all.slice(0, postLimit);
}

async function postToTelegram(article) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return false;
  const endpoint = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const message = `📰 ${article.title}\n\n${article.excerpt}\n\n${article.url}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      disable_web_page_preview: false
    })
  });
  if (!res.ok) throw new Error(`Telegram status ${res.status}`);
  return true;
}

async function postToWebhook(article) {
  if (!process.env.SOCIAL_WEBHOOK_URL) return false;
  const res = await fetch(process.env.SOCIAL_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "banglabriefing-social-bot",
      article
    })
  });
  if (!res.ok) throw new Error(`Webhook status ${res.status}`);
  return true;
}

async function run() {
  const recentArticles = getRecentArticles();
  if (recentArticles.length === 0) {
    console.log("No fresh articles in social posting window.");
    return;
  }

  console.log(`Preparing social distribution for ${recentArticles.length} articles.`);
  for (const article of recentArticles) {
    try {
      const telegramPosted = await postToTelegram(article);
      const webhookPosted = await postToWebhook(article);
      if (!telegramPosted && !webhookPosted) {
        console.log(`No social provider configured. Skipped: ${article.slug}`);
      } else {
        console.log(`Posted social updates for: ${article.slug}`);
      }
    } catch (error) {
      console.error(`Failed social post for ${article.slug}: ${error.message}`);
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
