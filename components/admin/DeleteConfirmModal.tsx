"use client";

import Image from "next/image";
import { useEffect } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { AdminProduct } from "@/components/admin/ProductsTable";

export default function DeleteConfirmModal({
  product,
  deleting,
  onClose,
  onConfirm
}: {
  product: AdminProduct | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const controls = useAnimationControls();

  useEffect(() => {
    if (product) void controls.start({ opacity: 1, scale: 1 });
  }, [controls, product]);

  async function confirm() {
    await controls.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.32 } });
    onConfirm();
  }

  return (
    <AnimatePresence>
      {product && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center bg-bg/80 px-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div animate={controls} initial={{ opacity: 0, scale: 0.94 }} exit={{ opacity: 0, scale: 0.94 }} className="w-full max-w-md border border-[rgba(201,168,76,0.22)] bg-surface p-6 shadow-[0_0_70px_rgba(0,0,0,0.65)]">
            <AlertTriangle className="text-red-300" size={40} />
            <h2 className="mt-4 font-display text-4xl text-primary">Delete Product?</h2>
            <p className="mt-2 text-sm text-muted">This action cannot be undone</p>
            <div className="mt-5 flex items-center gap-4 border border-[rgba(201,168,76,0.14)] bg-card p-3">
              <div className="relative h-16 w-16 overflow-hidden bg-bg">
                {product.images?.[0] && <Image src={product.images[0]} alt={product.name} fill className="object-cover" />}
              </div>
              <p className="text-primary">{product.name}</p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button onClick={onClose} className="border border-gold px-5 py-3 text-sm text-gold">Cancel</button>
              <button onClick={() => void confirm()} disabled={deleting} className="flex items-center justify-center gap-2 bg-danger px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-primary disabled:opacity-60">
                {deleting && <Loader2 className="animate-spin" size={16} />} Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
