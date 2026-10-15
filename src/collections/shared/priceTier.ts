import type { Field } from "payload";

export type PriceTierValue = {
  from?: boolean | null;
  max?: number | null;
  min?: number | null;
  negotiable?: boolean | null;
};

type TierArgs = {
  label: string;
  name: string;
  adminDescription?: string;
  requireMinRule?: boolean;
};

/**
 * Group `PriceTier` theo spec v1.1 §3.2.1: { min, max, from, negotiable }.
 * Validate FR-D05: min > 0; max >= min; (rule) ít nhất share1 hoặc charter45.
 */
export const priceTierGroup = ({
  label,
  name,
  adminDescription,
  requireMinRule = false,
}: TierArgs): Field => ({
  name,
  label,
  type: "group",
  admin: adminDescription ? { description: adminDescription } : {},
  fields: [
    {
      name: "min",
      type: "number",
      label: "Giá tối thiểu (VND)",
      admin: { description: "Số nguyên VND. Để trống nếu chưa có giá." },
    },
    {
      name: "max",
      type: "number",
      label: "Giá tối đa (VND)",
      admin: { description: "Để trống = giá cố định (hoặc 'từ …')." },
    },
    {
      name: "from",
      type: "checkbox",
      label: 'Hiển thị "từ {min}"',
      defaultValue: false,
    },
    {
      name: "negotiable",
      type: "checkbox",
      label: "Liên hệ thỏa thuận",
      defaultValue: false,
    },
  ],
  validate: (value: unknown, { siblingData }: any) => {
    const tier = (value ?? {}) as PriceTierValue;
    const min = tier.min ?? null;
    const max = tier.max ?? null;
    if (min != null && min <= 0) {
      return "Giá phải là số nguyên VND lớn hơn 0.";
    }
    if (min != null && max != null && max < min) {
      return "Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu.";
    }
    if (requireMinRule && (min == null || min <= 0)) {
      const other = (siblingData?.tierCharter45 ?? {}) as PriceTierValue;
      const otherMin = other.min ?? null;
      if (otherMin == null || otherMin <= 0) {
        return "Cần ít nhất một giá cho 'Ghép 1 khách' (tierShare1) hoặc 'Thuê xe 45 chỗ' (tierCharter45).";
      }
    }
    return true;
  },
});

/** Nhóm giá sân bay { sedan5Seats, suv7Seats, van16Seats } — spec 4.2.8. */
export const vehiclePriceGroup = (name: string, label: string): Field => ({
  name,
  label,
  type: "group",
  fields: [
    { name: "sedan5Seats", type: "number", label: "Sedan 5 chỗ (VND)", required: true, min: 1 },
    { name: "suv7Seats", type: "number", label: "SUV 7 chỗ (VND)", required: true, min: 1 },
    { name: "van16Seats", type: "number", label: "Van 16 chỗ (VND)", required: true, min: 1 },
  ],
});

/** min của các tier không negotiable (FR-D04) — dùng cho priceFrom. */
export const computePriceFrom = (
  tiers: (PriceTierValue | undefined | null)[],
): number | null => {
  const mins: number[] = [];
  for (const tier of tiers) {
    if (!tier || tier.negotiable) continue;
    if (tier.min != null && tier.min > 0) mins.push(tier.min);
  }
  return mins.length ? Math.min(...mins) : null;
};

export const TIER_KEYS = ["tierShare1", "tierShare2", "tierCharter45", "tierCharter7"] as const;
