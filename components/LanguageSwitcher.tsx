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
    <select
      className="rounded border px-2 py-1"
      value={value}
      onChange={(e) => onChange(e.target.value as Locale)}
      aria-label="Language switcher"
    >
      <option value="en">English</option>
      <option value="bn">বাংলা</option>
    </select>
  );
}
