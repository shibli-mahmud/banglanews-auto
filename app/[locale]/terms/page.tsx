import { Locale } from "@/i18n";

export default function TermsPage({ params }: { params: { locale: Locale } }) {
  const isBn = params.locale === "bn";
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <h1 className="headline text-3xl font-bold">{isBn ? "টার্মস অ্যান্ড কন্ডিশনস" : "Terms and Conditions"}</h1>
      <p className="leading-7 text-zinc-700">
        {isBn
          ? "BanglaBriefing এর কন্টেন্ট তথ্যভিত্তিক উদ্দেশ্যে প্রকাশিত হয়। অনুমতি ছাড়া পুনঃপ্রকাশ নিষিদ্ধ।"
          : "Content on BanglaBriefing is published for informational purposes. Republishing without permission is prohibited."}
      </p>
      <p className="leading-7 text-zinc-700">
        {isBn
          ? "সাইট ব্যবহার করে আপনি আমাদের নীতিমালা মেনে নিতে সম্মত হচ্ছেন।"
          : "By using this site, you agree to follow our platform policies."}
      </p>
    </main>
  );
}
