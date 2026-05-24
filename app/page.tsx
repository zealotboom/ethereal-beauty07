"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { featuredProducts, trendingProducts } from "@/lib/products";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import { products as staticProducts } from "@/lib/products";

function dbToProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    price: Number(row.price),
    salePrice: row.sale_price ? Number(row.sale_price) : undefined,
    category: String(row.category ?? "Collection"),
    images:
      Array.isArray(row.images) && (row.images as string[]).length > 0
        ? (row.images as string[])
        : [staticProducts[0].images[0]],
    sizes: Array.isArray(row.sizes) ? (row.sizes as string[]) : ["S", "M", "L"],
    colors: Array.isArray(row.colors) ? (row.colors as string[]) : ["#1a6b8a", "#b8862d"],
    stock: Number(row.stock ?? 0),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    fit: "tailored",
  };
}

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] as number[] },
});

// Western/Modern jewellery categories with real Unsplash images
const JEWEL_CATS = [
  {
    label: "Rings",
    href: "/shop?category=rings",
    img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Necklaces",
    href: "/shop?category=necklaces",
    img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Earrings",
    href: "/shop?category=earrings",
    img: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Bracelets",
    href: "/shop?category=bracelets",
    img: "https://images.unsplash.com/photo-1573408301185-9519f94816b5?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Anklets",
    href: "/shop?category=anklets",
    img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Nose Pins",
    href: "/shop?category=nosepins",
    img: "https://images.unsplash.com/photo-1630018548696-e6a46d194f95?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Pendants",
    href: "/shop?category=pendants",
    img: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "Bangles",
    href: "/shop?category=bangles",
    img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80",
  },
];

export default function HomePage() {
  const [adminDrops, setAdminDrops] = useState<Product[]>([]);
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [dropsLoading, setDropsLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseBrowserEnv()) {
      setDropsLoading(false);
      return;
    }
    const sb = createClient();

    // Fetch ALL active products from Supabase (admin uploaded)
    sb.from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const mapped = data.map(dbToProduct);
          setAdminDrops(mapped.slice(0, 6));   // first 6 = admin drops
          setLiveProducts(mapped);
        }
        setDropsLoading(false);
      });
  }, []);

  const featured = liveProducts.length > 0 ? liveProducts.slice(0, 8) : featuredProducts;
  const trending =
    liveProducts.length > 4 ? liveProducts.slice(4, 7) : trendingProducts.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f8f7f5]">

      {/* ── HERO ── */}
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
              <p className="italic text-[#b8862d] font-medium mt-1" style={{ fontFamily: "Georgia,serif", fontSize: "15px" }}>
                — Curated for the bold
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

      {/* ── CATEGORY PILLS ── */}
      <section className="luxury-shell py-6">
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

      {/* ── ADMIN DROPS (real Supabase products) ── */}
      <section className="luxury-shell pt-0">
        <div className="flex items-center gap-3 mb-5">
          <span className="inline-flex items-center gap-1.5 bg-[#1a6b8a] text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
            ✦ Admin Drops
          </span>
          <h2 className="text-xl font-bold text-gray-900">Exclusive Curated Picks</h2>
          <p className="text-sm text-gray-400 ml-auto">Handpicked by our team</p>
          <Link href="/shop" className="text-sm text-[#1a6b8a] font-medium hover:underline shrink-0">
            View All →
          </Link>
        </div>

        {dropsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-72 animate-pulse bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : adminDrops.length === 0 ? (
          <div className="card p-10 text-center text-gray-400 rounded-xl">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-medium text-gray-600">No admin drops yet</p>
            <p className="text-sm mt-1">Add products from the Admin Panel to see them here</p>
            <Link href="/admin/products" className="mt-4 inline-block text-sm text-[#1a6b8a] font-medium hover:underline">
              Go to Admin Panel →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {adminDrops.map((p, i) => (
              <motion.div key={p.id} {...fade(i * 0.07)}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── FINE JEWELLERY — real category images ── */}
      <section className="luxury-shell pt-0">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-bold text-gray-900">Fine Jewellery</h2>
          <Link href="/shop?category=jewellery" className="ml-auto text-sm text-[#1a6b8a] font-medium hover:underline">
            View All →
          </Link>
        </div>

        {/* Sub-category image grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-8">
          {JEWEL_CATS.map((jc) => (
            <Link key={jc.href} href={jc.href} className="group flex flex-col items-center gap-2">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-transparent group-hover:border-[#b8862d] transition-all duration-200 shadow-sm">
                <Image
                  src={jc.img}
                  alt={jc.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="100px"
                />
              </div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-[#b8862d] transition-colors text-center">
                {jc.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Jewellery products from Supabase or fallback */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(liveProducts.length > 0
            ? liveProducts.filter(
                (p) =>
                  p.category.toLowerCase().includes("jewel") ||
                  p.tags?.some((t) => ["ring", "necklace", "earring", "bracelet", "jewel"].includes(t.toLowerCase()))
              ).slice(0, 4)
            : staticProducts.slice(0, 4)
          ).map((p, i) => (
            <motion.div key={p.id} {...fade(i * 0.07)}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="luxury-shell pt-0">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-bold text-gray-900">Featured This Season</h2>
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

      {/* ── STYLE ME CTA ── */}
      <section className="luxury-shell pt-0">
        <div className="rounded-2xl overflow-hidden bg-[#1a6b8a] text-white px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">Not sure what suits you?</h3>
            <p className="text-[#90e0ef] mt-1">
              Let our AI style you in seconds. Upload a photo and get personalized recommendations.
            </p>
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

      {/* ── TRENDING ── */}
      <section className="luxury-shell pt-0">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-bold text-gray-900">Trending Now</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {trending.slice(0, 3).map((p, i) => (
            <motion.div key={p.id} {...fade(i * 0.07)}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
