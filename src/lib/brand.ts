/**
 * Chuẩn hóa URL ảnh CMS cho `next/image`: ảnh local (localhost/127.0.0.1) trả về
 * đường dẫn same-origin để không phụ thuộc origin/port của PAYLOAD_PUBLIC_SERVER_URL.
 */
export function toMediaSrc(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/")) return url;
  try {
    const { hostname, pathname } = new URL(url);
    if ((hostname === "localhost" || hostname === "127.0.0.1" || pathname.startsWith("/media/")) && pathname) {
      return pathname;
    }
    return url;
  } catch {
    return url;
  }
}

/**
 * Tách tên thương hiệu để tô 2 màu như thiết kế: phần đầu (đậm) + 2 từ cuối (màu nhấn).
 * "Xe Ghép Liên Tỉnh" → ["Xe Ghép", "Liên Tỉnh"].
 */
export function splitBrandName(brandName: string): [string, string] {
  const words = brandName.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [brandName, ""];
  if (words.length === 2) return [words[0], words[1]];
  return [words.slice(0, -2).join(" "), words.slice(-2).join(" ")];
}
