import { getPayloadInstance } from '../../../../../lib/api/ctx';
import { jsonError, jsonOk } from '../../../../../lib/api/envelope';
import { PUBLIC_CACHE_HEADERS } from '../../../../../lib/api/serialize';
import { resolvePageSlug, serializePage, type PageDoc } from '../serialize';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await ctx.params;
  const url = new URL(req.url);
  const target = resolvePageSlug({ slug, path: url.searchParams.get('path') });

  // Contract không có mã lỗi riêng cho pages → dùng ROUTE_NOT_FOUND 404 (giống routes).
  if (!target) {
    return jsonError('ROUTE_NOT_FOUND', undefined, { headers: PUBLIC_CACHE_HEADERS });
  }

  try {
    const payload = await getPayloadInstance();
    const res = await payload.find({
      collection: 'pages',
      limit: 1,
      depth: 1,
      where: { slug: { equals: target }, status: { equals: 'published' } },
      overrideAccess: true,
    });
    const page = res.docs[0];
    if (!page) {
      return jsonError('ROUTE_NOT_FOUND', undefined, { headers: PUBLIC_CACHE_HEADERS });
    }

    return jsonOk(serializePage(page as unknown as PageDoc), {
      message: 'OK',
      headers: PUBLIC_CACHE_HEADERS,
    });
  } catch (err) {
    console.error('[pages/detail]', err);
    return jsonError('INTERNAL_ERROR');
  }
}
