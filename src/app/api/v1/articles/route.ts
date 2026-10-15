import type { Where } from 'payload';
import { z } from 'zod';

import { getPayloadInstance } from '../../../../lib/api/ctx';
import { jsonError, jsonOk } from '../../../../lib/api/envelope';
import type { Article } from '../../../../payload-types';
import { ARTICLES_CACHE_HEADERS, serializeArticleCard } from './serialize';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: z.enum(['kinh-nghiem', 'tin-tuyen', 'khuyen-mai']).optional(),
  excludeSlug: z.string().trim().min(1).optional(),
});

export const dynamic = 'force-dynamic';

/** GET /api/v1/articles — chỉ bài published, phân trang, lọc theo danh mục (§3). */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    page: url.searchParams.get('page') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
    category: url.searchParams.get('category') ?? undefined,
    excludeSlug: url.searchParams.get('excludeSlug') ?? undefined,
  });
  if (!parsed.success) {
    return jsonError('VALIDATION_ERROR', undefined, {
      fields: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }
  const { page, limit, category, excludeSlug } = parsed.data;

  try {
    const payload = await getPayloadInstance();

    const where: Where = { status: { equals: 'published' } };
    if (category) where.category = { equals: category };
    if (excludeSlug) where.slug = { not_equals: excludeSlug };

    const res = await payload.find({
      collection: 'articles',
      page,
      limit,
      depth: 1,
      sort: '-publishedAt',
      where,
      overrideAccess: true,
    });

    return jsonOk(
      res.docs.map((doc) => serializeArticleCard(doc as unknown as Article)),
      {
        message: 'Lấy danh sách bài viết thành công',
        meta: {
          page: res.page ?? page,
          limit: res.limit ?? limit,
          totalDocs: res.totalDocs,
          totalPages: res.totalPages ?? 1,
        },
        headers: ARTICLES_CACHE_HEADERS,
      },
    );
  } catch (err) {
    console.error('[articles/list]', err);
    return jsonError('INTERNAL_ERROR');
  }
}
