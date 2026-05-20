import { Locale } from "@/i18n";

export default function ContactPage({ params }: { params: { locale: Locale } }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-4 text-3xl font-bold">{params.locale === "bn" ? "যোগাযোগ" : "Contact"}</h1>
      <p className="text-slate-700">
        {params.locale === "bn"
          ? "ইমেইল: mrmahmud10121@gmail.com"
          : "Email: mrmahmud10121@gmail.com"}
      </p>
    </main>
  );
}
