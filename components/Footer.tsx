import Link from "next/link";
import { Locale } from "@/i18n";

type Props = {
  locale: Locale;
  links: {
    about: string;
    contact: string;
    privacy: string;
    terms: string;
  };
};

export default function Footer({ locale, links }: Props) {
  return (
    <footer className="mt-10 border-t bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>BanglaBriefing</p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/about`}>{links.about}</Link>
          <Link href={`/${locale}/contact`}>{links.contact}</Link>
          <Link href={`/${locale}/privacy-policy`}>{links.privacy}</Link>
          <Link href={`/${locale}/terms`}>{links.terms}</Link>
        </div>
      </div>
    </footer>
  );
}
