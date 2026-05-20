import Link from "next/link";
import { Article } from "@/lib/content";

type Props = {
  article: Article;
  readMoreLabel: string;
};

export default function NewsCard({ article, readMoreLabel }: Props) {
  return (
    <article className="overflow-hidden rounded bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow">
      {article.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.image} alt={article.imageAlt} className="h-44 w-full object-cover" />
      ) : null}
      <div className="space-y-2 p-4">
        <p className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600">
          {article.category}
        </p>
        <p className="text-xs text-slate-500">{new Date(article.date).toLocaleDateString()}</p>
        <h2 className="line-clamp-2 text-lg font-semibold">{article.title}</h2>
        <p className="line-clamp-3 text-sm text-slate-600">{article.excerpt}</p>
        <Link href={`/${article.locale}/news/${article.slug}`} className="text-sm font-medium text-blue-600">
          {readMoreLabel}
        </Link>
      </div>
    </article>
  );
}
