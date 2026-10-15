import { describe, it, expect } from "vitest";
import {
  buildGlobalBusinessSchema,
  buildBreadcrumbSchema,
  buildRouteServiceSchema,
  buildArticleSchema,
} from "../src/lib/schema";
import { SITE_DOMAIN, BRAND_NAME } from "../src/lib/seo";

describe("Schema.org JSON-LD Builders", () => {
  it("buildGlobalBusinessSchema generates valid @graph with Organization, TaxiService, and WebSite", () => {
    const schema = buildGlobalBusinessSchema();
    expect(schema["@context"]).toBe("https://schema.org");
    expect(Array.isArray(schema["@graph"])).toBe(true);

    const graph = schema["@graph"];
    const org = graph.find((item) => item["@type"] === "Organization");
    const taxiService = graph.find((item) => item["@type"] === "TaxiService");
    const website = graph.find((item) => item["@type"] === "WebSite");

    expect(org).toBeDefined();
    expect(org?.name).toBe("Xe Ghép Liên Tỉnh");
    expect(taxiService).toBeDefined();
    expect(taxiService?.telephone).toBe("+84962298293");
    expect(website).toBeDefined();
    expect(website?.url).toBe(SITE_DOMAIN);
  });

  it("buildGlobalBusinessSchema dynamically uses custom companySettings when provided", () => {
    const customSettings = {
      info: {
        name: "Công Ty Vận Tải VIP",
        brandName: "Xe Ghép VIP",
        hotline: "0988.111.222",
        hotlineRaw: "0988111222",
        hotlineHref: "tel:0988111222",
        zaloHref: "https://zalo.me/0988111222",
        smsHref: "sms:0988111222",
        email: "vip@example.com",
        website: "https://xegheplientinh.vn",
        domainName: "xegheplientinh.vn",
        fanpage: "Xe Ghép VIP",
        fanpageUrl: "https://facebook.com/xeghepvip",
        topBannerLine1: "BANNER 1",
        topBannerLine2: "BANNER 2",
        coverage: "Hà Nội - Hải Phòng",
        workingHours: "24/7",
        fleetDescription: "Xe VIP",
        bookingPromise: "Đón tận nơi",
        summary: "Dịch vụ xe ghép cao cấp",
      },
      address: "123 Lê Chân",
      mapEmbedUrl: null,
      latitude: null,
      longitude: null,
      secondaryPhone: null,
      areaServed: [{ type: "City", name: "Hải Phòng" }],
      priceRange: "200.000đ - 1.000.000đ",
      commitments: [],
      paymentMethods: [],
      testimonials: [],
    };

    const schema = buildGlobalBusinessSchema(customSettings);
    const graph = schema["@graph"];
    const org = graph.find((item) => item["@type"] === "Organization");
    const taxiService = graph.find((item) => item["@type"] === "TaxiService");

    expect(org?.name).toBe("Công Ty Vận Tải VIP");
    expect(org?.alternateName).toBe("Xe Ghép VIP");
    expect(taxiService?.telephone).toBe("+84988111222");
    expect(taxiService?.priceRange).toBe("200.000đ - 1.000.000đ");
    expect(taxiService?.areaServed).toEqual([{ "@type": "City", name: "Hải Phòng" }]);
  });

  it("buildBreadcrumbSchema creates valid BreadcrumbList", () => {
    const breadcrumbs = buildBreadcrumbSchema([
      { name: "Trang chủ", path: "/" },
      { name: "Các tuyến liên tỉnh", path: "/tuyen-lien-tinh" },
      { name: "Hải Phòng - Hà Nội", path: "/tuyen-lien-tinh/hai-phong-ha-noi-noi-bai" },
    ]);

    expect(breadcrumbs["@context"]).toBe("https://schema.org");
    expect(breadcrumbs["@type"]).toBe("BreadcrumbList");
    expect(breadcrumbs.itemListElement).toHaveLength(3);
    expect(breadcrumbs.itemListElement[0].position).toBe(1);
    expect(breadcrumbs.itemListElement[2].item).toBe(`${SITE_DOMAIN}/tuyen-lien-tinh/hai-phong-ha-noi-noi-bai`);
  });

  it("buildRouteServiceSchema outputs honest price Offer matching visible text", () => {
    const service = buildRouteServiceSchema({
      name: "Hải Phòng ⇄ Hà Nội ⇄ Nội Bài",
      description: "Xe ghép đón trả tận nhà",
      priceFrom: 400000,
      origin: "Hải Phòng",
      destination: "Hà Nội",
      path: "/tuyen-lien-tinh/hai-phong-ha-noi-noi-bai",
    });

    const s = service["@graph"][0];
    expect(s["@type"]).toBe("Service");
    expect(s.offers.price).toBe("400000");
    expect(s.offers.priceCurrency).toBe("VND");
  });

  it("buildArticleSchema sets valid Article metadata", () => {
    const article = buildArticleSchema({
      title: "Kinh nghiệm đặt xe ghép liên tỉnh",
      description: "Mô tả bài viết",
      path: "/tin-tuc/kinh-nghiem-dat-xe",
      datePublished: "2026-03-20T10:00:00+07:00",
    });

    const a = article["@graph"][0];
    expect(a["@type"]).toBe("Article");
    expect(a.headline).toBe("Kinh nghiệm đặt xe ghép liên tỉnh");
    expect(a.inLanguage).toBe("vi-VN");
  });
});
