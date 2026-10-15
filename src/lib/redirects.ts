import type { RedirectEntry } from "./api";

/** Giảm độ phức tạp matcher: chỉ cần 3 trạng thái. */
export type RedirectDecision =
  | { type: "none" }
  | { type: "gone" }
  | { type: "redirect"; location: string; statusCode: 301 | 308 };

/** Bỏ dấu / (trừ trang chủ), chuyển về chữ thường để so khớp ổn định. */
export function normalizePath(pathname: string): string {
  let p = String(pathname ?? "").split("?")[0].split("#")[0].toLowerCase();
  if (p.length > 1) {
    p = p.replace(/\/+$/, "");
    if (p === "") p = "/";
  }
  if (!p.startsWith("/")) p = `/${p}`;
  return p;
}

function toStatusCode(statusCode: number | string | undefined): 301 | 308 | 410 {
  const code = Number(statusCode);
  if (code === 410) return 410;
  if (code === 308) return 308;
  return 301;
}

/**
 * So khớp 1 bước (không đi theo chuỗi): `from` khớp → trả quyết định.
 * Không có vòng lặp: đích trùng đường dẫn hiện tại → bỏ qua.
 */
export function resolveRedirect(
  pathname: string,
  redirects: RedirectEntry[],
  search = "",
): RedirectDecision {
  if (!Array.isArray(redirects) || redirects.length === 0) return { type: "none" };

  const current = normalizePath(pathname);
  for (const entry of redirects) {
    if (!entry || typeof entry.from !== "string") continue;
    const from = normalizePath(entry.from);
    if (!from || from !== current) continue;

    const to = String(entry.to ?? "").trim();
    if (!to) return { type: "none" };

    const status = toStatusCode(entry.statusCode);
    if (status === 410) return { type: "gone" };

    const targetPath = normalizePath(to);
    if (targetPath === current) return { type: "none" };

    const location = search && !to.includes("?") ? `${to}${search}` : to;
    return { type: "redirect", location, statusCode: status };
  }

  return { type: "none" };
}
