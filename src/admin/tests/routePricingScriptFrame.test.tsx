import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RoutePricingScriptFrame } from "@/components/routes/RoutePricingScriptFrame";

afterEach(() => vi.unstubAllGlobals());

describe("route pricing JavaScript isolation", () => {
  it("loads custom behavior in an opaque-origin sandbox and keeps static HTML until loaded", async () => {
    vi.stubGlobal("crypto", { randomUUID: () => "test-token" });
    render(<RoutePricingScriptFrame html="<div>400k</div>" css="" javascript="document.body.dataset.ready = 'yes'" />);

    expect(screen.getByText("400k")).toBeTruthy();
    const frame = await waitFor(() => screen.getByTitle("Bảng giá chi tiết tuyến tương tác") as HTMLIFrameElement);
    expect(frame.getAttribute("sandbox")).toBe("allow-scripts");
    expect(frame.getAttribute("referrerpolicy")).toBe("no-referrer");
    expect(frame.srcdoc).toContain("connect-src 'none'");
    expect(frame.srcdoc).toContain("document.body.dataset.ready");
  });
});
