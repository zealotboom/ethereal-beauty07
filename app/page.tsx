"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
    colors: Array.isArray(row.colors) ? (row.colors as string[]) : ["#1a6b8a","#b8862d"],
    stock: Number(row.stock ?? 0),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    fit: "tailored",
  };
}

const fade = (delay = 0) => ({
  initial: { opacity:0, y:20 },
  animate: { opacity:1, y:0 },
  transition: { duration:0.5, delay, ease:[0.4,0,0.2,1] as number[] },
});

// Jewellery sub-categories with actual items
const JEWEL_CATS = [
  { icon: "💍", label: "Rings",      href: "/shop?category=rings" },
  { icon: "📿", label: "Necklaces",  href: "/shop?category=necklaces" },
  { icon: "💎", label: "Earrings",   href: "/shop?category=earrings" },
  { icon: "⌚", label: "Bracelets",  href: "/shop?category=bracelets" },
  { icon: "🔗", label: "Anklets",    href: "/shop?category=anklets" },
  { icon: "✨", label: "Nose Pins",  href: "/shop?category=nosepins" },
  { icon: "🌟", label: "Pendants",   href: "/shop?category=pendants" },
  { icon: "🏅", label: "Bangles",    href: "/shop?category=bangles" },
];

// Mock admin-posted drops
const ADMIN_DROPS: Product[] = [
  {
    id: "drop1", name: "Admin Drop: Silk Kurta Set",
    description: "Exclusive admin-curated luxury piece",
    price: 4299, category: "Collection",
    images: [staticProducts[0]?.images[0] ?? ""],
    sizes: ["S","M","L","XL"], colors: ["#1a6b8a","#b8862d"],
    stock: 5, tags: ["admin","exclusive"], fit: "tailored",
  },
  {
    id: "drop2", name: "Admin Drop: Gold Jhumkas",
    description: "Handcrafted by artisans, admin selected",
    price: 1899, category: "Jewellery",
    images: [staticProducts[1]?.images[0] ?? ""],
    sizes: ["One Size"], colors: ["#b8862d"],
    stock: 10, tags: ["admin","jewellery","exclusive"], fit: "tailored",
  },
  {
    id: "drop3", name: "Admin Drop: Pashmina Shawl",
    description: "Kashmir's finest, admin curated",
    price: 6499, category: "Outerwear",
    images: [staticProducts[2]?.images[0] ?? ""],
    sizes: ["One Size"], colors: ["#6b4c3b","#1a6b8a"],
    stock: 3, tags: ["admin","premium"], fit: "relaxed",
  },
];

