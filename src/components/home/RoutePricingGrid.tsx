import Link from "next/link";
import { type RouteItem } from "@/lib/types";
import { Clock, ArrowRight, User, Users, Car } from "lucide-react";

function getServiceIcon(label: string, className: string) {
  const lower = label.toLowerCase();
  if (lower.includes("1 người") || lower.includes("1 khách")) {
    return <User className={className} />;
  }
  if (
    lower.includes("2 người") ||
    lower.includes("nhóm") ||
    lower.includes("ghép")
  ) {
    return <Users className={className} />;
  }
  return <Car className={className} />;
}

export function RoutePricingCard({ route }: { route: RouteItem }) {
  return (
    <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_15px_35px_rgba(217,38,28,0.12)] border border-slate-200/90 hover:border-red-400 group flex flex-col justify-between bg-white transform hover:-translate-y-1 transition-all duration-300 ease-out">
      {/* Top Header Information: Badges */}
      <div className="relative z-10 p-2.5 sm:p-4 pb-1 sm:pb-2 flex items-center justify-between gap-1">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-100 text-[11px] sm:text-xs font-semibold text-slate-600">
          <Clock className="w-3 h-3 text-slate-500 flex-shrink-0" />
          <span className="truncate">{route.duration}</span>
        </span>

        {/* Ẩn chữ 'Chạy' trên mobile nhỏ để tiết kiệm diện tích, giữ nguyên ý nghĩa */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>24/7</span>
        </span>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 p-2.5 sm:p-4 pt-1 sm:pt-2 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3">
        {/* Route Title: Tăng từ 11px lên 13px (text-xs/sm) trên mobile */}
        <div>
          <Link href={`/tuyen-lien-tinh/${route.slug}`}>
            <h3 className="text-[13px] sm:text-base font-black text-[#0f172a] uppercase tracking-tight leading-snug line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] group-hover:text-[#d9261c] transition-colors">
              {route.name}
            </h3>
          </Link>
        </div>

        {/* --- BẢNG GIÁ UNIFIED (Tự nhiên trên cả Mobile & Desktop, không cần tách 2 khối DOM) --- */}
        <div className="bg-slate-50/70 rounded-lg sm:rounded-xl p-1.5 sm:p-3 border border-slate-200/80 space-y-1 sm:space-y-1.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#881313] border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>BẢNG GIÁ</span>
            <span className="text-[9px] text-slate-500 font-medium lowercase bg-white px-1.5 py-0.5 rounded border border-slate-200/70">
              trọn gói
            </span>
          </div>

          {/* Mobile: lưới 2 cột theo mẫu; từ sm trở lên giữ các dòng ngang hiện tại. */}
          <div
            data-testid="pricing-details"
            className="grid grid-cols-2 gap-x-1.5 gap-y-1.5 sm:block sm:space-y-1"
          >
            {route.pricingDetails.map((detail, idx) => (
              <div
                key={idx}
                className="min-w-0 px-0.5 sm:flex sm:items-center sm:justify-between sm:py-1 sm:px-2 sm:rounded sm:odd:bg-white sm:even:bg-slate-100/80"
              >
                <span className="flex min-w-0 items-center gap-1 whitespace-nowrap text-[9px] font-medium leading-none text-slate-700 sm:text-xs sm:truncate sm:pr-1">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 flex-none rounded-full bg-[#fcd34d] sm:hidden"
                  />
                  {getServiceIcon(
                    detail.label,
                    "hidden sm:block w-3.5 h-3.5 text-slate-400 flex-shrink-0",
                  )}
                  <span className="min-w-0 sm:truncate">{detail.label}</span>
                </span>
                <span className="mt-0.5 block whitespace-nowrap pl-2.5 text-left text-[11px] font-extrabold leading-tight text-[#d9261c] sm:mt-0 sm:pl-0 sm:text-right sm:text-xs sm:flex-shrink-0">
                  {detail.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions: Nút bấm cao ráo, chuẩn kích thước chạm ngón tay */}
        <div className="space-y-1.5 pt-0.5">
          <a
            href="tel:0962298293"
            className="w-full py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl bg-[#d9261c] hover:bg-[#b81d14] active:scale-[0.98] text-white font-bold text-xs text-center shadow-sm shadow-red-500/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <span>GỌI NGAY</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>

          <Link
            href={`/tuyen-lien-tinh/${route.slug}`}
            className="hidden sm:block text-center text-xs font-semibold text-slate-600 hover:text-[#d9261c] transition-colors py-0.5"
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
    <section className="py-8 sm:py-20 bg-slate-100/60 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* H2 Title per spec_v2.md Section 4 */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-12 space-y-2 sm:space-y-3">
          <span className="inline-block px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-sm">
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
