import { Phone } from "lucide-react";
import { COMPANY_INFO } from "@/data/company-info";
import type { CompanyInfoData } from "@/lib/api";

export function FloatingContact({
  companyInfo = COMPANY_INFO,
}: {
  companyInfo?: CompanyInfoData;
}) {
  const info = companyInfo ?? COMPANY_INFO;

  return (
    <>
      <div className="fixed bottom-6 right-4 z-50 sm:right-6">
        {/* Nút nổi Zalo */}
        <a
          href={info.zaloHref}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-button contact-button--zalo relative flex items-center justify-center w-14 h-14 rounded-full bg-[#0068FF] text-white shadow-xl shadow-blue-600/30 hover:bg-[#0052cc] hover:scale-110 active:scale-95 transition-all duration-200 group"
          aria-label="Chat Zalo ngay"
        >
          <span className="contact-wave" aria-hidden="true" />
          <span
            className="contact-wave contact-wave--delayed"
            aria-hidden="true"
          />
          <span className="contact-breathe" aria-hidden="true" />
          <span className="contact-icon relative z-10 font-black text-sm sm:text-base tracking-tight select-none">
            Zalo
          </span>
          <span className="sr-only">Chat Zalo</span>

          {/* Tooltip desktop */}
          <span className="absolute right-16 px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-bold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:block">
            Chat Zalo
          </span>
        </a>
      </div>

      <div className="fixed bottom-6 left-4 z-50 flex flex-col items-start gap-3 sm:left-6">
        {/* Nút nổi Gọi điện (chuyển sang thay thế thanh hotline dài cũ) */}
        <a
          href={info.hotlineHref}
          className="contact-button contact-button--phone relative flex items-center justify-center w-14 h-14 rounded-full bg-red-600 text-white shadow-xl shadow-red-600/40 hover:bg-red-700 hover:scale-110 active:scale-95 transition-all duration-200 group"
          aria-label={`Gọi điện ngay ${info.hotline}`}
        >
          <span className="contact-wave" aria-hidden="true" />
          <span
            className="contact-wave contact-wave--delayed"
            aria-hidden="true"
          />
          <span className="contact-breathe" aria-hidden="true" />
          <Phone
            className="contact-icon relative z-10 w-6 h-6"
            aria-hidden="true"
          />
          <span className="sr-only">Gọi ngay {info.hotline}</span>

          {/* Tooltip desktop */}
          <span className="absolute left-16 px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-bold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:block">
            Gọi: {info.hotline}
          </span>
        </a>
      </div>
    </>
  );
}
