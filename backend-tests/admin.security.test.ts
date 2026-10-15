import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { config as middlewareConfig, middleware } from "../src/middleware";

function makeRequest(url: string, cookie?: string): NextRequest {
  const headers = new Headers();
  if (cookie) headers.set("cookie", `cms_admin_token=${cookie}`);
  return new NextRequest(new Request(url, { headers }));
}

describe("T081 — admin security (middleware gộp: website redirects + admin guard)", () => {
  it("middleware redirect 307 về /admin/login khi thiếu cookie đăng nhập", async () => {
    const response = await middleware(makeRequest("http://localhost:3000/admin"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/admin/login");
  });

  it("middleware set X-Robots-Tag: noindex, nofollow cho /admin khi đã đăng nhập", async () => {
    const response = await middleware(
      makeRequest("http://localhost:3000/admin", "mock-token"),
    );
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("middleware không chặn trang đăng nhập /admin/login", async () => {
    const response = await middleware(makeRequest("http://localhost:3000/admin/login"));
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(response.headers.get("location")).toBeNull();
  });

  it("middleware set X-Robots-Tag cho /payload-admin (không guard cookie — Payload tự quản lý auth)", async () => {
    const response = await middleware(makeRequest("http://localhost:3000/payload-admin"));
    expect(response.status).toBe(200);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(response.headers.get("location")).toBeNull();
  });

  it("matcher bao gồm cả 3 nhóm: /admin, /payload-admin và redirect public (loại api/media qua lookahead)", () => {
    expect(middlewareConfig.matcher).toContain("/admin");
    expect(middlewareConfig.matcher).toContain("/admin/:path*");
    expect(middlewareConfig.matcher).toContain("/payload-admin");
    expect(middlewareConfig.matcher).toContain("/payload-admin/:path*");
    const publicPattern = middlewareConfig.matcher.find((m) => m.includes("(?!"));
    expect(publicPattern).toBeDefined();
    // Pattern public phải loại api/media/asset khỏi CMS redirect
    expect(publicPattern).toContain("api");
    expect(publicPattern).toContain("media");
  });

  it("admin.meta khai báo robots noindex + branding (T083)", async () => {
    const payloadConfig = await (await import("../src/payload.config")).default;
    const meta = payloadConfig.admin.meta as Record<string, unknown>;
    expect(meta.robots).toBe("noindex, nofollow");
    expect(meta.title).toBe("Xe Ghép Liên Tỉnh — Quản trị");
    expect(meta.icons).toEqual({ icon: "/logo.svg" });
    expect(payloadConfig.admin.components?.graphics?.Logo).toBeTruthy();
  }, 60_000);
});
