import { getPayloadInstance } from '../../../../../lib/api/ctx';
import { jsonError, jsonOk } from '../../../../../lib/api/envelope';
import {
  serializeDistancePricing,
  settingsCacheHeaders,
  type DistanceRateDoc,
} from '../../../../../lib/settings/serialize';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const payload = await getPayloadInstance();
    const [ratesRes, settings] = await Promise.all([
      payload.find({
        collection: 'distance_rates',
        limit: 100,
        depth: 0,
        sort: 'minKm',
        overrideAccess: true,
      }),
      payload.findGlobal({ slug: 'pricing_settings', overrideAccess: true }),
    ]);

    const data = serializeDistancePricing(
      ratesRes.docs.map(
        (doc): DistanceRateDoc => ({
          label: doc.label,
          minKm: doc.minKm,
          maxKm: doc.maxKm ?? null,
          sedan5Seats: doc.sedan5Seats,
          suv7Seats: doc.suv7Seats,
          van16Seats: doc.van16Seats,
        }),
      ),
      settings,
    );

    return jsonOk(data, {
      message: 'Lấy bảng giá theo km thành công',
      meta: { totalDocs: ratesRes.totalDocs },
      headers: settingsCacheHeaders('pricing', 'distance-rates'),
    });
  } catch (err) {
    console.error('[pricing/distance]', err);
    return jsonError('INTERNAL_ERROR');
  }
}
