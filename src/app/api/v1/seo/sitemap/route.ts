import { getPayloadInstance } from '../../../../../lib/api/ctx';
import { jsonError, jsonOk } from '../../../../../lib/api/envelope';
import { PUBLIC_CACHE_HEADERS } from '../../../../../lib/api/serialize';
import { collectSitemapData } from '../../../../../lib/seo/sitemap';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const payload = await getPayloadInstance();
    const entries = await collectSitemapData(payload);
    return jsonOk(entries, { message: 'OK', headers: PUBLIC_CACHE_HEADERS });
  } catch (err) {
    console.error('[seo/sitemap]', err);
    return jsonError('INTERNAL_ERROR');
  }
}
