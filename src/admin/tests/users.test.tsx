import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthContext, { type AuthContextType } from '@/admin/context/AuthContext';
import { UserList } from '@/admin/features/users/UserList';
import { UserFormModal } from '@/admin/features/users/UserFormModal';
import { apiClient } from '@/admin/lib/api-client';
import type { User, Role } from '@/admin/types/auth';

// Mock apiClient
vi.mock('@/admin/lib/api-client', async () => {
  const actual = await vi.importActual<typeof import('@/admin/lib/api-client')>('@/admin/lib/api-client');
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

const mockCurrentUser: User = {
  id: 1,
  email: 'admin@xegheplientinh.vn',
  fullName: 'Quản trị viên Hệ thống',
  role: 'admin',
};

const mockUsers: User[] = [
  mockCurrentUser,
  {
    id: 2,
    email: 'editor@xegheplientinh.vn',
    fullName: 'Biên tập viên Nội dung',
    role: 'editor',
    createdAt: '2026-10-02T00:00:00Z',
  },
  {
    id: 3,
    email: 'dispatcher@xegheplientinh.vn',
    fullName: 'Điều phối viên Chuyến xe',
    role: 'dispatcher',
    createdAt: '2026-10-03T00:00:00Z',
  },
];

function createMockAuth(currentUser: User = mockCurrentUser): AuthContextType {
  return {
    user: currentUser,
    token: 'jwt-mock-token',
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn() as any,
    logout: vi.fn(),
    hasRole: (roles: Role | Role[]) => {
      const list = Array.isArray(roles) ? roles : [roles];
      return list.includes(currentUser.role);
    },
    refreshUser: vi.fn().mockResolvedValue(currentUser),
  };
}

describe('Users Module (Task T120 - Chỉ Admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UserList Component', () => {
    it('hiển thị danh sách tài khoản từ API kèm Badge vai trò (Admin, Editor, Dispatcher)', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { docs: mockUsers, totalDocs: mockUsers.length },
      });

      render(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth()}>
            <UserList />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/users', expect.any(Object));
      });

      expect(screen.getByText('admin@xegheplientinh.vn')).toBeDefined();
      expect(screen.getByText('Quản trị viên Hệ thống')).toBeDefined();
      expect(screen.getByText('Admin')).toBeDefined();

      expect(screen.getByText('editor@xegheplientinh.vn')).toBeDefined();
      expect(screen.getByText('Biên tập viên Nội dung')).toBeDefined();
      expect(screen.getByText('Editor')).toBeDefined();

      expect(screen.getByText('dispatcher@xegheplientinh.vn')).toBeDefined();
      expect(screen.getByText('Điều phối viên Chuyến xe')).toBeDefined();
      expect(screen.getByText('Dispatcher')).toBeDefined();
    });

    it('chặn xóa tài khoản đang đăng nhập (vô hiệu hóa nút xóa và thông báo bảo vệ)', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { docs: mockUsers, totalDocs: mockUsers.length },
      });

      render(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(mockCurrentUser)}>
            <UserList />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('admin@xegheplientinh.vn')).toBeDefined();
      });

      // Nút xóa của tài khoản đang đăng nhập bị disable
      const selfDeleteBtn = screen.getByTitle('Không thể xóa tài khoản đang đăng nhập') as HTMLButtonElement;
      expect(selfDeleteBtn).toBeDefined();
      expect(selfDeleteBtn.disabled).toBe(true);

      // Không thể click kích hoạt dialog xóa cho tài khoản hiện tại
      fireEvent.click(selfDeleteBtn);
      expect(screen.queryByText(/Xác nhận xóa tài khoản quản trị/i)).toBeNull();
    });

    it('cho phép xóa tài khoản người dùng khác và gọi DELETE /api/users/:id khi xác nhận', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { docs: mockUsers, totalDocs: mockUsers.length },
      });
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { message: 'Deleted' } });

      render(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth(mockCurrentUser)}>
            <UserList />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('editor@xegheplientinh.vn')).toBeDefined();
      });

      // Các nút xóa có title "Xóa tài khoản" dành cho user khác
      const otherDeleteBtns = screen.getAllByTitle('Xóa tài khoản');
      expect(otherDeleteBtns.length).toBeGreaterThanOrEqual(1);

      fireEvent.click(otherDeleteBtns[0]); // User ID=2 (Editor)

      expect(screen.getByText(/Xác nhận xóa tài khoản quản trị/i)).toBeDefined();

      const confirmDeleteBtn = screen.getByRole('button', { name: /Xác nhận xóa/i });
      fireEvent.click(confirmDeleteBtn);

      await waitFor(() => {
        expect(apiClient.delete).toHaveBeenCalledWith('/users/2');
      });
    });

    it('lọc danh sách tài khoản theo vai trò (Role)', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { docs: mockUsers, totalDocs: mockUsers.length },
      });

      render(
        <MemoryRouter>
          <AuthContext.Provider value={createMockAuth()}>
            <UserList />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('admin@xegheplientinh.vn')).toBeDefined();
      });

      const roleSelect = screen.getByDisplayValue('Tất cả vai trò');
      fireEvent.change(roleSelect, { target: { value: 'dispatcher' } });

      expect(screen.getByText('dispatcher@xegheplientinh.vn')).toBeDefined();
      expect(screen.queryByText('editor@xegheplientinh.vn')).toBeNull();
      expect(screen.queryByText('admin@xegheplientinh.vn')).toBeNull();
    });
  });

  describe('UserFormModal Component', () => {
    it('báo lỗi khi tạo mới user mà thiếu mật khẩu hoặc mật khẩu ngắn hơn 6 ký tự', async () => {
      render(
        <UserFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      const emailInput = screen.getByLabelText(/Địa chỉ Email/i);
      fireEvent.change(emailInput, { target: { value: 'newuser@xegheplientinh.vn' } });

      const pwdInput = screen.getByLabelText(/^Mật khẩu/i);
      fireEvent.change(pwdInput, { target: { value: '123' } });

      const submitBtn = screen.getByRole('button', { name: /Tạo tài khoản/i });
      fireEvent.submit(submitBtn.closest('form')!);

      await waitFor(() => {
        expect(screen.getByText(/Mật khẩu tối thiểu phải từ 6 ký tự trở lên/i)).toBeDefined();
      });
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('gọi POST /api/users khi tạo mới tài khoản thành công với email, fullName, role, password', async () => {
      const onSuccess = vi.fn();
      const onClose = vi.fn();

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          doc: {
            id: 10,
            email: 'newdispatcher@xegheplientinh.vn',
            fullName: 'Điều phối viên Mới',
            role: 'dispatcher',
          },
        },
      });

      render(
        <UserFormModal
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      );

      const emailInput = screen.getByLabelText(/Địa chỉ Email/i);
      fireEvent.change(emailInput, { target: { value: 'newdispatcher@xegheplientinh.vn' } });

      const nameInput = screen.getByLabelText(/Họ và tên/i);
      fireEvent.change(nameInput, { target: { value: 'Điều phối viên Mới' } });

      const pwdInput = screen.getByLabelText(/^Mật khẩu/i);
      fireEvent.change(pwdInput, { target: { value: 'Matkhau123!' } });

      const roleSelect = screen.getByLabelText(/Vai trò & Quyền hạn/i);
      fireEvent.change(roleSelect, { target: { value: 'dispatcher' } });

      const submitBtn = screen.getByRole('button', { name: /Tạo tài khoản/i });
      fireEvent.submit(submitBtn.closest('form')!);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/users',
          expect.objectContaining({
            email: 'newdispatcher@xegheplientinh.vn',
            fullName: 'Điều phối viên Mới',
            role: 'dispatcher',
            password: 'Matkhau123!',
          })
        );
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('gọi PATCH /api/users/:id khi chỉnh sửa thông tin/vai trò của người dùng', async () => {
      const onSuccess = vi.fn();
      const onClose = vi.fn();

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: {
          doc: {
            id: 2,
            email: 'editor@xegheplientinh.vn',
            fullName: 'Biên tập viên Nâng cấp',
            role: 'admin',
          },
        },
      });

      render(
        <UserFormModal
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
          userDoc={mockUsers[1]}
        />
      );

      const nameInput = screen.getByLabelText(/Họ và tên/i);
      fireEvent.change(nameInput, { target: { value: 'Biên tập viên Nâng cấp' } });

      const roleSelect = screen.getByLabelText(/Vai trò & Quyền hạn/i);
      fireEvent.change(roleSelect, { target: { value: 'admin' } });

      const submitBtn = screen.getByRole('button', { name: /Lưu thay đổi/i });
      fireEvent.submit(submitBtn.closest('form')!);

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith(
          '/users/2',
          expect.objectContaining({
            fullName: 'Biên tập viên Nâng cấp',
            role: 'admin',
          })
        );
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
