export default function ArticleBody({ body }: { body: string }) {
  return (
    <div className="space-y-4 text-base leading-7 text-slate-800">
      {body.split("\n\n").map((paragraph, i) => (
        <p key={`${paragraph.slice(0, 20)}-${i}`}>{paragraph}</p>
      ))}
    </div>
  );
}
