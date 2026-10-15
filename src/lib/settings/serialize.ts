import { PUBLIC_CACHE_HEADERS } from '../api/serialize';

export type VehiclePriceGroup = {
  sedan5Seats?: number | null;
  suv7Seats?: number | null;
  van16Seats?: number | null;
};

export type AirportPricingDoc = {
  slug?: string;
  district?: string;
  isActive?: boolean;
  sortOrder?: number;
  fromHanoiToAirport?: VehiclePriceGroup;
  fromAirportToHanoi?: VehiclePriceGroup;
  roundTrip?: VehiclePriceGroup;
};

export type DistanceRateDoc = {
  label?: string;
  minKm?: number;
  maxKm?: number | null;
  sedan5Seats?: number;
  suv7Seats?: number;
  van16Seats?: number;
};

export type PricingPoliciesDoc = {
  roundTripDiscountText?: string | null;
  waitingTimeText?: string | null;
  waitingFreeMinutes?: number | null;
  waitingFeePerHour?: number | null;
  waitingMaxHours?: number | null;
  tollsNote?: string | null;
  overnightNote?: string | null;
  overnightPhone?: string | null;
};

/** Cache header công khai + Cache-Tag theo contracts/api.md §0. */
export function settingsCacheHeaders(...tags: string[]): Record<string, string> {
  return { ...PUBLIC_CACHE_HEADERS, 'Cache-Tag': tags.join(', ') };
}

const group = (value?: VehiclePriceGroup) => ({
  sedan5Seats: value?.sedan5Seats ?? null,
  suv7Seats: value?.suv7Seats ?? null,
  van16Seats: value?.van16Seats ?? null,
});

/** GET /api/v1/pricing/airport — 12 quận × 3 nhóm chiều × 3 cột xe (hợp đồng §4). */
export function serializeAirportPricing(doc: AirportPricingDoc) {
  return {
    slug: doc.slug ?? '',
    district: doc.district ?? '',
    fromHanoiToAirport: group(doc.fromHanoiToAirport),
    fromAirportToHanoi: group(doc.fromAirportToHanoi),
    roundTrip: group(doc.roundTrip),
  };
}

/** GET /api/v1/pricing/distance — { rates[], policies } (hợp đồng §4). */
export function serializeDistancePricing(rates: DistanceRateDoc[], settings: PricingPoliciesDoc) {
  return {
    rates: rates.map((row) => ({
      label: row.label ?? '',
      minKm: row.minKm ?? 0,
      maxKm: row.maxKm ?? null,
      sedan5Seats: row.sedan5Seats ?? 0,
      suv7Seats: row.suv7Seats ?? 0,
      van16Seats: row.van16Seats ?? 0,
    })),
    policies: {
      roundTripDiscountText: settings.roundTripDiscountText ?? null,
      waitingTimeText: settings.waitingTimeText ?? null,
      waitingFreeMinutes: settings.waitingFreeMinutes ?? null,
      waitingFeePerHour: settings.waitingFeePerHour ?? null,
      waitingMaxHours: settings.waitingMaxHours ?? null,
      tollsNote: settings.tollsNote ?? null,
      overnightNote: settings.overnightNote ?? null,
      overnightPhone: settings.overnightPhone ?? null,
    },
  };
}
