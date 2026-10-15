import { z } from 'zod';

import { getPayloadInstance } from '../../../../../lib/api/ctx';
import { jsonError, jsonOk } from '../../../../../lib/api/envelope';
import {
  PUBLIC_CACHE_HEADERS,
  serializeRouteCard,
  serializeRouteDetail,
  type RouteCard,
} from '../../../../../lib/api/serialize';
import type { Route } from '../../../../../payload-types';

const fieldsSchema = z.enum(['card', 'slug', 'full']).default('card');

export const dynamic = 'force-dynamic';

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }): Promise<Response> {
  const { slug } = await ctx.params;
  const url = new URL(req.url);
  const parsedFields = fieldsSchema.safeParse(url.searchParams.get('fields') ?? 'card');
  const fields = parsedFields.success ? parsedFields.data : 'card';

  try {
    const payload = await getPayloadInstance();
    const res = await payload.find({
      collection: 'routes',
      limit: 1,
      depth: 2,
      where: { slug: { equals: slug }, status: { equals: 'active' } },
      overrideAccess: true,
    });
    const route = res.docs[0];
    if (!route) {
      return jsonError('ROUTE_NOT_FOUND', undefined, { headers: PUBLIC_CACHE_HEADERS });
    }

    let related: Route[] = [];
    if (Array.isArray(route.relatedRoutes) && route.relatedRoutes.length > 0) {
      related = route.relatedRoutes.filter(
        (r): r is Route => r != null && typeof r === 'object' && 'slug' in r && r.status === 'active',
      );
    }
    if (related.length === 0) {
      const fallback = await payload.find({
        collection: 'routes',
        limit: 3,
        depth: 2,
        sort: 'sortOrder',
        where: { status: { equals: 'active' }, slug: { not_equals: route.slug } },
        overrideAccess: true,
      });
      related = fallback.docs;
    }
    const relatedCards: RouteCard[] = related.slice(0, 3).map((r) => serializeRouteCard(r));

    const pricingSettings = await payload.findGlobal({
      slug: 'pricing_settings',
      overrideAccess: true,
    });
    const detail = serializeRouteDetail(route, {
      full: fields === 'full',
      relatedRoutes: relatedCards,
      priceValidUntilFallback: pricingSettings.priceValidUntil ?? null,
    });

    return jsonOk(detail, {
      message: 'Lấy chi tiết tuyến xe thành công',
      headers: PUBLIC_CACHE_HEADERS,
    });
  } catch (err) {
    console.error('[routes/detail]', err);
    return jsonError('INTERNAL_ERROR');
  }
}
