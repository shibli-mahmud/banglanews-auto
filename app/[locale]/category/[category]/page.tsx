import { notFound } from "next/navigation";
import { Locale, isLocale } from "@/i18n";
import { CATEGORY_KEYS, isCategoryKey, paginate } from "@/lib/categories";
import { getArticlesByCategory } from "@/lib/content";
import { getMessages } from "@/lib/messages";
import NewsCard from "@/components/NewsCard";
import Pagination from "@/components/Pagination";

export const revalidate = 3600;

export function generateStaticParams() {
  return ["en", "bn"].flatMap((locale) => CATEGORY_KEYS.map((category) => ({ locale, category })));
}

export default function CategoryPage({
  params,
  searchParams
}: {
  params: { locale: string; category: string };
  searchParams?: { page?: string };
}) {
  const rawLocale = params.locale.toLowerCase();
  if (!isLocale(rawLocale) || !isCategoryKey(params.category)) notFound();
  const locale: Locale = rawLocale;
  const t = getMessages(locale);
  const page = Number(searchParams?.page || 1);
  const { items, currentPage, totalPages } = paginate(getArticlesByCategory(locale, params.category), page);

  return (
    <main className="mx-auto max-w-news px-4 py-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-news-red">{t.home.categories[params.category]}</p>
      <h1 className="headline mb-6 mt-2 text-3xl font-bold">{t.home.categories[params.category]}</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => (
          <NewsCard
            key={article.slug}
            article={article}
            variant="grid"
            categoryLabel={t.home.categories[article.category]}
          />
        ))}
      </div>
      {items.length === 0 ? <p className="text-zinc-600">{t.home.noArticles}</p> : null}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/${locale}/category/${params.category}`}
        pageLabel={t.latest.page}
      />
    </main>
  );
}
