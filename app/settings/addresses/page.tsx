"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Check } from "lucide-react";
import SettingsSidebar from "@/components/SettingsSidebar";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";

const schema = z.object({
  label: z.string().min(1, "Label required e.g. Home, Work"),
  line1: z.string().min(3, "Address required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  pinCode: z.string().regex(/^\d{6}$/, "PIN must be 6 digits"),
  country: z.string().default("India"),
});
type FormValues = z.infer<typeof schema>;
type Address = FormValues & { id: string };

export default function AddressSettings() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema), defaultValues: { country: "India" }
  });

  async function load() {
    if (!hasSupabaseBrowserEnv()) { setLoading(false); return; }
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await sb.from("profiles").select("address").eq("id", user.id).maybeSingle();
    const saved = data?.address;
    if (Array.isArray(saved)) setAddresses(saved as Address[]);
    else if (saved && typeof saved === "object") setAddresses([{ ...(saved as Omit<Address,"id">), id: "default" }]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function onSubmit(values: FormValues) {
    if (!hasSupabaseBrowserEnv()) return;
    setSaving(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setSaving(false); return; }
    const newAddr: Address = { ...values, id: Date.now().toString() };
    const updated = [...addresses, newAddr];
    await sb.from("profiles").update({ address: updated }).eq("id", user.id);
    setAddresses(updated);
    reset({ country: "India" });
    setShowForm(false);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function remove(id: string) {
    if (!hasSupabaseBrowserEnv()) return;
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const updated = addresses.filter((a) => a.id !== id);
    await sb.from("profiles").update({ address: updated }).eq("id", user.id);
    setAddresses(updated);
  }

  return (
    <div className="flex min-h-[calc(100vh-130px)] bg-[#f8f7f5]">
      <SettingsSidebar active="Addresses" />
      <main className="flex-1 p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
          {saved && <span className="flex items-center gap-1 text-green-600 text-sm"><Check size={14} /> Saved!</span>}
        </div>
        <p className="text-sm text-gray-500 mb-8">Manage your delivery addresses</p>

        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#1a6b8a]" size={32} /></div> : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="card p-5 flex justify-between items-start gap-4">
                <div>
                  <span className="inline-block bg-[#e0f2fe] text-[#0369a1] text-xs font-semibold px-2 py-0.5 rounded mb-2">{addr.label}</span>
                  <p className="text-gray-900 font-medium">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                  <p className="text-gray-500 text-sm">{addr.city}, {addr.state} — {addr.pinCode}</p>
                  <p className="text-gray-400 text-xs">{addr.country}</p>
                </div>
                <button onClick={() => remove(addr.id)} className="text-red-400 hover:text-red-600 transition shrink-0 mt-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {!showForm ? (
              <button onClick={() => setShowForm(true)}
                className="w-full card p-4 flex items-center justify-center gap-2 text-[#1a6b8a] font-medium text-sm hover:bg-[#f0f9ff] transition border-dashed">
                <Plus size={16} /> Add New Address
              </button>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">New Address</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Label (e.g. Home, Work) *</label>
                  <input {...register("label")} className="input-lux" placeholder="Home" />
                  {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 1 *</label>
                  <input {...register("line1")} className="input-lux" placeholder="House/Flat no, Street" />
                  {errors.line1 && <p className="text-red-500 text-xs mt-1">{errors.line1.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 2</label>
                  <input {...register("line2")} className="input-lux" placeholder="Landmark (optional)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
                    <input {...register("city")} className="input-lux" placeholder="City" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">State *</label>
                    <input {...register("state")} className="input-lux" placeholder="State" />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">PIN Code *</label>
                    <input {...register("pinCode")} className="input-lux" placeholder="6-digit PIN" inputMode="numeric" />
                    {errors.pinCode && <p className="text-red-500 text-xs mt-1">{errors.pinCode.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
                    <input {...register("country")} className="input-lux" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving}
                    className="btn-primary rounded-lg px-5 py-2.5 text-sm font-semibold flex items-center gap-2">
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    Save Address
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="btn-outline rounded-lg px-5 py-2.5 text-sm font-semibold">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
