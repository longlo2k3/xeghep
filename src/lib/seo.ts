import type { Metadata } from "next";
import { getCompanySettings } from "@/lib/api";

/**
 * Normalizes any URL or domain string into a clean origin (e.g. "https://xeghep24h.vn").
 */
export function normalizeSiteDomain(input?: string | null): string {
  const raw = typeof input === "string" ? input.trim() : "";
  if (!raw) return "";
  try {
    const withProto = raw.includes("://") ? raw : `https://${raw}`;
    const parsed = new URL(withProto);
    return `${parsed.protocol}//${parsed.host}`.replace(/\/+$/, "");
  } catch {
    return raw.replace(/\/+$/, "");
  }
}

/**
 * Fallback domain when database is not yet initialized or during build time.
 */
export function getFallbackSiteDomain(): string {
  return (
    normalizeSiteDomain(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeSiteDomain(process.env.PAYLOAD_PUBLIC_SERVER_URL) ||
    "https://xeghephaiphonghanoi.com"
  );
}

/**
 * Resolves the primary site domain configured in Admin (CompanySettings).
 * Falls back to environment variable or default domain if unset.
 */
export async function resolveSiteDomain(): Promise<string> {
  if (process.env.VITEST) {
    return getFallbackSiteDomain();
  }
  try {
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
    const settingsPromise = getCompanySettings().catch(() => null);
    const settings = await Promise.race([settingsPromise, timeoutPromise]);
    const website = settings?.info?.website;
    if (website) {
      const normalized = normalizeSiteDomain(website);
      if (normalized) return normalized;
    }
  } catch {
    // fallback when DB/CMS is offline
  }
  return getFallbackSiteDomain();
}

export const SITE_DOMAIN = getFallbackSiteDomain();
export const BRAND_NAME = "Xe Ghép Liên Tỉnh";
export const DEFAULT_OG_IMAGE = "/images/og-xe-ghep-lien-tinh.webp";

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
  siteDomain?: string;
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
  siteDomain,
}: PageMetadataInput): Metadata {
  const canonicalUrl = siteDomain ? `${normalizeSiteDomain(siteDomain)}${path}` : path;
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
