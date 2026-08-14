import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";
import { isLocale, locales, type Locale } from "@/i18n";
import { getMessages } from "@/lib/messages";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const rawLocale = params.locale.toLowerCase();
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const messages = getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className={`${locale === "bn" ? "bn font-bangla" : ""} min-h-screen`}>
        <Header locale={locale} labels={messages.header} categories={messages.home.categories} />
        {children}
        <Footer locale={locale} links={messages.footer} categories={messages.home.categories} />
      </div>
    </NextIntlClientProvider>
  );
}
