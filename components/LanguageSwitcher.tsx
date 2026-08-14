"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Locale } from "@/i18n";

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState<Locale>(locale);

  useEffect(() => setValue(locale), [locale]);

  const onChange = (nextLocale: Locale) => {
    setValue(nextLocale);
    localStorage.setItem("preferred-locale", nextLocale);
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      router.push(`/${nextLocale}`);
      return;
    }
    segments[0] = nextLocale;
    router.push(`/${segments.join("/")}`);
  };

  return (
    <div className="inline-flex overflow-hidden rounded border border-zinc-300 text-xs font-semibold uppercase tracking-wide">
      <button
        type="button"
        className={`px-2.5 py-1 ${value === "en" ? "bg-news-red text-white" : "bg-white text-zinc-700"}`}
        onClick={() => onChange("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={`px-2.5 py-1 ${value === "bn" ? "bg-news-red text-white" : "bg-white text-zinc-700"}`}
        onClick={() => onChange("bn")}
      >
        বাংলা
      </button>
    </div>
  );
}
