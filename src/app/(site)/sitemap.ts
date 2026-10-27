import type { MetadataRoute } from "next";
import { resolveSiteDomain } from "@/lib/seo";
import { getSitemapEntries, getRoutes, type SitemapEntry } from "@/lib/api";
import { ARTICLES as FALLBACK_ARTICLES } from "@/data/articles";

// Cập nhật URL từ CMS sau khi app production kết nối được Postgres.
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();
  const siteDomain = await resolveSiteDomain();

  try {
    const entries = await getSitemapEntries();
    if (Array.isArray(entries) && entries.length > 0) {
      return entries.map((entry: SitemapEntry) => {
        const url = `${siteDomain}${entry.path}`;
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
    url: `${siteDomain}${path}`,
    lastModified: currentDate,
  }));

  let routeEntries: MetadataRoute.Sitemap = [];
  try {
    const routes = await getRoutes({ fields: "slug" });
    routeEntries = routes.map((r) => ({
      url: `${siteDomain}/tuyen-lien-tinh/${r.slug}`,
      lastModified: currentDate,
    }));
  } catch {
    // Fallback if getRoutes fails
  }

  const articleEntries: MetadataRoute.Sitemap = FALLBACK_ARTICLES.map((article) => ({
    url: `${siteDomain}/tin-tuc/${article.slug}`,
    lastModified: new Date(article.updatedAt),
  }));

  return [...staticEntries, ...routeEntries, ...articleEntries];
}

