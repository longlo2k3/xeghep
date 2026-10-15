/**
 * Slugify Vietnamese text strictly following AGENTS.md rule 4.2
 * Removes diacritics, maps 'đ' -> 'd', removes special characters
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Format currency in Vietnamese Dong (VND)
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format raw number with comma/dot separator
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount);
}
