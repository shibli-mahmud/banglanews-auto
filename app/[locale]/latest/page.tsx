import { notFound } from "next/navigation";
import { Locale, isLocale } from "@/i18n";
import { paginate } from "@/lib/categories";
import { getAllArticles } from "@/lib/content";
import { getMessages } from "@/lib/messages";
import NewsCard from "@/components/NewsCard";
import Pagination from "@/components/Pagination";

export const revalidate = 3600;

export default function LatestPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams?: { page?: string };
}) {
  const rawLocale = params.locale.toLowerCase();
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const t = getMessages(locale);
  const page = Number(searchParams?.page || 1);
  const { items, currentPage, totalPages } = paginate(getAllArticles(locale), page);

  return (
    <main className="mx-auto max-w-news px-4 py-8">
      <h1 className="headline mb-6 text-3xl font-bold">{t.latest.title}</h1>
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
        basePath={`/${locale}/latest`}
        pageLabel={t.latest.page}
      />
    </main>
  );
}
