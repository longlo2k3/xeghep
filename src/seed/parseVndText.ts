/**
 * Chuyển chuỗi giá trên frontend (vd "400k – 500k", "từ 899k", "150.000đ")
 * thành PriceTier theo spec v1.1 Phụ lục B.2.
 */
export type PriceTier = {
  from: boolean;
  max: number | null;
  min: number | null;
  negotiable: boolean;
};

export function parseVndText(raw?: string | null): PriceTier | null {
  if (!raw) return null;
  const t = raw.trim().toLowerCase();

  if (/liên hệ|lien he|thỏa thuận|thoa thuan/.test(t)) {
    return { min: null, max: null, from: false, negotiable: true };
  }

  // "400k" → 400000 ; "1.500k" → 1500000 (bỏ dấu chấm phân cách)
  const nums = [...t.matchAll(/(\d[\d.]*)\s*k/g)].map(
    (m) => Number(m[1].replace(/\./g, "")) * 1000,
  );

  // VND nguyên văn: "150.000đ" → 150000 (giá đã là VND, không nhân 1000)
  if (nums.length === 0) {
    for (const m of t.matchAll(/(\d{1,3}(?:\.\d{3})+)đ/g)) {
      nums.push(Number(m[1].replace(/\./g, "")));
    }
  }

  if (nums.length === 0) throw new Error(`Không parse được giá: "${raw}"`);

  const from = t.startsWith("từ ") || t.startsWith("tu ");
  if (nums.length >= 2) {
    return { min: Math.min(...nums), max: Math.max(...nums), from: false, negotiable: false };
  }
  return { min: nums[0], max: null, from, negotiable: false };
}

/**
 * Tự kiểm tra khi seed (Phụ lục B.2): priceFrom hiện có phải bằng tierShare1.min.
 */
export function assertPriceFrom(route: {
  priceFrom: number | null;
  priceShare1Text?: string | null;
  slug: string;
}): void {
  const tier = parseVndText(route.priceShare1Text);
  if (!tier || tier.min !== route.priceFrom) {
    throw new Error(`Lệch priceFrom ở ${route.slug}: ${route.priceFrom} vs ${tier?.min}`);
  }
}
