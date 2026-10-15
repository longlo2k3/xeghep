import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { Select } from '@/admin/components/ui/Select';
import { Badge } from '@/admin/components/ui/Badge';
import { DataTable, type Column } from '@/admin/components/common/DataTable';
import { StatusBadge } from '@/admin/components/common/StatusBadge';
import { ConfirmDialog } from '@/admin/components/common/ConfirmDialog';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import { formatDateTime } from '@/admin/lib/utils';
import type { PageDoc, PageKind } from '@/admin/types/pages';
import type { PaginatedResponse } from '@/admin/types/api';

/**
 * Hiển thị Badge cho loại trang:
 * - system: Badge xanh "Hệ thống"
 * - content: Badge tím "Nội dung"
 */
export function getPageKindBadge(kind: PageKind | string) {
  if (kind === 'system') {
    return (
      <Badge
        variant="info"
        className="bg-blue-50 text-blue-700 border border-blue-200"
      >
        Hệ thống
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="bg-purple-50 text-purple-700 border border-purple-200"
    >
      Nội dung
    </Badge>
  );
}

export function PageList() {
  const navigate = useNavigate();

  const [pages, setPages] = useState<PageDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc
  const [selectedKind, setSelectedKind] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Xóa trang
  const [pageToDelete, setPageToDelete] = useState<PageDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get<PaginatedResponse<PageDoc>>('/pages', {
        params: {
          limit: 100,
          sort: 'slug',
        },
      });
      setPages(res.data?.docs || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleDelete = async () => {
    if (!pageToDelete) return;
    if (pageToDelete.kind === 'system') {
      setError('Không thể xóa trang hệ thống cốt lõi.');
      setPageToDelete(null);
      return;
    }

    try {
      setIsDeleting(true);
      await apiClient.delete(`/pages/${pageToDelete.id}`);
      setPages((prev) => prev.filter((p) => p.id !== pageToDelete.id));
      setPageToDelete(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Lọc danh sách trang
  const filteredPages = useMemo(() => {
    return pages.filter((item) => {
      // Lọc theo loại trang
      if (selectedKind !== 'all' && item.kind !== selectedKind) {
        return false;
      }
      // Lọc theo trạng thái
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      // Tìm kiếm theo tiêu đề hoặc slug
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesSlug = item.slug?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSlug) {
          return false;
        }
      }
      return true;
    });
  }, [pages, selectedKind, selectedStatus, searchQuery]);

  // Cấu hình các cột cho DataTable
  const columns: Column<PageDoc>[] = [
    {
      key: 'title',
      header: 'Tiêu đề trang',
      sortable: true,
      render: (item) => (
        <div className="max-w-xs md:max-w-md">
          <Link
            to={`/pages/${item.id}`}
            className="font-medium text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
          >
            {item.title}
          </Link>
          <span className="text-[11px] text-slate-500 font-mono block truncate mt-0.5">
            /{item.slug}
          </span>
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs text-slate-500 truncate max-w-[200px] block">
          /{item.slug}
        </span>
      ),
    },
    {
      key: 'kind',
      header: 'Loại trang',
      align: 'center',
      render: (item) => (
        <span data-testid={`page-kind-badge-${item.id}`}>
          {getPageKindBadge(item.kind)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (item) => <StatusBadge type="page" status={item.status} />,
    },
    {
      key: 'updatedAt',
      header: 'Cập nhật lúc',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-slate-500">
          {item.updatedAt ? formatDateTime(item.updatedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (item) => {
        const isSystem = item.kind === 'system';

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/pages/${item.id}`)}
              title="Chỉnh sửa cấu hình trang"
              data-testid={`edit-page-${item.id}`}
              className="text-slate-400 hover:text-blue-600 p-1.5 h-auto cursor-pointer"
            >
              <Edit className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!isSystem) {
                  setPageToDelete(item);
                }
              }}
              disabled={isSystem}
              title={
                isSystem
                  ? 'Không thể xóa trang hệ thống cốt lõi'
                  : 'Xóa trang chính sách'
              }
              data-testid={`delete-page-${item.id}`}
              className={`p-1.5 h-auto ${
                isSystem
                  ? 'text-slate-400 opacity-40 cursor-not-allowed hover:bg-transparent hover:text-slate-400'
                  : 'text-slate-400 hover:text-rose-600 cursor-pointer'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản trị Trang Nội dung & Chính sách
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý SEO các trang hệ thống cốt lõi và nội dung các trang chính sách, điều khoản dịch vụ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPages}
            disabled={isLoading}
            className="cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/pages/new')}
            data-testid="create-page-btn"
            className="flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo trang mới</span>
          </Button>
        </div>
      </div>

      {/* Thông báo lỗi */}
      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPages}
            className="text-xs text-rose-600 hover:text-rose-800 underline p-0 h-auto"
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Bảng dữ liệu trang */}
      <DataTable
        data={filteredPages}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Tìm kiếm theo tiêu đề hoặc slug..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterSlot={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bộ lọc Loại trang */}
            <div className="w-44">
              <Select
                value={selectedKind}
                onChange={(e) => setSelectedKind(e.target.value)}
                data-testid="filter-kind-select"
                className="h-9 text-xs"
              >
                <option value="all">Tất cả loại trang</option>
                <option value="system">Trang hệ thống</option>
                <option value="content">Trang nội dung</option>
              </Select>
            </div>

            {/* Bộ lọc trạng thái */}
            <div className="w-36">
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                data-testid="filter-status-select"
                className="h-9 text-xs"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="published">Đã xuất bản</option>
                <option value="draft">Bản nháp</option>
              </Select>
            </div>
          </div>
        }
        emptyTitle="Chưa có trang nào"
        emptyMessage="Không tìm thấy trang nào phù hợp với điều kiện tìm kiếm và lọc."
      />

      {/* Hộp thoại xác nhận xóa */}
      <ConfirmDialog
        isOpen={Boolean(pageToDelete)}
        onClose={() => setPageToDelete(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa trang nội dung"
        description={
          pageToDelete ? (
            <span>
              Bạn có chắc chắn muốn xóa trang chính sách{' '}
              <strong className="text-slate-900">"{pageToDelete.title}"</strong> (/{pageToDelete.slug}) không? Hành động này không thể hoàn tác.
            </span>
          ) : undefined
        }
        confirmText="Xóa trang"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default PageList;
