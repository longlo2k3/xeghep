import { describe, expect, it } from 'vitest';
import {
  normalizePhone,
  parsePickupDateTime,
  stripHtml,
  validateBooking,
  validatePhone,
} from '../src/lib/booking/validate';
import type { ValidateOptions } from '../src/lib/booking/validate';
import { routeFixtures } from './fixtures';

const NOW = Date.parse('2026-10-09T10:00:00+07:00');
const MIN = 60_000;
const DAY = 86_400_000;

const routeLookup: NonNullable<ValidateOptions['routeLookup']> = (slug) =>
  routeFixtures.find((r) => r.slug === slug && r.status === 'active') ?? null;

const baseDto = {
  customerName: 'Nguyễn Tuấn Anh',
  customerPhone: '0962.298.293',
  routeSlug: 'hai-phong-ha-noi-noi-bai',
  pickupLocation: 'Quán Toan, Hồng Bàng, Hải Phòng',
  dropoffLocation: 'Sảnh T1 Sân bay Nội Bài',
  rideType: 'ghep',
  vehicleType: '4cho',
  passengerCount: 1,
  pickupDateTime: '2026-10-10T08:30:00+07:00',
  website: '',
};

const opts = (overrides: Partial<ValidateOptions> = {}): ValidateOptions => ({
  settings: { minLeadTimeMinutes: 15, maxPassengersPerShareTrip: 3 },
  nowMs: NOW,
  routeLookup,
  ...overrides,
});

describe('normalizePhone', () => {
  it('strips dots, dashes and spaces', () => {
    expect(normalizePhone('0962.298.293')).toBe('0962298293');
    expect(normalizePhone(' 0962 298 293 ')).toBe('0962298293');
    expect(normalizePhone('0962-298-293')).toBe('0962298293');
  });

  it('converts +84 / 84 prefix to 0', () => {
    expect(normalizePhone('+84962298293')).toBe('0962298293');
    expect(normalizePhone('84962298293')).toBe('0962298293');
  });

  it('leaves already-normalized numbers untouched', () => {
    expect(normalizePhone('0962298293')).toBe('0962298293');
  });
});

describe('validatePhone', () => {
  it('accepts the modern Vietnamese mobile regex', () => {
    expect(validatePhone('0962298293')).toEqual({ ok: true, phone: '0962298293' });
    expect(validatePhone('0962.298.293').ok).toBe(true);
    expect(validatePhone('+84962298293').ok).toBe(true);
  });

  it('rejects old 01x prefixes', () => {
    expect(validatePhone('0123456789').ok).toBe(false);
    expect(validatePhone('+84123456789').ok).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(validatePhone('096229829').ok).toBe(false);
  });
});

describe('parsePickupDateTime', () => {
  it('interprets no-offset ISO as Asia/Ho_Chi_Minh (+07:00)', () => {
    const r = parsePickupDateTime('2026-10-10T08:30', NOW);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.iso).toContain('+07:00');
    expect(r.ms).toBe(Date.parse('2026-10-10T08:30:00+07:00'));
  });

  it('preserves an explicit offset', () => {
    const r = parsePickupDateTime('2026-10-10T01:30:00Z', NOW);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.iso).toBe('2026-10-10T01:30:00Z');
    expect(r.ms).toBe(Date.parse('2026-10-10T01:30:00Z'));
  });

  it('rejects pickup closer than now + 15 minutes', () => {
    const r = parsePickupDateTime(new Date(NOW + 10 * MIN).toISOString(), NOW, 15);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.code).toBe('PICKUP_TIME_TOO_SOON');
  });

  it('accepts the boundary now + 15 minutes exactly', () => {
    const r = parsePickupDateTime(new Date(NOW + 15 * MIN).toISOString(), NOW, 15);
    expect(r.ok).toBe(true);
  });

  it('rejects one millisecond before the boundary', () => {
    const r = parsePickupDateTime(new Date(NOW + 15 * MIN - 1).toISOString(), NOW, 15);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.code).toBe('PICKUP_TIME_TOO_SOON');
  });

  it('accepts exactly now + 90 days and rejects beyond', () => {
    expect(parsePickupDateTime(new Date(NOW + 90 * DAY).toISOString(), NOW, 15).ok).toBe(true);
    const r = parsePickupDateTime(new Date(NOW + 90 * DAY + 1).toISOString(), NOW, 15);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.code).toBe('VALIDATION_ERROR');
  });

  it('rejects garbage input', () => {
    const r = parsePickupDateTime('not-a-date', NOW);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.code).toBe('VALIDATION_ERROR');
  });
});

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<b>x</b>')).toBe('x');
    expect(stripHtml('có <i>vali</i> nhỏ')).toBe('có vali nhỏ');
  });
});

