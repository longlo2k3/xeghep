import { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
  Building2,
  Phone,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Megaphone,
} from 'lucide-react';
import { COMPANY_INFO } from '@/data/company-info';
import { Button } from '@/admin/components/ui/Button';
import { Input } from '@/admin/components/ui/Input';
import { Textarea } from '@/admin/components/ui/Textarea';
import { Select } from '@/admin/components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/admin/components/ui/Card';
import { MediaPickerModal } from '@/admin/components/common/MediaPickerModal';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import type { MediaDoc } from '@/admin/types/media';
import type {
  CompanySettings,
  CompanyCommitment,
  CompanyPaymentMethod,
  CompanyTestimonial,
  CommitmentIcon,
  PaymentMethodIcon,
  AreaServedItem,
} from '@/admin/types/settings';

const resolveMediaDoc = (value: MediaDoc | number | null | undefined): MediaDoc | null =>
  value && typeof value === 'object' ? value : null;

const resolveMediaId = (value: MediaDoc | number | null | undefined): number | null =>
  value == null ? null : typeof value === 'object' ? value.id : value;

const COMMITMENT_ICONS: { label: string; value: CommitmentIcon }[] = [
  { label: 'ShieldCheck (Bảo đảm an toàn)', value: 'ShieldCheck' },
  { label: 'MapPin (Điểm đón chuẩn xác)', value: 'MapPin' },
  { label: 'Users (Tài xế chuyên nghiệp)', value: 'Users' },
  { label: 'BadgePercent (Giá cả minh bạch)', value: 'BadgePercent' },
  { label: 'Clock (Đúng giờ tuyệt đối)', value: 'Clock' },
  { label: 'Award (Chất lượng 5 sao)', value: 'Award' },
];

const PAYMENT_ICONS: { label: string; value: PaymentMethodIcon }[] = [
  { label: 'Banknote (Tiền mặt)', value: 'Banknote' },
  { label: 'CreditCard (Thẻ ngân hàng / POS)', value: 'CreditCard' },
  { label: 'Smartphone (Chuyển khoản Banking)', value: 'Smartphone' },
  { label: 'QrCode (Quét mã QR Code)', value: 'QrCode' },
  { label: 'Wallet (Ví điện tử)', value: 'Wallet' },
  { label: 'CheckCircle (Thanh toán sau)', value: 'CheckCircle' },
];

const DEFAULT_COMMITMENTS: CompanyCommitment[] = [
  {
    title: 'Đúng giờ, đón tận nơi',
    description: 'Tài xế có mặt trước 10 phút, hỗ trợ hành lý chu đáo tận cửa.',
    iconName: 'Clock',
  },
  {
    title: 'Giá cước trọn gói, niêm yết',
    description: 'Không phát sinh phụ phí ẩn, đã bao gồm phí cầu đường bến bãi theo thỏa thuận.',
    iconName: 'BadgePercent',
  },
  {
    title: 'Xe đời mới sạch sẽ',
    description: '100% dòng xe đời mới từ 2020 trở lên, máy lạnh êm ái, bảo dưỡng định kỳ.',
    iconName: 'ShieldCheck',
  },
  {
    title: 'Lái xe văn minh, an toàn',
    description: 'Đội ngũ tài xế nhiều năm kinh nghiệm chạy tuyến, lịch sự và cẩn thận.',
    iconName: 'Users',
  },
  {
    title: 'Hỗ trợ tổng đài 24/7',
    description: 'Hotline điều hành tiếp nhận yêu cầu đặt xe và hỗ trợ khẩn cấp mọi lúc.',
    iconName: 'Award',
  },
  {
    title: 'Đón trả linh hoạt',
    description: 'Phục vụ đón trả tại tất cả các quận nội thành Hà Nội và điểm theo yêu cầu.',
    iconName: 'MapPin',
  },
];

const DEFAULT_PAYMENT_METHODS: CompanyPaymentMethod[] = [
  {
    title: 'Tiền mặt cho tài xế',
    description: 'Thanh toán trực tiếp bằng tiền mặt sau khi kết thúc chuyến đi an toàn.',
    iconName: 'Banknote',
  },
  {
    title: 'Chuyển khoản ngân hàng 24/7',
    description: 'Quét mã QR hoặc chuyển khoản qua tài khoản ngân hàng chính thức của công ty.',
    iconName: 'Smartphone',
  },
  {
    title: 'Hóa đơn VAT điện tử',
    description: 'Hỗ trợ xuất hóa đơn VAT theo yêu cầu cho khách hàng doanh nghiệp.',
    iconName: 'CheckCircle',
  },
];

