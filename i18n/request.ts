import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale } from "@/i18n";
import { getMessages } from "@/lib/messages";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const safeLocale = locale && isLocale(locale) ? locale : defaultLocale;

  return {
    locale: safeLocale,
    messages: getMessages(safeLocale)
  };
});
