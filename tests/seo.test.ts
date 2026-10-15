import { describe, it, expect } from "vitest";
import { constructMetadata, SITE_DOMAIN, BRAND_NAME } from "../src/lib/seo";
import { slugify, formatVND } from "../src/lib/utils";

describe("SEO Utilities & Metadata Compliance", () => {
  it("slugify should strip Vietnamese accents and convert spaces/special chars to hyphens", () => {
    expect(slugify("Xe Ghép Hà Nội - Ninh Bình")).toBe("xe-ghep-ha-noi-ninh-binh");
    expect(slugify("Đón tiễn sân bay Nội Bài")).toBe("don-tien-san-bay-noi-bai");
    expect(slugify("Tối ưu SEO cho Frontend")).toBe("toi-uu-seo-cho-frontend");
  });

  it("formatVND should properly format currency in Vietnamese dong", () => {
    const formatted = formatVND(300000);
    expect(formatted).toContain("300.000");
  });

  it("constructMetadata should generate self-referencing absolute canonical URL", () => {
    const meta = constructMetadata({
      title: "Xe Ghép Ninh Bình",
      description: "Dịch vụ xe ghép Hà Nội Ninh Bình giá rẻ",
      path: "/xe-ghep-ninh-binh",
    });

    expect(meta.title).toBe("Xe Ghép Ninh Bình");
    expect(meta.description).toBe("Dịch vụ xe ghép Hà Nội Ninh Bình giá rẻ");
    expect(meta.alternates?.canonical).toBe(`${SITE_DOMAIN}/xe-ghep-ninh-binh`);
    expect(meta.openGraph?.url).toBe(`${SITE_DOMAIN}/xe-ghep-ninh-binh`);
    expect(meta.openGraph?.title).toBe(`Xe Ghép Ninh Bình | ${BRAND_NAME}`);
  });

  it("constructMetadata should apply noindex correctly when specified", () => {
    const meta = constructMetadata({
      title: "Đặt Xe Thành Công",
      description: "Xác nhận cuốc xe",
      path: "/dat-xe/thanh-cong",
      noindex: true,
    });

    expect(meta.robots).toEqual({
      index: false,
      follow: false,
    });
  });

  it("robots.ts never disallows noindex paths on production", async () => {
    const robotsModule = await import("../src/app/robots");
    const robotsFn = robotsModule.default;
    const prodRobots = robotsFn();
    const rules = Array.isArray(prodRobots.rules) ? prodRobots.rules[0] : prodRobots.rules;
    const disallowList = Array.isArray(rules?.disallow) ? rules.disallow : [rules?.disallow];

    // Strictly adheres to AGENTS.md rule 1.5: do not disallow pages with noindex
    expect(disallowList).not.toContain("/dat-xe/thanh-cong");
  });
});
