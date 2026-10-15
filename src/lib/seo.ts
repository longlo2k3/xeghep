import type { Metadata } from "next";

export const SITE_DOMAIN = "https://xegheplientinh.vn";
export const BRAND_NAME = "Xe Ghép Liên Tỉnh";
export const DEFAULT_OG_IMAGE = `${SITE_DOMAIN}/images/og-xe-ghep-lien-tinh.webp`;

export interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  image?: string;
  noindex?: boolean;
}

/**
 * Creates standardized, compliant SEO Metadata for Next.js App Router
 * Strictly complies with AGENTS.md sections 1, 2, 4, 14.1
 */
export function constructMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
}: PageMetadataInput): Metadata {
  const canonicalUrl = `${SITE_DOMAIN}${path}`;
  const cleanTitle = title.endsWith(` | ${BRAND_NAME}`)
    ? title.slice(0, -(BRAND_NAME.length + 3))
    : title;
  const fullTitle = `${cleanTitle} | ${BRAND_NAME}`;

  const metadata: Metadata = {
    title: cleanTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: BRAND_NAME,
      locale: "vi_VN",
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };

  if (type === "article" && publishedTime) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: "article",
      publishedTime,
      modifiedTime: modifiedTime || publishedTime,
      authors: author ? [author] : [BRAND_NAME],
    };
  }

  return metadata;
}
