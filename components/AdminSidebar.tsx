"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  Crown,
  Palette,
  ReceiptText,
  Store,
  Tags,
  Users,
  Waves,
} from "lucide-react";

const items = [
  { label: "Dashboard",  href: "/admin",            icon: BarChart3,    key: "dashboard"   },
  { label: "Products",   href: "/admin/products",   icon: Boxes,        key: "products"    },
  { label: "Orders",     href: "/admin/orders",     icon: ReceiptText,  key: "orders"      },
  { label: "Users",      href: "/admin/users",      icon: Users,        key: "users"       },
  { label: "Appearance", href: "/admin/appearance", icon: Palette,      key: "appearance"  },
  { label: "Promos",     href: "/admin/promos",     icon: Tags,         key: "promos"      },
];

export default function AdminSidebar({ active }: { active?: string }) {
  const pathname = usePathname();

  const isActive = (key: string, href: string) =>
    active === key || pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <aside className="relative overflow-hidden border border-[rgba(0,180,216,0.18)] bg-[rgba(4,12,24,0.9)] p-5 backdrop-blur-xl">
      {/* ocean shimmer top */}
      <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#00b4d8] to-transparent opacity-70" />

      {/* brand */}
      <div className="mb-7 flex items-center gap-2">
        <Waves size={18} className="text-[#00b4d8]" />
        <div>
          <p className="font-display text-xl text-[#E8F4F8]">Ethereal Beauty</p>
          <div className="flex items-center gap-1">
            <Crown size={10} className="text-gold" />
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold/70">Admin Console</p>
          </div>
        </div>
      </div>

      <nav className="grid gap-1">
        {items.map(({ label, href, icon: Icon, key }) => {
          const active = isActive(key, href);
          return (
            <Link key={href} href={href} className="relative">
              {active && (
                <motion.span
                  layoutId="admin-active"
                  className="absolute inset-0 border-l-2 border-[#00b4d8] bg-[rgba(0,180,216,0.08)]"
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                />
              )}
              <span
                className={`relative flex items-center gap-3 px-3 py-3 text-sm transition ${
                  active
                    ? "text-[#00b4d8]"
                    : "text-[#5a7a8a] hover:text-[#90e0ef]"
                }`}
              >
                <Icon size={16} />
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-[rgba(0,180,216,0.1)] pt-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-[#5a7a8a] transition hover:text-[#00b4d8]"
        >
          <Store size={15} />
          Back to Store
        </Link>
      </div>
    </aside>
  );
}
