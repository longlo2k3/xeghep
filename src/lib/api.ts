import type { Article } from "@/data/articles";
import {
  COMPANY_INFO,
  SIX_COMMITMENTS,
  PAYMENT_METHODS,
  TESTIMONIALS,
  type Commitment,
  type PaymentMethod,
  type Testimonial,
} from "@/data/company-info";
import { FALLBACK_ROUTES } from "@/data/fallback-routes";
import type { RouteItem, RoutePriceDetail } from "@/lib/types";
import {
  getRoutesDirect,
  getRouteDirect,
  getCompanySettingsDirect,
  getArticlesDirect,
  getArticleDirect,
  getAirportPricingDirect,
  getDistanceRatesDirect,
  getPricingSettingsDirect,
  getPageDirect,
} from "./api/server";

export type { RouteItem, RoutePriceDetail };
export { FALLBACK_ROUTES };

const CMS =
  typeof window === "undefined"
    // Dự án gộp: API chạy cùng app (D6) — SSR/middleware tự trỏ về chính nó
    ? process.env.CMS_URL ?? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_CMS_URL ?? "";

const REVALIDATE_SECONDS = process.env.NODE_ENV === "development" ? 0 : 60;

export type CmsErrorCode =
  | "VALIDATION_ERROR"
  | "PICKUP_TIME_TOO_SOON"
  | "ROUTE_NOT_FOUND"
  | "BOOKING_NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "CMS_UNREACHABLE"
  | "CMS_TIMEOUT"
  | "CMS_BAD_RESPONSE";

export class ApiError extends Error {
  readonly code: CmsErrorCode | string;
  readonly status: number;
  readonly fields: { field: string; message: string }[];

