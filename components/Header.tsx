import Link from "next/link";
import { Locale } from "@/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

type Props = {
  locale: Locale;
  labels: {
    home: string;
    about: string;
    contact: string;
  };
};

export default function Header({ locale, labels }: Props) {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href={`/${locale}`} className="text-xl font-bold">
          BanglaBriefing
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href={`/${locale}`}>{labels.home}</Link>
          <Link href={`/${locale}/about`}>{labels.about}</Link>
          <Link href={`/${locale}/contact`}>{labels.contact}</Link>
          <LanguageSwitcher locale={locale} />
        </nav>
      </div>
    </header>
  );
}
