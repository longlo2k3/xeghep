import { getPayloadInstance } from '../../../../../lib/api/ctx';
import { jsonError, jsonOk } from '../../../../../lib/api/envelope';
import type { Article, Route } from '../../../../../payload-types';
import {
  ARTICLES_CACHE_HEADERS,
  serializeArticleDetail,
  serializeRelatedRoute,
} from '../serialize';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/articles/:slug — 404 khi bài chưa đăng (draft) hoặc không tồn tại
 * (thông báo trùng — contract §0 ROUTE_NOT_FOUND).
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await ctx.params;

  try {
    const payload = await getPayloadInstance();
    const res = await payload.find({
      collection: 'articles',
      limit: 1,
      depth: 1,
      where: { slug: { equals: slug }, status: { equals: 'published' } },
      overrideAccess: true,
    });
    const article = res.docs[0] as unknown as Article | undefined;
    if (!article) {
      return jsonError('ROUTE_NOT_FOUND', undefined, { headers: ARTICLES_CACHE_HEADERS });
    }

    const related = article.relatedRoute;
    const relatedRoute =
      related && typeof related === 'object' && 'slug' in related
        ? serializeRelatedRoute(related as Route)
        : null;

    return jsonOk(serializeArticleDetail(article, relatedRoute), {
      message: 'Lấy chi tiết bài viết thành công',
      headers: ARTICLES_CACHE_HEADERS,
    });
  } catch (err) {
    console.error('[articles/detail]', err);
    return jsonError('INTERNAL_ERROR');
  }
}