  constructor(
    code: CmsErrorCode | string,
    message: string,
    status: number,
    fields: { field: string; message: string }[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNotFoundError(error: unknown): boolean {
  return isApiError(error) && error.status === 404;
}

type CmsFetchInit = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  next?: { revalidate?: number | false; tags?: string[] };
  cache?: "no-store";
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
};

type SuccessEnvelope<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

type ErrorEnvelope = {
  success: false;
  statusCode: number;
  error?: {
    code?: string;
    message?: string;
    fields?: { field: string; message: string }[];
  };
};

type CmsResponse<T> = { data: T; message: string; meta?: Record<string, unknown> };

const DEFAULT_GET_TIMEOUT_MS = 2500;
const DEFAULT_POST_TIMEOUT_MS = 8000;

async function request<T>(path: string, init?: CmsFetchInit): Promise<CmsResponse<T>> {
  const timeoutMs =
    init?.timeoutMs ??
    (init?.method === "POST" ? DEFAULT_POST_TIMEOUT_MS : DEFAULT_GET_TIMEOUT_MS);

  let signal: AbortSignal | undefined;
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    signal =
      init?.signal && typeof AbortSignal.any === "function"
        ? AbortSignal.any([init.signal, timeoutSignal])
        : timeoutSignal;
  }

  let res: Response;
  try {
    res = await fetch(`${CMS}${path}`, {
      ...init,
      signal: signal ?? init?.signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new ApiError("CMS_TIMEOUT", `Máy chủ phản hồi quá lâu (${timeoutMs}ms)`, 504);
    }
    throw new ApiError("CMS_UNREACHABLE", "Không thể kết nối máy chủ dữ liệu", 503);
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  const envelope = body as (SuccessEnvelope<T> | ErrorEnvelope) | null;
  if (!res.ok || !envelope || typeof envelope !== "object" || envelope.success !== true) {
    const errorBody = envelope && typeof envelope === "object" && envelope.success === false ? envelope : null;
    const code = errorBody?.error?.code ?? "INTERNAL_ERROR";
    const message = errorBody?.error?.message ?? `Không lấy được dữ liệu (HTTP ${res.status})`;
    const status = errorBody?.statusCode ?? res.status;
    throw new ApiError(code, message, status || 500, errorBody?.error?.fields ?? []);
  }

  const success = envelope as SuccessEnvelope<T>;
  return { data: success.data, message: success.message, meta: success.meta };
}

async function cmsGet<T>(
  path: string,
  tags: string[],
  revalidate = REVALIDATE_SECONDS,
  timeoutMs?: number,
): Promise<T> {
  const { data } = await request<T>(path, { next: { revalidate, tags }, timeoutMs });
  return data;
}

async function cmsPost<T>(
  path: string,
  body: unknown,
  idempotencyKey?: string,
  timeoutMs?: number,
): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json; charset=utf-8" };
  if (idempotencyKey) headers["idempotency-key"] = idempotencyKey;
  const { data } = await request<T>(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
    timeoutMs,
  });
  return data;
}

export type RoutePriceTier = {
  min: number | null;
  max: number | null;
  from: boolean;
  negotiable: boolean;
};

export type CmsImage = {
  url: string;
  width: number | null;
  height: number | null;
  alt: string | null;
};

export type RouteCardOut = {
  id: number;
  slug: string;
  name: string;
  bannerLabel: string;
  origin: string;
  destination: string;
  distance: string | null;
  duration: string | null;
  priceFrom: number | null;
  priceShare1Text: string;
  priceShare2Text: string;
  priceCharter4to5Text: string;
  priceCharter7Text: string;
  tiers: Record<string, RoutePriceTier | null>;
  pricingDetails: { label: string; price: string; note: string | null }[];
  regions: string[];
  isBannerTop: boolean;
  sortOrder: number;
  thumbnail: CmsImage | null;
};

export type RouteSeo = {
  metaTitle: string | null;
  appendBrand: boolean;
  metaDescription: string | null;
  ogImage: CmsImage | null;
  noindex: boolean;
};

export type RouteSlide = {
  src: string;
  width: number | null;
  height: number | null;
  badge: string | null;
  caption: string | null;
  alt: string;
};

export type RouteDetailOut = RouteCardOut & {
  description: string;
  detailedContent: unknown;
  operatingHoursText: string | null;
  frequencyText: string | null;
  pickups: string[];
  dropoffs: string[];
  faqs: { question: string; answer: string }[];
  slides: RouteSlide[];
  relatedRoutes: RouteCardOut[];
  priceValidUntil: string | null;
  updatedAt: string;
  seo: RouteSeo;
  originAliases?: string[];
  destinationAliases?: string[];
};

export type RouteDetail = RouteItem & {
  bannerLabel: string;
  operatingHoursText: string | null;
  frequencyText: string | null;
  priceValidUntil: string | null;
  updatedAt: string;
  slides: RouteSlide[];
  relatedRoutes: RouteItem[];
  seo: RouteSeo;
};

export type GetRoutesOptions = {
  status?: "draft" | "active" | "inactive";
  isBannerTop?: boolean;
  region?: string;
};

function toRouteItem(card: RouteCardOut): RouteItem {
  return {
    slug: card.slug,
    name: card.name,
    bannerLabel: card.bannerLabel || card.name,
    origin: card.origin,
    destination: card.destination,
    distance: card.distance ?? "",
    duration: card.duration ?? "",
    priceFrom: card.priceFrom ?? 0,
    priceShare1Text: card.priceShare1Text,
    priceShare2Text: card.priceShare2Text || undefined,
    priceCharter4to5Text: card.priceCharter4to5Text,
    priceCharter7Text: card.priceCharter7Text || undefined,
    pricingDetails: (card.pricingDetails ?? []).map((detail) => ({
      label: detail.label,
      price: detail.price,
      note: detail.note ?? undefined,
    })),
    description: "",
    pickups: [],
    dropoffs: [],
    faqs: [],
    regions: card.regions ?? [],
    isBannerTop: card.isBannerTop,
  };
}

function toRouteDetail(detail: RouteDetailOut): RouteDetail {
  return {
    ...toRouteItem(detail),
    description: detail.description ?? "",
    pickups: detail.pickups ?? [],
    dropoffs: detail.dropoffs ?? [],
    faqs: detail.faqs ?? [],
    bannerLabel: detail.bannerLabel || detail.name,
    operatingHoursText: detail.operatingHoursText ?? null,
    frequencyText: detail.frequencyText ?? null,
    priceValidUntil: detail.priceValidUntil ?? null,
    updatedAt: detail.updatedAt,
    slides: detail.slides ?? [],
    relatedRoutes: (detail.relatedRoutes ?? []).map(toRouteItem),
    seo: detail.seo,
  };
}

export function buildRoutesQuery(options: GetRoutesOptions & { fields?: string } = {}): string {
  const params = new URLSearchParams();
  if (options.status) params.set("status", options.status);
  if (options.isBannerTop !== undefined) params.set("isBannerTop", String(options.isBannerTop));
  if (options.region) params.set("region", options.region);
  if (options.fields) params.set("fields", options.fields);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getRoutes(): Promise<RouteItem[]>;
export async function getRoutes(options: GetRoutesOptions & { fields: "slug" }): Promise<{ slug: string }[]>;
export async function getRoutes(options: GetRoutesOptions & { fields?: "card" | "full" }): Promise<RouteItem[]>;
export async function getRoutes(
  options: GetRoutesOptions & { fields?: "card" | "slug" | "full" } = {},
): Promise<RouteItem[] | { slug: string }[]> {
  if (typeof window === "undefined") {
    return getRoutesDirect(options);
  }
  const query = buildRoutesQuery({ fields: "card", ...options });
  try {
    const data = await cmsGet<RouteCardOut[] | { slug: string }[]>(`/api/v1/routes${query}`, [
      "routes",
      "sitemap",
    ]);
    if (options.fields === "slug") return data as { slug: string }[];
    return (data as RouteCardOut[]).map(toRouteItem);
  } catch {
    // Fail-open an toàn khi CMS phản hồi chậm hoặc đang khởi động
    if (options.fields === "slug") {
      return FALLBACK_ROUTES.map((r) => ({ slug: r.slug }));
    }
    return FALLBACK_ROUTES;
  }
}

function fallbackRouteDetail(slug: string): RouteDetail | null {
  const item = FALLBACK_ROUTES.find((r) => r.slug === slug);
  if (!item) return null;
  return {
    ...item,
    bannerLabel: item.bannerLabel ?? item.name,
    operatingHoursText: "24/7 liên tục ngày đêm",
    frequencyText: "Chuyến mới sau mỗi 30 - 60 phút",
    priceValidUntil: null,
    updatedAt: "2026-10-12T00:00:00.000Z",
    slides: [],
    relatedRoutes: FALLBACK_ROUTES.filter((r) => r.slug !== slug).slice(0, 3),
    seo: {
      metaTitle: `${item.name} - Giá Rẻ Đón Tận Nhà 24/7`,
      appendBrand: true,
      metaDescription: item.description,
      ogImage: null,
      noindex: false,
    },
  };
}

export async function getRoute(slug: string): Promise<RouteDetail> {
  if (typeof window === "undefined") {
    return getRouteDirect(slug);
  }
  try {
    const data = await cmsGet<RouteDetailOut>(`/api/v1/routes/${encodeURIComponent(slug)}`, [
      "routes",
      `routes:${slug}`,
      "sitemap",
    ]);
    return toRouteDetail(data);
  } catch (err) {
    const fallback = fallbackRouteDetail(slug);
    if (fallback) return fallback;
    throw err;
  }
}

export type CompanyInfoData = {
  name: string;
  brandName: string;
  hotline: string;
  hotlineRaw: string;
  hotlineHref: string;
  zaloHref: string;
  smsHref: string;
  email: string;
  website: string;
  domainName: string;
  fanpage: string;
  fanpageUrl: string;
  topBannerLine1: string;
  topBannerLine2: string;
  coverage: string;
  workingHours: string;
  fleetDescription: string;
  bookingPromise: string;
  summary: string;
};

export type CompanySettingsOut = {
  identity?: {
    companyName?: string | null;
    brandName?: string | null;
    website?: string | null;
  };
  contact?: {
    hotline?: string | null;
    hotlineRaw?: string | null;
    secondaryPhone?: { label?: string | null; number?: string | null } | null;
    email?: string | null;
    zaloUrl?: string | null;
    fanpageName?: string | null;
    fanpageUrl?: string | null;
  };
  location?: {
    address?: string | null;
    mapEmbedUrl?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  banner?: {
    topBannerLine1?: string | null;
    topBannerLine2?: string | null;
    coverage?: string | null;
    workingHours?: string | null;
    fleetDescription?: string | null;
    bookingPromise?: string | null;
    summary?: string | null;
  };
  brandSeo?: {
    areaServed?: { type?: string | null; name?: string }[] | null;
    priceRange?: string | null;
  };
  commitments?: (Omit<Commitment, "id"> & { id?: string })[] | null;
  paymentMethods?: (Omit<PaymentMethod, "id"> & { id?: string })[] | null;
  testimonials?: (Omit<Testimonial, "id"> & { id?: string; isVisible?: boolean | null })[] | null;
  hotlineHref?: string | null;
  zaloHref?: string | null;
  smsHref?: string | null;
  domainName?: string | null;
};

export type CompanySettingsData = {
  info: CompanyInfoData;
  address: string | null;
  mapEmbedUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  secondaryPhone: { label: string | null; number: string | null } | null;
  areaServed: { type: string; name: string }[];
  priceRange: string | null;
  commitments: Commitment[];
  paymentMethods: PaymentMethod[];
  testimonials: Testimonial[];
};

export const FALLBACK_COMPANY_SETTINGS: CompanySettingsData = {
  info: COMPANY_INFO,
  address: "Lê Chân, Hải Phòng, Việt Nam",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=Le+Chan,+Hai+Phong,+Vietnam&t=&z=14&ie=UTF8&iwloc=&output=embed",
  latitude: 20.8449115,
  longitude: 106.6880841,
  secondaryPhone: null,
  areaServed: [
    { type: "City", name: "Hà Nội" },
    { type: "City", name: "Hải Phòng" },
    { type: "City", name: "Hạ Long" },
    { type: "City", name: "Móng Cái" },
    { type: "AdministrativeArea", name: "Bắc Ninh" },
    { type: "AdministrativeArea", name: "Bắc Giang" },
  ],
  priceRange: "150.000đ - 2.500.000đ",
  commitments: SIX_COMMITMENTS,
  paymentMethods: PAYMENT_METHODS,
  testimonials: TESTIMONIALS,
};

const text = (value: string | null | undefined): string => value ?? "";

export async function getCompanySettings(): Promise<CompanySettingsData> {
  if (typeof window === "undefined") {
    return getCompanySettingsDirect();
  }
  try {
    const doc = await cmsGet<CompanySettingsOut>("/api/v1/settings/company", ["company"]);
    const identity = doc.identity ?? {};
    const contact = doc.contact ?? {};
    const location = doc.location ?? {};
    const banner = doc.banner ?? {};
    const brandSeo = doc.brandSeo ?? {};
    const secondaryPhone = contact.secondaryPhone ?? null;

    const info: CompanyInfoData = {
      name: text(identity.companyName) || COMPANY_INFO.name,
      brandName: text(identity.brandName) || COMPANY_INFO.brandName,
      hotline: text(contact.hotline) || COMPANY_INFO.hotline,
      hotlineRaw: text(contact.hotlineRaw) || COMPANY_INFO.hotlineRaw,
      hotlineHref: text(doc.hotlineHref) || COMPANY_INFO.hotlineHref,
      zaloHref: text(doc.zaloHref) || COMPANY_INFO.zaloHref,
      smsHref: text(doc.smsHref) || COMPANY_INFO.smsHref,
      email: text(contact.email) || COMPANY_INFO.email,
      website: text(identity.website) || COMPANY_INFO.website,
      domainName: text(doc.domainName) || COMPANY_INFO.domainName,
      fanpage: text(contact.fanpageName) || COMPANY_INFO.fanpage,
      fanpageUrl: text(contact.fanpageUrl) || COMPANY_INFO.fanpageUrl,
      topBannerLine1: text(banner.topBannerLine1) || COMPANY_INFO.topBannerLine1,
      topBannerLine2: text(banner.topBannerLine2) || COMPANY_INFO.topBannerLine2,
      coverage: text(banner.coverage) || COMPANY_INFO.coverage,
      workingHours: text(banner.workingHours) || COMPANY_INFO.workingHours,
      fleetDescription: text(banner.fleetDescription) || COMPANY_INFO.fleetDescription,
      bookingPromise: text(banner.bookingPromise) || COMPANY_INFO.bookingPromise,
      summary: text(banner.summary) || COMPANY_INFO.summary,
    };

    const commitments =
      doc.commitments && doc.commitments.length > 0
        ? doc.commitments.map((item, index) => ({
            id: item.id ?? `commitment-${index + 1}`,
            title: item.title,
            description: item.description,
            iconName: item.iconName,
          }))
        : SIX_COMMITMENTS;

    const paymentMethods =
      doc.paymentMethods && doc.paymentMethods.length > 0
        ? doc.paymentMethods.map((item, index) => ({
            id: item.id ?? `payment-${index + 1}`,
            title: item.title,
            description: item.description,
            iconName: item.iconName,
          }))
        : PAYMENT_METHODS;

    const testimonials =
      doc.testimonials && doc.testimonials.length > 0
        ? doc.testimonials
            .filter((item) => item.isVisible !== false)
            .map((item, index) => ({
              id: item.id ?? `testimonial-${index + 1}`,
              author: item.author,
              location: item.location ?? "",
              content: item.content,
              rating: item.rating ?? 5,
              avatarText: item.avatarText ?? "",
            }))
        : TESTIMONIALS;

    const cmsAreaServed = (brandSeo.areaServed ?? [])
      .filter((item) => typeof item?.name === "string" && item.name.length > 0)
      .map((item) => ({ type: item.type ?? "City", name: item.name as string }));

    return {
      info,
      address: location.address ?? FALLBACK_COMPANY_SETTINGS.address,
      mapEmbedUrl: location.mapEmbedUrl ?? FALLBACK_COMPANY_SETTINGS.mapEmbedUrl,
      latitude: location.latitude ?? FALLBACK_COMPANY_SETTINGS.latitude,
      longitude: location.longitude ?? FALLBACK_COMPANY_SETTINGS.longitude,
      secondaryPhone: secondaryPhone
        ? { label: secondaryPhone.label ?? null, number: secondaryPhone.number ?? null }
        : null,
      areaServed:
        cmsAreaServed.length > 0 ? cmsAreaServed : FALLBACK_COMPANY_SETTINGS.areaServed,
      priceRange: brandSeo.priceRange ?? FALLBACK_COMPANY_SETTINGS.priceRange,
      commitments,
      paymentMethods,
      testimonials,
    };
  } catch {
    return FALLBACK_COMPANY_SETTINGS;
  }
}

export async function getCompanyInfo(): Promise<CompanyInfoData> {
  const settings = await getCompanySettings();
  return settings.info;
}

export type VehiclePriceGroup = {
  sedan5Seats: number | null;
  suv7Seats: number | null;
  van16Seats: number | null;
};

export type AirportPricingRow = {
  slug: string;
  district: string;
  fromHanoiToAirport: VehiclePriceGroup;
  fromAirportToHanoi: VehiclePriceGroup;
  roundTrip: VehiclePriceGroup;
};

export type DistanceRate = {
  label: string;
  minKm: number;
  maxKm: number | null;
  sedan5Seats: number;
  suv7Seats: number;
  van16Seats: number;
};

export type DistancePolicies = {
  roundTripDiscountText: string | null;
  waitingTimeText: string | null;
  waitingFreeMinutes: number | null;
  waitingFeePerHour: number | null;
  waitingMaxHours: number | null;
  tollsNote: string | null;
  overnightNote: string | null;
  overnightPhone: string | null;
};

export type DistancePricing = {
  rates: DistanceRate[];
  policies: DistancePolicies;
};

export type PricingSettings = {
  parcelFromPrice: number | null;
  parcelDeliveryText: string | null;
  maxPassengersPerShareTrip: number | null;
  minLeadTimeMinutes: number | null;
  freeCancelMinutes: number | null;
  returningCustomerDiscountPercent: number | null;
  priceValidUntil: string | null;
  roundTripDiscountText: string | null;
  waitingTimeText: string | null;
  waitingFreeMinutes: number | null;
  waitingFeePerHour: number | null;
  waitingMaxHours: number | null;
  tollsNote: string | null;
  tollsNoteShort: string | null;
  overnightNote: string | null;
  overnightPhone: string | null;
  holidayNote: string | null;
  priceValidUntilWarning: string | null;
};

export function getAirportPricing(): Promise<AirportPricingRow[]> {
  if (typeof window === "undefined") {
    return getAirportPricingDirect();
  }
  return cmsGet<AirportPricingRow[]>("/api/v1/pricing/airport", ["pricing", "airport-pricing"]);
}

export function getDistanceRates(): Promise<DistancePricing> {
  if (typeof window === "undefined") {
    return getDistanceRatesDirect();
  }
  return cmsGet<DistancePricing>("/api/v1/pricing/distance", ["pricing", "distance-rates"]);
}

export function getPricingSettings(): Promise<PricingSettings> {
  if (typeof window === "undefined") {
    return getPricingSettingsDirect();
  }
  return cmsGet<PricingSettings>("/api/v1/settings/pricing", ["pricing"]);
}

export type ArticleCategory = Article["category"];

export type ArticleCardOut = {
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  excerpt: string;
  author: string;
  featuredImage: CmsImage | null;
  publishedAt: string | null;
  updatedAt: string;
};

export type ArticleTocItem = { id: string; text: string; level?: number };

export type ArticleDetailOut = ArticleCardOut & {
  contentHtml: string;
  tableOfContents: ArticleTocItem[];
  authorType: string | null;
  relatedRoute: { slug: string; name: string; priceShare1Text: string } | null;
  seo: RouteSeo;
};

export type ArticleDetail = Article & {
  authorType: string | null;
  relatedRoute: { slug: string; name: string; priceShare1Text: string } | null;
  seo: RouteSeo;
};

export type GetArticlesOptions = {
  page?: number;
  limit?: number;
  category?: ArticleCategory;
  excludeSlug?: string;
};

export type ArticlesPage = {
  items: Article[];
  meta: { page: number; limit: number; totalDocs: number; totalPages: number };
};

function toArticle(card: ArticleCardOut): Article {
  return {
    slug: card.slug,
    title: card.title,
    category: card.category as ArticleCategory,
    categoryName: card.categoryName,
    publishedAt: card.publishedAt ?? "",
    updatedAt: card.updatedAt,
    author: card.author,
    excerpt: card.excerpt,
    content: "",
    tableOfContents: [],
    image: card.featuredImage?.url ?? "",
  };
}

export async function getArticles(options: GetArticlesOptions = {}): Promise<ArticlesPage> {
  if (typeof window === "undefined") {
    return getArticlesDirect(options);
  }
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.category) params.set("category", options.category);
  if (options.excludeSlug) params.set("excludeSlug", options.excludeSlug);
  const query = params.toString();
  const { data, meta } = await request<ArticleCardOut[]>(`/api/v1/articles${query ? `?${query}` : ""}`, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["articles", "sitemap"] },
  });
  const pagination = (meta ?? {}) as Partial<ArticlesPage["meta"]>;
  return {
    items: data.map(toArticle),
    meta: {
      page: pagination.page ?? options.page ?? 1,
      limit: pagination.limit ?? options.limit ?? 12,
      totalDocs: pagination.totalDocs ?? data.length,
      totalPages: pagination.totalPages ?? 1,
    },
  };
}

