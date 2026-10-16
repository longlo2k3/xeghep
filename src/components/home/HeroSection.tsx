import Image from "next/image";
import { CheckCircle2, Zap, Award, Phone } from "lucide-react";
import { COMPANY_INFO } from "@/data/company-info";
import type { CompanyInfoData } from "@/lib/api";
import type { RouteItem } from "@/lib/types";

interface HeroSectionProps {
  routes?: RouteItem[];
  companyInfo?: CompanyInfoData;
}

export function HeroSection({
  routes = [],
  companyInfo = COMPANY_INFO,
}: HeroSectionProps) {
  const info = companyInfo ?? COMPANY_INFO;

  return (
    <section className="relative w-full overflow-hidden bg-slate-50 border-b border-slate-200">
      {/* Background: Ảnh đội xe màu trắng + Scrim gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src="/banner3.webp"
          alt="Đội xe riêng đời mới phục vụ xe ghép liên tỉnh"
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover object-[80%_center] sm:object-right select-none"
        />

        {/* Gradient làm mờ dần phần ảnh phía trái để chữ và thanh tìm kiếm luôn đọc rõ */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-white via-white/95 sm:via-white/80 via-45% to-transparent hidden lg:block"
          aria-hidden="true"
        />

        {/* Mobile (< sm): gradient trắng chỉ chiếm 50% chiều ngang bên trái.
            Tablet (sm → lg): overlay trắng 80% như cũ để bảo đảm tương phản chữ. */}
        <div
          className="absolute inset-0 [background-image:linear-gradient(to_right,#ffffff_0%,rgba(255,255,255,0)_60%)] sm:[background-image:none] sm:bg-white/80 lg:hidden"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-12 pb-14 sm:pb-20 lg:pb-24">
        {/* Banner nội dung phía trên */}
        <div className="flex flex-col gap-2.5 sm:gap-3.5 max-w-2xl">
          {/* H1 gồm 2 dòng, in hoa, font-black, line-height sát */}
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-5xl font-black tracking-tight uppercase leading-[1.08]">
            <span className="block text-red-600">XE GHÉP LIÊN TỈNH</span>
            <span className="block text-slate-900 mt-0.5 sm:mt-1">
              GIÁ CHỈ TỪ 200K
            </span>
          </h1>

          {/* Đoạn mô tả bên dưới H1 — mobile: ẩn nhưng vẫn giữ chiều cao */}
          <p className="invisible sm:visible text-xs sm:text-sm lg:text-[15px] text-slate-700 leading-relaxed font-normal max-w-lg">
            Dịch vụ xe ghép – xe tiện chuyến Móng Cái, Hạ Long, Hải Phòng, Hà
            Nội, Bắc Ninh, Bắc Giang... Xe chạy thẳng, nhanh, đón trả tận nơi,
            phục vụ 24/7.
          </p>

          {/* Hotline & cam kết tiện ích — mobile: ẩn nhưng vẫn giữ chiều cao */}
          <div className="invisible sm:visible flex pt-1.5 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-700">
            <a
              href={info.hotlineHref}
              className="inline-flex items-center gap-1.5 font-bold text-red-600 hover:text-red-700 transition-colors mr-1"
              aria-label={`Hotline liên hệ 24/7: ${info.hotline}`}
            >
              <Phone
                className="w-3.5 h-3.5 text-red-600 animate-pulse"
                aria-hidden="true"
              />
              <span>Hotline 24/7: {info.hotline}</span>
            </a>
            <div className="flex items-center gap-1 font-medium">
              <CheckCircle2
                className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0"
                aria-hidden="true"
              />
              <span>Đón trả tận nhà</span>
            </div>
            <div className="flex items-center gap-1 font-medium">
              <Zap
                className="w-3.5 h-3.5 text-amber-600 flex-shrink-0"
                aria-hidden="true"
              />
              <span>Chỉ 1–3 khách</span>
            </div>
            <div className="flex items-center gap-1 font-medium">
              <Award
                className="w-3.5 h-3.5 text-sky-600 flex-shrink-0"
                aria-hidden="true"
              />
              <span>100% xe đời mới</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
