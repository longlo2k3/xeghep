import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { PriceBannerSection } from "@/components/home/PriceBannerSection";
import { HeroSection } from "@/components/home/HeroSection";
import { RoutePricingGrid } from "@/components/home/RoutePricingGrid";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { IntroTeaser } from "@/components/home/IntroTeaser";
import { getRoutes, getCompanySettings } from "@/lib/api";

/**
 * Metadata for Homepage
 * Sets absolute self-referencing canonical to "/" (strictly adheres to AGENTS.md rule 1.3)
 */
export const metadata: Metadata = constructMetadata({
  title:
    "Xe Ghép Liên Tỉnh - Móng Cái, Hạ Long, Hải Phòng, Bắc Ninh, Bắc Giang, Hà Nội",
  description:
    "Dịch vụ xe ghép liên tỉnh chuyên tuyến Móng Cái – Hạ Long – Hải Phòng – Bắc Ninh – Bắc Giang – Hà Nội. 100% xe riêng đời mới, đưa đón tận nhà, giá trọn gói, phục vụ 24/7.",
  path: "/",
});

export default async function HomePage() {
  const [companySettings, routes] = await Promise.all([
    getCompanySettings(),
    getRoutes(),
  ]);
  const bannerRoutes = routes.filter((route) => route.isBannerTop);

  return (
    <>
      {/* Section 1 — Banner Bảng Giá Các Tuyến Chính */}
      <PriceBannerSection routes={bannerRoutes} />

      {/* Section 2 — Hero + Đặt Xe Trực Tuyến (Gộp chung vào 1 section tối ưu) */}
      <HeroSection routes={routes} companyInfo={companySettings.info} />

      {/* Section 3 — Bảng Giá Xe Ghép (Lưới 9 RouteCard) */}
      <RoutePricingGrid routes={routes} />

      {/* Section 4 — Vì Sao Chọn Xe Ghép Liên Tỉnh (Khung vàng) */}
      <WhyChooseUs />

      {/* Section 5 — Giới Thiệu Ngắn */}
      <IntroTeaser />
    </>
  );
}
