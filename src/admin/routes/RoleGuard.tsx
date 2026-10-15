import { type ReactNode } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/admin/context/AuthContext';
import type { Role } from '@/admin/types/auth';

export interface RoleGuardProps {
  allowedRoles: Role[];
  children?: ReactNode;
  fallback?: ReactNode;
}

/**
 * RoleGuard: Chặn truy cập đối với tài khoản không có vai trò phù hợp trong danh sách `allowedRoles`.
 * Hiển thị trang 403 Forbidden hoặc fallback được truyền vào.
 */
export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user, hasRole } = useAuth();

  const isAllowed = hasRole(allowedRoles);

  if (!isAllowed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          403 - Bạn không có quyền truy cập trang này
        </h2>
        <p className="text-sm text-slate-500 max-w-md mt-2">
          Tài khoản của bạn ({user?.role ? `vai trò "${user.role}"` : 'chưa xác định'}) không được cấp quyền truy cập phân hệ này. Chỉ các vai trò ({allowedRoles.join(', ')}) mới có quyền thực hiện.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition cursor-pointer shadow-sm shadow-blue-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Bảng điều khiển</span>
          </Link>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}

export default RoleGuard;
