import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { BookingForm } from "@/components/booking/BookingForm";
import { COMPANY_INFO } from "@/data/company-info";
import { getRoutes, getCompanySettings } from "@/lib/api";
import { constructMetadata } from "@/lib/seo";
import { Phone, Clock, MessageSquare, Mail, Globe, MapPin } from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Liên Hệ Đặt Xe Ghép - Phục Vụ 24/7 Toàn Tuyến Liên Tỉnh",
  description:
    "Tổng đài liên hệ và đặt xe ghép liên tỉnh 24/7. Hỗ trợ đón trả tận nhà, bao xe riêng, gửi hàng hỏa tốc các tuyến Móng Cái – Hạ Long – Hải Phòng – Bắc Ninh – Bắc Giang – Hà Nội.",
  path: "/lien-he",
});

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default async function ContactPage() {
  const [companySettings, routes] = await Promise.all([
    getCompanySettings(),
    getRoutes(),
  ]);
  const info = companySettings.info ?? COMPANY_INFO;
  const address = companySettings.address;
  const mapEmbedUrl =
    companySettings.mapEmbedUrl ||
    "https://maps.google.com/maps?q=Le+Chan,+Hai+Phong,+Vietnam&t=&z=14&ie=UTF8&iwloc=&output=embed";

  const breadcrumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Liên hệ", path: "/lien-he" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header & H1 per spec_v2.md Section 7 */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100 px-3.5 py-1 rounded-full inline-block">
              Hỗ Trợ 24/7
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Liên hệ
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Tổng đài trực 24/7 giải đáp mọi thắc mắc, tiếp nhận đặt chuyến, ký
              gửi hàng hóa và hỗ trợ đổi hủy chuyến miễn phí.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cột Trái: Hotline, Email, Fanpage, Kênh gọi nhanh với Background letan.png làm mờ */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6 overflow-hidden">
                {/* Background image letan.png rõ nét, làm mờ quang học và có lớp phủ để chữ nổi bật */}
                <div
                  className="absolute inset-0 pointer-events-none select-none overflow-hidden"
                  aria-hidden="true"
                >
                  <Image
                    src="/letan.webp"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center filter blur-[2px] scale-105"
                  />
                  {/* Lớp phủ sáng mờ trong suốt để ảnh nền hiện rõ nhưng text vẫn đọc được dễ dàng */}
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
                </div>

                <div className="relative z-10 space-y-6">
                  <h2 className="text-xl font-black text-slate-900 pb-2 border-b border-slate-300/80 uppercase">
                    Thông Tin Liên Hệ
                  </h2>

                  <div className="space-y-3.5 text-sm text-slate-900">
                    {address && (
                      <div className="flex items-start gap-3.5 bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-white/70 shadow-2xs">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <strong className="block text-slate-900 font-bold mb-0.5">
                            Địa Chỉ Văn Phòng:
                          </strong>
                          <p className="text-xs sm:text-sm text-slate-800 font-medium">
                            {address}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3.5 bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-white/70 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                        <Phone className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <strong className="block text-slate-900 font-bold mb-0.5">
                          Hotline Tổng Đài 24/7:
                        </strong>
                        <a
                          href={info.hotlineHref}
                          className="text-lg font-black text-red-600 hover:underline block"
                        >
                          {info.hotline}
                        </a>
                        <span className="text-xs text-slate-600 font-medium">
                          Phục vụ 24/7 liên tục cả ngày và đêm
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-white/70 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="block text-slate-900 font-bold mb-0.5">
                          Email Hỗ Trợ:
                        </strong>
                        <a
                          href={`mailto:${info.email}`}
                          className="text-xs sm:text-sm text-slate-800 hover:underline font-semibold"
                        >
                          {info.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-white/70 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                        <FacebookIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <strong className="block text-slate-900 font-bold mb-0.5">
                          Fanpage Facebook:
                        </strong>
                        <a
                          href={info.fanpageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-blue-700 hover:underline font-bold"
                        >
                          {info.fanpage}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-white/70 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="block text-slate-900 font-bold mb-0.5">
                          Website Chính Thức:
                        </strong>
                        <p className="text-xs sm:text-sm text-slate-800 font-semibold">
                          {info.domainName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-white/70 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="block text-slate-900 font-bold mb-0.5">
                          Thời Gian Làm Việc:
                        </strong>
                        <p className="text-xs sm:text-sm text-slate-800 font-medium">
                          {info.workingHours}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Kênh gọi nhanh / Zalo */}
                  <div className="pt-2 flex gap-3">
                    <a
                      href={info.zaloHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Nhắn Tin Zalo</span>
                    </a>
                    <a
                      href={info.hotlineHref}
                      className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Gọi Hotline</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột Phải: Form Đặt Xe Trực Tuyến Tại Đây (thay thế Card Gửi Phản Hồi) */}
            <div className="lg:col-span-7">
              <BookingForm
                title="ĐẶT XE TRỰC TUYẾN TẠI ĐÂY"
                routes={routes}
                companyInfo={info}
              />
            </div>
          </div>

          {/* Bản đồ vị trí (Google Maps Embed) */}
          <section
            aria-label="Bản đồ vị trí văn phòng"
            className="w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-white"
          >
            <div className="relative w-full h-[380px] sm:h-[480px]">
              <iframe
                title="Bản đồ vị trí văn phòng"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
