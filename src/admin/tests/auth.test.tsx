import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthContext, { type AuthContextType } from '@/admin/context/AuthContext';
import { RoleGuard } from '@/admin/routes/RoleGuard';
import { ProtectedRoute } from '@/admin/routes/ProtectedRoute';
import { LoginPage } from '@/admin/features/auth/LoginPage';
import type { User, Role } from '@/admin/types/auth';

function createMockAuthContext(overrides?: Partial<AuthContextType>): AuthContextType {
  const defaultUser: User = {
    id: 1,
    email: 'admin@xegheplientinh.vn',
    fullName: 'Quản trị viên',
    role: 'admin',
  };

  const hasRoleFn = (roles: Role | Role[]): boolean => {
    const user = overrides?.user !== undefined ? overrides.user : defaultUser;
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  };

  return {
    user: defaultUser,
    token: 'valid-jwt-token',
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    hasRole: hasRoleFn,
    refreshUser: vi.fn().mockResolvedValue(defaultUser),
    ...overrides,
  };
}

describe('Auth & RBAC Logic', () => {
  describe('hasRole logic', () => {
    it('kiểm tra vai trò Admin chính xác', () => {
      const adminCtx = createMockAuthContext({
        user: { id: 1, email: 'admin@test.vn', role: 'admin' },
      });
      expect(adminCtx.hasRole('admin')).toBe(true);
      expect(adminCtx.hasRole(['admin', 'editor'])).toBe(true);
      expect(adminCtx.hasRole('editor')).toBe(false);
      expect(adminCtx.hasRole(['editor', 'dispatcher'])).toBe(false);
    });

    it('kiểm tra vai trò Editor chính xác', () => {
      const editorCtx = createMockAuthContext({
        user: { id: 2, email: 'editor@test.vn', role: 'editor' },
      });
      expect(editorCtx.hasRole('editor')).toBe(true);
      expect(editorCtx.hasRole(['admin', 'editor'])).toBe(true);
      expect(editorCtx.hasRole('dispatcher')).toBe(false);
      expect(editorCtx.hasRole('admin')).toBe(false);
    });

    it('kiểm tra vai trò Dispatcher chính xác', () => {
      const dispatcherCtx = createMockAuthContext({
        user: { id: 3, email: 'dispatcher@test.vn', role: 'dispatcher' },
      });
      expect(dispatcherCtx.hasRole('dispatcher')).toBe(true);
      expect(dispatcherCtx.hasRole(['admin', 'dispatcher'])).toBe(true);
      expect(dispatcherCtx.hasRole('editor')).toBe(false);
    });

    it('trả về false khi người dùng chưa đăng nhập (user = null)', () => {
      const unauthCtx = createMockAuthContext({
        user: null,
        isAuthenticated: false,
      });
      expect(unauthCtx.hasRole('admin')).toBe(false);
      expect(unauthCtx.hasRole('editor')).toBe(false);
      expect(unauthCtx.hasRole(['admin', 'editor', 'dispatcher'])).toBe(false);
    });
  });

  describe('RoleGuard Component', () => {
    it('hiển thị nội dung bên trong khi vai trò hợp lệ', () => {
      const mockAuth = createMockAuthContext({
        user: { id: 1, email: 'admin@test.vn', role: 'admin' },
      });

      render(
        <MemoryRouter>
          <AuthContext.Provider value={mockAuth}>
            <RoleGuard allowedRoles={['admin', 'editor']}>
              <div>Nội dung phân hệ Tuyến đường</div>
            </RoleGuard>
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(screen.getByText('Nội dung phân hệ Tuyến đường')).toBeDefined();
      expect(screen.queryByText(/403 - Bạn không có quyền truy cập trang này/)).toBeNull();
    });

    it('chặn truy cập và hiển thị 403 khi vai trò không nằm trong danh sách cho phép', () => {
      const mockAuth = createMockAuthContext({
        user: { id: 2, email: 'dispatcher@test.vn', role: 'dispatcher' },
      });

      render(
        <MemoryRouter>
          <AuthContext.Provider value={mockAuth}>
            <RoleGuard allowedRoles={['admin', 'editor']}>
              <div>Nội dung Tuyến đường bí mật</div>
            </RoleGuard>
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(screen.queryByText('Nội dung Tuyến đường bí mật')).toBeNull();
      expect(
        screen.getByText(/403 - Bạn không có quyền truy cập trang này/)
      ).toBeDefined();
      expect(screen.getByText(/vai trò "dispatcher"/)).toBeDefined();
    });

    it('hiển thị fallback tùy biến nếu được cung cấp khi không có quyền', () => {
      const mockAuth = createMockAuthContext({
        user: { id: 2, email: 'editor@test.vn', role: 'editor' },
      });

      render(
        <MemoryRouter>
          <AuthContext.Provider value={mockAuth}>
            <RoleGuard
              allowedRoles={['admin']}
              fallback={<div>Fallback: Bạn không phải Admin</div>}
            >
              <div>Nội dung Admin Cài đặt</div>
            </RoleGuard>
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(screen.getByText('Fallback: Bạn không phải Admin')).toBeDefined();
      expect(screen.queryByText('Nội dung Admin Cài đặt')).toBeNull();
    });
  });

  describe('ProtectedRoute Component', () => {
    it('hiển thị màn hình chờ khi đang nạp phiên (isLoading = true)', () => {
      const mockAuth = createMockAuthContext({
        isLoading: true,
        isAuthenticated: false,
        user: null,
      });

      render(
        <MemoryRouter>
          <AuthContext.Provider value={mockAuth}>
            <ProtectedRoute>
              <div>Trang bảo vệ bí mật</div>
            </ProtectedRoute>
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(screen.getByText('Đang kiểm tra phiên làm việc...')).toBeDefined();
      expect(screen.queryByText('Trang bảo vệ bí mật')).toBeNull();
    });

    it('chuyển hướng về /login khi chưa đăng nhập (isAuthenticated = false)', () => {
      const mockAuth = createMockAuthContext({
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthContext.Provider value={mockAuth}>
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <div>Dashboard bí mật</div>
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<div>Màn hình Đăng Nhập</div>} />
            </Routes>
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(screen.getByText('Màn hình Đăng Nhập')).toBeDefined();
      expect(screen.queryByText('Dashboard bí mật')).toBeNull();
    });

    it('hiển thị children khi đã đăng nhập hợp lệ (isAuthenticated = true)', () => {
      const mockAuth = createMockAuthContext({
        isLoading: false,
        isAuthenticated: true,
        user: { id: 1, email: 'admin@test.vn', role: 'admin' },
      });

      render(
        <MemoryRouter>
          <AuthContext.Provider value={mockAuth}>
            <ProtectedRoute>
              <div>Nội dung Bảng Điều Khiển</div>
            </ProtectedRoute>
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(screen.getByText('Nội dung Bảng Điều Khiển')).toBeDefined();
    });
  });

  describe('LoginPage Component', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('render đầy đủ các trường nhập liệu và nút đăng nhập', () => {
      const mockAuth = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      render(
        <MemoryRouter>
          <AuthContext.Provider value={mockAuth}>
            <LoginPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(screen.getByLabelText(/Địa chỉ Email/i)).toBeDefined();
      expect(screen.getByLabelText(/^Mật khẩu/i)).toBeDefined();
      expect(screen.getByText(/Ghi nhớ tài khoản/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /Đăng nhập/i })).toBeDefined();
    });

    it('gọi hàm login và chuyển hướng khi gửi form hợp lệ', async () => {
      const loginMock = vi.fn().mockResolvedValue({
        id: 1,
        email: 'admin@test.vn',
        role: 'admin',
      });
      const mockAuth = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        login: loginMock,
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthContext.Provider value={mockAuth}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<div>Trang Dashboard</div>} />
            </Routes>
          </AuthContext.Provider>
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/Địa chỉ Email/i);
      const passwordInput = screen.getByLabelText(/^Mật khẩu/i);
      const submitBtn = screen.getByRole('button', { name: /Đăng nhập/i });

      fireEvent.change(emailInput, { target: { value: 'admin@test.vn' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(loginMock).toHaveBeenCalledWith('admin@test.vn', 'Password123');
      });
    });

    it('hiển thị thông báo lỗi tiếng Việt và xóa mật khẩu khi đăng nhập thất bại', async () => {
      const loginMock = vi.fn().mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 401,
          data: { message: 'Tài khoản hoặc mật khẩu không chính xác' },
        },
      });

      const mockAuth = createMockAuthContext({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        login: loginMock,
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthContext.Provider value={mockAuth}>
            <LoginPage />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/Địa chỉ Email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/^Mật khẩu/i) as HTMLInputElement;
      const submitBtn = screen.getByRole('button', { name: /Đăng nhập/i });

      fireEvent.change(emailInput, { target: { value: 'wrong@test.vn' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpwd' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeDefined();
      });

      expect(screen.getByText(/Tài khoản hoặc mật khẩu không chính xác/i)).toBeDefined();
      // Theo AC1.2: Giữ lại email và xóa trường mật khẩu
      expect(emailInput.value).toBe('wrong@test.vn');
      expect(passwordInput.value).toBe('');
    });
  });
});
