"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Heart,
  Loader2,
  Package,
  PenLine,
  ShoppingBag,
  Sparkles,
  UserRound,
  X
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";
import type { Product } from "@/lib/types";

type Profile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  role: string | null;
  phone?: string | null;
  address?: Address | null;
  style_dna: StyleDna | null;
  created_at: string | null;
};

type Address = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
};

type StyleDna = {
  style?: string;
  fit?: string;
  budget?: string;
  colors?: string;
  shoppingStyle?: string;
};

type Order = {
  id: string;
  total: number | null;
  status: string | null;
  items: unknown;
  created_at: string | null;
};

type WishlistRow = {
  id: string;
  product_id: string | null;
  products?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    sale_price: number | null;
    category: string | null;
    images: string[] | null;
    sizes: string[] | null;
    colors: string[] | null;
    stock: number | null;
    tags: string[] | null;
  } | null;
};

const tabs = ["My Info", "Orders", "Wishlist", "Style DNA", "Notifications"] as const;
type Tab = (typeof tabs)[number];

const editSchema = z.object({
  name: z.string().min(2, "Enter at least 2 characters."),
  phone: z.string().optional().refine((value) => !value || /^\d{10}$/.test(value), "Phone must be 10 digits.")
});

type EditForm = z.infer<typeof editSchema>;

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("My Info");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Array<{ rowId: string; product: Product }>>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  useEffect(() => {
    void loadProfile();
  }, []);

  useEffect(() => {
    reset({ name: profile?.name ?? "", phone: profile?.phone ?? "" });
    setAvatarPreview(profile?.avatar_url ?? null);
  }, [profile, reset]);

  async function loadProfile() {
    setLoading(true);
    setNotice("");

    if (!hasSupabaseBrowserEnv()) {
      setLoading(false);
      setNotice("Add Supabase env vars to load your private profile.");
      return;
    }

    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setLoading(false);
      setNotice("Sign in to view your profile.");
      return;
    }

    const user = userData.user;
    setUserEmail(user.email ?? "");

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    let nextProfile = existingProfile as Profile | null;

    if (!nextProfile) {
      const fallbackName = typeof user.user_metadata.name === "string" ? user.user_metadata.name : "";
      const { data: createdProfile } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          name: fallbackName || null,
          avatar_url: null,
          role: "user",
          style_dna: null
        })
        .select("*")
        .single();

      nextProfile = createdProfile as Profile | null;
    }

    const [{ data: orderData }, { data: wishlistData }] = await Promise.all([
      supabase.from("orders").select("id,total,status,items,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("wishlist_items").select("id,product_id,products(*)").eq("user_id", user.id)
    ]);

    setProfile(nextProfile);
    setOrders((orderData as Order[] | null) ?? []);
    setWishlist(((wishlistData as WishlistRow[] | null) ?? []).map(normalizeWishlistRow).filter(Boolean) as Array<{ rowId: string; product: Product }>);
    setLoading(false);
  }

  async function uploadAvatarToCloudinary() {
    if (!avatarFile) return profile?.avatar_url ?? null;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) return avatarPreview;

    const form = new FormData();
    form.set("file", avatarFile);
    form.set("upload_preset", uploadPreset);
    form.set("folder", "ethereal-beauty/avatars");

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: form
    });

    if (!response.ok) return avatarPreview;
    const payload = (await response.json()) as { secure_url?: string };
    return payload.secure_url ?? avatarPreview;
  }

  async function saveProfile(values: EditForm) {
    if (!profile || !hasSupabaseBrowserEnv()) return;
    setSaving(true);

    const avatarUrl = await uploadAvatarToCloudinary();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        name: values.name,
        phone: values.phone || null,
        avatar_url: avatarUrl
      })
      .eq("id", profile.id)
      .select("*")
      .single();

    setSaving(false);
    if (!error && data) {
      setProfile(data as Profile);
      setEditOpen(false);
      setAvatarFile(null);
    }
  }

  async function removeWishlistItem(rowId: string) {
    if (hasSupabaseBrowserEnv()) {
      const supabase = createClient();
      await supabase.from("wishlist_items").delete().eq("id", rowId);
    }
    setWishlist((current) => current.filter((item) => item.rowId !== rowId));
  }

  const displayName = profile?.name?.trim() || userEmail.split("@")[0] || "Ethereal Guest";
  const memberDate = profile?.created_at ? new Date(profile.created_at) : null;
  const memberSince = memberDate
    ? memberDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "Today";
  const orderItemCount = orders.reduce((sum, order) => sum + getItemsCount(order.items), 0);

  return (
    <motion.div className="luxury-shell" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      {loading ? (
        <div className="grid min-h-[55vh] place-items-center text-gold">
          <Loader2 className="animate-spin" size={34} />
        </div>
      ) : notice ? (
        <SignedOutState notice={notice} />
      ) : (
        <>
          <section className="relative overflow-hidden border border-[rgba(201,168,76,0.18)] bg-surface p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.18),transparent_35%),linear-gradient(135deg,rgba(201,168,76,0.08),transparent_45%)]" />
            <button onClick={() => setEditOpen(true)} className="absolute right-5 top-5 z-10 flex items-center gap-2 border border-gold px-4 py-3 text-sm text-gold transition hover:bg-gold hover:text-bg">
              <PenLine size={16} /> Edit Profile
            </button>
            <div className="relative grid gap-8 pt-12 lg:grid-cols-[1fr_1.15fr] lg:items-end lg:pt-0">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end">
                <Avatar name={displayName} src={profile?.avatar_url ?? avatarPreview} />
                <div>
                  <h1 className="font-display text-5xl text-primary">{displayName}</h1>
                  <p className="mt-2 text-sm text-muted">{userEmail}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="border border-gold bg-card px-3 py-1 text-xs uppercase tracking-[0.18em] text-gold">
                      {profile?.role === "admin" ? "Admin" : "User"}
                    </span>
                    <span className="text-sm text-muted">Member since {memberSince}</span>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard icon="📦" value={orders.length} label="Total Orders" />
                <StatCard icon="❤️" value={wishlist.length} label="Wishlist Items" />
                <StatCard icon="👑" value={memberDate?.getFullYear() ?? new Date().getFullYear()} label="Member Since" />
              </div>
            </div>
          </section>

          <section className="mt-8 border border-[rgba(201,168,76,0.18)] bg-surface">
            <div className="flex flex-wrap gap-1 border-b border-[rgba(201,168,76,0.15)] px-3 pt-3">
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className="relative px-4 py-4 text-sm text-primary/75 transition hover:text-gold">
                  {tab}
                  {activeTab === tab && <motion.span layoutId="profile-tab" className="absolute inset-x-3 bottom-0 h-px bg-gold" />}
                </button>
              ))}
            </div>
            <div className="p-5 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.3 }}>
                  {activeTab === "My Info" && <MyInfoTab profile={profile} email={userEmail} onEdit={() => setEditOpen(true)} />}
                  {activeTab === "Orders" && <OrdersTab orders={orders} itemCount={orderItemCount} />}
                  {activeTab === "Wishlist" && <WishlistTab items={wishlist} onRemove={removeWishlistItem} />}
                  {activeTab === "Style DNA" && <StyleDnaTab styleDna={profile?.style_dna ?? null} />}
                  {activeTab === "Notifications" && <NotificationsTab />}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        </>
      )}

      <EditProfileModal
        open={editOpen}
        profile={profile}
        avatarPreview={avatarPreview}
        saving={saving}
        errors={errors}
        register={register}
        onAvatar={(file) => {
          if (!file) return;
          setAvatarFile(file);
          setAvatarPreview(URL.createObjectURL(file));
        }}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSubmit(saveProfile)}
      />
    </motion.div>
  );
}

