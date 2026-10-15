import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  MapPin,
  FileText,
  Settings,
  Image,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Compass,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '@/admin/context/AuthContext';
import { Button } from '@/admin/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/admin/components/ui/Card';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import { formatDateTime, formatVND } from '@/admin/lib/utils';
import type { BookingDoc } from '@/admin/types/bookings';
import type { RouteDoc } from '@/admin/types/routes';
import type { ArticleDoc } from '@/admin/types/articles';
import type { PaginatedResponse } from '@/admin/types/api';

const ROLE_NAME_MAP: Record<string, string> = {
  admin: 'Quản trị viên (Admin)',
  editor: 'Biên tập viên (Editor)',
  dispatcher: 'Điều phối viên (Dispatcher)',
};

export function DashboardOverview() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [routes, setRoutes] = useState<RouteDoc[]>([]);
  const [articles, setArticles] = useState<ArticleDoc[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // First-time user Onboarding State
  const [isOnboardingCollapsed, setIsOnboardingCollapsed] = useState(false);
  const [isOnboardingDismissed, setIsOnboardingDismissed] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [bookingsRes, routesRes, articlesRes] = await Promise.allSettled([
        apiClient.get<PaginatedResponse<BookingDoc> | BookingDoc[]>('/bookings', {
          params: { limit: 100, sort: '-createdAt' },
        }),
        apiClient.get<PaginatedResponse<RouteDoc> | RouteDoc[]>('/routes', {
          params: { limit: 100 },
        }),
        apiClient.get<PaginatedResponse<ArticleDoc> | ArticleDoc[]>('/articles', {
          params: { limit: 100 },
        }),
      ]);

      // Trích xuất bookings
      if (bookingsRes.status === 'fulfilled') {
        const data = bookingsRes.value.data;
        if (Array.isArray(data)) {
          setBookings(data);
        } else if (data && Array.isArray(data.docs)) {
          setBookings(data.docs);
        }
      }

      // Trích xuất routes
      if (routesRes.status === 'fulfilled') {
        const data = routesRes.value.data;
        if (Array.isArray(data)) {
          setRoutes(data);
        } else if (data && Array.isArray(data.docs)) {
          setRoutes(data.docs);
        }
      }

      // Trích xuất articles
      if (articlesRes.status === 'fulfilled') {
        const data = articlesRes.value.data;
        if (Array.isArray(data)) {
          setArticles(data);
        } else if (data && Array.isArray(data.docs)) {
          setArticles(data.docs);
        }
      }

      // Nếu tất cả API cùng lỗi
      if (
        bookingsRes.status === 'rejected' &&
        routesRes.status === 'rejected' &&
        articlesRes.status === 'rejected'
      ) {
        setError(getApiErrorMessage(bookingsRes.reason));
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // KPI Calculations
  const pendingBookingsCount = useMemo(() => {
    return bookings.filter((b) => b.status === 'pending').length;
  }, [bookings]);

  const activeRoutesCount = useMemo(() => {
    return routes.filter((r) => r.status === 'active').length;
  }, [routes]);

  const publishedArticlesCount = useMemo(() => {
    return articles.filter((a) => a.status === 'published').length;
  }, [articles]);

  const completedBookingsCount = useMemo(() => {
    return bookings.filter((b) => b.status === 'completed').length;
  }, [bookings]);

  // Widget: 5 đơn pending mới nhất cần xử lý
  const pendingBookingsList = useMemo(() => {
    return bookings.filter((b) => b.status === 'pending').slice(0, 5);
  }, [bookings]);

  // Widget: Tuyến xe nổi bật (Banner Top)
  const bannerTopRoutes = useMemo(() => {
    return routes.filter((r) => Boolean(r.isBannerTop));
  }, [routes]);

  // Dynamic greeting according to time of day
  const timeGreeting = useMemo(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Chào buổi sáng';
    if (currentHour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  }, []);

  const roleDisplayName = (user?.role && ROLE_NAME_MAP[user.role]) || user?.role || 'Người dùng';

  // Onboarding Checklist Steps with distinct non-conflicting link labels
  const onboardingSteps = useMemo(() => {
    const allSteps = [
      {
        id: 1,
        title: 'Thiết lập các tuyến xe liên tỉnh trọng điểm',
        desc: 'Kiểm tra tuyến xe kèm khoảng cách và giá cước (Ví dụ: Hà Nội — Hải Phòng)',
        link: '/routes',
        linkText: 'Xem danh sách tuyến',
        isCompleted: activeRoutesCount > 0,
        roles: ['admin', 'editor'],
      },
      {
        id: 2,
        title: 'Quy trình tiếp nhận & xử lý đơn đặt xe',
        desc: 'Khách gửi đơn -> Gọi điện chốt giá & điểm đón -> Chuyển sang "Đã xác nhận"',
        link: '/bookings',
        linkText: 'Đến danh sách đơn xe',
        isCompleted: completedBookingsCount > 0 || bookings.length > 0,
        roles: ['admin', 'dispatcher'],
      },
      {
        id: 3,
        title: 'Đăng bài viết cẩm nang & tin tức xe ghép',
        desc: 'Viết bài chia sẻ kinh nghiệm đi xe để tăng uy tín và điểm SEO Google',
        link: '/articles',
        linkText: 'Đến trang Bài viết',
        isCompleted: publishedArticlesCount > 0,
        roles: ['admin', 'editor'],
      },
      {
        id: 4,
        title: 'Cấu hình thông tin Hotline & Zalo nhà xe',
        desc: 'Cập nhật số điện thoại nhận khách và thông tin liên hệ công ty',
        link: '/settings',
        linkText: 'Đến trang Cài đặt',
        isCompleted: false,
        roles: ['admin'],
      },
    ];

    return allSteps.filter((step) => hasRole(step.roles as any));
  }, [activeRoutesCount, completedBookingsCount, bookings.length, publishedArticlesCount, hasRole]);

  const completedStepsCount = onboardingSteps.filter((s) => s.isCompleted).length;
  const onboardingProgressPercent = Math.round(
    (completedStepsCount / Math.max(onboardingSteps.length, 1)) * 100
  );

  return (
    <div className="space-y-6">
      {/* 1. Lời chào mừng & Thông tin người dùng (Modern Hero Header) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-white via-white to-blue-50/40 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {roleDisplayName}
            </span>
            <span className="text-xs text-slate-500 font-medium">Xe Ghép Liên Tỉnh</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {timeGreeting} • Hệ thống trực tuyến
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Xin chào, {user?.fullName || user?.email}!
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Chào mừng bạn đến với hệ thống Quản trị CMS Xe Ghép Liên Tỉnh. Tổng quan hoạt động hôm nay:
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/help')}
            className="border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 text-xs rounded-xl"
            leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
          >
            Hướng dẫn người mới
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-700 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDashboardData}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-100"
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* 2. Interactive Onboarding Checklist Card (Dành riêng cho người mới lần đầu vào CMS) */}
      {!isOnboardingDismissed && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/60 border border-indigo-200/80 p-5 shadow-sm transition-all">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-500/20">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Khởi đầu nhanh cho Người dùng mới
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                    {completedStepsCount}/{onboardingSteps.length} bước
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các bước thiết lập và quy trình chuẩn giúp bạn vận hành hệ thống xe ghép dễ dàng ngay từ ngày đầu tiên.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOnboardingCollapsed((prev) => !prev)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 transition cursor-pointer"
                title={isOnboardingCollapsed ? 'Mở rộng checklist' : 'Thu gọn checklist'}
                aria-label={isOnboardingCollapsed ? 'Mở rộng checklist' : 'Thu gọn checklist'}
              >
                {isOnboardingCollapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsOnboardingDismissed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-white hover:text-slate-700 transition cursor-pointer"
                title="Tạm ẩn hướng dẫn này"
                aria-label="Tạm ẩn hướng dẫn này"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Tiến độ làm quen:</span>
              <span className="font-bold text-indigo-600">{onboardingProgressPercent}% hoàn tất</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${onboardingProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Step items list */}
          {!isOnboardingCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-indigo-100">
              {onboardingSteps.map((step) => (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    step.isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
                      : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800 shadow-2xs'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                      step.isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {step.isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold truncate">{step.title}</h4>
                      {step.isCompleted && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded shrink-0">
                          Đã xong
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {step.desc}
                    </p>
                    <div className="mt-2">
                      <Link
                        to={step.link}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition"
                      >
                        <span>{step.linkText}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Khối KPI Cards tóm tắt (Visual Hierarchy & Micro-interactions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-cards-grid">
        {/* KPI 1: Đơn chờ xác nhận (Màu cam nổi bật) */}
        <div
          data-testid="kpi-card-pending"
          className="p-5 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 shadow-sm transition-all hover:-translate-y-0.5 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Chờ xác nhận
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {isLoading ? '...' : pendingBookingsCount}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Đơn đặt xe mới đang chờ duyệt</span>
              <span className="text-[10px] text-amber-600 font-semibold">Ưu tiên số 1</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Tuyến xe đang hoạt động */}
        <div
          data-testid="kpi-card-routes"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm transition-all hover:-translate-y-0.5 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Tuyến xe hoạt động</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {isLoading ? '...' : activeRoutesCount}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Tuyến xe liên tỉnh đang mở</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Đang nhận khách</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Bài viết đã xuất bản */}
        <div
          data-testid="kpi-card-articles"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-sm transition-all hover:-translate-y-0.5 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Bài viết xuất bản</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-indigo-600 tracking-tight">
              {isLoading ? '...' : publishedArticlesCount}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Cẩm nang & tin tức trực tuyến</span>
              <span className="text-[10px] text-indigo-600 font-semibold">Tăng SEO</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Đơn hoàn thành */}
        <div
          data-testid="kpi-card-completed"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm transition-all hover:-translate-y-0.5 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Đơn hoàn thành</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {isLoading ? '...' : completedBookingsCount}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Chuyến đi thành công</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Doanh thu đạt</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Khối Lối tắt nhanh (Quick Actions) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm" data-testid="quick-actions-section">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Lối tắt nhanh
          </h2>
          <span className="text-[11px] text-slate-400">Các thao tác thường dùng nhất</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Duyệt đơn đặt xe: Admin & Dispatcher */}
          {hasRole(['admin', 'dispatcher']) && (
            <Link
              to="/bookings?status=pending"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-sm font-medium transition cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <Car className="w-4 h-4 text-amber-600" />
              <span>Duyệt đơn đặt xe</span>
              {pendingBookingsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-xs">
                  {pendingBookingsCount}
                </span>
              )}
            </Link>
          )}

          {/* Tạo tuyến đường mới: Admin & Editor */}
          {hasRole(['admin', 'editor']) && (
            <Link
              to="/routes/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-sm font-medium transition cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Tạo tuyến đường mới</span>
            </Link>
          )}

          {/* Viết bài mới: Admin & Editor */}
          {hasRole(['admin', 'editor']) && (
            <Link
              to="/articles/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-sm font-medium transition cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Viết bài mới</span>
            </Link>
          )}

          {/* Thư viện Media: Admin & Editor */}
          {hasRole(['admin', 'editor']) && (
            <Link
              to="/media"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-sm font-medium transition cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <Image className="w-4 h-4 text-purple-600" />
              <span>Thư viện Media</span>
            </Link>
          )}

          {/* Cấu hình hệ thống: Chỉ Admin */}
          {hasRole('admin') && (
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-sm font-medium transition cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span>Cấu hình hệ thống</span>
            </Link>
          )}
        </div>
      </div>

      {/* 5. Hai khối Widget chính: Đơn mới cần xử lý & Tuyến Banner Top */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget 1: Đơn đặt xe mới nhất cần xử lý (Chiếm 2 cột) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50/50 border-b border-slate-100">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900">
                  <Car className="w-5 h-5 text-amber-600" />
                  Đơn đặt xe mới nhất cần xử lý
                </CardTitle>
                <CardDescription>
                  Danh sách 5 đơn hàng trạng thái Chờ duyệt (Pending) gần đây nhất
                </CardDescription>
              </div>
              <Link
                to="/bookings?status=pending"
                className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 font-semibold transition"
              >
                Xem tất cả ({pendingBookingsCount})
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                  Đang nạp danh sách đơn chờ xử lý...
                </div>
              ) : pendingBookingsList.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2" data-testid="empty-pending-bookings">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-sm font-medium text-slate-700">
                    Hiện không có đơn nào đang chờ duyệt
                  </p>
                  <p className="text-xs text-slate-500">
                    Tất cả đơn đặt xe đều đã được xác nhận hoặc điều phối thành công.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs" data-testid="pending-bookings-table">
                    <thead className="bg-slate-50 text-slate-600 font-medium uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Mã đơn</th>
                        <th className="px-4 py-3">Tên khách</th>
                        <th className="px-4 py-3">Lộ trình</th>
                        <th className="px-4 py-3">Giờ đón</th>
                        <th className="px-4 py-3 text-right">Giá dự tính</th>
                        <th className="px-4 py-3 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingBookingsList.map((booking) => {
                        const routeName =
                          typeof booking.route === 'object' && booking.route?.name
                            ? booking.route.name
                            : `${booking.pickupLocation} → ${booking.dropoffLocation}`;

                        return (
                          <tr
                            key={booking.id}
                            className="hover:bg-amber-50/30 transition group"
                            data-testid={`booking-row-${booking.id}`}
                          >
                            <td className="px-4 py-3.5 font-bold text-amber-600 whitespace-nowrap">
                              {booking.bookingCode || `#${booking.id}`}
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 border border-blue-100">
                                  {booking.customerName ? booking.customerName[0] : 'K'}
                                </div>
                                <span className="text-slate-900 font-medium">{booking.customerName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-slate-600 max-w-[200px] truncate" title={routeName}>
                              {routeName}
                            </td>
                            <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                              {formatDateTime(booking.pickupDatetime)}
                            </td>
                            <td className="px-4 py-3.5 text-right font-semibold text-emerald-600 whitespace-nowrap">
                              {booking.estimatedPrice ? formatVND(booking.estimatedPrice) : 'Chưa có'}
                            </td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              <Link
                                to={`/bookings?search=${booking.bookingCode || booking.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 transition text-xs font-semibold cursor-pointer shadow-2xs"
                              >
                                Xem & Xử lý
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Widget 2: Tuyến xe nổi bật (Banner Top) (Chiếm 1 cột) */}
        <div className="space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50/50 border-b border-slate-100">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Tuyến xe nổi bật (Banner Top)
                </CardTitle>
                <CardDescription>
                  Các tuyến đang được ghim vị trí ưu tiên cao nhất
                </CardDescription>
              </div>
              <Link
                to="/routes"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold transition"
              >
                Tất cả tuyến
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="space-y-3 p-4">
              {isLoading ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  Đang nạp danh sách tuyến nổi bật...
                </div>
              ) : bannerTopRoutes.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs" data-testid="empty-banner-routes">
                  Chưa có tuyến xe nào được ghim Banner Top.
                </div>
              ) : (
                bannerTopRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition flex items-center justify-between gap-3 group"
                    data-testid={`banner-route-${route.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition truncate">
                          {route.name}
                        </h4>
                        {route.bannerLabel && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
                            {route.bannerLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Cự ly: <strong className="text-slate-700">{route.distance || 'Đang cập nhật'}</strong></span>
                        <span>•</span>
                        <span>
                          {route.priceFrom ? (
                            <span className="text-emerald-600 font-semibold">{formatVND(route.priceFrom)}</span>
                          ) : (
                            <span className="text-slate-500">Liên hệ</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/routes/${route.id}`}
                      className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer shrink-0 shadow-2xs"
                      title="Chỉnh sửa tuyến"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 6. Mẹo vận hành cho người dùng mới (Operational Pro-tips Widget) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/60 via-slate-50 to-indigo-50/40 border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-3">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>3 Mẹo Vàng Vận Hành Dành Cho Người Dùng Mới</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="font-semibold text-slate-900 block">📞 Quy tắc gọi điện 5 phút</span>
            <p className="text-slate-500">
              Khách đặt xe trực tuyến thường muốn chốt chuyến ngay. Hãy gọi xác nhận sớm nhất để tránh khách tìm nhà xe khác.
            </p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="font-semibold text-slate-900 block">⭐ Ghim Banner Top đúng thời điểm</span>
            <p className="text-slate-500">
              Vào dịp cuối tuần hoặc lễ tết, hãy ghim các tuyến Sân bay và Cao tốc trọng điểm lên đầu để tăng tối đa lượng booking.
            </p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="font-semibold text-slate-900 block">⌨️ Tận dụng phím tắt Ctrl + K</span>
            <p className="text-slate-500">
              Nhấn <code>Ctrl + K</code> để tìm nhanh mọi mã đơn hàng, tuyến xe hoặc bài viết mà không cần lội qua từng menu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
