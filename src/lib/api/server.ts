import type { Where } from "payload";
import { getPayloadInstance } from "@/lib/api/ctx";
import {
  serializeRouteCard,
  serializeRouteDetail,
  type RouteCard,
} from "@/lib/api/serialize";
import { serializeCompanySettings } from "@/lib/settings/company";
import {
  serializeAirportPricing,
  serializeDistancePricing,
  type AirportPricingDoc,
  type DistanceRateDoc,
} from "@/lib/settings/serialize";
import {
  serializeArticleCard,
  serializeArticleDetail,
  serializeRelatedRoute,
} from "@/app/api/v1/articles/serialize";
import { resolvePageSlug, serializePage, type PageDoc } from "@/app/api/v1/pages/serialize";
import type { Article, Route } from "@/payload-types";
import { ARTICLES as FALLBACK_ARTICLES, type Article as FallbackArticle } from "@/data/articles";
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
import { ApiError } from "@/lib/api/client";
import { collectSitemapData } from "@/lib/seo/sitemap";
import type {
  RouteItem,
  RouteDetail,
  RouteCardOut,
  RouteDetailOut,
  GetRoutesOptions,
  CompanySettingsData,
  CompanyInfoData,
  CompanySettingsOut,
  AirportPricingRow,
  DistancePricing,
  PricingSettings,
  ArticlesPage,
  ArticleDetail,
  ArticleCategory,
  ArticleCardOut,
  GetArticlesOptions,
  CmsPage,
} from "@/lib/api";

const text = (value: string | null | undefined): string => value ?? "";

/** Ảnh CMS lưu dạng quan hệ media (populated) — trả về URL tương đối/absolute nếu có. */
const mediaUrl = (value: unknown): string | null => {
  if (value && typeof value === "object" && "url" in value) {
    const url = (value as { url?: unknown }).url;
    return typeof url === "string" && url.length > 0 ? url : null;
  }
  return null;
};
const mediaAlt = (value: unknown): string | null => {
  if (value && typeof value === "object" && "alt" in value) {
    const alt = (value as { alt?: unknown }).alt;
    return typeof alt === "string" && alt.trim() ? alt : null;
  }
  return null;
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

export function toRouteItem(card: RouteCardOut): RouteItem {
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
    pickups: card.pickups ?? [],
    dropoffs: card.dropoffs ?? [],
    faqs: [],
    regions: card.regions ?? [],
    isBannerTop: card.isBannerTop,
    imageUrl: card.ogImage?.url ?? card.thumbnail?.url ?? undefined,
  };
}

