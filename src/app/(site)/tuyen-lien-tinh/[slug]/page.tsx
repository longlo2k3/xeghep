import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getRoute,
  getRoutes,
  getCompanySettings,
  isNotFoundError,
} from "@/lib/api";
import { COMPANY_INFO } from "@/data/company-info";
import { buildRouteServiceSchema } from "@/lib/schema";
import { BookingForm } from "@/components/booking/BookingForm";
import { RouteImageSlideshow } from "@/components/routes/RouteImageSlideshow";
import {
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  PhoneCall,
  CalendarCheck,
  Users,
  Package,
} from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

// SSG Pre-rendering for all routes
export async function generateStaticParams() {
  const routes = await getRoutes({ fields: "slug" });
  return routes.map((route) => ({
    slug: route.slug,
  }));
}

// Next.js 15+ generateMetadata with awaited params
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const route = await getRoute(slug);

    return constructMetadata({
      title: `Xe Ghép ${route.name} - Giá Từ ${route.priceShare1Text}`,
      description: `Dịch vụ xe tiện chuyến và xe ghép ${route.name} đón trả tận nhà. Giá ghép chỉ từ ${route.priceShare1Text}, bao xe riêng chỉ từ ${route.priceCharter4to5Text}. Xe đời mới, phục vụ 24/7.`,
      path: `/tuyen-lien-tinh/${route.slug}`,
    });
  } catch (error) {
    if (isNotFoundError(error)) return {};
    throw error;
  }
}

