"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { products as staticProducts } from "@/lib/products";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";
import type { Product } from "@/lib/types";

const CATEGORIES = ["All", "Dresses", "Tailoring", "Knitwear", "Outerwear", "Separates", "Jewellery"];

function dbToProduct(row: Record<string, unknown>): Product {
  return {
    id:          String(row.id),
    name:        String(row.name),
    description: String(row.description ?? ""),
    price:       Number(row.price),
    salePrice:   row.sale_price ? Number(row.sale_price) : undefined,
    category:    String(row.category ?? "Collection"),
    images:      Array.isArray(row.images) && row.images.length > 0
                   ? (row.images as string[])
                   : [staticProducts[0].images[0]],
    sizes:       Array.isArray(row.sizes)  ? (row.sizes  as string[]) : ["S","M","L"],
    colors:      Array.isArray(row.colors) ? (row.colors as string[]) : ["#0a1628","#C9A84C"],
    stock:       Number(row.stock ?? 0),
    tags:        Array.isArray(row.tags)   ? (row.tags   as string[]) : [],
    fit:         "tailored",
  };
}

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<Product[]>(staticProducts);
  const [category,    setCategory]    = useState("All");
  const [search,      setSearch]      = useState("");
  const [sort,        setSort]        = useState("newest");

  useEffect(() => {
    if (!hasSupabaseBrowserEnv()) return;
    const sb = createClient();
    sb.from("products").select("*").eq("is_active", true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setAllProducts([...data.map(dbToProduct), ...staticProducts]);
        }
      });
  }, []);

  const filtered = allProducts
    .filter((p) => category === "All" || p.category.toLowerCase() === category.toLowerCase())
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : 0);

  const isJewellery = category === "Jewellery";

  return (
    <div className="luxury-shell">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="mb-8">
        <p className="text-xs uppercase tracking-[0.32em] text-[#00b4d8]">
          {isJewellery ? "✦ Fine Jewellery Collection" : "✦ Full Collection"}
        </p>
        <h1 className="mt-1 font-display text-5xl text-[#E8F4F8]">
          {isJewellery ? "Jewellery" : "Shop"}
        </h1>
        {isJewellery && (
          <p className="mt-2 text-sm text-[#4a6a7a]">
            Pearls, gold, ocean-inspired pieces crafted for eternity
          </p>
        )}
      </motion.div>

      {/* Category pills — Gen Z style */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition ${
              category === cat
                ? cat === "Jewellery"
                  ? "bg-gradient-to-r from-gold to-gold-light text-bg shadow-[0_0_20px_rgba(201,168,76,0.4)]"
                  : "bg-[#00b4d8] text-bg shadow-[0_0_20px_rgba(0,180,216,0.35)]"
                : "border border-[rgba(0,180,216,0.2)] text-[#4a6a7a] hover:border-[#00b4d8] hover:text-[#00b4d8]"
            }`}
          >
            {cat === "Jewellery" ? "💎 " + cat : cat}
          </button>
        ))}
      </div>

      {/* Search + sort bar */}
      <div className="mb-8 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-lux max-w-xs flex-1"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input-lux w-48"
        >
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: low → high</option>
          <option value="price-desc">Price: high → low</option>
        </select>
        <p className="self-center text-sm text-[#4a6a7a]">{filtered.length} items</p>
      </div>

      {/* Jewellery banner */}
      {isJewellery && (
        <motion.div
          initial={{ opacity:0, scale:0.98 }}
          animate={{ opacity:1, scale:1 }}
          className="mb-8 overflow-hidden border border-[rgba(201,168,76,0.25)] bg-gradient-to-r from-[rgba(201,168,76,0.08)] to-[rgba(0,180,216,0.05)] p-8"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">💎</div>
            <div>
              <h2 className="font-display text-3xl text-gold">Fine Jewellery</h2>
              <p className="mt-1 text-sm text-[#4a6a7a]">Ocean-inspired gold, pearl & crystal pieces</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={category + search + sort}
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          exit={{ opacity:0 }}
          transition={{ duration:0.3 }}
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity:0, y:20 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.04, duration:0.4 }}
            >
              <ProductCard
                product={product}
                badge={product.category === "Jewellery" ? "💎 Jewellery" : undefined}
              />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full grid place-items-center py-24 text-center">
              <div className="text-5xl">🌊</div>
              <p className="mt-4 font-display text-3xl text-[#E8F4F8]">Nothing found</p>
              <p className="mt-2 text-sm text-[#4a6a7a]">Try a different search or category</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
