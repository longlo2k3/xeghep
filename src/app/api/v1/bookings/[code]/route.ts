import { checkPhoneLast4, getLookupSecret, verifyLookupToken } from '../../../../../lib/booking/lookupToken';
import { getPayloadInstance } from '../../../../../lib/api/ctx';
import { jsonError, jsonOk, optionsCorsResponse } from '../../../../../lib/api/envelope';
import { enforceRateLimit, RATE_RULES } from '../../../../../lib/api/rateLimit';
import {
  formatStoredPrice,
  maskPhone,
  NO_STORE_HEADER,
  paymentMethodLabel,
  statusLabel,
  toVietnamIso,
} from '../../../../../lib/api/serialize';

export const dynamic = 'force-dynamic';

function notFound(): Response {
  return jsonError('BOOKING_NOT_FOUND', undefined, { headers: NO_STORE_HEADER });
}

export async function GET(req: Request, ctx: { params: Promise<{ code: string }> }): Promise<Response> {
  const { code } = await ctx.params;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limited = enforceRateLimit(
    `booking-lookup:${ip}`,
    RATE_RULES.bookingLookup[0],
    RATE_RULES.bookingLookup[1],
  );
  if (limited) {
    limited.headers.set('Cache-Control', 'private, no-store');
    return limited;
  }

  const url = new URL(req.url);
  const token = url.searchParams.get('t');
  const phoneLast4 = url.searchParams.get('phoneLast4');

  if (!code || (!token && !phoneLast4)) return notFound();

  try {
    const payload = await getPayloadInstance();
    const res = await payload.find({
      collection: 'bookings',
      limit: 1,
      depth: 1,
      where: { bookingCode: { equals: code } },
      overrideAccess: true,
    });
    const booking = res.docs[0];
    if (!booking) return notFound();

    const authOk = token
      ? verifyLookupToken(code, token, getLookupSecret())
      : checkPhoneLast4(booking.customerPhone ?? '', phoneLast4 ?? '');
    if (!authOk) return notFound();

    const routeRel = booking.route;
    const route =
      routeRel && typeof routeRel === 'object' && 'slug' in routeRel
        ? { slug: routeRel.slug, name: routeRel.name }
        : null;

    const pickup = booking.pickupDatetime ? toVietnamIso(new Date(booking.pickupDatetime)) : null;

    const data = {
      bookingCode: booking.bookingCode ?? code,
      customerName: booking.customerName,
      customerPhoneMasked: maskPhone(booking.customerPhone ?? ''),
      route,
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      pickupDateTime: pickup,
      rideType: booking.rideType ?? null,
      vehicleType: booking.vehicleType,
      passengerCount: booking.passengerCount ?? 1,
      priceType: booking.priceType ?? null,
      estimatedPrice: booking.estimatedPrice ?? null,
      estimatedPriceFormatted: formatStoredPrice(
        booking.priceType,
        booking.estimatedPrice,
        booking.estimatedPriceMax,
      ),
      paymentMethod: booking.paymentMethod ?? null,
      paymentMethodLabel: paymentMethodLabel(booking.paymentMethod),
      status: booking.status,
      statusLabel: statusLabel(booking.status),
    };

    return jsonOk(data, {
      message: 'Tra cứu đơn đặt xe thành công',
      headers: NO_STORE_HEADER,
    });
  } catch (err) {
    console.error('[bookings/lookup]', err);
    return jsonError('INTERNAL_ERROR', undefined, { headers: NO_STORE_HEADER });
  }
}

export async function OPTIONS() {
  return optionsCorsResponse();
}
