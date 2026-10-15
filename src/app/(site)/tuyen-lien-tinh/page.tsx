import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { RouteListing } from "@/components/routes/RouteListing";
import { BookingForm } from "@/components/booking/BookingForm";
import { getRoutes, getCompanySettings } from "@/lib/api";
import { COMPANY_INFO } from "@/data/company-info";
import { Phone, ShieldCheck, Clock, MapPin } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: "Các Tuyến Xe Ghép Liên Tỉnh - Bảng Giá Mới Nhất 2026",
  description:
    "Danh sách các tuyến xe ghép liên tỉnh đón trả tận nhà: Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang, Thái Nguyên, Hải Dương. Xe đời mới 4-7 chỗ 24/7.",
  path: "/tuyen-lien-tinh",
});

export default async function TuyenLienTinhPage() {
  const [companySettings, routes] = await Promise.all([
    getCompanySettings(),
    getRoutes(),
  ]);
  const info = companySettings.info ?? COMPANY_INFO;

  const breadcrumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Các tuyến liên tỉnh", path: "/tuyen-lien-tinh" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <div className="py-10 sm:py-16 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
              Lộ Trình Cao Tốc • Đưa Đón Tận Nhà
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Các tuyến xe ghép liên tỉnh
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Chọn điểm xuất phát hoặc điểm đến để tra cứu giá cước ghép ghế và
              bao xe riêng nhanh chóng.
            </p>
          </div>

          {/* Tab filter and RouteCard grid */}
          <RouteListing routes={routes} />

          {/* Khối ghi chú chung per spec_v2.md 5.1 */}
          <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
              <span>Quy Định & Cam Kết Chung Các Tuyến Liên Tỉnh</span>
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <span>
                  Xe ghép chỉ từ 1–3 khách/chuyến, tuyệt đối không nhồi nhét.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <span>Giá đã bao gồm trọn gói vé cầu đường, bến bãi, phà.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <span>
                  Phục vụ 2 chiều đón trả tận nhà, hoạt động 24/7 liên tục.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <span>
                  Miễn phí đổi hoặc hủy chuyến khi khách hàng đổi lộ trình.
                </span>
              </li>
            </ul>
          </div>

          {/* CTA gọi hotline & form đặt xe per spec_v2.md 5.1 */}
          <div className="max-w-4xl mx-auto space-y-8">
            <BookingForm
              title="ĐẶT XE LIÊN TỈNH TRỰC TUYẾN"
              routes={routes}
              companyInfo={info}
            />
          </div>
        </div>
      </div>
    </>
  );
}
