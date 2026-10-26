import { z } from 'zod';

import { generateBookingCode } from '../../../../lib/booking/bookingCode';
import { getLookupSecret, makeLookupToken } from '../../../../lib/booking/lookupToken';
import { validatePhone, validateBooking } from '../../../../lib/booking/validate';
import { getClientIp, getPayloadInstance, hashIp } from '../../../../lib/api/ctx';
import { jsonError, jsonOk, optionsCorsResponse, zodToFields, type ApiSuccess } from '../../../../lib/api/envelope';
import {
  createMemoryIdempotencyStore,
  UUID_RE,
  withIdempotency,
} from '../../../../lib/api/idempotency';
import { enforceRateLimit, RATE_RULES } from '../../../../lib/api/rateLimit';
import { statusLabel, toVietnamIso } from '../../../../lib/api/serialize';
import { formatTier } from '../../../../lib/pricing/formatTier';
import type { PriceTier } from '../../../../lib/pricing/types';
import { sendBookingNotificationEmail } from '../../../../lib/notify/email';

const SUCCESS_MESSAGE = 'Đặt xe thành công. Tổng đài viên sẽ gọi lại trong ít phút.';
const HONEYPOT_MESSAGE = 'Đặt xe thành công. Tổng đài viên sẽ gọi lại trong ít phút.';

const idempotencyStore = createMemoryIdempotencyStore();

const bookingSchema = z.object({
  customerName: z.string().trim().min(2, 'Họ tên phải từ 2 đến 100 ký tự.').max(100, 'Họ tên phải từ 2 đến 100 ký tự.'),
  customerPhone: z
    .string({ required_error: 'Số điện thoại không hợp lệ.' })
    .trim()
    .min(1, 'Số điện thoại không hợp lệ.')
    .refine((v) => validatePhone(v).ok, { message: 'Số điện thoại không hợp lệ.' }),
  routeSlug: z.string().trim().nullish(),
  pickupLocation: z.string().trim().min(3, 'Điểm đón phải từ 3 đến 255 ký tự.').max(255, 'Điểm đón phải từ 3 đến 255 ký tự.'),
  dropoffLocation: z.string().trim().min(3, 'Điểm đến phải từ 3 đến 255 ký tự.').max(255, 'Điểm đến phải từ 3 đến 255 ký tự.'),
  rideType: z.enum(['ghep', 'bao']).nullish(),
  vehicleType: z.enum(['4cho', '5cho', '7cho', '16cho', 'guihang']),
  passengerCount: z.number().int().min(1).max(3).optional(),
  pickupDateTime: z.string().trim().min(1, 'Thời gian đón là bắt buộc.'),
  note: z.string().nullish(),
  airportDistrict: z.string().trim().nullish(),
  airportDirection: z.enum(['to_airport', 'from_airport', 'round_trip']).nullish(),
  distanceKm: z.number().nullish(),
  website: z.string().nullish(),
});

class HandlerExit extends Error {
  constructor(public response: Response) {
    super('HANDLER_EXIT');
  }
}

const NOTE_SHARE =
  'Đón trả tận nhà 2 chiều • Ghép tối đa 1–3 người trên xe, không nhồi nhét.';
const NOTE_CHARTER =
  'Xe riêng đón tận nhà, chủ động giờ đi, tài xế thân thiện, đã bao gồm chi phí đường bộ cơ bản.';
const NOTE_QUOTE = 'Tổng đài sẽ gọi báo giá trọn gói ưu đãi nhất theo đúng lộ trình của bạn.';

type TierGroup = {
  min?: number | null;
  max?: number | null;
  from?: boolean | null;
  negotiable?: boolean | null;
} | null;

type RouteTiersLike = {
  tierShare1?: TierGroup;
  tierShare2?: TierGroup;
  tierCharter45?: TierGroup;
  tierCharter7?: TierGroup;
};

type DerivedPrice = {
  priceType: 'fixed' | 'range' | 'from' | 'negotiable' | 'quote_required';
  estimatedMin: number | null;
  estimatedMax: number | null;
  displayPrice: string;
  unit: string;
  note: string;
};

function toPriceTier(t: TierGroup): PriceTier {
  return {
    min: t?.min ?? null,
    max: t?.max ?? null,
    from: t?.from ?? false,
    negotiable: t?.negotiable ?? false,
  };
}

