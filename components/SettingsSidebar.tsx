"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SETTINGS_ITEMS = [
  {
    group: "Account",
    items: [
      { icon: "👤", label: "Profile",         href: "/settings/profile" },
      { icon: "🔒", label: "Privacy",          href: "/settings/privacy" },
      { icon: "🔔", label: "Notifications",    href: "/settings/notifications" },
      { icon: "💳", label: "Payment Methods",  href: "/settings/payment" },
      { icon: "📍", label: "Addresses",        href: "/settings/addresses" },
    ],
  },
  {
    group: "Orders",
    items: [
      { icon: "📦", label: "My Orders",        href: "/profile?tab=orders" },
      { icon: "↩️", label: "Returns",          href: "/settings/returns" },
      { icon: "⭐", label: "Reviews",           href: "/settings/reviews" },
    ],
  },
  {
    group: "Preferences",
    items: [
      { icon: "🎨", label: "Theme",            href: "/settings/theme" },
      { icon: "🌐", label: "Language",         href: "/settings/language" },
      { icon: "📏", label: "Size Profile",     href: "/settings/sizes" },
    ],
  },
  {
    group: "Support",
    items: [
      { icon: "💬", label: "Help & FAQ",       href: "/help" },
      { icon: "📞", label: "Contact Us",       href: "/contact" },
      { icon: "📜", label: "Policies",         href: "/policies" },
    ],
  },
];

export default function SettingsSidebar({ active }: { active?: string }) {
  const pathname = usePathname();

  return (
    <aside className="settings-sidebar shrink-0">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Settings</p>
      </div>
      {SETTINGS_ITEMS.map((group) => (
        <div key={group.group}>
          <p className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {group.group}
          </p>
          {group.items.map((item) => {
            const isActive = active === item.label || pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item ${isActive ? "active" : ""}`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
