"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { X, Package, Tag, Layers, Palette } from "lucide-react";
import type { AdminProduct } from "@/components/admin/ProductsTable";

export default function ProductDetailModal({
  product,
  onClose,
}: {
  product: AdminProduct | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(2,8,18,0.88)] px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-3xl overflow-hidden border border-[rgba(0,180,216,0.2)] bg-[#060e1c] shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* shimmer top */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00b4d8] to-transparent" />

            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full border border-[rgba(0,180,216,0.2)] text-[#4a6a7a] transition hover:border-[#00b4d8] hover:text-[#00b4d8]"
            >
              <X size={16} />
            </button>

            <div className="grid md:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-[3/4] bg-[#0a1628]">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-[#4a6a7a]">
                    <Package size={48} />
                  </div>
                )}
                {/* image strip */}
                {product.images && product.images.length > 1 && (
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {product.images.slice(0, 4).map((img, i) => (
                      <div key={i} className="relative h-12 w-12 overflow-hidden border border-[rgba(0,180,216,0.3)]">
                        <Image src={img} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#00b4d8]">{product.category}</p>
                  <h2 className="mt-1 font-display text-3xl text-[#E8F4F8]">{product.name}</h2>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3">
                  {product.sale_price ? (
                    <>
                      <span className="font-display text-2xl text-gold">₹{Number(product.sale_price).toLocaleString("en-IN")}</span>
                      <span className="text-lg line-through text-[#4a6a7a]">₹{Number(product.price).toLocaleString("en-IN")}</span>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                        {Math.round((1 - Number(product.sale_price) / Number(product.price)) * 100)}% off
                      </span>
                    </>
                  ) : (
                    <span className="font-display text-2xl text-gold">₹{Number(product.price).toLocaleString("en-IN")}</span>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide ${
                    product.is_active
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-red-500/15 text-red-300"
                  }`}>
                    {product.is_active ? "● Active" : "● Inactive"}
                  </span>
                  <span className="text-sm text-[#4a6a7a]">Stock: <span className="text-[#E8F4F8]">{product.stock}</span></span>
                </div>

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#4a6a7a]">
                      <Layers size={12} /> Sizes
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <span key={s} className="border border-[rgba(0,180,216,0.2)] px-3 py-1 text-xs text-[#E8F4F8]">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#4a6a7a]">
                      <Palette size={12} /> Colors
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c) => (
                        <span key={c} className="flex items-center gap-1.5 border border-[rgba(0,180,216,0.15)] px-2 py-1 text-xs text-[#E8F4F8]">
                          <span className="h-3 w-3 rounded-full border border-white/20" style={{ background: c }} />
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#4a6a7a]">
                      <Tag size={12} /> Tags
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.map((t) => (
                        <span key={t} className="rounded-full border border-[rgba(201,168,76,0.2)] px-3 py-0.5 text-xs text-gold">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {product.description && (
                  <p className="text-sm leading-6 text-[#4a6a7a] border-t border-[rgba(0,180,216,0.1)] pt-4">
                    {product.description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
