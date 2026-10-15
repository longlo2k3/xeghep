import type { Metadata } from "next";
import Link from "next/link";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AboutWhyChooseUs } from "@/components/about/AboutWhyChooseUs";
import { COMPANY_INFO } from "@/data/company-info";
import { getRoutes, getCompanySettings } from "@/lib/api";
import {
  Users,
  Clock,
  ShieldCheck,
  Car,
  MapPin,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Giới Thiệu Về Xe Ghép Liên Tỉnh - Tiện Chuyến Đón Tận Nhà",
  description:
    "Giới thiệu dịch vụ Xe Ghép Liên Tỉnh chuyên tuyến Móng Cái – Hạ Long – Hải Phòng – Bắc Ninh – Bắc Giang – Hà Nội. 100% xe riêng đời mới, phục vụ 24/7.",
  path: "/gioi-thieu",
});

export default async function GioiThieuPage() {
  const [companySettings, routes] = await Promise.all([
    getCompanySettings(),
    getRoutes(),
  ]);
  const info = companySettings.info ?? COMPANY_INFO;

  const breadcrumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Giới thiệu", path: "/gioi-thieu" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <div className="py-10 sm:py-16 bg-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header & H1 per spec_v2.md Section 4 */}
          <div className="text-center space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
              Uy Tín • Tận Tâm • Tiết Kiệm
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Giới thiệu về Xe Ghép Liên Tỉnh
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Giải pháp di chuyển liên tỉnh tiện lợi, tiết kiệm chi phí và an
              toàn hàng đầu miền Bắc.
            </p>
          </div>

          {/* 1. Về chúng tôi per spec_v2.md Section 4 */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center text-sm font-bold">
                1
              </span>
              <span>Về Chúng Tôi</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              <strong>{info.name}</strong> là đơn vị tiên phong cung cấp
              giải pháp xe ghép, xe tiện chuyến và bao xe riêng cao cấp kết nối
              các tỉnh thành trọng điểm:{" "}
              <strong>
                {info.coverage || "Móng Cái – Hạ Long – Hải Phòng – Bắc Ninh – Bắc Giang – Hà Nội"}
              </strong>
              .
            </p>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              Với mô hình đón và trả tận nhà, chúng tôi giúp hành khách xóa bỏ
              hoàn toàn nỗi vất vả khi phải chen chúc tại bến xe, bắt xe dù dọc
              đường hoặc trả mức chi phí đắt đỏ cho taxi truyền thống. 100%
              phương tiện vận hành đều là xe riêng đời mới, được kiểm định an
              toàn và vệ sinh sạch sẽ trước mỗi chuyến đi.
            </p>
          </div>

          {/* 2. Ưu điểm nổi bật (5 icon cards) per spec_v2.md Section 4 */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center text-sm font-bold">
                2
              </span>
              <span>Ưu Điểm Nổi Bật</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Chỉ Ghép 1–3 Khách
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Không gian xe thoáng đãng, rộng rãi, không nhồi nhét hành
                  khách.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Xuất Phát Nhanh Chóng
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Chạy thẳng đường cao tốc, không đi vòng vèo đón khách dọc
                  đường.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Giá Rõ Ràng Trọn Gói
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Báo giá niêm yết đã bao gồm cầu đường bến bãi, không có phụ
                  phí ẩn.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  100% Xe Đời Mới
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dòng xe 4, 5, 7 chỗ sạch sẽ không mùi, điều hòa mát lạnh êm
                  ái.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 sm:col-span-2 lg:col-span-2">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Đón Trả Tận Nơi 24/7
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Phục vụ 2 chiều cả ngày lẫn đêm, các ngày cuối tuần và dịp lễ
                  tết.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Phạm vi phục vụ (Danh sách tuyến) per spec_v2.md Section 4 */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center text-sm font-bold">
                3
              </span>
              <span>Phạm Vi Phục Vụ</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Danh sách 9 tuyến trọng điểm liên tỉnh kết nối liên tục:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {routes.map((route) => (
                <Link
                  key={route.slug}
                  href={`/tuyen-lien-tinh/${route.slug}`}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-red-400 hover:bg-red-50/50 transition-all flex items-center justify-between text-xs font-bold text-slate-800 group"
                >
                  <span className="group-hover:text-red-700 transition-colors truncate pr-2">
                    {route.name}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* 4. Dịch vụ cung cấp per spec_v2.md Section 4 */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center text-sm font-bold">
                4
              </span>
              <span>Dịch Vụ Cung Cấp</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <h3 className="font-extrabold text-slate-900 text-base text-red-700">
                  Xe Đi Ghép
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tiết kiệm chi phí tối đa, xe chỉ ghép 1-3 khách, đón trả tại
                  nhà, chạy thẳng cao tốc.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <h3 className="font-extrabold text-slate-900 text-base text-red-700">
                  Bao Xe Riêng
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bao trọn gói xe 4, 5, 7 chỗ riêng tư tuyệt đối, khách hàng
                  toàn quyền chủ động giờ xuất phát.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <h3 className="font-extrabold text-slate-900 text-base text-red-700">
                  Gửi Hàng Hỏa Tốc
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ký gửi hàng hóa, tài liệu, bưu phẩm hỏa tốc giá chỉ từ 150k
                  giao nhận tận tay trong ngày.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Quy trình đặt xe 4 bước per spec_v2.md Section 4 */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center text-sm font-bold">
                5
              </span>
              <span>Quy Trình Đặt Xe 4 Bước</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-8 h-8 rounded-full bg-red-600 text-white font-black flex items-center justify-center mx-auto text-xs">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Gọi / Điền Form
                </h3>
                <p className="text-[11px] text-slate-600">
                  Liên hệ hotline {info.hotline} hoặc điền form.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-8 h-8 rounded-full bg-red-600 text-white font-black flex items-center justify-center mx-auto text-xs">
                  2
                </span>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Báo Giá Trọn Gói
                </h3>
                <p className="text-[11px] text-slate-600">
                  Tổng đài xác nhận điểm đón và báo giá niêm yết.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-8 h-8 rounded-full bg-red-600 text-white font-black flex items-center justify-center mx-auto text-xs">
                  3
                </span>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Đón Tận Nhà
                </h3>
                <p className="text-[11px] text-slate-600">
                  Tài xế liên hệ trước 15 phút, đón đúng hẹn tại cửa.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-8 h-8 rounded-full bg-red-600 text-white font-black flex items-center justify-center mx-auto text-xs">
                  4
                </span>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Thanh Toán Sau Chuyến
                </h3>
                <p className="text-[11px] text-slate-600">
                  Thanh toán linh hoạt tiền mặt hoặc chuyển khoản.
                </p>
              </div>
            </div>
          </div>

          {/* 6. Cam kết vàng (AboutWhyChooseUs) */}
          <AboutWhyChooseUs commitments={companySettings.commitments} />
        </div>
      </div>
    </>
  );
}
