import type { Where } from 'payload';
import { z } from 'zod';

import { getPayloadInstance } from '../../../../lib/api/ctx';
import { jsonError, jsonOk } from '../../../../lib/api/envelope';
import { serializeRouteCard, serializeRouteDetail, PUBLIC_CACHE_HEADERS } from '../../../../lib/api/serialize';

const REGION_VALUES = [
  'Hải Phòng',
  'Hà Nội',
  'Hạ Long',
  'Móng Cái',
  'Bắc Ninh – Bắc Giang',
] as const;

const querySchema = z.object({
  status: z.enum(['draft', 'active', 'inactive']).default('active'),
  isBannerTop: z.enum(['true', 'false']).optional(),
  region: z.string().trim().min(1).optional(),
  fields: z.enum(['card', 'slug', 'full']).default('card'),
});

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    status: url.searchParams.get('status') ?? 'active',
    isBannerTop: url.searchParams.get('isBannerTop') ?? undefined,
    region: url.searchParams.get('region') ?? undefined,
    fields: url.searchParams.get('fields') ?? 'card',
  });
  if (!parsed.success) {
    return jsonError('VALIDATION_ERROR', undefined, {
      fields: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }
  const { status, isBannerTop, region, fields } = parsed.data;

  try {
    const payload = await getPayloadInstance();

    const where: Where = { status: { equals: status } };
    if (isBannerTop !== undefined) where.isBannerTop = { equals: isBannerTop === 'true' };
    if (region !== undefined) where.regions = { equals: region };

    const res = await payload.find({
      collection: 'routes',
      limit: 100,
      depth: 2,
      sort: 'sortOrder',
      where,
      overrideAccess: true,
    });

    const allRes = await payload.find({
      collection: 'routes',
      limit: 100,
      depth: 0,
      overrideAccess: true,
    });

    const presentRegions = REGION_VALUES.filter((r) =>
      allRes.docs.some((d) => (d.regions ?? []).includes(r)),
    );

    const data =
      fields === 'slug'
        ? res.docs.map((d) => ({ slug: d.slug }))
        : res.docs.map((d) =>
            fields === 'full'
              ? serializeRouteDetail(d, { full: true })
              : serializeRouteCard(d),
          );

    return jsonOk(data, {
      message: 'Lấy danh sách tuyến xe thành công',
      meta: { totalDocs: res.totalDocs, regions: presentRegions },
      headers: PUBLIC_CACHE_HEADERS,
    });
  } catch (err) {
    console.error('[routes/list]', err);
    return jsonError('INTERNAL_ERROR');
  }
}
