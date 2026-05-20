import { Locale } from "@/i18n";
import en from "@/messages/en.json";
import bn from "@/messages/bn.json";

export type Messages = typeof en;

const map = { en, bn };

export function getMessages(locale: Locale): Messages {
  return map[locale] ?? en;
}
