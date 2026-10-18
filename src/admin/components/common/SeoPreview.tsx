import { useState } from 'react';
import {
  Globe,
  Share2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Car,
} from 'lucide-react';
import { Card } from '@/admin/components/ui/Card';
import { SITE_DOMAIN } from '@/lib/seo';

export interface SeoPreviewProps {
  title: string;
  description: string;
  slug: string;
  prefix?: string;
  ogImage?: string;
  appendBrand?: boolean;
  siteName?: string;
  brandSuffix?: string;
}

export function SeoPreview({
  title,
  description,
  slug,
  prefix = 'tin-tuc',
  ogImage,
  appendBrand = false,
  siteName = 'Xe Ghép Liên Tỉnh',
  brandSuffix = ' | Xe Ghép Liên Tỉnh',
}: SeoPreviewProps) {
  const [activeTab, setActiveTab] = useState<'serp' | 'social'>('serp');

  // Xử lý tiêu đề hiển thị đầy đủ
  const effectiveTitle = title
    ? `${title}${appendBrand ? brandSuffix : ''}`
    : 'Chưa có tiêu đề trang';

  const effectiveDescription = description || 'Chưa có mô tả nội dung trang. Vui lòng nhập meta description để tối ưu tỷ lệ nhấp chuột (CTR) từ công cụ tìm kiếm.';

  // Xử lý URL hiển thị
  const cleanPrefix = prefix ? prefix.replace(/^\/+|\/+$/g, '') : '';
  const cleanSlug = slug ? slug.replace(/^\/+|\/+$/g, '') : 'duong-dan-bai-viet';
  const displayUrl = cleanPrefix
    ? `${SITE_DOMAIN}/${cleanPrefix}/${cleanSlug}`
    : `${SITE_DOMAIN}/${cleanSlug}`;

  // Độ dài ký tự
  const titleLength = effectiveTitle.length;
  const descLength = description.length;

  // Trạng thái tiêu đề (≤ 70 ký tự)
  const isTitleOver = titleLength > 70;
  const isTitleOptimal = titleLength >= 40 && titleLength <= 70;
  const isTitleShort = titleLength > 0 && titleLength < 40;

  // Trạng thái mô tả (≤ 160 ký tự)
  const isDescOver = descLength > 160;
  const isDescOptimal = descLength >= 100 && descLength <= 160;
  const isDescShort = descLength > 0 && descLength < 100;

  return (
    <Card className="p-5 space-y-5" data-testid="seo-preview-card">
      {/* Header và Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            Kiểm tra & Xem trước hiển thị SEO
          </h3>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('serp')}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'serp'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            data-testid="tab-serp-btn"
          >
            <Globe className="w-3.5 h-3.5" />
            Google Tìm kiếm
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'social'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            data-testid="tab-social-btn"
          >
            <Share2 className="w-3.5 h-3.5" />
            Mạng xã hội (OG)
          </button>
        </div>
      </div>

      {/* THANH ĐO ĐỘ DÀI TIÊU ĐỀ & MÔ TẢ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Thanh đo Tiêu đề (≤ 70 ký tự) */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Độ dài Tiêu đề (SEO Title)</span>
            <span
              className={`font-mono font-bold ${
                isTitleOver
                  ? 'text-rose-600'
                  : isTitleOptimal
                  ? 'text-emerald-600'
                  : isTitleShort
                  ? 'text-amber-600'
                  : 'text-slate-500'
              }`}
              data-testid="title-counter"
            >
              {titleLength} / 70 ký tự
            </span>
          </div>

          {/* Thanh tiến trình */}
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isTitleOver
                  ? 'bg-rose-500'
                  : isTitleOptimal
                  ? 'bg-emerald-500'
                  : isTitleShort
                  ? 'bg-amber-500'
                  : 'bg-slate-300'
              }`}
              style={{ width: `${Math.min(100, Math.round((titleLength / 70) * 100))}%` }}
              data-testid="title-progress-bar"
            />
          </div>

          {/* Đánh giá / Cảnh báo */}
          <div className="text-[11px] flex items-center gap-1.5">
            {isTitleOver ? (
              <span className="text-rose-600 flex items-center gap-1 font-medium" data-testid="title-warning">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Vượt quá 70 ký tự! Google sẽ cắt bớt bằng dấu '...'.
              </span>
            ) : isTitleOptimal ? (
              <span className="text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Độ dài hoàn hảo (40 - 70 ký tự).
              </span>
            ) : isTitleShort ? (
              <span className="text-amber-600 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                Hơi ngắn (&lt; 40 ký tự). Nên bổ sung thêm từ khóa chính.
              </span>
            ) : (
              <span className="text-slate-500">Chưa nhập tiêu đề</span>
            )}
          </div>
        </div>

        {/* Thanh đo Mô tả (≤ 160 ký tự) */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Độ dài Mô tả (Meta Description)</span>
            <span
              className={`font-mono font-bold ${
                isDescOver
                  ? 'text-rose-600'
                  : isDescOptimal
                  ? 'text-emerald-600'
                  : isDescShort
                  ? 'text-amber-600'
                  : 'text-slate-500'
              }`}
              data-testid="desc-counter"
            >
              {descLength} / 160 ký tự
            </span>
          </div>

          {/* Thanh tiến trình */}
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isDescOver
                  ? 'bg-rose-500'
                  : isDescOptimal
                  ? 'bg-emerald-500'
                  : isDescShort
                  ? 'bg-amber-500'
                  : 'bg-slate-300'
              }`}
              style={{ width: `${Math.min(100, Math.round((descLength / 160) * 100))}%` }}
              data-testid="desc-progress-bar"
            />
          </div>

          {/* Đánh giá / Cảnh báo */}
          <div className="text-[11px] flex items-center gap-1.5">
            {isDescOver ? (
              <span className="text-rose-400 flex items-center gap-1 font-medium" data-testid="desc-warning">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Vượt quá 160 ký tự! Nội dung sẽ bị Google cắt ngắn.
              </span>
            ) : isDescOptimal ? (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Độ dài hoàn hảo (100 - 160 ký tự).
              </span>
            ) : isDescShort ? (
              <span className="text-amber-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                Hơi ngắn (&lt; 100 ký tự). Nên mở rộng thêm lời kêu gọi đặt xe.
              </span>
            ) : (
              <span className="text-slate-500">Chưa nhập mô tả</span>
            )}
          </div>
        </div>
      </div>

      {/* TAB NỘI DUNG: GOOGLE SERP PREVIEW */}
      {activeTab === 'serp' ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400">
            Mô phỏng hiển thị trên Google SERP (Desktop & Mobile):
          </p>

          {/* Khung mô phỏng Google Search Card */}
          <div
            className="p-4 sm:p-5 rounded-2xl bg-white text-slate-900 shadow-md border border-slate-200/80 font-sans max-w-2xl text-left"
            data-testid="google-serp-preview"
          >
            {/* Header: Favicon + Tên trang + URL */}
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 border border-slate-200 shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 leading-tight">
                  {siteName}
                </p>
                <p className="text-[11px] text-slate-500 font-normal truncate leading-tight">
                  {displayUrl}
                </p>
              </div>
            </div>

            {/* Tiêu đề Google màu xanh lam */}
            <h4
              className="text-lg text-[#1a0dab] hover:underline font-normal cursor-pointer leading-snug line-clamp-2 mt-1"
              data-testid="serp-title"
            >
              {effectiveTitle}
            </h4>

            {/* Mô tả Google màu xám đen */}
            <p
              className="text-sm text-[#4d5156] leading-relaxed line-clamp-2 mt-1.5"
              data-testid="serp-description"
            >
              {effectiveDescription}
            </p>
          </div>
        </div>
      ) : (
        /* TAB NỘI DUNG: SOCIAL / OPEN GRAPH PREVIEW */
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500">
            Mô phỏng hiển thị khi chia sẻ liên kết trên Facebook / Zalo:
          </p>

          <div
            className="rounded-2xl overflow-hidden bg-white border border-slate-200 max-w-lg shadow-md text-left"
            data-testid="social-og-preview"
          >
            {/* Ảnh đại diện Open Graph */}
            <div className="relative w-full aspect-[1.91/1] bg-slate-100 overflow-hidden flex items-center justify-center">
              {ogImage ? (
                <img
                  src={ogImage}
                  alt={title || 'OG Image'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <Share2 className="w-8 h-8 mb-2" />
                  <span className="text-xs">Chưa cấu hình ảnh đại diện (ogImage)</span>
                </div>
              )}
            </div>

            {/* Nội dung card */}
            <div className="p-4 space-y-1 bg-white border-t border-slate-100">
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                XEGHEPLIENTINH.VN
              </span>
              <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                {effectiveTitle}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {effectiveDescription}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default SeoPreview;
