import { Locale } from "@/i18n";

export const CATEGORY_KEYS = ["bangladesh", "international", "politics", "sports", "tech"] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const PAGE_SIZE = 20;

export function isCategoryKey(value: string): value is CategoryKey {
  return CATEGORY_KEYS.includes(value as CategoryKey);
}

export function canonicalizeCategory(value: string | undefined): CategoryKey {
  const key = String(value || "").toLowerCase().trim();
  if (isCategoryKey(key)) return key;
  return "international";
}

export function formatArticleDate(date: string, locale: Locale) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(parsed);
}

export function formatArticleDateTime(date: string, locale: Locale) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed);
}

export function formatMastheadDate(locale: Locale) {
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(safePage, totalPages);
  const start = (currentPage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalPages,
    totalItems: items.length
  };
}
