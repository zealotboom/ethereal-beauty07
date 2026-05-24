"use client";
import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import SettingsSidebar from "@/components/SettingsSidebar";
import { createClient, hasSupabaseBrowserEnv } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function PrivacySettings() {
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  async function deleteAccount() {
    if (confirm !== "DELETE") return;
    if (!hasSupabaseBrowserEnv()) return;
    setDeleting(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setDeleting(false); return; }
    // Delete profile data first
    await sb.from("cart_items").delete().eq("user_id", user.id);
    await sb.from("wishlist_items").delete().eq("user_id", user.id);
    await sb.from("profiles").delete().eq("id", user.id);
    await sb.auth.signOut();
    router.push("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-130px)] bg-[#f8f7f5]">
      <SettingsSidebar active="Privacy" />
      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Privacy & Data</h1>
        <p className="text-sm text-gray-500 mb-8">Manage how your data is used</p>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-1">Data We Collect</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Profile information (name, email, phone)</li>
              <li>Order and purchase history</li>
              <li>Style preferences from Style Me feature</li>
              <li>Wishlist and cart items</li>
            </ul>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-1">How We Use It</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Process and deliver your orders</li>
              <li>Personalise recommendations</li>
              <li>Improve our AI styling tools</li>
              <li>Send transactional emails</li>
            </ul>
          </div>

          <div className="card p-5 border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-red-700 mb-1">Delete Account</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This will permanently delete your profile, orders, wishlist and all data. This action cannot be undone.
                </p>
                {!showConfirm ? (
                  <button onClick={() => setShowConfirm(true)}
                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition">
                    Delete My Account
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Type <strong>DELETE</strong> to confirm:</p>
                    <input value={confirm} onChange={(e) => setConfirm(e.target.value)}
                      className="input-lux border-red-300 focus:border-red-500" placeholder="Type DELETE here" />
                    <div className="flex gap-3">
                      <button onClick={deleteAccount} disabled={confirm !== "DELETE" || deleting}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                        {deleting && <Loader2 size={14} className="animate-spin"/>}
                        Confirm Delete
                      </button>
                      <button onClick={() => { setShowConfirm(false); setConfirm(""); }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
