import { getPayloadInstance } from '../../../../lib/api/ctx';
import { jsonError, jsonOk } from '../../../../lib/api/envelope';

export const dynamic = 'force-dynamic';

const REDIRECTS_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=30',
  'Cache-Tag': 'redirects',
} as const;

export async function GET(): Promise<Response> {
  try {
    const payload = await getPayloadInstance();
    const res = await payload.find({
      collection: 'redirects',
      where: { isActive: { equals: true } },
      limit: 2000,
      sort: 'createdAt',
      depth: 0,
      overrideAccess: true,
    });

    const data = res.docs.map((row: any) => ({
      from: row.fromUrl ?? '',
      to: row.toUrl ?? '',
      statusCode: Number(row.statusCode ?? 301),
    }));

    return jsonOk(data, {
      message: 'Lấy danh sách chuyển hướng thành công',
      headers: REDIRECTS_CACHE_HEADERS,
    });
  } catch (err) {
    console.error('[redirects]', err);
    return jsonError('INTERNAL_ERROR');
  }
}