export default async function RouteDetailPage({ params }: Props) {
  const { slug } = await params;

  let route;
  try {
    route = await getRoute(slug);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound(); // True HTTP 404 per AGENTS.md rule 4.4 & 14.1
    }
    throw error;
  }

  const [routes, companySettings] = await Promise.all([
    getRoutes(),
    getCompanySettings(),
  ]);
  const info = companySettings.info ?? COMPANY_INFO;

  const breadcrumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Các tuyến liên tỉnh", path: "/tuyen-lien-tinh" },
    { name: `Xe ghép ${route.name}`, path: `/tuyen-lien-tinh/${route.slug}` },
  ];

  const serviceSchema = buildRouteServiceSchema({
    name: `Xe ghép ${route.name}`,
    description: route.description,
    priceFrom: route.priceFrom,
    origin: route.origin,
    destination: route.destination,
    path: `/tuyen-lien-tinh/${route.slug}`,
  });

  const relatedRoutes = route.relatedRoutes.length
    ? route.relatedRoutes
    : routes.filter((r) => r.slug !== route.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={serviceSchema} />
      <Breadcrumbs items={breadcrumbs} />

      <div className="py-10 sm:py-16 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Hero Tuyến per spec_v2.md 5.2 */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>100% Xe Riêng Đời Mới • Đưa Đón Tận Nhà 24/7</span>
                </span>

                {/* H1 per spec_v2.md 5.2 */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                  Xe ghép {route.name}
                </h1>

                {/* 1 câu giá "từ …k" per spec_v2.md 5.2 */}
                <p className="text-lg sm:text-xl font-bold text-red-600">
                  Giá vé ghép chỉ từ{" "}
                  <span className="text-2xl font-black underline">
                    {route.priceShare1Text}
                  </span>{" "}
                  / khách (Đã bao gồm phí cầu đường)
                </p>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {route.description}
                </p>

                <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3.5 py-2 rounded-xl">
                    <MapPin
                      className="w-4 h-4 text-red-600"
                      aria-hidden="true"
                    />
                    <span>
                      Cự ly: <strong>{route.distance}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3.5 py-2 rounded-xl">
                    <Clock
                      className="w-4 h-4 text-red-600"
                      aria-hidden="true"
                    />
                    <span>
                      Thời gian dự kiến: <strong>{route.duration}</strong>
                    </span>
                  </div>
                </div>

                {/* Nút "GỌI NGAY: ..." */}
                <div className="pt-2 flex flex-wrap gap-3">
                  <a
                    href={info.hotlineHref}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-sm sm:text-base shadow-lg shadow-red-600/30 transition-all hover:scale-105"
                  >
                    <PhoneCall className="w-5 h-5 animate-pulse" />
                    <span>GỌI NGAY: {info.hotline}</span>
                  </a>

                  <a
                    href="#form-dat-xe"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base transition-colors"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Điền Form Đặt Xe</span>
                  </a>
                </div>
              </div>

              {/* Slideshow hình ảnh thực tế tương ứng từng tuyến */}
              <div className="lg:col-span-5 relative">
                <RouteImageSlideshow route={route} />
              </div>
            </div>
          </div>

          {/* PriceTable: Bảng giá chi tiết theo loại xe per spec_v2.md 5.2 */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase flex items-center gap-2">
              <ShieldCheck
                className="w-6 h-6 text-red-600"
                aria-hidden="true"
              />
              <span>Bảng Giá Chi Tiết Tuyến {route.name}</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-extrabold border-b border-slate-200 text-xs sm:text-sm">
                    <th className="py-3 px-3 sm:py-3.5 sm:px-4">
                      <span className="sm:hidden">Loại hình DV</span>
                      <span className="hidden sm:inline">
                        Loại Hình Dịch Vụ
                      </span>
                    </th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">
                      Đặc Điểm & Số Lượng
                    </th>
                    <th className="py-3 px-3 sm:py-3.5 sm:px-4 text-right sm:text-left">
                      <span className="sm:hidden">Giá</span>
                      <span className="hidden sm:inline">Mức Giá Niêm Yết</span>
                    </th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">
                      Chính Sách Đón Trả
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {route.pricingDetails.map((detail, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3.5 sm:py-4 px-3 sm:px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span>{detail.label}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-xs sm:text-sm hidden sm:table-cell">
                        {detail.label.includes("Ghép")
                          ? "Xe 4 - 7 chỗ đời mới, chỉ ghép 1-3 khách"
                          : "Xe riêng trọn gói, chủ động giờ xuất phát"}
                      </td>
                      <td className="py-3.5 sm:py-4 px-3 sm:px-4 font-black text-red-600 text-base sm:text-lg text-right sm:text-left whitespace-nowrap">
                        {detail.price}
                      </td>
                      <td className="py-4 px-4 text-emerald-700 font-semibold text-xs sm:text-sm hidden sm:table-cell">
                        Đón trả tận nhà 2 chiều
                      </td>
                    </tr>
                  ))}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 sm:py-4 px-3 sm:px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Gửi hàng hỏa tốc</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-xs sm:text-sm hidden sm:table-cell">
                      Tài liệu, bưu phẩm, kiện hàng trong ngày
                    </td>
                    <td className="py-3.5 sm:py-4 px-3 sm:px-4 font-black text-amber-600 text-base text-right sm:text-left whitespace-nowrap">
                      Từ 150.000đ
                    </td>
                    <td className="py-4 px-4 text-emerald-700 font-semibold text-xs sm:text-sm hidden sm:table-cell">
                      Giao nhận tận tay
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-500 italic flex items-center gap-1.5 pt-2 border-t border-slate-100">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Giá đã bao gồm phí cầu đường bến bãi – Cam kết 100% xe riêng đời
                mới, đưa đón tại nhà – Miễn phí huỷ chuyến.
              </span>
            </p>
          </div>

          {/* Thông tin chuyến: Điểm đón trả, giờ chạy 24/7 per spec_v2.md 5.2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <span>Khu Vực Đón & Trả Khách Tuyến {route.name}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600">
                {/* Điểm đón */}
                <section aria-labelledby="pickup-heading">
                  <h3
                    id="pickup-heading"
                    className="mb-3 font-bold text-slate-900"
                  >
                    Điểm đón thuận tiện
                  </h3>

                  <ul className="list-disc space-y-2 pl-5 text-xs leading-relaxed sm:text-sm">
                    {route.pickups.map((pickup, index) => (
                      <li key={`${pickup}-${index}`}>{pickup}</li>
                    ))}
                  </ul>
                </section>

                {/* Điểm trả */}
                <section aria-labelledby="dropoff-heading">
                  <h3
                    id="dropoff-heading"
                    className="mb-3 font-bold text-slate-900"
                  >
                    Điểm trả tận nơi
                  </h3>

                  <ul className="list-disc space-y-2 pl-5 text-xs leading-relaxed sm:text-sm">
                    {route.dropoffs.map((dropoff, index) => (
                      <li key={`${dropoff}-${index}`}>{dropoff}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span>Khung Giờ Chạy & Tần Suất</span>
              </h2>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                <p>
                  <strong>Giờ hoạt động:</strong> Phục vụ liên tục{" "}
                  <strong>24/7</strong> cả ngày lẫn đêm, các ngày cuối tuần và
                  dịp lễ, Tết.
                </p>
                <p>
                  <strong>Tần suất xuất phát:</strong> Xe xuất phát liên tục sau
                  mỗi 30–60 phút khi có khách đặt. Quý khách có thể chủ động hẹn
                  giờ đón theo nhu cầu.
                </p>
                <p>
                  <strong>Lưu ý:</strong> Nên đặt trước từ 30 phút đến 1 tiếng
                  để tổng đài sắp xếp xe gần nhất đón quý khách đúng giờ.
                </p>
              </div>
            </div>
          </div>

          {/* Giới thiệu tuyến (chuẩn SEO) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">
              Giới Thiệu Tuyến Xe Ghép {route.name}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Tuyến xe ghép <strong>{route.name}</strong> là dịch vụ tiện chuyến
              chất lượng cao của {info.name}, đáp ứng nhu cầu đi lại công tác,
              thăm người thân, khám chữa bệnh và du lịch. Thay vì phải di chuyển
              ra bến xe và chờ đợi xe khách đông đúc, quý khách chỉ cần ngồi tại
              nhà, tài xế sẽ đến tận cửa đón đúng giờ và đưa quý khách đến chính
              xác địa chỉ cần tới.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Toàn bộ các xe phục vụ tuyến đều là xe đời mới (sedan 4-5 chỗ và
              SUV 7 chỗ), trang bị điều hòa mát lạnh, wifi, nước uống và nội
              thất sạch sẽ. Lái xe nhiều năm kinh nghiệm, thông thạo lộ trình
              cao tốc, đảm bảo hành trình luôn an toàn và êm ái nhất.
            </p>
          </div>

          {/* FAQ câu hỏi thường gặp per spec_v2.md 5.2 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-red-600" />
              <span>Câu Hỏi Thường Gặp Về Tuyến {route.name}</span>
            </h2>

            <div className="space-y-4">
              {route.faqs.map((faq, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                >
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-start gap-2">
                    <span className="text-red-600 font-black">Q:</span>
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tuyến liên quan + CTA hotline per spec_v2.md 5.2 */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 uppercase">
              Các Tuyến Xe Ghép Liên Tỉnh Khác
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedRoutes.map((r) => (
                <Link
                  key={r.slug}
                  href={`/tuyen-lien-tinh/${r.slug}`}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-red-400 hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-red-600 mb-1">
                      {r.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {r.distance} • {r.duration}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-red-600">
                      từ {r.priceShare1Text}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>

            {/* BookingForm: Điền sẵn Điểm đón / Điểm đến theo tuyến per spec_v2.md 5.2 */}
            <div className="max-w-4xl mx-auto">
              <BookingForm
                routes={routes}
                companyInfo={info}
                initialOrigin={route.origin}
                initialDestination={route.destination}
                initialRouteSlug={route.slug}
                title={`ĐẶT XE TUYẾN ${route.name.toUpperCase()}`}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
