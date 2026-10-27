import type { MetadataRoute } from "next";
import { resolveSiteDomain } from "@/lib/seo";

/**
 * Robots.txt configuration
 * - Rule 9.1/14.1 (mẫu Next.js): Disallow khu quản trị /admin/ và /payload-admin/.
 * - Rule 1.5 (không vừa Disallow vừa noindex): MIGRATION.md §4 (C1) — AC prompt yêu cầu
 *   CẢ HAI (Disallow + noindex), nên áp cả hai: Disallow ở đây + meta/X-Robots-Tag noindex
 *   (defense-in-depth). Nếu chủ site muốn tuân thủ 1.5 tuyệt đối: bỏ Disallow, giữ noindex.
 * - /api/ bị Disallow (endpoint dữ liệu, không cần crawl) — giữ nguyên từ website gốc.
 * - Non-production: Disallow toàn bộ để tránh index nhầm.
 */
// Cập nhật cấu hình robots định kỳ đồng bộ với domain trong CMS
export const revalidate = 60;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const isProd =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

  const siteDomain = await resolveSiteDomain();

  return isProd
    ? {
        rules: {
          userAgent: "*",
          allow: "/",
          disallow: ["/admin/", "/payload-admin/", "/api/"],
        },
        sitemap: `${siteDomain}/sitemap.xml`,
      }
    : {
        rules: {
          userAgent: "*",
          disallow: "/",
        },
      };
}

