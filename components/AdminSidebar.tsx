"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3, Boxes, Palette, ReceiptText, Tags, Users,
} from "lucide-react";

const items = [
  { label: "Dashboard",  href: "/admin",            icon: BarChart3,   key: "dashboard"  },
  { label: "Products",   href: "/admin/products",   icon: Boxes,       key: "products"   },
  { label: "Orders",     href: "/admin/orders",     icon: ReceiptText, key: "orders"     },
  { label: "Users",      href: "/admin/users",      icon: Users,       key: "users"      },
  { label: "Appearance", href: "/admin/appearance", icon: Palette,     key: "appearance" },
  { label: "Promos",     href: "/admin/promos",     icon: Tags,        key: "promos"     },
];

export default function AdminSidebar({ active }: { active?: string }) {
  const pathname = usePathname();
  const isActive = (key: string, href: string) =>
    active === key || pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <aside className="border border-gray-100 bg-white rounded-xl p-4 self-start sticky top-24">
      <div className="mb-5 px-2">
        <p className="font-bold text-base text-gray-900">Ethereal Beauty</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="admin-badge">Admin Console</span>
        </div>
      </div>

      <nav className="grid gap-0.5">
        {items.map(({ label, href, icon: Icon, key }) => {
          const act = isActive(key, href);
          return (
            <Link key={href} href={href} className="relative">
              {act && (
                <motion.span
                  layoutId="admin-active"
                  className="absolute inset-0 rounded-lg bg-[rgba(26,107,138,0.08)] border-l-2 border-[#1a6b8a]"
                  transition={{ duration: 0.2 }}
                />
              )}
              <span className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                act ? "text-[#1a6b8a] font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}>
                <Icon size={16} />
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-600 transition rounded-lg hover:bg-gray-50">
          <span>←</span> Back to Site
        </Link>
      </div>
    </aside>
  );
}