export async function getArticle(slug: string): Promise<ArticleDetail> {
  if (typeof window === "undefined") {
    return getArticleDirect(slug);
  }
  const data = await cmsGet<ArticleDetailOut>(`/api/v1/articles/${encodeURIComponent(slug)}`, [
    "articles",
    `articles:${slug}`,
    "sitemap",
  ]);
  return {
    ...toArticle(data),
    content: data.contentHtml ?? "",
    tableOfContents: data.tableOfContents ?? [],
    authorType: data.authorType ?? null,
    relatedRoute: data.relatedRoute ?? null,
    seo: data.seo,
  };
}

export type PageSeo = RouteSeo;

export type CmsPage = {
  slug: string;
  title: string;
  kind: string;
  contentHtml?: string;
  content?: unknown;
  seo: PageSeo;
  updatedAt: string;
};

export async function getPage(slugOrPath: string): Promise<CmsPage> {
  if (typeof window === "undefined") {
    return getPageDirect(slugOrPath);
  }
  const normalized = slugOrPath.replace(/^\/+/, "").replace(/\/+$/, "");
  const asSlug = normalized.split("/").join("--");
  return cmsGet<CmsPage>(
    `/api/v1/pages/${encodeURIComponent(asSlug)}?path=${encodeURIComponent(normalized)}`,
    ["pages", `pages:${normalized}`, "sitemap"],
  );
}