function Avatar({ name, src }: { name: string; src?: string | null }) {
  return (
    <div className="relative h-[120px] w-[120px] shrink-0">
      <motion.span
        className="absolute inset-0 rounded-full border border-gold"
        animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.18, 0.55] }}
        transition={{ repeat: Infinity, duration: 2.6 }}
      />
      <div className="relative grid h-full w-full place-items-center overflow-hidden rounded-full border-2 border-gold bg-card text-5xl font-semibold text-gold">
        {src ? <Image src={src} alt={name} fill className="object-cover" /> : name.charAt(0).toUpperCase()}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <motion.div whileHover={{ y: -4, boxShadow: "0 0 28px rgba(201,168,76,0.14)" }} className="border border-[rgba(201,168,76,0.18)] bg-card p-5">
      <p className="text-xl">{icon}</p>
      <p className="mt-3 text-3xl font-semibold text-gold"><CountUp value={value} /></p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </motion.div>
  );
}

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 700;
    let frame = 0;

    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(value * progress));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display}</>;
}

function MyInfoTab({ profile, email, onEdit }: { profile: Profile | null; email: string; onEdit: () => void }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <LuxuryCard title="Personal Details">
        <Detail label="Name" value={profile?.name || "Not set"} />
        <Detail label="Email" value={email || "Not available"} />
        <Detail label="Phone" value={profile?.phone || "Not set"} />
        <CardEditButton onClick={onEdit}>Edit</CardEditButton>
      </LuxuryCard>
      <LuxuryCard title="Delivery Address">
        {profile?.address ? (
          <p className="leading-7 text-primary/82">{formatAddress(profile.address)}</p>
        ) : (
          <div>
            <p className="text-muted">No address saved yet</p>
            <button onClick={onEdit} className="mt-5 bg-gold px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-bg">Add Address</button>
          </div>
        )}
        <CardEditButton onClick={onEdit}>Edit</CardEditButton>
      </LuxuryCard>
    </div>
  );
}

