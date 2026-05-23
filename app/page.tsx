"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import DynamicWallpaper from "@/components/DynamicWallpaper";
import ProductCard from "@/components/ProductCard";
import { featuredProducts, trendingProducts } from "@/lib/products";
import { Waves, Sparkles, Search } from "lucide-react";

const MotionDiv = motion.div;

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 30 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function HomePage() {
  return (
    <>
      <DynamicWallpaper />

      {/* ── HERO ── */}
      <section className="luxury-shell flex min-h-[82vh] flex-col justify-center">
        <MotionDiv {...fadeUp(0)} className="max-w-4xl">
          {/* floating badge */}
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 border border-[rgba(0,180,216,0.3)] bg-[rgba(0,180,216,0.07)] px-4 py-1.5 text-xs uppercase tracking-[0.28em] text-[#00b4d8]"
          >
            <Waves size={13} />
            Autumn Evening Collection
          </motion.span>

          <h1 className="font-display text-6xl leading-[0.92] text-[#E8F4F8] sm:text-7xl lg:text-8xl">
            Ethereal{" "}
            <span className="bg-gradient-to-r from-[#00b4d8] via-[#90e0ef] to-gold bg-clip-text text-transparent">
              Beauty
            </span>
          </h1>

          <MotionDiv {...fadeUp(0.18)}>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#E8F4F8]/65">
              A fashion house where dark rooms meet soft light — silhouettes composed before you say a word.
            </p>
          </MotionDiv>

          <MotionDiv {...fadeUp(0.3)} className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="bg-[#00b4d8] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-bg shadow-[0_0_30px_rgba(0,180,216,0.35)] transition hover:bg-[#90e0ef] hover:shadow-[0_0_50px_rgba(0,180,216,0.55)]"
            >
              Enter the Shop
            </Link>
            <Link
              href="/style-me"
              className="border border-[#00b4d8] px-8 py-4 text-sm uppercase tracking-[0.18em] text-[#00b4d8] transition hover:bg-[#00b4d8] hover:text-bg"
            >
              Style Me
            </Link>
          </MotionDiv>
        </MotionDiv>

        {/* scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#00b4d8]/50"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="h-6 w-px bg-gradient-to-b from-[#00b4d8]/50 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── FEATURED ── */}
      <section className="luxury-shell">
        <MotionDiv
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="flex items-baseline justify-between"
        >
          <h2 className="font-display text-4xl text-[#E8F4F8]">Featured Pieces</h2>
          <Link href="/shop" className="text-sm text-[#00b4d8] transition hover:text-[#90e0ef]">
            View all →
          </Link>
        </MotionDiv>
        <div className="mt-6 flex gap-5 overflow-x-auto pb-4">
          {featuredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              className="min-w-[280px]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="luxury-shell">
        <MotionDiv
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#00b4d8]">AI Powered</p>
          <h2 className="mt-2 font-display text-4xl text-[#E8F4F8]">How It Works</h2>
        </MotionDiv>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: <Sparkles size={28} />, num: "01", title: "Upload your photo", body: "Share a selfie or full-body shot and let our AI read your body type, skin tone, and proportions." },
            { icon: <Waves size={28} />,    num: "02", title: "AI reads your style", body: "Our vision model builds a style profile unique to you — colours, cuts, and silhouettes that work." },
            { icon: <Search size={28} />,   num: "03", title: "Shop what suits you", body: "Browse AI-curated picks from our collection, or drop a photo of anything you saw and we'll find it." },
          ].map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.55 }}
              whileHover={{ y: -6, boxShadow: "0 0 40px rgba(0,180,216,0.14)" }}
              className="border border-[rgba(0,180,216,0.15)] bg-[rgba(8,20,40,0.7)] p-7 backdrop-blur-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[#00b4d8]">{item.icon}</span>
                <span className="font-display text-5xl text-[rgba(0,180,216,0.12)]">{item.num}</span>
              </div>
              <h3 className="font-display text-2xl text-[#E8F4F8]">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#5a7a8a]">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TRENDING ── */}
      <section className="luxury-shell">
        <MotionDiv
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="flex items-baseline justify-between"
        >
          <h2 className="font-display text-4xl text-[#E8F4F8]">Trending Now</h2>
          <Link href="/shop" className="text-sm text-[#00b4d8] transition hover:text-[#90e0ef]">
            See all →
          </Link>
        </MotionDiv>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {trendingProducts.slice(0, 3).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <ProductCard product={product} badge="Trending" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── OCEAN DIVIDER FOOTER BAND ── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00b4d8]/30 to-transparent" />
    </>
  );
}