export type BookingInput = {
  customerName: string;
  customerPhone: string;
  routeSlug?: string | null;
  pickupLocation: string;
  dropoffLocation: string;
  rideType?: "ghep" | "bao" | null;
  vehicleType: "4cho" | "5cho" | "7cho" | "16cho" | "guihang";
  passengerCount?: number;
  pickupDateTime: string;
  note?: string | null;
  airportDistrict?: string | null;
  airportDirection?: "to_airport" | "from_airport" | "round_trip" | null;
  distanceKm?: number | null;
  website?: string;
  captchaToken?: string;
};

export type BookingCreateResult = {
  bookingCode: string;
  lookupToken: string;
  customerName?: string;
  customerPhone?: string;
  route: { slug: string; name: string } | null;
  pickupLocation?: string;
  dropoffLocation?: string;
  rideType: "ghep" | "bao" | null;
  vehicleType: string;
  passengerCount: number;
  pickupDateTime: string;
  priceType: string | null;
  estimatedPrice: number | null;
  estimatedPriceMax: number | null;
  estimatedPriceFormatted: string;
  unit: string;
  priceNote: string;
  paymentMethod: string;
  status: string;
  statusLabel: string;
  createdAt: string;
};

export type BookingLookupResult = {
  bookingCode: string;
  customerName: string;
  customerPhoneMasked: string;
  route: { slug: string; name: string } | null;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string | null;
  rideType: "ghep" | "bao" | null;
  vehicleType: string;
  passengerCount: number;
  priceType: string | null;
  estimatedPrice: number | null;
  estimatedPriceFormatted: string;
  paymentMethod: string | null;
  paymentMethodLabel: string | null;
  status: string;
  statusLabel: string;
};

