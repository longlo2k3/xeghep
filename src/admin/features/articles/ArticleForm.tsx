import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Wand2,
  X,
} from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { Input } from '@/admin/components/ui/Input';
import { Textarea } from '@/admin/components/ui/Textarea';
import { Select } from '@/admin/components/ui/Select';
import { Card } from '@/admin/components/ui/Card';
import { MediaPickerModal } from '@/admin/components/common/MediaPickerModal';
import { RichTextEditor } from '@/admin/components/common/RichTextEditor';
import { SeoPreview } from '@/admin/components/common/SeoPreview';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import { slugify } from '@/admin/lib/utils';
import type { ArticleDoc, ArticleCategory } from '@/admin/types/articles';
import type { MediaDoc } from '@/admin/types/media';

interface FormState {
  title: string;
  slug: string;
  category: ArticleCategory;
  author: string;
  excerpt: string;
  content: string;
  featuredImage: MediaDoc | null;
  status: 'draft' | 'published';
  publishedAt?: string | null;
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
  category: 'tin-tuyen',
  author: 'Xe Ghép Liên Tỉnh',
  excerpt: '',
  content: '',
  featuredImage: null,
  status: 'draft',
  publishedAt: null,
  seo: {
    metaTitle: '',
    appendBrand: true,
    metaDescription: '',
    ogImage: null,
    noindex: false,
  },
};

