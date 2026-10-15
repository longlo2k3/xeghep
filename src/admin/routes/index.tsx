import { Routes, Route, Link } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { LoginPage } from '@/admin/features/auth/LoginPage';
import { DashboardOverview } from '@/admin/features/dashboard';
import { MediaGallery } from '@/admin/features/media';
import { RouteList, RouteForm } from '@/admin/features/routes';
import { ArticleList, ArticleForm } from '@/admin/features/articles';
import { PageList, PageForm } from '@/admin/features/pages';
import { BookingList } from '@/admin/features/bookings';
import { SettingsPage } from '@/admin/features/settings';
import { PricingPage } from '@/admin/features/pricing';
import { RedirectList } from '@/admin/features/redirects';
import { UserList } from '@/admin/features/users';
import { HelpCenterPage } from '@/admin/features/help';
import { DashboardLayout } from '@/admin/layouts/DashboardLayout';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-blue-600 mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Trang không tồn tại</h2>
      <p className="text-sm text-slate-500 mb-6">
        Đường dẫn bạn yêu cầu không tồn tại trên hệ thống Admin CMS.
      </p>
      <Link
        to="/dashboard"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition cursor-pointer shadow-sm shadow-blue-500/20"
      >
        Về Bảng điều khiển
      </Link>
    </div>
  );
}


export function AppRoutes() {
  return (
    <Routes>
      {/* Route công khai: Đăng nhập */}
      <Route path="/login" element={<LoginPage />} />

      {/* Tuyến được bảo vệ bởi ProtectedRoute & lồng trong DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/dashboard" element={<DashboardOverview />} />

          {/* Quản trị Tuyến đường & Bảng giá cước (T114, T115) */}
          <Route
            path="/routes"
            element={
              <RoleGuard allowedRoles={['admin', 'editor']}>
                <RouteList />
              </RoleGuard>
            }
          />
          <Route
            path="/routes/new"
            element={
              <RoleGuard allowedRoles={['admin', 'editor']}>
                <RouteForm />
              </RoleGuard>
            }
          />
          <Route
            path="/routes/:id"
            element={
              <RoleGuard allowedRoles={['admin', 'editor']}>
                <RouteForm />
              </RoleGuard>
            }
          />
          <Route
            path="/routes/:id/view"
            element={
              <RoleGuard allowedRoles={['admin', 'editor']}>
                <RouteForm />
              </RoleGuard>
            }
          />
          {/* Quản trị Bài viết Tin tức & Cẩm nang (T112) */}
          <Route
            path="/articles"
            element={
              <RoleGuard allowedRoles={['admin', 'editor']}>
                <ArticleList />
              </RoleGuard>
            }
          />
          <Route
            path="/articles/new"
            element={
              <RoleGuard allowedRoles={['admin', 'editor']}>
                <ArticleForm />
              </RoleGuard>
            }
          />
          <Route
            path="/articles/:id"
            element={
              <RoleGuard allowedRoles={['admin', 'editor']}>
                <ArticleForm />
              </RoleGuard>
            }
          />

          {/* Quản trị Trang Nội dung & Chính sách (T113) */}
          <Route
            path="/pages"
            element={
              <RoleGuard allowedRoles={['admin', 'editor']}>
                <PageList />
              </RoleGuard>
            }
          />
          <Route
            path="/pages/new"
            element={
              <RoleGuard allowedRoles={['admin', 'editor']}>
                <PageForm />
              </RoleGuard>
            }
          />
          <Route
            path="/pages/:id"
            element={
              <RoleGuard allowedRoles={['admin', 'editor']}>
                <PageForm />
              </RoleGuard>
            }
          />
          <Route
            path="/media"
            element={
              <RoleGuard allowedRoles={['admin', 'editor']}>
                <MediaGallery />
              </RoleGuard>
            }
          />
          <Route
            path="/media/*"
            element={
              <RoleGuard allowedRoles={['admin', 'editor']}>
                <MediaGallery />
              </RoleGuard>
            }
          />
          <Route
            path="/redirects"
            element={
              <RoleGuard allowedRoles={['admin', 'editor']}>
                <RedirectList />
              </RoleGuard>
            }
          />
          <Route
            path="/redirects/*"
            element={
              <RoleGuard allowedRoles={['admin', 'editor']}>
                <RedirectList />
              </RoleGuard>
            }
          />

          {/* Phân hệ Quản lý Đơn đặt xe & Điều phối (T116, T117) */}
          <Route
            path="/bookings"
            element={
              <RoleGuard allowedRoles={['admin', 'dispatcher', 'editor']}>
                <BookingList />
              </RoleGuard>
            }
          />
          <Route
            path="/bookings/*"
            element={
              <RoleGuard allowedRoles={['admin', 'dispatcher', 'editor']}>
                <BookingList />
              </RoleGuard>
            }
          />
          <Route
            path="/pricing"
            element={
              <RoleGuard allowedRoles={['admin', 'dispatcher']}>
                <PricingPage />
              </RoleGuard>
            }
          />
          <Route
            path="/pricing/*"
            element={
              <RoleGuard allowedRoles={['admin', 'dispatcher']}>
                <PricingPage />
              </RoleGuard>
            }
          />

          {/* Phân hệ chỉ dành cho Admin (T118, T120) */}
          <Route
            path="/settings"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <SettingsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/settings/*"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <SettingsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/users"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <UserList />
              </RoleGuard>
            }
          />
          <Route
            path="/users/*"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <UserList />
              </RoleGuard>
            }
          />
          {/* Cẩm nang Hướng dẫn & Trợ giúp Vận hành CMS (Dành cho tất cả vai trò) */}
          <Route
            path="/help"
            element={
              <RoleGuard allowedRoles={['admin', 'editor', 'dispatcher']}>
                <HelpCenterPage />
              </RoleGuard>
            }
          />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