export function postBooking(body: BookingInput, idempotencyKey?: string): Promise<BookingCreateResult> {
  return cmsPost<BookingCreateResult>("/api/v1/bookings", body, idempotencyKey);
}

export function lookupBooking(
  code: string,
  options: { token?: string; phoneLast4?: string } = {},
): Promise<BookingLookupResult> {
  const params = new URLSearchParams();
  if (options.token) params.set("t", options.token);
  if (options.phoneLast4) params.set("phoneLast4", options.phoneLast4);
  const query = params.toString();
  return request<BookingLookupResult>(
    `/api/v1/bookings/${encodeURIComponent(code)}${query ? `?${query}` : ""}`,
    { cache: "no-store" },
  ).then((result) => result.data);
}

export type RedirectEntry = {
  from: string;
  to: string;
  statusCode: number;
};

export function getRedirects(options: { timeoutMs?: number } = {}): Promise<RedirectEntry[]> {
  return cmsGet<RedirectEntry[]>(
    "/api/v1/redirects",
    ["redirects"],
    REVALIDATE_SECONDS,
    options.timeoutMs ?? 1000,
  );
}

export type SitemapEntry = {
  path: string;
  lastmod: string | null;
  type: "page" | "route" | "article";
};

export function getSitemapEntries(): Promise<SitemapEntry[]> {
  return cmsGet<SitemapEntry[]>("/api/v1/seo/sitemap", ["sitemap"]);
}
