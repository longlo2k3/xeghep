import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RoutePricingCard } from "@/components/home/RoutePricingGrid";
import type { RouteItem } from "@/lib/types";

Object.assign(globalThis, { React });

const route: RouteItem = {
  slug: "ha-noi-hai-phong",
  name: "Hà Nội - Hải Phòng",
  origin: "Hà Nội",
  destination: "Hải Phòng",
  distance: "120 km",
  duration: "2 giờ",
  priceFrom: 250_000,
  priceShare1Text: "250k - 300k",
  priceShare2Text: "",
  priceCharter4to5Text: "400k - 500k",
  priceCharter7Text: "500k - 600k",
  pricingDetails: [
    { label: "Ghép 1 khách", price: "250k - 300k" },
    { label: "Bao xe 4 chỗ", price: "400k - 500k" },
    { label: "Bao xe 7 chỗ", price: "500k - 600k" },
  ],
  description: "",
  pickups: [],
  dropoffs: [],
  faqs: [],
  regions: [],
};

describe("RoutePricingCard", () => {
  it("renders a two-column pricing layout on every breakpoint", () => {
    const html = renderToStaticMarkup(
      React.createElement(RoutePricingCard, { route }),
    );

    expect(html).toContain('data-testid="pricing-details"');
    expect(html).toContain("grid grid-cols-2");
    expect(html).toContain('aria-hidden="true"');
    expect(html.indexOf("Ghép 1 khách")).toBeLessThan(
      html.indexOf("Bao xe 4 chỗ"),
    );
    expect(html.indexOf("Bao xe 4 chỗ")).toBeLessThan(
      html.indexOf("Bao xe 7 chỗ"),
    );
  });

  it("renders badges, title and a call CTA", () => {
    const html = renderToStaticMarkup(
      React.createElement(RoutePricingCard, { route }),
    );

    expect(html).toContain("Chạy 24/7");
    expect(html).toContain("2 giờ");
    expect(html).toContain("Hà Nội - Hải Phòng");
    expect(html).toContain("Gọi ngay");
    expect(html).toContain('href="tel:');
    expect(html).toContain("/tuyen-lien-tinh/ha-noi-hai-phong");
  });

  it("normalizes local CMS media URLs to same-origin paths", () => {
    const html = renderToStaticMarkup(
      React.createElement(RoutePricingCard, {
        route: {
          ...route,
          imageUrl: "http://localhost:3001/media/HaiPhong-2.webp",
        },
      }),
    );

    expect(html).toContain("HaiPhong-2.webp");
    expect(html).not.toContain("localhost:3001");
  });

  it("falls back to a bundled image when no route image is configured", () => {
    const html = renderToStaticMarkup(
      React.createElement(RoutePricingCard, { route }),
    );

    expect(html).toContain("banner3.webp");
  });
});