export default function HomePage() {
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!hasSupabaseBrowserEnv()) return;
    createClient().from("products").select("*").eq("is_active", true).limit(8)
      .then(({ data }) => { if (data?.length) setLiveProducts(data.map(dbToProduct)); });
  }, []);

  const featured  = liveProducts.length > 0 ? liveProducts : featuredProducts;
  const trending  = liveProducts.length > 4 ? liveProducts.slice(4, 7) : trendingProducts.slice(0, 3);
  const jewellery = (liveProducts.length > 0 ? liveProducts : staticProducts).filter(p =>
    p.category.toLowerCase().includes("jewel") || p.tags?.includes("jewellery")
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f8f7f5]">

      {/* HERO - clean modern */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fade(0)}>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#e0f2fe] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0369a1] mb-6">
                New Season — 2026
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.05] tracking-tight">
                Ethereal{" "}
                <span className="text-[#1a6b8a]">Beauty</span>
              </h1>
              <p className="italic text-[#b8862d] font-medium mt-1" style={{fontFamily:"Georgia,serif",fontSize:'15px'}}>
                — Aryan Zealot
              </p>
              <motion.p {...fade(0.15)} className="mt-5 text-lg text-gray-500 leading-relaxed max-w-lg">
                AI-powered styling meets handcrafted luxury. Discover pieces curated for those who don&apos;t follow trends — they set them.
              </motion.p>
              <motion.div {...fade(0.25)} className="mt-8 flex flex-wrap gap-3">
                <Link href="/shop" className="btn-primary rounded-lg px-7 py-3 text-sm font-semibold">
                  Shop Collection
                </Link>
                <Link href="/shop?category=jewellery" className="btn-gold rounded-lg px-7 py-3 text-sm font-semibold">
                  Fine Jewellery
                </Link>
                <Link href="/style-me" className="btn-outline rounded-lg px-7 py-3 text-sm font-semibold">
                  Style Me →
                </Link>
              </motion.div>
            </motion.div>

            <motion.div {...fade(0.1)} className="grid grid-cols-2 gap-3">
              {[
                { label: "Handcrafted Pieces", val: "2,400+" },
                { label: "Happy Customers", val: "18K+" },
                { label: "Artisan Partners", val: "120+" },
                { label: "Cities Delivered", val: "800+" },
              ].map((s) => (
                <div key={s.label} className="card p-5">
                  <p className="text-2xl font-bold text-[#1a6b8a]">{s.val}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CATEGORY QUICK LINKS */}
      <section className="luxury-shell py-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "Dresses", "Tailoring", "Knitwear", "Outerwear", "Jewellery", "Sale"].map((cat) => (
            <Link
              key={cat}
              href={cat === "All" ? "/shop" : `/shop?category=${cat.toLowerCase()}`}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium border transition ${
                cat === "Sale"
                  ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#1a6b8a] hover:text-[#1a6b8a]"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* ADMIN EXCLUSIVE DROPS FEED */}
      <section className="luxury-shell pt-0">
        <div className="feed-section-header">
          <div className="admin-badge">Admin Drops</div>
          <h2 className="text-gray-900">Exclusive Curated Picks</h2>
          <p className="text-sm text-gray-400 ml-auto">Handpicked by our team</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {ADMIN_DROPS.map((p, i) => (
            <motion.div key={p.id} {...fade(i * 0.07)}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* JEWELLERY SECTION - with sub-categories filled */}
      <section className="luxury-shell pt-0">
        <div className="feed-section-header">
          <h2 className="text-gray-900">Fine Jewellery</h2>
          <Link href="/shop?category=jewellery" className="ml-auto text-sm text-[#1a6b8a] font-medium hover:underline">
            View All →
          </Link>
        </div>

        {/* Sub-category grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-8">
          {JEWEL_CATS.map((jc) => (
            <Link key={jc.href} href={jc.href} className="jewel-cat">
              <div className="jewel-icon">{jc.icon}</div>
              <span className="text-xs font-medium text-gray-700">{jc.label}</span>
            </Link>
          ))}
        </div>

        {/* Jewellery products (or fallback grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(jewellery.length > 0 ? jewellery : staticProducts.slice(0, 4)).map((p, i) => (
            <motion.div key={p.id} {...fade(i * 0.07)}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="luxury-shell pt-0">
        <div className="feed-section-header">
          <h2 className="text-gray-900">Featured This Season</h2>
          <Link href="/shop" className="ml-auto text-sm text-[#1a6b8a] font-medium hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.slice(0, 8).map((p, i) => (
            <motion.div key={p.id} {...fade(i * 0.06)}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* STYLE ME CTA BANNER */}
      <section className="luxury-shell pt-0">
        <div className="rounded-2xl overflow-hidden bg-[#1a6b8a] text-white px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">Not sure what suits you?</h3>
            <p className="text-[#90e0ef] mt-1">Let our AI style you in seconds. Upload a photo and get personalized recommendations.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/style-me" className="px-6 py-3 bg-white text-[#1a6b8a] rounded-lg font-semibold text-sm hover:bg-[#e0f2fe] transition">
              Try Style Me
            </Link>
            <Link href="/find-this" className="px-6 py-3 border border-white/40 text-white rounded-lg font-semibold text-sm hover:bg-white/10 transition">
              Find an Item
            </Link>
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="luxury-shell pt-0">
        <div className="feed-section-header">
          <h2 className="text-gray-900">Trending Now</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {trending.slice(0,3).map((p, i) => (
            <motion.div key={p.id} {...fade(i * 0.07)}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
