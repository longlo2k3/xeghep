import Link from "next/link";
import { AlertTriangle, Home, Phone } from "lucide-react";
import { COMPANY_INFO } from "@/data/company-info";
import { getCompanySettings } from "@/lib/api";
import { BRAND_NAME } from "@/lib/seo";

export default async function NotFound() {
  const companySettings = await getCompanySettings();
  const info = companySettings.info ?? COMPANY_INFO;
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-200/80">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" aria-hidden="true" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2 block">
          Lỗi 404 — Không Tìm Thấy Trang
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
          Trang Bạn Tìm Không Tồn Tại
        </h1>
        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          Đường dẫn có thể đã thay đổi hoặc không còn khả dụng trên hệ thống {BRAND_NAME}. Vui lòng quay về trang chủ hoặc liên hệ hotline để được hỗ trợ cuốc xe.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Về Trang Chủ</span>
          </Link>
          <a
            href={info.hotlineHref}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            <span>Hotline 24/7 ({info.hotline})</span>
          </a>
        </div>
      </div>
    </div>
  );
}
