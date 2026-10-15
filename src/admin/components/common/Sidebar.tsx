import { useEffect, type ComponentType } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  MapPin,
  FileText,
  Layers,
  Image,
  ArrowRightLeft,
  Settings,
  Users,
  X,
  Shield,
  HelpCircle,
  type LucideProps,
} from "lucide-react";
import { useAuth } from "@/admin/context/AuthContext";
import type { Role } from "@/admin/types/auth";
import { cn } from "@/admin/lib/utils";

export interface NavItemConfig {
  name: string;
  href: string;
  icon: ComponentType<LucideProps>;
  roles: Role[];
  section?: "main" | "operations" | "content" | "system";
  badge?: string;
}

export const navItems: NavItemConfig[] = [
  {
    name: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "editor", "dispatcher"],
    section: "main",
  },
  {
    name: "Đơn đặt xe",
    href: "/bookings",
    icon: CalendarCheck,
    roles: ["admin", "dispatcher"],
    section: "operations",
  },
  {
    name: "Tuyến đường & Giá",
    href: "/routes",
    icon: MapPin,
    roles: ["admin", "editor"],
    section: "operations",
  },
  {
    name: "Bài viết",
    href: "/articles",
    icon: FileText,
    roles: ["admin", "editor"],
    section: "content",
  },
  {
    name: "Trang nội dung",
    href: "/pages",
    icon: Layers,
    roles: ["admin", "editor"],
    section: "content",
  },
  {
    name: "Thư viện Media",
    href: "/media",
    icon: Image,
    roles: ["admin", "editor"],
    section: "content",
  },
  {
    name: "Chuyển hướng 301",
    href: "/redirects",
    icon: ArrowRightLeft,
    roles: ["admin", "editor"],
    section: "content",
  },
  {
    name: "Cấu hình chung",
    href: "/settings",
    icon: Settings,
    roles: ["admin"],
    section: "system",
  },
  {
    name: "Quản lý tài khoản",
    href: "/users",
    icon: Users,
    roles: ["admin"],
    section: "system",
  },
];

export const sectionLabels: Record<string, string> = {
  main: "TRANG CHÍNH",
  operations: "VẬN HÀNH XE",
  content: "NỘI DUNG & SEO",
  system: "HỆ THỐNG",
};

export const roleBadgeMap: Record<Role, { label: string; className: string }> =
  {
    admin: {
      label: "Quản trị viên",
      className: "bg-rose-50 text-rose-700 border-rose-200",
    },
    editor: {
      label: "Biên tập viên",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    dispatcher: {
      label: "Điều phối viên",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
  };

export interface SidebarProps {
  isOpen?: boolean;
  isDesktopOpen?: boolean;
  onClose?: () => void;
  onToggleDesktop?: () => void;
  className?: string;
}

export function Sidebar({
  isOpen = false,
  isDesktopOpen = true,
  onClose,
  onToggleDesktop,
  className,
}: SidebarProps) {
  const { user, hasRole } = useAuth();

  // Close mobile sidebar on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter navigation items by role
  const visibleNavItems = navItems.filter((item) => hasRole(item.roles));

  // Group items by section
  const sections = ["main", "operations", "content", "system"] as const;

  const roleInfo = user?.role ? roleBadgeMap[user.role] : null;

  return (
    <>
      {/* Mobile Backdrop (NEVER show on desktop!) */}
      {isOpen && (
        <div
          data-testid="sidebar-mobile-backdrop"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        data-testid="sidebar"
        className={cn(
          "bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out",
          // Mobile Drawer: slide-over with shadow
          "fixed inset-y-0 left-0 z-50 w-64 shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: docked sidebar, OPEN by default, collapsible extension
          "lg:static lg:h-screen lg:sticky lg:top-0 lg:shadow-none",
          isDesktopOpen
            ? "lg:translate-x-0 lg:w-64 lg:opacity-100"
            : "lg:-translate-x-full lg:w-0 lg:overflow-hidden lg:opacity-0 lg:border-none",
          className,
        )}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                Xe Ghép Liên Tỉnh
              </h1>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Admin CMS
              </p>
            </div>
          </div>

          {/* Close button (chỉ hiển thị trên mobile drawer, ẩn trên desktop web) */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            aria-label="Đóng thanh điều hướng"
            title="Đóng menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links organized into semantic groups */}
        <nav
          className="flex-1 px-3 py-3 space-y-4 overflow-y-auto"
          aria-label="Menu quản trị"
        >
          {sections.map((secKey) => {
            const sectionItems = visibleNavItems.filter(
              (item) => (item.section || "main") === secKey,
            );

            if (sectionItems.length === 0) return null;

            return (
              <div key={secKey} className="space-y-1">
                {secKey !== "main" && (
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase select-none">
                    {sectionLabels[secKey]}
                  </div>
                )}

                {sectionItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => {
                        if (onClose) onClose();
                      }}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group",
                          isActive
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-semibold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon
                              className={cn(
                                "w-4 h-4 shrink-0 transition-colors",
                                isActive
                                  ? "text-white"
                                  : "text-slate-400 group-hover:text-slate-600",
                              )}
                            />
                            <span className="truncate">{item.name}</span>
                          </div>

                          {item.name === "Đơn đặt xe" && (
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded-md text-[10px] font-bold",
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-amber-100 text-amber-800",
                              )}
                            >
                              Ưu tiên
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Quick Help Guide Link -> Dedicated /help page */}
        <div className="px-3 pb-2 shrink-0">
          <NavLink
            to="/help"
            onClick={() => {
              if (onClose) onClose();
            }}
            className={({ isActive }) =>
              cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition group cursor-pointer",
                isActive
                  ? "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                  : "text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border-slate-200",
              )
            }
            title="Cẩm nang hướng dẫn sử dụng từng chức năng"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
              <span className="truncate">Hướng dẫn & Trợ giúp</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200 font-semibold group-hover:border-blue-200 group-hover:text-blue-600 shrink-0">
              CMS
            </span>
          </NavLink>
        </div>

        {/* User Card in Sidebar Footer */}
        {user && (
          <div className="p-3 border-t border-slate-100 shrink-0">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user.fullName ? user.fullName[0] : user.email[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user.fullName || user.email}
                </p>
                {roleInfo && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border",
                      roleInfo.className,
                    )}
                  >
                    <Shield className="w-2.5 h-2.5" />
                    {roleInfo.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;
