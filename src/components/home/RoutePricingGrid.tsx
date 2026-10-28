import Link from "next/link";
import Image from "next/image";
import { type RouteItem } from "@/lib/types";
import { toMediaSrc } from "@/lib/brand";
import { COMPANY_INFO } from "@/data/company-info";
import { Clock, ArrowRight } from "lucide-react";

/** Ảnh nền dự phòng khi tuyến chưa cấu hình ảnh SEO. */
const FALLBACK_CARD_IMAGE = "/banner3.webp";

export function RoutePricingCard({
  route,
  hotlineHref = COMPANY_INFO.hotlineHref,
}: {
  route: RouteItem;
  hotlineHref?: string;
}) {
  const imageSrc = toMediaSrc(route.imageUrl) ?? FALLBACK_CARD_IMAGE;

  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 shadow-lg shadow-slate-900/20 group flex flex-col transform hover:-translate-y-1 transition-all duration-300 ease-out">
      {/* Ảnh nền lấy từ ảnh SEO (ogImage) đã cấu hình khi tạo tuyến */}
      <Image
        src={imageSrc}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
        quality={75}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/60 to-slate-950/85"
      />

      <div className="relative z-10 flex flex-1 flex-col gap-2 sm:gap-3 p-2.5 sm:p-4">
        {/* Badges: thời gian gian + chạy 24/7 */}
        <div className="flex items-center justify-between gap-1">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-slate-900/60 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white backdrop-blur-sm">
            <Clock className="w-3 h-3 flex-shrink-0 text-amber-300" />
            <span className="truncate">{route.duration}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
            <span>Chạy 24/7</span>
          </span>
        </div>

        {/* Route Title */}
        <Link href={`/tuyen-lien-tinh/${route.slug}`} className="block">
          <h3 className="text-[13px] sm:text-base font-black uppercase tracking-tight leading-snug text-white line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] drop-shadow group-hover:text-amber-300 transition-colors">
            {route.name}
          </h3>
        </Link>

        {/* BẢNG GIÁ CHI TIẾT */}
        <div className="mt-auto rounded-lg sm:rounded-xl border border-white/10 bg-slate-950/65 p-2 sm:p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-1 border-b border-white/15 pb-1 sm:pb-1.5">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-amber-400">
              Bảng giá chi tiết
            </span>
            <span className="rounded border border-white/15 px-1.5 py-0.5 text-[9px] font-medium lowercase text-slate-300">
              trọn gói
            </span>
          </div>

          <div
            data-testid="pricing-details"
            className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1.5 sm:gap-y-2"
          >
            {route.pricingDetails.map((detail, idx) => (
              <div key={idx} className="min-w-0">
                <span className="flex min-w-0 items-center gap-1.5 text-[10px] sm:text-xs font-medium text-slate-200">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 flex-none rounded-full bg-amber-400"
                  />
                  <span className="min-w-0 truncate">{detail.label}</span>
                </span>
                <span className="block pl-3 text-[11px] sm:text-sm font-extrabold leading-tight text-amber-400">
                  {detail.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <a
          href={hotlineHref}
          className="mt-0.5 w-full py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl bg-[#d9261c] hover:bg-[#b81d14] active:scale-[0.98] text-white font-black uppercase tracking-wide text-xs text-center shadow-sm shadow-red-900/30 flex items-center justify-center gap-1.5 transition-all"
        >
          <span>Gọi ngay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

export function RoutePricingGrid({
  routes,
  hotlineHref,
  isPrimaryHeading = false,
}: {
  routes: RouteItem[];
  hotlineHref?: string;
  isPrimaryHeading?: boolean;
}) {
  const Heading = isPrimaryHeading ? "h1" : "h2";

  return (
    <section className="py-8 sm:py-20 bg-slate-100/60 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* Tiêu đề chính khi banner không có chữ, H2 trong các trường hợp còn lại */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-12 space-y-2 sm:space-y-3">
          <span className="inline-block px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-sm">
            Niêm Yết Minh Bạch • Không Phụ Phí Ẩn
          </span>
          <Heading className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
            BẢNG GIÁ XE GHÉP
          </Heading>
          <p className="text-[11px] sm:text-sm text-slate-600 italic px-2">
            Giá đã bao gồm phí cầu đường bến bãi – Cam kết là xe riêng đời
            mới, đưa đón tại nhà – Miễn phí huỷ chuyến.
          </p>
        </div>

        {/* Lưới 9 RouteCard: 2 cột trên mobile, 2 cột trên md, 3 cột trên lg */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
          {routes.map((route) => (
            <RoutePricingCard key={route.slug} route={route} hotlineHref={hotlineHref} />
          ))}
        </div>
      </div>
    </section>
  );
}
