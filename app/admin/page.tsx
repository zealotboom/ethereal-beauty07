"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, Boxes, Package, ReceiptText, TrendingUp, Users } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";

type Stats = { revenue: number; orders: number; customers: number; products: number };
type RecentOrder = { id: string; total: number | null; status: string | null; created_at: string | null };

const bars = [32, 58, 44, 72, 61, 85, 70, 94, 78, 100, 88, 95];
const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];

export default function AdminDashboard() {
  const [stats,        setStats]        = useState<Stats>({ revenue:0, orders:0, customers:0, products:0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    async function load() {
      if (!hasSupabaseBrowserEnv()) { setLoading(false); return; }
      const sb = createClient();
      const [orders, customers, products] = await Promise.all([
        sb.from("orders").select("id,total,status,created_at").order("created_at", { ascending:false }),
        sb.from("profiles").select("id", { count:"exact" }),
        sb.from("products").select("id", { count:"exact" }),
      ]);
      const allOrders = (orders.data ?? []) as RecentOrder[];
      setStats({
        revenue:   allOrders.reduce((s, o) => s + Number(o.total ?? 0), 0),
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
    { label:"Revenue",   value:`₹${stats.revenue.toLocaleString("en-IN")}`, icon:<TrendingUp size={18}/>, color:"bg-blue-50 text-blue-600" },
    { label:"Orders",    value:stats.orders,    icon:<ReceiptText size={18}/>, color:"bg-amber-50 text-amber-600" },
    { label:"Customers", value:stats.customers, icon:<Users size={18}/>,       color:"bg-green-50 text-green-600" },
    { label:"Products",  value:stats.products,  icon:<Boxes size={18}/>,       color:"bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <AdminSidebar active="dashboard" />

          <section>
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500 mt-0.5">Welcome back, here&apos;s what&apos;s happening today</p>
                </div>
                <Link href="/admin/products" className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2">
                  <Package size={15} /> Add Product
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statCards.map((s, i) => (
                  <motion.div key={s.label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                    className="card p-5">
                    <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 ${s.color}`}>
                      {s.icon}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{loading ? "—" : s.value}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="card p-5 md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900">Revenue Overview</h2>
                    <span className="text-xs text-gray-400">Last 12 months</span>
                  </div>
                  <div className="flex items-end gap-1 h-32">
                    {bars.map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                          initial={{scaleY:0}} animate={{scaleY:1}}
                          transition={{delay: 0.1 + i*0.04, duration:0.4}}
                          style={{height:`${h * 0.28}rem`, transformOrigin:"bottom"}}
                          className="w-full rounded-t bg-[#1a6b8a]/20 hover:bg-[#1a6b8a] transition-colors cursor-default"
                        />
                        <span className="text-[9px] text-gray-400">{months[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="card p-5">
                  <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid gap-2">
                    {[
                      { href:"/admin/products", label:"Manage Products", icon:"🏷️" },
                      { href:"/admin/orders",   label:"View Orders",    icon:"📦" },
                      { href:"/admin/users",    label:"Manage Users",   icon:"👥" },
                      { href:"/admin/promos",   label:"Promos & Deals", icon:"🎁" },
                    ].map((a) => (
                      <Link key={a.href} href={a.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1a6b8a] transition">
                        <span>{a.icon}</span>{a.label}
                        <span className="ml-auto text-gray-300">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="card mt-6 overflow-hidden">
                <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                  <Link href="/admin/orders" className="text-sm text-[#1a6b8a] hover:underline">View All</Link>
                </div>
                {loading ? (
                  <div className="px-5 py-8 text-center text-sm text-gray-400">Loading orders…</div>
                ) : recentOrders.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-gray-400">No orders yet</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {recentOrders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-sm font-mono font-medium text-gray-800">#{o.id.slice(0,8)}</p>
                          <p className="text-xs text-gray-400">{o.created_at?.split("T")[0]}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            o.status === "paid" ? "bg-green-50 text-green-700" :
                            o.status === "pending" ? "bg-amber-50 text-amber-700" :
                            "bg-gray-50 text-gray-600"
                          }`}>{o.status ?? "pending"}</span>
                          <span className="text-sm font-semibold text-gray-900">
                            ₹{Number(o.total ?? 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
}
