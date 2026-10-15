import { jsonError } from './envelope';

type WindowEntry = { count: number; resetAt: number };

const windows = new Map<string, WindowEntry>();

export const RATE_RULES = {
  bookingPerIp: [5, 60_000],
  bookingLookup: [10, 60_000],
  bookingPerPhonePerDay: [20, 86_400_000],
} as const;

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = windows.get(key);
  if (!entry || entry.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (entry.count >= limit) {
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }
  entry.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

export function enforceRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Response | null {
  const result = checkRateLimit(key, limit, windowMs);
  if (result.allowed) return null;
  return jsonError('RATE_LIMITED', undefined, { retryAfterSec: result.retryAfterSec });
}

export function resetRateLimits(): void {
  windows.clear();
}
