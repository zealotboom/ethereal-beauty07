import FindThisUpload from "@/components/FindThisUpload";

export default function FindThisPage() {
  return (
    <div className="luxury-shell">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.28em] text-gold">Visual Search</p>
        <h1 className="mt-2 font-display text-5xl text-primary">Find This</h1>
      </div>
      <FindThisUpload />
    </div>
  );
}
