import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under editorial review",
  description: "BanglaBriefing has paused publishing while its editorial process is rebuilt."
};

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-news-red">
          BanglaBriefing
        </p>

        <h1 className="headline mt-6 text-3xl font-bold leading-tight text-news-ink md:text-4xl">
          We have paused publishing
        </h1>
        <p className="mt-5 text-lg leading-8 text-zinc-600">
          The site is offline while we rebuild how our articles are sourced,
          written and checked. We would rather publish nothing than publish
          something we cannot stand behind.
        </p>

        <div className="mx-auto my-10 h-px w-16 bg-zinc-300" />

        <h2 className="headline font-bangla text-2xl font-bold leading-snug text-news-ink md:text-3xl">
          আমরা প্রকাশনা সাময়িকভাবে বন্ধ রেখেছি
        </h2>
        <p className="font-bangla mt-5 text-lg leading-9 text-zinc-600">
          আমাদের সংবাদ তৈরি ও যাচাইয়ের প্রক্রিয়া নতুন করে সাজানো হচ্ছে। এই সময়ে সাইটটি বন্ধ থাকবে। ভুল তথ্য প্রকাশ করার চেয়ে কিছু প্রকাশ না করাই আমরা শ্রেয় মনে করি।
        </p>

        <p className="mt-12 text-sm text-zinc-500">
          Thank you for your patience. · ধন্যবাদ।
        </p>
      </div>
    </main>
  );
}