function fromTier(t: TierGroup, unit: string, note: string): DerivedPrice {
  const tier = toPriceTier(t);
  const noPrice = tier.negotiable || tier.min == null;
  const priceType: DerivedPrice['priceType'] = noPrice
    ? 'negotiable'
    : tier.max != null
      ? 'range'
      : tier.from
        ? 'from'
        : 'fixed';
  return {
    priceType,
    estimatedMin: noPrice ? null : tier.min,
    estimatedMax: noPrice ? null : tier.max,
    displayPrice: noPrice ? 'Liên hệ báo giá' : formatTier(tier, 'full'),
    unit,
    note,
  };
}

function quotePrice(unit: string): DerivedPrice {
  return {
    priceType: 'quote_required',
    estimatedMin: null,
    estimatedMax: null,
    displayPrice: 'Liên hệ báo giá',
    unit,
    note: NOTE_QUOTE,
  };
}

function scaleTier(t: TierGroup, factor: number): TierGroup {
  if (!t) return null;
  return {
    ...t,
    min: t.min == null ? null : t.min * factor,
    max: t.max == null ? null : t.max * factor,
  };
}

function deriveRoutePrice(
  tiers: RouteTiersLike,
  data: { rideType?: 'ghep' | 'bao' | null; vehicleType: string; passengerCount?: number | null },
): DerivedPrice {
  if (data.rideType !== 'bao') {
    const n = data.passengerCount ?? 1;
    if (n >= 3) {
      return fromTier(
        tiers.tierCharter45 ?? null,
        '/ 3 khách (Khuyên bao xe)',
        'Từ 3 khách trở lên, bao trọn gói xe riêng để chủ động thời gian và tối ưu chi phí!',
      );
    }
    if (n === 2) {
      const t = tiers.tierShare2 ?? scaleTier(tiers.tierShare1 ?? null, 2);
      return fromTier(t, '/ 2 khách', NOTE_SHARE);
    }
    return fromTier(tiers.tierShare1 ?? null, '/ khách', NOTE_SHARE);
  }
  if (data.vehicleType === '16cho') {
    return quotePrice('/ trọn chuyến (Xe 16 chỗ)');
  }
  const t = data.vehicleType === '7cho' ? (tiers.tierCharter7 ?? null) : (tiers.tierCharter45 ?? null);
  return fromTier(t, `/ trọn chuyến (Xe ${data.vehicleType.replace('cho', '')} chỗ)`, NOTE_CHARTER);
}

