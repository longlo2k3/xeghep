export type BookingFieldError = { field: string; message: string };

export type BookingVehicleType = '4cho' | '5cho' | '7cho' | '16cho' | 'guihang';
export type BookingRideType = 'ghep' | 'bao';
export type BookingAirportDirection = 'to_airport' | 'from_airport' | 'round_trip';

export type BookingDto = {
  customerName?: string | null;
  customerPhone?: string | null;
  routeSlug?: string | null;
  pickupLocation?: string | null;
  dropoffLocation?: string | null;
  rideType?: string | null;
  vehicleType?: string | null;
  passengerCount?: number | null;
  pickupDateTime?: string | null;
  note?: string | null;
  website?: string | null;
  airportDistrict?: string | null;
  airportDirection?: string | null;
  distanceKm?: number | null;
};

export type ValidatedBooking = {
  customerName: string;
  customerPhone: string;
  routeSlug: string | null;
  pickupLocation: string;
  dropoffLocation: string;
  rideType: BookingRideType | null;
  vehicleType: BookingVehicleType;
  passengerCount: number;
  pickupDateTime: string;
  note?: string;
  airportDistrict?: string;
  airportDirection?: BookingAirportDirection;
  distanceKm?: number;
};

export type ValidateSuccess =
  | { ok: true; bot: false; data: ValidatedBooking }
  | { ok: true; bot: true };

export type ValidateFailure = {
  ok: false;
  code: 'VALIDATION_ERROR' | 'PICKUP_TIME_TOO_SOON';
  message: string;
  fields: BookingFieldError[];
};

export type ValidateResult = ValidateSuccess | ValidateFailure;

export type ValidateOptions = {
  settings: {
    minLeadTimeMinutes?: number;
    maxPassengersPerShareTrip?: number;
  };
  nowMs: number;
  routeLookup?: (slug: string) => { slug: string; status: string } | null | undefined;
};

const VN_PHONE_RE = /^(03|05|07|08|09)\d{8}$/;
const VEHICLE_TYPES: readonly string[] = ['4cho', '5cho', '7cho', '16cho', 'guihang'];
const AIRPORT_DIRECTIONS: readonly string[] = ['to_airport', 'from_airport', 'round_trip'];
const MAX_LEAD_DAYS = 90;

export function normalizePhone(raw: string): string {
  let p = String(raw ?? '').replace(/[\s.\-]/g, '');
  if (p.startsWith('+84')) p = `0${p.slice(3)}`;
  else if (p.startsWith('84')) p = `0${p.slice(2)}`;
  return p;
}

export function validatePhone(raw: string): { ok: true; phone: string } | { ok: false } {
  const phone = normalizePhone(String(raw ?? ''));
  return VN_PHONE_RE.test(phone) ? { ok: true, phone } : { ok: false };
}

export type PickupTimeResult =
  | { ok: true; iso: string; ms: number }
  | { ok: false; code: 'VALIDATION_ERROR' | 'PICKUP_TIME_TOO_SOON'; message: string };

const OFFSET_RE = /(Z|[+-]\d{2}:?\d{2})$/i;

export function parsePickupDateTime(iso: string, nowMs: number, minLeadMinutes = 15): PickupTimeResult {
  const raw = String(iso ?? '').trim();
  if (!raw) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Thiếu thời gian đón.' };
  }
  const hasOffset = OFFSET_RE.test(raw);
  const normalized = hasOffset
    ? raw
    : /T\d{2}:\d{2}$/.test(raw)
      ? `${raw}:00+07:00`
      : `${raw}+07:00`;
  const ms = Date.parse(normalized);
  if (Number.isNaN(ms)) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Thời gian đón không hợp lệ.' };
  }
  if (ms < nowMs + minLeadMinutes * 60_000) {
    return {
      ok: false,
      code: 'PICKUP_TIME_TOO_SOON',
      message: `Giờ đón phải cách thời điểm hiện tại ít nhất ${minLeadTimeMessage(minLeadMinutes)}. Vui lòng chọn giờ sau.`,
    };
  }
  if (ms > nowMs + MAX_LEAD_DAYS * 86_400_000) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: 'Chỉ có thể đặt trước tối đa 90 ngày.',
    };
  }
  return { ok: true, iso: normalized, ms };
}

function minLeadTimeMessage(minLeadMinutes: number): string {
  return minLeadMinutes >= 60
    ? `${minLeadMinutes / 60} giờ`
    : `${minLeadMinutes} phút`;
}

export function stripHtml(input: string): string {
  return String(input ?? '').replace(/<[^>]*>/g, '');
}

