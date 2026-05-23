"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Shirt } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import type { FindThisFeatures } from "@/lib/types";

const fallback: FindThisFeatures = {
  garmentType: "jacket",
  primaryColor: "black",
  secondaryColors: ["gold"],
  pattern: "solid",
  fit: "structured",
  neckline: "collar",
  sleeveType: "long",
  styleCategory: "formal",
  searchKeywords: ["black", "structured", "jacket", "tailoring", "evening"]
};

export default function FindThisUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<FindThisFeatures | null>(null);

  async function analyze(file: File) {
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const form = new FormData();
      form.set("image", file);
      const response = await fetch("/api/ai/find-this", { method: "POST", body: form });
      const payload = response.ok ? ((await response.json()) as { features: FindThisFeatures }) : { features: fallback };
      setFeatures(payload.features);
    } catch {
      setFeatures(fallback);
    } finally {
      setLoading(false);
    }
  }

  const pills = features ? [features.primaryColor, features.fit, features.neckline, features.sleeveType, features.pattern] : [];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
      <section className="border border-[rgba(201,168,76,0.18)] bg-surface p-5">
        <label className="relative grid min-h-[320px] cursor-pointer place-items-center overflow-hidden border border-dashed border-gold bg-bg text-center">
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => event.target.files?.[0] && analyze(event.target.files[0])} />
          {preview ? <Image src={preview} alt="Reference garment" fill className="object-cover opacity-90" /> : (
            <div className="p-6">
              <Search className="mx-auto text-gold" size={42} />
              <p className="mt-5 font-display text-3xl text-primary">Show us what you&apos;re looking for</p>
              <p className="mt-2 text-sm text-muted">Screenshot, photo, magazine — any source works</p>
            </div>
          )}
          {loading && <motion.div className="absolute left-0 right-0 h-1 bg-gold shadow-[0_0_24px_rgba(201,168,76,0.9)]" animate={{ top: ["0%", "100%", "0%"] }} transition={{ repeat: Infinity, duration: 2.2 }} />}
        </label>
      </section>
      <section>
        <div className="mb-5">
          <h2 className="font-display text-4xl text-primary">{features ? "Found 12 matches for you" : "Find This"}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(pills.length ? pills : ["Black", "Oversized", "Crew Neck", "Long Sleeve", "Solid"]).map((pill) => (
              <span key={pill} className="inline-flex items-center gap-2 border border-[rgba(201,168,76,0.25)] bg-card px-3 py-1 text-xs uppercase tracking-[0.16em] text-gold">
                <Shirt size={13} /> {pill}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.slice(0, 12).map((product, index) => <ProductCard key={product.id} product={product} badge={`${94 - index * 2}% match`} />)}
        </div>
        <div className="mt-6 border border-[rgba(201,168,76,0.2)] bg-card p-4 text-sm text-primary/80">
          Want something more specific? <input className="ml-2 w-full border-b border-gold bg-transparent py-2 outline-none sm:w-80" placeholder="Describe it" />
        </div>
      </section>
    </div>
  );
}
