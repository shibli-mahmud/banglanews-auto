import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import ArticleBody from "@/components/ArticleBody";
import { Locale } from "@/i18n";
import { getArticleBySlug } from "@/lib/content";
import { getMessages } from "@/lib/messages";

type Props = {
  params: { locale: Locale; slug: string };
};

export function generateMetadata({ params }: Props): Metadata {
  const article = getArticleBySlug(params.locale, params.slug);
  if (!article) return {};
  return {
    title: `${article.title} | BanglaBriefing`,
    description: article.excerpt,
    keywords: article.tags,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.image],
      type: "article",
      locale: article.locale === "bn" ? "bn_BD" : "en_US"
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      images: [article.image]
    }
  };
}

export default function ArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.locale, params.slug);
  if (!article) notFound();
  const t = getMessages(params.locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    datePublished: article.date,
    image: article.image,
    author: { "@type": "Organization", name: "BanglaBriefing" }
  };

  return (
    <main>
      <Header locale={params.locale} labels={t.header} />
      <section className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <AdBanner adSlot="1000000001" adFormat="horizontal" />
        <article className="rounded bg-white p-6 shadow-sm">
          <h1 className="mb-3 text-3xl font-bold">{article.title}</h1>
          <p className="mb-4 text-sm text-slate-500">{new Date(article.date).toLocaleString()}</p>
          {article.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.image} alt={article.imageAlt} className="mb-5 h-80 w-full rounded object-cover" />
          ) : null}
          <ArticleBody body={article.body} />
          <div className="my-6">
            <AdBanner adSlot="4000000001" adFormat="rectangle" />
          </div>
        </article>
      </section>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
