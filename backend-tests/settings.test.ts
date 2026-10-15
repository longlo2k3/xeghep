import { describe, expect, it } from 'vitest';

import { validateAirportRoundTrip } from '../src/lib/settings/airportRules';
import { validateDistanceRanges } from '../src/lib/settings/distanceRules';
import {
  deriveCompanyLinks,
  serializeCompanySettings,
  visibleTestimonials,
} from '../src/lib/settings/company';
import { priceValidUntilWarning } from '../src/lib/settings/priceValidUntil';
import {
  serializeAirportPricing,
  serializeDistancePricing,
  settingsCacheHeaders,
} from '../src/lib/settings/serialize';
import { CompanySettings } from '../src/globals/CompanySettings';
import { PricingSettings } from '../src/globals/PricingSettings';

type FieldLike = {
  name?: string;
  virtual?: boolean;
  fields?: FieldLike[];
  tabs?: { fields?: FieldLike[] }[];
};

function collectFields(fields: FieldLike[] | undefined, acc: FieldLike[] = []): FieldLike[] {
  for (const field of fields ?? []) {
    acc.push(field);
    if (Array.isArray(field.fields)) collectFields(field.fields, acc);
    if (Array.isArray(field.tabs)) {
      for (const tab of field.tabs) collectFields(tab.fields, acc);
    }
  }
  return acc;
}

describe('CompanySettings — giá trị phái sinh (FR-D10, tính lúc đọc, không lưu DB)', () => {
  it('deriveCompanyLinks: hotline → tel/sms/zalo href theo E.164 (+84 bỏ 0)', () => {
    expect(
      deriveCompanyLinks({ hotlineRaw: '0962298293', website: 'https://www.xegheplientinh.vn/' }),
    ).toEqual({
      hotlineHref: 'tel:+84962298293',
      zaloHref: 'https://zalo.me/84962298293',
      smsHref: 'sms:+84962298293',
      domainName: 'xegheplientinh.vn',
    });
  });

  it('đổi hotline → mọi href đổi theo (không hardcode số cũ)', () => {
    const before = deriveCompanyLinks({ hotlineRaw: '0962298293', website: 'xegheplientinh.vn' });
    const after = deriveCompanyLinks({ hotlineRaw: '0858911247', website: 'xegheplientinh.vn' });
    expect(after.hotlineHref).not.toBe(before.hotlineHref);
    expect(after.hotlineHref).toBe('tel:+84858911247');
    expect(after.zaloHref).toBe('https://zalo.me/84858911247');
    expect(after.smsHref).toBe('sms:+84858911247');
    expect(after.domainName).toBe(before.domainName);
  });

  it('domainName: tự bỏ www, chấp nhận website không có scheme, website rỗng → ""', () => {
    expect(deriveCompanyLinks({ hotlineRaw: '0962298293', website: 'xegheplientinh.vn' }).domainName).toBe(
      'xegheplientinh.vn',
    );
    expect(deriveCompanyLinks({ hotlineRaw: '0962298293', website: '' }).domainName).toBe('');
    expect(deriveCompanyLinks({ hotlineRaw: '0962298293', website: null }).domainName).toBe('');
  });

  it('hotlineRaw thiếu/sai định dạng → href rỗng (không sinh link sai)', () => {
    const out = deriveCompanyLinks({ hotlineRaw: '12345', website: 'xegheplientinh.vn' });
    expect(out.hotlineHref).toBe('');
    expect(out.zaloHref).toBe('');
    expect(out.smsHref).toBe('');
    expect(out.domainName).toBe('xegheplientinh.vn');
  });

  it('không trường derived nào được khai báo lưu DB trong CompanySettings (virtual mới hợp lệ)', () => {
    const derivedNames = ['hotlineHref', 'zaloHref', 'smsHref', 'domainName'];
    const declared = collectFields(CompanySettings.fields as FieldLike[]).filter((f) =>
      derivedNames.includes(f.name ?? ''),
    );
    expect(declared.length).toBeGreaterThan(0);
    for (const field of declared) {
      expect(field.virtual, `field "${field.name}" phải là virtual (không lưu DB)`).toBe(true);
    }
  });

  it('visibleTestimonials: chỉ loại đúng isVisible = false (true/undefined giữ lại)', () => {
    const list = [
      { author: 'A', isVisible: true },
      { author: 'B', isVisible: false },
      { author: 'C' },
      { author: 'D', isVisible: null },
    ];
    expect(visibleTestimonials(list).map((t) => t.author)).toEqual(['A', 'C', 'D']);
    expect(visibleTestimonials(null)).toEqual([]);
    expect(visibleTestimonials(undefined)).toEqual([]);
  });

  it('serializeCompanySettings: kèm derived + chỉ trả testimonials đang hiển thị', () => {
    const out = serializeCompanySettings({
      identity: { companyName: 'Công ty TNHH Xe Ghép', website: 'https://xegheplientinh.vn' },
      contact: { hotline: '0962.298.293', hotlineRaw: '0962298293', email: 'ops@example.com' },
      testimonials: [
        { author: 'Chị Hương', content: 'Đúng giờ.', isVisible: true },
        { author: 'Anh Nam', content: 'Đánh giá ẩn.', isVisible: false },
        { author: 'Chị Lan', content: 'Xe sạch.' },
      ],
    });
    expect(out.hotlineHref).toBe('tel:+84962298293');
    expect(out.zaloHref).toBe('https://zalo.me/84962298293');
    expect(out.smsHref).toBe('sms:+84962298293');
    expect(out.domainName).toBe('xegheplientinh.vn');
    expect(out.testimonials.map((t) => t.author)).toEqual(['Chị Hương', 'Chị Lan']);
    expect((out as { identity?: { companyName?: string } }).identity?.companyName).toBe(
      'Công ty TNHH Xe Ghép',
    );
  });
});

