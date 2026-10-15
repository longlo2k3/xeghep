import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { BookingForm } from "@/components/booking/BookingForm";
import { getRoutes, getCompanySettings } from "@/lib/api";
import { ShieldCheck, Clock, Phone, Users } from "lucide-react";
import { COMPANY_INFO } from "@/data/company-info";

export const metadata: Metadata = constructMetadata({
  title: "Đặt Xe Trực Tuyến - Xe Ghép Liên Tỉnh",
  description:
    "Đặt xe ghép liên tỉnh Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang 24/7. Nhận báo giá tức thì, đón trả tận nhà, miễn phí hủy chuyến.",
  path: "/dat-xe",
});

export default async function BookingPage() {
  const [companySettings, routes] = await Promise.all([
    getCompanySettings(),
    getRoutes(),
  ]);
  const info = companySettings.info ?? COMPANY_INFO;

  const breadcrumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Đặt xe", path: "/dat-xe" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <div className="py-10 sm:py-16 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100 px-3.5 py-1 rounded-full inline-block">
              Đặt Chuyến Nhanh 24/7
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Đặt Xe Trực Tuyến
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Điền thông tin chuyến đi dưới đây để tổng đài xếp xe gần nhất đón quý khách. Hoặc liên hệ trực tiếp hotline {info.hotline}.
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-bold text-slate-900">
                <Users className="w-4 h-4 text-red-600" aria-hidden="true" />
                <span>Ghép 1 - 3 người</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-red-600" aria-hidden="true" />
                <span>Không phát sinh phụ phí</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-slate-900">
                <Clock className="w-4 h-4 text-red-600" aria-hidden="true" />
                <span>Đón trả tận nhà</span>
              </span>
            </div>
          </div>

          <BookingForm
            title="THÔNG TIN ĐẶT CHUYẾN"
            routes={routes}
            companyInfo={info}
          />
        </div>
      </div>
    </>
  );
}
