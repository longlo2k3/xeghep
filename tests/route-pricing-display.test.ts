import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

import { RoutePricingDisplay } from "@/components/routes/RoutePricingDisplay";

describe("public route pricing display", () => {
  it("renders configured HTML in raw server HTML and removes executable markup", () => {
    const html = renderToStaticMarkup(createElement(
      RoutePricingDisplay,
      { customHtml: '<table><tr><td>Giá tùy chỉnh</td></tr></table><script>alert(1)</script>' },
      createElement("table", null, createElement("tbody", null, createElement("tr", null, createElement("td", null, "Giá mặc định")))),
    ));

    expect(html).toContain("Giá tùy chỉnh");
    expect(html).not.toContain("Giá mặc định");
    expect(html).not.toContain("<script");
  });

  it("renders the tier table when custom HTML is inactive", () => {
    const html = renderToStaticMarkup(createElement(
      RoutePricingDisplay,
      { customHtml: null },
      createElement("table", null, createElement("tbody", null, createElement("tr", null, createElement("td", null, "400k")))),
    ));

    expect(html).toContain("400k");
  });

  it("scopes custom CSS and keeps responsive rules without leaking into the page", () => {
    const html = renderToStaticMarkup(createElement(RoutePricingDisplay, {
      customHtml: '<div class="price-card">Giá tuyến</div>',
      customCss: '.price-card { display: grid; gap: 12px; background: #fee2e2 } @media (max-width: 640px) { .price-card { display: block } } body { color: red }',
    }));

    expect(html).toContain('[data-route-pricing] .price-card');
    expect(html).toContain('@media (max-width: 640px)');
    expect(html).not.toContain('body{color:red}');
  });

  it("drops CSS imports and remote URLs", () => {
    const html = renderToStaticMarkup(createElement(RoutePricingDisplay, {
      customHtml: '<div class="price-card">Giá tuyến</div>',
      customCss: '@import url(https://example.com/x.css); :scope + body { color: red } .price-card { background-image: url(https://example.com/x.png); color: #dc2626 }',
    }));

    expect(html).not.toContain('example.com');
    expect(html).not.toContain('+ body');
    expect(html).toContain('color:#dc2626');
  });

  it("keeps the price in raw HTML when optional JavaScript is configured", () => {
    const html = renderToStaticMarkup(createElement(RoutePricingDisplay, {
      customHtml: '<div class="price">400k</div>',
      customJs: 'document.querySelector(".price").textContent = "500k"',
    }));
    expect(html).toContain('400k');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('500k');
  });
});
