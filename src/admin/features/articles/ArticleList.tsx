import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { Select } from '@/admin/components/ui/Select';
import { Badge } from '@/admin/components/ui/Badge';
import { DataTable, type Column } from '@/admin/components/common/DataTable';
import { StatusBadge } from '@/admin/components/common/StatusBadge';
import { ConfirmDialog } from '@/admin/components/common/ConfirmDialog';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import { formatDateTime } from '@/admin/lib/utils';
import type { ArticleDoc, ArticleCategory } from '@/admin/types/articles';
import type { PaginatedResponse } from '@/admin/types/api';

/**
 * Hiển thị Badge tiếng Việt cho danh mục bài viết:
 * - kinh-nghiem -> "Kinh nghiệm"
 * - tin-tuyen -> "Tin tuyến"
 * - khuyen-mai -> "Khuyến mãi"
 */
export function getCategoryBadge(category: ArticleCategory | string) {
  switch (category) {
    case 'kinh-nghiem':
      return <Badge variant="info">Kinh nghiệm</Badge>;
    case 'tin-tuyen':
      return <Badge variant="default">Tin tuyến</Badge>;
    case 'khuyen-mai':
      return <Badge variant="warning">Khuyến mãi</Badge>;
    default:
      return <Badge variant="secondary">{category}</Badge>;
  }
}

export function ArticleList() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState<ArticleDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Xóa bài viết
  const [articleToDelete, setArticleToDelete] = useState<ArticleDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchArticles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get<PaginatedResponse<ArticleDoc>>('/articles', {
        params: {
          limit: 100,
          sort: '-updatedAt',
        },
      });
      setArticles(res.data?.docs || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async () => {
    if (!articleToDelete) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/articles/${articleToDelete.id}`);
      setArticles((prev) => prev.filter((item) => item.id !== articleToDelete.id));
      setArticleToDelete(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Lọc dữ liệu theo danh mục, trạng thái và từ khóa tìm kiếm
  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      // Lọc danh mục
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Lọc trạng thái
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      // Tìm kiếm theo tiêu đề hoặc slug
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesSlug = item.slug?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSlug) {
          return false;
        }
      }
      return true;
    });
  }, [articles, selectedCategory, selectedStatus, searchQuery]);

  // Cấu hình các cột cho DataTable
  const columns: Column<ArticleDoc>[] = [
    {
      key: 'thumbnail',
      header: 'Ảnh',
      className: 'w-16',
      render: (item) => {
        const media = typeof item.featuredImage === 'object' ? item.featuredImage : null;
        const thumbUrl = media?.thumbnailURL || media?.sizes?.card?.url || media?.url;

        return thumbUrl ? (
          <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            <img
              src={thumbUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-12 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        );
      },
    },
    {
      key: 'title',
      header: 'Tiêu đề bài viết',
      sortable: true,
      render: (item) => (
        <div className="max-w-xs md:max-w-md">
          <Link
            to={`/articles/${item.id}`}
            className="font-medium text-slate-900 hover:text-blue-600 transition-colors line-clamp-2"
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
      render: (item) => (
        <span className="font-mono text-xs text-slate-500 truncate max-w-[150px] block">
          {item.slug}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Danh mục',
      align: 'center',
      render: (item) => getCategoryBadge(item.category),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (item) => <StatusBadge type="article" status={item.status} />,
    },
    {
      key: 'publishedAt',
      header: 'Ngày xuất bản',
      render: (item) => (
        <span className="text-xs text-slate-500">
          {item.publishedAt ? formatDateTime(item.publishedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Cập nhật',
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
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/articles/${item.id}`)}
            title="Chỉnh sửa bài viết"
            data-testid={`edit-article-${item.id}`}
            className="text-slate-400 hover:text-blue-600 hover:bg-slate-100 p-1.5 h-auto cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setArticleToDelete(item)}
            title="Xóa bài viết"
            data-testid={`delete-article-${item.id}`}
            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 h-auto cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản trị Bài viết Tin tức & Cẩm nang
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các bài viết kinh nghiệm đi xe, tin tức báo giá tuyến đường và chương trình khuyến mãi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchArticles}
            disabled={isLoading}
            className="cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/articles/new')}
            data-testid="create-article-btn"
            className="flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Viết bài mới</span>
          </Button>
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchArticles}
            className="text-xs text-rose-600 hover:text-rose-700 underline p-0 h-auto"
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Bảng dữ liệu bài viết */}
      <DataTable
        data={filteredArticles}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Tìm kiếm theo tiêu đề hoặc slug..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterSlot={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bộ lọc danh mục */}
            <div className="w-44">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                data-testid="filter-category-select"
                className="h-9 text-xs"
              >
                <option value="all">Tất cả danh mục</option>
                <option value="kinh-nghiem">Kinh nghiệm</option>
                <option value="tin-tuyen">Tin tuyến</option>
                <option value="khuyen-mai">Khuyến mãi</option>
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
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
              </Select>
            </div>
          </div>
        }
        emptyTitle="Chưa có bài viết nào"
        emptyMessage="Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại. Nhấn 'Viết bài mới' để tạo bài viết đầu tiên."
      />

      {/* Hộp thoại xác nhận xóa */}
      <ConfirmDialog
        isOpen={Boolean(articleToDelete)}
        onClose={() => setArticleToDelete(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa bài viết"
        description={
          articleToDelete ? (
            <span>
              Bạn có chắc chắn muốn xóa bài viết{' '}
              <strong className="text-slate-900">"{articleToDelete.title}"</strong> không? Hành động này không thể hoàn tác.
            </span>
          ) : undefined
        }
        confirmText="Xác nhận xóa bài viết"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default ArticleList;
