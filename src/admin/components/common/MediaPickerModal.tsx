import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  UploadCloud,
  Check,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  FileImage,
} from 'lucide-react';
import { Modal } from '@/admin/components/ui/Modal';
import { Button } from '@/admin/components/ui/Button';
import { Input } from '@/admin/components/ui/Input';
import { Textarea } from '@/admin/components/ui/Textarea';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import { formatFileSize } from '@/admin/lib/utils';
import type { MediaDoc } from '@/admin/types/media';
import type { PaginatedResponse } from '@/admin/types/api';

export interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaDoc) => void;
  title?: string;
  selectedId?: number | null;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.avif';

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Chọn hình ảnh từ thư viện',
  selectedId,
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');

  // Library state
  const [mediaList, setMediaList] = useState<MediaDoc[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaDoc | null>(null);

  // Upload tab state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadAltError, setUploadAltError] = useState<string | null>(null);
  const [uploadFileError, setUploadFileError] = useState<string | null>(null);
  const [uploadGeneralError, setUploadGeneralError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Dọn dẹp upload preview
  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) {
        URL.revokeObjectURL(uploadPreviewUrl);
      }
    };
  }, [uploadPreviewUrl]);

  // Tải danh sách media khi mở modal hoặc tìm kiếm
  const fetchLibrary = useCallback(async () => {
    if (!isOpen) return;
    try {
      setIsLoadingLibrary(true);
      setLibraryError(null);

      const params: Record<string, unknown> = {
        limit: 50,
        sort: '-createdAt',
      };

      if (searchQuery.trim()) {
        params['where[or][0][filename][like]'] = searchQuery.trim();
        params['where[or][1][alt][like]'] = searchQuery.trim();
      }

      const res = await apiClient.get<PaginatedResponse<MediaDoc>>('/media', { params });
      const docs = res.data?.docs || [];
      setMediaList(docs);

      // Nếu có selectedId ban đầu, tìm và set selectedMedia
      if (selectedId && !selectedMedia) {
        const found = docs.find((m) => m.id === selectedId);
        if (found) setSelectedMedia(found);
      }
    } catch (err) {
      setLibraryError(getApiErrorMessage(err));
    } finally {
      setIsLoadingLibrary(false);
    }
  }, [isOpen, searchQuery, selectedId, selectedMedia]);

  useEffect(() => {
    if (isOpen) {
      fetchLibrary();
    }
  }, [isOpen, fetchLibrary]);

  // Reset state khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('library');
      setSearchQuery('');
      setUploadFile(null);
      if (uploadPreviewUrl) {
        URL.revokeObjectURL(uploadPreviewUrl);
      }
      setUploadPreviewUrl(null);
      setUploadAlt('');
      setUploadCaption('');
      setUploadAltError(null);
      setUploadFileError(null);
      setUploadGeneralError(null);
    }
  }, [isOpen]);

  const handleSelectMedia = (media: MediaDoc) => {
    setSelectedMedia(media);
  };

  const handleConfirmSelect = () => {
    if (selectedMedia) {
      onSelect(selectedMedia);
      onClose();
    }
  };

  // Upload handlers
  const handleUploadFileChange = (file: File) => {
    setUploadFileError(null);
    setUploadGeneralError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadFileError('Chỉ chấp nhận định dạng ảnh JPG, PNG, WebP hoặc AVIF.');
      return;
    }

    if (uploadPreviewUrl) {
      URL.revokeObjectURL(uploadPreviewUrl);
    }

    const url = URL.createObjectURL(file);
    setUploadFile(file);
    setUploadPreviewUrl(url);

    if (!uploadAlt.trim()) {
      const suggested = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      setUploadAlt(suggested);
      setUploadAltError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadGeneralError(null);

    let hasError = false;
    if (!uploadFile) {
      setUploadFileError('Vui lòng chọn hình ảnh để tải lên.');
      hasError = true;
    }
    if (!uploadAlt.trim()) {
      setUploadAltError('Alt text không được để trống.');
      hasError = true;
    }
    if (hasError || !uploadFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('alt', uploadAlt.trim());
      if (uploadCaption.trim()) {
        formData.append('caption', uploadCaption.trim());
      }
      formData.append(
        '_payload',
        JSON.stringify({
          alt: uploadAlt.trim(),
          caption: uploadCaption.trim() || undefined,
        })
      );

      const res = await apiClient.post<{ doc: MediaDoc; message?: string }>('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newDoc = res.data?.doc || (res.data as unknown as MediaDoc);

      // Thêm vào danh sách và tự động chọn
      setMediaList((prev) => [newDoc, ...prev]);
      setSelectedMedia(newDoc);
      setActiveTab('library');
    } catch (err) {
      setUploadGeneralError(getApiErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Chọn hình ảnh từ thư viện sẵn có hoặc tải tệp ảnh mới lên hệ thống."
      size="2xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'library'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            data-testid="tab-library"
          >
            <FileImage className="w-4 h-4" />
            Thư viện ảnh ({mediaList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            data-testid="tab-upload"
          >
            <UploadCloud className="w-4 h-4" />
            Tải ảnh mới
          </button>
        </div>

        {/* TAB 1: THƯ VIỆN ẢNH */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            {/* Thanh tìm kiếm */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="text"
                placeholder="Tìm ảnh theo tên file hoặc Alt text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs"
                data-testid="picker-search-input"
              />
            </div>

            {libraryError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{libraryError}</span>
              </div>
            )}

            {/* Lưới hình ảnh */}
            <div className="min-h-[280px] max-h-[380px] overflow-y-auto p-1 pr-2 rounded-xl">
              {isLoadingLibrary ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl bg-slate-100 animate-pulse border border-slate-200"
                    />
                  ))}
                </div>
              ) : mediaList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <ImageIcon className="w-10 h-10 mx-auto text-slate-400 mb-1" />
                  <p className="text-sm font-medium text-slate-700">
                    {searchQuery ? 'Không tìm thấy hình ảnh phù hợp' : 'Chưa có ảnh nào trong thư viện'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {searchQuery
                      ? 'Thử thay đổi từ khóa tìm kiếm.'
                      : 'Hãy chuyển sang tab "Tải ảnh mới" để thêm ảnh.'}
                  </p>
                </div>
              ) : (
                <div
                  className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"
                  data-testid="picker-image-grid"
                >
                  {mediaList.map((media) => {
                    const isSelected = selectedMedia?.id === media.id;
                    const thumbUrl = media.thumbnailURL || media.sizes?.card?.url || media.url || '';

                    return (
                      <div
                        key={media.id}
                        onClick={() => handleSelectMedia(media)}
                        className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition border-2 ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-500/40 bg-blue-500/10 scale-[1.02]'
                            : 'border-slate-200 hover:border-slate-400 bg-slate-100'
                        }`}
                        data-testid={`picker-item-${media.id}`}
                      >
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={media.alt || 'Ảnh'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}

                        {/* Dấu tích chọn */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg animate-in zoom-in-75">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        {/* Hover filename label */}
                        <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-slate-950/90 to-transparent text-[11px] text-white truncate font-medium">
                          {media.filename}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Thông tin ảnh đang chọn */}
            {selectedMedia && (
              <div
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs animate-in fade-in"
                data-testid="selected-media-info"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={selectedMedia.thumbnailURL || selectedMedia.sizes?.card?.url || selectedMedia.url || ''}
                      alt={selectedMedia.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-slate-900 truncate">{selectedMedia.filename}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Alt: <span className="text-slate-700">{selectedMedia.alt}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 font-mono shrink-0 pl-3">
                  <p>{selectedMedia.width}×{selectedMedia.height} px</p>
                  <p>{formatFileSize(selectedMedia.filesize)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TẢI ẢNH MỚI */}
        {activeTab === 'upload' && (
          <form onSubmit={handleUploadSubmit} noValidate className="space-y-4">
            {uploadGeneralError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{uploadGeneralError}</span>
              </div>
            )}

            {/* Kéo thả hoặc chọn file */}
            <div>
              <input
                type="file"
                accept={ALLOWED_EXTENSIONS}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadFileChange(f);
                }}
                className="hidden"
                id="picker-file-input"
                data-testid="picker-file-input"
              />

              {!uploadFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleUploadFileChange(f);
                  }}
                  onClick={() => document.getElementById('picker-file-input')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                    isDragging
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-200 hover:border-slate-400 hover:bg-slate-100 bg-slate-50'
                  }`}
                  data-testid="picker-drop-zone"
                >
                  <UploadCloud className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-800 mb-0.5">
                    Click để chọn ảnh hoặc kéo thả vào đây
                  </p>
                  <p className="text-[11px] text-slate-500">
                    JPG, PNG, WebP, AVIF (Tự động nén kích thước)
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    {uploadPreviewUrl && (
                      <img src={uploadPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-semibold text-slate-900 truncate">{uploadFile.name}</p>
                    <p className="text-slate-500 font-mono mt-0.5">{formatFileSize(uploadFile.size)}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUploadFile(null);
                        setUploadPreviewUrl(null);
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 p-0 h-auto mt-1"
                    >
                      Chọn file khác
                    </Button>
                  </div>
                </div>
              )}

              {uploadFileError && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {uploadFileError}
                </p>
              )}
            </div>

            {/* Alt text input */}
            <div>
              <Input
                label="Alt text (Bắt buộc - Mô tả ảnh chuẩn SEO)"
                placeholder="Nhập mô tả nội dung ảnh..."
                value={uploadAlt}
                onChange={(e) => {
                  setUploadAlt(e.target.value);
                  if (uploadAltError && e.target.value.trim()) {
                    setUploadAltError(null);
                  }
                }}
                error={uploadAltError || undefined}
                required
                data-testid="picker-alt-input"
              />
            </div>

            {/* Caption input */}
            <div>
              <Textarea
                label="Chú thích ảnh (Tùy chọn)"
                placeholder="Nhập chú thích nếu cần..."
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                rows={2}
              />
            </div>

            {/* Nút Upload và tự chọn */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="submit"
                variant="default"
                disabled={isUploading || !uploadFile}
                data-testid="picker-upload-submit-btn"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tải lên...
                  </>
                ) : (
                  'Tải lên và Chọn ảnh'
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy bỏ
          </Button>

          <Button
            type="button"
            variant="default"
            disabled={!selectedMedia}
            onClick={handleConfirmSelect}
            data-testid="picker-confirm-select-btn"
          >
            Xác nhận chọn {selectedMedia ? `(${selectedMedia.filename})` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default MediaPickerModal;