export function toRouteDetail(detail: RouteDetailOut): RouteDetail {
  return {
    ...toRouteItem(detail),
    description: detail.description ?? "",
    customPricingHtml: detail.customPricingHtml ?? null,
    customPricingCss: detail.customPricingCss ?? null,
    customPricingJs: detail.customPricingJs ?? null,
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

export function fallbackRouteDetail(slug: string): RouteDetail | null {
  const item = FALLBACK_ROUTES.find((r) => r.slug === slug);
  if (!item) return null;
  return {
    ...item,
    customPricingHtml: null,
    customPricingCss: null,
    customPricingJs: null,
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

export function formatCompanySettings(doc: CompanySettingsOut): CompanySettingsData {
  const identity = doc.identity ?? {};
  const contact = doc.contact ?? {};
  const location = doc.location ?? {};
  const banner = doc.banner ?? {};
  const brandSeo = doc.brandSeo ?? {};
  const secondaryPhone = contact.secondaryPhone ?? null;

  const info: CompanyInfoData = {
    name: text(identity.companyName) || COMPANY_INFO.name,
    brandName: text(identity.brandName) || COMPANY_INFO.brandName,
    logoUrl: mediaUrl(brandSeo.logo),
    defaultOgImageUrl: mediaUrl(brandSeo.defaultOgImage),
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
    heroImageUrl: mediaUrl(banner.heroImage) || COMPANY_INFO.heroImageUrl,
    heroImageAlt: mediaAlt(banner.heroImage) || COMPANY_INFO.heroImageAlt,
    heroTitleLine1: text(banner.heroTitleLine1) || COMPANY_INFO.heroTitleLine1,
    heroTitleLine2: text(banner.heroTitleLine2) || COMPANY_INFO.heroTitleLine2,
    heroDescription: text(banner.heroDescription) || COMPANY_INFO.heroDescription,
    heroBenefit1: text(banner.heroBenefit1) || COMPANY_INFO.heroBenefit1,
    heroBenefit2: text(banner.heroBenefit2) || COMPANY_INFO.heroBenefit2,
    heroBenefit3: text(banner.heroBenefit3) || COMPANY_INFO.heroBenefit3,
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
    areaServed: cmsAreaServed.length > 0 ? cmsAreaServed : FALLBACK_COMPANY_SETTINGS.areaServed,
    priceRange: brandSeo.priceRange ?? FALLBACK_COMPANY_SETTINGS.priceRange,
    commitments,
    paymentMethods,
    testimonials,
  };
}

export function toArticle(card: ArticleCardOut): FallbackArticle {
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

export async function getRoutesDirect(
  options: GetRoutesOptions & { fields?: "card" | "slug" | "full" } = {},
): Promise<RouteItem[] | { slug: string }[]> {
  try {
    const payload = await getPayloadInstance();
    const where: Where = { status: { equals: options.status ?? "active" } };
    if (options.isBannerTop !== undefined) where.isBannerTop = { equals: options.isBannerTop };
    if (options.region !== undefined) where.regions = { equals: options.region };

    const res = await payload.find({
      collection: "routes",
      limit: 100,
      depth: 2,
      sort: "createdAt",
      where,
      overrideAccess: true,
    });

    if (!res.docs || res.docs.length === 0) {
      if (options.fields === "slug") return FALLBACK_ROUTES.map((r) => ({ slug: r.slug }));
      return FALLBACK_ROUTES;
    }

    if (options.fields === "slug") {
      return res.docs.map((d) => ({ slug: d.slug }));
    }

    const cards = res.docs.map((d) =>
      options.fields === "full"
        ? serializeRouteDetail(d, { full: true })
        : serializeRouteCard(d),
    );
    return cards.map(toRouteItem);
  } catch (err) {
    console.warn("[getRoutesDirect] fallback to static:", err);
    if (options.fields === "slug") return FALLBACK_ROUTES.map((r) => ({ slug: r.slug }));
    return FALLBACK_ROUTES;
  }
}

export async function getRouteDirect(slug: string): Promise<RouteDetail> {
  try {
    const payload = await getPayloadInstance();
    const res = await payload.find({
      collection: "routes",
      limit: 1,
      depth: 2,
      where: { slug: { equals: slug }, status: { equals: "active" } },
      overrideAccess: true,
    });
    const route = res.docs[0];
    if (!route) {
      const fallback = fallbackRouteDetail(slug);
      if (fallback) return fallback;
      throw new ApiError("ROUTE_NOT_FOUND", "Không tìm thấy tuyến đường", 404);
    }

    let related: Route[] = [];
    if (Array.isArray(route.relatedRoutes) && route.relatedRoutes.length > 0) {
      related = route.relatedRoutes.filter(
        (r): r is Route => r != null && typeof r === "object" && "slug" in r && r.status === "active",
      );
    }
    if (related.length === 0) {
      const fallbackRelated = await payload.find({
        collection: "routes",
        limit: 3,
        depth: 2,
        sort: "createdAt",
        where: { status: { equals: "active" }, slug: { not_equals: route.slug } },
        overrideAccess: true,
      });
      related = fallbackRelated.docs;
    }
    const relatedCards: RouteCard[] = related.slice(0, 3).map((r) => serializeRouteCard(r));

    const pricingSettings = await payload.findGlobal({
      slug: "pricing_settings",
      overrideAccess: true,
    });

    const detail = serializeRouteDetail(route, {
      full: true,
      relatedRoutes: relatedCards,
      priceValidUntilFallback: pricingSettings.priceValidUntil ?? null,
    });

    return toRouteDetail(detail as any);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      const fallback = fallbackRouteDetail(slug);
      if (fallback) return fallback;
      throw err;
    }
    console.warn("[getRouteDirect] fallback to static:", err);
    const fallback = fallbackRouteDetail(slug);
    if (fallback) return fallback;
    throw err;
  }
}

export async function getCompanySettingsDirect(): Promise<CompanySettingsData> {
  try {
    const payload = await getPayloadInstance();
    const doc = await payload.findGlobal({ slug: "company_settings", overrideAccess: true });
    const serialized = serializeCompanySettings(doc as Record<string, any>);
    return formatCompanySettings(serialized);
  } catch (err) {
    console.warn("[getCompanySettingsDirect] fallback to static:", err);
    return FALLBACK_COMPANY_SETTINGS;
  }
}

export async function getArticlesDirect(options: GetArticlesOptions = {}): Promise<ArticlesPage> {
  try {
    const payload = await getPayloadInstance();
    const where: Where = { status: { equals: "published" } };
    if (options.category) where.category = { equals: options.category };
    if (options.excludeSlug) where.slug = { not_equals: options.excludeSlug };

    const page = options.page ?? 1;
    const limit = options.limit ?? 12;

    const res = await payload.find({
      collection: "articles",
      page,
      limit,
      depth: 1,
      sort: "-publishedAt",
      where,
      overrideAccess: true,
    });

    if (res.totalDocs === 0 && page === 1 && !options.category && !options.excludeSlug) {
      return {
        items: FALLBACK_ARTICLES,
        meta: { page: 1, limit: 12, totalDocs: FALLBACK_ARTICLES.length, totalPages: 1 },
      };
    }

    return {
      items: res.docs.map((d) => toArticle(serializeArticleCard(d as unknown as Article))),
      meta: {
        page: res.page ?? page,
        limit: res.limit ?? limit,
        totalDocs: res.totalDocs,
        totalPages: res.totalPages ?? 1,
      },
    };
  } catch (err) {
    console.warn("[getArticlesDirect] fallback to static:", err);
    return {
      items: FALLBACK_ARTICLES,
      meta: { page: 1, limit: 12, totalDocs: FALLBACK_ARTICLES.length, totalPages: 1 },
    };
  }
}

export async function getArticleDirect(slug: string): Promise<ArticleDetail> {
  try {
    const payload = await getPayloadInstance();
    const res = await payload.find({
      collection: "articles",
      limit: 1,
      depth: 1,
      where: { slug: { equals: slug }, status: { equals: "published" } },
      overrideAccess: true,
    });
    const article = res.docs[0] as unknown as Article | undefined;
    if (!article) {
      const fallback = FALLBACK_ARTICLES.find((a) => a.slug === slug);
      if (fallback) {
        return {
          ...fallback,
          authorType: null,
          relatedRoute: null,
          seo: {
            metaTitle: fallback.title,
            appendBrand: true,
            metaDescription: fallback.excerpt,
            ogImage: null,
            noindex: false,
          },
        };
      }
      throw new ApiError("ROUTE_NOT_FOUND", "Không tìm thấy bài viết", 404);
    }

    const related = article.relatedRoute;
    const relatedRoute =
      related && typeof related === "object" && "slug" in related
        ? serializeRelatedRoute(related as Route)
        : null;

    const detail = serializeArticleDetail(article, relatedRoute);
    return {
      ...toArticle(detail),
      content: detail.contentHtml ?? "",
      tableOfContents: detail.tableOfContents ?? [],
      authorType: detail.authorType ?? null,
      relatedRoute: detail.relatedRoute ?? null,
      seo: detail.seo,
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      const fallback = FALLBACK_ARTICLES.find((a) => a.slug === slug);
      if (fallback) {
        return {
          ...fallback,
          authorType: null,
          relatedRoute: null,
          seo: {
            metaTitle: fallback.title,
            appendBrand: true,
            metaDescription: fallback.excerpt,
            ogImage: null,
            noindex: false,
          },
        };
      }
      throw err;
    }
    console.warn("[getArticleDirect] fallback to static:", err);
    const fallback = FALLBACK_ARTICLES.find((a) => a.slug === slug);
    if (fallback) {
      return {
        ...fallback,
        authorType: null,
        relatedRoute: null,
        seo: {
          metaTitle: fallback.title,
          appendBrand: true,
          metaDescription: fallback.excerpt,
          ogImage: null,
          noindex: false,
        },
      };
    }
    throw err;
  }
}

export async function getAirportPricingDirect(): Promise<AirportPricingRow[]> {
  try {
    const payload = await getPayloadInstance();
    const res = await payload.find({
      collection: "airport_pricing",
      limit: 100,
      depth: 0,
      sort: "sortOrder",
      where: { isActive: { equals: true } },
      overrideAccess: true,
    });
    return res.docs.map((doc) => serializeAirportPricing(doc as AirportPricingDoc));
  } catch (err) {
    console.warn("[getAirportPricingDirect] error:", err);
    return [];
  }
}

export async function getDistanceRatesDirect(): Promise<DistancePricing> {
  try {
    const payload = await getPayloadInstance();
    const [ratesRes, settings] = await Promise.all([
      payload.find({
        collection: "distance_rates",
        limit: 100,
        depth: 0,
        sort: "minKm",
        overrideAccess: true,
      }),
      payload.findGlobal({ slug: "pricing_settings", overrideAccess: true }),
    ]);

    return serializeDistancePricing(
      ratesRes.docs.map(
        (doc): DistanceRateDoc => ({
          label: doc.label,
          minKm: doc.minKm,
          maxKm: doc.maxKm ?? null,
          sedan5Seats: doc.sedan5Seats,
          suv7Seats: doc.suv7Seats,
          van16Seats: doc.van16Seats,
        }),
      ),
      settings,
    );
  } catch (err) {
    console.warn("[getDistanceRatesDirect] error:", err);
    return { rates: [], policies: {} as any };
  }
}

export async function getPricingSettingsDirect(): Promise<PricingSettings> {
  try {
    const payload = await getPayloadInstance();
    return (await payload.findGlobal({
      slug: "pricing_settings",
      overrideAccess: true,
    })) as PricingSettings;
  } catch (err) {
    console.warn("[getPricingSettingsDirect] error:", err);
    return {} as PricingSettings;
  }
}

export async function getSitemapEntriesDirect() {
  try {
    const payload = await getPayloadInstance();
    return await collectSitemapData(payload);
  } catch (err) {
    console.warn("[getSitemapEntriesDirect] fallback to static:", err);
    return [];
  }
}

export async function getPageDirect(slugOrPath: string): Promise<CmsPage> {
  const normalized = slugOrPath.replace(/^\/+/, "").replace(/\/+$/, "");
  const target = resolvePageSlug({ slug: normalized.split("/").join("--"), path: normalized });
  if (!target) {
    throw new ApiError("ROUTE_NOT_FOUND", "Trang không tồn tại", 404);
  }

  const payload = await getPayloadInstance();
  const res = await payload.find({
    collection: "pages",
    limit: 1,
    depth: 1,
    where: { slug: { equals: target }, status: { equals: "published" } },
    overrideAccess: true,
  });
  const page = res.docs[0];
  if (!page) {
    throw new ApiError("ROUTE_NOT_FOUND", "Trang không tồn tại", 404);
  }

  return serializePage(page as unknown as PageDoc) as CmsPage;
}