describe('distance_rates — không chồng lấn, không khoảng hở (FR-D07)', () => {
  it('4 dải seed 0–30 / 31–100 / 101–200 / 201+ hợp lệ', () => {
    const res = validateDistanceRanges([
      { label: 'Dưới 30 km', minKm: 0, maxKm: 30 },
      { label: '31–100 km', minKm: 31, maxKm: 100 },
      { label: '101–200 km', minKm: 101, maxKm: 200 },
      { label: 'Trên 200 km', minKm: 201, maxKm: null },
    ]);
    expect(res.ok).toBe(true);
    expect(res.message).toBeNull();
  });

  it('dải liền kề đúng biên [0-30][31-80] là hợp lệ (biên nguyên: dải sau = max trước + 1)', () => {
    const res = validateDistanceRanges([
      { label: 'A', minKm: 0, maxKm: 30 },
      { label: 'B', minKm: 31, maxKm: 80 },
    ]);
    expect(res.ok).toBe(true);
  });

  it('khoảng hở [0-30][40-80] bị từ chối (thiếu 31–39)', () => {
    const res = validateDistanceRanges([
      { label: 'A', minKm: 0, maxKm: 30 },
      { label: 'B', minKm: 40, maxKm: 80 },
    ]);
    expect(res.ok).toBe(false);
    expect(res.message ?? '').toMatch(/khoảng hở/);
    expect(res.message ?? '').toMatch(/31/);
  });

  it('chồng lấn [0-50][40-100] bị từ chối', () => {
    const res = validateDistanceRanges([
      { label: 'A', minKm: 0, maxKm: 50 },
      { label: 'B', minKm: 40, maxKm: 100 },
    ]);
    expect(res.ok).toBe(false);
    expect(res.message ?? '').toMatch(/chồng lấn/);
  });

  it('chạm biên [0-30][30-80] là chồng lấn (km 30 bị tính hai lần) → từ chối', () => {
    const res = validateDistanceRanges([
      { label: 'A', minKm: 0, maxKm: 30 },
      { label: 'B', minKm: 30, maxKm: 80 },
    ]);
    expect(res.ok).toBe(false);
    expect(res.message ?? '').toMatch(/chồng lấn/);
  });

  it('không sắp xếp vẫn kiểm đúng (sort theo minKm trước khi check)', () => {
    const res = validateDistanceRanges([
      { label: 'B', minKm: 31, maxKm: 100 },
      { label: 'A', minKm: 0, maxKm: 30 },
    ]);
    expect(res.ok).toBe(true);
  });

  it('km không phải số nguyên bị từ chối', () => {
    const res = validateDistanceRanges([
      { label: 'A', minKm: 0.5, maxKm: 30 },
      { label: 'B', minKm: 31, maxKm: 100 },
    ]);
    expect(res.ok).toBe(false);
    expect(res.message ?? '').toMatch(/nguyên/);
  });

  it('dải không giới hạn (maxKm null) phải đứng cuối — dải sau bị coi là chồng lấn', () => {
    const res = validateDistanceRanges([
      { label: 'A', minKm: 0, maxKm: 30 },
      { label: 'Mở', minKm: 31, maxKm: null },
      { label: 'B', minKm: 50, maxKm: 80 },
    ]);
    expect(res.ok).toBe(false);
    expect(res.message ?? '').toMatch(/chồng lấn/);
  });
});

