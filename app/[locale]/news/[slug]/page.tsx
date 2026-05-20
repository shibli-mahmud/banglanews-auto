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
  const siteUrl = process.env.SITE_URL || "https://yourdomain.com";
  const canonical = `${siteUrl}/${params.locale}/news/${params.slug}`;
  return {
    title: `${article.title} | BanglaBriefing`,
    description: article.excerpt,
    keywords: article.tags,
    alternates: {
      canonical
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.image],
      type: "article",
      locale: article.locale === "bn" ? "bn_BD" : "en_US",
      url: canonical
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.image]
    }
  };
}

export default function ArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.locale, params.slug);
  if (!article) notFound();
  const t = getMessages(params.locale);
  const siteUrl = process.env.SITE_URL || "https://yourdomain.com";
  const articleUrl = `${siteUrl}/${params.locale}/news/${params.slug}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`${article.title} - ${articleUrl}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    datePublished: article.date,
    image: article.image,
    author: { "@type": "Organization", name: "BanglaBriefing" },
    mainEntityOfPage: articleUrl,
    description: article.excerpt
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
          <div className="mb-5">
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              {params.locale === "bn" ? "হোয়াটসঅ্যাপে শেয়ার করুন" : "Share on WhatsApp"}
            </a>
          </div>
          <ArticleBody body={article.body} />
        </article>
      </section>
      <Footer locale={params.locale} links={t.footer} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
