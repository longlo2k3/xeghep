import { beforeEach, describe, expect, it } from 'vitest';

import { POST as postBooking } from '../src/app/api/v1/bookings/route';
import { GET as getBooking } from '../src/app/api/v1/bookings/[code]/route';
import { resetRateLimits } from '../src/lib/api/rateLimit';
import {
  formatStoredPrice,
  maskPhone,
  paymentMethodLabel,
  serializeRouteCard,
  serializeRouteDetail,
  statusLabel,
  toVietnamIso,
} from '../src/lib/api/serialize';
import type { Route } from '../src/payload-types';

function jsonRequest(
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

function lookupRequest(url: string, ip = 'test-lookup'): Request {
  return new Request(url, { headers: { 'x-forwarded-for': ip } });
}

beforeEach(() => {
  resetRateLimits();
});

describe('POST /api/v1/bookings — handler (no DB paths)', () => {
  const validBody = {
    customerName: 'Nguyễn Tuấn Anh',
    customerPhone: '0962.298.293',
    routeSlug: 'hai-phong-ha-noi-noi-bai',
    pickupLocation: 'Quán Toan, Hồng Bàng, Hải Phòng',
    dropoffLocation: 'Sảnh T1 Sân bay Nội Bài',
    rideType: 'ghep',
    vehicleType: '4cho',
    passengerCount: 1,
    pickupDateTime: '2030-01-10T08:30:00+07:00',
    note: '',
    website: '',
  };

  it('honeypot: returns 201 with plausible payload without persisting', async () => {
    const res = await postBooking(
      jsonRequest('http://localhost/api/v1/bookings', { ...validBody, website: 'spam.example' }, { 'x-forwarded-for': 'bk-hp' }),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.statusCode).toBe(201);
    expect(body.message).toBe('Đặt xe thành công. Tổng đài viên sẽ gọi lại trong ít phút.');
    expect(body.data.bookingCode).toMatch(/^XG-\d{6}-[2-9A-HJ-NP-Z]{6}$/);
    expect(body.data.lookupToken).toMatch(/^[0-9a-f]{16}$/);
    expect(body.data.status).toBe('pending');
    expect(body.data.statusLabel).toBe('Chờ xác nhận');
    expect(body.data.paymentMethod).toBe('cash');
    expect(Object.keys(body.data)).toEqual(
      expect.arrayContaining([
        'bookingCode',
        'lookupToken',
        'customerName',
        'customerPhone',
        'route',
        'pickupLocation',
        'dropoffLocation',
        'rideType',
        'vehicleType',
        'passengerCount',
        'pickupDateTime',
        'priceType',
        'estimatedPrice',
        'estimatedPriceMax',
        'estimatedPriceFormatted',
        'unit',
        'priceNote',
        'paymentMethod',
        'status',
        'statusLabel',
        'createdAt',
      ]),
    );
  });

  it('invalid phone → 422 VALIDATION_ERROR with customerPhone field', async () => {
    const res = await postBooking(
      jsonRequest('http://localhost/api/v1/bookings', { ...validBody, customerPhone: '12345' }, { 'x-forwarded-for': 'bk-phone' }),
    );
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.fields).toEqual(
      expect.arrayContaining([
        { field: 'customerPhone', message: 'Số điện thoại không hợp lệ.' },
      ]),
    );
  });

  it('pickup too soon → 422 PICKUP_TIME_TOO_SOON', async () => {
    const soon = new Date(Date.now() + 60_000).toISOString();
    const res = await postBooking(
      jsonRequest('http://localhost/api/v1/bookings', { ...validBody, pickupDateTime: soon }, { 'x-forwarded-for': 'bk-soon' }),
    );
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe('PICKUP_TIME_TOO_SOON');
  });

  it('invalid Idempotency-Key → 422', async () => {
    const res = await postBooking(
      jsonRequest(
        'http://localhost/api/v1/bookings',
        { ...validBody, customerPhone: '0962298294' },
        { 'x-forwarded-for': 'bk-idem', 'idempotency-key': 'not-a-uuid' },
      ),
    );
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.fields[0].field).toBe('Idempotency-Key');
  });

  it('rate limits 6th booking request per IP with 429', async () => {
    let saw429 = false;
    for (let i = 0; i < 6; i++) {
      const res = await postBooking(
        jsonRequest('http://localhost/api/v1/bookings', { ...validBody, customerPhone: '0962298295' }, { 'x-forwarded-for': 'bk-rl' }),
      );
      if (res.status === 429) {
        saw429 = true;
        expect(res.headers.get('Retry-After')).toBeTruthy();
        const body = await res.json();
        expect(body.error.code).toBe('RATE_LIMITED');
        break;
      }
    }
    expect(saw429).toBe(true);
  });
});

