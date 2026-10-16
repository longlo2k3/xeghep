// @ts-expect-error jsdom is available through the test runner; this repo has no @types/jsdom.
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import { sanitizeRoutePricingHtml } from "@/lib/seo/sanitize";
import { sanitizeRoutePricingCss } from "@/lib/seo/sanitizeRoutePricingCss";
import { buildRoutePricingFrame } from "@/lib/seo/buildRoutePricingFrame";

describe("custom route pricing code", () => {
  it("keeps selectable classes and buttons for CSS and JavaScript", () => {
    const html = sanitizeRoutePricingHtml('<h1 className="test">Long</h1><button id="price-tab" type="button" data-price="600000">02 ghế ghép</button>');
    const document = new JSDOM(html).window.document;

    expect(document.querySelector(".test")?.textContent).toBe("Long");
    expect(document.querySelector(".test")?.tagName).toBe("H3");
    expect(document.querySelector<HTMLButtonElement>("#price-tab")?.dataset.price).toBe("600000");
    expect(document.querySelector("#price-tab")?.tagName).toBe("BUTTON");
  });

  it("keeps CSS variables scoped to the price table and accepts a quoted display keyword", () => {
    const css = sanitizeRoutePricingCss(':root { --accent: #dc2626 } .test { color: var(--accent); display: "none" }');

    expect(css).toContain("[data-route-pricing]{--accent:#dc2626}");
    expect(css).toContain("display:none");
    const html = sanitizeRoutePricingHtml('<h1 className="test">Long</h1>');
    const dom = new JSDOM(`<style>${css}</style><div data-route-pricing>${html}</div>`);
    expect(dom.window.getComputedStyle(dom.window.document.querySelector(".test")!).display).toBe("none");
    dom.window.close();
  });

  it("runs a click handler against the sanitized price table inside the frame", () => {
    const html = sanitizeRoutePricingHtml('<button id="price-tab" type="button">02 ghế ghép</button><span id="price">300.000</span>');
    const frame = buildRoutePricingFrame(html, "", 'document.querySelector("#price-tab").addEventListener("click", () => { document.querySelector("#price").textContent = "600.000" })', "test-token");
    const dom = new JSDOM(frame, {
      runScripts: "dangerously",
      beforeParse(window: Window) {
        Object.defineProperty(window, "ResizeObserver", { value: class { observe() {} } });
      },
    });

    dom.window.document.querySelector<HTMLButtonElement>("#price-tab")?.click();
    expect(dom.window.document.querySelector("#price")?.textContent).toBe("600.000");
    dom.window.close();
  });
});
