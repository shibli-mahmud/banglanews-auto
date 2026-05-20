import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Locale } from "@/i18n";

export type Article = {
  title: string;
  date: string;
  slug: string;
  category: string;
  tags: string[];
  image: string;
  imageAlt: string;
  excerpt: string;
  locale: Locale;
  body: string;
};

const contentRoot = path.join(process.cwd(), "content");

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
    category: data.category ?? "General",
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
    .filter((a): a is Article => a !== null)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
