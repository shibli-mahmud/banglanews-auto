import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";
import { isLocale, type Locale } from "@/i18n";
import { getMessages } from "@/lib/messages";

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

  return <NextIntlClientProvider locale={locale} messages={getMessages(locale)}>{children}</NextIntlClientProvider>;
}
