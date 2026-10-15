import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Info,
  AlertCircle,
  Loader2,
  Wand2,
  Shield,
  FileText,
} from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { Input } from '@/admin/components/ui/Input';
import { Textarea } from '@/admin/components/ui/Textarea';
import { Select } from '@/admin/components/ui/Select';
import { Card } from '@/admin/components/ui/Card';
import { Badge } from '@/admin/components/ui/Badge';
import { MediaPickerModal } from '@/admin/components/common/MediaPickerModal';
import { RichTextEditor } from '@/admin/components/common/RichTextEditor';
import { SeoPreview } from '@/admin/components/common/SeoPreview';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import { slugify } from '@/admin/lib/utils';
import type { PageDoc, PageKind } from '@/admin/types/pages';
import type { MediaDoc } from '@/admin/types/media';

interface FormState {
  title: string;
  slug: string;
  kind: PageKind;
  contentHtml: string;
  status: 'draft' | 'published';
  seo: {
    metaTitle: string;
    appendBrand: boolean;
    metaDescription: string;
    ogImage: MediaDoc | null;
    noindex: boolean;
  };
}

const initialFormState: FormState = {
  title: '',
  slug: '',
  kind: 'content',
  contentHtml: '',
  status: 'published',
  seo: {
    metaTitle: '',
    appendBrand: true,
    metaDescription: '',
    ogImage: null,
    noindex: false,
  },
};

