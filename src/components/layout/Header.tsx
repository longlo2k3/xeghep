"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Phone, ChevronDown, Menu, X, Car } from "lucide-react";
import { COMPANY_INFO } from "@/data/company-info";
import type { CompanyInfoData } from "@/lib/api";
import type { RouteItem } from "@/lib/types";
import { TopBanner } from "./TopBanner";

export function Header({
  routes,
  companyInfo = COMPANY_INFO,
}: {
  routes: RouteItem[];
  companyInfo?: CompanyInfoData;
}) {
  const info = companyInfo ?? COMPANY_INFO;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [routesDropdownOpen, setRoutesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setRoutesDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <TopBanner companyInfo={info} />
      {/* Accessible Skip Link per AGENTS.md rule 3.1 & WCAG 2.1 AA */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-red-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-xl focus:outline-none"
      >
        Bỏ qua điều hướng, đến nội dung chính
      </a>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile: Hamburger on Left */}
            <div className="flex lg:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-expanded={mobileMenuOpen}
                aria-label={
                  mobileMenuOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"
                }
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-900" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-900" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Logo: Left on Desktop, Center on Mobile */}
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg p-1"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-md shadow-red-700/20 group-hover:scale-105 transition-transform flex-shrink-0">
                  <Car className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-red-600 transition-colors leading-none uppercase">
                    XE GHÉP <span className="text-red-600">LIÊN TỈNH</span>
                  </span>
                  {/* Hotline directly below logo per spec_v2.md 2.1 */}
                  <span className="text-xs sm:text-sm font-bold text-red-600 tracking-wide mt-1">
                    {info.hotline}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Menu: Center */}
            <nav
              aria-label="Main navigation"
              className="hidden lg:flex items-center gap-1 xl:gap-2"
            >
              <Link
                href="/"
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-colors cursor-pointer"
              >
                Trang chủ
              </Link>

              <Link
                href="/gioi-thieu"
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-colors cursor-pointer"
              >
                Giới thiệu
              </Link>

              {/* Dropdown: Các tuyến liên tỉnh */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setRoutesDropdownOpen(!routesDropdownOpen)}
                  onMouseEnter={() => setRoutesDropdownOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-colors cursor-pointer"
                  aria-expanded={routesDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Danh mục các tuyến liên tỉnh"
                >
                  <span>Các tuyến liên tỉnh</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${routesDropdownOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                {routesDropdownOpen && (
                  <div
                    onMouseLeave={() => setRoutesDropdownOpen(false)}
                    className="absolute left-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <Link
                      href="/tuyen-lien-tinh"
                      onClick={() => setRoutesDropdownOpen(false)}
                      className="block px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 border-b border-slate-100"
                    >
                      Xem tất cả các tuyến &rarr;
                    </Link>

                    <div className="max-h-96 overflow-y-auto py-1">
                      {routes.map((route) => (
                        <Link
                          key={route.slug}
                          href={`/tuyen-lien-tinh/${route.slug}`}
                          onClick={() => setRoutesDropdownOpen(false)}
                          className="flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <span className="truncate pr-2">{route.name}</span>
                          <span className="text-[11px] font-semibold text-red-600 whitespace-nowrap">
                            {route.priceShare1Text}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/tin-tuc"
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-colors cursor-pointer"
              >
                Tin tức
              </Link>

              <Link
                href="/lien-he"
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-colors cursor-pointer"
              >
                Liên hệ
              </Link>
            </nav>

            {/* Desktop CTA: Red Button Right */}
            <div className="hidden lg:flex items-center">
              <a
                href={info.hotlineHref}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md shadow-red-600/30 transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
                aria-label={`Gọi ngay tổng đài ${info.hotline}`}
              >
                <Phone className="w-4 h-4 animate-pulse" aria-hidden="true" />
                <span>GỌI NGAY: {info.hotline}</span>
              </a>
            </div>

            {/* Mobile: Quick Call Button Right */}
            <div className="flex lg:hidden items-center">
              <a
                href={info.hotlineHref}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700"
                aria-label={`Gọi ngay ${info.hotline}`}
              >
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Gọi ngay</span>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-xl animate-in slide-in-from-top-2 duration-150"
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-red-50 hover:text-red-600"
            >
              Trang chủ
            </Link>

            <Link
              href="/gioi-thieu"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-red-50 hover:text-red-600"
            >
              Giới thiệu
            </Link>

            <Link
              href="/tuyen-lien-tinh"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-base font-bold text-red-600 hover:bg-red-50"
            >
              Các tuyến liên tỉnh (Xem tất cả)
            </Link>

            <div className="pl-4 space-y-1 border-l-2 border-red-200 ml-2 py-1">
              {routes.map((route) => (
                <Link
                  key={route.slug}
                  href={`/tuyen-lien-tinh/${route.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600"
                >
                  {route.name}
                </Link>
              ))}
            </div>

            <Link
              href="/tin-tuc"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-red-50 hover:text-red-600"
            >
              Tin tức
            </Link>

            <Link
              href="/lien-he"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-red-50 hover:text-red-600"
            >
              Liên hệ
            </Link>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <a
                href={info.hotlineHref}
                className="w-full text-center py-3 px-4 rounded-xl text-base font-bold text-white bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2 shadow-md"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>GỌI NGAY: {info.hotline}</span>
              </a>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
