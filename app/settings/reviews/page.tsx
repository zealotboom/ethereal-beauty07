"use client";
import SettingsSidebar from "@/components/SettingsSidebar";
import { Star } from "lucide-react";

export default function ReviewsSettings() {
  return (
    <div className="flex min-h-[calc(100vh-130px)] bg-[#f8f7f5]">
      <SettingsSidebar active="Reviews" />
      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Reviews</h1>
        <p className="text-sm text-gray-500 mb-8">Reviews you have written for products</p>
        <div className="card p-8 text-center">
          <Star size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="font-medium text-gray-700">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">After purchasing, you can review your items here</p>
        </div>
      </main>
    </div>
  );
}
