import AdBanner from "./AdBanner";

export default function ArticleBody({ body }: { body: string }) {
  const paragraphs = body.split("\n\n").filter(Boolean);

  return (
    <div className="space-y-4 text-base leading-7 text-slate-800">
      {paragraphs.map((paragraph, i) => (
        <div key={`${paragraph.slice(0, 20)}-${i}`} className="space-y-4">
          <p>{paragraph}</p>
          {i === 2 ? <AdBanner adSlot="4000000001" adFormat="rectangle" className="my-5" /> : null}
        </div>
      ))}
    </div>
  );
}
