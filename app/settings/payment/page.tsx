"use client";
import SettingsSidebar from "@/components/SettingsSidebar";
import { CreditCard, Shield } from "lucide-react";

export default function PaymentSettings() {
  return (
    <div className="flex min-h-[calc(100vh-130px)] bg-[#f8f7f5]">
      <SettingsSidebar active="Payment Methods" />
      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Payment Methods</h1>
        <p className="text-sm text-gray-500 mb-8">Manage your saved cards and billing info</p>
        <div className="card p-8 text-center">
          <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="font-medium text-gray-700">No saved payment methods</p>
          <p className="text-sm text-gray-400 mt-1">Payment methods will appear here after your first order</p>
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400">
            <Shield size={14} /> Payments are securely handled at checkout
          </div>
        </div>
      </main>
    </div>
  );
}
