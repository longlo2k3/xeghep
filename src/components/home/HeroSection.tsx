import Image from "next/image";
import dynamic from "next/dynamic";
import { Phone, Star, ShieldCheck, CheckCircle2, Award, Zap } from "lucide-react";
import { COMPANY_INFO } from "@/data/company-info";
import type { CompanyInfoData } from "@/lib/api";
import type { RouteItem } from "@/lib/types";

const BookingForm = dynamic(
  () => import("@/components/booking/BookingForm").then((mod) => mod.BookingForm),
  {
    loading: () => (
      <div className="w-full min-h-[460px] rounded-2xl bg-slate-900/60 border border-white/10 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-3 p-6 backdrop-blur-sm">
        <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-slate-300">
          Đang chuẩn bị biểu mẫu đặt xe...
        </span>
      </div>
    ),
  }
);

export function HeroSection({
  routes,
  companyInfo = COMPANY_INFO,
}: {
  routes: RouteItem[];
  companyInfo?: CompanyInfoData;
}) {
  const info = companyInfo ?? COMPANY_INFO;

  return (
    <section className="relative bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 text-white py-10 sm:py-14 lg:py-16 overflow-hidden border-b border-slate-800">
      {/* Background Car Image + Soft Lighter Overlay (Lazy loaded to avoid competing with LCP) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/banner2.webp"
          alt="Đội xe riêng đời mới Xe Ghép Liên Tỉnh"
          fill
          loading="lazy"
          decoding="async"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1280px"
          quality={75}
          className="object-cover object-center opacity-65 select-none pointer-events-none"
        />
        {/* Left-focused gradient: readable text on left, clear see-through glass view on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-900/35" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Main Hero Content */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs sm:text-sm font-bold backdrop-blur-sm">
              <ShieldCheck
                className="w-4 h-4 text-red-400"
                aria-hidden="true"
              />
              <span>Cam kết 100% xe riêng đời mới • Đưa đón tận nhà</span>
            </div>

            {/* H1 per spec_v2.md Section 3 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white uppercase leading-tight drop-shadow-md">
              XE GHÉP <span className="text-red-500">LIÊN TỈNH</span>
            </h1>

            {/* Sub content per spec_v2.md Section 3 */}
            <div className="space-y-2.5 max-w-2xl mx-auto lg:mx-0">
              <p className="text-sm sm:text-base lg:text-lg font-extrabold text-amber-300 uppercase tracking-wide">
                CHUYÊN MÓNG CÁI – HẠ LONG – HẢI PHÒNG – BẮC NINH – BẮC GIANG – HÀ NỘI.
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-1 text-amber-400">
                <span className="text-xs sm:text-sm font-bold text-white mr-1.5">
                  Chất lượng dịch vụ 5 sao
                </span>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                ))}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Cam kết 100% xe riêng đời mới, đưa đón tận nhà, giá trọn gói niêm yết không phát sinh. Giảm 10% cho khách hàng cũ.
              </p>
            </div>

            {/* CTA Hotline Button per spec_v2.md */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
              <a
                href={info.hotlineHref}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-sm sm:text-base shadow-xl shadow-red-600/30 transition-all hover:scale-105 cursor-pointer border border-red-500/50"
                aria-label={`Gọi ngay ${info.hotline}`}
              >
                <Phone className="w-4 h-4 animate-pulse" aria-hidden="true" />
                <span>HOTLINE 24/7: {info.hotline}</span>
              </a>
            </div>

            {/* Value checklist & perks */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-slate-300 max-w-xl text-left mx-auto lg:mx-0">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Đón trả tận cửa nhà</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Chỉ 1–3 khách / chuyến</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Gửi hàng hỏa tốc từ 150k</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                <Award className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>Hoàn 100% nếu sai cam kết</span>
              </div>
            </div>
          </div>

          {/* Right Column: Embedded Booking Form */}
          <div className="lg:col-span-6 xl:col-span-5 w-full">
            <BookingForm compact routes={routes} companyInfo={info} />
          </div>
        </div>
      </div>
    </section>
  );
}
