import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
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
  Plus,
  Trash2,
  Edit,
} from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { Input } from '@/admin/components/ui/Input';
import { Textarea } from '@/admin/components/ui/Textarea';
import { Select } from '@/admin/components/ui/Select';
import { Card } from '@/admin/components/ui/Card';
import { Badge } from '@/admin/components/ui/Badge';
import { MediaPickerModal } from '@/admin/components/common/MediaPickerModal';
import { SeoPreview } from '@/admin/components/common/SeoPreview';
import { PricingTiersSection, computePriceFrom, type PricingTiersState } from './PricingTiersSection';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import { slugify } from '@/admin/lib/utils';
import type { RouteDoc, RouteRegion, RouteStatus, RouteFaq, LocationAlias } from '@/admin/types/routes';
import type { MediaDoc } from '@/admin/types/media';

const ALL_REGIONS: RouteRegion[] = [
  'Hải Phòng',
  'Hà Nội',
  'Hạ Long',
  'Móng Cái',
  'Bắc Ninh – Bắc Giang',
];

interface FormState {
  name: string;
  slug: string;
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  description: string;
  isBannerTop: boolean;
  bannerLabel: string;
  sortOrder: number;
  regions: RouteRegion[];
  status: RouteStatus;
  priceValidUntil: string;
  operatingHoursText: string;
  frequencyText: string;
  pricing: PricingTiersState;
  useCustomPricingHtml: boolean;
  customPricingHtml: string;
  customPricingCss: string;
  customPricingJs: string;
  thumbnail: MediaDoc | null;
  pickups: LocationAlias[];
  dropoffs: LocationAlias[];
  faqs: RouteFaq[];
  seo: {
    metaTitle: string;
    appendBrand: boolean;
    metaDescription: string;
    ogImage: MediaDoc | null;
    noindex: boolean;
  };
}

const initialFormState: FormState = {
  name: '',
  slug: '',
  origin: '',
  destination: '',
  distance: '',
  duration: '',
  description: '',
  isBannerTop: false,
  bannerLabel: '',
  sortOrder: 0,
  regions: ['Hải Phòng'],
  status: 'draft',
  priceValidUntil: '',
  operatingHoursText: '24/7',
  frequencyText: '30–60 phút / chuyến',
  pricing: {
    tierShare1: { min: null, max: null, from: false, negotiable: false },
    tierShare2: null,
    tierCharter45: null,
    tierCharter4to5: null,
    tierCharter7: null,
  },
  useCustomPricingHtml: false,
  customPricingHtml: '',
  customPricingCss: '',
  customPricingJs: '',
  thumbnail: null,
  pickups: [{ text: '' }],
  dropoffs: [{ text: '' }],
  faqs: [],
  seo: {
    metaTitle: '',
    appendBrand: true,
    metaDescription: '',
    ogImage: null,
    noindex: false,
  },
};