function OrdersTab({ orders }: { orders: Order[]; itemCount: number }) {
  if (!orders.length) {
    return (
      <EmptyState icon={<ShoppingBag size={54} />} title="No orders yet" body="Your order history will appear here" href="/shop" action="Start Shopping" />
    );
  }

  return (
    <div className="relative grid gap-4 before:absolute before:bottom-4 before:left-5 before:top-4 before:w-px before:bg-[rgba(201,168,76,0.18)]">
      {orders.map((order) => (
        <motion.article key={order.id} whileHover={{ x: 4 }} className="relative ml-10 border border-[rgba(201,168,76,0.18)] bg-card p-5">
          <span className="absolute -left-[31px] top-6 h-3 w-3 rounded-full bg-gold shadow-[0_0_18px_rgba(201,168,76,0.8)]" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gold">#{order.id.slice(0, 8)}</p>
              <p className="mt-1 text-sm text-muted">{order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN") : "Date unavailable"}</p>
            </div>
            <StatusBadge status={order.status ?? "pending"} />
          </div>
          <div className="mt-5 grid gap-3 text-sm text-primary/82 sm:grid-cols-3">
            <p><span className="text-muted">Total</span><br />₹{Number(order.total ?? 0).toLocaleString("en-IN")}</p>
            <p><span className="text-muted">Items</span><br />{getItemsCount(order.items)}</p>
            <button className="border border-gold px-4 py-3 text-gold transition hover:bg-gold hover:text-bg">View Details</button>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function WishlistTab({ items, onRemove }: { items: Array<{ rowId: string; product: Product }>; onRemove: (rowId: string) => void }) {
  if (!items.length) {
    return <EmptyState icon={<Heart size={54} />} title="Nothing saved yet" body="" href="/shop" action="Explore Shop" />;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.rowId} className="relative">
          <ProductCard product={item.product} />
          <button onClick={() => onRemove(item.rowId)} className="mt-3 w-full border border-[rgba(201,168,76,0.3)] px-4 py-3 text-sm text-gold transition hover:bg-gold hover:text-bg">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function StyleDnaTab({ styleDna }: { styleDna: StyleDna | null }) {
  const entries = [
    ["Style type", styleDna?.style],
    ["Fit", styleDna?.fit],
    ["Budget", styleDna?.budget],
    ["Colors", styleDna?.colors],
    ["Shopping style", styleDna?.shoppingStyle]
  ];

  if (!styleDna || entries.every(([, value]) => !value)) {
    return (
      <div className="mx-auto max-w-xl border border-[rgba(201,168,76,0.18)] bg-card p-8 text-center">
        <Sparkles className="mx-auto text-gold" size={54} />
        <h2 className="mt-5 font-display text-4xl text-primary">Discover your style profile</h2>
        <p className="mt-3 text-muted">Let our AI analyze your photo and build a personal style guide</p>
        <Link href="/style-me" className="mt-6 inline-block bg-gold px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-bg">Try Style Me</Link>
      </div>
    );
  }

  return (
    <LuxuryCard title="Your Style DNA">
      <div className="flex flex-wrap gap-3">
        {entries.map(([label, value]) => value && (
          <span key={label} className="border border-[rgba(201,168,76,0.3)] bg-bg px-4 py-2 text-sm text-gold">
            {label}: {value}
          </span>
        ))}
      </div>
      <Link href="/style-me" className="mt-7 inline-block border border-gold px-5 py-3 text-sm text-gold transition hover:bg-gold hover:text-bg">Retake Style Quiz</Link>
    </LuxuryCard>
  );
}

function NotificationsTab() {
  const [settings, setSettings] = useState({
    orders: true,
    arrivals: true,
    style: true,
    promos: false
  });

  const rows = [
    ["orders", "Order Updates"],
    ["arrivals", "New Arrivals"],
    ["style", "Style Recommendations"],
    ["promos", "Promotional Offers"]
  ] as const;

  return (
    <LuxuryCard title="Notifications">
      <div className="grid gap-4">
        {rows.map(([key, label]) => (
          <button key={key} onClick={() => setSettings((current) => ({ ...current, [key]: !current[key] }))} className="flex items-center justify-between border border-[rgba(201,168,76,0.12)] bg-bg p-4 text-left text-primary/82">
            <span>{label}</span>
            <span className={`flex h-7 w-12 items-center rounded-full border p-1 transition ${settings[key] ? "border-gold bg-gold/20" : "border-[rgba(201,168,76,0.18)] bg-card"}`}>
              <span className={`h-5 w-5 rounded-full transition ${settings[key] ? "translate-x-5 bg-gold" : "bg-muted"}`} />
            </span>
          </button>
        ))}
      </div>
      <button className="mt-6 bg-gold px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-bg">Save Preferences</button>
    </LuxuryCard>
  );
}

function LuxuryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.article whileHover={{ y: -3, boxShadow: "0 0 30px rgba(201,168,76,0.12)" }} className="relative min-h-64 border border-[rgba(201,168,76,0.18)] bg-card p-6">
      <h2 className="font-display text-3xl text-gold">{title}</h2>
      <div className="mt-6 grid gap-5">{children}</div>
    </motion.article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-gold">{label}</p>
      <p className="mt-1 text-primary/86">{value}</p>
    </div>
  );
}

function CardEditButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="justify-self-end border border-gold px-4 py-2 text-sm text-gold transition hover:bg-gold hover:text-bg">
      {children}
    </button>
  );
}

function EmptyState({ icon, title, body, href, action }: { icon: React.ReactNode; title: string; body: string; href: string; action: string }) {
  return (
    <div className="grid min-h-80 place-items-center text-center">
      <div>
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-[rgba(201,168,76,0.25)] text-gold">{icon}</div>
        <h2 className="mt-5 font-display text-4xl text-primary">{title}</h2>
        {body && <p className="mt-2 text-muted">{body}</p>}
        <Link href={href} className="mt-6 inline-block bg-gold px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-bg">{action}</Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const color = normalized === "delivered" || normalized === "paid"
    ? "border-emerald-500/40 text-emerald-300"
    : normalized === "cancelled"
      ? "border-red-500/40 text-red-300"
      : "border-amber-500/40 text-amber-300";

  return <span className={`border px-3 py-1 text-xs uppercase tracking-[0.16em] ${color}`}>{status}</span>;
}

function SignedOutState({ notice }: { notice: string }) {
  return (
    <div className="grid min-h-[55vh] place-items-center text-center">
      <div className="max-w-md border border-[rgba(201,168,76,0.18)] bg-surface p-8">
        <UserRound className="mx-auto text-gold" size={48} />
        <h1 className="mt-5 font-display text-4xl text-primary">Profile Awaits</h1>
        <p className="mt-3 text-muted">{notice}</p>
        <Link href="/auth" className="mt-6 inline-block bg-gold px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-bg">Sign In</Link>
      </div>
    </div>
  );
}

function EditProfileModal({
  open,
  profile,
  avatarPreview,
  saving,
  errors,
  register,
  onAvatar,
  onClose,
  onSubmit
}: {
  open: boolean;
  profile: Profile | null;
  avatarPreview: string | null;
  saving: boolean;
  errors: ReturnType<typeof useForm<EditForm>>["formState"]["errors"];
  register: ReturnType<typeof useForm<EditForm>>["register"];
  onAvatar: (file?: File) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid items-end bg-bg/80 px-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.form onSubmit={onSubmit} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }} className="mx-auto mb-4 w-full max-w-2xl border border-[rgba(201,168,76,0.24)] bg-surface p-6 shadow-[0_0_80px_rgba(0,0,0,0.7)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-gold">Profile</p>
                <h2 className="font-display text-4xl text-primary">Edit Profile</h2>
              </div>
              <button type="button" onClick={onClose} className="text-muted hover:text-gold" aria-label="Close edit profile">
                <X size={22} />
              </button>
            </div>
            <label className="mx-auto mt-7 grid w-fit cursor-pointer place-items-center text-center">
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => onAvatar(event.target.files?.[0])} />
              <span className="relative grid h-28 w-28 place-items-center overflow-hidden rounded-full border border-gold bg-card text-3xl text-gold">
                {avatarPreview ? <Image src={avatarPreview} alt="Avatar preview" fill className="object-cover" /> : profile?.name?.charAt(0)?.toUpperCase() ?? "E"}
              </span>
              <span className="mt-3 text-sm text-gold">Upload Avatar</span>
            </label>
            <div className="mt-7 grid gap-4">
              <label className="text-sm text-muted">
                Full Name
                <input {...register("name")} className="mt-2 w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" />
                {errors.name && <p className="mt-2 text-gold">{errors.name.message}</p>}
              </label>
              <label className="text-sm text-muted">
                Phone Number
                <input {...register("phone")} inputMode="numeric" className="mt-2 w-full border border-[rgba(201,168,76,0.2)] bg-bg p-3 text-primary outline-none focus:border-gold" />
                {errors.phone && <p className="mt-2 text-gold">{errors.phone.message}</p>}
              </label>
            </div>
            <button disabled={saving} className="mt-7 flex w-full items-center justify-center gap-2 bg-gold px-5 py-4 text-sm font-bold uppercase tracking-[0.14em] text-bg transition hover:bg-gold-light disabled:opacity-70">
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
              Save Changes
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatAddress(address: Address) {
  return [address.line1, address.line2, address.city, address.state, address.pinCode, address.country]
    .filter(Boolean)
    .join(", ");
}

function getItemsCount(items: unknown) {
  if (Array.isArray(items)) return items.length;
  if (items && typeof items === "object" && "length" in items && typeof items.length === "number") return items.length;
  return 0;
}

function normalizeWishlistRow(row: WishlistRow) {
  if (row.products) {
    return {
      rowId: row.id,
      product: {
        id: row.products.id,
        name: row.products.name,
        description: row.products.description ?? "",
        price: Number(row.products.price),
        salePrice: row.products.sale_price ?? undefined,
        category: row.products.category ?? "Collection",
        images: row.products.images?.length ? row.products.images : products[0].images,
        sizes: row.products.sizes?.length ? row.products.sizes : ["S", "M", "L"],
        colors: row.products.colors?.length ? row.products.colors : ["#080808", "#C9A84C"],
        stock: row.products.stock ?? 0,
        tags: row.products.tags ?? [],
        fit: row.products.tags?.[0] ?? "tailored"
      }
    };
  }

  const fallback = products.find((product) => product.id === row.product_id);
  return fallback ? { rowId: row.id, product: fallback } : null;
}
