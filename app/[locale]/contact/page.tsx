import { Locale } from "@/i18n";

export default function ContactPage({ params }: { params: { locale: Locale } }) {
  const isBn = params.locale === "bn";
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="headline mb-4 text-3xl font-bold">{isBn ? "যোগাযোগ" : "Contact"}</h1>
      <p className="text-zinc-700">
        {isBn ? "ইমেইল: mrmahmud10121@gmail.com" : "Email: mrmahmud10121@gmail.com"}
      </p>
    </main>
  );
}