describe('airport_pricing — cảnh báo giá khứ hồi không chặn lưu (FR-D06)', () => {
  const overpriced = {
    district: 'Quận Cầu Giấy',
    fromHanoiToAirport: { sedan5Seats: 190000, suv7Seats: 230000, van16Seats: 450000 },
    fromAirportToHanoi: { sedan5Seats: 240000, suv7Seats: 280000, van16Seats: 500000 },
    roundTrip: { sedan5Seats: 500000, suv7Seats: 480000, van16Seats: 850000 },
  };

  const balanced = {
    district: 'Quận Ba Đình',
    fromHanoiToAirport: { sedan5Seats: 190000, suv7Seats: 230000, van16Seats: 450000 },
    fromAirportToHanoi: { sedan5Seats: 240000, suv7Seats: 280000, van16Seats: 500000 },
    roundTrip: { sedan5Seats: 390000, suv7Seats: 480000, van16Seats: 850000 },
  };

  it('giá khứ hồi > tổng hai chiều → có cảnh báo (theo từng cột xe)', () => {
    const res = validateAirportRoundTrip(overpriced);
    expect(res.ok).toBe(true);
    expect(res.warnings.length).toBeGreaterThan(0);
    expect(res.warnings.join(' ')).toMatch(/Sedan 5 chỗ/);
    expect(res.warnings.join(' ')).toMatch(/Cầu Giấy/);
  });

  it('cảnh báo KHÔNG chặn lưu: validate luôn ok=true dù có warnings', () => {
    const res = validateAirportRoundTrip(overpriced);
    expect(res.ok).toBe(true);
    expect(res.warnings.length).toBeGreaterThan(0);
  });

  it('giá khứ hồi ≤ tổng hai chiều → không cảnh báo', () => {
    const res = validateAirportRoundTrip(balanced);
    expect(res.ok).toBe(true);
    expect(res.warnings).toEqual([]);
  });
});

describe('priceValidUntil — cảnh báo admin (T040 / SCH-1 / D12)', () => {
  const now = new Date('2026-10-10T03:00:00.000Z');

  it('priceValidUntil bắt buộc trên PricingSettings', () => {
    const field = (PricingSettings.fields as { name?: string; required?: boolean }[]).find(
      (f) => f.name === 'priceValidUntil',
    );
    expect(field).toBeTruthy();
    expect(field?.required).toBe(true);
  });

  it('mô tả trường hướng dẫn Marketer cập nhật khi sắp hết hạn', () => {
    const field = (
      PricingSettings.fields as { name?: string; admin?: { description?: string } }[]
    ).find((f) => f.name === 'priceValidUntil');
    expect(field?.admin?.description ?? '').toMatch(/Marketer/);
  });

  it('đã qua ngày → "Đã hết hạn"', () => {
    const warning = priceValidUntilWarning('2026-10-05', now);
    expect(warning ?? '').toMatch(/Đã hết hạn/);
    expect(warning ?? '').toContain('05/10/2026');
  });

  it('còn ≤ 30 ngày → "Sắp hết hạn" kèm số ngày', () => {
    const warning = priceValidUntilWarning('2026-10-20', now);
    expect(warning ?? '').toMatch(/Sắp hết hạn/);
    expect(warning ?? '').toContain('còn 10 ngày');
  });

  it('còn > 30 ngày → không cảnh báo', () => {
    expect(priceValidUntilWarning('2027-01-31', now)).toBeNull();
  });

  it('thiếu ngày → cảnh báo bổ sung (không bỏ qua)', () => {
    expect(priceValidUntilWarning(null, now) ?? '').toMatch(/Đã hết hạn|Chưa/);
  });
});

