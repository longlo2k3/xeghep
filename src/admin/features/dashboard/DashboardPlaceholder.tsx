import { useAuth } from '@/admin/context/AuthContext';
import {
  MapPin,
  FileText,
  Calendar,
  Settings,
  Layers,
  Image,
  Receipt,
  ArrowRightLeft,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPlaceholder() {
  const { user, hasRole } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Xin chào, {user?.fullName || user?.email}!
        </h2>
        <p className="text-sm text-slate-500">
          Chào mừng bạn đến với hệ thống Quản trị CMS Xe Ghép Liên Tỉnh. Bạn đang đăng nhập với vai trò{' '}
          <strong className="text-blue-600 uppercase">{user?.role}</strong>.
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hasRole(['admin', 'dispatcher']) && (
          <Link
            to="/bookings"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition group cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 group-hover:text-amber-600 transition">
              Đơn đặt xe & Điều phối
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Tiếp nhận đơn, cập nhật trạng thái đơn theo State Machine.
            </p>
          </Link>
        )}

        {hasRole(['admin', 'editor']) && (
          <>
            <Link
              to="/routes"
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition group cursor-pointer shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition">
                Tuyến đường & Giá cước
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Quản trị 9+ tuyến đường liên tỉnh và cấu hình giá vé.
              </p>
            </Link>

            <Link
              to="/articles"
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition group cursor-pointer shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                Bài viết & Cẩm nang
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Biên tập bài viết chuẩn SEO, cẩm nang du lịch và tin khuyến mại.
              </p>
            </Link>

            <Link
              to="/pages"
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition group cursor-pointer shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition">
                Trang nội dung
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Quản lý các trang tĩnh, trang chính sách hệ thống.
              </p>
            </Link>

            <Link
              to="/media"
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition group cursor-pointer shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-3">
                <Image className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition">
                Thư viện Media
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tải lên và quản lý hình ảnh với thẻ Alt bắt buộc.
              </p>
            </Link>
          </>
        )}

        {hasRole(['admin', 'dispatcher']) && (
          <>
            <Link
              to="/pricing"
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition group cursor-pointer shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mb-3">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition">
                Bảng giá phụ
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Bảng giá sân bay theo quận và giá đường dài theo km.
              </p>
            </Link>
          </>
        )}

        {hasRole(['admin', 'editor']) && (
          <Link
            to="/redirects"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition group cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mb-3">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition">
              Chuyển hướng 301
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý các chuyển hướng URL và ngăn chặn vòng lặp.
            </p>
          </Link>
        )}

        {hasRole(['admin']) && (
          <>
            <Link
              to="/settings"
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition group cursor-pointer shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-3">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-rose-600 transition">
                Cấu hình Doanh nghiệp
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hotline, Zalo, địa chỉ và thiết lập giá chung.
              </p>
            </Link>

            <Link
              to="/users"
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition group cursor-pointer shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-pink-600 transition">
                Quản lý Người dùng
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Danh sách tài khoản và phân quyền quản trị viên.
              </p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardPlaceholder;
