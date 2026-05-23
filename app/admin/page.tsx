"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  Crown,
  Package,
  Plus,
  ReceiptText,
  TrendingUp,
  Users,
  Waves,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";

type Stats = {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
};

type RecentOrder = {
  id: string;
  total: number | null;
  status: string | null;
  created_at: string | null;
};

const bars = [32, 58, 44, 72, 61, 85, 70, 94, 78, 100, 88, 95];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AdminDashboard() {
  const [stats,        setStats]        = useState<Stats>({ revenue: 0, orders: 0, customers: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    async function load() {
      if (!hasSupabaseBrowserEnv()) { setLoading(false); return; }
      const sb = createClient();
      const [orders, customers, products] = await Promise.all([
        sb.from("orders").select("id,total,status,created_at").order("created_at", { ascending: false }),
        sb.from("profiles").select("id", { count: "exact" }),
        sb.from("products").select("id", { count: "exact" }),
      ]);
      const allOrders = (orders.data ?? []) as RecentOrder[];
      const totalRevenue = allOrders.reduce((s, o) => s + Number(o.total ?? 0), 0);
      setStats({
        revenue:   totalRevenue,
        orders:    allOrders.length,
        customers: customers.count ?? 0,
        products:  products.count  ?? 0,
      });
      setRecentOrders(allOrders.slice(0, 8));
      setLoading(false);
    }
    void load();
  }, []);

  const statCards = [
    { label: "Total Revenue",  value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: <TrendingUp size={22} />, color: "from-[#00b4d8]/20 to-transparent", border: "border-[rgba(0,180,216,0.25)]" },
    { label: "Total Orders",   value: stats.orders,    icon: <ReceiptText size={22} />, color: "from-gold/15 to-transparent",        border: "border-[rgba(201,168,76,0.25)]" },
    { label: "Customers",      value: stats.customers, icon: <Users size={22} />,       color: "from-[#00b4d8]/15 to-transparent",   border: "border-[rgba(0,180,216,0.2)]" },
    { label: "Products",       value: stats.products,  icon: <Boxes size={22} />,       color: "from-gold/10 to-transparent",        border: "border-[rgba(201,168,76,0.2)]" },
  ];

  return (
    <div className="luxury-shell grid gap-8 lg:grid-cols-[260px_1fr]">
      <AdminSidebar active="dashboard" />

      <section>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <Crown size={20} className="text-gold" />
              <p className="text-xs uppercase tracking-[0.28em] text-gold">Admin Console</p>
            </div>
            <h1 className="font-display text-5xl text-[#E8F4F8]">Dashboard</h1>
          </div>
          <Link
            href="/admin/products"
            className="flex items-center gap-2 bg-[#00b4d8] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-bg shadow-[0_0_20px_rgba(0,180,216,0.3)] transition hover:bg-[#90e0ef]"
          >
            <Plus size={16} /> Add Product
          </Link>
        </motion.div>

        {/* Stat cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -4, boxShadow: "0 0 30px rgba(0,180,216,0.12)" }}
              className={`relative overflow-hidden border ${card.border} bg-[rgba(8,20,40,0.8)] p-5`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-60`} />
              <div className="relative">
                <div className="text-[#00b4d8]">{card.icon}</div>
                <p className="mt-3 font-display text-3xl text-[#E8F4F8]">
                  {loading ? <span className="animate-pulse text-[#5a7a8a]">—</span> : card.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#5a7a8a]">{card.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.55 }}
          className="mt-6 border border-[rgba(0,180,216,0.15)] bg-[rgba(8,20,40,0.8)] p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl text-[#E8F4F8]">Revenue Overview</h2>
            <div className="flex items-center gap-2 text-xs text-[#00b4d8]">
              <BarChart3 size={14} /> Last 12 months
            </div>
          </div>
          <div className="mt-6 flex h-52 items-end gap-2">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                className="group flex flex-1 flex-col items-center gap-1"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.5 + i * 0.04, duration: 0.45, ease: "easeOut" }}
                style={{ originY: 1 }}
              >
                <div
                  className="w-full rounded-sm bg-gradient-to-t from-[#0077b6] to-[#00b4d8] opacity-70 transition group-hover:opacity-100"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] text-[#5a7a8a] group-hover:text-[#00b4d8]">{months[i]}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.55 }}
          className="mt-6 border border-[rgba(0,180,216,0.15)] bg-[rgba(8,20,40,0.8)]"
        >
          <div className="flex items-center justify-between border-b border-[rgba(0,180,216,0.12)] px-6 py-4">
            <h2 className="font-display text-2xl text-[#E8F4F8]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-[#00b4d8] hover:text-[#90e0ef]">View all →</Link>
          </div>

          {loading ? (
            <div className="grid gap-3 p-6">
              {[1,2,3].map(n => (
                <div key={n} className="h-14 animate-pulse rounded bg-[rgba(0,180,216,0.05)]" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="grid place-items-center py-16 text-center">
              <Package size={40} className="text-[#5a7a8a]" />
              <p className="mt-3 font-display text-2xl text-[#E8F4F8]">No orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(0,180,216,0.08)]">
              {recentOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="flex items-center justify-between px-6 py-4 transition hover:bg-[rgba(0,180,216,0.04)]"
                >
                  <div>
                    <p className="text-sm text-[#00b4d8]">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-[#5a7a8a]">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString("en-IN")
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold text-[#E8F4F8]">
                      ₹{Number(order.total ?? 0).toLocaleString("en-IN")}
                    </p>
                    <StatusPill status={order.status ?? "pending"} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick action buttons */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Manage Products", href: "/admin/products", icon: <Boxes size={18} />, ocean: true  },
            { label: "View Orders",     href: "/admin/orders",   icon: <ReceiptText size={18} /> },
            { label: "Manage Users",    href: "/admin/users",    icon: <Users size={18} /> },
          ].map((btn) => (
            <Link
              key={btn.href}
              href={btn.href}
              className={`flex items-center justify-center gap-2 border px-5 py-4 text-sm uppercase tracking-[0.14em] transition ${
                btn.ocean
                  ? "border-[#00b4d8] bg-[#00b4d8] text-bg shadow-[0_0_20px_rgba(0,180,216,0.25)] hover:bg-[#90e0ef]"
                  : "border-[rgba(0,180,216,0.25)] text-[#00b4d8] hover:bg-[rgba(0,180,216,0.08)]"
              }`}
            >
              {btn.icon} {btn.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls =
    s === "delivered" || s === "paid"
      ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
      : s === "cancelled"
      ? "border-red-500/40 text-red-300 bg-red-500/10"
      : "border-amber-500/40 text-amber-300 bg-amber-500/10";
  return (
    <span className={`border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${cls}`}>
      {status}
    </span>
  );
}
