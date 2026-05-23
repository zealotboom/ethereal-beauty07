"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, LockKeyhole, UserRound } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { curatedProducts } from "@/lib/products";
import type { StyleProfile } from "@/lib/types";

const loadingLines = [
  "Reading your body proportions...",
  "Detecting your skin undertone...",
  "Building your style profile...",
  "Matching our collection to you..."
];

const fallback: StyleProfile = {
  bodyType: "athletic",
  skinTone: "warm medium",
  skinUndertone: "warm",
  recommendedFits: ["structured shoulders", "tapered", "column silhouette"],
  recommendedColors: ["#C9A84C", "#6E1F2F", "#1E2A37", "#F0EDE6", "#3C2F2F"],
  recommendedColorNames: ["Antique gold", "Burgundy", "Midnight navy", "Ivory", "Espresso"],
  avoidPatterns: ["neon colors", "overly boxy silhouettes"],
  stylePersonality: "Modern minimalist with a precise evening edge.",
  outfitSuggestions: ["Sculpted ivory shirt + obsidian wide trouser + gilded blazer", "Noir silk dress + velvet opera coat + gold cuff"]
};

export default function StyleMeUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [line, setLine] = useState(0);

  async function analyze(file: File) {
    setPreview(URL.createObjectURL(file));
    setProfile(null);
    setLoading(true);
    const interval = window.setInterval(() => setLine((value) => (value + 1) % loadingLines.length), 2000);
    try {
      const form = new FormData();
      form.set("image", file);
      const response = await fetch("/api/ai/style-me", { method: "POST", body: form });
      setProfile(response.ok ? ((await response.json()) as StyleProfile) : fallback);
    } catch {
      setProfile(fallback);
    } finally {
      window.clearInterval(interval);
      setLoading(false);
    }
  }

  if (profile) {
    const picks = curatedProducts(profile.recommendedColorNames, profile.recommendedFits);
    return (
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="border border-[rgba(201,168,76,0.25)] bg-surface p-6">
          <h2 className="font-display text-3xl text-gold">Your Style Profile</h2>
          <div className="mt-6 grid gap-4 text-sm text-primary/85">
            <p><span className="text-muted">Body type:</span> {profile.bodyType}</p>
            <p><span className="text-muted">Skin tone:</span> {profile.skinTone}</p>
            <p><span className="text-muted">Best fits:</span> {profile.recommendedFits.join(", ")}</p>
            <div className="flex items-center gap-2">
              <span className="text-muted">Your colors:</span>
              {profile.recommendedColors.map((color) => <span key={color} className="h-6 w-6 rounded-full border border-white/20" style={{ background: color }} />)}
            </div>
            <p><span className="text-muted">What to avoid:</span> {profile.avoidPatterns.join(", ")}</p>
            <p><span className="text-muted">Style personality:</span> {profile.stylePersonality}</p>
          </div>
          <button className="mt-6 w-full border border-gold px-4 py-3 text-sm text-gold transition hover:bg-gold hover:text-bg">Save Style DNA to Profile</button>
        </section>
        <section>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="font-display text-3xl text-primary">Curated For You</h2>
            <button className="border border-[rgba(201,168,76,0.35)] px-4 py-3 text-sm text-gold">Build Full Outfit</button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {picks.slice(0, 9).map((product, index) => <ProductCard key={product.id} product={product} badge={index % 2 ? "Perfect for your build" : "Tone match"} />)}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <label className="grid min-h-[280px] cursor-pointer place-items-center border border-dashed border-gold bg-surface/80 p-8 text-center transition hover:bg-card">
        <input type="file" accept="image/png,image/jpeg,image/webp" capture="environment" className="sr-only" onChange={(event) => event.target.files?.[0] && analyze(event.target.files[0])} />
        {preview ? (
          <div className="relative h-72 w-full overflow-hidden">
            <Image src={preview} alt="Uploaded preview" fill className="object-cover" />
          </div>
        ) : (
          <div>
            <UserRound className="mx-auto text-gold" size={44} />
            <p className="mt-5 font-display text-3xl text-primary">Upload your photo</p>
            <p className="mt-2 text-sm text-muted">Full body or selfie · JPG, PNG, WEBP · Max 10MB</p>
            <span className="mt-5 inline-flex items-center gap-2 border border-[rgba(201,168,76,0.3)] px-4 py-2 text-sm text-gold md:hidden"><Camera size={16} /> Open Camera</span>
          </div>
        )}
      </label>
      <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted"><LockKeyhole size={15} /> Your photo is analyzed instantly and never stored on our servers</p>
      {loading && (
        <div className="mt-8">
          <motion.div className="h-1 bg-gold" animate={{ scaleX: [0.1, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} />
          <p className="mt-4 text-center text-gold">{loadingLines[line]}</p>
        </div>
      )}
    </div>
  );
}
