/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const {
  loadArticles,
  parseArticle,
  isSameStory,
  inferCategory,
  rewriteFrontmatter,
  deleteArticlePair,
  ensureDir
} = require("./lib/article-utils");

const REDIRECTS_PATH = path.join(process.cwd(), "data", "canonical-redirects.json");

function scoreArticle(article) {
  const numberedPenalty = /-\d+$/.test(article.slug) ? 0 : 25;
  const imageScore = article.image ? 15 : 0;
  const bodyScore = Math.min(40, Math.round((article.body || "").length / 80));
  const recencyScore = article.timestamp ? Math.min(20, article.timestamp / 1e12) : 0;
  return numberedPenalty + imageScore + bodyScore + recencyScore;
}

function pickWinner(cluster) {
  return [...cluster].sort((a, b) => {
    const scoreDiff = scoreArticle(b) - scoreArticle(a);
    if (scoreDiff !== 0) return scoreDiff;
    return (b.timestamp || 0) - (a.timestamp || 0);
  })[0];
}

function clusterArticles(articles) {
  const parent = articles.map((_, index) => index);

  function find(index) {
    if (parent[index] !== index) parent[index] = find(parent[index]);
    return parent[index];
  }

  function union(a, b) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootB] = rootA;
  }

  for (let i = 0; i < articles.length; i += 1) {
    for (let j = i + 1; j < articles.length; j += 1) {
      if (isSameStory(articles[i], articles[j])) union(i, j);
    }
  }

  const clusters = new Map();
  articles.forEach((article, index) => {
    const root = find(index);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root).push(article);
  });
  return [...clusters.values()];
}

function loadRedirects() {
  if (!fs.existsSync(REDIRECTS_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(REDIRECTS_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveRedirects(map) {
  ensureDir(path.dirname(REDIRECTS_PATH));
  fs.writeFileSync(REDIRECTS_PATH, `${JSON.stringify(map, null, 2)}\n`, "utf8");
}

function run() {
  const articles = loadArticles("en");
  const clusters = clusterArticles(articles);
  const redirects = loadRedirects();
  let removed = 0;
  let recategorized = 0;

  for (const cluster of clusters) {
    const winner = pickWinner(cluster);
    const category = inferCategory({
      title: winner.title,
      excerpt: winner.excerpt,
      tags: winner.tags,
      rawCategory: winner.category
    });

    for (const locale of ["en", "bn"]) {
      try {
        const localized = parseArticle(locale, `${winner.slug}.md`);
        if (localized.category !== category) {
          rewriteFrontmatter(localized, { category, slug: winner.slug });
          recategorized += 1;
        }
      } catch {
        // Pair may already be missing in one locale.
      }
    }

    for (const duplicate of cluster) {
      if (duplicate.slug === winner.slug) continue;
      redirects[duplicate.slug] = winner.slug;
      deleteArticlePair(duplicate.slug);
      removed += 1;
    }
  }

  saveRedirects(redirects);
  console.log(
    `Dedupe complete. Clusters=${clusters.length}. Removed ${removed} duplicate pairs. Recategorized ${recategorized} files. Kept ${clusters.length}.`
  );
}

run();
