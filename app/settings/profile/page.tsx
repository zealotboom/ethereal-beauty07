"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check, Camera } from "lucide-react";
import Image from "next/image";
import SettingsSidebar from "@/components/SettingsSidebar";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().refine((v) => !v || /^\d{10}$/.test(v), "Phone must be 10 digits"),
  bio: z.string().max(200, "Max 200 characters").optional(),
});
type FormValues = z.infer<typeof schema>;

export default function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!hasSupabaseBrowserEnv()) { setLoading(false); return; }
    const sb = createClient();
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      setEmail(user.email ?? "");
      const { data } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        reset({ name: data.name ?? "", phone: data.phone ?? "", bio: data.bio ?? "" });
        setAvatarPreview(data.avatar_url ?? null);
      }
      setLoading(false);
    });
  }, [reset]);

  async function onSubmit(values: FormValues) {
    if (!hasSupabaseBrowserEnv()) return;
    setSaving(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setSaving(false); return; }

    let avatarUrl = avatarPreview;
    if (avatarFile) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (cloudName && preset) {
        const form = new FormData();
        form.set("file", avatarFile);
        form.set("upload_preset", preset);
        form.set("folder", "ethereal-beauty/avatars");
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
        if (res.ok) { const j = await res.json() as { secure_url?: string }; avatarUrl = j.secure_url ?? avatarUrl; }
      }
    }
    await sb.from("profiles").update({ name: values.name, phone: values.phone || null, avatar_url: avatarUrl }).eq("id", user.id);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex min-h-[calc(100vh-130px)] bg-[#f8f7f5]">
      <SettingsSidebar active="Profile" />
      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
        <p className="text-sm text-gray-500 mb-8">Update your name, photo and contact details</p>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#1a6b8a]" size={32} /></div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <label className="relative cursor-pointer group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#1a6b8a] bg-gray-100 flex items-center justify-center">
                  {avatarPreview
                    ? <Image src={avatarPreview} alt="Avatar" fill className="object-cover rounded-full" sizes="80px" />
                    : <span className="text-3xl text-gray-400">👤</span>}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Camera size={18} className="text-white" />
                </div>
                <input type="file" accept="image/*" className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); } }} />
              </label>
              <div>
                <p className="font-medium text-gray-900">Profile Photo</p>
                <p className="text-sm text-gray-500">Click to upload a new photo</p>
                <p className="text-xs text-gray-400 mt-1">{email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input {...register("name")} className="input-lux" placeholder="Your full name" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input {...register("phone")} className="input-lux" placeholder="10-digit mobile number" inputMode="numeric" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input value={email} disabled className="input-lux opacity-60 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
            </div>

            <button type="submit" disabled={saving}
              className="btn-primary rounded-lg px-6 py-3 text-sm font-semibold flex items-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
              {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
