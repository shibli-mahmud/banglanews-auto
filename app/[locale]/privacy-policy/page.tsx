import { Locale } from "@/i18n";

export default function PrivacyPolicyPage({ params }: { params: { locale: Locale } }) {
  const isBn = params.locale === "bn";
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <h1 className="text-3xl font-bold">{isBn ? "প্রাইভেসি পলিসি" : "Privacy Policy"}</h1>
      <p className="text-slate-700">
        {isBn
          ? "BanglaBriefing আপনার ব্যক্তিগত তথ্য সুরক্ষার জন্য প্রতিশ্রুতিবদ্ধ। আমরা শুধুমাত্র প্রয়োজনীয় ব্যবহার তথ্য সংগ্রহ করি।"
          : "BanglaBriefing is committed to protecting your personal information. We only collect essential usage data."}
      </p>
      <p className="text-slate-700">
        {isBn
          ? "বিস্তারিত তথ্যের জন্য mrmahmud10121@gmail.com এ যোগাযোগ করুন।"
          : "For details, contact us at mrmahmud10121@gmail.com."}
      </p>
    </main>
  );
}
