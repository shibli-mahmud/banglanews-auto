/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { loadArticles, deleteArticlePair, RETENTION_DAYS, retentionCutoff } = require("./lib/article-utils");

function run() {
  const cutoff = retentionCutoff();
  const articles = loadArticles("en");
  const stale = articles.filter((article) => !article.timestamp || article.timestamp < cutoff);
  const kept = articles.length - stale.length;

  for (const article of stale) {
    deleteArticlePair(article.slug);
  }

  const redirectsPath = path.join(process.cwd(), "data", "canonical-redirects.json");
  if (fs.existsSync(redirectsPath) && stale.length > 0) {
    const staleSlugs = new Set(stale.map((article) => article.slug));
    const current = JSON.parse(fs.readFileSync(redirectsPath, "utf8"));
    const next = {};
    for (const [from, to] of Object.entries(current)) {
      if (staleSlugs.has(from) || staleSlugs.has(to)) continue;
      next[from] = to;
    }
    fs.writeFileSync(redirectsPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  }

  console.log(
    `Prune complete. Retention=${RETENTION_DAYS} days. Removed ${stale.length} article pairs. Remaining ${kept}.`
  );
}

run();
