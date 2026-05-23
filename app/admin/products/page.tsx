"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import AddProductModal from "@/components/admin/AddProductModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import EditProductModal from "@/components/admin/EditProductModal";
import ProductsTable, { type AdminProduct, type ProductFilters } from "@/components/admin/ProductsTable";
import { ToastViewport, useToast } from "@/components/ui/Toast";

const initialFilters: ProductFilters = {
  search: "",
  category: "all",
  status: "all",
  sort: "newest",
  page: 1,
  limit: 10
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toasts, toast } = useToast();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      search: filters.search,
      category: filters.category,
      status: filters.status,
      sort: filters.sort,
      page: String(filters.page),
      limit: String(filters.limit)
    });

    try {
      const response = await fetch(`/api/admin/products?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as { products?: AdminProduct[]; total?: number; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Failed");
      setProducts(payload.products ?? []);
      setTotal(payload.total ?? 0);
    } catch {
      toast("error", "Could not load products ❌");
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts();
    }, 180);
    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${deleting.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed");
      toast("success", "Product deleted ✅");
      setDeleting(null);
      await loadProducts();
    } catch {
      toast("error", "Could not delete product ❌");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="luxury-shell grid gap-8 lg:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-5xl text-primary">Products</h1>
            <p className="mt-2 text-sm text-muted">{total} total products</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="bg-gold px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-bg transition hover:bg-gold-light">
            + Add Product
          </button>
        </div>

        <div className="mt-8">
          <ProductsTable
            products={products}
            total={total}
            filters={filters}
            loading={loading}
            onFilters={setFilters}
            onAdd={() => setAddOpen(true)}
            onEdit={setEditing}
            onDelete={setDeleting}
            onRefresh={() => void loadProducts()}
            toast={toast}
          />
        </div>
      </motion.section>

      <AddProductModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={() => void loadProducts()} toast={toast} />
      <EditProductModal product={editing} open={Boolean(editing)} onClose={() => setEditing(null)} onUpdated={() => void loadProducts()} toast={toast} />
      <DeleteConfirmModal product={deleting} deleting={deleteLoading} onClose={() => setDeleting(null)} onConfirm={() => void confirmDelete()} />
      <ToastViewport toasts={toasts} />
      <style jsx global>{`
        .input-lux {
          width: 100%;
          border: 1px solid rgba(201, 168, 76, 0.2);
          background: #080808;
          padding: 0.75rem;
          color: #f0ede6;
          outline: none;
          transition: border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .input-lux:focus {
          border-color: #c9a84c;
        }
      `}</style>
    </div>
  );
}
