import { type ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/admin/context/AuthContext';

export interface ProtectedRouteProps {
  children?: ReactNode;
}

/**
 * Route bảo vệ: Kiểm tra trạng thái đăng nhập.
 * - Đang tải: Hiển thị màn hình chờ với Spinner.
 * - Chưa đăng nhập: Chuyển hướng về /login kèm state lưu lại vị trí ban đầu.
 * - Đã đăng nhập: Render outlet hoặc children.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-600">Đang kiểm tra phiên làm việc...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
