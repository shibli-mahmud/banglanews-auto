import Script from "next/script";

type Props = {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal";
  className?: string;
};

const formatClasses: Record<NonNullable<Props["adFormat"]>, string> = {
  auto: "min-h-[90px]",
  horizontal: "min-h-[90px]",
  rectangle: "min-h-[280px]"
};

export default function AdBanner({ adSlot, adFormat = "auto", className }: Props) {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const showPlaceholder = process.env.NODE_ENV !== "production" || !adClient;
  const baseClasses = `w-full rounded ${formatClasses[adFormat]} ${className ?? ""}`;

  if (showPlaceholder) {
    return (
      <div
        className={`${baseClasses} border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500`}
      >
        Ad Placeholder ({adFormat}) - slot {adSlot}
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <Script
        id="adsense-loader"
        async
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
      />
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
      <Script id={`adsense-init-${adSlot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}
