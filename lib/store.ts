"use client";

import { create } from "zustand";
import type { CartLine, Product } from "@/lib/types";

type CartStore = {
  lines: CartLine[];
  add: (product: Product, size?: string, color?: string) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartStore>((set) => ({
  lines: [],
  add: (product, size = product.sizes[1] ?? "M", color = product.colors[0] ?? "#080808") =>
    set((state) => {
      const existing = state.lines.find((line) => line.product.id === product.id && line.size === size && line.color === color);
      if (existing) {
        return {
          lines: state.lines.map((line) =>
            line === existing ? { ...line, quantity: line.quantity + 1 } : line
          )
        };
      }
      return { lines: [...state.lines, { product, size, color, quantity: 1 }] };
    }),
  remove: (productId) => set((state) => ({ lines: state.lines.filter((line) => line.product.id !== productId) })),
  setQuantity: (productId, quantity) =>
    set((state) => ({
      lines: state.lines.map((line) =>
        line.product.id === productId ? { ...line, quantity: Math.max(1, quantity) } : line
      )
    })),
  clear: () => set({ lines: [] })
}));

type AuthStore = {
  email: string | null;
  setEmail: (email: string | null) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  email: null,
  setEmail: (email) => set({ email })
}));
