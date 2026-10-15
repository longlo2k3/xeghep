import { NextResponse, type NextRequest } from "next/server";

import { getRedirects, type RedirectEntry } from "@/lib/api/redirects";
import { resolveRedirect } from "@/lib/redirects";

const CACHE_MS = 60_000;
const FAILURE_BACKOFF_MS = 10_000;
const MIDDLEWARE_TIMEOUT_MS = 500;

/** Cookie token của Admin CMS (src/admin/lib/api-client.ts), path=/ nên middleware đọc được. */
const ADMIN_TOKEN_COOKIE = "cms_admin_token";

let cache: { at: number; entries: RedirectEntry[] } | null = null;
let pending: Promise<RedirectEntry[]> | null = null;

/** Cache trong RAM 60s; CMS chết hoặc chậm → fail-open (không 500, không chặn tải trang). */
async function loadRedirects(): Promise<RedirectEntry[]> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) return cache.entries;
  if (pending) return pending;

  pending = (async () => {
    try {
      const entries = await getRedirects({ timeoutMs: MIDDLEWARE_TIMEOUT_MS });
      cache = { at: Date.now(), entries };
      return entries;
    } catch {
      // Fail-open: giữ dữ liệu cũ (nếu có) và tạm dừng gọi lại 10 giây.
      cache = { at: Date.now() - CACHE_MS + FAILURE_BACKOFF_MS, entries: cache?.entries ?? [] };
      return cache.entries;
    } finally {
      pending = null;
    }
  })();

  return pending;
}

function isAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/payload-admin" ||
    pathname.startsWith("/payload-admin/")
  );
}

/**
 * Khu quản trị:
 * - `/admin` (SPA CMS) và `/payload-admin` (Payload admin UI): header
 *   `X-Robots-Tag: noindex, nofollow` (T081/FR-C06) — meta robots trong layout chỉ là lớp bổ sung.
 * - `/admin` bắt buộc có cookie đăng nhập (trừ trang `/admin/login`); thiếu cookie → 307 về login.
 *   Auth thật (token hợp lệ) vẫn do payload access control + AuthContext đảm nhiệm.
 */
function handleAdminRequest(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  const isLoginPath = pathname === "/admin/login" || pathname.startsWith("/admin/login/");
  if (pathname.startsWith("/admin") && !isLoginPath && !request.cookies.has(ADMIN_TOKEN_COOKIE)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 307);
  }

  return response;
}

export async function middleware(request: NextRequest): Promise<Response> {
  if (isAdminPath(request.nextUrl.pathname)) {
    return handleAdminRequest(request);
  }

  const entriesPromise = loadRedirects();
  const timeoutPromise = new Promise<RedirectEntry[]>((resolve) =>
    setTimeout(() => resolve(cache?.entries ?? []), MIDDLEWARE_TIMEOUT_MS),
  );

  const entries = await Promise.race([entriesPromise, timeoutPromise]);
  if (entries.length === 0) return NextResponse.next();

  const decision = resolveRedirect(request.nextUrl.pathname, entries, request.nextUrl.search);
  if (decision.type === "none") return NextResponse.next();
  if (decision.type === "gone") return new NextResponse(null, { status: 410 });

  return NextResponse.redirect(new URL(decision.location, request.url), decision.statusCode);
}

export const config = {
  matcher: [
    // Khu quản trị: luôn chạy (chỉ gắn header + guard cookie, không CMS redirect)
    "/admin",
    "/admin/:path*",
    "/payload-admin",
    "/payload-admin/:path*",
    // Public: CMS redirects — loại static/asset (giữ nguyên matcher của website)
    "/((?!_next|api|admin|payload-admin|media|favicon|robots|sitemap|.*\\..*).*)",
  ],
};
