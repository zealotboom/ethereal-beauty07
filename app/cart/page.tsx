"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { money } from "@/lib/utils";

export default function CartPage() {
  const { lines, remove, setQuantity } = useCartStore();
  const subtotal = lines.reduce((sum, line) => sum + (line.product.salePrice ?? line.product.price) * line.quantity, 0);
  const shipping = subtotal > 300 || subtotal === 0 ? 0 : 18;
  const tax = subtotal * 0.0825;
  const total = subtotal + shipping + tax;

  return (
    <div className="luxury-shell">
      <h1 className="font-display text-5xl text-primary">Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-4">
          {lines.length === 0 && <div className="border border-[rgba(201,168,76,0.15)] bg-surface p-8 text-muted">Your cart is waiting for its first piece.</div>}
          {lines.map((line) => (
            <article key={`${line.product.id}-${line.size}-${line.color}`} className="grid gap-4 border border-[rgba(201,168,76,0.15)] bg-surface p-4 sm:grid-cols-[120px_1fr_auto]">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image src={line.product.images[0]} alt={line.product.name} fill className="object-cover" />
              </div>
              <div>
                <h2 className="font-display text-2xl text-primary">{line.product.name}</h2>
                <p className="mt-1 text-sm text-muted">{line.size} · {line.color}</p>
                <div className="mt-5 flex w-fit items-center border border-[rgba(201,168,76,0.2)]">
                  <button className="p-3 text-gold" onClick={() => setQuantity(line.product.id, line.quantity - 1)} aria-label="Decrease"><Minus size={15} /></button>
                  <span className="px-4 text-primary">{line.quantity}</span>
                  <button className="p-3 text-gold" onClick={() => setQuantity(line.product.id, line.quantity + 1)} aria-label="Increase"><Plus size={15} /></button>
                </div>
              </div>
              <div className="flex items-start justify-between gap-4 sm:block sm:text-right">
                <p className="text-gold">{money((line.product.salePrice ?? line.product.price) * line.quantity)}</p>
                <button className="mt-4 text-muted hover:text-danger" onClick={() => remove(line.product.id)} aria-label="Remove"><Trash2 size={17} /></button>
              </div>
            </article>
          ))}
        </section>
        <aside className="h-fit border border-[rgba(201,168,76,0.18)] bg-card p-6">
          <h2 className="font-display text-3xl text-gold">Order Summary</h2>
          <div className="mt-6 grid gap-3 text-sm text-primary/80">
            <p className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></p>
            <p className="flex justify-between"><span>Shipping</span><span>{shipping ? money(shipping) : "Free"}</span></p>
            <p className="flex justify-between"><span>Tax</span><span>{money(tax)}</span></p>
            <label className="mt-3">Promo code<input className="mt-2 w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none" placeholder="EBGOLD" /></label>
            <p className="mt-3 flex justify-between border-t border-[rgba(201,168,76,0.15)] pt-4 text-lg text-gold"><span>Total</span><span>{money(total)}</span></p>
          </div>
          <Link href="/checkout" className="mt-6 block bg-gold px-5 py-4 text-center text-sm font-bold uppercase tracking-[0.15em] text-bg">Checkout</Link>
        </aside>
      </div>
    </div>
  );
}
