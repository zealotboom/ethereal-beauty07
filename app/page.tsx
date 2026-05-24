"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DynamicWallpaper from "@/components/DynamicWallpaper";
import ProductCard from "@/components/ProductCard";
import { featuredProducts, trendingProducts } from "@/lib/products";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import { products as staticProducts } from "@/lib/products";

function dbToProduct(row: Record<string,unknown>): Product {
  return {
    id: String(row.id), name: String(row.name),
    description: String(row.description ?? ""),
    price: Number(row.price),
    salePrice: row.sale_price ? Number(row.sale_price) : undefined,
    category: String(row.category ?? "Collection"),
    images: Array.isArray(row.images) && (row.images as string[]).length > 0
      ? (row.images as string[]) : [staticProducts[0].images[0]],
    sizes: Array.isArray(row.sizes) ? (row.sizes as string[]) : ["S","M","L"],
    colors: Array.isArray(row.colors) ? (row.colors as string[]) : ["#0a1628","#C9A84C"],
    stock: Number(row.stock ?? 0),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    fit: "tailored",
  };
}

const fadeUp = (delay = 0) => ({
  initial: { opacity:0, y:30 },
  animate: { opacity:1, y:0 },
  transition: { duration:0.7, delay, ease:[0.4,0,0.2,1] as number[] },
});

export default function HomePage() {
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!hasSupabaseBrowserEnv()) return;
    createClient().from("products").select("*").eq("is_active", true).limit(8)
      .then(({ data }) => { if (data?.length) setLiveProducts(data.map(dbToProduct)); });
  }, []);

  const featured = liveProducts.length > 0 ? liveProducts : featuredProducts;
  const trending = liveProducts.length > 4 ? liveProducts.slice(4, 7) : trendingProducts.slice(0, 3);

  return (
    <>
      <DynamicWallpaper />

      {/* HERO */}
      <section className="luxury-shell flex min-h-[88vh] flex-col justify-center">
        <motion.div {...fadeUp(0)} className="max-w-4xl">
          <motion.div
            initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(0,180,216,0.3)] bg-[rgba(0,180,216,0.07)] px-5 py-2 text-xs uppercase tracking-[0.28em] text-[#00b4d8]"
          >
            🐋 New Drops This Season
          </motion.div>

          <h1 className="font-display text-6xl leading-[0.9] text-[#E8F4F8] sm:text-7xl lg:text-[6rem]">
            Ethereal{" "}
            <span className="bg-gradient-to-r from-[#00b4d8] via-[#90e0ef] to-gold bg-clip-text text-transparent">
              Beauty
            </span>
          </h1>

          <motion.p {...fadeUp(0.2)} className="mt-6 max-w-xl text-lg leading-8 text-[#E8F4F8]/55">
            Where ocean depths meet haute couture. AI-powered styling for the generation that refuses to blend in.
          </motion.p>

          <motion.div {...fadeUp(0.35)} className="mt-10 flex flex-wrap gap-4">
            <Link href="/shop" className="btn-glow rounded-full px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white">
              🌊 Explore Collection
            </Link>
            <Link href="/shop?category=jewellery" className="btn-gold-glow rounded-full px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-bg">
              💎 Fine Jewellery
            </Link>
            <Link href="/style-me" className="rounded-full border border-[rgba(0,180,216,0.3)] px-8 py-4 text-sm uppercase tracking-[0.15em] text-[#00b4d8] transition hover:bg-[rgba(0,180,216,0.08)]">
              Style Me →
            </Link>
          </motion.div>
        </motion.div>

        {/* scroll hint */}
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#00b4d8]/40">Dive in</span>
          <motion.div animate={{ y:[0,10,0] }} transition={{ repeat:Infinity, duration:1.8 }}
            className="h-8 w-px bg-gradient-to-b from-[#00b4d8]/40 to-transparent"
          />
        </motion.div>
      </section>

      {/* JEWELLERY SECTION */}
      <section className="luxury-shell">
        <motion.div
          initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          className="overflow-hidden border border-[rgba(201,168,76,0.2)] bg-gradient-to-br from-[rgba(201,168,76,0.06)] to-[rgba(0,180,216,0.04)] p-8 sm:p-12"
        >
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold">New Category</p>
              <h2 className="mt-2 font-display text-5xl text-[#E8F4F8]">Fine <span className="text-gold">Jewellery</span></h2>
              <p className="mt-4 text-[#4a6a7a]">
                Ocean-kissed pearls, tidal gold, and crystalline pieces that carry the sea wherever you go.
              </p>
              <Link href="/shop?category=jewellery" className="btn-gold-glow mt-6 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-bg">
                💎 Shop Jewellery
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["💎","🐚","🪸","⭐","🌊","✨"].map((emoji, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity:0, scale:0.8 }}
                  whileInView={{ opacity:1, scale:1 }}
                  viewport={{ once:true }}
                  transition={{ delay: i*0.08 }}
                  className="aspect-square border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.05)] grid place-items-center text-3xl"
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="luxury-shell">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#00b4d8]">Hand picked</p>
            <h2 className="mt-1 font-display text-4xl text-[#E8F4F8]">Featured Pieces</h2>
          </div>
          <Link href="/shop" className="rounded-full border border-[rgba(0,180,216,0.2)] px-4 py-1.5 text-xs text-[#00b4d8] transition hover:bg-[rgba(0,180,216,0.08)]">
            View all →
          </Link>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4">
          {featured.map((p, i) => (
            <motion.div key={p.id} className="min-w-[260px]"
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay:i*0.07 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="luxury-shell">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#00b4d8]">AI Powered</p>
          <h2 className="mt-2 font-display text-4xl text-[#E8F4F8]">How It Works</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon:"🐋", num:"01", title:"Upload your photo", body:"Our AI reads body type, skin tone, and proportions to build your personal style profile." },
            { icon:"🪸", num:"02", title:"AI reads your vibe", body:"Get colour palettes, cuts, and fits that were quite literally made for you." },
            { icon:"🔍", num:"03", title:"Shop or match", body:"Browse your AI picks or upload any outfit photo — we'll find it in our collection." },
          ].map((item, i) => (
            <motion.div key={item.num}
              initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay:i*0.1 }}
              whileHover={{ y:-6, boxShadow:"0 0 40px rgba(0,180,216,0.12)" }}
              className="glass rounded-xl p-7"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-3xl">{item.icon}</span>
                <span className="font-display text-5xl text-[rgba(0,180,216,0.1)]">{item.num}</span>
              </div>
              <h3 className="font-display text-2xl text-[#E8F4F8]">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#4a6a7a]">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRENDING */}
      <section className="luxury-shell">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#00b4d8]">Right now</p>
            <h2 className="mt-1 font-display text-4xl text-[#E8F4F8]">Trending 🔥</h2>
          </div>
          <Link href="/shop" className="rounded-full border border-[rgba(0,180,216,0.2)] px-4 py-1.5 text-xs text-[#00b4d8] transition hover:bg-[rgba(0,180,216,0.08)]">
            See all →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {trending.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity:0, scale:0.97 }} whileInView={{ opacity:1, scale:1 }}
              viewport={{ once:true }} transition={{ delay:i*0.1 }}
            >
              <ProductCard product={p} badge="🔥 Trending" />
            </motion.div>
          ))}
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00b4d8]/20 to-transparent" />
    </>
  );
}
