import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { HeroSection } from "@/components/home/HeroSection";
import { HeroBookingBar } from "@/components/home/HeroBookingBar";
import { RoutePricingGrid } from "@/components/home/RoutePricingGrid";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { IntroTeaser } from "@/components/home/IntroTeaser";
import { getRoutes, getCompanySettings } from "@/lib/api";
import { Award, CheckCircle2, Phone, Zap } from "lucide-react";

/**
 * Metadata for Homepage
 * Sets absolute self-referencing canonical to "/" (strictly adheres to AGENTS.md rule 1.3)
 */
export const metadata: Metadata = constructMetadata({
  title:
    "Xe Ghép Liên Tỉnh - Móng Cái, Hạ Long, Hải Phòng, Bắc Ninh, Bắc Giang, Hà Nội",
  description:
    "Dịch vụ xe ghép liên tỉnh chuyên tuyến Móng Cái – Hạ Long – Hải Phòng – Bắc Ninh – Bắc Giang – Hà Nội. Cam kết là xe riêng đời mới, đưa đón tận nhà, giá trọn gói, phục vụ 24/7.",
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
      <HeroSection companyInfo={companySettings.info} />

      {/* Nội dung và form đặt xe nằm sau ảnh banner, không phủ lên ảnh. */}
      <section className="bg-white px-3 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {companySettings.info.heroTitleLine1?.trim() && (
            <div className="mb-6 space-y-3 text-center sm:mb-8">
              <h1 className="text-2xl font-black uppercase leading-tight tracking-tight text-slate-900 sm:text-4xl">
                <span className="text-red-600">
                  {companySettings.info.heroTitleLine1}
                </span>{" "}
                {companySettings.info.heroTitleLine2}
              </h1>
              {companySettings.info.heroDescription && (
                <p className="mx-auto max-w-3xl text-sm text-slate-700 sm:text-base">
                  {companySettings.info.heroDescription}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-700 sm:text-sm">
                <a
                  href={companySettings.info.hotlineHref}
                  className="inline-flex items-center gap-1.5 font-bold text-red-600 hover:text-red-700"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Hotline 24/7: {companySettings.info.hotline}
                </a>
                {companySettings.info.heroBenefit1 && (
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2
                      className="h-4 w-4 text-emerald-600"
                      aria-hidden="true"
                    />
                    {companySettings.info.heroBenefit1}
                  </span>
                )}
                {companySettings.info.heroBenefit2 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Zap
                      className="h-4 w-4 text-amber-600"
                      aria-hidden="true"
                    />
                    {companySettings.info.heroBenefit2}
                  </span>
                )}
                {companySettings.info.heroBenefit3 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Award
                      className="h-4 w-4 text-sky-600"
                      aria-hidden="true"
                    />
                    {companySettings.info.heroBenefit3}
                  </span>
                )}
              </div>
            </div>
          )}
          <HeroBookingBar routes={routes} />
        </div>
      </section>

      {/* Section 2 — Bảng Giá Xe Ghép (Lưới 9 RouteCard) */}
      <RoutePricingGrid
        routes={routes}
        hotlineHref={companySettings.info.hotlineHref}
        isPrimaryHeading={!companySettings.info.heroTitleLine1?.trim()}
      />

      {/* Section 4 — Vì Sao Chọn Xe Ghép Liên Tỉnh (Khung vàng) */}
      <WhyChooseUs />

      {/* Section 5 — Giới Thiệu Ngắn */}
      <IntroTeaser />
    </>
  );
}
