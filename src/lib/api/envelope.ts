import type { ZodError } from 'zod';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'PICKUP_TIME_TOO_SOON'
  | 'ROUTE_NOT_FOUND'
  | 'BOOKING_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export type ApiSuccess<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorBody = {
  success: false;
  statusCode: number;
  error: {
    code: ErrorCode;
    message: string;
    fields?: { field: string; message: string }[];
  };
};

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 422,
  PICKUP_TIME_TOO_SOON: 422,
  ROUTE_NOT_FOUND: 404,
  BOOKING_NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

const DEFAULT_MESSAGE_BY_CODE: Record<ErrorCode, string> = {
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  PICKUP_TIME_TOO_SOON: 'Thời gian đón cách quá ngắn, vui lòng chọn giờ xa hơn',
  ROUTE_NOT_FOUND: 'Không tìm thấy dữ liệu',
  BOOKING_NOT_FOUND: 'Không tìm thấy dữ liệu',
  RATE_LIMITED: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
  INTERNAL_ERROR: 'Lỗi máy chủ',
};

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

export const CORS_HEADERS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'access-control-allow-headers':
    'Content-Type, Authorization, Idempotency-Key, X-Requested-With, Accept',
  'access-control-max-age': '86400',
};

export function optionsCorsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export function statusForCode(code: ErrorCode): number {
  return STATUS_BY_CODE[code];
}

export function defaultErrorMessage(code: ErrorCode): string {
  return DEFAULT_MESSAGE_BY_CODE[code];
}

export function ok<T>(
  data: T,
  options: { statusCode?: number; message?: string; meta?: Record<string, unknown> } = {},
): ApiSuccess<T> {
  const { statusCode = 200, message = 'OK', meta } = options;
  if (meta !== undefined) {
    return { success: true, statusCode, message, data, meta };
  }
  return { success: true, statusCode, message, data };
}

export function errorBody(
  code: ErrorCode,
  message?: string,
  fields?: { field: string; message: string }[],
): ApiErrorBody {
  const statusCode = STATUS_BY_CODE[code];
  const error: ApiErrorBody['error'] = {
    code,
    message: message ?? DEFAULT_MESSAGE_BY_CODE[code],
  };
  if (fields !== undefined) {
    error.fields = fields;
  }
  return { success: false, statusCode, error };
}

export function zodToFields(error: ZodError): { field: string; message: string }[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

export function jsonOk<T>(
  data: T,
  options: {
    statusCode?: number;
    message?: string;
    meta?: Record<string, unknown>;
    headers?: HeadersInit;
  } = {},
): Response {
  const body = ok(data, options);
  const headers = new Headers(options.headers);
  headers.set('content-type', JSON_HEADERS['content-type']);
  for (const [key, val] of Object.entries(CORS_HEADERS)) {
    if (!headers.has(key)) headers.set(key, val);
  }
  return new Response(JSON.stringify(body), { status: body.statusCode, headers });
}

export function jsonError(
  code: ErrorCode,
  message?: string,
  options: {
    headers?: HeadersInit;
    fields?: { field: string; message: string }[];
    retryAfterSec?: number;
  } = {},
): Response {
  const body = errorBody(code, message, options.fields);
  const headers = new Headers(options.headers);
  headers.set('content-type', JSON_HEADERS['content-type']);
  for (const [key, val] of Object.entries(CORS_HEADERS)) {
    if (!headers.has(key)) headers.set(key, val);
  }
  if (body.statusCode === 429 && !headers.has('Retry-After')) {
    headers.set('Retry-After', String(options.retryAfterSec ?? 60));
  }
  return new Response(JSON.stringify(body), { status: body.statusCode, headers });
}
