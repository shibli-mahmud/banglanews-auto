import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  pageLabel: string;
};

export default function Pagination({ currentPage, totalPages, basePath, pageLabel }: Props) {
  if (totalPages <= 1) return null;
  const prev = currentPage > 1 ? currentPage - 1 : null;
  const next = currentPage < totalPages ? currentPage + 1 : null;
  const hrefFor = (page: number) => (page === 1 ? basePath : `${basePath}?page=${page}`);

  return (
    <nav className="mt-8 flex items-center justify-between border-t border-zinc-200 pt-4 text-sm">
      {prev ? (
        <Link href={hrefFor(prev)} className="font-medium text-news-red hover:underline">
          ← {pageLabel} {prev}
        </Link>
      ) : (
        <span />
      )}
      <span className="text-zinc-500">
        {pageLabel} {currentPage} / {totalPages}
      </span>
      {next ? (
        <Link href={hrefFor(next)} className="font-medium text-news-red hover:underline">
          {pageLabel} {next} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
