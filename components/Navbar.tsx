"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";

// Ocean creature icons as inline SVGs
const FishIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 12C2 12 6 6 12 6C16 6 20 9 22 12C20 15 16 18 12 18C6 18 2 12 2 12Z" opacity="0.8"/>
    <circle cx="10" cy="11" r="1.5" fill="white"/>
    <path d="M22 12L19 8V16L22 12Z"/>
  </svg>
);
const JellyfishIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3C8 3 5 6 5 9C5 10 5.5 11 6 12L5 20H8L9 15H10L9 20H12L12 15H12L12 20H15L14 15H15L16 20H19L18 12C18.5 11 19 10 19 9C19 6 16 3 12 3Z" opacity="0.85"/>
  </svg>
);
const OctopusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="9" rx="6" ry="5" opacity="0.9"/>
    <path d="M6 13C5 16 4 18 5 20M8 14C7.5 17 7 19 8 21M10 14.5C10 17.5 10 19.5 11 21M12 14.5C12 17.5 12 19.5 12 21M14 14.5C14 17.5 14 19.5 13 21M16 14C16.5 17 17 19 16 21M18 13C19 16 20 18 19 20" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="10" cy="8" r="1" fill="white"/>
    <circle cx="14" cy="8" r="1" fill="white"/>
  </svg>
);
const ShellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3C7 3 3 7.5 3 12C3 16.5 7 21 12 21C17 21 21 16.5 21 12C21 7.5 17 3 12 3ZM12 5C14 5 16 6 17.5 8L12 12L6.5 8C8 6 10 5 12 5ZM5 12C5 10.5 5.5 9 6.5 8L12 12V19C8 19 5 15.5 5 12Z" opacity="0.85"/>
  </svg>
);
const CoralIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 20V14M12 14C12 14 8 12 8 8C8 5 10 3 12 3C14 3 16 5 16 8C16 12 12 14 12 14ZM12 14L9 17M12 14L15 17" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
);
const StarfishIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L13.5 8.5L20 7L15.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L8.5 12L4 7L10.5 8.5Z" opacity="0.85"/>
  </svg>
);
const WhaleSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="11" cy="12" rx="8" ry="5" opacity="0.85"/>
    <path d="M19 9C21 7 23 8 22 12C23 16 21 17 19 15Z" opacity="0.7"/>
    <circle cx="6" cy="11" r="1" fill="white"/>
  </svg>
);
const PearlIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="8" opacity="0.6"/>
    <circle cx="10" cy="10" r="2" fill="white" opacity="0.8"/>
    <circle cx="9" cy="9" r="0.8" fill="white"/>
  </svg>
);

const navLinks = [
  ["Home",       "/"],
  ["Shop",       "/shop"],
  ["Jewellery",  "/shop?category=jewellery"],
  ["Style Me",   "/style-me"],
  ["Find This",  "/find-this"],
];

type Profile = { name: string | null; avatar_url: string | null; role: string | null };

