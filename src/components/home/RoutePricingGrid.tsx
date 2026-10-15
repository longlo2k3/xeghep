import Image from "next/image";
import Link from "next/link";
import { type RouteItem } from "@/lib/types";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";

const ROUTE_LOCATION_IMAGES: Record<string, string> = {
  "hai-phong-bac-ninh-bac-giang": "/HaiPhong.webp",
  "hai-phong-ha-noi-noi-bai": "/NoiBai.webp",
  "hai-phong-ha-long": "/HaLong.webp",
  "hai-phong-mong-cai": "/MongCai.webp",
  "ha-long-bac-ninh-bac-giang": "/BacNinh.webp",
  "ha-noi-mong-cai": "/MongCai.webp",
  "ha-noi-ha-long": "/HaLong.webp",
  "hai-phong-hai-duong": "/HaiPhong.webp",
  "hai-phong-thai-nguyen": "/BacNinh.webp",
};

export function RoutePricingCard({ route }: { route: RouteItem }) {
  const bgImage = ROUTE_LOCATION_IMAGES[route.slug] || "/HaiPhong.webp";

  return (
    <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-200 hover:border-red-500 group flex flex-col justify-between bg-slate-950 transition-all duration-300">
      {/* Background Image: Server-rendered static image with hover zoom */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt={`Tuyến xe ghép ${route.name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          decoding="async"
          className="object-cover object-center transition-transform duration-700 transform group-hover:scale-105 pointer-events-none"
        />

        {/* Deep Gradient Scrim Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/40 pointer-events-none" />
      </div>

      {/* Top Header Information: Badges */}
      <div className="relative z-10 p-1.5 sm:p-4 flex items-center justify-between gap-1">
        <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-[9px] sm:text-xs font-bold text-white border border-white/20 shadow-sm">
          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-400 flex-shrink-0" />
          <span className="truncate">{route.duration}</span>
        </span>

        <span className="inline-block px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[8px] sm:text-[10px] font-bold border border-emerald-400/30">
          Chạy 24/7
        </span>
      </div>

      {/* Main Content Area: Route Title, Price, Breakdown & CTA */}
      <div className="relative z-10 p-2 sm:p-4 pt-0 sm:pt-2 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-3">
        {/* Name */}
        <div>
          <Link href={`/tuyen-lien-tinh/${route.slug}`}>
            <h3 className="text-[11px] sm:text-base font-black text-white uppercase drop-shadow-md tracking-tight leading-snug line-clamp-2 min-h-[1.85rem] sm:min-h-[2.5rem] hover:text-amber-300 transition-colors">
              {route.name}
            </h3>
          </Link>
        </div>

        {/* --- MOBILE COMPACT PRICING: Lưới 2 cột đồng nhất 100%, không bị lệch dù 3 hay 4 giá --- */}
        <div className="bg-slate-950/80 backdrop-blur-sm rounded-lg p-1.5 border border-white/10 sm:hidden">
          <div className="text-[8px] font-extrabold uppercase tracking-wider text-amber-400/90 border-b border-white/10 pb-0.5 mb-1 flex items-center justify-between">
            <span>BẢNG GIÁ CHI TIẾT</span>
            <span className="text-[7.5px] text-slate-400 font-normal lowercase">
              trọn gói
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-1.5 gap-y-1 min-h-[50px] content-start">
            {route.pricingDetails.map((detail, idx) => (
              <div key={idx} className="flex flex-col min-w-0">
                <span className="text-[8px] text-slate-300 truncate flex items-center gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="truncate">{detail.label}</span>
                </span>
                <span className="font-extrabold text-amber-300 truncate pl-1.5 leading-tight text-[9.5px]">
                  {detail.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* --- DESKTOP FULL DETAILED PRICING (hidden sm:block) --- */}
        <div className="hidden sm:block bg-slate-950/75 backdrop-blur-sm rounded-xl p-3 border border-white/10 space-y-1.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400/90 border-b border-white/10 pb-1 flex items-center justify-between">
            <span>BẢNG GIÁ CHI TIẾT</span>
            <span className="text-[9px] text-slate-400 font-normal lowercase">
              trọn gói
            </span>
          </div>
          <div className="space-y-1">
            {route.pricingDetails.map((detail, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-0.5 border-b border-dashed border-white/10 last:border-0"
              >
                <span className="text-slate-300 flex items-center gap-1 truncate max-w-[58%] sm:max-w-none">
                  <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="truncate">{detail.label}</span>
                </span>
                <span className="font-extrabold text-amber-300 text-right flex-shrink-0 text-xs">
                  {detail.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-1 sm:space-y-1.5 pt-0.5">
          <Link
            href={`/tuyen-lien-tinh/${route.slug}#form-dat-xe`}
            className="w-full py-1 sm:py-2 px-1.5 sm:px-3 rounded-md sm:rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-[10px] sm:text-xs text-center shadow-md shadow-red-600/30 flex items-center justify-center gap-1 transition-all hover:scale-[1.01]"
          >
            <span>ĐẶT XE NGAY</span>
            <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
          </Link>

          <Link
            href={`/tuyen-lien-tinh/${route.slug}`}
            className="hidden sm:block text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors py-0.5"
          >
            Chi tiết tuyến &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RoutePricingGrid({ routes }: { routes: RouteItem[] }) {
  return (
    <section className="py-8 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* H2 Title per spec_v2.md Section 4 */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-12 space-y-2 sm:space-y-3">
          <span className="inline-block px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-red-50 text-red-600 border border-red-200 font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-sm">
            Niêm Yết Minh Bạch • Không Phụ Phí Ẩn
          </span>
          <h2 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
            BẢNG GIÁ XE GHÉP
          </h2>
          <p className="text-[11px] sm:text-sm text-slate-600 italic px-2">
            Giá đã bao gồm phí cầu đường bến bãi – Cam kết 100% xe riêng đời
            mới, đưa đón tại nhà – Miễn phí huỷ chuyến.
          </p>
        </div>

        {/* Lưới 9 RouteCard: 2 cột trên mobile, 2 cột trên md, 3 cột trên lg */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
          {routes.map((route) => (
            <RoutePricingCard key={route.slug} route={route} />
          ))}
        </div>
      </div>
    </section>
  );
}
