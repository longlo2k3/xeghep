import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowRightLeft,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { Select } from '@/admin/components/ui/Select';
import { Badge } from '@/admin/components/ui/Badge';
import { DataTable, type Column } from '@/admin/components/common/DataTable';
import { ConfirmDialog } from '@/admin/components/common/ConfirmDialog';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import { cn } from '@/admin/lib/utils';
import type { RedirectDoc, RedirectStatusCode, RedirectSource } from '@/admin/types/redirects';
import type { PaginatedResponse } from '@/admin/types/api';
import { RedirectFormModal } from './RedirectFormModal';
import { SitemapMonitor } from '@/admin/features/seo/SitemapMonitor';

export type RedirectsTab = 'redirects' | 'sitemap';

const MOCK_REDIRECTS: RedirectDoc[] = [
  {
    id: 1,
    fromUrl: '/tuyen-xe-cu-1',
    toUrl: '/tuyen-ha-noi-thai-nguyen',
    statusCode: '301',
    source: 'auto_slug_change',
    isActive: true,
    note: 'Đổi slug tuyến đường sang chuẩn mới',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    fromUrl: '/khuyen-mai-2025',
    toUrl: '/bang-gia',
    statusCode: '302',
    source: 'manual',
    isActive: true,
    note: 'Tạm thời chuyển hướng sự kiện khuyến mại',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    fromUrl: '/bai-viet-cu-da-xoa',
    toUrl: null,
    statusCode: '410',
    source: 'manual',
    isActive: true,
    note: 'Trang thông tin đã hủy hoàn toàn',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function RedirectList() {
  const [activeTab, setActiveTab] = useState<RedirectsTab>('redirects');

  const [redirects, setRedirects] = useState<RedirectDoc[]>(MOCK_REDIRECTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedActive, setSelectedActive] = useState<string>('all');

  // Modal thêm/sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<RedirectDoc | null>(null);

  // Confirm delete
  const [docToDelete, setDocToDelete] = useState<RedirectDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRedirects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get<PaginatedResponse<RedirectDoc>>('/redirects', {
        params: { limit: 200, sort: '-createdAt' },
      });
      if (res.data?.docs && res.data.docs.length > 0) {
        setRedirects(res.data.docs);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRedirects();
  }, [fetchRedirects]);

  const handleOpenCreate = () => {
    setEditingDoc(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: RedirectDoc) => {
    setEditingDoc(doc);
    setIsModalOpen(true);
  };

  const handleSuccessSaved = (savedDoc: RedirectDoc) => {
    setRedirects((prev) => {
      const idx = prev.findIndex((d) => d.id === savedDoc.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedDoc;
        return next;
      }
      return [savedDoc, ...prev];
    });
    setSuccessMsg('Lưu cấu hình chuyển hướng thành công!');
  };

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/redirects/${docToDelete.id}`);
      setRedirects((prev) => prev.filter((d) => d.id !== docToDelete.id));
      setSuccessMsg(`Đã xóa chuyển hướng "${docToDelete.fromUrl || docToDelete.from}".`);
      setDocToDelete(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper Badges
  const getStatusBadge = (code: RedirectStatusCode | string) => {
    switch (code) {
      case '301':
        return (
          <Badge variant="info" className="bg-blue-50 text-blue-700 border border-blue-200">
            301 Permanent
          </Badge>
        );
      case '302':
        return (
          <Badge variant="warning" className="bg-amber-50 text-amber-800 border border-amber-200">
            302 Temporary
          </Badge>
        );
      case '308':
        return (
          <Badge variant="secondary" className="bg-purple-50 text-purple-700 border border-purple-200">
            308 Permanent
          </Badge>
        );
      case '410':
        return (
          <Badge variant="destructive" className="bg-rose-50 text-rose-700 border border-rose-200">
            410 Gone
          </Badge>
        );
      default:
        return <Badge variant="secondary">{code}</Badge>;
    }
  };

  const getSourceBadge = (source?: RedirectSource | string | null) => {
    switch (source) {
      case 'auto_slug_change':
      case 'auto':
        return (
          <Badge variant="secondary" className="bg-purple-50 text-purple-700 border border-purple-200 text-[11px]">
            Tự đổi slug
          </Badge>
        );
      case 'seed':
        return (
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 border border-slate-200 text-[11px]">
            Hệ thống (Seed)
          </Badge>
        );
      case 'manual':
      default:
        return (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
            Thủ công
          </Badge>
        );
    }
  };

  // Filtered List
  const filteredRedirects = useMemo(() => {
    return redirects.filter((item) => {
      const from = (item.fromUrl || item.from || '').toLowerCase();
      const to = (item.toUrl || item.to || '').toLowerCase();
      const note = (item.note || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchSearch = !q || from.includes(q) || to.includes(q) || note.includes(q);
      const matchStatus = selectedStatus === 'all' || item.statusCode === selectedStatus;
      const matchActive =
        selectedActive === 'all' ||
        (selectedActive === 'active' && item.isActive !== false) ||
        (selectedActive === 'inactive' && item.isActive === false);

      return matchSearch && matchStatus && matchActive;
    });
  }, [redirects, searchQuery, selectedStatus, selectedActive]);

  const columns: Column<RedirectDoc>[] = [
    {
      key: 'from',
      header: 'Đường dẫn nguồn (From)',
      render: (item) => (
        <div>
          <span className="font-mono text-xs text-rose-700 font-medium">
            {item.fromUrl || item.from}
          </span>
          {item.note && <div className="text-[11px] text-slate-500 mt-0.5">{item.note}</div>}
        </div>
      ),
    },
    {
      key: 'to',
      header: 'Đích đến (To)',
      render: (item) => {
        const to = item.toUrl || item.to;
        if (!to) {
          return <span className="text-xs text-slate-400 italic">(Đã xóa bỏ - 410 Gone)</span>;
        }
        return (
          <span className="font-mono text-xs text-emerald-700 font-medium">
            {to}
          </span>
        );
      },
    },
    {
      key: 'statusCode',
      header: 'Mã HTTP',
      render: (item) => getStatusBadge(item.statusCode),
    },
    {
      key: 'source',
      header: 'Nguồn tạo',
      render: (item) => getSourceBadge(item.source),
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      render: (item) =>
        item.isActive !== false ? (
          <Badge variant="success" className="bg-emerald-50 text-emerald-700 border border-emerald-200">
            Hoạt động
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 border border-slate-200">
            Tạm dừng
          </Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(item)}
            className="p-1.5 h-8 text-slate-600 hover:text-slate-900 border-slate-200"
            title="Sửa chuyển hướng"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDocToDelete(item)}
            className="p-1.5 h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200"
            title="Xóa chuyển hướng"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Chuyển hướng 301 & Giám sát SEO</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị bảng định tuyến chuyển hướng HTTP 301/302 chống gãy link, và theo dõi sơ đồ trang web (Sitemap).
          </p>
        </div>

        {activeTab === 'redirects' && (
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Thêm chuyển hướng
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-1">
        <button
          type="button"
          onClick={() => setActiveTab('redirects')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer',
            activeTab === 'redirects'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          )}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Danh sách Chuyển hướng ({redirects.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sitemap')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer',
            activeTab === 'sitemap'
              ? 'border-blue-600 text-blue-600 bg-blue-50/60 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          )}
        >
          <Globe className="w-4 h-4" />
          Giám sát Sitemap (SEO)
        </button>
      </div>

      {/* Tab 1: Redirects List */}
      {activeTab === 'redirects' && (
        <div className="space-y-4">
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

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Select
                options={[
                  { label: 'Tất cả mã HTTP', value: 'all' },
                  { label: '301 (Moved Permanently)', value: '301' },
                  { label: '302 (Temporary)', value: '302' },
                  { label: '308 (Permanent)', value: '308' },
                  { label: '410 (Gone)', value: '410' },
                ]}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-44"
              />

              <Select
                options={[
                  { label: 'Tất cả trạng thái', value: 'all' },
                  { label: 'Đang hoạt động', value: 'active' },
                  { label: 'Tạm dừng', value: 'inactive' },
                ]}
                value={selectedActive}
                onChange={(e) => setSelectedActive(e.target.value)}
                className="w-40"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchRedirects}
              isLoading={isLoading}
              className="gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Làm mới
            </Button>
          </div>

          <DataTable
            data={filteredRedirects}
            columns={columns}
            rowKey={(item) => item.id}
            isLoading={isLoading}
            searchable
            searchPlaceholder="Tìm theo URL nguồn hoặc đích..."
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            pagination
            pageSize={15}
            emptyTitle="Chưa có quy tắc chuyển hướng nào"
            emptyMessage="Nhấp 'Thêm chuyển hướng' để cấu hình điều hướng mới."
          />
        </div>
      )}

      {/* Tab 2: Sitemap Monitor */}
      {activeTab === 'sitemap' && <SitemapMonitor />}

      {/* Modal Thêm/Sửa */}
      <RedirectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccessSaved}
        redirectDoc={editingDoc}
      />

      {/* Dialog Xác nhận Xóa */}
      <ConfirmDialog
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa quy tắc chuyển hướng"
        description={`Bạn có chắc muốn xóa chuyển hướng từ "${docToDelete?.fromUrl || docToDelete?.from}" sang "${docToDelete?.toUrl || docToDelete?.to || 'không có'}"? Người dùng truy cập URL cũ có thể gặp lỗi 404.`}
        confirmText="Xác nhận xóa"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default RedirectList;
