import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Locale } from "@/i18n";
import { CategoryKey, canonicalizeCategory } from "@/lib/categories";
import canonicalRedirects from "@/data/canonical-redirects.json";

export type Article = {
  title: string;
  date: string;
  slug: string;
  category: CategoryKey;
  tags: string[];
  image: string;
  imageAlt: string;
  excerpt: string;
  locale: Locale;
  body: string;
};

const contentRoot = path.join(process.cwd(), "content");
const redirectMap = canonicalRedirects as Record<string, string>;

export function getCanonicalSlug(slug: string): string | null {
  const seen = new Set<string>();
  let current = slug;
  while (redirectMap[current] && !seen.has(current)) {
    seen.add(current);
    current = redirectMap[current];
  }
  return current !== slug ? current : null;
}

export function getArticleSlugs(locale: Locale): string[] {
  const dir = path.join(contentRoot, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getArticleBySlug(locale: Locale, slug: string): Article | null {
  const filePath = path.join(contentRoot, locale, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    title: data.title ?? "",
    date: data.date ?? "",
    slug: data.slug ?? slug,
    category: canonicalizeCategory(data.category),
    tags: data.tags ?? [],
    image: data.image ?? "",
    imageAlt: data.imageAlt ?? data.title ?? "",
    excerpt: data.excerpt ?? "",
    locale: (data.locale ?? locale) as Locale,
    body: content.trim()
  };
}

export function getAllArticles(locale: Locale): Article[] {
  return getArticleSlugs(locale)
    .map((slug) => getArticleBySlug(locale, slug))
    .filter((article): article is Article => article !== null)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getArticlesByCategory(locale: Locale, category: CategoryKey): Article[] {
  return getAllArticles(locale).filter((article) => article.category === category);
}

export function getRelatedArticles(locale: Locale, slug: string, limit = 4): Article[] {
  const current = getArticleBySlug(locale, slug);
  if (!current) return [];
  return getAllArticles(locale)
    .filter((article) => article.slug !== slug && article.category === current.category)
    .slice(0, limit);
}
