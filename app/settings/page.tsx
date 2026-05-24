"use client";

import SettingsSidebar from "@/components/SettingsSidebar";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="flex min-h-[calc(100vh-130px)] bg-[#f8f7f5]">
      <SettingsSidebar active="Profile" />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {[
            { title: "Profile", desc: "Edit your name, bio, and avatar", href: "/settings/profile", icon: "👤" },
            { title: "Privacy", desc: "Manage data and visibility", href: "/settings/privacy", icon: "🔒" },
            { title: "Notifications", desc: "Emails and push alerts", href: "/settings/notifications", icon: "🔔" },
            { title: "Payment", desc: "Cards and billing", href: "/settings/payment", icon: "💳" },
            { title: "Addresses", desc: "Saved delivery locations", href: "/settings/addresses", icon: "📍" },
            { title: "Size Profile", desc: "For better recommendations", href: "/settings/sizes", icon: "📏" },
          ].map((s) => (
            <Link key={s.href} href={s.href} className="card p-5 flex gap-4 items-start hover:border-[#1a6b8a] hover:shadow-sm transition group">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-[#1a6b8a] transition">{s.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
