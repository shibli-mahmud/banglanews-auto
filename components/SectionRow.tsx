import Link from "next/link";
import { Article } from "@/lib/content";
import NewsCard from "./NewsCard";

type Props = {
  title: string;
  href: string;
  seeAllLabel: string;
  articles: Article[];
  categoryLabel: string;
};

export default function SectionRow({ title, href, seeAllLabel, articles, categoryLabel }: Props) {
  if (articles.length === 0) return null;
  const [featured, ...rest] = articles;

  return (
    <section className="border-t border-zinc-300 pt-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="headline border-l-4 border-news-red pl-3 text-2xl font-bold">{title}</h2>
        <Link href={href} className="text-sm font-medium text-news-red hover:underline">
          {seeAllLabel}
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <NewsCard article={featured} variant="section" categoryLabel={categoryLabel} />
        </div>
        <div className="md:col-span-3">
          {rest.slice(0, 4).map((article) => (
            <NewsCard key={article.slug} article={article} variant="secondary" categoryLabel={categoryLabel} />
          ))}
        </div>
      </div>
    </section>
  );
}
