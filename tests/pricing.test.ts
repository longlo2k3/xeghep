import { describe, it, expect } from "vitest";
import { POPULAR_ROUTES, BANNER_TOP_ROUTES } from "./fixtures/routes";

describe("Data Layer & Pricing Rules per spec_v2.md", () => {
  it("POPULAR_ROUTES contains all 9 routes from spec_v2.md", () => {
    const slugs = POPULAR_ROUTES.map((r) => r.slug);
    expect(slugs).toHaveLength(9);
    expect(slugs).toContain("hai-phong-bac-ninh-bac-giang");
    expect(slugs).toContain("hai-phong-ha-noi-noi-bai");
    expect(slugs).toContain("hai-phong-ha-long");
    expect(slugs).toContain("hai-phong-mong-cai");
    expect(slugs).toContain("ha-long-bac-ninh-bac-giang");
    expect(slugs).toContain("ha-noi-mong-cai");
    expect(slugs).toContain("ha-noi-ha-long");
    expect(slugs).toContain("hai-phong-hai-duong");
    expect(slugs).toContain("hai-phong-thai-nguyen");
  });

  it("Each route has detailed pricing tiers and metadata from spec_v2.md", () => {
    for (const route of POPULAR_ROUTES) {
      expect(route.priceFrom).toBeGreaterThan(0);
      expect(route.priceShare1Text).toBeDefined();
      expect(route.priceCharter4to5Text).toBeDefined();
      expect(route.pricingDetails.length).toBeGreaterThan(0);
      expect(route.faqs.length).toBeGreaterThan(0);
      expect(route.pickups.length).toBeGreaterThan(0);
      expect(route.dropoffs.length).toBeGreaterThan(0);
    }
  });

  it("Route Hải Phòng ⇄ Hà Nội ⇄ Nội Bài has exact prices matching spec_v2.md", () => {
    const r = POPULAR_ROUTES.find((item) => item.slug === "hai-phong-ha-noi-noi-bai");
    expect(r).toBeDefined();
    expect(r?.priceShare1Text).toBe("400k");
    expect(r?.priceShare2Text).toBe("700k");
    expect(r?.priceCharter4to5Text).toBe("từ 899k");
    expect(r?.priceCharter7Text).toBe("từ 999k");
  });

  it("BANNER_TOP_ROUTES contains the 7 key routes from spec_v2.md Section 1", () => {
    expect(BANNER_TOP_ROUTES.length).toBe(7);
    expect(BANNER_TOP_ROUTES.map((r) => r.slug)).toContain("hai-phong-hai-duong");
    expect(BANNER_TOP_ROUTES.map((r) => r.slug)).toContain("hai-phong-ha-long");
    expect(BANNER_TOP_ROUTES.map((r) => r.slug)).toContain("hai-phong-thai-nguyen");
    expect(BANNER_TOP_ROUTES.map((r) => r.slug)).toContain("hai-phong-mong-cai");
    expect(BANNER_TOP_ROUTES.map((r) => r.slug)).toContain("ha-noi-mong-cai");
    expect(BANNER_TOP_ROUTES.map((r) => r.slug)).toContain("ha-long-bac-ninh-bac-giang");
    expect(BANNER_TOP_ROUTES.map((r) => r.slug)).toContain("hai-phong-ha-noi-noi-bai");
  });
});
