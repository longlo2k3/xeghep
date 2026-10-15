import { SITE_DOMAIN, BRAND_NAME } from "./seo";
import type { CompanySettingsData } from "./api";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface RouteSchemaInput {
  name: string;
  description: string;
  priceFrom: number;
  origin: string;
  destination: string;
  path: string;
}

export interface ArticleSchemaInput {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  imageUrl?: string;
}

/**
 * Builds the master Organization and TaxiService Schema.org @graph definition
 * Accurately represents Xe Ghép Liên Tỉnh (xegheplientinh.vn) based on spec_v2.md
 */
export function buildGlobalBusinessSchema(settings?: CompanySettingsData) {
  const telephone = settings?.info?.hotlineRaw
    ? `+84${settings.info.hotlineRaw.replace(/^0/, "")}`
    : "+84962298293";
  const orgName = settings?.info?.name || "Xe Ghép Liên Tỉnh";
  const brandName = settings?.info?.brandName || BRAND_NAME;
  const serviceType =
    settings?.info?.summary ||
    "Dịch vụ xe ghép, xe tiện chuyến Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang";
  const priceRange = settings?.priceRange || "150.000đ - 2.500.000đ";
  const areaServed =
    settings?.areaServed && settings.areaServed.length > 0
      ? settings.areaServed.map((item) => ({
          "@type": item.type || "City",
          name: item.name,
        }))
      : [
          { "@type": "City", name: "Hải Phòng" },
          { "@type": "City", name: "Hà Nội" },
          { "@type": "City", name: "Hạ Long" },
          { "@type": "City", name: "Móng Cái" },
          { "@type": "AdministrativeArea", name: "Bắc Ninh" },
          { "@type": "AdministrativeArea", name: "Bắc Giang" },
          { "@type": "AdministrativeArea", name: "Hải Dương" },
          { "@type": "AdministrativeArea", name: "Thái Nguyên" },
        ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_DOMAIN}/#organization`,
        name: orgName,
        alternateName: brandName,
        url: SITE_DOMAIN,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_DOMAIN}/images/logo-xe-ghep-lien-tinh.png`,
          width: 512,
          height: 512,
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone,
            contactType: "customer service",
            areaServed: "VN",
            availableLanguage: ["Vietnamese"],
          },
        ],
      },
      {
        "@type": "TaxiService",
        "@id": `${SITE_DOMAIN}/#taxiservice`,
        name: `Dịch Vụ ${orgName}`,
        serviceType,
        provider: {
          "@id": `${SITE_DOMAIN}/#organization`,
        },
        areaServed,
        hoursAvailable: "Mo-Su 00:00-24:00",
        telephone,
        priceRange,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_DOMAIN}/#website`,
        url: SITE_DOMAIN,
        name: brandName,
        publisher: {
          "@id": `${SITE_DOMAIN}/#organization`,
        },
        inLanguage: "vi-VN",
      },
    ],
  };
}

/**
 * Builds Schema.org BreadcrumbList
 */
export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_DOMAIN}${item.path}`,
    })),
  };
}

/**
 * Builds Route / Service Schema with truthful Offer pricing
 */
export function buildRouteServiceSchema({
  name,
  description,
  priceFrom,
  origin,
  destination,
  path,
}: RouteSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${SITE_DOMAIN}${path}#service`,
        name,
        description,
        serviceType: "Xe ghép liên tỉnh & Bao xe tiện chuyến",
        provider: {
          "@id": `${SITE_DOMAIN}/#organization`,
        },
        areaServed: [
          { "@type": "Place", name: origin },
          { "@type": "Place", name: destination },
        ],
        offers: {
          "@type": "Offer",
          price: priceFrom.toString(),
          priceCurrency: "VND",
          priceValidUntil: "2026-12-31",
          availability: "https://schema.org/InStock",
          url: `${SITE_DOMAIN}${path}`,
        },
      },
    ],
  };
}

/**
 * Builds Schema.org Article for Blog / News post
 */
export function buildArticleSchema({
  title,
  description,
  path,
  datePublished,
  dateModified,
  authorName = BRAND_NAME,
  imageUrl,
}: ArticleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${SITE_DOMAIN}${path}#article`,
        headline: title,
        description,
        inLanguage: "vi-VN",
        mainEntityOfPage: `${SITE_DOMAIN}${path}`,
        datePublished,
        dateModified: dateModified || datePublished,
        author: {
          "@type": "Organization",
          name: authorName,
          url: SITE_DOMAIN,
        },
        publisher: {
          "@id": `${SITE_DOMAIN}/#organization`,
        },
        image: imageUrl || `${SITE_DOMAIN}/images/og-xe-ghep-lien-tinh.webp`,
      },
    ],
  };
}
