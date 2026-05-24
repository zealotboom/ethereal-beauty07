"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";

// Nav sections with sub-menus (Amazon-style)
const navSections = [
  {
    label: "Browse",
    value: "Home",
    href: "/",
    dropdown: null,
  },
  {
    label: "Explore",
    value: "Shop",
    href: "/shop",
    dropdown: [
      { label: "All Products", href: "/shop", desc: "Browse full catalog" },
      { label: "New Arrivals", href: "/shop?sort=new", desc: "Latest additions" },
      { label: "Sale Items", href: "/shop?filter=sale", desc: "Discounted picks" },
      { label: "Best Sellers", href: "/shop?sort=popular", desc: "Top choices" },
    ],
  },
  {
    label: "Fine",
    value: "Jewellery",
    href: "/shop?category=jewellery",
    dropdown: [
      { label: "Rings", href: "/shop?category=rings", desc: "Statement & everyday" },
      { label: "Necklaces", href: "/shop?category=necklaces", desc: "Chains & pendants" },
      { label: "Earrings", href: "/shop?category=earrings", desc: "Studs & drops" },
      { label: "Bracelets", href: "/shop?category=bracelets", desc: "Bangles & cuffs" },
      { label: "Anklets", href: "/shop?category=anklets", desc: "Dainty & bold" },
      { label: "Nose Pins", href: "/shop?category=nosepins", desc: "Traditional & modern" },
    ],
  },
  {
    label: "AI",
    value: "Style Me",
    href: "/style-me",
    dropdown: null,
  },
  {
    label: "Discover",
    value: "Find It",
    href: "/find-this",
    dropdown: null,
  },
];

type Profile = { name: string | null; avatar_url: string | null; role: string | null };

