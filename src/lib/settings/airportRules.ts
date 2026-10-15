export type VehiclePriceGroup = {
  sedan5Seats?: number | null;
  suv7Seats?: number | null;
  van16Seats?: number | null;
};

export type AirportPricingInput = {
  district?: string | null;
  fromHanoiToAirport?: VehiclePriceGroup | null;
  fromAirportToHanoi?: VehiclePriceGroup | null;
  roundTrip?: VehiclePriceGroup | null;
};

export type AirportRoundTripValidation = {
  ok: true;
  warnings: string[];
};

const VEHICLE_COLUMNS: { key: keyof VehiclePriceGroup; label: string }[] = [
  { key: 'sedan5Seats', label: 'Sedan 5 chỗ' },
  { key: 'suv7Seats', label: 'SUV 7 chỗ' },
  { key: 'van16Seats', label: 'Van 16 chỗ' },
];

const toVnd = (value: number): string => `${value.toLocaleString('vi-VN')}đ`;

/**
 * FR-D06: giá khứ hồi lớn hơn tổng hai chiều → CẢNH BÁO (không chặn lưu).
 * Trả về danh sách cảnh báo theo từng cột xe.
 */
export function airportRoundTripWarnings(doc: AirportPricingInput): string[] {
  const warnings: string[] = [];
  const toAirport = doc.fromHanoiToAirport;
  const toHanoi = doc.fromAirportToHanoi;
  const roundTrip = doc.roundTrip;
  if (!toAirport || !toHanoi || !roundTrip) return warnings;

  const district = doc.district?.trim() || 'quận này';
  for (const column of VEHICLE_COLUMNS) {
    const outbound = toAirport[column.key];
    const inbound = toHanoi[column.key];
    const round = roundTrip[column.key];
    if (typeof round !== 'number' || typeof outbound !== 'number' || typeof inbound !== 'number') {
      continue;
    }
    const sum = outbound + inbound;
    if (round > sum) {
      warnings.push(
        `${district} — ${column.label}: giá khứ hồi ${toVnd(round)} lớn hơn tổng hai chiều ${toVnd(sum)} (chỉ cảnh báo, không chặn lưu).`,
      );
    }
  }
  return warnings;
}

/** Kiểm tra khứ hồi: luôn ok=true — cảnh báo không bao giờ chặn save (US7). */
export function validateAirportRoundTrip(doc: AirportPricingInput): AirportRoundTripValidation {
  return { ok: true, warnings: airportRoundTripWarnings(doc) };
}
