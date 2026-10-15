import Link from "next/link";
import Image from "next/image";
import type { RouteItem } from "@/lib/types";
import { Package, ShieldAlert, Navigation, Sparkles } from "lucide-react";

export function PriceBannerSection({ routes }: { routes: RouteItem[] }) {
  return (
    <section className="relative w-full overflow-hidden bg-slate-900 text-white border-b border-sky-950">
      {/* Background Image Banner (Optimized WebP for fast LCP) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/banner.webp"
          alt="Bảng giá các tuyến xe ghép liên tỉnh"
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
          quality={75}
          className="object-cover object-left md:object-left-top lg:object-center select-none pointer-events-none"
        />
        {/* Dark overlay specifically for mobile to enhance text contrast without GPU blur paint latency */}
        <div
          className="absolute inset-0 bg-slate-950/85 sm:bg-slate-950/75 lg:hidden pointer-events-none"
          aria-hidden="true"
        />
        {/* Subtle right-edge shadow/tint to blend smoothly on ultra-wide screens */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-950/40 hidden lg:block pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Content Container: Compact on mobile, aligned to the right blue area on desktop */}
      <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-12 min-h-0 lg:min-h-[540px] flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
          {/* Left Column: 6 cols spacer on desktop to push content firmly into the right blue area */}
          <div
            className="hidden lg:block lg:col-span-6 xl:col-span-6 pointer-events-none"
            aria-hidden="true"
          />

          {/* Right Column: Positioned inside the blue background zone */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-2.5 sm:space-y-4 lg:pl-4 xl:pl-8">
            {/* Header: Badge & Main Title */}
            <div className="space-y-1 sm:space-y-1.5 w-full">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-sky-400/20 text-sky-200 text-[10px] sm:text-xs font-bold tracking-wider uppercase border border-sky-400/35 backdrop-blur-md shadow-sm">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                Cao Tốc 2 Chiều • Đưa Đón Tận Nơi 24/7
              </span>
              <p className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight text-white uppercase drop-shadow-md leading-tight">
                BẢNG GIÁ CÁC TUYẾN CHÍNH
              </p>
            </div>

            {/* Lưới các tuyến: 2 cột gọn gàng ngay trên mobile để giảm 50% chiều dài */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 w-full">
              {routes.map((route, idx) => {
                const isLastOdd = idx === routes.length - 1 && routes.length % 2 !== 0;

                return (
                  <Link
                    key={route.slug}
                    href={`/tuyen-lien-tinh/${route.slug}`}
                    className={`group flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-all hover:scale-[1.01] hover:shadow-lg hover:border-amber-400/40 ${
                      isLastOdd ? "col-span-2" : "col-span-1"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] sm:text-xs font-black flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-amber-400 transition-colors">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] sm:text-[13px] font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {route.bannerLabel ?? route.name}
                      </span>
                    </div>
                    <Navigation className="hidden sm:block w-3.5 h-3.5 text-sky-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                );
              })}
            </div>

            {/* Dải chữ nổi bật: DỊCH VỤ GỬI HÀNG HOÁ TỐC */}
            <div className="w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider shadow-lg border border-amber-300/40 hover:brightness-105 transition-all">
              <Package
                className="w-3.5 h-3.5 flex-shrink-0 animate-bounce"
                aria-hidden="true"
              />
              <span className="truncate">
                DỊCH VỤ GỬI HÀNG HOÁ TỐC GIÁ CHỈ TỪ 150K TẤT CẢ CÁC TUYẾN
              </span>
            </div>

            {/* Ghi chú chân banner */}
            <div className="w-full pt-0.5">
              <p className="text-[10px] sm:text-xs text-sky-100/90 leading-snug sm:leading-relaxed italic flex items-center justify-center lg:justify-start gap-1">
                <ShieldAlert
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 flex-shrink-0 inline"
                  aria-hidden="true"
                />
                <span>
                  Xe ghép chỉ 1–3 khách/chuyến, đón trả tận nhà 24/7. Giá có thể thay đổi dịp lễ, tết.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
