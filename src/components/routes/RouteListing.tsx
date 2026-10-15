"use client";

import { useState } from "react";
import type { RouteItem } from "@/lib/types";
import { RoutePricingCard } from "@/components/home/RoutePricingGrid";

const REGIONS = [
  "Tất cả",
  "Hải Phòng",
  "Hà Nội",
  "Hạ Long",
  "Móng Cái",
  "Bắc Ninh – Bắc Giang",
];

export function RouteListing({ routes }: { routes: RouteItem[] }) {
  const [activeTab, setActiveTab] = useState("Tất cả");

  const filteredRoutes =
    activeTab === "Tất cả"
      ? routes
      : routes.filter((r) => r.regions.includes(activeTab));

  return (
    <div className="space-y-10">
      {/* Bộ lọc nhanh (tab) per spec_v2.md 5.1 */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
        {REGIONS.map((region) => (
          <button
            key={region}
            type="button"
            onClick={() => setActiveTab(region)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === region
                ? "bg-red-600 text-white shadow-md shadow-red-600/25 scale-105"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Lưới 9 RouteCard thiết kế đồng bộ với trang chủ (2 cột trên mobile) */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
        {filteredRoutes.map((route) => (
          <RoutePricingCard key={route.slug} route={route} />
        ))}
      </div>
    </div>
  );
}