export function validateBooking(dto: BookingDto, opts: ValidateOptions): ValidateResult {
  const { nowMs, routeLookup } = opts;
  const minLead = opts.settings.minLeadTimeMinutes ?? 15;
  const maxShare = opts.settings.maxPassengersPerShareTrip ?? 3;

  if (String(dto.website ?? '').trim() !== '') return { ok: true, bot: true };

  const fields: BookingFieldError[] = [];

  const customerName = String(dto.customerName ?? '').trim();
  if (customerName.length < 2 || customerName.length > 100) {
    fields.push({ field: 'customerName', message: 'Họ tên phải từ 2 đến 100 ký tự.' });
  }

  const phoneResult = validatePhone(String(dto.customerPhone ?? ''));
  if (!phoneResult.ok) {
    fields.push({ field: 'customerPhone', message: 'Số điện thoại không hợp lệ (VD: 0962298293).' });
  }

  const vehicleType = String(dto.vehicleType ?? '');
  if (!VEHICLE_TYPES.includes(vehicleType)) {
    fields.push({ field: 'vehicleType', message: 'Loại xe không hợp lệ.' });
  }

  const isParcel = vehicleType === 'guihang';
  let rideType: BookingRideType | null = null;
  let passengerCount = 1;

  if (!isParcel && VEHICLE_TYPES.includes(vehicleType)) {
    const rt = dto.rideType == null ? null : String(dto.rideType);
    if (rt !== 'ghep' && rt !== 'bao') {
      fields.push({ field: 'rideType', message: 'Hình thức đi phải là ghép hoặc bao xe.' });
    } else if (vehicleType === '16cho' && rt !== 'bao') {
      fields.push({ field: 'rideType', message: 'Xe 16 chỗ chỉ áp dụng hình thức bao xe.' });
    } else {
      rideType = rt;
      if (rt === 'ghep') {
        const n = dto.passengerCount ?? 1;
        if (!Number.isInteger(n) || n < 1 || n > maxShare) {
          fields.push({
            field: 'passengerCount',
            message: `Số khách đi ghép phải từ 1 đến ${maxShare}.`,
          });
        } else {
          passengerCount = n;
        }
      }
    }
  }

  let routeSlug: string | null = null;
  const rawSlug = dto.routeSlug == null || String(dto.routeSlug).trim() === '' ? null : String(dto.routeSlug).trim();
  if (rawSlug && rawSlug !== 'custom') {
    const route = routeLookup?.(rawSlug);
    if (!route || route.status !== 'active') {
      fields.push({ field: 'routeSlug', message: 'Tuyến đường không tồn tại hoặc chưa hiển thị.' });
    } else {
      routeSlug = route.slug;
    }
  }

  const pickupLocation = String(dto.pickupLocation ?? '').trim();
  if (pickupLocation.length < 3 || pickupLocation.length > 255) {
    fields.push({ field: 'pickupLocation', message: 'Điểm đón phải từ 3 đến 255 ký tự.' });
  }
  const dropoffLocation = String(dto.dropoffLocation ?? '').trim();
  if (dropoffLocation.length < 3 || dropoffLocation.length > 255) {
    fields.push({ field: 'dropoffLocation', message: 'Điểm đến phải từ 3 đến 255 ký tự.' });
  }

  const pickup = parsePickupDateTime(String(dto.pickupDateTime ?? ''), nowMs, minLead);

  const note = dto.note == null ? undefined : stripHtml(String(dto.note));
  if (note !== undefined && note.length > 500) {
    fields.push({ field: 'note', message: 'Ghi chú tối đa 500 ký tự.' });
  }

  let airportDirection: BookingAirportDirection | undefined;
  if (dto.airportDirection != null && String(dto.airportDirection) !== '') {
    const dir = String(dto.airportDirection);
    if (!AIRPORT_DIRECTIONS.includes(dir)) {
      fields.push({ field: 'airportDirection', message: 'Chiều sân bay không hợp lệ.' });
    } else {
      airportDirection = dir as BookingAirportDirection;
    }
  }

  if (dto.distanceKm != null) {
    const km = Number(dto.distanceKm);
    if (!Number.isFinite(km) || km < 1 || km > 2000) {
      fields.push({ field: 'distanceKm', message: 'Khoảng cách phải từ 1 đến 2000 km.' });
    }
  }

  if (!pickup.ok) fields.push({ field: 'pickupDateTime', message: pickup.message });

  if (fields.length > 0) {
    const code = !pickup.ok && pickup.code === 'PICKUP_TIME_TOO_SOON' ? 'PICKUP_TIME_TOO_SOON' : 'VALIDATION_ERROR';
    return {
      ok: false,
      code,
      message: code === 'PICKUP_TIME_TOO_SOON' ? 'Giờ đón quá gần so với thời điểm hiện tại.' : 'Dữ liệu đặt xe không hợp lệ.',
      fields,
    };
  }

  if (pickup.ok && phoneResult.ok) {
    return {
      ok: true,
      bot: false,
      data: {
        customerName,
        customerPhone: phoneResult.phone,
        routeSlug,
        pickupLocation,
        dropoffLocation,
        rideType,
        vehicleType: vehicleType as BookingVehicleType,
        passengerCount,
        pickupDateTime: pickup.iso,
        ...(note !== undefined ? { note } : {}),
        ...(dto.airportDistrict != null && String(dto.airportDistrict) !== ''
          ? { airportDistrict: String(dto.airportDistrict) }
          : {}),
        ...(airportDirection !== undefined ? { airportDirection } : {}),
        ...(dto.distanceKm != null ? { distanceKm: Number(dto.distanceKm) } : {}),
      },
    };
  }

  return {
    ok: false,
    code: 'VALIDATION_ERROR',
    message: 'Dữ liệu đặt xe không hợp lệ.',
    fields,
  };
}