async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const raw = await req.json();
    return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export async function POST(req: Request): Promise<Response> {
  const body = await readJson(req);

  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return fakeSuccess(body);
  }

  const ip = getClientIp(req);
  const ipLimited = enforceRateLimit(`booking:ip:${ip}`, RATE_RULES.bookingPerIp[0], RATE_RULES.bookingPerIp[1]);
  if (ipLimited) return ipLimited;

  const rawPhone = typeof body.customerPhone === 'string' ? body.customerPhone : '';
  const phoneCheck = validatePhone(rawPhone);
  const phoneKey = phoneCheck.ok ? phoneCheck.phone : rawPhone.replace(/[\s.\-]/g, '');
  if (phoneKey) {
    const phoneLimited = enforceRateLimit(
      `booking:phone:${phoneKey}`,
      RATE_RULES.bookingPerPhonePerDay[0],
      RATE_RULES.bookingPerPhonePerDay[1],
    );
    if (phoneLimited) return phoneLimited;
  }

  const idemKey = req.headers.get('idempotency-key');
  if (idemKey && !UUID_RE.test(idemKey)) {
    return jsonError('VALIDATION_ERROR', undefined, {
      fields: [{ field: 'Idempotency-Key', message: 'Idempotency-Key phải là UUID hợp lệ.' }],
    });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('VALIDATION_ERROR', undefined, { fields: zodToFields(parsed.error) });
  }

  try {
    const stored = await withIdempotency(
      idempotencyStore,
      idemKey ?? undefined,
      async () => {
        const rawSlug = parsed.data.routeSlug ?? null;
        const requestedSlug = rawSlug && rawSlug !== 'custom' ? rawSlug : null;

        const validation = validateBooking({ ...parsed.data, routeSlug: null }, {
          settings: {
            minLeadTimeMinutes: process.env.MIN_LEAD_TIME_MINUTES
              ? Number(process.env.MIN_LEAD_TIME_MINUTES)
              : 15,
            maxPassengersPerShareTrip: 3,
          },
          nowMs: Date.now(),
        });
        if (!validation.ok) {
          throw new HandlerExit(
            jsonError(validation.code, validation.message, { fields: validation.fields }),
          );
        }
        if (validation.bot) {
          throw new HandlerExit(
            jsonError('VALIDATION_ERROR', undefined, {
              fields: [{ field: 'website', message: 'Yêu cầu không hợp lệ.' }],
            }),
          );
        }
        const data = validation.data;

        const payload = await getPayloadInstance();

        let routeDoc: { id: number; slug: string; name: string } | null = null;
        let routeTiers: RouteTiersLike | null = null;
        if (requestedSlug) {
          const routeRes = await payload.find({
            collection: 'routes',
            limit: 1,
            depth: 0,
            where: { slug: { equals: requestedSlug }, status: { equals: 'active' } },
            overrideAccess: true,
          });
          const found = routeRes.docs[0];
          if (!found) {
            throw new HandlerExit(
              jsonError('VALIDATION_ERROR', undefined, {
                fields: [{ field: 'routeSlug', message: 'Tuyến không tồn tại hoặc không hoạt động' }],
              }),
            );
          }
          routeDoc = { id: Number(found.id), slug: found.slug, name: found.name };
          routeTiers = found as RouteTiersLike;
        }

        let est: DerivedPrice;
        if (data.vehicleType === 'guihang') {
          const pricingDoc = await payload.findGlobal({
            slug: 'pricing_settings',
            overrideAccess: true,
          });
          est = fromTier(
            { min: pricingDoc.parcelFromPrice ?? null, max: null, from: true, negotiable: false },
            '/ kiện hàng',
            `Giao nhận tận tay 2 đầu, phát hàng nhanh trong ${pricingDoc.parcelDeliveryText ?? '2–4 giờ'}.`,
          );
        } else if (routeTiers) {
          est = deriveRoutePrice(routeTiers, data);
        } else {
          est = quotePrice('/ chuyến');
        }

        const now = new Date();
        const yy = String(now.getFullYear() % 100).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const existingRes = await payload.find({
          collection: 'bookings',
          limit: 100,
          depth: 0,
          where: { bookingCode: { like: `XG-${yy}${mm}${dd}-` } },
          overrideAccess: true,
        });
        const usedCodes = new Set(
          existingRes.docs.map((d) => String(d.bookingCode ?? '')).filter(Boolean),
        );
        const bookingCode = generateBookingCode(now, (c) => usedCodes.has(c));
        const lookupToken = makeLookupToken(bookingCode, getLookupSecret());

        const isParcel = data.vehicleType === 'guihang';
        const created = await payload.create({
          collection: 'bookings',
          overrideAccess: true,
          data: {
            bookingCode,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            route: routeDoc ? routeDoc.id : null,
            serviceType: isParcel ? 'parcel' : 'passenger',
            pickupLocation: data.pickupLocation,
            dropoffLocation: data.dropoffLocation,
            rideType: isParcel ? null : data.rideType,
            vehicleType: data.vehicleType,
            passengerCount: isParcel ? 1 : data.passengerCount,
            pickupDatetime: data.pickupDateTime,
            airportDistrict: data.airportDistrict ?? null,
            airportDirection: data.airportDirection ?? null,
            distanceKm: data.distanceKm ?? null,
            priceType: est.priceType,
            estimatedPrice: est.estimatedMin,
            estimatedPriceMax: est.estimatedMax,
            paymentMethod: 'cash',
            status: 'pending',
            note: data.note ?? null,
            sourceIpHash: hashIp(ip),
          },
        });

        const noPrice = est.priceType === 'negotiable' || est.priceType === 'quote_required';
        const payloadData = {
          bookingCode,
          lookupToken,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          route: routeDoc ? { slug: routeDoc.slug, name: routeDoc.name } : null,
          pickupLocation: data.pickupLocation,
          dropoffLocation: data.dropoffLocation,
          rideType: isParcel ? null : data.rideType,
          vehicleType: data.vehicleType,
          passengerCount: isParcel ? 1 : data.passengerCount,
          pickupDateTime: toVietnamIso(new Date(data.pickupDateTime)),
          priceType: est.priceType,
          estimatedPrice: est.estimatedMin,
          estimatedPriceMax: est.estimatedMax,
          estimatedPriceFormatted: noPrice ? 'Liên hệ báo giá' : est.displayPrice,
          unit: est.unit,
          priceNote: est.note,
          paymentMethod: 'cash',
          status: 'pending',
          statusLabel: statusLabel('pending'),
          createdAt: toVietnamIso(created ? new Date(created.createdAt) : now),
        };
        const envelope = {
          statusCode: 201,
          message: SUCCESS_MESSAGE,
          data: payloadData,
        };

        // Gửi email thông báo đơn đặt xe mới chạy nền (non-blocking)
        void sendBookingNotificationEmail({
          bookingCode,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          pickupLocation: data.pickupLocation,
          dropoffLocation: data.dropoffLocation,
          pickupDateTime: data.pickupDateTime,
          serviceType: isParcel ? 'parcel' : 'passenger',
          rideType: isParcel ? null : data.rideType,
          vehicleType: data.vehicleType,
          passengerCount: isParcel ? 1 : data.passengerCount,
          route: routeDoc ? { slug: routeDoc.slug, name: routeDoc.name } : null,
          estimatedPriceFormatted: payloadData.estimatedPriceFormatted,
          note: data.note ?? null,
        }).catch((err) => {
          console.error('[bookings/emailNotification]', err);
        });

        return envelope;
      },
    );
    return jsonOk(stored.data, { statusCode: stored.statusCode, message: stored.message });
  } catch (err) {
    if (err instanceof HandlerExit) return err.response;
    if (err instanceof Error && err.message === 'INVALID_IDEMPOTENCY_KEY') {
      return jsonError('VALIDATION_ERROR', undefined, {
        fields: [{ field: 'Idempotency-Key', message: 'Idempotency-Key phải là UUID hợp lệ.' }],
      });
    }
    console.error('[bookings/create]', err);
    return jsonError('INTERNAL_ERROR');
  }
}

