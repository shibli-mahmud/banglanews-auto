import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import AdBanner from "@/components/AdBanner";
import { Locale } from "@/i18n";
import { getAllArticles } from "@/lib/content";
import { getMessages } from "@/lib/messages";
import Link from "next/link";

const CATEGORY_KEYS = ["all", "bangladesh", "international", "politics", "sports", "tech"] as const;
type CategoryKey = (typeof CATEGORY_KEYS)[number];

export default function HomePage({
  params,
  searchParams
}: {
  params: { locale: Locale };
  searchParams?: { category?: string };
}) {
  const { locale } = params;
  const t = getMessages(locale);
  const articles = getAllArticles(locale);
  const selectedCategory = (searchParams?.category ?? "all").toLowerCase();
  const safeCategory: CategoryKey = CATEGORY_KEYS.includes(selectedCategory as CategoryKey)
    ? (selectedCategory as CategoryKey)
    : "all";
  const featured = articles.slice(0, 3);
  const filteredArticles =
    safeCategory === "all"
      ? articles
      : articles.filter((article) => article.category.toLowerCase() === safeCategory);

  return (
    <main>
      <Header locale={locale} labels={t.header} />
      <section className="mx-auto max-w-6xl px-4 py-4">
        <AdBanner adSlot="1000000001" adFormat="horizontal" />
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <h1 className="mb-4 text-2xl font-bold">{t.home.featuredTitle}</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {featured.map((article, index) => (
            <Link
              key={`featured-${article.slug}`}
              href={`/${locale}/news/${article.slug}`}
              className={`group overflow-hidden rounded bg-white shadow-sm ${index === 0 ? "md:row-span-2" : ""}`}
            >
              {article.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.image}
                  alt={article.imageAlt}
                  className={`w-full object-cover transition group-hover:scale-[1.02] ${index === 0 ? "h-72 md:h-full" : "h-40"}`}
                />
              ) : null}
              <div className="space-y-2 p-4">
                <p className="text-xs text-slate-500">{article.category}</p>
                <h2 className="line-clamp-2 text-lg font-semibold">{article.title}</h2>
                <p className="line-clamp-2 text-sm text-slate-600">{article.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <AdBanner adSlot="1000000002" adFormat="horizontal" />
      </section>
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-4 lg:grid-cols-10">
        <div className="space-y-4 lg:col-span-7">
          <h1 className="text-2xl font-bold">{t.home.latestNews}</h1>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_KEYS.map((category) => (
              <Link
                key={category}
                href={`/${locale}?category=${category}`}
                className={`rounded-full px-3 py-1 text-sm ${
                  safeCategory === category ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {t.home.categories[category]}
              </Link>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredArticles.map((article, idx) => (
              <div key={article.slug} className="space-y-4">
                <NewsCard article={article} readMoreLabel={t.home.readMore} />
                {(idx + 1) % 4 === 0 ? <AdBanner adSlot={`200000000${idx}`} adFormat="horizontal" /> : null}
              </div>
            ))}
          </div>
          {filteredArticles.length === 0 ? (
            <div className="rounded border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">
              {t.home.noArticles}
            </div>
          ) : null}
        </div>
        <aside className="space-y-4 lg:col-span-3 lg:sticky lg:top-4 lg:self-start">
          <div className="hidden lg:block">
            <AdBanner adSlot="3000000001" adFormat="rectangle" />
          </div>
          <div className="rounded bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">{t.home.trending}</h2>
            <ul className="space-y-2 text-sm">
              {articles.slice(0, 7).map((a) => (
                <li key={`trend-${a.slug}`}>
                  <Link href={`/${locale}/news/${a.slug}`} className="hover:text-blue-600">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden lg:block">
            <AdBanner adSlot="3000000002" adFormat="rectangle" />
          </div>
        </aside>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <AdBanner adSlot="5000000001" adFormat="horizontal" />
      </section>
      <Footer locale={locale} links={t.footer} />
    </main>
  );
}
