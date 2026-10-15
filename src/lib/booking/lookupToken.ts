import { createHmac, timingSafeEqual } from 'node:crypto';

export function getLookupSecret(): string {
  return process.env.LOOKUP_SECRET || 'dev-lookup-secret';
}

export function makeLookupToken(bookingCode: string, secret: string): string {
  return createHmac('sha256', secret).update(bookingCode).digest('hex').slice(0, 16);
}

export function verifyLookupToken(bookingCode: string, token: string, secret: string): boolean {
  const expected = makeLookupToken(bookingCode, secret);
  if (typeof token !== 'string' || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export function checkPhoneLast4(phone: string, last4: string): boolean {
  if (!last4 || last4.length !== 4 || !phone) return false;
  return phone.endsWith(last4);
}
