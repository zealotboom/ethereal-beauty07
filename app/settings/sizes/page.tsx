"use client";
import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";
import SettingsSidebar from "@/components/SettingsSidebar";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";

type SizeProfile = {
  topSize: string; bottomSize: string; shoeSize: string;
  height: string; weight: string; chest: string;
  waist: string; hips: string;
};

const DEFAULT: SizeProfile = { topSize:"", bottomSize:"", shoeSize:"", height:"", weight:"", chest:"", waist:"", hips:"" };
const TOP_SIZES = ["XS","S","M","L","XL","XXL","3XL"];
const BOTTOM_SIZES = ["26","28","30","32","34","36","38","40"];

export default function SizesSettings() {
  const [sizes, setSizes] = useState<SizeProfile>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!hasSupabaseBrowserEnv()) { setLoading(false); return; }
    const sb = createClient();
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      const { data } = await sb.from("profiles").select("style_dna").eq("id", user.id).maybeSingle();
      const s = (data?.style_dna as Record<string,unknown> | null)?.sizeProfile;
      if (s && typeof s === "object") setSizes({ ...DEFAULT, ...(s as Partial<SizeProfile>) });
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
    await sb.from("profiles").update({ style_dna: { ...existing, sizeProfile: sizes } }).eq("id", user.id);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  function set(key: keyof SizeProfile, val: string) { setSizes((prev) => ({ ...prev, [key]: val })); }

  return (
    <div className="flex min-h-[calc(100vh-130px)] bg-[#f8f7f5]">
      <SettingsSidebar active="Size Profile" />
      <main className="flex-1 p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Size Profile</h1>
          {saved && <span className="flex items-center gap-1 text-green-600 text-sm"><Check size={14}/> Saved!</span>}
        </div>
        <p className="text-sm text-gray-500 mb-8">Save your measurements for better AI recommendations</p>

        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#1a6b8a]" size={32}/></div> : (
          <div className="space-y-6">
            {/* Top size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Top / Dress Size</label>
              <div className="flex flex-wrap gap-2">
                {TOP_SIZES.map((s) => (
                  <button key={s} type="button" onClick={() => set("topSize", s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${sizes.topSize === s ? "bg-[#1a6b8a] text-white border-[#1a6b8a]" : "bg-white text-gray-700 border-gray-200 hover:border-[#1a6b8a]"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bottom / Trouser Size</label>
              <div className="flex flex-wrap gap-2">
                {BOTTOM_SIZES.map((s) => (
                  <button key={s} type="button" onClick={() => set("bottomSize", s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${sizes.bottomSize === s ? "bg-[#1a6b8a] text-white border-[#1a6b8a]" : "bg-white text-gray-700 border-gray-200 hover:border-[#1a6b8a]"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Measurements */}
            <div className="card p-5">
              <p className="font-medium text-gray-900 mb-4">Body Measurements (cm)</p>
              <div className="grid grid-cols-2 gap-4">
                {([["height","Height (cm)"],["weight","Weight (kg)"],["chest","Chest (cm)"],["waist","Waist (cm)"],["hips","Hips (cm)"],["shoeSize","Shoe Size (EU)"]] as [keyof SizeProfile, string][]).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input value={sizes[key]} onChange={(e) => set(key, e.target.value)}
                      className="input-lux" placeholder="e.g. 170" inputMode="numeric" />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={save} disabled={saving}
              className="btn-primary rounded-lg px-6 py-3 text-sm font-semibold flex items-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin"/> : null}
              {saving ? "Saving..." : "Save Size Profile"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
