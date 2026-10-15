import { useState, useEffect, type FormEvent } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { Input } from '@/admin/components/ui/Input';
import { Select } from '@/admin/components/ui/Select';
import { Modal } from '@/admin/components/ui/Modal';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import type { RedirectDoc, RedirectStatusCode } from '@/admin/types/redirects';

export interface RedirectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedDoc: RedirectDoc) => void;
  redirectDoc?: RedirectDoc | null;
}

export function normalizePath(path: string): string {
  let trimmed = path.trim().toLowerCase();
  if (!trimmed) return '';
  if (!trimmed.startsWith('/') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `/${trimmed}`;
  }
  if (trimmed.length > 1 && trimmed.endsWith('/') && !trimmed.startsWith('http')) {
    trimmed = trimmed.replace(/\/+$/, '');
  }
  return trimmed;
}

export function RedirectFormModal({
  isOpen,
  onClose,
  onSuccess,
  redirectDoc,
}: RedirectFormModalProps) {
  const isEditing = Boolean(redirectDoc);

  const [fromUrl, setFromUrl] = useState('');
  const [toUrl, setToUrl] = useState('');
  const [statusCode, setStatusCode] = useState<RedirectStatusCode>('301');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [note, setNote] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (redirectDoc) {
      setFromUrl(redirectDoc.fromUrl || redirectDoc.from || '');
      setToUrl(redirectDoc.toUrl || redirectDoc.to || '');
      setStatusCode(redirectDoc.statusCode || '301');
      setIsActive(redirectDoc.isActive ?? true);
      setNote(redirectDoc.note || '');
    } else {
      setFromUrl('');
      setToUrl('');
      setStatusCode('301');
      setIsActive(true);
      setNote('');
    }
    setError(null);
  }, [redirectDoc, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const normFrom = normalizePath(fromUrl);
    const normTo = normalizePath(toUrl);

    if (!normFrom) {
      setError('Đường dẫn nguồn (from) không được để trống.');
      return;
    }

    // 410 Gone có thể không cần toUrl, nhưng 301/302/308 thì cần toUrl
    if (statusCode !== '410' && !normTo) {
      setError('Đường dẫn đích (to) không được để trống khi chọn mã chuyển hướng.');
      return;
    }

    // KIỂM TRA CẢNH BÁO VÒNG LẶP CHUYỂN HƯỚNG
    if (normTo && normFrom === normTo) {
      setError('Đường dẫn nguồn và đích không được trùng nhau (tránh vòng lặp chuyển hướng).');
      return;
    }

    const payload: Partial<RedirectDoc> = {
      fromUrl: normFrom,
      toUrl: statusCode === '410' ? null : normTo,
      from: normFrom,
      to: statusCode === '410' ? null : normTo,
      statusCode,
      isActive,
      note: note.trim() || null,
      source: redirectDoc?.source || 'manual',
    };

    try {
      setIsLoading(true);
      let savedDoc: RedirectDoc;
      if (isEditing && redirectDoc?.id) {
        const res = await apiClient.patch(`/redirects/${redirectDoc.id}`, payload);
        savedDoc = res.data?.doc || { ...redirectDoc, ...payload };
      } else {
        const res = await apiClient.post('/redirects', payload);
        savedDoc = res.data?.doc || (res.data as RedirectDoc) || { id: Date.now(), ...payload };
      }
      onSuccess(savedDoc);
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
      title={isEditing ? 'Chỉnh sửa Chuyển hướng URL' : 'Thêm mới Chuyển hướng URL'}
      description="Cấu hình chuyển hướng mã 301 (Vĩnh viễn) hoặc 302 (Tạm thời) để bảo toàn giá trị SEO."
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
            label="Đường dẫn nguồn (From URL)"
            placeholder="/tuyen-xe-cu hoặc /bai-viet-cu"
            value={fromUrl}
            onChange={(e) => setFromUrl(e.target.value)}
            required
          />
          <p className="text-xs text-slate-500 mt-1">Đường dẫn người dùng hoặc bot truy cập vào.</p>
        </div>

        <div>
          <Input
            label="Đường dẫn đích (To URL)"
            placeholder="/tuyen-xe-moi hoặc https://..."
            value={toUrl}
            onChange={(e) => setToUrl(e.target.value)}
            disabled={statusCode === '410'}
          />
          <p className="text-xs text-slate-500 mt-1">
            Đường dẫn chuyển tiếp tới (bỏ trống nếu mã là 410 Gone).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Select
              label="Mã trạng thái (HTTP Status)"
              options={[
                { label: '301 - Chuyển vĩnh viễn (Moved Permanently)', value: '301' },
                { label: '302 - Chuyển tạm thời (Found / Temporary)', value: '302' },
                { label: '308 - Chuyển vĩnh viễn giữ phương thức (308)', value: '308' },
                { label: '410 - Nội dung đã xóa bỏ hoàn toàn (Gone)', value: '410' },
              ]}
              value={statusCode}
              onChange={(e) => setStatusCode(e.target.value as RedirectStatusCode)}
            />
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500"
              />
              Đang hoạt động (Kích hoạt)
            </label>
          </div>
        </div>

        <div>
          <Input
            label="Ghi chú (Tùy chọn)"
            placeholder="Ví dụ: Đổi tên tuyến tháng 10/2026"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy bỏ
          </Button>
          <Button type="submit" isLoading={isLoading} className="gap-2">
            <Check className="w-4 h-4" />
            {isEditing ? 'Lưu thay đổi' : 'Tạo chuyển hướng'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default RedirectFormModal;