describe('GET /api/v1/bookings/[code] — no-DB 404 path', () => {
  it('missing auth (no t / phoneLast4) → 404 BOOKING_NOT_FOUND with no-store', async () => {
    const res = await getBooking(lookupRequest('http://localhost/api/v1/bookings/XG-261010-ABCDEF'), {
      params: Promise.resolve({ code: 'XG-261010-ABCDEF' }),
    });
    expect(res.status).toBe(404);
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
    const body = await res.json();
    expect(body.error.code).toBe('BOOKING_NOT_FOUND');
    expect(body.error.message).toBe('Không tìm thấy dữ liệu');
  });
});

describe('serializeRouteCard / serializeRouteDetail (pure)', () => {
  const fakeRoute = {
    id: 1,
    slug: 'hai-phong-ha-noi-noi-bai',
    name: 'Hải Phòng ⇄ Hà Nội ⇄ Nội Bài',
    origin: 'Hải Phòng',
    destination: 'Hà Nội / Nội Bài',
    distance: '120 - 145 km',
    duration: '1 giờ 30 phút',
    tierShare1: { min: 400000, max: null, from: false, negotiable: false },
    tierShare2: { min: 700000, max: null, from: false, negotiable: false },
    tierCharter45: { min: 899000, max: null, from: true, negotiable: false },
    tierCharter7: { min: 999000, max: null, from: true, negotiable: false },
    priceFrom: 400000,
    priceValidUntil: null,
    pricingDetails: [
      { tierKey: 'share1', label: 'Ghép 1 người', note: null },
      { tierKey: 'share2', label: 'Ghép 2 người', note: null },
      { tierKey: 'charter45', label: 'Bao xe 5 chỗ', note: null },
      { tierKey: 'charter7', label: 'Bao xe 7 chỗ', note: null },
    ],
    description: 'Tuyến Hải Phòng đi Hà Nội và Nội Bài.',
    detailedContent: null,
    operatingHoursText: null,
    frequencyText: null,
    pickups: [{ text: 'Quán Toan' }],
    dropoffs: [{ text: 'Sân bay Nội Bài' }],
    originAliases: [{ text: 'Hải Phòng' }],
    destinationAliases: [{ text: 'Nội Bài' }],
    regions: ['Hải Phòng', 'Hà Nội'],
    thumbnail: { filename: 'noibai-card.webp', width: 640, height: 400, alt: 'Xe ghép' },
    slides: [],
    faqs: [{ question: 'Q?', answer: 'A.' }],
    relatedRoutes: [],
    isBannerTop: true,
    bannerLabel: 'Hải Phòng ⇔ Hà Nội ⇔ Nội Bài',
    sortOrder: 1,
    status: 'active',
    seo: {
      metaTitle: 'Xe Ghép Hải Phòng Hà Nội Nội Bài',
      appendBrand: true,
      metaDescription: 'Mô tả',
      ogImage: { filename: 'noibai-og.webp', width: 1200, height: 630, alt: 'OG' },
      noindex: false,
    },
    updatedAt: '2026-10-09T02:30:00.000Z',
    createdAt: '2026-10-01T02:30:00.000Z',
  } as unknown as Route;

  const rangeRoute = {
    ...fakeRoute,
    slug: 'hai-phong-ha-long',
    tierShare1: { min: 250000, max: 300000, from: false, negotiable: false },
    tierCharter7: { min: null, max: null, from: false, negotiable: true },
  } as unknown as Route;

  it('formats card price texts (400k / 700k / từ 899k)', () => {
    const card = serializeRouteCard(fakeRoute);
    expect(card.priceShare1Text).toBe('400k');
    expect(card.priceShare2Text).toBe('700k');
    expect(card.priceCharter4to5Text).toBe('từ 899k');
    expect(card.priceCharter7Text).toBe('từ 999k');
    expect(card.priceFrom).toBe(400000);
    expect(card.bannerLabel).toBe('Hải Phòng ⇔ Hà Nội ⇔ Nội Bài');
    expect(card.pricingDetails.map((r) => r.price)).toEqual(['400k', '700k', 'từ 899k', 'từ 999k']);
    expect(card.thumbnail).toEqual({
      url: 'http://localhost:4001/media/noibai-card.webp',
      width: 640,
      height: 400,
      alt: 'Xe ghép',
    });
  });

  it('formats range tier and negotiable tier as Liên hệ thỏa thuận', () => {
    const card = serializeRouteCard(rangeRoute);
    expect(card.priceShare1Text).toBe('250k – 300k');
    expect(card.priceCharter7Text).toBe('Liên hệ thỏa thuận');
  });

  it('builds public price rows from saved tiers when a new route has no pricingDetails', () => {
    const route = { ...fakeRoute, pricingDetails: null, tierShare2: null } as unknown as Route;
    const card = serializeRouteCard(route);
    expect(card.pricingDetails.map((row) => [row.label, row.price])).toEqual([
      ['Xe ghép 1 người', '400k'],
      ['Bao xe 4-5 chỗ', 'từ 899k'],
      ['Bao xe 7 chỗ', 'từ 999k'],
    ]);
  });

  it('serves custom pricing HTML only when enabled and sanitizes executable markup', () => {
    const route = {
      ...fakeRoute,
      useCustomPricingHtml: true,
      customPricingHtml: '<table><tr><td>400k</td></tr></table><script>alert(1)</script><a href="javascript:alert(1)" onclick="alert(2)">Xem thêm</a>',
      customPricingCss: '.price { color: #dc2626 }',
      customPricingJs: 'document.querySelector("table")?.classList.add("ready")',
    } as unknown as Route;
    const enabled = serializeRouteDetail(route).customPricingHtml;
    expect(enabled).toContain('<table>');
    expect(enabled).toContain('400k');
    expect(enabled).not.toContain('script');
    expect(enabled).not.toContain('onclick');
    expect(enabled).not.toContain('javascript:');
    expect(serializeRouteDetail(route).customPricingCss).toContain('[data-route-pricing] .price');
    expect(serializeRouteDetail(route).customPricingJs).toContain('classList.add');
    expect(serializeRouteDetail({ ...route, useCustomPricingHtml: false }).customPricingHtml).toBeNull();
    expect(serializeRouteDetail({ ...route, useCustomPricingHtml: false }).customPricingCss).toBeNull();
    expect(serializeRouteDetail({ ...route, useCustomPricingHtml: false }).customPricingJs).toBeNull();
  });

  it('missing tier group → text Liên hệ thỏa thuận, tier null', () => {
    const card = serializeRouteCard(rangeRoute);
    expect(card.tiers.charter7).toEqual({ min: null, max: null, from: false, negotiable: true });
  });

  it('detail includes seo group, relatedRoutes, +07 updatedAt, empty detailedContent null', () => {
    const detail = serializeRouteDetail(fakeRoute, { full: true, relatedRoutes: [] });
    expect(detail.detailedContent).toBeNull();
    expect(detail.pickups).toEqual(['Quán Toan']);
    expect(detail.faqs).toEqual([{ question: 'Q?', answer: 'A.' }]);
    expect(detail.seo).toEqual({
      metaTitle: 'Xe Ghép Hải Phòng Hà Nội Nội Bài',
      appendBrand: true,
      metaDescription: 'Mô tả',
      ogImage: { url: 'http://localhost:4001/media/noibai-og.webp', width: 1200, height: 630, alt: 'OG' },
      noindex: false,
    });
    expect(detail.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+07:00$/);
    expect(detail.originAliases).toEqual(['Hải Phòng']);
    expect(detail.destinationAliases).toEqual(['Nội Bài']);
  });
});

