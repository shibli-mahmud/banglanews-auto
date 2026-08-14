import { Locale } from "@/i18n";

export default function AboutPage({ params }: { params: { locale: Locale } }) {
  const isBn = params.locale === "bn";
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="headline mb-4 text-3xl font-bold">{isBn ? "আমাদের সম্পর্কে" : "About Us"}</h1>
      <p className="leading-7 text-zinc-700">
        {isBn
          ? "BanglaBriefing একটি দ্বিভাষিক নিউজ পোর্টাল, যেখানে বাংলাদেশ ও বিশ্বের গুরুত্বপূর্ণ খবর বাংলা ও ইংরেজিতে প্রকাশিত হয়।"
          : "BanglaBriefing is a bilingual news portal covering Bangladesh and world stories in Bangla and English."}
      </p>
    </main>
  );
}
