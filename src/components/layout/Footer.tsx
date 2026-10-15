import Link from "next/link";
import { Phone, Mail, Globe, Car, ArrowRight } from "lucide-react";
import { COMPANY_INFO } from "@/data/company-info";
import type { CompanyInfoData } from "@/lib/api";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function Footer({
  companyInfo = COMPANY_INFO,
}: {
  companyInfo?: CompanyInfoData;
}) {
  const info = companyInfo ?? COMPANY_INFO;

  return (
    <footer className="bg-slate-950 text-slate-300 pt-14 pb-28 sm:pb-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4 Cột per spec_v2.md 2.4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Cột 1: XE GHÉP LIÊN TỈNH */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-500/20">
                <Car className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight uppercase">
                  XE GHÉP <span className="text-red-500">LIÊN TỈNH</span>
                </span>
                <p className="text-xs text-slate-400">{info.domainName}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Dịch vụ xe ghép, xe tiện chuyến Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang. Xe chạy thẳng, nhanh, giá rõ ràng, đón trả tận nơi, phục vụ 24/7.
            </p>
          </div>

          {/* Cột 2: THÔNG TIN LIÊN HỆ */}
          <div className="space-y-3.5">
            <h3 className="text-white text-base font-extrabold uppercase tracking-wide border-b border-slate-800 pb-2">
              THÔNG TIN LIÊN HỆ
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />
                <span>Website: <strong>{info.domainName}</strong></span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />
                <a
                  href={info.hotlineHref}
                  className="text-amber-400 font-bold hover:underline"
                >
                  Hotline: {info.hotline}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${info.email}`}
                  className="hover:text-white transition-colors truncate"
                >
                  Email: {info.email}
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <FacebookIcon className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <a
                  href={info.fanpageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Fanpage: {info.fanpage}
                </a>
              </div>
            </div>
          </div>

          {/* Cột 3: DỊCH VỤ XE */}
          <div className="space-y-3.5">
            <h3 className="text-white text-base font-extrabold uppercase tracking-wide border-b border-slate-800 pb-2">
              DỊCH VỤ XE
            </h3>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link
                  href="/tuyen-lien-tinh/hai-phong-mong-cai"
                  className="hover:text-red-400 transition-colors flex items-center justify-between py-0.5"
                >
                  <span>Móng Cái ⇄ Hạ Long ⇄ Hải Phòng ⇄ Hà Nội</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                </Link>
              </li>
              <li>
                <Link
                  href="/tuyen-lien-tinh/ha-long-bac-ninh-bac-giang"
                  className="hover:text-red-400 transition-colors flex items-center justify-between py-0.5"
                >
                  <span>Hà Nội ⇄ Bắc Ninh ⇄ Bắc Giang</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                </Link>
              </li>
              <li>
                <Link
                  href="/tuyen-lien-tinh/hai-phong-bac-ninh-bac-giang"
                  className="hover:text-red-400 transition-colors flex items-center justify-between py-0.5"
                >
                  <span>Hải Phòng ⇄ Bắc Ninh ⇄ Bắc Giang</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                </Link>
              </li>
              <li className="pt-2 border-t border-slate-900">
                <Link
                  href="/tuyen-lien-tinh"
                  className="text-red-400 hover:text-red-300 font-bold underline text-xs"
                >
                  Xem tất cả các tuyến liên tỉnh &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: CHÍNH SÁCH */}
          <div className="space-y-3.5">
            <h3 className="text-white text-base font-extrabold uppercase tracking-wide border-b border-slate-800 pb-2">
              CHÍNH SÁCH
            </h3>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link
                  href="/chinh-sach/thanh-toan"
                  className="hover:text-red-400 transition-colors block py-0.5"
                >
                  Chính sách thanh toán
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach/dam-bao"
                  className="hover:text-red-400 transition-colors block py-0.5"
                >
                  Chính sách đảm bảo
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach/bao-mat"
                  className="hover:text-red-400 transition-colors block py-0.5"
                >
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Dòng cuối: Bản quyền per spec_v2.md 2.4 */}
        <div className="pt-6 border-t border-slate-900 text-center text-xs text-slate-400">
          <p>© Bản quyền thuộc về {info.name}.</p>
        </div>
      </div>
    </footer>
  );
}
