import Link from "next/link";
import NewsCard from "@/components/NewsCard";
import AdBanner from "@/components/AdBanner";
import SectionRow from "@/components/SectionRow";
import { Locale, isLocale } from "@/i18n";
import { CATEGORY_KEYS } from "@/lib/categories";
import { getAllArticles } from "@/lib/content";
import { getMessages } from "@/lib/messages";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export default function HomePage({ params }: { params: { locale: string } }) {
  const rawLocale = params.locale.toLowerCase();
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const t = getMessages(locale);
  const articles = getAllArticles(locale);

  const lead = articles[0];
  const secondary = articles.slice(1, 5);
  const heroSlugs = new Set(articles.slice(0, 5).map((article) => article.slug));
  const sidebar = articles.slice(0, 10);
  const moreNews = articles.filter((article) => !heroSlugs.has(article.slug)).slice(0, 6);

  return (
    <main className="mx-auto max-w-news px-4 py-6">
      <section className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {lead ? <NewsCard article={lead} variant="lead" categoryLabel={t.home.categories[lead.category]} /> : null}
        </div>
        <aside className="lg:col-span-4">
          <div className="border-t-4 border-news-red bg-white px-4">
            {secondary.map((article) => (
              <NewsCard
                key={article.slug}
                article={article}
                variant="secondary"
                categoryLabel={t.home.categories[article.category]}
              />
            ))}
          </div>
        </aside>
      </section>

      <div className="my-8">
        <AdBanner adSlot="1000000001" adFormat="horizontal" />
      </div>

      <section className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-8">
          {CATEGORY_KEYS.map((category) => {
            const sectionArticles = articles
              .filter((article) => article.category === category && !heroSlugs.has(article.slug))
              .slice(0, 5);
            return (
              <SectionRow
                key={category}
                title={t.home.categories[category]}
                href={`/${locale}/category/${category}`}
                seeAllLabel={t.home.seeAll}
                articles={sectionArticles}
                categoryLabel={t.home.categories[category]}
              />
            );
          })}
        </div>
        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-4 lg:self-start">
          <AdBanner adSlot="3000000001" adFormat="rectangle" />
          <div className="border border-zinc-200 bg-white p-4">
            <h2 className="headline mb-2 border-b border-zinc-200 pb-2 text-lg font-bold">{t.home.trending}</h2>
            {sidebar.map((article) => (
              <NewsCard key={`side-${article.slug}`} article={article} variant="compact" />
            ))}
          </div>
          <AdBanner adSlot="3000000002" adFormat="rectangle" />
        </aside>
      </section>

      {moreNews.length > 0 ? (
        <section className="mt-10 border-t border-zinc-300 pt-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="headline border-l-4 border-news-red pl-3 text-2xl font-bold">{t.home.moreNews}</h2>
            <Link href={`/${locale}/latest`} className="text-sm font-medium text-news-red hover:underline">
              {t.home.seeAll}
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {moreNews.map((article) => (
              <NewsCard
                key={`more-${article.slug}`}
                article={article}
                variant="grid"
                categoryLabel={t.home.categories[article.category]}
              />
            ))}
          </div>
        </section>
      ) : null}

      {articles.length === 0 ? (
        <div className="border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-600">{t.home.noArticles}</div>
      ) : null}
    </main>
  );
}
