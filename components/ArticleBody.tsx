import AdBanner from "./AdBanner";

export default function ArticleBody({ body }: { body: string }) {
  const paragraphs = body.split("\n\n").filter(Boolean);

  return (
    <div className="space-y-5 text-[1.05rem] leading-8 text-zinc-800">
      {paragraphs.map((paragraph, i) => (
        <div key={`${paragraph.slice(0, 20)}-${i}`} className="space-y-5">
          <p>{paragraph}</p>
          {i === 2 ? <AdBanner adSlot="4000000001" adFormat="rectangle" /> : null}
        </div>
      ))}
    </div>
  );
}
