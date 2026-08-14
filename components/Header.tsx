import Link from "next/link";
import { Locale } from "@/i18n";
import { CATEGORY_KEYS, formatMastheadDate } from "@/lib/categories";
import LanguageSwitcher from "./LanguageSwitcher";

type Props = {
  locale: Locale;
  labels: {
    home: string;
    about: string;
    contact: string;
    latest: string;
    tagline: string;
  };
  categories: Record<string, string>;
};

export default function Header({ locale, labels, categories }: Props) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="h-1 w-full bg-news-red" />
      <div className="mx-auto flex max-w-news items-center justify-between px-4 py-2 text-xs text-zinc-500">
        <p>{formatMastheadDate(locale)}</p>
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/about`} className="hover:text-news-red">
            {labels.about}
          </Link>
          <Link href={`/${locale}/contact`} className="hover:text-news-red">
            {labels.contact}
          </Link>
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
      <div className="mx-auto max-w-news px-4 pb-4 pt-1 text-center">
        <Link href={`/${locale}`} className="headline block text-3xl font-black tracking-tight text-zinc-900 md:text-5xl">
          BanglaBriefing
        </Link>
        <p className="mt-1 text-sm text-zinc-500">{labels.tagline}</p>
      </div>
      <nav className="border-y border-zinc-200 bg-zinc-900">
        <div className="mx-auto flex max-w-news gap-1 overflow-x-auto px-2 text-sm font-medium text-white">
          <Link href={`/${locale}`} className="whitespace-nowrap px-3 py-2.5 hover:bg-news-red">
            {labels.home}
          </Link>
          <Link href={`/${locale}/latest`} className="whitespace-nowrap px-3 py-2.5 hover:bg-news-red">
            {labels.latest}
          </Link>
          {CATEGORY_KEYS.map((category) => (
            <Link
              key={category}
              href={`/${locale}/category/${category}`}
              className="whitespace-nowrap px-3 py-2.5 hover:bg-news-red"
            >
              {categories[category]}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
