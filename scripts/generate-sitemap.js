const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const baseUrl = process.env.SITE_URL || "https://yourdomain.com";
const contentRoot = path.join(process.cwd(), "content");
const output = path.join(process.cwd(), "public", "sitemap.xml");

function readArticles(locale) {
  const dir = path.join(contentRoot, locale);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    return {
      slug: data.slug || file.replace(/\.md$/, ""),
      date: data.date || new Date().toISOString(),
      locale
    };
  });
}

const all = [...readArticles("en"), ...readArticles("bn")];
const urls = all
  .map(
    (a) => `<url><loc>${baseUrl}/${a.locale}/news/${a.slug}</loc><lastmod>${new Date(a.date).toISOString()}</lastmod><changefreq>hourly</changefreq><priority>0.8</priority></url>`
  )
  .join("");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, xml, "utf8");
console.log(`Sitemap generated at ${output}`);
