import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { HeroSection } from "@/components/home/HeroSection";
import { HeroBookingBar } from "@/components/home/HeroBookingBar";
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

  return (
    <>
      {/* Section 1 — Header / Hero Banner */}
      <HeroSection routes={routes} companyInfo={companySettings.info} />

      {/* Booking Form đặt ở giữa Header và Bảng Giá Xe Ghép */}
      <section className="relative z-20 -mt-10 sm:-mt-14 lg:-mt-16 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mb-4 sm:mb-8 flex justify-center">
        <HeroBookingBar routes={routes} />
      </section>

      {/* Section 2 — Bảng Giá Xe Ghép (Lưới 9 RouteCard) */}
      <RoutePricingGrid routes={routes} hotlineHref={companySettings.info.hotlineHref} />

      {/* Section 4 — Vì Sao Chọn Xe Ghép Liên Tỉnh (Khung vàng) */}
      <WhyChooseUs />

      {/* Section 5 — Giới Thiệu Ngắn */}
      <IntroTeaser />
    </>
  );
}
