import { getPayloadInstance } from '../../../../../lib/api/ctx';
import { jsonError, jsonOk } from '../../../../../lib/api/envelope';
import {
  serializeAirportPricing,
  settingsCacheHeaders,
  type AirportPricingDoc,
} from '../../../../../lib/settings/serialize';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const payload = await getPayloadInstance();
    const res = await payload.find({
      collection: 'airport_pricing',
      limit: 100,
      depth: 0,
      sort: 'sortOrder',
      where: { isActive: { equals: true } },
      overrideAccess: true,
    });

    const data = res.docs.map((doc) => serializeAirportPricing(doc as AirportPricingDoc));

    return jsonOk(data, {
      message: 'Lấy bảng giá sân bay thành công',
      meta: { totalDocs: res.totalDocs },
      headers: settingsCacheHeaders('pricing', 'airport-pricing'),
    });
  } catch (err) {
    console.error('[pricing/airport]', err);
    return jsonError('INTERNAL_ERROR');
  }
}