export function CompanySettingsForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState('Công ty Cổ phần Vận tải Xe Ghép Liên Tỉnh');
  const [brandName, setBrandName] = useState('Xe Ghép Liên Tỉnh');
  const [website, setWebsite] = useState(COMPANY_INFO.website);
  const [taxCode, setTaxCode] = useState('0109876543');

  const [hotline, setHotline] = useState('0962.298.293');
  const [hotlineRaw, setHotlineRaw] = useState('0962298293');
  const [secondaryLabel, setSecondaryLabel] = useState('Tổng đài hỗ trợ đêm');
  const [secondaryNumber, setSecondaryNumber] = useState('0858.911.247');
  const [email, setEmail] = useState(COMPANY_INFO.email);
  const [zaloUrl, setZaloUrl] = useState('https://zalo.me/0962298293');
  const [fanpageName, setFanpageName] = useState('Xe Ghép Liên Tỉnh');
  const [fanpageUrl, setFanpageUrl] = useState('https://facebook.com/xegheplientinh');

  const [address, setAddress] = useState('Số 12 Khuất Duy Tiến, Thanh Xuân, Hà Nội');

  const [topBannerLine1, setTopBannerLine1] = useState(COMPANY_INFO.topBannerLine1);
  const [topBannerLine2, setTopBannerLine2] = useState(COMPANY_INFO.topBannerLine2);
  const [heroImageMedia, setHeroImageMedia] = useState<MediaDoc | number | null>(null);
  const [heroTitleLine1, setHeroTitleLine1] = useState(COMPANY_INFO.heroTitleLine1);
  const [heroTitleLine2, setHeroTitleLine2] = useState(COMPANY_INFO.heroTitleLine2);
  const [heroDescription, setHeroDescription] = useState(COMPANY_INFO.heroDescription);
  const [heroBenefit1, setHeroBenefit1] = useState(COMPANY_INFO.heroBenefit1);
  const [heroBenefit2, setHeroBenefit2] = useState(COMPANY_INFO.heroBenefit2);
  const [heroBenefit3, setHeroBenefit3] = useState(COMPANY_INFO.heroBenefit3);
  const [coverage, setCoverage] = useState(COMPANY_INFO.coverage);
  const [workingHours, setWorkingHours] = useState(COMPANY_INFO.workingHours);
  const [fleetDescription, setFleetDescription] = useState(COMPANY_INFO.fleetDescription);
  const [bookingPromise, setBookingPromise] = useState(COMPANY_INFO.bookingPromise);
  const [summary, setSummary] = useState(COMPANY_INFO.summary);

  const [logoMedia, setLogoMedia] = useState<MediaDoc | number | null>(null);
  const [ogImageMedia, setOgImageMedia] = useState<MediaDoc | number | null>(null);
  const [brandAreaServed, setBrandAreaServed] = useState<AreaServedItem[] | null>(null);
  const [priceRange, setPriceRange] = useState('');
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isOgImageModalOpen, setIsOgImageModalOpen] = useState(false);
  const [isHeroImageModalOpen, setIsHeroImageModalOpen] = useState(false);

  const [commitments, setCommitments] = useState<CompanyCommitment[]>(DEFAULT_COMMITMENTS);
  const [paymentMethods, setPaymentMethods] = useState<CompanyPaymentMethod[]>(DEFAULT_PAYMENT_METHODS);
  const [testimonials, setTestimonials] = useState<CompanyTestimonial[]>([
    {
      author: 'Nguyễn Văn Hùng',
      location: 'Cầu Giấy, Hà Nội',
      content: 'Chuyến xe rất đúng giờ, tài xế lái xe cẩn thận và nhiệt tình. Xe mới sạch sẽ, giá cả hợp lý.',
      rating: 5,
      isVisible: true,
    },
    {
      author: 'Trần Thị Mai',
      location: 'TP. Thái Nguyên',
      content: 'Đặt xe đi sân bay Nội Bài lúc sáng sớm rất an tâm. Bác tài gọi điện trước 15 phút, dịch vụ chu đáo.',
      rating: 5,
      isVisible: true,
    },
  ]);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get<CompanySettings>('/globals/company_settings');
      const data = res.data;
      if (data) {
        if (data.identity) {
          setCompanyName(data.identity.companyName || '');
          setBrandName(data.identity.brandName || '');
          setWebsite(data.identity.website || '');
          if (data.identity.taxCode) setTaxCode(data.identity.taxCode);
        }
        if (data.contact) {
          setHotline(data.contact.hotline || '');
          setHotlineRaw(data.contact.hotlineRaw || '');
          setEmail(data.contact.email || '');
          setZaloUrl(data.contact.zaloUrl || '');
          setFanpageName(data.contact.fanpageName || '');
          setFanpageUrl(data.contact.fanpageUrl || '');
          if (data.contact.secondaryPhone) {
            setSecondaryLabel(data.contact.secondaryPhone.label || '');
            setSecondaryNumber(data.contact.secondaryPhone.number || '');
          }
        }
        if (data.location?.address) {
          setAddress(data.location.address);
        }
        if (data.banner) {
          if (data.banner.topBannerLine1 != null) setTopBannerLine1(data.banner.topBannerLine1);
          if (data.banner.topBannerLine2 != null) setTopBannerLine2(data.banner.topBannerLine2);
          setHeroImageMedia(data.banner.heroImage ?? null);
          if (data.banner.heroTitleLine1 != null) setHeroTitleLine1(data.banner.heroTitleLine1);
          if (data.banner.heroTitleLine2 != null) setHeroTitleLine2(data.banner.heroTitleLine2);
          if (data.banner.heroDescription != null) setHeroDescription(data.banner.heroDescription);
          if (data.banner.heroBenefit1 != null) setHeroBenefit1(data.banner.heroBenefit1);
          if (data.banner.heroBenefit2 != null) setHeroBenefit2(data.banner.heroBenefit2);
          if (data.banner.heroBenefit3 != null) setHeroBenefit3(data.banner.heroBenefit3);
          if (data.banner.coverage != null) setCoverage(data.banner.coverage);
          if (data.banner.workingHours != null) setWorkingHours(data.banner.workingHours);
          if (data.banner.fleetDescription != null) setFleetDescription(data.banner.fleetDescription);
          if (data.banner.bookingPromise != null) setBookingPromise(data.banner.bookingPromise);
          if (data.banner.summary != null) setSummary(data.banner.summary);
        }
        if (data.brandSeo) {
          setLogoMedia(data.brandSeo.logo ?? null);
          setOgImageMedia(data.brandSeo.defaultOgImage ?? null);
          setBrandAreaServed(data.brandSeo.areaServed ?? null);
          setPriceRange(data.brandSeo.priceRange || '');
        }
        if (data.commitments && data.commitments.length > 0) {
          setCommitments(data.commitments);
        }
        if (data.paymentMethods && data.paymentMethods.length > 0) {
          setPaymentMethods(data.paymentMethods);
        }
        if (data.testimonials && data.testimonials.length > 0) {
          setTestimonials(data.testimonials);
        }
      }
    } catch (err) {
      // Giữ dữ liệu mặc định nếu chưa khởi tạo trên backend
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Thao tác với Cam kết
  const handleAddCommitment = () => {
    setCommitments((prev) => [
      ...prev,
      {
        title: 'Cam kết mới',
        description: 'Mô tả chi tiết nội dung cam kết chất lượng dịch vụ.',
        iconName: 'ShieldCheck',
      },
    ]);
  };

  const handleUpdateCommitment = (index: number, field: keyof CompanyCommitment, value: string) => {
    setCommitments((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveCommitment = (index: number) => {
    setCommitments((prev) => prev.filter((_, i) => i !== index));
  };

  // Thao tác với Phương thức thanh toán
  const handleAddPaymentMethod = () => {
    setPaymentMethods((prev) => [
      ...prev,
      {
        title: 'Phương thức thanh toán mới',
        description: 'Mô tả cách thức thanh toán tiện lợi cho khách hàng.',
        iconName: 'Smartphone',
      },
    ]);
  };

  const handleUpdatePaymentMethod = (index: number, field: keyof CompanyPaymentMethod, value: string) => {
    setPaymentMethods((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemovePaymentMethod = (index: number) => {
    setPaymentMethods((prev) => prev.filter((_, i) => i !== index));
  };

  // Thao tác với Đánh giá khách hàng
  const handleAddTestimonial = () => {
    setTestimonials((prev) => [
      ...prev,
      {
        author: 'Khách hàng',
        location: 'Hà Nội',
        content: 'Dịch vụ xe ghép rất tốt, đưa đón đúng giờ.',
        rating: 5,
        isVisible: true,
      },
    ]);
  };

  const handleUpdateTestimonial = (
    index: number,
    field: keyof CompanyTestimonial,
    value: string | number | boolean
  ) => {
    setTestimonials((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveTestimonial = (index: number) => {
    setTestimonials((prev) => prev.filter((_, i) => i !== index));
  };

  // Lưu cấu hình
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation cơ bản
    if (!companyName.trim() || !brandName.trim()) {
      setError('Tên công ty và Tên thương hiệu không được để trống.');
      return;
    }

    if (!hotline.trim() || !hotlineRaw.trim()) {
      setError('Vui lòng nhập đầy đủ Hotline hiển thị và Hotline số thuần.');
      return;
    }

    if (!email.trim()) {
      setError('Email hỗ trợ không được để trống.');
      return;
    }

    const payload: Partial<CompanySettings> = {
      identity: {
        companyName: companyName.trim(),
        brandName: brandName.trim(),
        website: website.trim(),
        taxCode: taxCode.trim() || null,
      },
      contact: {
        hotline: hotline.trim(),
        hotlineRaw: hotlineRaw.trim(),
        email: email.trim(),
        zaloUrl: zaloUrl.trim() || null,
        fanpageName: fanpageName.trim() || null,
        fanpageUrl: fanpageUrl.trim() || null,
        secondaryPhone: secondaryNumber.trim()
          ? {
              label: secondaryLabel.trim() || 'Tổng đài phụ',
              number: secondaryNumber.trim(),
            }
          : undefined,
      },
      location: {
        address: address.trim() || null,
      },
      banner: {
        topBannerLine1: topBannerLine1.trim() || null,
        topBannerLine2: topBannerLine2.trim() || null,
        heroImage: resolveMediaId(heroImageMedia),
        heroTitleLine1: heroTitleLine1.trim() || null,
        heroTitleLine2: heroTitleLine2.trim() || null,
        heroDescription: heroDescription.trim() || null,
        heroBenefit1: heroBenefit1.trim() || null,
        heroBenefit2: heroBenefit2.trim() || null,
        heroBenefit3: heroBenefit3.trim() || null,
        coverage: coverage.trim() || null,
        workingHours: workingHours.trim() || null,
        fleetDescription: fleetDescription.trim() || null,
        bookingPromise: bookingPromise.trim() || null,
        summary: summary.trim() || null,
      },
      brandSeo: {
        logo: resolveMediaId(logoMedia),
        defaultOgImage: resolveMediaId(ogImageMedia),
        areaServed: brandAreaServed,
        priceRange: priceRange.trim() || null,
      },
      commitments,
      paymentMethods,
      testimonials,
    };

    try {
      setIsSaving(true);
      await apiClient.post('/globals/company_settings', payload);
      setSuccessMessage('Cập nhật thông tin doanh nghiệp thành công!');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
        <p className="text-sm">Đang tải cấu hình doanh nghiệp...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thông báo kết quả */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* 1. Thông tin Doanh nghiệp & Định danh */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <CardTitle>Thông tin Doanh nghiệp & Thương hiệu</CardTitle>
          </div>
          <CardDescription>
            Tên pháp nhân công ty, thương hiệu nhận diện trên hệ thống và mã số thuế.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên đầy đủ công ty (pháp nhân)"
              placeholder="Ví dụ: Công ty Cổ phần Vận tải Xe Ghép Liên Tỉnh"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <Input
              label="Tên thương hiệu (hiển thị ngắn gọn)"
              placeholder="Ví dụ: Xe Ghép Liên Tỉnh"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Website chính thức"
              placeholder="https://xeghephaiphonghanoi.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              required
            />
            <Input
              label="Mã số thuế / GPKD"
              placeholder="Ví dụ: 0109876543"
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Nhận diện thương hiệu & SEO (logo, ảnh chia sẻ) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-rose-400" />
            <CardTitle>Nhận diện Thương hiệu & SEO</CardTitle>
          </div>
          <CardDescription>
            Logo hiển thị trên header/footer và ảnh mặc định khi chia sẻ link lên mạng xã hội (OG Image).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-slate-700">Logo thương hiệu</span>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {resolveMediaDoc(logoMedia)?.url ? (
                    <img
                      src={resolveMediaDoc(logoMedia)?.url || ''}
                      alt={resolveMediaDoc(logoMedia)?.alt || 'Logo thương hiệu'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-7 h-7 text-slate-300" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLogoModalOpen(true)}
                    className="gap-1.5"
                  >
                    <ImageIcon className="w-4 h-4" />
                    {resolveMediaDoc(logoMedia) ? 'Đổi logo' : 'Chọn logo'}
                  </Button>
                  {logoMedia != null && (
                    <button
                      type="button"
                      onClick={() => setLogoMedia(null)}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      Gỡ logo
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Nên dùng ảnh PNG/SVG nền trong suốt, tỉ lệ vuông. Bỏ trống sẽ dùng icon xe mặc định.
              </p>
            </div>

            {/* OG Image */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-slate-700">Ảnh chia sẻ mặc định (OG Image)</span>
              <div className="flex items-center gap-4">
                <div className="w-32 h-20 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {resolveMediaDoc(ogImageMedia)?.url ? (
                    <img
                      src={resolveMediaDoc(ogImageMedia)?.url || ''}
                      alt={resolveMediaDoc(ogImageMedia)?.alt || 'Ảnh chia sẻ mặc định'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-7 h-7 text-slate-300" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOgImageModalOpen(true)}
                    className="gap-1.5"
                  >
                    <ImageIcon className="w-4 h-4" />
                    {resolveMediaDoc(ogImageMedia) ? 'Đổi ảnh' : 'Chọn ảnh'}
                  </Button>
                  {ogImageMedia != null && (
                    <button
                      type="button"
                      onClick={() => setOgImageMedia(null)}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      Gỡ ảnh
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Kích thước chuẩn 1200×630px, dùng khi trang không có ảnh SEO riêng.
              </p>
            </div>
          </div>

          <Input
            label="Khoảng giá (priceRange cho schema)"
            placeholder="Ví dụ: 150.000đ - 2.500.000đ"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* 3. Thông tin Liên hệ & Địa chỉ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-400" />
            <CardTitle>Thông tin Liên hệ & Hỗ trợ</CardTitle>
          </div>
          <CardDescription>
            Đầu số hotline tổng đài, Zalo tư vấn, email chăm sóc khách hàng và địa chỉ văn phòng.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Hotline hiển thị (có dấu chấm)"
              placeholder="Ví dụ: 0962.298.293"
              value={hotline}
              onChange={(e) => setHotline(e.target.value)}
              required
            />
            <Input
              label="Hotline số thuần (bấm gọi tel:)"
              placeholder="Ví dụ: 0962298293"
              value={hotlineRaw}
              onChange={(e) => setHotlineRaw(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email hỗ trợ"
              type="email"
              placeholder="xeghephaiphonghanoi@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Đường dẫn Zalo tư vấn"
              placeholder="https://zalo.me/0962298293"
              value={zaloUrl}
              onChange={(e) => setZaloUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên Fanpage Facebook"
              placeholder="Xe Ghép Liên Tỉnh"
              value={fanpageName}
              onChange={(e) => setFanpageName(e.target.value)}
            />
            <Input
              label="Đường dẫn Fanpage URL"
              placeholder="https://facebook.com/xegheplientinh"
              value={fanpageUrl}
              onChange={(e) => setFanpageUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nhãn số điện thoại phụ"
              placeholder="Ví dụ: Tổng đài hỗ trợ đêm"
              value={secondaryLabel}
              onChange={(e) => setSecondaryLabel(e.target.value)}
            />
            <Input
              label="Số điện thoại phụ"
              placeholder="Ví dụ: 0858.911.247"
              value={secondaryNumber}
              onChange={(e) => setSecondaryNumber(e.target.value)}
            />
          </div>

          <Input
            label="Địa chỉ văn phòng / trụ sở"
            placeholder="Số 12 Khuất Duy Tiến, Thanh Xuân, Hà Nội"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* 4. Banner đầu trang & Nội dung hiển thị chung */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            <CardTitle>Banner Đầu trang & Nội dung Chung</CardTitle>
          </div>
          <CardDescription>
            Cấu hình dòng chữ thông báo trên thanh dải đầu website (TopBanner), phạm vi phủ sóng và tóm tắt dịch vụ.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Banner dòng 1 (Tuyến chính / Thông báo nổi bật)"
              placeholder="Ví dụ: XE GHÉP: MÓNG CÁI - HẠ LONG - HẢI PHÒNG - BẮC NINH - BẮC GIANG - HÀ NỘI"
              value={topBannerLine1}
              onChange={(e) => setTopBannerLine1(e.target.value)}
            />
            <Input
              label="Banner dòng 2 (Hotline / Khuyến mãi)"
              placeholder="Ví dụ: ĐẶT XE LIÊN HỆ NGAY: 0962.298.293"
              value={topBannerLine2}
              onChange={(e) => setTopBannerLine2(e.target.value)}
            />
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-4">
            <span className="text-sm font-semibold text-slate-800">Banner lớn trang chủ</span>
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-40 h-24 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                <img
                  src={resolveMediaDoc(heroImageMedia)?.url || COMPANY_INFO.heroImageUrl}
                  alt={resolveMediaDoc(heroImageMedia)?.alt || COMPANY_INFO.heroImageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsHeroImageModalOpen(true)}>
                {heroImageMedia ? 'Đổi ảnh banner' : 'Chọn ảnh banner'}
              </Button>
              {heroImageMedia != null && (
                <button type="button" onClick={() => setHeroImageMedia(null)} className="text-xs text-slate-500 hover:text-rose-600">
                  Dùng ảnh mặc định
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500">Ảnh ngang, rõ trên điện thoại và máy tính. Mô tả ảnh (alt) được lấy từ thư viện ảnh.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Tiêu đề dòng 1" value={heroTitleLine1} onChange={(e) => setHeroTitleLine1(e.target.value)} />
              <Input label="Tiêu đề dòng 2" value={heroTitleLine2} onChange={(e) => setHeroTitleLine2(e.target.value)} />
            </div>
            <Textarea label="Mô tả banner" rows={3} value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Điểm nổi bật 1" value={heroBenefit1} onChange={(e) => setHeroBenefit1(e.target.value)} />
              <Input label="Điểm nổi bật 2" value={heroBenefit2} onChange={(e) => setHeroBenefit2(e.target.value)} />
              <Input label="Điểm nổi bật 3" value={heroBenefit3} onChange={(e) => setHeroBenefit3(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Giờ làm việc"
              placeholder="Ví dụ: Phục vụ 24/7 (Cả ngày lẫn đêm, các ngày lễ tết)"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
            />
            <Input
              label="Phạm vi phủ sóng"
              placeholder="Ví dụ: Móng Cái – Hạ Long – Hải Phòng – Bắc Ninh – Bắc Giang – Hà Nội"
              value={coverage}
              onChange={(e) => setCoverage(e.target.value)}
            />
          </div>

          <Textarea
            label="Mô tả đội xe"
            placeholder="Ví dụ: 100% xe riêng đời mới 4, 5, 7 chỗ, điều hòa mát lạnh, sạch sẽ, bảo dưỡng định kỳ"
            rows={2}
            value={fleetDescription}
            onChange={(e) => setFleetDescription(e.target.value)}
          />

          <Textarea
            label="Cam kết đặt xe"
            placeholder="Ví dụ: Giá rõ ràng đã bao gồm cầu đường bến bãi – Đưa đón tận nhà – Miễn phí hủy chuyến"
            rows={2}
            value={bookingPromise}
            onChange={(e) => setBookingPromise(e.target.value)}
          />

          <Textarea
            label="Tóm tắt dịch vụ"
            placeholder="Tóm tắt ngắn gọn dịch vụ đưa đón..."
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* 5. Cam kết dịch vụ (6 cam kết tiêu chuẩn) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <div>
                <CardTitle>Cam kết Chất lượng Dịch vụ ({commitments.length})</CardTitle>
                <CardDescription>
                  Danh sách cam kết tiêu chuẩn hiển thị trên trang chủ và trang chi tiết tuyến.
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCommitment}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Thêm cam kết
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {commitments.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative group"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Cam kết #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveCommitment(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                  title="Xóa cam kết"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    label="Tiêu đề cam kết"
                    placeholder="Ví dụ: Đúng giờ, đón tận nơi"
                    value={item.title}
                    onChange={(e) => handleUpdateCommitment(idx, 'title', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Select
                    label="Icon đại diện"
                    options={COMMITMENT_ICONS}
                    value={item.iconName}
                    onChange={(e) => handleUpdateCommitment(idx, 'iconName', e.target.value)}
                  />
                </div>
              </div>

              <Textarea
                label="Mô tả cam kết"
                placeholder="Mô tả nội dung cam kết chi tiết..."
                rows={2}
                value={item.description}
                onChange={(e) => handleUpdateCommitment(idx, 'description', e.target.value)}
                required
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 4. Phương thức thanh toán */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <div>
                <CardTitle>Phương thức Thanh toán ({paymentMethods.length})</CardTitle>
                <CardDescription>
                  Các hình thức thanh toán được chấp nhận khi khách hàng đi xe.
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPaymentMethod}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Thêm phương thức
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                  Phương thức #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemovePaymentMethod(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                  title="Xóa phương thức"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    label="Tên phương thức"
                    placeholder="Ví dụ: Tiền mặt cho tài xế"
                    value={item.title}
                    onChange={(e) => handleUpdatePaymentMethod(idx, 'title', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Select
                    label="Icon đại diện"
                    options={PAYMENT_ICONS}
                    value={item.iconName}
                    onChange={(e) => handleUpdatePaymentMethod(idx, 'iconName', e.target.value)}
                  />
                </div>
              </div>

              <Textarea
                label="Mô tả hướng dẫn"
                placeholder="Hướng dẫn cách thức thanh toán..."
                rows={2}
                value={item.description}
                onChange={(e) => handleUpdatePaymentMethod(idx, 'description', e.target.value)}
                required
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 5. Đánh giá của khách hàng */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <div>
                <CardTitle>Đánh giá của Khách hàng ({testimonials.length})</CardTitle>
                <CardDescription>
                  Phản hồi, nhận xét thực tế từ khách hàng trải nghiệm dịch vụ.
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTestimonial}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Thêm đánh giá
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                  Đánh giá #{idx + 1}
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isVisible ?? true}
                      onChange={(e) => handleUpdateTestimonial(idx, 'isVisible', e.target.checked)}
                      className="rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500"
                    />
                    Hiển thị trên web
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveTestimonial(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                    title="Xóa đánh giá"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Input
                    label="Tên khách hàng"
                    placeholder="Nguyễn Văn A"
                    value={item.author}
                    onChange={(e) => handleUpdateTestimonial(idx, 'author', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Địa phương / Tuyến đi"
                    placeholder="Hà Nội - Thái Nguyên"
                    value={item.location || ''}
                    onChange={(e) => handleUpdateTestimonial(idx, 'location', e.target.value)}
                  />
                </div>
                <div>
                  <Select
                    label="Điểm đánh giá (sao)"
                    options={[
                      { label: '⭐⭐⭐⭐⭐ (5 sao)', value: '5' },
                      { label: '⭐⭐⭐⭐ (4 sao)', value: '4' },
                      { label: '⭐⭐⭐ (3 sao)', value: '3' },
                    ]}
                    value={String(item.rating || 5)}
                    onChange={(e) =>
                      handleUpdateTestimonial(idx, 'rating', Number(e.target.value) || 5)
                    }
                  />
                </div>
              </div>

              <Textarea
                label="Nội dung đánh giá"
                placeholder="Nhận xét của khách hàng..."
                rows={2}
                value={item.content}
                onChange={(e) => handleUpdateTestimonial(idx, 'content', e.target.value)}
                required
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Thanh hành động lưu */}
      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 p-4 bg-white/95 backdrop-blur border border-slate-200 rounded-2xl shadow-lg">
        <Button type="submit" isLoading={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          Lưu cấu hình Doanh nghiệp
        </Button>
      </div>

      <MediaPickerModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        onSelect={(media) => setLogoMedia(media)}
        selectedId={resolveMediaId(logoMedia) ?? undefined}
        title="Chọn logo thương hiệu"
      />

      <MediaPickerModal
        isOpen={isOgImageModalOpen}
        onClose={() => setIsOgImageModalOpen(false)}
        onSelect={(media) => setOgImageMedia(media)}
        selectedId={resolveMediaId(ogImageMedia) ?? undefined}
        title="Chọn ảnh chia sẻ mặc định (OG Image)"
      />
      <MediaPickerModal
        isOpen={isHeroImageModalOpen}
        onClose={() => setIsHeroImageModalOpen(false)}
        onSelect={(media) => setHeroImageMedia(media)}
        selectedId={resolveMediaId(heroImageMedia) ?? undefined}
        title="Chọn ảnh banner trang chủ"
      />
    </form>
  );
}
