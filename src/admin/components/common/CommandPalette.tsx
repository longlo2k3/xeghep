import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  CalendarCheck,
  MapPin,
  FileText,
  Layers,
  Image,
  Receipt,
  ArrowRightLeft,
  Settings,
  Users,
  Plus,
  HelpCircle,
  X,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/admin/context/AuthContext';
import type { Role } from '@/admin/types/auth';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'Trang quản trị' | 'Thao tác nhanh' | 'Trợ giúp';
  description?: string;
  href?: string;
  action?: () => void;
  icon: any;
  roles?: Role[];
}

export function CommandPalette({ isOpen, onClose, onOpenHelp }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commandItems: CommandItem[] = useMemo(
    () => [
      // Thao tác nhanh
      {
        id: 'new-route',
        title: 'Tạo tuyến đường xe mới',
        category: 'Thao tác nhanh',
        description: 'Tạo tuyến xe liên tỉnh kèm bảng giá cước',
        href: '/routes/new',
        icon: Plus,
        roles: ['admin', 'editor'],
      },
      {
        id: 'new-article',
        title: 'Viết bài viết mới',
        category: 'Thao tác nhanh',
        description: 'Đăng tin tức, cẩm nang đi xe ghép',
        href: '/articles/new',
        icon: Plus,
        roles: ['admin', 'editor'],
      },
      {
        id: 'pending-bookings',
        title: 'Duyệt đơn đặt xe đang chờ',
        category: 'Thao tác nhanh',
        description: 'Lọc các đơn khách đặt cần gọi điện thoại gấp',
        href: '/bookings?status=pending',
        icon: CalendarCheck,
        roles: ['admin', 'dispatcher'],
      },

      // Trang quản trị
      {
        id: 'nav-dashboard',
        title: 'Bảng điều khiển Tổng quan',
        category: 'Trang quản trị',
        description: 'Xem báo cáo, KPI và hoạt động hôm nay',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['admin', 'editor', 'dispatcher'],
      },
      {
        id: 'nav-bookings',
        title: 'Quản lý Đơn đặt xe',
        category: 'Trang quản trị',
        description: 'Danh sách và lịch sử đơn đặt xe',
        href: '/bookings',
        icon: CalendarCheck,
        roles: ['admin', 'dispatcher'],
      },
      {
        id: 'nav-routes',
        title: 'Tuyến đường & Giá cước',
        category: 'Trang quản trị',
        description: 'Quản lý danh sách tuyến và Banner Top',
        href: '/routes',
        icon: MapPin,
        roles: ['admin', 'editor'],
      },
      {
        id: 'nav-articles',
        title: 'Quản lý Bài viết',
        category: 'Trang quản trị',
        description: 'Tin tức, kinh nghiệm & ưu đãi',
        href: '/articles',
        icon: FileText,
        roles: ['admin', 'editor'],
      },
      {
        id: 'nav-pages',
        title: 'Trang nội dung & Chính sách',
        category: 'Trang quản trị',
        description: 'Giới thiệu, quy định & chính sách hoàn huỷ',
        href: '/pages',
        icon: Layers,
        roles: ['admin', 'editor'],
      },
      {
        id: 'nav-media',
        title: 'Thư viện hình ảnh Media',
        category: 'Trang quản trị',
        description: 'Quản lý ảnh xe, banner và tài liệu',
        href: '/media',
        icon: Image,
        roles: ['admin', 'editor'],
      },
      {
        id: 'nav-pricing',
        title: 'Bảng giá cước phụ',
        category: 'Trang quản trị',
        description: 'Bảng giá sân bay, phụ phí lễ tết',
        href: '/pricing',
        icon: Receipt,
        roles: ['admin', 'dispatcher'],
      },
      {
        id: 'nav-redirects',
        title: 'Chuyển hướng 301 SEO',
        category: 'Trang quản trị',
        description: 'Cấu hình liên kết chuyển hướng website',
        href: '/redirects',
        icon: ArrowRightLeft,
        roles: ['admin', 'editor'],
      },
      {
        id: 'nav-settings',
        title: 'Cấu hình chung hệ thống',
        category: 'Trang quản trị',
        description: 'Tên nhà xe, Hotline, Zalo và SEO mặc định',
        href: '/settings',
        icon: Settings,
        roles: ['admin'],
      },
      {
        id: 'nav-users',
        title: 'Quản lý Tài khoản & Phân quyền',
        category: 'Trang quản trị',
        description: 'Danh sách nhân viên Admin, Editor, Dispatcher',
        href: '/users',
        icon: Users,
        roles: ['admin'],
      },

      // Trợ giúp
      {
        id: 'help-guide',
        title: 'Mở Cẩm nang Hướng dẫn cho Người mới',
        category: 'Trợ giúp',
        description: 'Xem quy trình xử lý đơn, mẹo thao tác & hotline hỗ trợ',
        action: () => {
          onClose();
          if (onOpenHelp) onOpenHelp();
        },
        icon: HelpCircle,
        roles: ['admin', 'editor', 'dispatcher'],
      },
    ],
    [onClose, onOpenHelp]
  );

  // Filter items by role and query
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    return commandItems.filter((item) => {
      if (item.roles && !hasRole(item.roles)) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    });
  }, [commandItems, hasRole, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          executeItem(selected);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  const executeItem = (item: CommandItem) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.href) {
      navigate(item.href);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10"
        role="dialog"
        aria-modal="true"
        aria-label="Tìm kiếm nhanh toàn hệ thống"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Tìm kiếm chức năng, đơn đặt xe, tuyến đường, bài viết... (Gõ để tìm)"
            className="w-full bg-transparent border-none text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            aria-label="Đóng tìm kiếm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Không tìm thấy kết quả phù hợp</p>
              <p className="text-xs text-slate-400 mt-1">Thử tìm kiếm với từ khóa khác (ví dụ: "đơn", "tuyến", "bài viết")</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition select-none ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{item.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium border border-slate-200">
                          {item.category}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 ml-2 animate-in fade-in" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono shadow-xs text-slate-700">↑↓</kbd> Di chuyển
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono shadow-xs text-slate-700">Enter</kbd> Chọn
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono shadow-xs text-slate-700">Esc</kbd> Đóng
            </span>
          </div>
          <span className="hidden sm:inline text-slate-400">Xe Ghép CMS Quick Search</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
