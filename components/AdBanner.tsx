import Script from "next/script";

type Props = {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal";
  className?: string;
};

export default function AdBanner({ adSlot, adFormat = "auto", className }: Props) {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const showPlaceholder = process.env.NODE_ENV !== "production" || !adClient;

  if (showPlaceholder) {
    return (
      <div className={`w-full rounded border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 ${className ?? ""}`}>
        Ad Placeholder ({adFormat}) - slot {adSlot}
      </div>
    );
  }

  return (
    <div className={className}>
      <Script
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
