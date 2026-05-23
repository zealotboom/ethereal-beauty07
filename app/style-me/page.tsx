import StyleMeUpload from "@/components/StyleMeUpload";

export default function StyleMePage() {
  return (
    <div className="luxury-shell">
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-gold">AI Atelier</p>
        <h1 className="mt-2 font-display text-5xl text-primary">Style Me</h1>
      </div>
      <StyleMeUpload />
    </div>
  );
}
