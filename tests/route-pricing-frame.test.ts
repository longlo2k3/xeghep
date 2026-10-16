import { describe, expect, it } from "vitest";
import { buildRoutePricingFrame } from "@/lib/seo/buildRoutePricingFrame";

describe("route pricing script frame", () => {
  it("isolates scripts and prevents closing the bootstrap script", () => {
    const frame = buildRoutePricingFrame('<div>400k</div>', '', 'document.body.textContent = "</script><script>alert(1)</script>"', 'test-token');
    expect(frame).toContain("connect-src 'none'");
    expect(frame).toContain("form-action 'none'");
    expect(frame).toContain('<div data-route-pricing><div>400k</div></div>');
    expect(frame.match(/<script>/g)).toHaveLength(1);
    expect(frame).toContain('\\u003c/script>');
    expect(frame).toContain('test-token');
  });
});
