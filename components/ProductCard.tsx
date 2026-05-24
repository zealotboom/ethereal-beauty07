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
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="group overflow-hidden border border-gray-100 bg-white rounded-xl"
    >
      <Link href={`/shop/${product.id}`} className="relative block aspect-[3/4] overflow-hidden bg-gray-50">
        <Image
          src={product.images[0]} alt={product.name} fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {badge && (
          <span className="absolute left-3 top-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-[#b8862d] rounded-full border border-[#b8862d]/20">
            {badge}
          </span>
        )}
        {product.salePrice && (
          <span className="absolute right-3 top-3 bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600 rounded-full">
            SALE
          </span>
        )}
      </Link>
      <div className="p-3.5">
        <Link href={`/shop/${product.id}`} className="font-semibold text-sm text-gray-900 hover:text-[#1a6b8a] transition line-clamp-1">
          {product.name}
        </Link>
        <p className="mt-0.5 text-xs text-gray-400 uppercase tracking-wider">{product.category}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-gray-900">{money(product.salePrice ?? product.price)}</span>
            {product.salePrice && (
              <span className="text-xs text-gray-400 line-through">{money(product.price)}</span>
            )}
          </div>
          <button
            onClick={() => add(product)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a6b8a] text-white text-xs font-semibold rounded-lg hover:bg-[#0f4d6b] transition"
          >
            <ShoppingBag size={12} /> Add
          </button>
        </div>
      </div>
    </motion.article>
  );
}