export function RouteForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isViewMode = searchParams.get('mode') === 'view' || location.pathname.endsWith('/view');
  const isEdit = Boolean(id && id !== 'new');

  const [form, setForm] = useState<FormState>(initialFormState);
  const [pricingTab, setPricingTab] = useState<'tiers' | 'html'>('tiers');
  const [initialRoute, setInitialRoute] = useState<RouteDoc | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Modals chọn ảnh
  const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);
  const [isOgMediaModalOpen, setIsOgMediaModalOpen] = useState(false);

  // Nạp dữ liệu khi chỉnh sửa
  const fetchRoute = useCallback(async () => {
    if (!id || id === 'new') return;
    try {
      setIsLoadingDoc(true);
      setApiError(null);
      const res = await apiClient.get<RouteDoc | { doc: RouteDoc }>(`/routes/${id}`);
      const doc = 'doc' in res.data ? res.data.doc : res.data;

      setInitialRoute(doc);

      // Trích xuất thumbnail
      const thumbnailObj =
        typeof doc.thumbnail === 'object' && doc.thumbnail !== null
          ? (doc.thumbnail as MediaDoc)
          : null;

      // Trích xuất ogImage
      const ogImgObj =
        typeof doc.seo?.ogImage === 'object' && doc.seo?.ogImage !== null
          ? (doc.seo.ogImage as MediaDoc)
          : null;

      const dateStr = doc.priceValidUntil ? doc.priceValidUntil.slice(0, 10) : '';

      setForm({
        name: doc.name || '',
        slug: doc.slug || '',
        origin: doc.origin || '',
        destination: doc.destination || '',
        distance: doc.distance || '',
        duration: doc.duration || '',
        description: doc.description || '',
        isBannerTop: Boolean(doc.isBannerTop),
        bannerLabel: doc.bannerLabel || '',
        sortOrder: doc.sortOrder ?? 0,
        regions: Array.isArray(doc.regions) ? doc.regions : [],
        status: doc.status || 'draft',
        priceValidUntil: dateStr,
        operatingHoursText: doc.operatingHoursText || '',
        frequencyText: doc.frequencyText || '',
        pricing: {
          tierShare1: doc.tierShare1 ?? null,
          tierShare2: doc.tierShare2 ?? null,
          tierCharter45: doc.tierCharter45 ?? doc.tierCharter4to5 ?? null,
          tierCharter4to5: doc.tierCharter45 ?? doc.tierCharter4to5 ?? null,
          tierCharter7: doc.tierCharter7 ?? null,
        },
        useCustomPricingHtml: Boolean(doc.useCustomPricingHtml),
        customPricingHtml: doc.customPricingHtml ?? '',
        customPricingCss: doc.customPricingCss ?? '',
        customPricingJs: doc.customPricingJs ?? '',
        thumbnail: thumbnailObj,
        pickups:
          Array.isArray(doc.pickups) && doc.pickups.length > 0
            ? doc.pickups
            : [{ text: '' }],
        dropoffs:
          Array.isArray(doc.dropoffs) && doc.dropoffs.length > 0
            ? doc.dropoffs
            : [{ text: '' }],
        faqs: Array.isArray(doc.faqs) ? doc.faqs : [],
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
      fetchRoute();
    }
  }, [isEdit, fetchRoute]);

  // Tự động sinh slug khi nhập tên tuyến ở chế độ tạo mới (nếu chưa sửa tay)
  const handleNameChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: !isSlugManuallyEdited && !isEdit ? slugify(val) : prev.slug,
    }));
    if (formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  const handleSlugSync = () => {
    if (form.name) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.name) }));
      setIsSlugManuallyEdited(true);
    }
  };

  // Cảnh báo 301 Redirect khi thay đổi slug của tuyến đang active
  const isSlugChangedOnActive = useMemo(() => {
    if (!isEdit || !initialRoute) return false;
    const wasActive = initialRoute.status === 'active';
    const slugChanged = Boolean(form.slug && initialRoute.slug && form.slug !== initialRoute.slug);
    return wasActive && slugChanged;
  }, [isEdit, initialRoute, form.slug]);

  // Toggle vùng miền
  const handleToggleRegion = (region: RouteRegion) => {
    setForm((prev) => {
      const exists = prev.regions.includes(region);
      const next = exists
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region];
      return { ...prev, regions: next };
    });
  };

  // Thêm / xóa điểm đón
  const handleAddPickup = () => {
    setForm((prev) => ({
      ...prev,
      pickups: [...prev.pickups, { text: '' }],
    }));
  };

  const handleUpdatePickup = (index: number, val: string) => {
    setForm((prev) => {
      const next = [...prev.pickups];
      next[index] = { ...next[index], text: val };
      return { ...prev, pickups: next };
    });
  };

  const handleRemovePickup = (index: number) => {
    setForm((prev) => ({
      ...prev,
      pickups: prev.pickups.filter((_, i) => i !== index),
    }));
  };

  // Thêm / xóa điểm trả
  const handleAddDropoff = () => {
    setForm((prev) => ({
      ...prev,
      dropoffs: [...prev.dropoffs, { text: '' }],
    }));
  };

  const handleUpdateDropoff = (index: number, val: string) => {
    setForm((prev) => {
      const next = [...prev.dropoffs];
      next[index] = { ...next[index], text: val };
      return { ...prev, dropoffs: next };
    });
  };

  const handleRemoveDropoff = (index: number) => {
    setForm((prev) => ({
      ...prev,
      dropoffs: prev.dropoffs.filter((_, i) => i !== index),
    }));
  };

  // Thêm / sửa / xóa FAQ
  const handleAddFaq = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }],
    }));
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', val: string) => {
    setForm((prev) => {
      const next = [...prev.faqs];
      next[index] = { ...next[index], [field]: val };
      return { ...prev, faqs: next };
    });
  };

  const handleRemoveFaq = (index: number) => {
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  // Validation form trước khi submit
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) {
      errors.name = 'Vui lòng nhập tên tuyến đường.';
    }

    if (!form.slug.trim()) {
      errors.slug = 'Vui lòng nhập slug cho tuyến đường.';
    }

    if (!form.origin.trim()) {
      errors.origin = 'Vui lòng nhập điểm đi (origin).';
    }

    if (!form.destination.trim()) {
      errors.destination = 'Vui lòng nhập điểm đến (destination).';
    }

    if (!form.description.trim()) {
      errors.description = 'Vui lòng nhập mô tả ngắn cho tuyến.';
    } else if (form.description.length > 300) {
      errors.description = 'Mô tả ngắn không được vượt quá 300 ký tự.';
    }

    // Bắt buộc theo constitution: priceValidUntil!
    if (!form.priceValidUntil.trim()) {
      errors.priceValidUntil =
        'Hạn áp dụng bảng giá (priceValidUntil) là trường bắt buộc theo hiến pháp dự án.';
    }

    // Bắt buộc ít nhất tierShare1 hoặc tierCharter45
    const s1 = form.pricing.tierShare1;
    const c45 = form.pricing.tierCharter45 ?? form.pricing.tierCharter4to5;
    const s1Valid = s1 && (s1.negotiable || (s1.min != null && s1.min > 0));
    const c45Valid = c45 && (c45.negotiable || (c45.min != null && c45.min > 0));

    if (!s1Valid && !c45Valid) {
      errors.pricing =
        'Cần ít nhất một mức giá hợp lệ cho "Xe ghép 1 người" hoặc "Bao xe 4-5 chỗ" (FR-D05).';
    }
    if (form.useCustomPricingHtml && !form.customPricingHtml.trim()) {
      errors.customPricingHtml = 'Vui lòng nhập HTML bảng giá trước khi kích hoạt.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (overrideStatus?: RouteStatus) => {
    if (!validateForm()) {
      const firstError = Object.values(formErrors)[0];
      setApiError(firstError || 'Vui lòng kiểm tra lại các trường thông tin bắt buộc.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError(null);

      const targetStatus = overrideStatus || form.status;
      const cleanPickups = form.pickups.filter((p) => p.text.trim());
      const cleanDropoffs = form.dropoffs.filter((d) => d.text.trim());
      const cleanFaqs = form.faqs.filter((f) => f.question.trim() && f.answer.trim());

      const computedPrice = computePriceFrom(form.pricing);
      const clearedTier = { min: null, max: null, from: false, negotiable: false };
      const tierShare1 = form.pricing.tierShare1 ?? (isEdit ? clearedTier : undefined);
      const tierShare2 = form.pricing.tierShare2 ?? (isEdit ? clearedTier : undefined);
      const tierCharter45 =
        form.pricing.tierCharter45 ??
        form.pricing.tierCharter4to5 ??
        (isEdit ? clearedTier : undefined);
      const tierCharter7 = form.pricing.tierCharter7 ?? (isEdit ? clearedTier : undefined);

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        distance: form.distance.trim() || null,
        duration: form.duration.trim() || null,
        description: form.description.trim(),
        isBannerTop: Boolean(form.isBannerTop),
        bannerLabel: form.bannerLabel.trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
        regions: form.regions,
        status: targetStatus,
        priceValidUntil: form.priceValidUntil,
        operatingHoursText: form.operatingHoursText.trim() || null,
        frequencyText: form.frequencyText.trim() || null,
        ...(tierShare1 ? { tierShare1 } : {}),
        ...(tierShare2 ? { tierShare2 } : {}),
        ...(tierCharter45 ? { tierCharter45 } : {}),
        ...(tierCharter7 ? { tierCharter7 } : {}),
        useCustomPricingHtml: form.useCustomPricingHtml,
        customPricingHtml: form.customPricingHtml,
        customPricingCss: form.customPricingCss,
        customPricingJs: form.customPricingJs,
        priceFrom: computedPrice,
        thumbnail: form.thumbnail ? form.thumbnail.id : null,
        pickups: cleanPickups,
        dropoffs: cleanDropoffs,
        faqs: cleanFaqs,
        seo: {
          metaTitle: form.seo.metaTitle.trim() || null,
          appendBrand: form.seo.appendBrand ?? true,
          metaDescription: form.seo.metaDescription.trim() || null,
          ogImage: form.seo.ogImage ? form.seo.ogImage.id : null,
          noindex: Boolean(form.seo.noindex),
        },
      };

      if (isEdit) {
        await apiClient.patch(`/routes/${id}`, payload);
      } else {
        await apiClient.post('/routes', payload);
      }

      navigate('/routes');
    } catch (err) {
      setApiError(getApiErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingDoc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-400">Đang tải dữ liệu tuyến đường...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16" data-testid="route-form-page">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/routes"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title="Quay lại danh sách tuyến"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {isViewMode
                  ? 'Chi tiết tuyến đường'
                  : isEdit
                  ? 'Chỉnh sửa tuyến đường'
                  : 'Thêm tuyến đường mới'}
              </h1>
              <Badge variant={form.status === 'active' ? 'success' : 'secondary'} size="sm">
                {form.status === 'active' ? 'Hoạt động' : form.status === 'draft' ? 'Bản nháp' : 'Lưu trữ'}
              </Badge>
              {isViewMode && (
                <Badge variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                  Chế độ xem
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isViewMode
                ? `ID: #${id} — Xem chi tiết cấu hình giá cước và thông tin tuyến đường`
                : isEdit
                ? `ID: #${id} — Cập nhật cấu hình bảng giá và thông tin tuyến`
                : 'Thiết lập đầy đủ thông tin cước và SEO cho tuyến liên tỉnh'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isViewMode ? (
            <Button
              type="button"
              variant="default"
              onClick={() => {
                setSearchParams({});
                navigate(`/routes/${id}`);
              }}
              className="cursor-pointer shadow-md shadow-blue-500/20"
              data-testid="switch-to-edit-btn"
            >
              <Edit className="w-4 h-4 mr-1.5" />
              <span>Chỉnh sửa tuyến này</span>
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="cursor-pointer"
                data-testid="save-draft-btn"
              >
                <Save className="w-4 h-4 mr-1.5" />
                <span>Lưu nháp</span>
              </Button>

              <Button
                type="button"
                variant="default"
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="cursor-pointer shadow-md shadow-blue-500/20"
                data-testid="save-route-btn"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-1.5" />
                )}
                <span>{isEdit ? 'Cập nhật tuyến' : 'Tạo tuyến đường'}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {apiError && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <div className="flex-1">{apiError}</div>
          <button
            onClick={() => setApiError(null)}
            className="text-xs underline text-red-400 hover:text-red-300 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* CẢNH BÁO REDIRECT 301 NẾU ĐỔI SLUG CỦA TUYẾN ACTIVE */}
      {!isViewMode && isSlugChangedOnActive && (
        <div
          className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-sm"
          data-testid="slug-redirect-warning"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-amber-300">
              Cảnh báo tự động tạo chuyển hướng 301 (Redirects)
            </h4>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              Tuyến này đang ở trạng thái <strong>Hoạt động (active)</strong>. Khi lưu với slug mới (
              <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300 font-mono">
                /{form.slug}
              </code>
              ), hệ thống sẽ tự động tạo chuyển hướng 301 vĩnh viễn từ{' '}
              <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300 font-mono">
                /tuyen-lien-tinh/{initialRoute?.slug}
              </code>{' '}
              sang slug mới để không làm đứt gãy link SEO của khách hàng.
            </p>
          </div>
        </div>
      )}

      {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
      <Card className="p-6 space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
          Thông tin cơ bản tuyến đường
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tên tuyến */}
          <div>
            <Input
              label="Tên tuyến đường *"
              placeholder="Ví dụ: Hải Phòng ⇄ Hà Nội"
              value={form.name}
              disabled={isViewMode}
              onChange={(e) => handleNameChange(e.target.value)}
              error={formErrors.name}
              data-testid="route-name-input"
            />
          </div>

          {/* Slug */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Đường dẫn Slug *</label>
              {!isViewMode && (
                <button
                  type="button"
                  onClick={handleSlugSync}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  title="Đồng bộ slug từ tên tuyến"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Sinh lại slug</span>
                </button>
              )}
            </div>
            <Input
              placeholder="hai-phong-ha-noi"
              value={form.slug}
              disabled={isViewMode}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, slug: e.target.value }));
                setIsSlugManuallyEdited(true);
                if (formErrors.slug) setFormErrors((prev) => ({ ...prev, slug: '' }));
              }}
              error={formErrors.slug}
              data-testid="route-slug-input"
            />
          </div>

          {/* Điểm đi */}
          <div>
            <Input
              label="Điểm đi (Origin) *"
              placeholder="Ví dụ: Hải Phòng"
              value={form.origin}
              disabled={isViewMode}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, origin: e.target.value }));
                if (formErrors.origin) setFormErrors((prev) => ({ ...prev, origin: '' }));
              }}
              error={formErrors.origin}
              data-testid="route-origin-input"
            />
          </div>

          {/* Điểm đến */}
          <div>
            <Input
              label="Điểm đến (Destination) *"
              placeholder="Ví dụ: Hà Nội"
              value={form.destination}
              disabled={isViewMode}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, destination: e.target.value }));
                if (formErrors.destination) setFormErrors((prev) => ({ ...prev, destination: '' }));
              }}
              error={formErrors.destination}
              data-testid="route-destination-input"
            />
          </div>

          {/* Cự ly */}
          <div>
            <Input
              label="Cự ly khoảng cách (km)"
              placeholder="Ví dụ: 120 km hoặc 105 - 120 km"
              value={form.distance}
              disabled={isViewMode}
              onChange={(e) => setForm((prev) => ({ ...prev, distance: e.target.value }))}
              data-testid="route-distance-input"
            />
          </div>

          {/* Thời gian di chuyển */}
          <div>
            <Input
              label="Thời gian di chuyển ước tính"
              placeholder="Ví dụ: 1 giờ 30 phút hoặc 90 phút"
              value={form.duration}
              disabled={isViewMode}
              onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
              data-testid="route-duration-input"
            />
          </div>
        </div>

        {/* Mô tả ngắn */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-700">
              Mô tả ngắn tuyến (Tối đa 300 ký tự) *
            </label>
            <span
              className={`text-[11px] font-mono ${
                form.description.length > 300 ? 'text-red-500 font-bold' : 'text-slate-500'
              }`}
            >
              {form.description.length}/300
            </span>
          </div>
          <Textarea
            rows={3}
            placeholder="Mô tả hero tuyến, lộ trình cao tốc, điểm nhấn dịch vụ..."
            value={form.description}
            disabled={isViewMode}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, description: e.target.value }));
              if (formErrors.description) setFormErrors((prev) => ({ ...prev, description: '' }));
            }}
            error={formErrors.description}
            data-testid="route-description-input"
          />
        </div>
      </Card>

      {/* KHỐI 2: BANNER TOP, THỨ TỰ & VÙNG MIỀN */}
      <Card className="p-6 space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
          Hiển thị Banner Top & Khu vực
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Checkbox Banner Top */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="route-is-banner-top"
              checked={form.isBannerTop}
              disabled={isViewMode}
              onChange={(e) => setForm((prev) => ({ ...prev, isBannerTop: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
              data-testid="route-is-banner-top-checkbox"
            />
            <label htmlFor="route-is-banner-top" className="text-xs text-slate-800 font-medium cursor-pointer select-none">
              Ghim Banner Top trang chủ
            </label>
          </div>

          {/* Nhãn banner */}
          <div>
            <Input
              label="Nhãn hiển thị Banner"
              placeholder="Để trống = lấy theo tên tuyến"
              value={form.bannerLabel}
              disabled={isViewMode}
              onChange={(e) => setForm((prev) => ({ ...prev, bannerLabel: e.target.value }))}
              data-testid="route-banner-label-input"
            />
          </div>

          {/* Thứ tự sắp xếp */}
          <div>
            <Input
              label="Thứ tự sắp xếp (sortOrder)"
              type="number"
              placeholder="0"
              value={form.sortOrder}
              disabled={isViewMode}
              onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) || 0 }))}
              data-testid="route-sort-order-input"
            />
          </div>
        </div>

        {/* Vùng miền chọn nhiều */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">
            Khu vực khai thác (Dùng cho tab lọc khu vực)
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_REGIONS.map((region) => {
              const isSelected = form.regions.includes(region);
              return (
                <button
                  key={region}
                  type="button"
                  disabled={isViewMode}
                  onClick={() => !isViewMode && handleToggleRegion(region)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  } ${isViewMode ? 'cursor-default opacity-85' : 'cursor-pointer'}`}
                  data-testid={`region-pill-${region}`}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* KHỐI 3: TRẠNG THÁI & HẠN ÁP DỤNG BẢNG GIÁ */}
      <Card className="p-6 space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
          Trạng thái & Hiệu lực bảng giá
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Trạng thái */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Trạng thái tuyến đường
            </label>
            <Select
              value={form.status}
              disabled={isViewMode}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as RouteStatus }))}
              options={[
                { value: 'active', label: 'Hoạt động (Active)' },
                { value: 'draft', label: 'Bản nháp (Draft)' },
                { value: 'archived', label: 'Lưu trữ (Archived)' },
                { value: 'inactive', label: 'Tạm dừng (Inactive)' },
              ]}
              data-testid="route-status-select"
            />
          </div>

          {/* Hạn áp dụng bảng giá (priceValidUntil) - BẮT BUỘC THEO CONSTITUTION */}
          <div>
            <Input
              label="Hạn áp dụng bảng giá (Bắt buộc) *"
              type="date"
              value={form.priceValidUntil}
              disabled={isViewMode}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, priceValidUntil: e.target.value }));
                if (formErrors.priceValidUntil) {
                  setFormErrors((prev) => ({ ...prev, priceValidUntil: '' }));
                }
              }}
              error={formErrors.priceValidUntil}
              data-testid="route-price-valid-until-input"
            />
          </div>

          {/* Giờ hoạt động */}
          <div>
            <Input
              label="Giờ hoạt động"
              placeholder="VD: 24/7 hoặc 05:00 - 22:00"
              value={form.operatingHoursText}
              disabled={isViewMode}
              onChange={(e) => setForm((prev) => ({ ...prev, operatingHoursText: e.target.value }))}
              data-testid="route-operating-hours-input"
            />
          </div>
        </div>

        {/* Tần suất chuyến */}
        <div>
          <Input
            label="Tần suất khai thác chuyến"
            placeholder="VD: 30 - 60 phút / chuyến"
            value={form.frequencyText}
            disabled={isViewMode}
            onChange={(e) => setForm((prev) => ({ ...prev, frequencyText: e.target.value }))}
            data-testid="route-frequency-input"
          />
        </div>
      </Card>

      {/* KHỐI 4: CẤU HÌNH 4 HẠNG VÉ (PRICING TIERS SECTION) */}
      <Card className="p-6">
        <div role="tablist" aria-label="Cách nhập bảng giá" className="flex gap-2 border-b border-slate-200 mb-5">
          <button
            type="button"
            role="tab"
            aria-selected={pricingTab === 'tiers'}
            onClick={() => setPricingTab('tiers')}
            className={`px-4 py-2 text-sm font-semibold cursor-pointer ${pricingTab === 'tiers' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-600'}`}
          >
            Mức giá
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pricingTab === 'html'}
            onClick={() => setPricingTab('html')}
            className={`px-4 py-2 text-sm font-semibold cursor-pointer ${pricingTab === 'html' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-600'}`}
          >
            HTML, CSS & JS bảng giá
          </button>
        </div>
        <div hidden={pricingTab !== 'tiers'}>
          <PricingTiersSection
            value={form.pricing}
            readOnly={isViewMode}
            onChange={(newPricing) => {
              setForm((prev) => ({ ...prev, pricing: newPricing }));
              if (formErrors.pricing) {
                setFormErrors((prev) => ({ ...prev, pricing: '' }));
              }
            }}
            error={formErrors.pricing}
          />
        </div>
        {pricingTab === 'html' && (
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={form.useCustomPricingHtml}
                disabled={isViewMode}
                onChange={(e) => setForm((prev) => ({ ...prev, useCustomPricingHtml: e.target.checked }))}
                data-testid="route-custom-pricing-active"
              />
              Kích hoạt HTML tùy chỉnh cho “Bảng Giá Chi Tiết Tuyến”
            </label>
            <p className="text-xs text-slate-500">Giá các hạng vé vẫn được lưu để dùng ở các vị trí khác. HTML chỉ thay bảng giá chi tiết trên trang tuyến. Nhấn Lưu tuyến để áp dụng thay đổi lên website.</p>
            <Textarea
              label="HTML bảng giá"
              value={form.customPricingHtml}
              disabled={isViewMode}
              onChange={(e) => setForm((prev) => ({ ...prev, customPricingHtml: e.target.value }))}
              rows={12}
              placeholder={'<div class="price-table"><button type="button" id="price-tab">Xem giá</button><span id="price">300.000đ</span></div>'}
              error={formErrors.customPricingHtml}
              data-testid="route-custom-pricing-html"
            />
            <p className="text-xs text-slate-500">Nhập HTML thuần với <code>class</code>, <code>id</code> và <code>data-*</code>. <code>className</code> sẽ được đổi thành <code>class</code>; tiêu đề <code>h1</code>/<code>h2</code> được đổi thành <code>h3</code> để giữ cấu trúc SEO của trang. Mã JSX và <code>onClick</code> không chạy trong ô này.</p>
            <Textarea
              label="CSS bảng giá"
              value={form.customPricingCss}
              disabled={isViewMode}
              onChange={(e) => setForm((prev) => ({ ...prev, customPricingCss: e.target.value }))}
              rows={10}
              maxLength={30000}
              placeholder={'.price-table { display: grid; gap: 12px; background: #fff5f5; }\n@media (max-width: 640px) { .price-table { display: block; } }'}
              data-testid="route-custom-pricing-css"
            />
            <p className="text-xs text-slate-500">Dùng class trong HTML để viết CSS; <code>:scope</code> hoặc <code>:root</code> chọn khung bảng giá. Viết <code>display: none</code> không có dấu nháy. CSS tự giới hạn trong khu vực này; import và URL bên ngoài bị loại. Khi dùng JS, bảng giá chạy trong iframe riêng và không nạp stylesheet Tailwind của website; hãy viết quy tắc CSS ở ô này.</p>
            <Textarea
              label="JavaScript bảng giá"
              value={form.customPricingJs}
              disabled={isViewMode}
              onChange={(e) => setForm((prev) => ({ ...prev, customPricingJs: e.target.value }))}
              rows={10}
              maxLength={30000}
              placeholder={'document.querySelector("#price-tab")?.addEventListener("click", () => { document.querySelector("#price").textContent = "600.000đ"; });'}
              data-testid="route-custom-pricing-js"
            />
            <p className="text-xs text-slate-500">Nhập JavaScript thuần, không bọc thẻ <code>&lt;script&gt;</code>, không dán JSX, import hoặc React component. JS chạy trong khung riêng khi bật HTML tùy chỉnh và đã lưu tuyến. Có thể xử lý sự kiện, đổi nội dung bảng giá trong khung; không truy cập trang chính. Fetch/XHR và tài nguyên ngoài bị chặn.</p>
          </div>
        )}
      </Card>

      {/* KHỐI 5: ẢNH THUMBNAIL ĐẠI DIỆN */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
          Ảnh thumbnail đại diện tuyến
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {form.thumbnail ? (
            <div className="relative group w-40 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
              <img
                src={form.thumbnail.url || ''}
                alt={form.thumbnail.alt || 'Ảnh đại diện tuyến'}
                className="w-full h-full object-cover"
              />
              {!isViewMode && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, thumbnail: null }))}
                  className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-lg transition cursor-pointer"
                  title="Gỡ ảnh"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-40 h-28 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 shrink-0">
              <ImageIcon className="w-6 h-6 mb-1" />
              <span className="text-[11px]">Chưa chọn ảnh</span>
            </div>
          )}

          <div className="space-y-1.5">
            {!isViewMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsThumbnailModalOpen(true)}
                data-testid="choose-thumbnail-btn"
                className="cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 mr-1.5" />
                <span>{form.thumbnail ? 'Đổi ảnh đại diện' : 'Chọn ảnh đại diện'}</span>
              </Button>
            )}
            <p className="text-xs text-slate-500">
              Ảnh hiển thị trên thẻ card tuyến ở trang chủ và danh mục tuyến liên tỉnh.
            </p>
          </div>
        </div>
      </Card>

      {/* KHỐI 6: ĐIỂM ĐÓN & ĐIỂM TRẢ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Điểm đón */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                Danh sách điểm đón (Pickups)
              </h3>
              <p className="text-[11px] text-slate-500">Mỗi dòng là một địa danh đón cụ thể</p>
            </div>
            {!isViewMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPickup}
                data-testid="add-pickup-btn"
                className="text-xs h-7 px-2 cursor-pointer"
              >
                <Plus className="w-3 h-3 mr-1" />
                Thêm
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {form.pickups.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder="Ví dụ: Bến xe Niệm Nghĩa, Sân bay Cát Bi..."
                  value={p.text}
                  disabled={isViewMode}
                  onChange={(e) => handleUpdatePickup(idx, e.target.value)}
                  data-testid={`pickup-input-${idx}`}
                />
                {!isViewMode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePickup(idx)}
                    className="text-slate-400 hover:text-rose-600 p-2 h-auto cursor-pointer"
                    title="Xóa điểm đón"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Điểm trả */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                Danh sách điểm trả (Dropoffs)
              </h3>
              <p className="text-[11px] text-slate-500">Mỗi dòng là một địa danh trả cụ thể</p>
            </div>
            {!isViewMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDropoff}
                data-testid="add-dropoff-btn"
                className="text-xs h-7 px-2 cursor-pointer"
              >
                <Plus className="w-3 h-3 mr-1" />
                Thêm
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {form.dropoffs.map((d, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder="Ví dụ: Bến xe Mỹ Đình, Sân bay Nội Bài..."
                  value={d.text}
                  disabled={isViewMode}
                  onChange={(e) => handleUpdateDropoff(idx, e.target.value)}
                  data-testid={`dropoff-input-${idx}`}
                />
                {!isViewMode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDropoff(idx)}
                    className="text-slate-400 hover:text-rose-400 p-2 h-auto cursor-pointer"
                    title="Xóa điểm trả"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* KHỐI 7: CÂU HỎI THƯỜNG GẶP (FAQS) */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
              Câu hỏi thường gặp (FAQs)
            </h3>
            <p className="text-[11px] text-slate-500">
              Các câu hỏi và giải đáp xuất hiện trên trang chi tiết tuyến đường để tối ưu SEO Rich Snippets.
            </p>
          </div>
          {!isViewMode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddFaq}
              data-testid="add-faq-btn"
              className="text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Thêm câu hỏi</span>
            </Button>
          )}
        </div>

        {form.faqs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
            Chưa có câu hỏi thường gặp nào cho tuyến này.
          </div>
        ) : (
          <div className="space-y-4">
            {form.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                data-testid={`faq-item-${idx}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600">
                    Câu hỏi #{idx + 1}
                  </span>
                  {!isViewMode && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFaq(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 h-auto cursor-pointer"
                      title="Xóa câu hỏi này"
                      data-testid={`remove-faq-${idx}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <Input
                  label="Câu hỏi"
                  placeholder="Ví dụ: Xe đón trả tận nơi hay đón tại bến?"
                  value={faq.question}
                  disabled={isViewMode}
                  onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                  data-testid={`faq-question-${idx}`}
                />

                <Textarea
                  rows={2}
                  label="Câu trả lời"
                  placeholder="Ví dụ: Nhà xe đón trả tận nơi trong nội thành Hải Phòng và trả tại điểm yêu cầu..."
                  value={faq.answer}
                  disabled={isViewMode}
                  onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                  data-testid={`faq-answer-${idx}`}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* KHỐI 8: CẤU HÌNH SEO & XEM TRƯỚC */}
      <div className="space-y-4">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
            Cấu hình SEO & Chia sẻ Mạng xã hội
          </h3>

          <div className="space-y-4">
            {/* Meta Title */}
            <div>
              <Input
                label="Tiêu đề SEO (Meta Title - Tối ưu 50–70 ký tự)"
                placeholder={form.name ? `Xe Ghép ${form.name} Giá Rẻ` : 'Tiêu đề SEO trang tuyến'}
                value={form.seo.metaTitle}
                disabled={isViewMode}
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
                id="route-append-brand"
                checked={form.seo.appendBrand}
                disabled={isViewMode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, appendBrand: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
              />
              <label htmlFor="route-append-brand" className="text-xs text-slate-600 cursor-pointer">
                Tự động nối thương hiệu &ldquo; | Xe Ghép Liên Tỉnh&rdquo; vào cuối tiêu đề SEO.
              </label>
            </div>

            {/* Meta Description */}
            <div>
              <Textarea
                rows={3}
                label="Mô tả SEO (Meta Description - Tối ưu 120–160 ký tự)"
                placeholder={form.description || 'Mô tả tóm tắt dịch vụ đón trả tận nơi, giá cước, lịch trình...'}
                value={form.seo.metaDescription}
                disabled={isViewMode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, metaDescription: e.target.value },
                  }))
                }
                data-testid="seo-description-input"
              />
            </div>

            {/* OG Image */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                {form.seo.ogImage ? (
                  <img
                    src={form.seo.ogImage.url || ''}
                    alt={form.seo.ogImage.alt || 'OG Image'}
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {form.seo.ogImage ? form.seo.ogImage.filename : 'Chưa có ảnh OG chia sẻ riêng'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {form.seo.ogImage ? 'Đã cài đặt ảnh riêng' : 'Mặc định lấy theo ảnh thumbnail tuyến'}
                  </span>
                </div>
              </div>

              {!isViewMode && (
                <div className="flex items-center gap-2">
                  {form.seo.ogImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, seo: { ...prev.seo, ogImage: null } }))
                      }
                      className="text-xs text-slate-500 hover:text-rose-600 p-1.5 h-auto cursor-pointer"
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
              )}
            </div>

            {/* Checkbox Noindex */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="route-noindex"
                checked={form.seo.noindex}
                disabled={isViewMode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, noindex: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer disabled:cursor-not-allowed"
              />
              <label htmlFor="route-noindex" className="text-xs text-rose-600 cursor-pointer">
                Chặn công cụ tìm kiếm lập chỉ mục tuyến này (noindex - loại khỏi sitemap.xml).
              </label>
            </div>
          </div>
        </Card>

        {/* Khung SeoPreview tích hợp */}
        <SeoPreview
          title={form.seo.metaTitle || form.name}
          description={form.seo.metaDescription || form.description}
          slug={form.slug}
          prefix="tuyen-lien-tinh"
          ogImage={form.seo.ogImage?.url || form.thumbnail?.url || undefined}
          appendBrand={form.seo.appendBrand}
        />
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-5">
        <Link
          to="/routes"
          className="text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách tuyến</span>
        </Link>

        {isViewMode ? (
          <Button
            type="button"
            variant="default"
            onClick={() => {
              setSearchParams({});
              navigate(`/routes/${id}`);
            }}
            className="cursor-pointer shadow-md shadow-blue-500/20"
            data-testid="bottom-switch-to-edit-btn"
          >
            <Edit className="w-4 h-4 mr-1.5" />
            <span>Chuyển sang Chỉnh sửa</span>
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              <Save className="w-4 h-4 mr-1.5" />
              <span>Lưu nháp</span>
            </Button>

            <Button
              type="button"
              variant="default"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="cursor-pointer shadow-md shadow-blue-500/20"
              data-testid="submit-bottom-btn"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-1.5" />
              )}
              <span>{isEdit ? 'Cập nhật tuyến' : 'Tạo tuyến đường'}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Media Picker cho Thumbnail */}
      <MediaPickerModal
        isOpen={isThumbnailModalOpen}
        onClose={() => setIsThumbnailModalOpen(false)}
        onSelect={(media) => {
          setForm((prev) => ({ ...prev, thumbnail: media }));
        }}
        selectedId={form.thumbnail?.id}
        title="Chọn ảnh thumbnail đại diện tuyến"
      />

      {/* Media Picker cho OG Image */}
      <MediaPickerModal
        isOpen={isOgMediaModalOpen}
        onClose={() => setIsOgMediaModalOpen(false)}
        onSelect={(media) => {
          setForm((prev) => ({ ...prev, seo: { ...prev.seo, ogImage: media } }));
        }}
        selectedId={form.seo.ogImage?.id}
        title="Chọn ảnh chia sẻ MXH (OG Image) cho tuyến"
      />
    </div>
  );
}

export default RouteForm;
