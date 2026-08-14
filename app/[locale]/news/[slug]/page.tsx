import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import AdBanner from "@/components/AdBanner";
import ArticleBody from "@/components/ArticleBody";
import NewsCard from "@/components/NewsCard";
import { Locale, isLocale, locales } from "@/i18n";
import { formatArticleDateTime } from "@/lib/categories";
import { getArticleBySlug, getArticleSlugs, getCanonicalSlug, getRelatedArticles } from "@/lib/content";
import { getMessages } from "@/lib/messages";

type Props = {
  params: { locale: string; slug: string };
};

export const revalidate = 3600;

export function generateStaticParams() {
  return locales.flatMap((locale) => getArticleSlugs(locale).map((slug) => ({ locale, slug })));
}

export function generateMetadata({ params }: Props): Metadata {
  const rawLocale = params.locale.toLowerCase();
  if (!isLocale(rawLocale)) return {};
  const article = getArticleBySlug(rawLocale, params.slug);
  if (!article) return {};
  const siteUrl = process.env.SITE_URL || "https://banglanews-auto.vercel.app";
  const canonical = `${siteUrl}/${rawLocale}/news/${params.slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.tags,
    alternates: { canonical },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.image ? [article.image] : [],
      type: "article",
      locale: article.locale === "bn" ? "bn_BD" : "en_US",
      url: canonical
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.image ? [article.image] : []
    }
  };
}

export default function ArticlePage({ params }: Props) {
  const rawLocale = params.locale.toLowerCase();
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const article = getArticleBySlug(locale, params.slug);
  if (!article) {
    const canonical = getCanonicalSlug(params.slug);
    if (canonical && getArticleBySlug(locale, canonical)) {
      redirect(`/${locale}/news/${canonical}`);
    }
    notFound();
  }

  const t = getMessages(locale);
  const siteUrl = process.env.SITE_URL || "https://banglanews-auto.vercel.app";
  const articleUrl = `${siteUrl}/${locale}/news/${params.slug}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`${article.title} - ${articleUrl}`)}`;
  const related = getRelatedArticles(locale, article.slug);

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
    <main className="mx-auto max-w-news px-4 py-8">
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-news-red">
          <Link href={`/${locale}/category/${article.category}`}>{t.home.categories[article.category]}</Link>
        </p>
        <h1 className="headline mt-3 text-3xl font-bold leading-tight md:text-4xl">{article.title}</h1>
        <p className="mt-3 text-sm text-zinc-500">
          {t.article.published}: {formatArticleDateTime(article.date, locale)}
        </p>
        {article.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.image} alt={article.imageAlt} className="mt-6 h-80 w-full object-cover" />
        ) : null}
        <p className="mt-5 text-lg leading-8 text-zinc-700">{article.excerpt}</p>
        <div className="my-6">
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            {t.article.shareWhatsapp}
          </a>
        </div>
        <AdBanner adSlot="1000000001" adFormat="horizontal" />
        <div className="mt-6">
          <ArticleBody body={article.body} />
        </div>
      </article>
      {related.length > 0 ? (
        <section className="mx-auto mt-12 max-w-3xl border-t border-zinc-200 pt-8">
          <h2 className="headline mb-4 text-2xl font-bold">{t.article.related}</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {related.map((item) => (
              <NewsCard
                key={item.slug}
                article={item}
                variant="grid"
                categoryLabel={t.home.categories[item.category]}
              />
            ))}
          </div>
        </section>
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
