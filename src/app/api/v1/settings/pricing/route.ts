import { getPayloadInstance } from '../../../../../lib/api/ctx';
import { jsonError, jsonOk } from '../../../../../lib/api/envelope';
import { settingsCacheHeaders } from '../../../../../lib/settings/serialize';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const payload = await getPayloadInstance();
    const doc = await payload.findGlobal({ slug: 'pricing_settings', overrideAccess: true });
    return jsonOk(doc, {
      message: 'Lấy cấu hình giá thành công',
      headers: settingsCacheHeaders('pricing'),
    });
  } catch (err) {
    console.error('[settings/pricing]', err);
    return jsonError('INTERNAL_ERROR');
  }
}
