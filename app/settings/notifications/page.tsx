"use client";
import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";
import SettingsSidebar from "@/components/SettingsSidebar";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";

type NotifSettings = {
  orderUpdates: boolean;
  newArrivals: boolean;
  styleRecs: boolean;
  promos: boolean;
  wishlistBack: boolean;
  priceDrops: boolean;
};

const DEFAULT: NotifSettings = {
  orderUpdates: true, newArrivals: true,
  styleRecs: true, promos: false,
  wishlistBack: true, priceDrops: true,
};

const ROWS: { key: keyof NotifSettings; label: string; desc: string }[] = [
  { key: "orderUpdates", label: "Order Updates", desc: "Shipping, delivery and order status alerts" },
  { key: "newArrivals", label: "New Arrivals", desc: "Be first to know about new collections" },
  { key: "styleRecs", label: "Style Recommendations", desc: "AI-powered picks based on your profile" },
  { key: "promos", label: "Promotional Offers", desc: "Sales, discounts and exclusive deals" },
  { key: "wishlistBack", label: "Wishlist Back in Stock", desc: "Alert when saved items are restocked" },
  { key: "priceDrops", label: "Price Drops", desc: "When items you viewed go on sale" },
];

export default function NotificationsSettings() {
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!hasSupabaseBrowserEnv()) { setLoading(false); return; }
    const sb = createClient();
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      const { data } = await sb.from("profiles").select("style_dna").eq("id", user.id).maybeSingle();
      const saved = (data?.style_dna as Record<string,unknown> | null)?.notifSettings;
      if (saved && typeof saved === "object") setSettings({ ...DEFAULT, ...(saved as Partial<NotifSettings>) });
      setLoading(false);
    });
  }, []);

  async function save() {
    if (!hasSupabaseBrowserEnv()) return;
    setSaving(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { data } = await sb.from("profiles").select("style_dna").eq("id", user.id).maybeSingle();
    const existing = (data?.style_dna as Record<string,unknown>) ?? {};
    await sb.from("profiles").update({ style_dna: { ...existing, notifSettings: settings } }).eq("id", user.id);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  function toggle(key: keyof NotifSettings) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex min-h-[calc(100vh-130px)] bg-[#f8f7f5]">
      <SettingsSidebar active="Notifications" />
      <main className="flex-1 p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {saved && <span className="flex items-center gap-1 text-green-600 text-sm"><Check size={14}/> Saved!</span>}
        </div>
        <p className="text-sm text-gray-500 mb-8">Choose what updates you want to receive</p>

        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#1a6b8a]" size={32}/></div> : (
          <div className="space-y-3">
            {ROWS.map(({ key, label, desc }) => (
              <div key={key} className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
                <button onClick={() => toggle(key)}
                  className={`relative flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors duration-200 ${settings[key] ? "border-[#1a6b8a] bg-[#1a6b8a]" : "border-gray-300 bg-gray-200"}`}>
                  <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${settings[key] ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}

            <button onClick={save} disabled={saving}
              className="btn-primary rounded-lg px-6 py-3 text-sm font-semibold flex items-center gap-2 mt-6 disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin"/> : null}
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
