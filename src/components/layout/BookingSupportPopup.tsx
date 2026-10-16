"use client";

import { MessageCircle, Phone, X, Zap } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { COMPANY_INFO } from "@/data/company-info";
import type { CompanyInfoData } from "@/lib/api";

const OPEN_DELAY_MS = 40_000;
const DISMISSED_KEY = "booking-support-popup-dismissed";

export function BookingSupportPopup({
  companyInfo = COMPANY_INFO,
}: {
  companyInfo?: CompanyInfoData;
}) {
  const info = companyInfo ?? COMPANY_INFO;
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const closePopup = useCallback(() => {
    setIsOpen(false);

    try {
      window.sessionStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // The popup still works when storage is unavailable.
    }

    previousFocusRef.current?.focus();
  }, []);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISSED_KEY) === "true") return;
    } catch {
      // Continue without session persistence when storage is unavailable.
    }

    const timer = window.setTimeout(() => {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setIsOpen(true);
    }, OPEN_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePopup();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePopup, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-[2px] motion-reduce:animate-none animate-[booking-popup-fade_180ms_ease-out]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePopup();
      }}
      aria-hidden={false}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-support-title"
        aria-describedby="booking-support-description"
        className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border-2 border-orange-500 bg-white px-5 pb-6 pt-7 text-center shadow-[0_24px_80px_rgba(15,23,42,0.45),0_0_24px_rgba(249,115,22,0.3)] sm:px-7 sm:pb-7 motion-reduce:animate-none animate-[booking-popup-in_220ms_ease-out]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closePopup}
          className="absolute right-2.5 top-2.5 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          aria-label="Đóng cửa sổ hỗ trợ đặt xe"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <p className="mx-auto mb-3 inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-red-700 sm:text-xs">
          <Zap
            className="h-3.5 w-3.5 fill-orange-400 text-orange-400"
            aria-hidden="true"
          />
          Hỗ trợ đặt xe nhanh
        </p>

        <h2
          id="booking-support-title"
          className="text-xl font-black leading-tight text-slate-900 sm:text-2xl"
        >
          Bạn đang cần đi các tuyến
          <span className="mt-1 block text-orange-600">
            MÓNG CÁI - HẠ LONG - HẢI PHÒNG - BẮC NINH - BẮC GIANG - HÀ NỘI?
          </span>
        </h2>

        <p id="booking-support-description" className="sr-only">
          Liên hệ tổng đài hoặc Zalo để được tư vấn và báo giá chuyến đi.
        </p>

        <div className="mt-5 grid gap-3">
          <a
            href={info.hotlineHref}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 text-sm font-black uppercase text-white shadow-lg shadow-red-500/25 transition hover:from-red-700 hover:to-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 sm:text-base"
            aria-label={`Gọi trực tiếp ${info.hotline}`}
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            Gọi trực tiếp
          </a>

          <a
            href={info.zaloHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#0866ff] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#0054d8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:text-base"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Nhắn tin Zalo báo giá ngay
          </a>
        </div>

        <Link
          href="/tuyen-lien-tinh"
          onClick={closePopup}
          className="mt-4 inline-block text-xs font-medium text-slate-400 underline underline-offset-2 transition hover:text-slate-700 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:text-sm"
        >
          Tôi muốn xem lại bảng giá chuyến đi
        </Link>
      </section>
    </div>
  );
}
