"use client";
import SettingsSidebar from "@/components/SettingsSidebar";
import { PackageOpen } from "lucide-react";

export default function ReturnsSettings() {
  return (
    <div className="flex min-h-[calc(100vh-130px)] bg-[#f8f7f5]">
      <SettingsSidebar active="Returns" />
      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Returns & Refunds</h1>
        <p className="text-sm text-gray-500 mb-8">View your return requests and policies</p>
        <div className="card p-5 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Return Policy</h3>
          <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
            <li>Returns accepted within 7 days of delivery</li>
            <li>Item must be unused with original tags</li>
            <li>Refunds processed within 5-7 business days</li>
            <li>Jewellery items are non-returnable for hygiene reasons</li>
          </ul>
        </div>
        <div className="card p-8 text-center">
          <PackageOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="font-medium text-gray-700">No return requests</p>
          <p className="text-sm text-gray-400 mt-1">Your return requests will appear here</p>
        </div>
      </main>
    </div>
  );
}
