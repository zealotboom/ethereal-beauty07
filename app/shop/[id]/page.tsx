import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getProduct, products } from "@/lib/products";
import { money } from "@/lib/utils";

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProduct(params.id);
  if (!product) notFound();

  return (
    <div className="luxury-shell">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <div className="relative aspect-[4/5] overflow-hidden bg-surface">
            <Image src={product.images[0]} alt={product.name} fill className="object-cover" priority />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[...product.images, ...product.images].slice(0, 4).map((src, index) => (
              <div key={`${src}-${index}`} className="relative aspect-square overflow-hidden border border-[rgba(201,168,76,0.18)]">
                <Image src={src} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </section>
        <section className="lg:sticky lg:top-28 lg:h-fit">
          <p className="text-sm uppercase tracking-[0.28em] text-gold">{product.category}</p>
          <h1 className="mt-3 font-display text-5xl text-primary">{product.name}</h1>
          <p className="mt-4 text-2xl text-gold">{money(product.salePrice ?? product.price)}</p>
          <p className="mt-6 leading-7 text-primary/72">{product.description}</p>
          <div className="mt-8 grid gap-5">
            <div><p className="mb-2 text-sm text-muted">Size</p><div className="flex flex-wrap gap-2">{product.sizes.map((size) => <button key={size} className="h-11 min-w-11 border border-[rgba(201,168,76,0.25)] px-3 text-primary hover:border-gold">{size}</button>)}</div></div>
            <div><p className="mb-2 text-sm text-muted">Color</p><div className="flex gap-2">{product.colors.map((color) => <button key={color} className="h-9 w-9 rounded-full border border-white/20" style={{ background: color }} aria-label={color} />)}</div></div>
            <label className="text-sm text-muted">Quantity<input type="number" min={1} defaultValue={1} className="mt-2 w-24 border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary" /></label>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button className="bg-gold px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-bg">Add to Cart</button>
            <button className="border border-gold px-5 py-4 text-sm uppercase tracking-[0.15em] text-gold">Save to Wishlist</button>
          </div>
          <Link href="/style-me" className="mt-5 block text-sm text-gold">Not sure if this suits you? Try Style Me</Link>
        </section>
      </div>
      <section className="mt-14">
        <h2 className="font-display text-4xl text-primary">Related Pieces</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-4">
          {products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4).map((item) => <ProductCard key={item.id} product={item} />)}
        </div>
      </section>
    </div>
  );
}
