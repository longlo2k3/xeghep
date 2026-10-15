import { useState, useEffect, type FormEvent } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { Input } from '@/admin/components/ui/Input';
import { Select } from '@/admin/components/ui/Select';
import { Modal } from '@/admin/components/ui/Modal';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import type { User, Role } from '@/admin/types/auth';

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedUser: User) => void;
  userDoc?: User | null;
}

const ROLE_OPTIONS: { label: string; value: Role }[] = [
  { label: 'Admin (Quản trị viên toàn quyền)', value: 'admin' },
  { label: 'Editor (Biên tập viên nội dung, SEO, tuyến xe)', value: 'editor' },
  { label: 'Dispatcher (Điều phối viên đơn xe & tài xế)', value: 'dispatcher' },
];

export function UserFormModal({
  isOpen,
  onClose,
  onSuccess,
  userDoc,
}: UserFormModalProps) {
  const isEditing = Boolean(userDoc);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('editor');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userDoc) {
      setEmail(userDoc.email || '');
      setFullName(userDoc.fullName || '');
      setPassword('');
      setRole(userDoc.role || 'editor');
    } else {
      setEmail('');
      setFullName('');
      setPassword('');
      setRole('editor');
    }
    setError(null);
  }, [userDoc, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email không được để trống.');
      return;
    }

    if (!isEditing && !password.trim()) {
      setError('Mật khẩu là bắt buộc khi tạo tài khoản mới.');
      return;
    }

    if (!isEditing && password.length < 6) {
      setError('Mật khẩu tối thiểu phải từ 6 ký tự trở lên.');
      return;
    }

    const payload: Record<string, any> = {
      email: email.trim().toLowerCase(),
      fullName: fullName.trim() || null,
      role,
    };

    if (password.trim()) {
      payload.password = password.trim();
    }

    try {
      setIsLoading(true);
      let savedUser: User;
      if (isEditing && userDoc?.id) {
        const res = await apiClient.patch(`/users/${userDoc.id}`, payload);
        savedUser = res.data?.doc || { ...userDoc, ...payload };
      } else {
        const res = await apiClient.post('/users', payload);
        savedUser = res.data?.doc || (res.data as User) || { id: Date.now(), ...payload };
      }
      onSuccess(savedUser);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading) onClose();
      }}
      title={isEditing ? 'Chỉnh sửa Tài khoản Quản trị' : 'Thêm mới Tài khoản Quản trị'}
      description="Phân quyền tài khoản quản trị hệ thống: Admin, Editor hoặc Dispatcher."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <Input
            label="Địa chỉ Email"
            type="email"
            placeholder="admin@xegheplientinh.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isEditing} // Payload thường khóa email hoặc cho phép sửa
          />
          {isEditing && (
            <p className="text-xs text-slate-500 mt-1">
              Email dùng làm định danh đăng nhập và không thể thay đổi sau khi tạo.
            </p>
          )}
        </div>

        <div>
          <Input
            label="Họ và tên"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <Input
            label={isEditing ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu'}
            type="password"
            placeholder={isEditing ? 'Nhập mật khẩu mới...' : 'Tối thiểu 6 ký tự'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!isEditing}
          />
        </div>

        <div>
          <Select
            label="Vai trò & Quyền hạn (Role)"
            options={ROLE_OPTIONS}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          />
          <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div>
              <span className="font-semibold text-rose-700">Admin:</span> Toàn quyền quản trị (Cấu hình hệ thống, Bảng giá, Tài khoản, Tuyến đường, Đơn xe...).
            </div>
            <div>
              <span className="font-semibold text-blue-700">Editor:</span> Quản lý nội dung bài viết, trang tĩnh, tuyến xe, media và chuyển hướng SEO.
            </div>
            <div>
              <span className="font-semibold text-amber-700">Dispatcher:</span> Tiếp nhận, xử lý đơn đặt xe và quản lý danh sách đội ngũ tài xế.
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy bỏ
          </Button>
          <Button type="submit" isLoading={isLoading} className="gap-2">
            <Check className="w-4 h-4" />
            {isEditing ? 'Lưu thay đổi' : 'Tạo tài khoản'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default UserFormModal;
