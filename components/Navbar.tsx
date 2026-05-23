"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  Crown,
  Heart,
  LogOut,
  Package,
  Palette,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  Tags,
  UserRound,
  Users,
  Waves,
} from "lucide-react";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";
import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";

const navLinks = [
  ["Home",      "/"],
  ["Shop",      "/shop"],
  ["Style Me",  "/style-me"],
  ["Find This", "/find-this"],
];

type Profile = { name: string | null; avatar_url: string | null; role: string | null };

export default function Navbar() {
  const count  = useCartStore((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
  const router = useRouter();

  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // fetch user + profile once
  useEffect(() => {
    if (!hasSupabaseBrowserEnv()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUserEmail(data.user.email ?? "");
      supabase.from("profiles").select("name,avatar_url,role").eq("id", data.user.id).maybeSingle()
        .then(({ data: p }) => p && setProfile(p as Profile));
    });
  }, []);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // scroll detection for background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function signOut() {
    setOpen(false);
    if (hasSupabaseBrowserEnv()) await createClient().auth.signOut();
    router.push("/");
  }

  const isAdmin = profile?.role === "admin";
  const initials = (profile?.name ?? userEmail).charAt(0).toUpperCase() || "E";

  return (
    <header
      className={`sticky top-0 z-50 border-b border-[rgba(0,180,216,0.15)] transition-all duration-500 ${
        scrolled
          ? "bg-[rgba(4,12,24,0.94)] backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,100,160,0.18)]"
          : "bg-[rgba(4,12,24,0.7)] backdrop-blur-xl"
      }`}
    >
      {/* ocean shimmer line at very top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00b4d8] to-transparent opacity-60" />

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Waves size={20} className="text-[#00b4d8] transition group-hover:scale-110" />
          <span className="font-display text-2xl text-gold">Ethereal Beauty</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-7 text-sm text-primary/75 md:flex">
          {navLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="relative py-1 transition hover:text-[#00b4d8] after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#00b4d8] after:transition-all hover:after:w-full"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative grid h-10 w-10 place-items-center border border-[rgba(0,180,216,0.2)] text-primary transition hover:border-[#00b4d8] hover:text-[#00b4d8]"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[#00b4d8] px-1 text-xs font-bold text-bg">
                {count}
              </span>
            )}
          </Link>

          {/* Avatar / dropdown trigger */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Profile menu"
              className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border-2 border-[rgba(0,180,216,0.3)] bg-card text-sm font-bold text-[#00b4d8] transition hover:border-[#00b4d8] hover:shadow-[0_0_16px_rgba(0,180,216,0.4)]"
            >
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
              {isAdmin && (
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-gold text-bg">
                  <Crown size={9} />
                </span>
              )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: -8 }}
                  animate={{ opacity: 1, scale: 1,    y: 0  }}
                  exit ={{ opacity: 0, scale: 0.94, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute right-0 top-12 w-64 origin-top-right border border-[rgba(0,180,216,0.18)] bg-[rgba(4,12,24,0.96)] shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
                >
                  {/* User info header */}
                  {userEmail && (
                    <div className="border-b border-[rgba(0,180,216,0.12)] px-4 py-3">
                      <p className="text-xs font-semibold text-[#00b4d8] uppercase tracking-widest">
                        {isAdmin ? "Administrator" : "Member"}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-primary/70">{userEmail}</p>
                    </div>
                  )}

                  <div className="py-1">
                    <DropItem href="/profile"   icon={<UserRound size={15} />}  onClick={() => setOpen(false)}>My Profile</DropItem>
                    <DropItem href="/profile"   icon={<Package size={15} />}    onClick={() => setOpen(false)}>My Orders</DropItem>
                    <DropItem href="/profile"   icon={<Heart size={15} />}      onClick={() => setOpen(false)}>Wishlist</DropItem>
                    <DropItem href="/style-me"  icon={<Sparkles size={15} />}   onClick={() => setOpen(false)}>Style Me</DropItem>

                    {/* Admin section */}
                    {isAdmin && (
                      <>
                        <div className="my-1 border-t border-[rgba(201,168,76,0.15)]" />
                        <p className="px-4 py-1 text-[10px] uppercase tracking-[0.2em] text-gold/60">Admin Console</p>
                        <DropItem href="/admin"            icon={<BarChart3 size={15} />}    onClick={() => setOpen(false)} gold>Dashboard</DropItem>
                        <DropItem href="/admin/products"   icon={<Boxes size={15} />}         onClick={() => setOpen(false)} gold>Products</DropItem>
                        <DropItem href="/admin/orders"     icon={<ReceiptText size={15} />}   onClick={() => setOpen(false)} gold>Orders</DropItem>
                        <DropItem href="/admin/users"      icon={<Users size={15} />}         onClick={() => setOpen(false)} gold>Users</DropItem>
                        <DropItem href="/admin/appearance" icon={<Palette size={15} />}       onClick={() => setOpen(false)} gold>Appearance</DropItem>
                        <DropItem href="/admin/promos"     icon={<Tags size={15} />}          onClick={() => setOpen(false)} gold>Promos</DropItem>
                      </>
                    )}

                    <div className="my-1 border-t border-[rgba(0,180,216,0.1)]" />
                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </header>
  );
}

function DropItem({
  href, icon, onClick, gold, children,
}: {
  href: string; icon: React.ReactNode; onClick: () => void; gold?: boolean; children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${
        gold
          ? "text-gold hover:bg-gold/10 hover:text-gold-light"
          : "text-primary/80 hover:bg-[rgba(0,180,216,0.08)] hover:text-[#00b4d8]"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
