import type { MetadataRoute } from "next";
import { SITE_DOMAIN } from "@/lib/seo";
import { getSitemapEntries, getRoutes, type SitemapEntry } from "@/lib/api";
import { ARTICLES as FALLBACK_ARTICLES } from "@/data/articles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  try {
    const entries = await getSitemapEntries();
    if (Array.isArray(entries) && entries.length > 0) {
      return entries.map((entry: SitemapEntry) => {
        const url = `${SITE_DOMAIN}${entry.path}`;
        const lastModified = entry.lastmod ? new Date(entry.lastmod) : currentDate;

        return {
          url,
          lastModified,
        };
      });
    }
  } catch {
    // CMS offline fallback
  }

  // Fallback static list
  const fallbackPaths = [
    "/",
    "/gioi-thieu",
    "/tuyen-lien-tinh",
    "/dat-xe",
    "/tin-tuc",
    "/lien-he",
    "/chinh-sach/thanh-toan",
    "/chinh-sach/dam-bao",
    "/chinh-sach/bao-mat",
  ];

  const staticEntries: MetadataRoute.Sitemap = fallbackPaths.map((path) => ({
    url: `${SITE_DOMAIN}${path}`,
    lastModified: currentDate,
  }));

  let routeEntries: MetadataRoute.Sitemap = [];
  try {
    const routes = await getRoutes({ fields: "slug" });
    routeEntries = routes.map((r) => ({
      url: `${SITE_DOMAIN}/tuyen-lien-tinh/${r.slug}`,
      lastModified: currentDate,
    }));
  } catch {
    // Fallback if getRoutes fails
  }

  const articleEntries: MetadataRoute.Sitemap = FALLBACK_ARTICLES.map((article) => ({
    url: `${SITE_DOMAIN}/tin-tuc/${article.slug}`,
    lastModified: new Date(article.updatedAt),
  }));

  return [...staticEntries, ...routeEntries, ...articleEntries];
}

