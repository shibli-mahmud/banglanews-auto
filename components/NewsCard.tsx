import Link from "next/link";
import { Article } from "@/lib/content";
import { formatArticleDate } from "@/lib/categories";

type Variant = "lead" | "secondary" | "grid" | "compact" | "section";

type Props = {
  article: Article;
  variant?: Variant;
  categoryLabel?: string;
};

export default function NewsCard({ article, variant = "grid", categoryLabel }: Props) {
  const href = `/${article.locale}/news/${article.slug}`;
  const date = formatArticleDate(article.date, article.locale);
  const category = categoryLabel || article.category;

  if (variant === "lead") {
    return (
      <Link href={href} className="group block">
        {article.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.image} alt={article.imageAlt} className="h-64 w-full object-cover md:h-[420px]" />
        ) : (
          <div className="h-64 bg-zinc-200 md:h-[420px]" />
        )}
        <div className="pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-news-red">{category}</p>
          <h2 className="headline mt-2 text-3xl font-bold leading-tight group-hover:text-news-red md:text-4xl">
            {article.title}
          </h2>
          <p className="mt-3 line-clamp-3 text-base leading-7 text-zinc-600">{article.excerpt}</p>
          <p className="mt-2 text-xs text-zinc-400">{date}</p>
        </div>
      </Link>
    );
  }

  if (variant === "secondary") {
    return (
      <Link href={href} className="group grid grid-cols-[96px_1fr] gap-3 border-b border-zinc-200 py-3 last:border-b-0">
        {article.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.image} alt={article.imageAlt} className="h-20 w-24 object-cover" />
        ) : (
          <div className="h-20 w-24 bg-zinc-200" />
        )}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-news-red">{category}</p>
          <h3 className="headline mt-1 line-clamp-3 text-base font-bold leading-snug group-hover:text-news-red">
            {article.title}
          </h3>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={href} className="group block border-b border-zinc-200 py-2.5 last:border-b-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-news-red">{article.title}</h3>
        <p className="mt-1 text-[11px] text-zinc-400">{date}</p>
      </Link>
    );
  }

  if (variant === "section") {
    return (
      <Link href={href} className="group block">
        {article.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.image} alt={article.imageAlt} className="h-40 w-full object-cover" />
        ) : (
          <div className="h-40 bg-zinc-200" />
        )}
        <h3 className="headline mt-3 line-clamp-3 text-lg font-bold leading-snug group-hover:text-news-red">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{article.excerpt}</p>
      </Link>
    );
  }

  return (
    <Link href={href} className="group block overflow-hidden rounded-sm bg-white">
      {article.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.image} alt={article.imageAlt} className="h-44 w-full object-cover" />
      ) : null}
      <div className="space-y-2 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-news-red">{category}</p>
        <h2 className="headline line-clamp-2 text-lg font-bold group-hover:text-news-red">{article.title}</h2>
        <p className="line-clamp-2 text-sm text-zinc-600">{article.excerpt}</p>
        <p className="text-xs text-zinc-400">{date}</p>
      </div>
    </Link>
  );
}
