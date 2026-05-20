import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";
import { locales, type Locale } from "@/i18n";
import { getMessages } from "@/lib/messages";

export default function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { locale: Locale };
}) {
  const { locale } = params;
  if (!locales.includes(locale)) notFound();

  return <NextIntlClientProvider locale={locale} messages={getMessages(locale)}>{children}</NextIntlClientProvider>;
}
