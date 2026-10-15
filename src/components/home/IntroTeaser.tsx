import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Car,
  ShieldCheck,
  MapPin,
  Sparkles,
  Zap,
} from "lucide-react";

export function IntroTeaser() {
  const highlightFeatures = [
    "Chỉ ghép 1–3 khách/chuyến, không gian rộng rãi",
    "Xuất phát nhanh, không chờ đợi gom khách lâu",
    "Giá rõ ràng, trọn gói gồm phí cầu đường bến bãi",
    "100% xe đời mới sạch sẽ, bảo dưỡng định kỳ",
    "Phục vụ 24/7 liên tục ngày đêm và các dịp lễ tết",
  ];

  const popularRoutes = [
    {
      route: "Móng Cái ⇄ Hạ Long ⇄ Hải Phòng ⇄ Hà Nội",
      desc: "Tuyến cao tốc huyết mạch kết nối du lịch, giao thương miền Bắc.",
      tag: "Cao tốc 100%",
      href: "/tuyen-lien-tinh/hai-phong-ha-noi-noi-bai",
    },
    {
      route: "Hà Nội ⇄ Bắc Ninh ⇄ Bắc Giang",
      desc: "Kết nối trung tâm thủ đô đến các khu công nghiệp trọng điểm.",
      tag: "KCN trọng điểm",
      href: "/tuyen-lien-tinh/ha-long-bac-ninh-bac-giang",
    },
    {
      route: "Hải Phòng ⇄ Bắc Ninh ⇄ Bắc Giang",
      desc: "Xe chạy liên tục, đưa đón kỹ sư, chuyên gia và người dân tận nơi.",
      tag: "Chạy liên tục",
      href: "/tuyen-lien-tinh/hai-phong-bac-ninh-bac-giang",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-slate-50/80 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header Title căn giữa chuẩn SEO (AGENTS.md Rule 3.2) */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="inline-block px-3 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 font-bold text-xs uppercase tracking-wider shadow-sm">
            Về Chúng Tôi
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight uppercase">
            GIỚI THIỆU VỀ XE GHÉP LIÊN TỈNH
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 italic">
            Giải pháp di chuyển văn minh, tiện lợi, tối ưu chi phí và đưa đón tận nhà trên mọi hành trình liên tỉnh miền Bắc.
          </p>
        </div>

        {/* Nội dung dạng 3 Cột Semantic <article> gọn gàng, vừa vặn */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch mb-8 sm:mb-10">
          
          {/* ============================================================ */}
          {/* CỘT 1: Giải pháp di chuyển tiết kiệm, nhanh chóng             */}
          {/* ============================================================ */}
          <article className="flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-red-200 transition-all duration-300 hover:-translate-y-0.5 group">
            <div>
              {/* Icon Header gọn gàng */}
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mb-3.5 shadow-sm group-hover:scale-105 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                <Car className="w-5 h-5" aria-hidden="true" />
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-2">
                Giải Pháp Di Chuyển Tiết Kiệm & Nhanh Chóng
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-4">
                Dịch vụ xe ghép liên tỉnh là lựa chọn tối ưu thay thế xe khách chật chội và taxi riêng đắt đỏ. Hành khách được đón và trả tận cửa nhà, chạy thẳng đường cao tốc êm ái, không bắt khách dọc đường, không sang xe chuyển tuyến.
              </p>
            </div>

            {/* Micro Highlights Tags */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" aria-hidden="true" />
                <span>Tiết kiệm lên tới 50% chi phí so với taxi</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Zap className="w-3.5 h-3.5 text-red-500 flex-shrink-0" aria-hidden="true" />
                <span>Thời gian di chuyển rút ngắn qua cao tốc</span>
              </div>
            </div>
          </article>

          {/* ============================================================ */}
          {/* CỘT 2: Ưu điểm nổi bật (Checklist tinh gọn)                   */}
          {/* ============================================================ */}
          <article className="flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 hover:-translate-y-0.5 group">
            <div>
              {/* Icon Header gọn gàng */}
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-3.5 shadow-sm group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-3">
                Ưu Điểm Nổi Bật Vượt Trội
              </h3>

              {/* Danh sách 5 cam kết tinh gọn dạng checklist */}
              <ul className="space-y-2">
                {highlightFeatures.map((text, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-700 leading-snug"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="font-medium">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block text-center">
                ✓ Cam kết dịch vụ chất lượng chuẩn 5 sao
              </span>
            </div>
          </article>

          {/* ============================================================ */}
          {/* CỘT 3: Các tuyến xe ghép liên tỉnh đang phục vụ               */}
          {/* ============================================================ */}
          <article className="md:col-span-2 lg:col-span-1 flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-0.5 group">
            <div>
              {/* Icon Header gọn gàng */}
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-3.5 shadow-sm group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <MapPin className="w-5 h-5" aria-hidden="true" />
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-3">
                Các Tuyến Trọng Điểm Đang Phục Vụ
              </h3>

              {/* Danh sách tuyến xe tinh gọn có liên kết nội bộ chuẩn SEO */}
              <div className="space-y-2">
                {popularRoutes.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="block p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all group/route"
                    title={`Xem bảng giá và lộ trình tuyến ${item.route}`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-0.5">
                      <span className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover/route:text-blue-600 transition-colors truncate">
                        {item.route}
                      </span>
                      <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate leading-normal">
                      {item.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 text-center">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                ✦ Kết nối liên tục 24/7 – Đón trả tận nhà
              </span>
            </div>
          </article>

        </div>

        {/* CTA: Nút "Xem thêm giới thiệu" có anchor text chuẩn SEO */}
        <div className="text-center">
          <Link
            href="/gioi-thieu"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-red-500/25 transition-all duration-300 hover:scale-105"
          >
            <span>Tìm hiểu chi tiết về dịch vụ xe ghép liên tỉnh</span>
            <ArrowRight className="w-4 h-4 text-red-300" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