describe('validateBooking', () => {
  it('accepts a valid passenger booking and normalizes the phone', () => {
    const r = validateBooking(baseDto, opts());
    expect(r.ok).toBe(true);
    if (!r.ok || r.bot) return;
    expect(r.data.customerPhone).toBe('0962298293');
    expect(r.data.customerName).toBe('Nguyễn Tuấn Anh');
    expect(r.data.routeSlug).toBe('hai-phong-ha-noi-noi-bai');
    expect(r.data.passengerCount).toBe(1);
  });

  it('flags honeypot website as bot without field errors', () => {
    const r = validateBooking({ ...baseDto, website: 'http://spam.example' }, opts());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.bot).toBe(true);
  });

  it('rejects invalid phone', () => {
    const r = validateBooking({ ...baseDto, customerPhone: '0123456789' }, opts());
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.code).toBe('VALIDATION_ERROR');
    expect(r.fields.some((f) => f.field === 'customerPhone')).toBe(true);
  });

  it('rejects name outside 2–100 after trim', () => {
    const short = validateBooking({ ...baseDto, customerName: ' A ' }, opts());
    expect(short.ok).toBe(false);
    const long = validateBooking({ ...baseDto, customerName: 'x'.repeat(101) }, opts());
    expect(long.ok).toBe(false);
    const okName = validateBooking({ ...baseDto, customerName: '  AB  ' }, opts());
    expect(okName.ok).toBe(true);
    if (okName.ok && !okName.bot) expect(okName.data.customerName).toBe('AB');
  });

  it('rejects locations outside 3–255', () => {
    expect(validateBooking({ ...baseDto, pickupLocation: 'AB' }, opts()).ok).toBe(false);
    expect(validateBooking({ ...baseDto, dropoffLocation: 'x'.repeat(256) }, opts()).ok).toBe(false);
  });

  it('rejects unknown or inactive routeSlug, accepts custom/null', () => {
    const unknown = validateBooking({ ...baseDto, routeSlug: 'khong-ton-tai' }, opts());
    expect(unknown.ok).toBe(false);
    const inactive = validateBooking({ ...baseDto, routeSlug: 'hai-phong-sa-pa-nghi' }, opts());
    expect(inactive.ok).toBe(false);
    expect(validateBooking({ ...baseDto, routeSlug: 'custom' }, opts()).ok).toBe(true);
    expect(validateBooking({ ...baseDto, routeSlug: null }, opts()).ok).toBe(true);
  });

  it('requires 1–3 passengers for ghep and rejects out of range', () => {
    const tooMany = validateBooking({ ...baseDto, passengerCount: 4 }, opts());
    expect(tooMany.ok).toBe(false);
    if (!tooMany.ok) {
      expect(tooMany.fields.some((f) => f.field === 'passengerCount')).toBe(true);
    }
    expect(validateBooking({ ...baseDto, passengerCount: 0 }, opts()).ok).toBe(false);
    expect(validateBooking({ ...baseDto, passengerCount: 3 }, opts()).ok).toBe(true);
  });

  it('ignores passengerCount and rideType for bao (defaults to 1)', () => {
    const r = validateBooking({ ...baseDto, rideType: 'bao', passengerCount: 5 }, opts());
    expect(r.ok).toBe(true);
    if (!r.ok || r.bot) return;
    expect(r.data.passengerCount).toBe(1);
    expect(r.data.rideType).toBe('bao');
  });

  it('ignores rideType/passengerCount for guihang', () => {
    const r = validateBooking(
      { ...baseDto, vehicleType: 'guihang', rideType: 'ghep', passengerCount: 2 },
      opts(),
    );
    expect(r.ok).toBe(true);
    if (!r.ok || r.bot) return;
    expect(r.data.rideType).toBeNull();
    expect(r.data.passengerCount).toBe(1);
  });

  it('rejects invalid vehicleType and unknown rideType', () => {
    expect(validateBooking({ ...baseDto, vehicleType: '8cho' }, opts()).ok).toBe(false);
    const r = validateBooking({ ...baseDto, rideType: 'thue' }, opts());
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.fields.some((f) => f.field === 'rideType')).toBe(true);
    }
  });

  it('rejects 16cho combined with ghep', () => {
    const r = validateBooking({ ...baseDto, vehicleType: '16cho', rideType: 'ghep' }, opts());
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.fields.some((f) => f.field === 'vehicleType' || f.field === 'rideType')).toBe(true);
    }
  });

  it('requires rideType for passenger trips', () => {
    const r = validateBooking({ ...baseDto, rideType: null }, opts());
    expect(r.ok).toBe(false);
  });

  it('returns PICKUP_TIME_TOO_SOON for near pickup', () => {
    const r = validateBooking(
      { ...baseDto, pickupDateTime: new Date(NOW + 5 * MIN).toISOString() },
      opts(),
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.code).toBe('PICKUP_TIME_TOO_SOON');
  });

  it('accepts boundary pickup now + 15 minutes and rejects far future', () => {
    const boundary = validateBooking(
      { ...baseDto, pickupDateTime: new Date(NOW + 15 * MIN).toISOString() },
      opts(),
    );
    expect(boundary.ok).toBe(true);
    const far = validateBooking(
      { ...baseDto, pickupDateTime: new Date(NOW + 91 * DAY).toISOString() },
      opts(),
    );
    expect(far.ok).toBe(false);
    if (!far.ok) expect(far.code).toBe('VALIDATION_ERROR');
  });

  it('strips HTML from note and enforces ≤ 500 chars', () => {
    const r = validateBooking({ ...baseDto, note: '<b>x</b>' }, opts());
    expect(r.ok).toBe(true);
    if (r.ok && !r.bot) expect(r.data.note).toBe('x');
    expect(validateBooking({ ...baseDto, note: 'x'.repeat(501) }, opts()).ok).toBe(false);
  });

  it('validates distanceKm 1–2000 and airportDirection enum', () => {
    expect(validateBooking({ ...baseDto, distanceKm: 0 }, opts()).ok).toBe(false);
    expect(validateBooking({ ...baseDto, distanceKm: 2001 }, opts()).ok).toBe(false);
    expect(validateBooking({ ...baseDto, distanceKm: 100 }, opts()).ok).toBe(true);
    expect(validateBooking({ ...baseDto, airportDirection: 'sideways' }, opts()).ok).toBe(false);
    expect(
      validateBooking(
        { ...baseDto, airportDirection: 'to_airport', airportDistrict: 'quan-cau-giay' },
        opts(),
      ).ok,
    ).toBe(true);
  });

  it('uses settings.minLeadTimeMinutes when provided', () => {
    const later = new Date(NOW + 10 * MIN).toISOString();
    expect(validateBooking({ ...baseDto, pickupDateTime: later }, opts()).ok).toBe(false);
    expect(
      validateBooking(
        { ...baseDto, pickupDateTime: later },
        opts({ settings: { minLeadTimeMinutes: 5, maxPassengersPerShareTrip: 3 } }),
      ).ok,
    ).toBe(true);
  });
});