function fakeSuccess(body: Record<string, unknown>): Response {
  const now = new Date();
  let code: string;
  try {
    code = generateBookingCode(now, () => false);
  } catch {
    code = `XG-000000-F2F2F2`;
  }
  const token = makeLookupToken(code, getLookupSecret());
  const name = typeof body.customerName === 'string' && body.customerName.trim() ? body.customerName.trim() : 'Khách hàng';
  const rawFakePhone = typeof body.customerPhone === 'string' ? body.customerPhone : '';
  const fakePhoneCheck = validatePhone(rawFakePhone);
  const phone = fakePhoneCheck.ok ? fakePhoneCheck.phone : rawFakePhone.replace(/[\s.\-]/g, '');
  const vehicleType = typeof body.vehicleType === 'string' && ['4cho', '5cho', '7cho', '16cho', 'guihang'].includes(body.vehicleType) ? body.vehicleType : '4cho';
  const rideType = body.rideType === 'bao' || body.rideType === 'ghep' ? body.rideType : null;
  const passengerCount = typeof body.passengerCount === 'number' && Number.isInteger(body.passengerCount) && body.passengerCount >= 1 && body.passengerCount <= 3 ? body.passengerCount : 1;
  const pickupRaw = typeof body.pickupDateTime === 'string' ? body.pickupDateTime : '';
  const pickupDate = pickupRaw ? new Date(pickupRaw) : now;
  const data = {
    bookingCode: code,
    lookupToken: token,
    customerName: name,
    customerPhone: phone,
    route: null,
    pickupLocation: typeof body.pickupLocation === 'string' ? body.pickupLocation : '',
    dropoffLocation: typeof body.dropoffLocation === 'string' ? body.dropoffLocation : '',
    rideType,
    vehicleType,
    passengerCount,
    pickupDateTime: toVietnamIso(Number.isNaN(pickupDate.getTime()) ? now : pickupDate),
    priceType: 'fixed',
    estimatedPrice: 400000,
    estimatedPriceMax: null,
    estimatedPriceFormatted: '400.000đ',
    unit: '/ khách',
    priceNote: '',
    paymentMethod: 'cash',
    status: 'pending',
    statusLabel: statusLabel('pending'),
    createdAt: toVietnamIso(now),
  };
  return jsonOk(data, {
    statusCode: 201,
    message: HONEYPOT_MESSAGE,
  });
}

export async function OPTIONS() {
  return optionsCorsResponse();
}
