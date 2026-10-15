import { describe, it, expect } from "vitest";
import { POPULAR_ROUTES } from "./fixtures/routes";
import { ARTICLES } from "../src/data/articles";
import { constructMetadata, SITE_DOMAIN, BRAND_NAME } from "../src/lib/seo";

describe("All Routes and Articles SEO Metadata Consistency", () => {
  it("Every route in POPULAR_ROUTES produces a valid self-referencing canonical URL under /tuyen-lien-tinh/", () => {
    for (const route of POPULAR_ROUTES) {
      const path = `/tuyen-lien-tinh/${route.slug}`;
      const meta = constructMetadata({
        title: `${route.name} - Giá Rẻ`,
        description: route.description,
        path,
      });

      expect(meta.alternates?.canonical).toBe(`${SITE_DOMAIN}${path}`);
      expect(meta.openGraph?.url).toBe(`${SITE_DOMAIN}${path}`);
      expect(meta.title).toBe(`${route.name} - Giá Rẻ`);
      expect(meta.openGraph?.title).toContain(BRAND_NAME);
    }
  });

  it("Every article in ARTICLES produces valid article Open Graph metadata", () => {
    for (const article of ARTICLES) {
      const meta = constructMetadata({
        title: article.title,
        description: article.excerpt,
        path: `/tin-tuc/${article.slug}`,
        type: "article",
        publishedTime: article.publishedAt,
        author: article.author,
      });

      expect(meta.alternates?.canonical).toBe(`${SITE_DOMAIN}/tin-tuc/${article.slug}`);
      expect((meta.openGraph as any)?.type).toBe("article");
      expect((meta.openGraph as any)?.publishedTime).toBe(article.publishedAt);
    }
  });

  it("Contact page produces compliant SEO metadata with canonical, title, and OG", () => {
    const meta = constructMetadata({
      title: "Liên Hệ Đặt Xe Ghép - Phục Vụ 24/7 Toàn Tuyến Liên Tỉnh",
      description:
        "Tổng đài liên hệ và đặt xe ghép liên tỉnh 24/7. Hỗ trợ đón trả tận nhà, bao xe riêng, gửi hàng hỏa tốc các tuyến Móng Cái – Hạ Long – Hải Phòng – Bắc Ninh – Bắc Giang – Hà Nội.",
      path: "/lien-he",
    });
    expect(meta.title).toBe("Liên Hệ Đặt Xe Ghép - Phục Vụ 24/7 Toàn Tuyến Liên Tỉnh");
    expect(meta.alternates?.canonical).toBe(`${SITE_DOMAIN}/lien-he`);
    expect(meta.openGraph?.url).toBe(`${SITE_DOMAIN}/lien-he`);
    expect(meta.openGraph?.title).toContain(BRAND_NAME);
    expect(meta.description).toBeTruthy();
  });
});
