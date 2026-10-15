import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  errorBody,
  jsonError,
  jsonOk,
  ok,
  statusForCode,
  zodToFields,
  type ErrorCode,
} from '../src/lib/api/envelope';

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 422,
  PICKUP_TIME_TOO_SOON: 422,
  ROUTE_NOT_FOUND: 404,
  BOOKING_NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

describe('success envelope', () => {
  it('ok() returns exact keys success/statusCode/message/data without meta', () => {
    const body = ok({ bookingCode: 'XG-261009-ABC123' });
    expect(Object.keys(body).sort()).toEqual(['data', 'message', 'statusCode', 'success']);
    expect(body).toEqual({
      success: true,
      statusCode: 200,
      message: 'OK',
      data: { bookingCode: 'XG-261009-ABC123' },
    });
    expect('meta' in body).toBe(false);
  });

  it('ok() honours statusCode/message overrides and includes meta when given', () => {
    const body = ok({ id: 1 }, { statusCode: 201, message: 'Đã tạo', meta: { totalDocs: 9 } });
    expect(body).toEqual({
      success: true,
      statusCode: 201,
      message: 'Đã tạo',
      data: { id: 1 },
      meta: { totalDocs: 9 },
    });
  });

  it('jsonOk produces a Response with matching HTTP status and envelope body', async () => {
    const res = jsonOk({ ok: true }, { statusCode: 201, message: 'Đã tạo' });
    expect(res.status).toBe(201);
    expect(res.headers.get('content-type')).toContain('application/json');
    await expect(res.json()).resolves.toEqual({
      success: true,
      statusCode: 201,
      message: 'Đã tạo',
      data: { ok: true },
    });
  });
});

describe('errorBody status mapping (contract §0)', () => {
  it.each(Object.entries(STATUS_BY_CODE))('%s maps to HTTP %i', (code, status) => {
    const body = errorBody(code as ErrorCode);
    expect(body.success).toBe(false);
    expect(body.statusCode).toBe(status);
    expect(body.statusCode).toBe(statusForCode(code as ErrorCode));
    expect(body.error.code).toBe(code);
    expect(typeof body.error.message).toBe('string');
    expect(body.error.message.length).toBeGreaterThan(0);
  });

  it('VALIDATION_ERROR defaults to Vietnamese message', () => {
    expect(errorBody('VALIDATION_ERROR').error.message).toBe('Dữ liệu không hợp lệ');
  });

  it('ROUTE_NOT_FOUND and BOOKING_NOT_FOUND share the same default message', () => {
    expect(errorBody('ROUTE_NOT_FOUND').error.message).toBe(
      errorBody('BOOKING_NOT_FOUND').error.message,
    );
  });

  it('includes fields when provided', () => {
    const body = errorBody('VALIDATION_ERROR', 'Sai dữ liệu', [
      { field: 'customerPhone', message: 'Số điện thoại không hợp lệ' },
    ]);
    expect(body.error.fields).toEqual([
      { field: 'customerPhone', message: 'Số điện thoại không hợp lệ' },
    ]);
    expect('fields' in errorBody('INTERNAL_ERROR').error).toBe(false);
  });
});

describe('jsonError Response helper', () => {
  it('sets status from error code', async () => {
    const res = jsonError('VALIDATION_ERROR', undefined, {
      fields: [{ field: 'pickupLocation', message: 'Bắt buộc' }],
    });
    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      success: false,
      statusCode: 422,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu không hợp lệ',
        fields: [{ field: 'pickupLocation', message: 'Bắt buộc' }],
      },
    });
  });

  it('sets Retry-After header for RATE_LIMITED with status 429', async () => {
    const res = jsonError('RATE_LIMITED', undefined, { retryAfterSec: 30 });
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('RATE_LIMITED');
  });

  it('defaults Retry-After to 60 when not specified', () => {
    expect(jsonError('RATE_LIMITED').headers.get('Retry-After')).toBe('60');
  });

  it('keeps caller headers', () => {
    const res = jsonError('INTERNAL_ERROR', 'Lỗi máy chủ', {
      headers: { 'x-request-id': 'abc' },
    });
    expect(res.status).toBe(500);
    expect(res.headers.get('x-request-id')).toBe('abc');
    expect(res.headers.get('Retry-After')).toBeNull();
  });
});

describe('zodToFields', () => {
  it('maps failing schema issues to {field, message} list', () => {
    const schema = z.object({
      customerPhone: z.string().regex(/^(03|05|07|08|09)\d{8}$/, 'Số điện thoại không hợp lệ'),
      customerName: z.string().min(1, 'Tên khách hàng là bắt buộc'),
      passengerCount: z.number().min(1).max(3),
    });
    const result = schema.safeParse({
      customerPhone: '+84123',
      customerName: '',
      passengerCount: 9,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    const fields = zodToFields(result.error);
    expect(fields).toHaveLength(3);
    expect(fields).toEqual(
      expect.arrayContaining([
        { field: 'customerPhone', message: 'Số điện thoại không hợp lệ' },
        { field: 'customerName', message: 'Tên khách hàng là bắt buộc' },
        { field: 'passengerCount', message: expect.any(String) as unknown as string },
      ]),
    );
  });

  it('joins nested paths with dots', () => {
    const schema = z.object({ route: z.object({ slug: z.string().min(1, 'Slug bắt buộc') }) });
    const result = schema.safeParse({ route: { slug: '' } });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(zodToFields(result.error)).toEqual([{ field: 'route.slug', message: 'Slug bắt buộc' }]);
  });
});
