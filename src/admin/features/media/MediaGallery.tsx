import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Upload,
  LayoutGrid,
  Table as TableIcon,
  Search,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { Input } from '@/admin/components/ui/Input';
import { Card } from '@/admin/components/ui/Card';
import { Modal } from '@/admin/components/ui/Modal';
import { ConfirmDialog } from '@/admin/components/common/ConfirmDialog';
import { DataTable, type Column } from '@/admin/components/common/DataTable';
import { MediaUploadModal } from './MediaUploadModal';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import { formatFileSize, formatDateTime } from '@/admin/lib/utils';
import type { MediaDoc } from '@/admin/types/media';
import type { PaginatedResponse } from '@/admin/types/api';

export function MediaGallery() {
  const [mediaList, setMediaList] = useState<MediaDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [limit] = useState(24);
  const [searchQuery, setSearchQuery] = useState('');

  // View mode: 'grid' | 'table'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDetailMedia, setSelectedDetailMedia] = useState<MediaDoc | null>(null);

  // Copy feedback notification
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: Record<string, unknown> = {
        page,
        limit,
        sort: '-createdAt',
      };

      if (searchQuery.trim()) {
        params['where[or][0][filename][like]'] = searchQuery.trim();
        params['where[or][1][alt][like]'] = searchQuery.trim();
      }

      const res = await apiClient.get<PaginatedResponse<MediaDoc>>('/media', { params });
      const data = res.data;

      setMediaList(data?.docs || []);
      setTotalPages(data?.totalPages || 1);
      setTotalDocs(data?.totalDocs || 0);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleCopyUrl = async (media: MediaDoc) => {
    const rawUrl = media.url || '';
    const fullUrl = rawUrl.startsWith('http')
      ? rawUrl
      : `${window.location.origin}${rawUrl}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = fullUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(media.id);
      setToastMessage(`Đã sao chép URL của ảnh "${media.filename || 'media'}"!`);
      setTimeout(() => {
        setCopiedId(null);
        setToastMessage(null);
      }, 3000);
    } catch {
      setToastMessage('Không thể sao chép liên kết vào bộ nhớ tạm.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!mediaToDelete) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/media/${mediaToDelete.id}`);
      setMediaToDelete(null);
      setToastMessage('Đã xóa hình ảnh thành công.');
      setTimeout(() => setToastMessage(null), 3000);
      fetchMedia();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Table columns definition
  const tableColumns: Column<MediaDoc>[] = useMemo(
    () => [
      {
        key: 'thumbnail',
        header: 'Ảnh',
        className: 'w-20',
        render: (item) => {
          const thumbUrl = item.thumbnailURL || item.sizes?.card?.url || item.url || '';
          return (
            <div
              className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer hover:opacity-80 transition"
              onClick={() => setSelectedDetailMedia(item)}
              title="Click để xem chi tiết"
            >
              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt={item.alt || 'Ảnh'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: 'filename',
        header: 'Tên file & Alt text',
        render: (item) => (
          <div className="space-y-1 max-w-xs">
            <p
              className="text-sm font-semibold text-slate-900 truncate cursor-pointer hover:text-blue-600 transition"
              onClick={() => setSelectedDetailMedia(item)}
              title={item.filename || ''}
            >
              {item.filename || 'Không có tên'}
            </p>
            <p className="text-xs text-slate-500 truncate" title={`Alt: ${item.alt}`}>
              <span className="text-slate-400 font-medium">Alt:</span> {item.alt}
            </p>
            {item.caption && (
              <p className="text-xs text-slate-500 truncate italic" title={`Chú thích: ${item.caption}`}>
                {item.caption}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'dimensions',
        header: 'Kích thước',
        className: 'w-28 text-center',
        render: (item) => (
          <span className="text-xs font-mono text-slate-700">
            {item.width && item.height ? `${item.width} × ${item.height}` : 'Gốc'}
          </span>
        ),
      },
      {
        key: 'filesize',
        header: 'Dung lượng',
        className: 'w-28 text-center',
        render: (item) => (
          <span className="text-xs font-mono text-slate-700">
            {formatFileSize(item.filesize)}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Ngày tải lên',
        className: 'w-36 text-center',
        render: (item) => (
          <span className="text-xs text-slate-500">
            {formatDateTime(item.createdAt)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Thao tác',
        className: 'w-32 text-right',
        render: (item) => {
          const isCopied = copiedId === item.id;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyUrl(item)}
                title="Sao chép đường dẫn URL"
                className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                data-testid={`copy-btn-${item.id}`}
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDetailMedia(item)}
                title="Xem chi tiết ảnh"
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMediaToDelete(item)}
                title="Xóa hình ảnh"
                className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                data-testid={`delete-btn-${item.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [copiedId]
  );

  return (
    <div className="space-y-6">
      {/* Toast notification floating banner */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl text-sm font-medium text-white flex items-center gap-2.5 animate-in slide-in-from-bottom-3"
          data-testid="toast-notification"
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ImageIcon className="w-7 h-7 text-blue-600" />
            Thư viện Media
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý toàn bộ hình ảnh hệ thống, tối ưu chuẩn SEO (Alt text) và tự động nén kích thước.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={fetchMedia}
            disabled={isLoading}
            className="flex items-center gap-1.5"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>

          <Button
            variant="default"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 shadow-sm"
            data-testid="open-upload-modal-btn"
          >
            <Upload className="w-4 h-4" />
            <span>Tải ảnh lên</span>
          </Button>
        </div>
      </div>

      {/* Thanh công cụ tìm kiếm và Chế độ xem */}
      <Card className="p-4 border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Tìm theo tên file hoặc Alt text..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-10"
              data-testid="media-search-input"
            />
          </div>

          {/* Điều khiển hiển thị: Đổi Grid/Table & Đếm số lượng */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs text-slate-500">
              Tổng số: <strong className="text-slate-900 font-mono">{totalDocs}</strong> tệp
            </span>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem dạng lưới"
                data-testid="view-mode-grid"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline">Lưới</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem dạng bảng"
                data-testid="view-mode-table"
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden md:inline">Bảng</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Lỗi nếu có */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Nội dung danh sách */}
      {viewMode === 'table' ? (
        /* DẠNG BẢNG (TABLE VIEW) */
        <DataTable
          data={mediaList}
          columns={tableColumns}
          isLoading={isLoading}
          rowKey={(item) => item.id}
          pagination={false}
          emptyTitle="Chưa có hình ảnh nào"
          emptyMessage="Tải ảnh lên hoặc thay đổi từ khóa tìm kiếm để xem kết quả."
        />
      ) : (
        /* DẠNG LƯỚI (GRID VIEW) */
        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-2.5 animate-pulse space-y-2.5 shadow-sm"
                >
                  <div className="w-full aspect-square bg-slate-100 rounded-xl" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : mediaList.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-slate-200 p-8 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                {searchQuery ? 'Không tìm thấy hình ảnh phù hợp' : 'Thư viện chưa có hình ảnh nào'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                {searchQuery
                  ? 'Vui lòng kiểm tra lại từ khóa hoặc xóa bộ lọc tìm kiếm.'
                  : 'Hãy tải lên hình ảnh đầu tiên để sử dụng cho các tuyến đường và bài viết.'}
              </p>
              {!searchQuery && (
                <Button
                  variant="default"
                  onClick={() => setIsUploadOpen(true)}
                  className="inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Tải ảnh ngay
                </Button>
              )}
            </div>
          ) : (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
              data-testid="media-grid"
            >
              {mediaList.map((media) => {
                const thumbUrl = media.thumbnailURL || media.sizes?.card?.url || media.url || '';
                const isCopied = copiedId === media.id;

                return (
                  <div
                    key={media.id}
                    className="group relative rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition flex flex-col overflow-hidden"
                    data-testid={`media-card-${media.id}`}
                  >
                    {/* Ảnh container */}
                    <div
                      className="relative w-full aspect-square bg-slate-100 overflow-hidden cursor-pointer"
                      onClick={() => setSelectedDetailMedia(media)}
                    >
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={media.alt || 'Ảnh'}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}

                      {/* Hover Overlay Actions */}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(media);
                          }}
                          className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 transition shadow-lg cursor-pointer"
                          title="Sao chép URL"
                          data-testid={`grid-copy-${media.id}`}
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDetailMedia(media);
                          }}
                          className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 transition shadow-lg cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMediaToDelete(media);
                          }}
                          className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow-lg cursor-pointer"
                          title="Xóa ảnh"
                          data-testid={`grid-delete-${media.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Badge kích thước góc dưới */}
                      {media.width && media.height && (
                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-900/75 text-[10px] font-mono text-white backdrop-blur-sm pointer-events-none">
                          {media.width}×{media.height}
                        </div>
                      )}
                    </div>

                    {/* Metadata bên dưới */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                      <div>
                        <p
                          className="text-xs font-semibold text-slate-900 truncate cursor-pointer hover:text-blue-600 transition"
                          title={media.filename || ''}
                          onClick={() => setSelectedDetailMedia(media)}
                        >
                          {media.filename || 'Ảnh không tên'}
                        </p>
                        <p
                          className="text-[11px] text-slate-500 truncate mt-0.5"
                          title={`Alt: ${media.alt}`}
                        >
                          <span className="text-slate-400">Alt:</span> {media.alt}
                        </p>
                      </div>

                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{formatFileSize(media.filesize)}</span>
                        <span>{media.mimeType ? media.mimeType.replace('image/', '').toUpperCase() : ''}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Trang <strong className="text-slate-900">{page}</strong> trên <strong className="text-slate-900">{totalPages}</strong>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trang trước</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1"
            >
              <span>Trang sau</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal Tải ảnh lên */}
      <MediaUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(newDoc) => {
          setToastMessage(`Đã tải lên thành công ảnh "${newDoc.filename || 'mới'}"!`);
          setTimeout(() => setToastMessage(null), 3000);
          fetchMedia();
        }}
      />

      {/* Modal Xác nhận xóa ảnh */}
      <ConfirmDialog
        isOpen={!!mediaToDelete}
        onClose={() => setMediaToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa hình ảnh?"
        description={
          <div>
            Bạn có chắc chắn muốn xóa tệp ảnh{' '}
            <strong className="text-slate-900">{mediaToDelete?.filename}</strong> không?
            <br />
            Hành động này sẽ xóa vĩnh viễn tệp ảnh gốc và tất cả các kích thước phái sinh (card, hero, og) khỏi máy chủ.
          </div>
        }
        confirmText="Xác nhận xóa"
        variant="destructive"
        isLoading={isDeleting}
      />

      {/* Modal Xem chi tiết ảnh */}
      <Modal
        isOpen={!!selectedDetailMedia}
        onClose={() => setSelectedDetailMedia(null)}
        title="Thông tin chi tiết hình ảnh"
        description="Thông số kỹ thuật, đường dẫn CDN và các biến thể kích thước phục vụ SEO."
        size="lg"
      >
        {selectedDetailMedia && (
          <div className="space-y-5">
            {/* Ảnh lớn */}
            <div className="w-full max-h-80 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-2">
              <img
                src={selectedDetailMedia.url || ''}
                alt={selectedDetailMedia.alt}
                className="max-h-72 max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Chi tiết thông tin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-500">Tên file:</span>
                  <p className="font-semibold text-slate-900 mt-0.5 break-all">{selectedDetailMedia.filename}</p>
                </div>
                <div>
                  <span className="text-slate-500">Kích thước gốc:</span>
                  <p className="font-mono text-slate-800 mt-0.5">
                    {selectedDetailMedia.width} × {selectedDetailMedia.height} px
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Dung lượng:</span>
                  <p className="font-mono text-slate-800 mt-0.5">{formatFileSize(selectedDetailMedia.filesize)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Định dạng MIME:</span>
                  <p className="font-mono text-slate-800 mt-0.5">{selectedDetailMedia.mimeType}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-500">Alt text (Mô tả SEO):</span>
                  <p className="text-slate-800 font-medium mt-0.5">{selectedDetailMedia.alt}</p>
                </div>
                <div>
                  <span className="text-slate-500">Chú thích (Caption):</span>
                  <p className="text-slate-700 italic mt-0.5">
                    {selectedDetailMedia.caption || '(Không có)'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Ngày tạo:</span>
                  <p className="text-slate-800 mt-0.5">{formatDateTime(selectedDetailMedia.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Biến thể kích thước (Sizes) */}
            {selectedDetailMedia.sizes && Object.keys(selectedDetailMedia.sizes).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  Các kích thước tự động sinh:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {selectedDetailMedia.sizes.card && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="font-semibold text-blue-600">Card (640w)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        {selectedDetailMedia.sizes.card.width} × {selectedDetailMedia.sizes.card.height}
                      </p>
                    </div>
                  )}
                  {selectedDetailMedia.sizes.hero && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="font-semibold text-blue-600">Hero (1600w)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        {selectedDetailMedia.sizes.hero.width} × {selectedDetailMedia.sizes.hero.height}
                      </p>
                    </div>
                  )}
                  {selectedDetailMedia.sizes.og && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="font-semibold text-blue-600">OG (1200×630)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        {selectedDetailMedia.sizes.og.width} × {selectedDetailMedia.sizes.og.height}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Đường dẫn URL & Nút thao tác */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs text-slate-500">Đường dẫn URL:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={selectedDetailMedia.url || ''}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(selectedDetailMedia)}
                  className="flex items-center gap-1 text-xs shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép
                </Button>
                {selectedDetailMedia.url && (
                  <a
                    href={selectedDetailMedia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                    title="Mở ảnh trong tab mới"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedDetailMedia(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MediaGallery;