describe('label / mask / stored price helpers', () => {
  it('statusLabel maps all statuses', () => {
    expect(statusLabel('pending')).toBe('Chờ xác nhận');
    expect(statusLabel('confirmed')).toBe('Đã xác nhận');
    expect(statusLabel('in_progress')).toBe('Đang trên đường');
    expect(statusLabel('completed')).toBe('Hoàn thành');
    expect(statusLabel('cancelled')).toBe('Đã hủy');
  });

  it('paymentMethodLabel maps cash/transfer/null', () => {
    expect(paymentMethodLabel('cash')).toBe('Tiền mặt');
    expect(paymentMethodLabel('transfer')).toBe('Chuyển khoản');
    expect(paymentMethodLabel(null)).toBeNull();
  });

  it('maskPhone hides middle digits', () => {
    expect(maskPhone('0962298293')).toBe('0962***293');
  });

  it('formatStoredPrice reconstructs display strings', () => {
    expect(formatStoredPrice('fixed', 400000, null)).toBe('400.000đ');
    expect(formatStoredPrice('from', 899000, null)).toBe('899.000đ');
    expect(formatStoredPrice('range', 250000, 300000)).toBe('250.000đ – 300.000đ');
    expect(formatStoredPrice('negotiable', null, null)).toBe('Liên hệ báo giá');
    expect(formatStoredPrice('quote_required', null, null)).toBe('Liên hệ báo giá');
  });

  it('toVietnamIso emits +07:00 offset', () => {
    const iso = toVietnamIso(new Date('2026-10-10T01:30:00.000Z'));
    expect(iso).toBe('2026-10-10T08:30:00+07:00');
  });
});
