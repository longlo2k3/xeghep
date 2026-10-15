import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RATE_RULES,
  checkRateLimit,
  enforceRateLimit,
  resetRateLimits,
} from '../src/lib/api/rateLimit';

beforeEach(() => {
  resetRateLimits();
});

afterEach(() => {
  vi.useRealTimers();
  resetRateLimits();
});

describe('RATE_RULES presets', () => {
  it('matches contracts/api.md rate limits', () => {
    expect(RATE_RULES.bookingPerIp).toEqual([5, 60_000]);
    expect(RATE_RULES.bookingLookup).toEqual([10, 60_000]);
    expect(RATE_RULES.bookingPerPhonePerDay).toEqual([20, 86_400_000]);
  });
});

describe('checkRateLimit', () => {
  it('allows requests under the limit and blocks the one after', () => {
    const [limit, windowMs] = RATE_RULES.bookingPerIp;
    for (let i = 0; i < limit; i++) {
      expect(checkRateLimit('ip:1.2.3.4', limit, windowMs)).toEqual({
        allowed: true,
        retryAfterSec: 0,
      });
    }
    const blocked = checkRateLimit('ip:1.2.3.4', limit, windowMs);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThanOrEqual(1);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(60);
  });

  it('keeps different keys independent', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('ip:a', 5, 60_000);
    expect(checkRateLimit('ip:a', 5, 60_000).allowed).toBe(false);
    expect(checkRateLimit('ip:b', 5, 60_000).allowed).toBe(true);
    expect(checkRateLimit('phone:0900000000', 20, 86_400_000).allowed).toBe(true);
  });

  it('resetRateLimits() clears counters', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('ip:reset', 5, 60_000);
    expect(checkRateLimit('ip:reset', 5, 60_000).allowed).toBe(false);
    resetRateLimits();
    expect(checkRateLimit('ip:reset', 5, 60_000).allowed).toBe(true);
  });

  it('resets the window after windowMs elapses', () => {
    vi.useFakeTimers();
    expect(checkRateLimit('ip:window', 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit('ip:window', 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit('ip:window', 2, 60_000).allowed).toBe(false);
    vi.advanceTimersByTime(60_001);
    expect(checkRateLimit('ip:window', 2, 60_000).allowed).toBe(true);
  });

  it('does not reset before windowMs elapses', () => {
    vi.useFakeTimers();
    for (let i = 0; i < 5; i++) checkRateLimit('ip:half', 5, 60_000);
    vi.advanceTimersByTime(30_000);
    const blocked = checkRateLimit('ip:half', 5, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThanOrEqual(1);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(30);
  });
});

describe('enforceRateLimit', () => {
  it('returns null while under the limit', () => {
    for (let i = 0; i < 5; i++) {
      expect(enforceRateLimit('ip:ok', 5, 60_000)).toBeNull();
    }
  });

  it('returns 429 Response with Retry-After when exceeded', async () => {
    for (let i = 0; i < 5; i++) enforceRateLimit('ip:rl', 5, 60_000);
    const res = enforceRateLimit('ip:rl', 5, 60_000);
    expect(res).toBeInstanceOf(Response);
    const response = res as Response;
    expect(response.status).toBe(429);
    const retryAfter = Number(response.headers.get('Retry-After'));
    expect(Number.isFinite(retryAfter)).toBe(true);
    expect(retryAfter).toBeGreaterThanOrEqual(1);
    const body = (await response.json()) as {
      success: boolean;
      statusCode: number;
      error: { code: string };
    };
    expect(body.success).toBe(false);
    expect(body.statusCode).toBe(429);
    expect(body.error.code).toBe('RATE_LIMITED');
  });

  it('6 consecutive requests hit the booking rule of 5/minute', () => {
    const [limit, windowMs] = RATE_RULES.bookingPerIp;
    const results = Array.from({ length: limit + 1 }, () =>
      enforceRateLimit('ip:consecutive', limit, windowMs),
    );
    expect(results.slice(0, limit).every((r) => r === null)).toBe(true);
    expect(results[limit]).toBeInstanceOf(Response);
    expect((results[limit] as Response).status).toBe(429);
  });
});