export default function Navbar() {
  const count    = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const router   = useRouter();
  const pathname = usePathname();

  const [profile,   setProfile]   = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [open,      setOpen]      = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const [ripples,   setRipples]   = useState<{ id: number; x: number; y: number }[]>([]);
  const dropRef  = useRef<HTMLDivElement>(null);
  const rippleId = useRef(0);

  // fetch session + profile
  useEffect(() => {
    if (!hasSupabaseBrowserEnv()) return;
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUserEmail(data.user.email ?? "");
      sb.from("profiles").select("name,avatar_url,role").eq("id", data.user.id).maybeSingle()
        .then(({ data: p }) => p && setProfile(p as Profile));
    });

    // listen for auth state changes so profile updates after sign-in
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email ?? "");
        sb.from("profiles").select("name,avatar_url,role").eq("id", session.user.id).maybeSingle()
          .then(({ data: p }) => p && setProfile(p as Profile));
      } else {
        setProfile(null);
        setUserEmail("");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // scroll blur effect
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // water ripple on nav click
  function spawnRipple(e: React.MouseEvent) {
    const id = rippleId.current++;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 700);
  }

  async function signOut() {
    setOpen(false);
    setOpen(false);
    if (hasSupabaseBrowserEnv()) {
      await createClient().auth.signOut({ scope: "local" });
    }
    setProfile(null);
    setUserEmail("");
    router.refresh();
    router.push("/auth");
  }

  const isAdmin  = profile?.role === "admin";
  const initials = (profile?.name ?? userEmail).charAt(0).toUpperCase() || "E";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[rgba(2,8,18,0.96)] shadow-[0_4px_40px_rgba(0,100,160,0.25)] backdrop-blur-2xl"
          : "bg-[rgba(2,8,18,0.75)] backdrop-blur-xl"
      }`}
    >
      {/* animated shimmer top border */}
      <motion.div
        className="h-[2px] w-full"
        style={{
          background: "linear-gradient(90deg, transparent, #00b4d8, #90e0ef, #C9A84C, #00b4d8, transparent)",
          backgroundSize: "300% 100%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      <nav
        className="relative mx-auto flex max-w-7xl items-center justify-between overflow-hidden px-4 py-3 sm:px-6 lg:px-8"
        onClick={spawnRipple}
      >
        {/* ripple effects */}
        {ripples.map((rp) => (
          <motion.span
            key={rp.id}
            className="pointer-events-none absolute rounded-full bg-[rgba(0,180,216,0.12)]"
            style={{ left: rp.x - 10, top: rp.y - 10, width: 20, height: 20 }}
            animate={{ scale: 12, opacity: [0.6, 0] }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        ))}

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="text-[#00b4d8]"
          >
            <WhaleSmall />
          </motion.div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-xl text-[#E8F4F8] group-hover:text-[#00b4d8] transition">
              Ethereal
            </span>
            <span className="font-display text-xs tracking-[0.25em] text-gold">BEAUTY</span>
          </div>
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(([label, href]) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href.split("?")[0]));
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 text-sm transition ${
                  active ? "text-[#00b4d8]" : "text-[#E8F4F8]/70 hover:text-[#00b4d8]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-[rgba(0,180,216,0.1)] border border-[rgba(0,180,216,0.2)]"
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative grid h-9 w-9 place-items-center rounded-full border border-[rgba(0,180,216,0.2)] text-[#E8F4F8]/80 transition hover:border-[#00b4d8] hover:bg-[rgba(0,180,216,0.08)] hover:text-[#00b4d8]"
          >
            <ShellIcon />
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#00b4d8] px-0.5 text-[10px] font-bold text-bg"
              >
                {count}
              </motion.span>
            )}
          </Link>

          {/* Avatar */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Profile"
              className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border-2 border-[rgba(0,180,216,0.3)] bg-[#0d1829] text-sm font-bold text-[#00b4d8] transition hover:border-[#00b4d8] hover:shadow-[0_0_20px_rgba(0,180,216,0.5)]"
            >
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
              {isAdmin && (
                <span className="absolute -right-0.5 -top-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-gold text-[8px] text-bg">
                  ★
                </span>
              )}
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.93, y: -6 }}
                  animate={{ opacity: 1, scale: 1,    y: 0 }}
                  exit ={{ opacity: 0, scale: 0.93, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-11 w-60 origin-top-right overflow-hidden border border-[rgba(0,180,216,0.18)] bg-[rgba(2,8,18,0.97)] shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
                >
                  {userEmail && (
                    <div className="border-b border-[rgba(0,180,216,0.1)] px-4 py-3">
                      <p className="text-[10px] uppercase tracking-widest text-[#00b4d8]">
                        {isAdmin ? "🌊 Administrator" : "✦ Member"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#E8F4F8]/60">{userEmail}</p>
                    </div>
                  )}

                  <div className="py-1">
                    <DI href="/profile"   icon={<FishIcon />}      onClick={() => setOpen(false)}>My Profile</DI>
                    <DI href="/profile"   icon={<CoralIcon />}     onClick={() => setOpen(false)}>My Orders</DI>
                    <DI href="/profile"   icon={<StarfishIcon />}  onClick={() => setOpen(false)}>Wishlist</DI>
                    <DI href="/style-me"  icon={<JellyfishIcon />} onClick={() => setOpen(false)}>Style Me</DI>

                    {isAdmin && (
                      <>
                        <div className="my-1 border-t border-[rgba(201,168,76,0.12)]" />
                        <p className="px-4 py-1 text-[9px] uppercase tracking-[0.22em] text-gold/50">Admin</p>
                        <DI href="/admin"            icon={<OctopusIcon />}   onClick={() => setOpen(false)} gold>Dashboard</DI>
                        <DI href="/admin/products"   icon={<CoralIcon />}     onClick={() => setOpen(false)} gold>Products</DI>
                        <DI href="/admin/orders"     icon={<ShellIcon />}     onClick={() => setOpen(false)} gold>Orders</DI>
                        <DI href="/admin/users"      icon={<StarfishIcon />}  onClick={() => setOpen(false)} gold>Users</DI>
                        <DI href="/admin/appearance" icon={<PearlIcon />}     onClick={() => setOpen(false)} gold>Appearance</DI>
                      </>
                    )}

                    <div className="my-1 border-t border-[rgba(0,180,216,0.08)]" />
                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <span>🚪</span> Sign Out
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

function DI({ href, icon, onClick, gold, children }: {
  href: string; icon: React.ReactNode; onClick: () => void; gold?: boolean; children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${
        gold
          ? "text-gold hover:bg-gold/8 hover:text-gold-light"
          : "text-[#E8F4F8]/75 hover:bg-[rgba(0,180,216,0.07)] hover:text-[#00b4d8]"
      }`}
    >
      {icon} {children}
    </Link>
  );
}