export function PageForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const [form, setForm] = useState<FormState>(initialFormState);
  const [isLoadingDoc, setIsLoadingDoc] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Modal chọn OG Image
  const [isOgMediaModalOpen, setIsOgMediaModalOpen] = useState(false);

  // Nạp dữ liệu trang khi chỉnh sửa
  const fetchPage = useCallback(async () => {
    if (!id || id === 'new') return;
    try {
      setIsLoadingDoc(true);
      setApiError(null);
      const res = await apiClient.get<PageDoc | { doc: PageDoc }>(`/pages/${id}`);
      const doc = 'doc' in res.data ? res.data.doc : res.data;

      const ogImgObj =
        typeof doc.seo?.ogImage === 'object' && doc.seo?.ogImage !== null
          ? (doc.seo.ogImage as MediaDoc)
          : null;

      setForm({
        title: doc.title || '',
        slug: doc.slug || '',
        kind: doc.kind || 'content',
        contentHtml: doc.contentHtml || '',
        status: doc.status || 'published',
        seo: {
          metaTitle: doc.seo?.metaTitle || '',
          appendBrand: doc.seo?.appendBrand ?? true,
          metaDescription: doc.seo?.metaDescription || '',
          ogImage: ogImgObj,
          noindex: doc.seo?.noindex ?? false,
        },
      });
      setIsSlugManuallyEdited(true);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    } finally {
      setIsLoadingDoc(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) {
      fetchPage();
    }
  }, [isEdit, fetchPage]);

  // Sinh slug từ title khi tạo mới trang nội dung
  const handleTitleChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: !isSlugManuallyEdited && !isEdit && prev.kind === 'content' ? slugify(val) : prev.slug,
    }));
    if (formErrors.title) {
      setFormErrors((prev) => ({ ...prev, title: '' }));
    }
  };

  const isSystemPage = form.kind === 'system';

  // Validation form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.title.trim()) {
      errors.title = 'Vui lòng nhập tiêu đề trang.';
    }

    if (!form.slug.trim()) {
      errors.slug = 'Vui lòng nhập slug đường dẫn.';
    }

    if (form.kind === 'content' && !form.contentHtml.trim()) {
      errors.contentHtml = 'Trang nội dung chính sách bắt buộc phải có nội dung.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmit = async (targetStatus: 'draft' | 'published') => {
    setApiError(null);
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        status: targetStatus,
        seo: {
          metaTitle: form.seo.metaTitle.trim() || null,
          appendBrand: form.seo.appendBrand,
          metaDescription: form.seo.metaDescription.trim() || null,
          ogImage: form.seo.ogImage?.id || null,
          noindex: form.seo.noindex,
        },
      };

      if (form.kind === 'content') {
        payload.slug = form.slug.trim();
        payload.contentHtml = form.contentHtml;
        if (!isEdit) {
          payload.kind = 'content';
        }
      }

      if (isEdit) {
        await apiClient.patch(`/pages/${id}`, payload);
      } else {
        await apiClient.post('/pages', payload);
      }

      navigate('/pages');
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingDoc) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Đang nạp cấu hình trang...</p>
      </div>
    );
  }

  const ogImgUrl = form.seo.ogImage?.sizes?.og?.url || form.seo.ogImage?.url;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link
            to="/pages"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách trang</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isEdit ? 'Chỉnh sửa trang' : 'Tạo trang mới'}
            </h1>
            {isSystemPage ? (
              <Badge variant="info" className="bg-blue-50 text-blue-700 border border-blue-200">
                Hệ thống
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border border-purple-200">
                Nội dung
              </Badge>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-0.5">
            {isSystemPage
              ? `Trang hệ thống cốt lõi #${id} (/${form.slug}) - Quản lý cấu hình SEO và thẻ meta.`
              : isEdit
              ? `Chỉnh sửa trang chính sách #${id} (/${form.slug})`
              : 'Tạo trang chính sách, điều khoản dịch vụ mới.'}
          </p>
        </div>

        {/* Nút thao tác đầu trang */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            data-testid="save-draft-btn"
            className="cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            <span>Lưu bản nháp</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting}
            data-testid="publish-btn"
            className="cursor-pointer shadow-md shadow-blue-500/20"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            <span>Xuất bản ngay</span>
          </Button>
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {apiError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{apiError}</span>
        </div>
      )}

      {/* BANNER THÔNG BÁO CHO TRANG HỆ THỐNG */}
      {isSystemPage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-start gap-3 shadow-sm"
          data-testid="system-page-banner"
        >
          <Info className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-blue-950 text-sm flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Trang hệ thống cốt lõi (Kind: System)
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Giao diện, bố cục và chức năng động của trang này (ví dụ: Trang chủ, Giới thiệu, Tuyến liên tỉnh) được xây dựng trực tiếp trong mã nguồn code frontend.
              Đường dẫn slug <span className="font-mono text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">/{form.slug}</span> và Loại trang được cố định ở chế độ <strong className="text-slate-900">Read-Only</strong> để bảo vệ cấu trúc hệ thống.
              Tại đây, bạn có thể tinh chỉnh <strong className="text-slate-900">Tiêu đề (H1)</strong> và toàn bộ <strong className="text-slate-900">Cấu hình SEO / Thẻ meta</strong> hiển thị trên Google.
            </p>
          </div>
        </div>
      )}

      {/* KHỐI 1: THÔNG TIN TRANG */}
      <Card className="p-6 border-slate-200 bg-white space-y-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
          Thông tin cơ bản trang
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tiêu đề */}
          <div className="md:col-span-2">
            <Input
              label="Tiêu đề trang (H1)"
              placeholder={isSystemPage ? 'Nhập tiêu đề trang...' : 'Ví dụ: Chính sách bảo mật thông tin khách hàng'}
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              error={formErrors.title}
              required
              data-testid="page-title-input"
            />
          </div>

          {/* Slug */}
          <div className="md:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Slug (Đường dẫn tĩnh){' '}
                {isSystemPage ? (
                  <span className="text-amber-600 font-normal ml-1">(Cố định - Read Only)</span>
                ) : (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>

              {!isSystemPage && !isEdit && (
                <button
                  type="button"
                  onClick={() => form.title && setForm((prev) => ({ ...prev, slug: slugify(prev.title) }))}
                  className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Đồng bộ từ tiêu đề</span>
                </button>
              )}
            </div>

            <Input
              placeholder={isSystemPage ? form.slug : 'chinh-sach/bao-mat'}
              value={form.slug}
              disabled={isSystemPage}
              onChange={(e) => {
                if (!isSystemPage) {
                  setIsSlugManuallyEdited(true);
                  setForm((prev) => ({ ...prev, slug: e.target.value }));
                  if (formErrors.slug) setFormErrors((prev) => ({ ...prev, slug: '' }));
                }
              }}
              error={formErrors.slug}
              className={isSystemPage ? 'cursor-not-allowed bg-slate-100 font-mono text-slate-700' : 'font-mono'}
              data-testid="page-slug-input"
            />
            <p className="text-[11px] text-slate-500 font-mono">
              URL trang: https://xegheplientinh.vn/{form.slug || 'slug-trang'}
            </p>
          </div>

          {/* Loại trang (Kind) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phân loại trang
            </label>
            <Input
              value={form.kind === 'system' ? 'Trang hệ thống (System)' : 'Trang nội dung chính sách (Content)'}
              disabled
              className="cursor-not-allowed bg-slate-100 text-slate-700 text-xs font-medium"
              data-testid="page-kind-input"
            />
          </div>

          {/* Trạng thái */}
          <div>
            <Select
              label="Trạng thái xuất bản"
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value as 'draft' | 'published' }))
              }
              data-testid="page-status-select"
            >
              <option value="published">Đã xuất bản (Công khai)</option>
              <option value="draft">Bản nháp</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* KHỐI 2: SOẠN THẢO NỘI DUNG (CHỈ DÀNH CHO KIND === 'CONTENT') */}
      {form.kind === 'content' && (
        <Card className="p-6 border-slate-200 bg-white space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Nội dung chính sách & điều khoản (HTML) <span className="text-red-500 ml-0.5">*</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Soạn thảo điều khoản dịch vụ, chính sách bảo mật, hoàn tiền bằng trình soạn thảo trực quan.
            </p>
          </div>

          <RichTextEditor
            value={form.contentHtml}
            onChange={(html) => {
              setForm((prev) => ({ ...prev, contentHtml: html }));
              if (formErrors.contentHtml) {
                setFormErrors((prev) => ({ ...prev, contentHtml: '' }));
              }
            }}
            placeholder="Nhập nội dung các điều khoản, chính sách chi tiết tại đây..."
            error={formErrors.contentHtml}
            minHeight="320px"
          />
        </Card>
      )}

      {/* KHỐI 3: CẤU HÌNH SEO & XEM TRƯỚC */}
      <div className="space-y-4">
        <Card className="p-6 border-slate-200 bg-white space-y-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
            Tối ưu hóa tìm kiếm (SEO & Social)
          </h3>

          <div className="space-y-4">
            {/* Meta Title */}
            <div>
              <Input
                label="Tiêu đề SEO (Meta Title - Tối ưu 50–70 ký tự)"
                placeholder={form.title || 'Để trống: tự sinh theo tiêu đề trang'}
                value={form.seo.metaTitle}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, metaTitle: e.target.value },
                  }))
                }
                data-testid="seo-title-input"
              />
            </div>

            {/* Checkbox Append Brand */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="page-append-brand"
                checked={form.seo.appendBrand}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, appendBrand: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="page-append-brand" className="text-xs text-slate-700 cursor-pointer">
                Tự động thêm hậu tố thương hiệu <span className="font-semibold text-slate-900">" | Xe Ghép Liên Tỉnh"</span> vào cuối tiêu đề SEO.
              </label>
            </div>

            {/* Meta Description */}
            <div>
              <Textarea
                label="Mô tả SEO (Meta Description - Tối ưu 120–160 ký tự)"
                placeholder="Nhập mô tả tóm tắt nội dung trang phục vụ công cụ tìm kiếm Google..."
                value={form.seo.metaDescription}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, metaDescription: e.target.value },
                  }))
                }
                rows={2}
                data-testid="seo-desc-input"
              />
            </div>

            {/* OG Image */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs">
                <p className="font-semibold text-slate-800">Ảnh chia sẻ Mạng xã hội (OG Image)</p>
                <p className="text-[11px] text-slate-500">
                  {form.seo.ogImage
                    ? `Đã chọn: ${form.seo.ogImage.filename}`
                    : 'Mặc định: Sử dụng ảnh OG mặc định của hệ thống'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {form.seo.ogImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, seo: { ...prev.seo, ogImage: null } }))
                    }
                    className="text-xs text-slate-400 hover:text-rose-600 p-1.5 h-auto cursor-pointer"
                  >
                    Gỡ
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOgMediaModalOpen(true)}
                  className="text-xs cursor-pointer"
                >
                  {form.seo.ogImage ? 'Đổi ảnh OG' : 'Chọn ảnh'}
                </Button>
              </div>
            </div>

            {/* Checkbox Noindex */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="page-noindex"
                checked={form.seo.noindex}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, noindex: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-slate-300 bg-white text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <label htmlFor="page-noindex" className="text-xs text-rose-700 cursor-pointer">
                Chặn công cụ tìm kiếm Google lập chỉ mục trang này (noindex - loại khỏi sitemap.xml).
              </label>
            </div>
          </div>
        </Card>

        {/* Khung SeoPreview tích hợp */}
        <SeoPreview
          title={form.seo.metaTitle || form.title}
          description={form.seo.metaDescription}
          slug={form.slug}
          prefix=""
          appendBrand={form.seo.appendBrand}
          ogImage={ogImgUrl || undefined}
        />
      </div>

      {/* Thanh nút bấm cuối trang */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/pages')}
          disabled={isSubmitting}
        >
          Hủy bỏ
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            data-testid="save-draft-bottom-btn"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>Lưu bản nháp</span>
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting}
            data-testid="publish-bottom-btn"
            className="shadow-md shadow-blue-500/20"
          >
            <Send className="w-4 h-4 mr-1.5" />
            <span>Xuất bản ngay</span>
          </Button>
        </div>
      </div>

      {/* Media Picker cho OG Image */}
      <MediaPickerModal
        isOpen={isOgMediaModalOpen}
        onClose={() => setIsOgMediaModalOpen(false)}
        onSelect={(media) => {
          setForm((prev) => ({ ...prev, seo: { ...prev.seo, ogImage: media } }));
        }}
        selectedId={form.seo.ogImage?.id}
        title="Chọn ảnh đại diện chia sẻ MXH (OG Image)"
      />
    </div>
  );
}

export default PageForm;
