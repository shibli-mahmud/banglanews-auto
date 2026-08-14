import Link from "next/link";
import { Locale } from "@/i18n";
import { CATEGORY_KEYS } from "@/lib/categories";

type Props = {
  locale: Locale;
  links: {
    about: string;
    contact: string;
    privacy: string;
    terms: string;
    latest: string;
    sections: string;
    site: string;
    copyright: string;
  };
  categories: Record<string, string>;
};

export default function Footer({ locale, links, categories }: Props) {
  return (
    <footer className="mt-12 border-t bg-zinc-900 text-zinc-300">
      <div className="mx-auto grid max-w-news gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="headline text-2xl font-bold text-white">BanglaBriefing</p>
          <p className="mt-2 text-sm text-zinc-400">© {new Date().getFullYear()} BanglaBriefing. {links.copyright}</p>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">{links.sections}</p>
          <div className="flex flex-col gap-2 text-sm">
            {CATEGORY_KEYS.map((category) => (
              <Link key={category} href={`/${locale}/category/${category}`} className="hover:text-white">
                {categories[category]}
              </Link>
            ))}
            <Link href={`/${locale}/latest`} className="hover:text-white">
              {links.latest}
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">{links.site}</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href={`/${locale}/about`} className="hover:text-white">
              {links.about}
            </Link>
            <Link href={`/${locale}/contact`} className="hover:text-white">
              {links.contact}
            </Link>
            <Link href={`/${locale}/privacy-policy`} className="hover:text-white">
              {links.privacy}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-white">
              {links.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
