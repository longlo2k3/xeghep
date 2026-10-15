import { describe, expect, it } from 'vitest';
import {
  ALPHABET,
  generateBookingCode,
  maxBookingCodeAttempts,
} from '../src/lib/booking/bookingCode';
import {
  checkPhoneLast4,
  getLookupSecret,
  makeLookupToken,
  verifyLookupToken,
} from '../src/lib/booking/lookupToken';

const CODE_RE = /^XG-261010-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;
const FORBIDDEN = /[0O1IL]/;

describe('generateBookingCode', () => {
  it('produces XG-YYMMDD-XXXXXX with the safe alphabet', () => {
    const code = generateBookingCode(new Date(2026, 9, 10), () => false);
    expect(code).toMatch(CODE_RE);
    expect(FORBIDDEN.test(code.slice(-6))).toBe(false);
  });

  it('never emits forbidden characters across 50 runs', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateBookingCode(new Date(2026, 9, 10), () => false);
      expect(code).toMatch(CODE_RE);
      expect(FORBIDDEN.test(code.slice(-6))).toBe(false);
    }
  });

  it('retries when the exists callback reports a collision', () => {
    let calls = 0;
    const code = generateBookingCode(new Date(2026, 9, 10), () => {
      calls += 1;
      return calls <= 2;
    });
    expect(calls).toBe(3);
    expect(code).toMatch(CODE_RE);
  });

  it('throws after maxBookingCodeAttempts collisions', () => {
    let calls = 0;
    expect(() =>
      generateBookingCode(new Date(2026, 9, 10), () => {
        calls += 1;
        return true;
      }),
    ).toThrow();
    expect(calls).toBe(maxBookingCodeAttempts);
  });

  it('uses only the spec alphabet without 0 O 1 I L', () => {
    expect(ALPHABET).toBe('23456789ABCDEFGHJKMNPQRSTUVWXYZ');
    expect(ALPHABET).toHaveLength(31);
    expect(FORBIDDEN.test(ALPHABET)).toBe(false);
  });
});

describe('lookup token', () => {
  const SECRET = 'test-lookup-secret';
  const CODE = 'XG-261010-K7M2QX';

  it('makeLookupToken is deterministic, 16 chars', () => {
    const a = makeLookupToken(CODE, SECRET);
    const b = makeLookupToken(CODE, SECRET);
    expect(a).toBe(b);
    expect(a).toHaveLength(16);
    expect(a).toMatch(/^[0-9a-f]{16}$/);
  });

  it('different codes produce different tokens', () => {
    expect(makeLookupToken(CODE, SECRET)).not.toBe(makeLookupToken('XG-261010-ABCDEF', SECRET));
  });

  it('verifyLookupToken accepts the correct token and rejects others', () => {
    const token = makeLookupToken(CODE, SECRET);
    expect(verifyLookupToken(CODE, token, SECRET)).toBe(true);
    expect(verifyLookupToken(CODE, 'deadbeefdeadbeef', SECRET)).toBe(false);
    expect(verifyLookupToken('XG-261010-ABCDEF', token, SECRET)).toBe(false);
    expect(verifyLookupToken(CODE, token, 'other-secret')).toBe(false);
  });

  it('verifyLookupToken handles wrong-length tokens without throwing', () => {
    expect(verifyLookupToken(CODE, 'short', SECRET)).toBe(false);
    expect(verifyLookupToken(CODE, '', SECRET)).toBe(false);
  });

  it('checkPhoneLast4 compares the last 4 digits', () => {
    expect(checkPhoneLast4('0962298293', '8293')).toBe(true);
    expect(checkPhoneLast4('0962298293', '0000')).toBe(false);
    expect(checkPhoneLast4('0962298293', '')).toBe(false);
  });

  it('getLookupSecret falls back to dev-lookup-secret', () => {
    const prev = process.env.LOOKUP_SECRET;
    delete process.env.LOOKUP_SECRET;
    try {
      expect(getLookupSecret()).toBe('dev-lookup-secret');
      process.env.LOOKUP_SECRET = 'env-secret';
      expect(getLookupSecret()).toBe('env-secret');
    } finally {
      if (prev === undefined) delete process.env.LOOKUP_SECRET;
      else process.env.LOOKUP_SECRET = prev;
    }
  });
});
