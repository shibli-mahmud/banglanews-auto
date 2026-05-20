import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import AdBanner from "@/components/AdBanner";
import { Locale } from "@/i18n";
import { getAllArticles } from "@/lib/content";
import { getMessages } from "@/lib/messages";

export default function HomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const t = getMessages(locale);
  const articles = getAllArticles(locale);

  return (
    <main>
      <Header locale={locale} labels={t.header} />
      <section className="mx-auto max-w-6xl px-4 py-4">
        <AdBanner adSlot="1000000001" adFormat="horizontal" />
      </section>
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h1 className="text-2xl font-bold">{t.home.latestNews}</h1>
          <div className="grid gap-4 md:grid-cols-2">
            {articles.map((article, idx) => (
              <div key={article.slug} className="space-y-4">
                <NewsCard article={article} />
                {(idx + 1) % 4 === 0 ? <AdBanner adSlot={`200000000${idx}`} adFormat="horizontal" /> : null}
              </div>
            ))}
          </div>
        </div>
        <aside className="space-y-4">
          <AdBanner adSlot="3000000001" adFormat="rectangle" />
          <div className="rounded bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">{t.home.trending}</h2>
            <ul className="space-y-2 text-sm">
              {articles.slice(0, 7).map((a) => (
                <li key={`trend-${a.slug}`}>{a.title}</li>
              ))}
            </ul>
          </div>
          <AdBanner adSlot="3000000002" adFormat="rectangle" />
        </aside>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <AdBanner adSlot="5000000001" adFormat="horizontal" />
      </section>
      <Footer />
    </main>
  );
}