describe('T071 — serialize payload theo contracts/api.md §4 + cache tags', () => {
  it('pricing/airport: đúng 5 khóa nhóm theo hợp đồng', () => {
    const out = serializeAirportPricing({
      slug: 'quan-cau-giay',
      district: 'Quận Cầu Giấy',
      isActive: true,
      sortOrder: 1,
      fromHanoiToAirport: { sedan5Seats: 190000, suv7Seats: 230000, van16Seats: 450000 },
      fromAirportToHanoi: { sedan5Seats: 240000, suv7Seats: 280000, van16Seats: 500000 },
      roundTrip: { sedan5Seats: 390000, suv7Seats: 480000, van16Seats: 850000 },
    });
    expect(Object.keys(out).sort()).toEqual([
      'district',
      'fromAirportToHanoi',
      'fromHanoiToAirport',
      'roundTrip',
      'slug',
    ]);
    expect(out.fromHanoiToAirport).toEqual({ sedan5Seats: 190000, suv7Seats: 230000, van16Seats: 450000 });
    expect(Object.keys(out.roundTrip).sort()).toEqual(['sedan5Seats', 'suv7Seats', 'van16Seats']);
  });

  it('pricing/distance: { rates[], policies } đúng hợp đồng', () => {
    const out = serializeDistancePricing(
      [
        {
          label: 'Dưới 30 km (tối thiểu)',
          minKm: 0,
          maxKm: 30,
          sedan5Seats: 11000,
          suv7Seats: 13000,
          van16Seats: 18000,
        },
        {
          label: 'Trên 200 km',
          minKm: 201,
          maxKm: null,
          sedan5Seats: 8000,
          suv7Seats: 9500,
          van16Seats: 13500,
        },
      ],
      {
        roundTripDiscountText: 'Giảm 60% chiều về.',
        waitingTimeText: 'Chờ tối đa 3 giờ.',
        waitingFreeMinutes: 60,
        waitingFeePerHour: 60000,
        waitingMaxHours: 3,
        tollsNote: 'Chưa gồm phí cầu đường.',
        overnightNote: 'Liên hệ tổng đài lưu đêm.',
        overnightPhone: '0858911247',
      },
    );
    expect(Object.keys(out).sort()).toEqual(['policies', 'rates']);
    expect(out.rates).toHaveLength(2);
    expect(Object.keys(out.rates[0]).sort()).toEqual([
      'label',
      'maxKm',
      'minKm',
      'sedan5Seats',
      'suv7Seats',
      'van16Seats',
    ]);
    expect(Object.keys(out.policies).sort()).toEqual(
      [
        'roundTripDiscountText',
        'waitingTimeText',
        'waitingFreeMinutes',
        'waitingFeePerHour',
        'waitingMaxHours',
        'tollsNote',
        'overnightNote',
        'overnightPhone',
      ].sort(),
    );
    expect(out.policies.overnightPhone).toBe('0858911247');
    expect(out.rates[1].maxKm).toBeNull();
  });

  it('policies thiếu giá trị → null (không undefined trong JSON)', () => {
    const out = serializeDistancePricing([], {});
    expect(out.policies.roundTripDiscountText).toBeNull();
    expect(out.policies.waitingFeePerHour).toBeNull();
    expect(JSON.parse(JSON.stringify(out)).policies.tollsNote).toBeNull();
  });

  it('cache headers: s-maxage=60 + Cache-Tag theo contract §0', () => {
    const company = settingsCacheHeaders('company');
    expect(company['Cache-Control']).toContain('s-maxage=60');
    expect(company['Cache-Tag']).toBe('company');

    const airport = settingsCacheHeaders('pricing', 'airport-pricing');
    expect(airport['Cache-Tag']).toBe('pricing, airport-pricing');
    expect(airport['Cache-Control']).toContain('s-maxage=60');
  });
});
