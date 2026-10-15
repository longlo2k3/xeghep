import { getPayloadInstance } from '../../../../../lib/api/ctx';
import { jsonError, jsonOk } from '../../../../../lib/api/envelope';
import { serializeCompanySettings } from '../../../../../lib/settings/company';
import { settingsCacheHeaders } from '../../../../../lib/settings/serialize';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const payload = await getPayloadInstance();
    const doc = await payload.findGlobal({ slug: 'company_settings', overrideAccess: true });
    return jsonOk(serializeCompanySettings(doc as Record<string, any>), {
      message: 'Lấy cấu hình công ty thành công',
      headers: settingsCacheHeaders('company'),
    });
  } catch (err) {
    console.error('[settings/company]', err);
    return jsonError('INTERNAL_ERROR');
  }
}
