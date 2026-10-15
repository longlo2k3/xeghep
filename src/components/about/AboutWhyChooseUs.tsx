import { Award, ShieldCheck, MapPin, Users, BadgePercent, Clock } from "lucide-react";
import { SIX_COMMITMENTS, type Commitment } from "@/data/company-info";

const COMMITMENT_ICONS: Record<string, React.ElementType> = {
  ShieldCheck,
  MapPin,
  Users,
  BadgePercent,
  Clock,
  Award,
};

export function AboutWhyChooseUs({
  commitments = SIX_COMMITMENTS,
}: {
  commitments?: Commitment[];
}) {
  const items = commitments && commitments.length > 0 ? commitments : SIX_COMMITMENTS;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
      {/* H2 Title with Badge 6 to match other sections */}
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          6
        </span>
        <span>Vì Sao Chọn Chúng Tôi & Cam Kết Vàng</span>
      </h2>

      <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
        Với phương châm <strong>“Khách hàng là thượng đế – An toàn là ưu tiên số 1”</strong>, Xe Ghép Liên Tỉnh cam kết mang tới chất lượng dịch vụ vượt trội, bảo vệ quyền lợi tối đa cho hành khách trên mọi chặng đường.
      </p>

      {/* Grid 6 Cam Kết Dịch Vụ Vàng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pt-1">
        {items.map((item, idx) => {
          const IconComponent = COMMITMENT_ICONS[item.iconName] || Award;

          return (
            <article
              key={item.id}
              className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-amber-50/30 to-white border border-amber-200/90 hover:border-amber-400 hover:shadow-md transition-all duration-300 space-y-2.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-105 transition-transform">
                  0{idx + 1}
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-700 flex items-center justify-center">
                  <IconComponent className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>

              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>

      {/* Banner Khẩu Hiệu Nổi Bật Dưới Cùng */}
      <div className="mt-2 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white text-center shadow-md">
        <p className="text-xs sm:text-sm md:text-base font-black tracking-wide uppercase">
          XE GHÉP – XE TIỆN CHUYẾN MÓNG CÁI – HẠ LONG – HẢI PHÒNG – BẮC NINH – BẮC GIANG – HÀ NỘI.
        </p>
      </div>
    </div>
  );
}
