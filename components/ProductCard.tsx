"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { money } from "@/lib/utils";
import { useCartStore } from "@/lib/store";

export default function ProductCard({ product, badge }: { product: Product; badge?: string }) {
  const add = useCartStore((state) => state.add);

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="group overflow-hidden border border-[rgba(201,168,76,0.15)] bg-card"
    >
      <Link href={`/shop/${product.id}`} className="relative block aspect-[3/4] overflow-hidden bg-surface">
        <Image src={product.images[0]} alt={product.name} fill sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
        {badge && <span className="absolute left-3 top-3 bg-bg/85 px-3 py-1 text-xs text-gold backdrop-blur">{badge}</span>}
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/shop/${product.id}`} className="font-display text-xl text-primary transition hover:text-gold">
              {product.name}
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">{product.category}</p>
          </div>
          <p className="text-sm text-gold">{money(product.salePrice ?? product.price)}</p>
        </div>
        <button onClick={() => add(product)} className="flex w-full items-center justify-center gap-2 border border-gold px-4 py-3 text-sm text-gold transition hover:bg-gold hover:text-bg">
          <ShoppingBag size={16} /> Add to Cart
        </button>
      </div>
    </motion.article>
  );
}
