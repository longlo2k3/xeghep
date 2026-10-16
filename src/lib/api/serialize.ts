import { formatTier, vnd } from '../pricing/formatTier';
import type { PriceTier } from '../pricing/types';
import type { Media, Route } from '../../payload-types';
import { sanitizeRoutePricingHtml } from '../seo/sanitize';
import { sanitizeRoutePricingCss } from '../seo/sanitizeRoutePricingCss';

export const NO_STORE_HEADER = { 'Cache-Control': 'private, no-store' } as const;
export const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
} as const;

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  in_progress: 'Đang trên đường',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản',
};

export function statusLabel(status: string | null | undefined): string {
  return (status && STATUS_LABELS[status]) || 'Không xác định';
}

export function paymentMethodLabel(method: string | null | undefined): string | null {
  return (method && PAYMENT_METHOD_LABELS[method]) || null;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return '***';
  return `${phone.slice(0, 4)}***${phone.slice(-3)}`;
}

export function toVietnamIso(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? '00';
  const hour = get('hour') === '24' ? '00' : get('hour');
  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}:${get('second')}+07:00`;
}

export function serverBase(): string {
  // Dự án gộp: media được phục vụ bởi chính app (D6) — mặc định trỏ về origin của app.
  return (process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

export type MediaLike =
  | { filename?: string | null; width?: number | null; height?: number | null; alt?: string | null }
  | number
  | null
  | undefined;

export type ImageOut = { url: string; width: number | null; height: number | null; alt: string | null };

function resolveMedia(media: MediaLike): Media | null {
  return media && typeof media === 'object' && 'filename' in media ? (media as Media) : null;
}

export function mediaUrl(media: MediaLike): string | null {
  const doc = resolveMedia(media);
  if (!doc?.filename) return null;
  return `${serverBase()}/media/${doc.filename}`;
}

export function serializeImage(media: MediaLike): ImageOut | null {
  const doc = resolveMedia(media);
  const url = mediaUrl(media);
  if (!url) return null;
  return { url, width: doc?.width ?? null, height: doc?.height ?? null, alt: doc?.alt ?? null };
}

type TierGroup = Route['tierShare1'];

function toTier(group: TierGroup): PriceTier | null {
  if (!group) return null;
  if (group.min == null && !group.negotiable) return null;
  return {
    min: group.min ?? null,
    max: group.max ?? null,
    from: group.from ?? false,
    negotiable: group.negotiable ?? false,
  };
}

function tierText(group: TierGroup): string {
  const tier = toTier(group);
  if (!tier) return 'Liên hệ thỏa thuận';
  return formatTier(tier, 'short');
}

export function serializeRouteCard(route: Route) {
  const tiers = {
    share1: toTier(route.tierShare1),
    share2: toTier(route.tierShare2),
    charter45: toTier(route.tierCharter45),
    charter7: toTier(route.tierCharter7),
  };
  const tierByKey = {
    share1: route.tierShare1,
    share2: route.tierShare2,
    charter45: route.tierCharter45,
    charter7: route.tierCharter7,
  } as const;

  return {
    id: route.id,
    slug: route.slug,
    name: route.name,
    bannerLabel: route.bannerLabel ?? route.name,
    origin: route.origin,
    destination: route.destination,
    distance: route.distance ?? null,
    duration: route.duration ?? null,
    priceFrom: route.priceFrom ?? null,
    priceShare1Text: tierText(route.tierShare1),
    priceShare2Text: tierText(route.tierShare2),
    priceCharter4to5Text: tierText(route.tierCharter45),
    priceCharter7Text: tierText(route.tierCharter7),
    tiers,
    pricingDetails: (route.pricingDetails?.length ? route.pricingDetails : [
      { tierKey: 'share1' as const, label: 'Xe ghép 1 người', note: null },
      { tierKey: 'share2' as const, label: 'Xe ghép 2 người', note: null },
      { tierKey: 'charter45' as const, label: 'Bao xe 4-5 chỗ', note: null },
      { tierKey: 'charter7' as const, label: 'Bao xe 7 chỗ', note: null },
    ].filter((row) => toTier(tierByKey[row.tierKey]) !== null)).map((row) => ({
      label: row.label,
      price: tierText(tierByKey[row.tierKey]),
      note: row.note ?? null,
    })),
    regions: route.regions ?? [],
    isBannerTop: route.isBannerTop ?? false,
    sortOrder: route.sortOrder,
    thumbnail: serializeImage(route.thumbnail),
    pickups: (route.pickups ?? []).map((p) => p.text),
    dropoffs: (route.dropoffs ?? []).map((d) => d.text),
  };
}

export type RouteCard = ReturnType<typeof serializeRouteCard>;

export function serializeRouteDetail(
  route: Route,
  options: { full?: boolean; relatedRoutes?: RouteCard[]; priceValidUntilFallback?: string | null } = {},
) {
  const card = serializeRouteCard(route);
  const detailed = route.detailedContent;
  const hasDetailed =
    detailed != null && Array.isArray(detailed.root?.children) && detailed.root.children.length > 0;
  const validUntil = route.priceValidUntil ?? options.priceValidUntilFallback ?? null;
  const seo = route.seo;

  return {
    ...card,
    description: route.description,
    customPricingHtml: route.useCustomPricingHtml && route.customPricingHtml?.trim()
      ? sanitizeRoutePricingHtml(route.customPricingHtml)
      : null,
    customPricingCss: route.useCustomPricingHtml && route.customPricingHtml?.trim()
      ? sanitizeRoutePricingCss(route.customPricingCss)
      : null,
    customPricingJs: route.useCustomPricingHtml && route.customPricingHtml?.trim()
      ? (route.customPricingJs ?? null)
      : null,
    detailedContent: hasDetailed ? detailed : null,
    operatingHoursText: route.operatingHoursText ?? null,
    frequencyText: route.frequencyText ?? null,
    pickups: (route.pickups ?? []).map((p) => p.text),
    dropoffs: (route.dropoffs ?? []).map((d) => d.text),
    faqs: (route.faqs ?? []).map((f) => ({ question: f.question, answer: f.answer })),
    slides: (route.slides ?? []).flatMap((slide) => {
      const src = mediaUrl(slide.image);
      if (!src) return [];
      const media = resolveMedia(slide.image);
      return [
        {
          src,
          width: media?.width ?? null,
          height: media?.height ?? null,
          badge: slide.badge,
          caption: slide.caption,
          alt: slide.alt || media?.alt || '',
        },
      ];
    }),
    relatedRoutes: options.relatedRoutes ?? [],
    priceValidUntil: validUntil ? String(validUntil).slice(0, 10) : null,
    updatedAt: toVietnamIso(new Date(route.updatedAt)),
    seo: {
      metaTitle: seo?.metaTitle ?? null,
      appendBrand: seo?.appendBrand ?? true,
      metaDescription: seo?.metaDescription ?? null,
      ogImage: serializeImage(seo?.ogImage ?? null),
      noindex: seo?.noindex ?? false,
    },
    ...(options.full
      ? {
          originAliases: (route.originAliases ?? []).map((a) => a.text),
          destinationAliases: (route.destinationAliases ?? []).map((a) => a.text),
        }
      : {}),
  };
}

export function formatStoredPrice(
  priceType: string | null | undefined,
  estimatedPrice: number | null | undefined,
  estimatedPriceMax: number | null | undefined,
): string {
  if (priceType === 'negotiable' || priceType === 'quote_required') return 'Liên hệ báo giá';
  if (priceType === 'range' && estimatedPrice != null && estimatedPriceMax != null) {
    return `${vnd(estimatedPrice)} – ${vnd(estimatedPriceMax)}`;
  }
  if (estimatedPrice != null) return vnd(estimatedPrice);
  return 'Liên hệ báo giá';
}
