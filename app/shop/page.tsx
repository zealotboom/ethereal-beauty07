import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function ShopPage() {
  return (
    <div className="luxury-shell">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-gold">Collection</p>
          <h1 className="mt-2 font-display text-5xl text-primary">Shop</h1>
        </div>
        <p className="text-sm text-muted">Showing {products.length} of {products.length} items</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit border border-[rgba(201,168,76,0.15)] bg-surface p-5">
          <h2 className="font-display text-2xl text-gold">Filters</h2>
          <div className="mt-5 grid gap-5 text-sm text-primary/80">
            <label>Category<select className="mt-2 w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3"><option>All</option><option>Dresses</option><option>Tailoring</option></select></label>
            <label>Price<input type="range" min="100" max="600" className="mt-3 w-full accent-gold" /></label>
            <div><p>Color</p><div className="mt-2 flex gap-2">{["#080808", "#C9A84C", "#6E1F2F", "#F0EDE6"].map((color) => <span key={color} className="h-7 w-7 rounded-full border border-white/20" style={{ background: color }} />)}</div></div>
            <div><p>Size</p><div className="mt-2 grid grid-cols-3 gap-2">{["XS", "S", "M", "L", "XL"].map((size) => <label key={size} className="flex gap-2"><input type="checkbox" className="accent-gold" /> {size}</label>)}</div></div>
            <label>Sort<select className="mt-2 w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3"><option>Editorial picks</option><option>Price low to high</option></select></label>
          </div>
        </aside>
        <section>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.slice(0, 24).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
          <button className="mx-auto mt-8 block border border-gold px-6 py-3 text-sm text-gold transition hover:bg-gold hover:text-bg">Load more</button>
        </section>
      </div>
    </div>
  );
}
