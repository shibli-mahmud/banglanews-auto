const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const baseUrl = process.env.SITE_URL || "https://banglanews-auto.vercel.app";
const contentRoot = path.join(process.cwd(), "content");
const output = path.join(process.cwd(), "public", "sitemap.xml");
const locales = ["en", "bn"];
const categories = ["bangladesh", "international", "politics", "sports", "tech"];

function readArticles(locale) {
  const dir = path.join(contentRoot, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data } = matter(raw);
      return {
        slug: data.slug || file.replace(/\.md$/, ""),
        date: data.date || new Date().toISOString(),
        locale
      };
    });
}

function urlTag(loc, lastmod, changefreq, priority) {
  return `<url><loc>${loc}</loc><lastmod>${new Date(lastmod).toISOString()}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

const now = new Date().toISOString();
const staticUrls = locales.flatMap((locale) => [
  urlTag(`${baseUrl}/${locale}`, now, "hourly", "1.0"),
  urlTag(`${baseUrl}/${locale}/latest`, now, "hourly", "0.9"),
  ...categories.map((category) => urlTag(`${baseUrl}/${locale}/category/${category}`, now, "hourly", "0.8"))
]);

const articleUrls = [...readArticles("en"), ...readArticles("bn")].map((article) =>
  urlTag(`${baseUrl}/${article.locale}/news/${article.slug}`, article.date, "daily", "0.7")
);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...staticUrls, ...articleUrls].join("")}</urlset>`;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, xml, "utf8");
console.log(`Sitemap generated at ${output}`);