export function ArticleForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const [form, setForm] = useState<FormState>(initialFormState);
  const [initialArticle, setInitialArticle] = useState<ArticleDoc | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Modals chọn ảnh
  const [isFeaturedMediaModalOpen, setIsFeaturedMediaModalOpen] = useState(false);
  const [isOgMediaModalOpen, setIsOgMediaModalOpen] = useState(false);

  // Nạp dữ liệu bài viết khi ở chế độ chỉnh sửa
  const fetchArticle = useCallback(async () => {
    if (!id || id === 'new') return;
    try {
      setIsLoadingDoc(true);
      setApiError(null);
      const res = await apiClient.get<ArticleDoc | { doc: ArticleDoc }>(`/articles/${id}`);
      const doc = 'doc' in res.data ? res.data.doc : res.data;

      setInitialArticle(doc);

      // Trích xuất featuredImage (có thể là MediaDoc hoặc ID)
      const featuredImgObj =
        typeof doc.featuredImage === 'object' && doc.featuredImage !== null
          ? (doc.featuredImage as MediaDoc)
          : null;

      // Trích xuất ogImage
      const ogImgObj =
        typeof doc.seo?.ogImage === 'object' && doc.seo?.ogImage !== null
          ? (doc.seo.ogImage as MediaDoc)
          : null;

      setForm({
        title: doc.title || '',
        slug: doc.slug || '',
        category: doc.category || 'tin-tuyen',
        author: doc.author || 'Xe Ghép Liên Tỉnh',
        excerpt: doc.excerpt || '',
        content: doc.content || doc.contentHtml || '',
        featuredImage: featuredImgObj,
        status: doc.status === 'published' ? 'published' : 'draft',
        publishedAt: doc.publishedAt || null,
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
      fetchArticle();
    }
  }, [isEdit, fetchArticle]);

  // Tự động sinh slug khi nhập tiêu đề ở chế độ tạo mới (nếu chưa sửa tay)
  const handleTitleChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: !isSlugManuallyEdited && !isEdit ? slugify(val) : prev.slug,
    }));
    if (formErrors.title) {
      setFormErrors((prev) => ({ ...prev, title: '' }));
    }
  };

  const handleSlugSync = () => {
    if (form.title) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  };

  // Kiểm tra cảnh báo redirect 301 khi thay đổi slug của bài đã xuất bản
  const isSlugChangedOnPublished = useMemo(() => {
    if (!isEdit || !initialArticle) return false;
    const wasPublished = initialArticle.status === 'published';
    const slugChanged = Boolean(form.slug && initialArticle.slug && form.slug !== initialArticle.slug);
    return wasPublished && slugChanged;
  }, [isEdit, initialArticle, form.slug]);

  // Validation form trước khi gửi
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.title.trim()) {
      errors.title = 'Vui lòng nhập tiêu đề bài viết.';
    }

    if (!form.slug.trim()) {
      errors.slug = 'Vui lòng nhập slug bài viết.';
    }

    if (!form.category) {
      errors.category = 'Vui lòng chọn danh mục bài viết.';
    }

    if (!form.author.trim()) {
      errors.author = 'Vui lòng nhập tên tác giả.';
    }

    if (!form.excerpt.trim()) {
      errors.excerpt = 'Vui lòng nhập tóm tắt ngắn (excerpt).';
    } else if (form.excerpt.length > 300) {
      errors.excerpt = `Tóm tắt không được vượt quá 300 ký tự (hiện tại: ${form.excerpt.length} ký tự).`;
    }

    if (!form.featuredImage) {
      errors.featuredImage = 'Vui lòng chọn ảnh đại diện cho bài viết.';
    }

    if (!form.content.trim()) {
      errors.content = 'Vui lòng nhập nội dung bài viết.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Xử lý lưu form (với targetStatus = 'draft' hoặc 'published')
  const handleSubmit = async (targetStatus: 'draft' | 'published') => {
    setApiError(null);
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        category: form.category,
        author: form.author.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content,
        featuredImage: form.featuredImage?.id,
        status: targetStatus,
        publishedAt:
          targetStatus === 'published'
            ? form.publishedAt || new Date().toISOString()
            : form.publishedAt,
        seo: {
          metaTitle: form.seo.metaTitle.trim() || null,
          appendBrand: form.seo.appendBrand,
          metaDescription: form.seo.metaDescription.trim() || null,
          ogImage: form.seo.ogImage?.id || null,
          noindex: form.seo.noindex,
        },
      };

      if (isEdit) {
        await apiClient.patch(`/articles/${id}`, payload);
      } else {
        await apiClient.post('/articles', payload);
      }

      navigate('/articles');
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingDoc) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Đang nạp dữ liệu bài viết...</p>
      </div>
    );
  }

  const featuredImgUrl =
    form.featuredImage?.thumbnailURL ||
    form.featuredImage?.sizes?.card?.url ||
    form.featuredImage?.url;

  const ogImgUrl =
    form.seo.ogImage?.sizes?.og?.url ||
    form.seo.ogImage?.url ||
    featuredImgUrl;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link
            to="/articles"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách bài viết</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEdit
              ? `Cập nhật thông tin cho bài viết #${id} (${initialArticle?.slug})`
              : 'Soạn thảo nội dung cẩm nang, tin tức và tối ưu hóa SEO Google.'}
          </p>
        </div>

        {/* Nút thao tác phía trên */}
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
            className="cursor-pointer shadow-sm"
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
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* CẢNH BÁO REDIRECT 301 NẾU ĐỔI SLUG BÀI ĐÃ XUẤT BẢN */}
      {isSlugChangedOnPublished && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3 shadow-sm"
          data-testid="slug-redirect-warning"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-amber-900 text-sm">
              Cảnh báo chuyển hướng 301 tự động khi đổi slug
            </h4>
            <p className="text-slate-700 leading-relaxed">
              Bài viết này đang ở trạng thái <strong className="text-slate-900">Đã xuất bản</strong> tại đường dẫn cũ:{' '}
              <span className="font-mono text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200">
                /tin-tuc/{initialArticle?.slug}
              </span>
              . Việc thay đổi sang slug mới{' '}
              <span className="font-mono text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200">
                /tin-tuc/{form.slug}
              </span>{' '}
              sẽ kích hoạt hệ thống tự động tạo bản ghi <strong className="text-amber-900">Redirect 301</strong> từ đường dẫn cũ sang mới để bảo toàn thứ hạng SEO và tránh lỗi 404 cho người truy cập.
            </p>
          </div>
        </div>
      )}

      {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
      <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3">
          Thông tin cơ bản bài viết
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tiêu đề */}
          <div className="md:col-span-2">
            <Input
              label="Tiêu đề bài viết"
              placeholder="Ví dụ: Cẩm nang đặt xe ghép Hà Nội đi Hải Phòng giá rẻ, đón trả tận nơi"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              error={formErrors.title}
              required
              data-testid="article-title-input"
            />
          </div>

          {/* Slug */}
          <div className="md:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Slug (Đường dẫn tĩnh) <span className="text-red-500 ml-1">*</span>
              </label>
              <button
                type="button"
                onClick={handleSlugSync}
                className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer font-medium"
                title="Tự động đồng bộ từ tiêu đề"
              >
                <Wand2 className="w-3 h-3" />
                <span>Đồng bộ từ tiêu đề</span>
              </button>
            </div>
            <Input
              placeholder="cam-nang-dat-xe-ghep-ha-noi-hai-phong"
              value={form.slug}
              onChange={(e) => {
                setIsSlugManuallyEdited(true);
                setForm((prev) => ({ ...prev, slug: e.target.value }));
                if (formErrors.slug) setFormErrors((prev) => ({ ...prev, slug: '' }));
              }}
              error={formErrors.slug}
              data-testid="article-slug-input"
            />
            <p className="text-[11px] text-slate-500 font-mono">
              Đường dẫn đầy đủ: https://xegheplientinh.vn/tin-tuc/{form.slug || 'slug-bai-viet'}
            </p>
          </div>

          {/* Danh mục */}
          <div>
            <Select
              label="Danh mục bài viết"
              value={form.category}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, category: e.target.value as ArticleCategory }));
                if (formErrors.category) setFormErrors((prev) => ({ ...prev, category: '' }));
              }}
              error={formErrors.category}
              required
              data-testid="article-category-select"
            >
              <option value="kinh-nghiem">Kinh nghiệm đi xe</option>
              <option value="tin-tuyen">Tin tuyến & Báo giá</option>
              <option value="khuyen-mai">Khuyến mãi</option>
            </Select>
          </div>

          {/* Tác giả */}
          <div>
            <Input
              label="Tác giả"
              value={form.author}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, author: e.target.value }));
                if (formErrors.author) setFormErrors((prev) => ({ ...prev, author: '' }));
              }}
              error={formErrors.author}
              required
              data-testid="article-author-input"
            />
          </div>

          {/* Tóm tắt ngắn (Excerpt) */}
          <div className="md:col-span-2 space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Tóm tắt ngắn (Excerpt) <span className="text-red-500 ml-1">*</span>
              </label>
              <span
                className={`text-[11px] font-mono ${
                  form.excerpt.length > 300
                    ? 'text-rose-600 font-bold'
                    : form.excerpt.length >= 250
                    ? 'text-amber-600'
                    : 'text-slate-500'
                }`}
              >
                {form.excerpt.length} / 300 ký tự
              </span>
            </div>
            <Textarea
              placeholder="Nhập phần tóm tắt ngắn cho bài viết (dùng làm mô tả thẻ card và fallback SEO meta description)..."
              value={form.excerpt}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, excerpt: e.target.value }));
                if (formErrors.excerpt) setFormErrors((prev) => ({ ...prev, excerpt: '' }));
              }}
              error={formErrors.excerpt}
              rows={3}
              data-testid="article-excerpt-input"
            />
          </div>
        </div>
      </Card>

      {/* KHỐI 2: ẢNH ĐẠI DIỆN */}
      <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ảnh đại diện bài viết (Featured Image) <span className="text-red-500 ml-0.5">*</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ảnh hiển thị ở đầu bài viết và trên danh sách thẻ bài viết.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsFeaturedMediaModalOpen(true)}
            data-testid="select-featured-image-btn"
            className="cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 mr-1.5 text-blue-600" />
            <span>{form.featuredImage ? 'Đổi ảnh đại diện' : 'Chọn ảnh từ thư viện'}</span>
          </Button>
        </div>

        {formErrors.featuredImage && (
          <p className="text-xs text-rose-600 font-medium">{formErrors.featuredImage}</p>
        )}

        {form.featuredImage && featuredImgUrl ? (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <img
                  src={featuredImgUrl}
                  alt={form.featuredImage.alt || 'Ảnh đại diện'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate text-xs">
                <p className="font-semibold text-slate-900 truncate">{form.featuredImage.filename}</p>
                <p className="text-slate-500 truncate mt-0.5">
                  Alt text: <span className="text-slate-700">{form.featuredImage.alt}</span>
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {form.featuredImage.width}×{form.featuredImage.height} px
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setForm((prev) => ({ ...prev, featuredImage: null }))}
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 cursor-pointer"
              title="Gỡ ảnh đại diện"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div
            onClick={() => setIsFeaturedMediaModalOpen(true)}
            className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center gap-2"
          >
            <ImageIcon className="w-8 h-8 text-slate-400" />
            <p className="text-xs font-medium text-slate-600">
              Chưa có ảnh đại diện. Nhấp vào đây để chọn ảnh từ thư viện Media.
            </p>
          </div>
        )}
      </Card>

      {/* KHỐI 3: NỘI DUNG SOẠN THẢO */}
      <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Nội dung bài viết (HTML) <span className="text-red-500 ml-0.5">*</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Soạn thảo bằng chế độ trực quan hoặc mã nguồn HTML. Các thẻ H2 sẽ tự động được gán ID để tạo Mục lục (TOC).
          </p>
        </div>

        <RichTextEditor
          value={form.content}
          onChange={(html) => {
            setForm((prev) => ({ ...prev, content: html }));
            if (formErrors.content) setFormErrors((prev) => ({ ...prev, content: '' }));
          }}
          placeholder="Soạn thảo nội dung bài viết chi tiết tại đây..."
          error={formErrors.content}
          minHeight="350px"
        />
      </Card>

      {/* KHỐI 4: CẤU HÌNH SEO & XEM TRƯỚC */}
      <div className="space-y-4">
        <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3">
            Cấu hình SEO & Mạng xã hội
          </h3>

          <div className="space-y-4">
            {/* Meta Title */}
            <div>
              <Input
                label="Tiêu đề SEO (Meta Title - Tối ưu 50–70 ký tự)"
                placeholder={form.title || 'Để trống: tự động lấy theo tiêu đề bài viết'}
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
                id="article-append-brand"
                checked={form.seo.appendBrand}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, appendBrand: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="article-append-brand" className="text-xs text-slate-700 cursor-pointer">
                Tự động thêm hậu tố thương hiệu <span className="font-semibold text-slate-900">" | Xe Ghép Liên Tỉnh"</span> vào cuối tiêu đề SEO.
              </label>
            </div>

            {/* Meta Description */}
            <div>
              <Textarea
                label="Mô tả SEO (Meta Description - Tối ưu 120–160 ký tự)"
                placeholder={form.excerpt || 'Để trống: tự động lấy theo phần tóm tắt ngắn (excerpt)'}
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
                    : 'Mặc định: Sử dụng ảnh đại diện của bài viết'}
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
                    className="text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 h-auto cursor-pointer"
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
                  {form.seo.ogImage ? 'Đổi ảnh OG' : 'Chọn ảnh riêng'}
                </Button>
              </div>
            </div>

            {/* Checkbox Noindex */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="article-noindex"
                checked={form.seo.noindex}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, noindex: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-slate-300 bg-white text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <label htmlFor="article-noindex" className="text-xs text-rose-600 cursor-pointer">
                Chặn công cụ tìm kiếm lập chỉ mục trang này (noindex - loại khỏi sitemap.xml).
              </label>
            </div>
          </div>
        </Card>

        {/* Khung SeoPreview tích hợp */}
        <SeoPreview
          title={form.seo.metaTitle || form.title}
          description={form.seo.metaDescription || form.excerpt}
          slug={form.slug}
          prefix="tin-tuc"
          appendBrand={form.seo.appendBrand}
          ogImage={ogImgUrl || undefined}
        />
      </div>

      {/* Thanh nút bấm cuối trang */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/articles')}
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
            className="shadow-sm"
          >
            <Send className="w-4 h-4 mr-1.5" />
            <span>Xuất bản ngay</span>
          </Button>
        </div>
      </div>

      {/* Media Picker cho Featured Image */}
      <MediaPickerModal
        isOpen={isFeaturedMediaModalOpen}
        onClose={() => setIsFeaturedMediaModalOpen(false)}
        onSelect={(media) => {
          setForm((prev) => ({ ...prev, featuredImage: media }));
          if (formErrors.featuredImage) {
            setFormErrors((prev) => ({ ...prev, featuredImage: '' }));
          }
        }}
        selectedId={form.featuredImage?.id}
        title="Chọn ảnh đại diện bài viết"
      />

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

export default ArticleForm;
