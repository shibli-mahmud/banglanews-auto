import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "@/i18n";
import { getMessages } from "@/lib/messages";

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = locales.includes(locale as (typeof locales)[number])
    ? (locale as (typeof locales)[number])
    : defaultLocale;

  return {
    locale: safeLocale,
    messages: getMessages(safeLocale)
  };
});
