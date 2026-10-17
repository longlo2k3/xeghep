import type { BookingInput } from "./api";
import type { RouteItem } from "./types";

const VN_PHONE_RE = /^(03|05|07|08|09)\d{8}$/;
const OFFSET_RE = /(Z|[+-]\d{2}:?\d{2})$/i;
const VN_OFFSET = "+07:00";

/** Chuẩn hóa số điện thoại về đúng dạng backend validate: bắt đầu bằng 0 (VD: 0962298293). */
export function normalizePhone(raw: string): string {
  let p = String(raw ?? "").replace(/[\s.\-()]/g, "");
  if (p.startsWith("+84")) p = `0${p.slice(3)}`;
  else if (p.startsWith("84")) p = `0${p.slice(2)}`;
  return p;
}

/** Hợp lệ sau khi normalize (khớp regex của backend validate.ts). */
export function isValidVietnamPhone(raw: string): boolean {
  return VN_PHONE_RE.test(normalizePhone(raw));
}

/**
 * datetime-local ("YYYY-MM-DDTHH:mm") → ISO có offset +07:00.
 * Giữ nguyên giá trị đã có offset/Z (backend cũng hiểu không-offset là UTC+7).
 */
export function toVietnamIso(localValue: string): string {
  const value = String(localValue ?? "").trim();
  if (!value) return "";
  if (OFFSET_RE.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) return `${value}${VN_OFFSET}`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00${VN_OFFSET}`;
  return value;
}

function clampPassengerCount(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(3, Math.max(1, Math.trunc(value)));
}

/** Chuẩn hóa địa danh để so khớp (bỏ dấu, thường hóa, gom khoảng trắng). */
export function normalizePlace(input: string): string {
  return String(input ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function dedupePlaces(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const value = (raw ?? "").trim();
    const key = normalizePlace(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

/**
 * Danh sách địa điểm cho cả Điểm đi và Điểm đến.
 * Tuyến là 2 chiều nên mỗi đầu `origin`/`destination` của mọi tuyến đều hợp lệ
 * cho cả hai ô. `exclude` là giá trị đã chọn ở ô đối diện, sẽ bị loại bỏ để
 * không cho trùng điểm đi và điểm đến.
 */
export function buildLocationOptions(
  routes: RouteItem[],
  exclude?: string,
): string[] {
  let options = dedupePlaces(
    routes.flatMap((r) => [r.origin, r.destination]),
  );
  if (options.length === 0) {
    // Fallback nếu tuyến chưa khai báo origin/destination.
    options = dedupePlaces(
      routes.flatMap((r) => [...(r.pickups ?? []), ...(r.dropoffs ?? [])]),
    );
  }

  const excluded = exclude ? normalizePlace(exclude) : "";
  if (!excluded) return options;
  return options.filter((value) => normalizePlace(value) !== excluded);
}

/**
 * Khớp tuyến từ điểm đón / điểm đến dựa trên dữ liệu routes trong database
 * (origin/destination + mảng pickups/dropoffs chi tiết).
 */
export function matchRoute(
  routes: RouteItem[],
  pickupStr: string,
  dropoffStr: string,
  explicitSlug?: string,
): RouteItem | undefined {
  if (explicitSlug && explicitSlug !== "custom") {
    const bySlug = routes.find((r) => r.slug === explicitSlug);
    if (bySlug) return bySlug;
  }

  if (!pickupStr || !dropoffStr || routes.length === 0) return undefined;

  const p = normalizePlace(pickupStr);
  const d = normalizePlace(dropoffStr);
  const matches = (values: string[] | undefined, target: string) =>
    (values ?? []).some((value) => {
      const nv = normalizePlace(value);
      return nv.length > 0 && (nv.includes(target) || target.includes(nv));
    });

  return routes.find((route) => {
    const originSide = [route.origin, ...(route.pickups ?? [])];
    const destSide = [route.destination, ...(route.dropoffs ?? [])];
    const direct = matches(originSide, p) && matches(destSide, d);
    const reverse = matches(originSide, d) && matches(destSide, p);
    return direct || reverse;
  });
}

export type StaticPrice = {
  displayPrice: string;
  unit: string;
  needsQuote: boolean;
  quoteNote: string;
};

const NOTE_QUOTE =
  "Tổng đài sẽ gọi báo giá trọn gói ưu đãi nhất theo đúng lộ trình của bạn.";
const QUOTE_DISPLAY = "Liên hệ báo giá";

function quotePrice(unit: string): StaticPrice {
  return { displayPrice: QUOTE_DISPLAY, unit, needsQuote: true, quoteNote: NOTE_QUOTE };
}

function fromText(text: string | undefined | null, unit: string): StaticPrice {
  const value = (text ?? "").trim();
  if (!value || /liên hệ/i.test(value)) return quotePrice(unit);
  return { displayPrice: value, unit, needsQuote: false, quoteNote: "" };
}

/**
 * Giá hiển thị tĩnh lấy từ giá đã lưu của tuyến (D7) — không gọi API ước lượng.
 * Cùng quy tắc chọn tier với POST /api/v1/bookings phía backend.
 */
export function deriveStaticPrice(
  route: RouteItem | undefined | null,
  values: { vehicleType: string; rideType: "ghep" | "bao"; passengerCount: number },
): StaticPrice {
  if (values.vehicleType === "guihang") {
    return { displayPrice: "từ 150k", unit: "/ kiện hàng", needsQuote: false, quoteNote: "" };
  }

  if (!route) {
    return quotePrice("");
  }

  if (values.rideType === "bao") {
    if (values.vehicleType === "16cho") return quotePrice("/ trọn chuyến (Xe 16 chỗ)");
    const unit = `/ trọn chuyến (Xe ${values.vehicleType.replace("cho", "")} chỗ)`;
    const text =
      values.vehicleType === "7cho" ? route.priceCharter7Text : route.priceCharter4to5Text;
    return fromText(text, unit);
  }

  const n = clampPassengerCount(values.passengerCount);
  if (n >= 3) return fromText(route.priceCharter4to5Text, "/ 3 khách (Khuyên bao xe)");
  if (n === 2) return fromText(route.priceShare2Text || route.priceShare1Text, "/ 2 khách");
  return fromText(route.priceShare1Text, "/ khách");
}

export type BookingFormValues = {
  customerName: string;
  customerPhone: string;
  pickup: string;
  dropoff: string;
  routeSlug?: string | null;
  vehicleType: string;
  rideType: "ghep" | "bao";
  passengerCount: number;
  pickupDateTime: string;
  /** Honeypot theo hợp đồng backend: có giá trị → 201 giả, không lưu. */
  website?: string;
};

/** Ghép giá trị form → body POST /api/v1/bookings (kèm honeypot `website`). */
export function buildBookingPayload(values: BookingFormValues): BookingInput {
  const vehicleType = values.vehicleType as BookingInput["vehicleType"];
  const body: BookingInput = {
    customerName: values.customerName.trim(),
    customerPhone: normalizePhone(values.customerPhone),
    pickupLocation: values.pickup.trim(),
    dropoffLocation: values.dropoff.trim(),
    vehicleType,
    pickupDateTime: toVietnamIso(values.pickupDateTime),
    website: values.website ?? "",
  };

  if (values.routeSlug && values.routeSlug !== "custom") body.routeSlug = values.routeSlug;

  if (vehicleType !== "guihang") {
    body.rideType = values.rideType;
    if (values.rideType === "ghep") body.passengerCount = clampPassengerCount(values.passengerCount);
  }

  return body;
}

/** Sinh UUID v4 cho Idempotency-Key (fallback khi crypto.randomUUID không có). */
export function createIdempotencyKey(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
