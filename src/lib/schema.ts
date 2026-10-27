import { BRAND_NAME, normalizeSiteDomain, getFallbackSiteDomain } from "./seo";
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
  siteDomain?: string;
}

export interface ArticleSchemaInput {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  imageUrl?: string;
  siteDomain?: string;
}

/**
 * Builds the master Organization and TaxiService Schema.org @graph definition
 * Represents the current company settings on the canonical website.
 */
export function buildGlobalBusinessSchema(settings?: CompanySettingsData) {
  const siteDomain = normalizeSiteDomain(settings?.info?.website) || getFallbackSiteDomain();
  const telephone = settings?.info?.hotlineRaw
    ? `+84${settings.info.hotlineRaw.replace(/^0/, "")}`
    : "+84962298293";
  const orgName = settings?.info?.name || "Xe Ghép Liên Tỉnh";
  const brandName = settings?.info?.brandName || BRAND_NAME;
  const serviceType =
    settings?.info?.summary ||
    "Dịch vụ xe ghép, xe tiện chuyến Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang";
  const priceRange = settings?.priceRange || "150.000đ - 2.500.000đ";
  const logoSetting = settings?.info?.logoUrl;
  const logoUrl = logoSetting
    ? logoSetting.startsWith("http")
      ? logoSetting
      : `${siteDomain}${logoSetting}`
    : `${siteDomain}/icon.svg`;
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
        "@id": `${siteDomain}/#organization`,
        name: orgName,
        alternateName: brandName,
        url: siteDomain,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
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
        "@id": `${siteDomain}/#taxiservice`,
        name: `Dịch Vụ ${orgName}`,
        serviceType,
        provider: {
          "@id": `${siteDomain}/#organization`,
        },
        areaServed,
        hoursAvailable: "Mo-Su 00:00-24:00",
        telephone,
        priceRange,
      },
      {
        "@type": "WebSite",
        "@id": `${siteDomain}/#website`,
        url: siteDomain,
        name: brandName,
        publisher: {
          "@id": `${siteDomain}/#organization`,
        },
        inLanguage: "vi-VN",
      },
    ],
  };
}

/**
 * Builds Schema.org BreadcrumbList
 */
export function buildBreadcrumbSchema(items: BreadcrumbItem[], siteDomain?: string) {
  const domain = normalizeSiteDomain(siteDomain) || getFallbackSiteDomain();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${domain}${item.path}`,
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
  siteDomain,
}: RouteSchemaInput) {
  const domain = normalizeSiteDomain(siteDomain) || getFallbackSiteDomain();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${domain}${path}#service`,
        name,
        description,
        serviceType: "Xe ghép liên tỉnh & Bao xe tiện chuyến",
        provider: {
          "@id": `${domain}/#organization`,
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
          url: `${domain}${path}`,
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
  siteDomain,
}: ArticleSchemaInput) {
  const domain = normalizeSiteDomain(siteDomain) || getFallbackSiteDomain();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${domain}${path}#article`,
        headline: title,
        description,
        inLanguage: "vi-VN",
        mainEntityOfPage: `${domain}${path}`,
        datePublished,
        dateModified: dateModified || datePublished,
        author: {
          "@type": "Organization",
          name: authorName,
          url: domain,
        },
        publisher: {
          "@id": `${domain}/#organization`,
        },
        image: imageUrl || `${domain}/images/og-xe-ghep-lien-tinh.webp`,
      },
    ],
  };
}
