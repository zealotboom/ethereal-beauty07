"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, ShoppingBag, Trash2 } from "lucide-react";

export type AdminProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category: "tops" | "bottoms" | "dresses" | "outerwear" | "accessories";
  images: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  stock: number | null;
  tags: string[] | null;
  is_active: boolean;
  created_at: string | null;
  updated_at?: string | null;
};

export type ProductFilters = {
  search: string;
  category: string;
  status: string;
  sort: string;
  page: number;
  limit: number;
};

export default function ProductsTable({
  products,
  total,
  filters,
  loading,
  onFilters,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  toast
}: {
  products: AdminProduct[];
  total: number;
  filters: ProductFilters;
  loading: boolean;
  onFilters: (filters: ProductFilters) => void;
  onAdd: () => void;
  onEdit: (product: AdminProduct) => void;
  onView?: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
  onRefresh: () => void;
  toast: (type: "success" | "error" | "warning", message: string) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = products.length > 0 && products.every((product) => selected.includes(product.id));

  const pageStart = total === 0 ? 0 : (filters.page - 1) * filters.limit + 1;
  const pageEnd = Math.min(total, filters.page * filters.limit);
  const canPrevious = filters.page > 1;
  const canNext = pageEnd < total;

  function updateFilters(next: Partial<ProductFilters>) {
    onFilters({ ...filters, ...next, page: next.page ?? 1 });
  }

  function toggleSelected(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function bulkStatus(active: boolean) {
    await Promise.all(selected.map((id) => fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: active })
    })));
    toast("success", active ? "Selected products activated ✅" : "Selected products deactivated ✅");
    setSelected([]);
    onRefresh();
  }

  async function bulkDelete() {
    await Promise.all(selected.map((id) => fetch(`/api/admin/products/${id}`, { method: "DELETE" })));
    toast("success", "Product deleted ✅");
    setSelected([]);
    onRefresh();
  }

  async function toggleStatus(product: AdminProduct) {
    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !product.is_active })
    });
    if (!response.ok) return toast("error", "Could not update product ❌");
    onRefresh();
  }

  return (
    <section>
      <div className="grid gap-4 border border-[rgba(201,168,76,0.15)] bg-surface p-4 lg:grid-cols-[1fr_180px_160px_180px_auto]">
        <input
          value={filters.search}
          onChange={(event) => updateFilters({ search: event.target.value })}
          placeholder="Search by name"
          className="border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none transition focus:border-gold"
        />
        <select value={filters.category} onChange={(event) => updateFilters({ category: event.target.value })} className="border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary">
          <option value="all">All</option>
          <option value="tops">Tops</option>
          <option value="bottoms">Bottoms</option>
          <option value="dresses">Dresses</option>
          <option value="outerwear">Outerwear</option>
          <option value="accessories">Accessories</option>
        </select>
        <select value={filters.status} onChange={(event) => updateFilters({ status: event.target.value })} className="border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value })} className="border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price_high">Price High</option>
          <option value="price_low">Price Low</option>
          <option value="most_stock">Most Stock</option>
          <option value="least_stock">Least Stock</option>
        </select>
        <button onClick={() => onFilters({ search: "", category: "all", status: "all", sort: "newest", page: 1, limit: filters.limit })} className="text-sm text-muted hover:text-gold">
          Reset Filters
        </button>
      </div>

      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-4 flex flex-wrap items-center gap-3 border border-[rgba(201,168,76,0.2)] bg-card p-4">
            <span className="text-sm text-gold">{selected.length} selected</span>
            <button onClick={() => void bulkStatus(true)} className="border border-gold px-4 py-2 text-sm text-gold">Activate Selected</button>
            <button onClick={() => void bulkStatus(false)} className="border border-gold px-4 py-2 text-sm text-gold">Deactivate Selected</button>
            <button onClick={() => void bulkDelete()} className="bg-danger px-4 py-2 text-sm text-primary">Delete Selected</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 overflow-x-auto border border-[rgba(201,168,76,0.15)] bg-surface">
        {products.length === 0 && !loading ? (
          <div className="grid min-h-96 place-items-center text-center">
            <div>
              <ShoppingBag className="mx-auto text-gold" size={56} />
              <h2 className="mt-5 font-display text-4xl text-primary">No products yet</h2>
              <p className="mt-2 text-muted">Add your first product to get started</p>
              <button onClick={onAdd} className="mt-6 bg-gold px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-bg">+ Add Product</button>
            </div>
          </div>
        ) : (
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="border-b border-[rgba(201,168,76,0.15)] text-xs uppercase tracking-[0.16em] text-muted">
              <tr>
                <th className="p-4"><input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : products.map((product) => product.id))} className="accent-gold" /></th>
                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Price</th>
                <th className="p-4">Sizes</th>
                <th className="p-4">Colors</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.025 }}
                  className="border-b border-[rgba(201,168,76,0.08)] transition hover:bg-[rgba(201,168,76,0.06)]"
                >
                  <td className="p-4"><input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelected(product.id)} className="accent-gold" /></td>
                  <td className="p-4">
                    <div className="relative h-[50px] w-[50px] overflow-hidden rounded bg-card">
                      {product.images?.[0] && <Image src={product.images[0]} alt={product.name} fill className="object-cover" />}
                    </div>
                  </td>
                  <td className="p-4"><p className="text-primary">{product.name}</p><p className="text-xs text-muted">{labelize(product.category)}</p></td>
                  <td className="p-4">
                    {product.sale_price ? <p><span className="text-gold">₹{Number(product.sale_price).toLocaleString("en-IN")}</span><br /><span className="text-xs text-muted line-through">₹{Number(product.price).toLocaleString("en-IN")}</span></p> : <span className="text-gold">₹{Number(product.price).toLocaleString("en-IN")}</span>}
                  </td>
                  <td className="p-4"><div className="flex flex-wrap gap-1">{product.sizes?.map((size) => <span key={size} className="border border-[rgba(201,168,76,0.2)] px-2 py-1 text-xs text-primary/78">{size}</span>)}</div></td>
                  <td className="p-4"><div className="flex gap-1">{product.colors?.map((color) => <span key={color} className="h-4 w-4 rounded-full border border-white/20" style={{ background: color }} />)}</div></td>
                  <td className={`p-4 ${Number(product.stock ?? 0) < 5 ? "text-danger" : "text-primary/80"}`}>{product.stock ?? 0}</td>
                  <td className="p-4">
                    <button onClick={() => void toggleStatus(product)} className={`border px-3 py-1 text-xs ${product.is_active ? "border-emerald-500/40 text-emerald-300" : "border-red-500/40 text-red-300"}`}>
                      {product.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(product)} className="text-gold"><Edit3 size={17} /></button>
                      <button onClick={() => onDelete(product)} className="text-danger"><Trash2 size={17} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
        <div className="flex items-center gap-2">
          Show
          <select value={filters.limit} onChange={(event) => onFilters({ ...filters, limit: Number(event.target.value), page: 1 })} className="border border-[rgba(201,168,76,0.2)] bg-bg p-2 text-primary">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          per page
        </div>
        <p>Showing {pageStart} to {pageEnd} of {total} products</p>
        <div className="flex gap-2">
          <button disabled={!canPrevious} onClick={() => onFilters({ ...filters, page: filters.page - 1 })} className="border border-[rgba(201,168,76,0.2)] px-4 py-2 text-primary disabled:opacity-40">Previous</button>
          <button disabled={!canNext} onClick={() => onFilters({ ...filters, page: filters.page + 1 })} className="border border-[rgba(201,168,76,0.2)] px-4 py-2 text-primary disabled:opacity-40">Next</button>
        </div>
      </div>
    </section>
  );
}

function labelize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
