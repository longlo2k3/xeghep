"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, ChevronDown, Menu, X, Car } from "lucide-react";
import { COMPANY_INFO } from "@/data/company-info";
import { splitBrandName, toMediaSrc } from "@/lib/brand";
import type { CompanyInfoData } from "@/lib/api";
import type { RouteItem } from "@/lib/types";

export function Header({
  routes,
  companyInfo = COMPANY_INFO,
}: {
  routes: RouteItem[];
  companyInfo?: CompanyInfoData;
}) {
  const info = companyInfo ?? COMPANY_INFO;
  const [brandLead, brandAccent] = splitBrandName(info.brandName);
  const logo = toMediaSrc(info.logoUrl);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [routesDropdownOpen, setRoutesDropdownOpen] = useState(false);
  const [mobileRoutesOpen, setMobileRoutesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isSectionActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  const desktopLinkClass = (active: boolean) =>
    `px-3 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${active ? "text-red-700" : "text-slate-700 hover:text-red-600 hover:bg-red-50/60"}`;
  const mobileLinkClass = (active: boolean) =>
    `block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${active ? "text-red-700 bg-red-50/70" : "text-slate-800 hover:bg-red-50 hover:text-red-600"}`;

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

  // Reset mobile routes submenu to closed whenever mobile menu closes
  useEffect(() => {
    if (!mobileMenuOpen) {
      setMobileRoutesOpen(false);
    }
  }, [mobileMenuOpen]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll and handle Escape key when mobile menu is open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <>
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
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-md shadow-red-700/20 group-hover:scale-105 transition-transform flex-shrink-0 overflow-hidden">
                  {logo ? (
                    <Image
                      src={logo}
                      alt={info.brandName}
                      width={44}
                      height={44}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Car className="w-6 h-6 text-white" aria-hidden="true" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-red-600 transition-colors leading-none uppercase">
                    {brandLead}{" "}
                    {brandAccent && (
                      <span className="text-red-600">{brandAccent}</span>
                    )}
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
                aria-current={pathname === "/" ? "page" : undefined}
                className={desktopLinkClass(pathname === "/")}
              >
                Trang chủ
              </Link>

              <Link
                href="/gioi-thieu"
                aria-current={pathname === "/gioi-thieu" ? "page" : undefined}
                className={desktopLinkClass(isSectionActive("/gioi-thieu"))}
              >
                Giới thiệu
              </Link>

              {/* Dropdown: Các tuyến liên tỉnh */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setRoutesDropdownOpen(!routesDropdownOpen)}
                  onMouseEnter={() => setRoutesDropdownOpen(true)}
                  className={`flex items-center gap-1 ${desktopLinkClass(isSectionActive("/tuyen-lien-tinh"))}`}
                  aria-expanded={routesDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Danh mục các tuyến liên tỉnh"
                >
                  <span>Các tuyến liên tỉnh</span>
                  <ChevronDown
                    className={`w-4.5 h-4.5 transition-transform duration-200 ${routesDropdownOpen ? "rotate-180" : ""}`}
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
                      aria-current={
                        pathname === "/tuyen-lien-tinh" ? "page" : undefined
                      }
                      className={`block px-4 py-2 text-sm font-bold hover:bg-red-50 border-b border-slate-100 ${pathname === "/tuyen-lien-tinh" ? "bg-red-50 text-red-700" : "text-red-600"}`}
                    >
                      Xem tất cả các tuyến &rarr;
                    </Link>

                    <div className="max-h-96 overflow-y-auto py-1">
                      {routes.map((route) => (
                        <Link
                          key={route.slug}
                          href={`/tuyen-lien-tinh/${route.slug}`}
                          onClick={() => setRoutesDropdownOpen(false)}
                          aria-current={
                            pathname === `/tuyen-lien-tinh/${route.slug}`
                              ? "page"
                              : undefined
                          }
                          className={`flex items-center justify-between px-4 py-2 text-xs font-medium hover:bg-red-50 hover:text-red-700 transition-colors ${pathname === `/tuyen-lien-tinh/${route.slug}` ? "bg-red-50 text-red-700" : "text-slate-700"}`}
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
                aria-current={pathname === "/tin-tuc" ? "page" : undefined}
                className={desktopLinkClass(isSectionActive("/tin-tuc"))}
              >
                Tin tức
              </Link>

              <Link
                href="/lien-he"
                aria-current={pathname === "/lien-he" ? "page" : undefined}
                className={desktopLinkClass(isSectionActive("/lien-he"))}
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

        {/* Mobile Navigation Drawer (chiếm nửa màn) */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 top-16 sm:top-20 z-40">
            {/* Backdrop for the remaining screen */}
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Menu Drawer: 50% width ("chiếm nửa màn") */}
            <nav
              aria-label="Mobile navigation"
              className="relative z-10 w-1/2 h-full bg-white border-r border-slate-200 px-3 py-3.5 pb-6 flex flex-col justify-between overflow-y-auto shadow-2xl"
            >
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={pathname === "/" ? "page" : undefined}
                  className={mobileLinkClass(pathname === "/")}
                >
                  Trang chủ
                </Link>

                <Link
                  href="/gioi-thieu"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={pathname === "/gioi-thieu" ? "page" : undefined}
                  className={mobileLinkClass(isSectionActive("/gioi-thieu"))}
                >
                  Giới thiệu
                </Link>

                {/* Mobile Submenu: Các tuyến liên tỉnh (Mặc định đóng, có thể click để expand) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setMobileRoutesOpen((prev) => !prev)}
                    aria-expanded={mobileRoutesOpen}
                    aria-controls="mobile-routes-submenu"
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                      isSectionActive("/tuyen-lien-tinh")
                        ? "text-red-700 bg-red-50/60"
                        : "text-slate-800 hover:bg-red-50 hover:text-red-600"
                    }`}
                  >
                    <span className="truncate">Các tuyến liên tỉnh</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                        mobileRoutesOpen ? "rotate-180 text-red-600" : "text-slate-600"
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {mobileRoutesOpen && (
                    <div
                      id="mobile-routes-submenu"
                      className="pl-2 space-y-1 border-l-2 border-red-200 ml-2 py-1 my-1"
                    >
                      <Link
                        href="/tuyen-lien-tinh"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={
                          pathname === "/tuyen-lien-tinh" ? "page" : undefined
                        }
                        className={`block px-2 py-1.5 rounded-md text-xs font-bold leading-tight hover:bg-red-50 hover:text-red-700 ${
                          pathname === "/tuyen-lien-tinh"
                            ? "bg-red-50 text-red-700"
                            : "text-red-600"
                        }`}
                      >
                        Xem tất cả các tuyến &rarr;
                      </Link>

                      {routes.map((route) => (
                        <Link
                          key={route.slug}
                          href={`/tuyen-lien-tinh/${route.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          aria-current={
                            pathname === `/tuyen-lien-tinh/${route.slug}`
                              ? "page"
                              : undefined
                          }
                          className={`block px-2 py-1.5 rounded-md text-xs font-medium leading-tight hover:text-red-600 ${
                            pathname === `/tuyen-lien-tinh/${route.slug}`
                              ? "bg-red-50 text-red-700 font-semibold"
                              : "text-slate-600"
                          }`}
                        >
                          <span className="line-clamp-2">{route.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/tin-tuc"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={pathname === "/tin-tuc" ? "page" : undefined}
                  className={mobileLinkClass(isSectionActive("/tin-tuc"))}
                >
                  Tin tức
                </Link>

                <Link
                  href="/lien-he"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={pathname === "/lien-he" ? "page" : undefined}
                  className={mobileLinkClass(isSectionActive("/lien-he"))}
                >
                  Liên hệ
                </Link>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 mt-4 shrink-0">
                <a
                  href={info.hotlineHref}
                  className="w-full text-center py-2.5 px-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 flex items-center justify-center gap-1.5 shadow-md transition-colors"
                  aria-label={`Gọi ngay tổng đài ${info.hotline}`}
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="leading-tight truncate">GỌI: {info.hotline}</span>
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