export default function Navbar() {
  const count    = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const router   = useRouter();
  const pathname = usePathname();

  const [profile,   setProfile]   = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [hovered,   setHovered]   = useState<number | null>(null);
  const [scrolled,  setScrolled]  = useState(false);
  const dropRef  = useRef<HTMLDivElement>(null);
  const megaRef  = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasSupabaseBrowserEnv()) return;
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUserEmail(data.user.email ?? "");
      sb.from("profiles").select("name,avatar_url,role").eq("id", data.user.id).maybeSingle()
        .then(({ data: p }) => p && setProfile(p as Profile));
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email ?? "");
        sb.from("profiles").select("name,avatar_url,role").eq("id", session.user.id).maybeSingle()
          .then(({ data: p }) => p && setProfile(p as Profile));
      } else { setProfile(null); setUserEmail(""); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  function handleNavEnter(idx: number) {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHovered(idx);
  }
  function handleNavLeave() {
    hoverTimeout.current = setTimeout(() => setHovered(null), 120);
  }
  function handleMegaEnter() {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  }

  async function signOut() {
    setMenuOpen(false);
    if (hasSupabaseBrowserEnv()) await createClient().auth.signOut({ scope: "local" });
    setProfile(null); setUserEmail("");
    router.refresh(); router.push("/auth");
  }

  const isAdmin  = profile?.role === "admin";
  const initials = (profile?.name ?? userEmail).charAt(0).toUpperCase() || "G";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled ? "shadow-[0_1px_8px_rgba(0,0,0,0.08)]" : ""
      } bg-white border-b border-[rgba(0,0,0,0.08)]`}
    >
      {/* Top bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-6">

          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none shrink-0">
            <span className="font-bold text-lg tracking-tight text-gray-900">Ethereal</span>
            <span className="text-[10px] tracking-[0.25em] text-[#b8862d] font-semibold uppercase">Beauty</span>
            <span className="pen-name" style={{fontSize:'10px'}}>Aryan Zealot</span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for clothing, jewellery, styles…"
                className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:border-[#1a6b8a] focus:ring-2 focus:ring-[rgba(26,107,138,0.12)] transition"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a6b8a]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span className="hidden sm:inline">Bag</span>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#1a6b8a] text-[10px] font-bold text-white px-0.5">
                  {count}
                </span>
              )}
            </Link>

            {/* Avatar / Profile */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Profile"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition"
              >
                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-gray-200 bg-gray-100 text-sm font-bold text-[#1a6b8a] flex items-center justify-center">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                  ) : initials}
                </div>
                {isAdmin && (
                  <span className="admin-badge hidden sm:inline">Admin</span>
                )}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 w-64 origin-top-right rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden"
                    style={{zIndex:100}}
                  >
                    {/* Account info */}
                    {userEmail ? (
                      <div className="border-b border-gray-100 px-4 py-3 bg-gray-50">
                        <p className="text-[11px] uppercase tracking-wider text-[#1a6b8a] font-semibold">
                          {isAdmin ? "★ Administrator" : "Member"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">{userEmail}</p>
                      </div>
                    ) : (
                      <div className="border-b border-gray-100 px-4 py-3">
                        <Link href="/auth" onClick={() => setMenuOpen(false)}
                          className="block text-center text-sm font-medium text-white bg-[#1a6b8a] rounded-lg py-2 hover:bg-[#0f4d6b] transition">
                          Sign In / Register
                        </Link>
                      </div>
                    )}

                    {/* Common menu items */}
                    <div className="py-1">
                      <MenuItem href="/profile" icon="👤" onClick={() => setMenuOpen(false)}>My Profile</MenuItem>
                      <MenuItem href="/profile" icon="📦" onClick={() => setMenuOpen(false)}>My Orders</MenuItem>
                      <MenuItem href="/profile" icon="❤️" onClick={() => setMenuOpen(false)}>Wishlist</MenuItem>
                      <MenuItem href="/style-me" icon="✨" onClick={() => setMenuOpen(false)}>Style Me AI</MenuItem>
                    </div>

                    {/* Admin-only section */}
                    {isAdmin && (
                      <>
                        <div className="border-t border-[#fde68a]/60 bg-[#fffbeb] px-4 py-1.5">
                          <p className="text-[10px] uppercase tracking-wider text-[#b8862d] font-bold">Admin Panel</p>
                        </div>
                        <div className="py-1 bg-[#fffbeb]/60">
                          <MenuItem href="/admin" icon="📊" onClick={() => setMenuOpen(false)} gold>Dashboard</MenuItem>
                          <MenuItem href="/admin/products" icon="🏷️" onClick={() => setMenuOpen(false)} gold>Products</MenuItem>
                          <MenuItem href="/admin/orders" icon="🧾" onClick={() => setMenuOpen(false)} gold>Orders</MenuItem>
                          <MenuItem href="/admin/users" icon="👥" onClick={() => setMenuOpen(false)} gold>Users</MenuItem>
                          <MenuItem href="/admin/appearance" icon="🎨" onClick={() => setMenuOpen(false)} gold>Appearance</MenuItem>
                        </div>
                      </>
                    )}

                    {userEmail && (
                      <div className="border-t border-gray-100">
                        <button
                          onClick={signOut}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                        >
                          🚪 Sign Out
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation bar (Amazon-style sections) */}
      <div className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-hide">
            {navSections.map((sec, idx) => {
              const active = pathname === sec.href || (sec.href !== "/" && pathname.startsWith(sec.href.split("?")[0]));
              return (
                <div
                  key={sec.href}
                  className="relative shrink-0"
                  onMouseEnter={() => sec.dropdown && handleNavEnter(idx)}
                  onMouseLeave={handleNavLeave}
                >
                  <Link
                    href={sec.href}
                    className={`nav-section ${active ? "active" : ""}`}
                  >
                    <span className="nav-label">{sec.label}</span>
                    <span className="nav-value">{sec.value}</span>
                    {sec.dropdown && <span className="nav-arrow">▾</span>}
                  </Link>

                  {/* Mega dropdown */}
                  <AnimatePresence>
                    {sec.dropdown && hovered === idx && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                        ref={megaRef}
                        onMouseEnter={handleMegaEnter}
                        onMouseLeave={handleNavLeave}
                        className="mega-menu absolute left-0 top-full mt-1 z-50 min-w-[220px] p-2"
                      >
                        {sec.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setHovered(null)}
                            className="flex flex-col gap-0.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                          >
                            <span className="text-sm font-medium text-gray-900">{item.label}</span>
                            <span className="text-xs text-gray-400">{item.desc}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 mx-2 shrink-0" />

            {/* Quick links */}
            <Link href="/shop?filter=sale" className="nav-section shrink-0">
              <span className="nav-label">Hot</span>
              <span className="nav-value" style={{color:"#c2410c"}}>Sale</span>
            </Link>
            <Link href="/shop?sort=new" className="nav-section shrink-0">
              <span className="nav-label">Just</span>
              <span className="nav-value">New In</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuItem({ href, icon, onClick, gold, children }: {
  href: string; icon: string; onClick: () => void; gold?: boolean; children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2 text-sm transition ${
        gold
          ? "text-[#b8862d] hover:bg-[#fef3c7]/50"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span className="text-base">{icon}</span>
      {children}
    </Link>
  );
}
