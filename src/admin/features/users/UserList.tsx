import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { Select } from '@/admin/components/ui/Select';
import { Badge } from '@/admin/components/ui/Badge';
import { DataTable, type Column } from '@/admin/components/common/DataTable';
import { ConfirmDialog } from '@/admin/components/common/ConfirmDialog';
import { useAuth } from '@/admin/context/AuthContext';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import { formatDateTime } from '@/admin/lib/utils';
import type { User, Role } from '@/admin/types/auth';
import type { PaginatedResponse } from '@/admin/types/api';
import { UserFormModal } from './UserFormModal';

const MOCK_USERS: User[] = [
  {
    id: 1,
    email: 'admin@xegheplientinh.vn',
    fullName: 'Quản trị viên Hệ thống',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    email: 'editor@xegheplientinh.vn',
    fullName: 'Biên tập viên Nội dung',
    role: 'editor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    email: 'dispatcher@xegheplientinh.vn',
    fullName: 'Điều phối viên Chuyến xe',
    role: 'dispatcher',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function UserList() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Modal thêm/sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Confirm delete
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get<PaginatedResponse<User>>('/users', {
        params: { limit: 100, sort: '-createdAt' },
      });
      if (res.data?.docs && res.data.docs.length > 0) {
        setUsers(res.data.docs);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: User) => {
    setEditingUser(doc);
    setIsModalOpen(true);
  };

  const handleSuccessSaved = (savedUser: User) => {
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === savedUser.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedUser;
        return next;
      }
      return [savedUser, ...prev];
    });
    setSuccessMsg('Lưu tài khoản quản trị thành công!');
  };

  const handleDeleteRequest = (doc: User) => {
    // Chặn xóa tài khoản đang đăng nhập
    if (
      (currentUser?.id && doc.id === currentUser.id) ||
      (currentUser?.email && doc.email.toLowerCase() === currentUser.email.toLowerCase())
    ) {
      setError('Bạn không thể tự xóa tài khoản của chính mình.');
      return;
    }
    setUserToDelete(doc);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    if (
      (currentUser?.id && userToDelete.id === currentUser.id) ||
      (currentUser?.email && userToDelete.email.toLowerCase() === currentUser.email.toLowerCase())
    ) {
      setError('Không thể xóa tài khoản đang đăng nhập.');
      setUserToDelete(null);
      return;
    }

    try {
      setIsDeleting(true);
      await apiClient.delete(`/users/${userToDelete.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setSuccessMsg(`Đã xóa tài khoản "${userToDelete.email}".`);
      setUserToDelete(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (role: Role | string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge
            variant="destructive"
            className="bg-rose-50 text-rose-700 border border-rose-200"
          >
            Admin
          </Badge>
        );
      case 'editor':
        return (
          <Badge
            variant="info"
            className="bg-blue-50 text-blue-700 border border-blue-200"
          >
            Editor
          </Badge>
        );
      case 'dispatcher':
        return (
          <Badge
            variant="warning"
            className="bg-amber-50 text-amber-800 border border-amber-200"
          >
            Dispatcher
          </Badge>
        );
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = selectedRole === 'all' || u.role === selectedRole;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        u.email.toLowerCase().includes(q) ||
        (u.fullName && u.fullName.toLowerCase().includes(q));
      return matchRole && matchSearch;
    });
  }, [users, selectedRole, searchQuery]);

  const columns: Column<User>[] = [
    {
      key: 'email',
      header: 'Tài khoản Email',
      render: (item) => {
        const isSelf =
          (currentUser?.id && item.id === currentUser.id) ||
          (currentUser?.email && item.email.toLowerCase() === currentUser.email.toLowerCase());

        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-xs text-blue-600 border border-blue-200">
              {item.email.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{item.email}</span>
                {isSelf && (
                  <Badge variant="outline" className="text-[10px] text-blue-700 border-blue-300 bg-blue-50">
                    Bạn
                  </Badge>
                )}
              </div>
              <div className="text-xs text-slate-500">ID: #{item.id}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'fullName',
      header: 'Họ và tên',
      render: (item) => (
        <span className="text-sm text-slate-800">
          {item.fullName || <span className="text-slate-400 italic">(Chưa cập nhật)</span>}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (item) => getRoleBadge(item.role),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (item) => (
        <span className="text-xs text-slate-500 font-mono">
          {formatDateTime(item.createdAt) || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (item) => {
        const isSelf =
          (currentUser?.id && item.id === currentUser.id) ||
          (currentUser?.email && item.email.toLowerCase() === currentUser.email.toLowerCase());

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenEdit(item)}
              className="p-1.5 h-8 text-slate-600 hover:text-slate-900"
              title="Sửa tài khoản"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDeleteRequest(item)}
              disabled={Boolean(isSelf)}
              className={
                isSelf
                  ? 'p-1.5 h-8 text-slate-400 border-slate-200 cursor-not-allowed opacity-40'
                  : 'p-1.5 h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200'
              }
              title={isSelf ? 'Không thể xóa tài khoản đang đăng nhập' : 'Xóa tài khoản'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Quản lý Tài khoản Quản trị</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Phân quyền vai trò và quản lý danh sách người dùng được phép đăng nhập vào hệ thống Admin CMS.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm tài khoản
        </Button>
      </div>

      {/* Thông báo Alert */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Toolbar & Bộ lọc */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Select
            options={[
              { label: 'Tất cả vai trò', value: 'all' },
              { label: 'Admin (Toàn quyền)', value: 'admin' },
              { label: 'Editor (Biên tập viên)', value: 'editor' },
              { label: 'Dispatcher (Điều phối viên)', value: 'dispatcher' },
            ]}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-52"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          isLoading={isLoading}
          className="gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Làm mới
        </Button>
      </div>

      {/* Bảng danh sách User */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Tìm theo email hoặc họ tên..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pagination
        pageSize={10}
        emptyTitle="Không tìm thấy tài khoản người dùng"
        emptyMessage="Vui lòng thử lại với từ khóa tìm kiếm hoặc bộ lọc khác."
      />

      {/* Modal Thêm/Sửa */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccessSaved}
        userDoc={editingUser}
      />

      {/* Dialog Xác nhận Xóa */}
      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa tài khoản quản trị"
        description={`Bạn có chắc muốn xóa tài khoản "${userToDelete?.email}" (${userToDelete?.fullName || 'Không rõ họ tên'})? Người này sẽ ngay lập tức mất quyền truy cập Admin CMS.`}
        confirmText="Xác nhận xóa"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default UserList;
