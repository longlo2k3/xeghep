import type { CompanyInfoData } from "@/lib/types";

export type { CompanyInfoData };

export type CmsErrorCode =
  | "VALIDATION_ERROR"
  | "PICKUP_TIME_TOO_SOON"
  | "ROUTE_NOT_FOUND"
  | "BOOKING_NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "CMS_UNREACHABLE"
  | "CMS_TIMEOUT"
  | "CMS_BAD_RESPONSE";

export class ApiError extends Error {
  readonly code: CmsErrorCode | string;
  readonly status: number;
  readonly fields: { field: string; message: string }[];

  constructor(
    code: CmsErrorCode | string,
    message: string,
    status: number,
    fields: { field: string; message: string }[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNotFoundError(error: unknown): boolean {
  return isApiError(error) && error.status === 404;
}

type SuccessEnvelope<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

type ErrorEnvelope = {
  success: false;
  statusCode: number;
  error?: {
    code?: string;
    message?: string;
    fields?: { field: string; message: string }[];
  };
};

type CmsResponse<T> = { data: T; message: string; meta?: Record<string, unknown> };

const CMS_CLIENT = process.env.NEXT_PUBLIC_CMS_URL ?? "";

async function clientRequest<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<CmsResponse<T>> {
  const timeoutMs = init?.timeoutMs ?? (init?.method === "POST" ? 8000 : 2500);

  let signal: AbortSignal | undefined;
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    signal =
      init?.signal && typeof AbortSignal.any === "function"
        ? AbortSignal.any([init.signal, timeoutSignal])
        : timeoutSignal;
  }

  let res: Response;
  try {
    res = await fetch(`${CMS_CLIENT}${path}`, {
      ...init,
      signal: signal ?? init?.signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new ApiError("CMS_TIMEOUT", `Máy chủ phản hồi quá lâu (${timeoutMs}ms)`, 504);
    }
    throw new ApiError("CMS_UNREACHABLE", "Không thể kết nối máy chủ dữ liệu", 503);
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  const envelope = body as (SuccessEnvelope<T> | ErrorEnvelope) | null;
  if (!res.ok || !envelope || typeof envelope !== "object" || envelope.success !== true) {
    const errorBody =
      envelope && typeof envelope === "object" && envelope.success === false ? envelope : null;
    const code = errorBody?.error?.code ?? "INTERNAL_ERROR";
    const message = errorBody?.error?.message ?? `Không lấy được dữ liệu (HTTP ${res.status})`;
    const status = errorBody?.statusCode ?? res.status;
    throw new ApiError(code, message, status || 500, errorBody?.error?.fields ?? []);
  }

  const success = envelope as SuccessEnvelope<T>;
  return { data: success.data, message: success.message, meta: success.meta };
}

export type BookingInput = {
  customerName: string;
  customerPhone: string;
  routeSlug?: string | null;
  pickupLocation: string;
  dropoffLocation: string;
  rideType?: "ghep" | "bao" | null;
  vehicleType: "4cho" | "5cho" | "7cho" | "16cho" | "guihang";
  passengerCount?: number;
  pickupDateTime: string;
  note?: string | null;
  airportDistrict?: string | null;
  airportDirection?: "to_airport" | "from_airport" | "round_trip" | null;
  distanceKm?: number | null;
  website?: string;
  captchaToken?: string;
};

export type BookingCreateResult = {
  bookingCode: string;
  lookupToken: string;
  customerName?: string;
  customerPhone?: string;
  route: { slug: string; name: string } | null;
  pickupLocation?: string;
  dropoffLocation?: string;
  rideType: "ghep" | "bao" | null;
  vehicleType: string;
  passengerCount: number;
  pickupDateTime: string;
  priceType: string | null;
  estimatedPrice: number | null;
  estimatedPriceMax: number | null;
  estimatedPriceFormatted: string;
  unit: string;
  priceNote: string;
  paymentMethod: string;
  status: string;
  statusLabel: string;
  createdAt: string;
};

export type BookingLookupResult = {
  bookingCode: string;
  customerName: string;
  customerPhoneMasked: string;
  route: { slug: string; name: string } | null;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string | null;
  rideType: "ghep" | "bao" | null;
  vehicleType: string;
  passengerCount: number;
  priceType: string | null;
  estimatedPrice: number | null;
  estimatedPriceFormatted: string;
  paymentMethod: string | null;
  paymentMethodLabel: string | null;
  status: string;
  statusLabel: string;
};

export async function postBooking(
  body: BookingInput,
  idempotencyKey?: string,
): Promise<BookingCreateResult> {
  const headers: Record<string, string> = { "content-type": "application/json; charset=utf-8" };
  if (idempotencyKey) headers["idempotency-key"] = idempotencyKey;
  const { data } = await clientRequest<BookingCreateResult>("/api/v1/bookings", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return data;
}

export function lookupBooking(
  code: string,
  options: { token?: string; phoneLast4?: string } = {},
): Promise<BookingLookupResult> {
  const params = new URLSearchParams();
  if (options.token) params.set("t", options.token);
  if (options.phoneLast4) params.set("phoneLast4", options.phoneLast4);
  const query = params.toString();
  return clientRequest<BookingLookupResult>(
    `/api/v1/bookings/${encodeURIComponent(code)}${query ? `?${query}` : ""}`,
    { cache: "no-store" },
  ).then((result) => result.data);
}
