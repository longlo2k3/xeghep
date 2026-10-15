import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Menu,
  LogOut,
  ChevronRight,
  Search,
  Plus,
  HelpCircle,
  MapPin,
  FileText,
  Layers,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/admin/context/AuthContext";
import { Button } from "@/admin/components/ui/Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { CommandPalette } from "./CommandPalette";
import { cn } from "@/admin/lib/utils";

export interface HeaderProps {
  onToggleSidebar?: () => void;
  isDesktopOpen?: boolean;
  className?: string;
}

const routeTitles: Record<string, string> = {
  "/dashboard": "Tổng quan",
  "/bookings": "Đơn đặt xe",
  "/routes": "Tuyến đường & Giá",
  "/articles": "Bài viết",
  "/pages": "Trang nội dung",
  "/media": "Thư viện Media",
  "/pricing": "Bảng giá phụ",
  "/redirects": "Chuyển hướng 301",
  "/settings": "Cấu hình chung",
  "/users": "Quản lý tài khoản",
  "/help": "Cẩm nang & Trợ giúp",
};

export function Header({ onToggleSidebar, className }: HeaderProps) {
  const { logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  // Global keyboard shortcut for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Match current path to title
  const currentPath = location.pathname;
  const matchedKey = Object.keys(routeTitles).find(
    (key) => currentPath === key || currentPath.startsWith(key + "/"),
  );
  const pageTitle = matchedKey ? routeTitles[matchedKey] : "Quản trị";

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutConfirm(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const canCreate = hasRole(["admin", "editor"]);

  return (
    <>
      <header
        className={cn(
          "h-16 px-4 sm:px-6 bg-white/95 border-b border-slate-200 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4",
          className,
        )}
      >
        {/* Left: Mobile & Desktop Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Mở menu"
            title="Đóng / Mở menu điều hướng"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-2 text-xs">
            <Link
              to="/dashboard"
              className="text-slate-500 hover:text-slate-800 transition font-medium hidden sm:inline-block"
            >
              CMS
            </Link>
            {matchedKey && matchedKey !== "/dashboard" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
                <span className="font-semibold text-slate-900">
                  {pageTitle}
                </span>
              </>
            )}
            {(!matchedKey || matchedKey === "/dashboard") && (
              <span className="font-semibold text-slate-900 text-sm sm:text-base">
                {pageTitle}
              </span>
            )}
          </div>
        </div>

        {/* Center: Quick Search Trigger */}
        <div className="flex-1 max-w-md hidden md:flex items-center justify-center px-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full max-w-xs flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs transition cursor-pointer group shadow-2xs"
            title="Tìm kiếm nhanh toàn hệ thống (Ctrl + K)"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              <span>Tìm kiếm nhanh...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-500 border border-slate-200 shadow-2xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Help, User Info & Logout Button */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Tìm kiếm nhanh"
            title="Tìm kiếm"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Create Dropdown (Admin & Editor) */}
          {canCreate && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateMenuOpen((prev) => !prev)}
                className="h-8 px-2.5 text-xs rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 hidden sm:inline-flex items-center gap-1.5"
                title="Tạo nhanh dữ liệu mới"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold">Tạo mới</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </Button>

              {isCreateMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsCreateMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        navigate("/routes/new");
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tuyến đường mới</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        navigate("/articles/new");
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Bài viết mới</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        navigate("/pages/new");
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition"
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Trang nội dung mới</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Quick Help Button -> Navigates to dedicated /help page */}
          <button
            type="button"
            onClick={() => navigate("/help")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 transition cursor-pointer"
            title="Cẩm nang hướng dẫn & Hỗ trợ kỹ thuật"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span className="hidden lg:inline">Trợ giúp</span>
          </button>

          {/* Logout Button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowLogoutConfirm(true)}
            className="text-xs h-8 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-none"
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenHelp={() => navigate("/help")}
      />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Đăng xuất khỏi hệ thống"
        description="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản quản trị và kết thúc phiên làm việc?"
        confirmText="Đăng xuất"
        cancelText="Ở lại"
        variant="destructive"
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}

export default Header;
