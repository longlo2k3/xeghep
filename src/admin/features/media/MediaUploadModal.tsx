import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '@/admin/components/ui/Modal';
import { Button } from '@/admin/components/ui/Button';
import { Input } from '@/admin/components/ui/Input';
import { Textarea } from '@/admin/components/ui/Textarea';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import { formatFileSize } from '@/admin/lib/utils';
import type { MediaDoc } from '@/admin/types/media';

export interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (media: MediaDoc) => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.avif';

export function MediaUploadModal({ isOpen, onClose, onSuccess }: MediaUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [altError, setAltError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dọn dẹp object URL khi unmount hoặc chọn file mới
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Reset form khi modal mở/đóng
  useEffect(() => {
    if (!isOpen) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setAlt('');
      setCaption('');
      setAltError(null);
      setFileError(null);
      setGeneralError(null);
      setIsUploading(false);
      setIsDragging(false);
    }
  }, [isOpen]);

  const handleFile = (file: File) => {
    setFileError(null);
    setGeneralError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Chỉ chấp nhận định dạng ảnh JPG, PNG, WebP hoặc AVIF.');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);

    // Gợi ý alt text từ tên file nếu chưa có alt
    if (!alt.trim()) {
      const suggestedName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      setAlt(suggestedName);
      setAltError(null);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    let hasError = false;

    if (!selectedFile) {
      setFileError('Vui lòng chọn hình ảnh cần tải lên.');
      hasError = true;
    }

    if (!alt.trim()) {
      setAltError('Alt text là bắt buộc để tối ưu SEO hình ảnh và trợ năng (a11y).');
      hasError = true;
    }

    if (hasError || !selectedFile) {
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('alt', alt.trim());
      if (caption.trim()) {
        formData.append('caption', caption.trim());
      }
      formData.append(
        '_payload',
        JSON.stringify({
          alt: alt.trim(),
          caption: caption.trim() || undefined,
        })
      );

      const res = await apiClient.post<{ doc: MediaDoc; message?: string }>('/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedDoc = res.data?.doc || (res.data as unknown as MediaDoc);
      onSuccess?.(uploadedDoc);
      onClose();
    } catch (err) {
      setGeneralError(getApiErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tải ảnh mới lên hệ thống"
      description="Chấp nhận ảnh JPG, PNG, WebP, AVIF. Hệ thống sẽ tự động tối ưu và sinh kích thước card, hero, og."
      size="lg"
      closeOnOverlayClick={!isUploading}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Lỗi tổng quát */}
        {generalError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 font-medium">{generalError}</div>
          </div>
        )}

        {/* Khu vực chọn / Kéo thả file */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS}
            onChange={handleInputChange}
            className="hidden"
            id="media-file-upload-input"
            data-testid="media-file-input"
          />

          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                  : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 bg-slate-50'
              }`}
              data-testid="drop-zone"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1">
                Kéo thả hình ảnh vào đây hoặc click để chọn
              </p>
              <p className="text-xs text-slate-500">
                Hỗ trợ: JPG, PNG, WebP, AVIF (Tối đa 2400px bản gốc)
              </p>
            </div>
          ) : (
            /* Preview ảnh đã chọn */
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Xem trước ảnh"
                    className="w-full h-full object-cover"
                    data-testid="image-preview"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1 w-full text-left">
                <p className="text-sm font-medium text-slate-900 truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  Dung lượng: <span className="text-slate-800 font-mono">{formatFileSize(selectedFile.size)}</span>
                </p>
                <p className="text-xs text-slate-500">
                  Định dạng: <span className="text-slate-800 uppercase">{selectedFile.type.replace('image/', '')}</span>
                </p>

                <div className="pt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto"
                  >
                    Đổi ảnh khác
                  </Button>
                  <span className="text-slate-300">•</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={isUploading}
                    className="text-xs text-rose-600 hover:text-rose-700 p-0 h-auto"
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          )}

          {fileError && (
            <p className="mt-2 text-xs text-rose-400 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {fileError}
            </p>
          )}
        </div>

        {/* Trường Alt Text (bắt buộc) */}
        <div>
          <Input
            label="Alt text (Mô tả hình ảnh - Bắt buộc)"
            placeholder="Ví dụ: Xe ghép Hải Phòng Hà Nội đưa đón tận nơi"
            value={alt}
            onChange={(e) => {
              setAlt(e.target.value);
              if (altError && e.target.value.trim()) {
                setAltError(null);
              }
            }}
            onBlur={() => {
              if (!alt.trim()) {
                setAltError('Alt text không được để trống.');
              }
            }}
            error={altError || undefined}
            disabled={isUploading}
            required
            data-testid="media-alt-input"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Alt text giúp bot tìm kiếm Google hiểu nội dung ảnh và hỗ trợ người khiếm thị đọc màn hình.
          </p>
        </div>

        {/* Trường Caption (tùy chọn) */}
        <div>
          <Textarea
            label="Chú thích hình ảnh (Caption - Tùy chọn)"
            placeholder="Ví dụ: Hình ảnh xe Toyota Fortuner đời mới chạy tuyến Hải Phòng - Nội Bài"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isUploading}
            rows={2}
            data-testid="media-caption-input"
          />
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isUploading}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isUploading || !selectedFile}
            data-testid="media-upload-submit-btn"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tải lên...
              </>
            ) : (
              'Tải lên ngay'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default MediaUploadModal;
