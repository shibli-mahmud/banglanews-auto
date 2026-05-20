import { Locale } from "@/i18n";

export default function AboutPage({ params }: { params: { locale: Locale } }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-4 text-3xl font-bold">{params.locale === "bn" ? "আমাদের সম্পর্কে" : "About Us"}</h1>
      <p className="text-slate-700">
        {params.locale === "bn"
          ? "BanglaBriefing একটি AI-চালিত দ্বিভাষিক নিউজ পোর্টাল।"
          : "BanglaBriefing is an AI-powered bilingual news portal."}
      </p>
    </main>
  );
}
