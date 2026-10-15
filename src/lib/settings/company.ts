export type CompanyContactInput = {
  hotlineRaw?: string | null;
  website?: string | null;
};

export type DerivedCompanyValues = {
  hotlineHref: string;
  zaloHref: string;
  smsHref: string;
  domainName: string;
};

export type TestimonialLike = { isVisible?: boolean | null };

const toE164 = (hotlineRaw?: string | null): string => {
  const raw = typeof hotlineRaw === 'string' ? hotlineRaw.trim() : '';
  if (!/^0\d{9}$/.test(raw)) return '';
  return `+84${raw.slice(1)}`;
};

const toDomain = (website?: string | null): string => {
  const raw = typeof website === 'string' ? website.trim() : '';
  if (!raw) return '';
  try {
    const url = raw.includes('://') ? raw : `https://${raw}`;
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

/**
 * FR-D10: giá trị phái sinh (gọi điện / Zalo / SMS / tên miền) do hệ thống
 * tính lúc đọc — không bao giờ lưu xuống DB.
 */
export function deriveCompanyLinks(input: CompanyContactInput): DerivedCompanyValues {
  const e164 = toE164(input.hotlineRaw);
  return {
    hotlineHref: e164 ? `tel:${e164}` : '',
    zaloHref: e164 ? `https://zalo.me/${e164.slice(1)}` : '',
    smsHref: e164 ? `sms:${e164}` : '',
    domainName: toDomain(input.website),
  };
}

/** data-model: testimonials chỉ xuất bản ghi isVisible = true (undefined giữ lại). */
export function visibleTestimonials<T extends TestimonialLike>(
  testimonials: T[] | null | undefined,
): T[] {
  if (!Array.isArray(testimonials)) return [];
  return testimonials.filter((item) => item.isVisible !== false);
}

/**
 * GET /api/v1/settings/company (contracts §4): toàn bộ company_settings +
 * 4 giá trị phái sinh, testimonials đã lọc isVisible.
 */
export function serializeCompanySettings<T extends Record<string, any>>(doc: T): T &
  DerivedCompanyValues & { testimonials: T['testimonials'] } {
  const merged = {
    ...doc,
    ...deriveCompanyLinks({
      hotlineRaw: doc?.contact?.hotlineRaw,
      website: doc?.identity?.website,
    }),
    testimonials: visibleTestimonials(doc?.testimonials),
  };
  return merged as T & DerivedCompanyValues & { testimonials: T['testimonials'] };
}
