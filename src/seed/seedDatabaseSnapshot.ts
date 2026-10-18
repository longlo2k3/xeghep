import fs from "node:fs";
import path from "node:path";

import { loadEnv } from "payload/node";

import { PROJECT_ROOT, readSnapshot, type SnapshotDoc } from "./databaseSnapshot";

(process.env as Record<string, string | undefined>).NODE_ENV = "development";
process.env.PAYLOAD_DB_PUSH = "false";
loadEnv();

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config");
const payload = await getPayload({ config });
const snapshot = readSnapshot();

const mediaIds = new Map<number, number>();
const routeIds = new Map<number, number>();

const resolveMedia = (sourceId: number | null | undefined): number | null => {
  if (sourceId == null) return null;
  const id = mediaIds.get(sourceId);
  if (id == null) throw new Error(`Missing media mapping for source ID ${sourceId}`);
  return id;
};

const resolveRoute = (sourceId: number | null | undefined): number | null => {
  if (sourceId == null) return null;
  const id = routeIds.get(sourceId);
  if (id == null) throw new Error(`Missing route mapping for source ID ${sourceId}`);
  return id;
};

function withSeoMedia(data: Record<string, any>) {
  if (data.seo?.ogImage != null) data.seo.ogImage = resolveMedia(data.seo.ogImage);
  return data;
}

function clone(doc: SnapshotDoc) {
  return structuredClone(doc.data) as Record<string, any>;
}

async function assertContentTablesEmpty() {
  for (const collection of ["media", "routes", "pages", "articles", "airport_pricing", "distance_rates", "redirects"] as const) {
    const result = await payload.find({ collection, limit: 1, depth: 0, overrideAccess: true });
    if (result.totalDocs > 0) {
      throw new Error(`${collection} already has data. Snapshot seed only runs on an empty content DB.`);
    }
  }
}

try {
  await assertContentTablesEmpty();

  for (const item of snapshot.media) {
    const sourcePath = path.join(PROJECT_ROOT, item.source);
    const data = fs.readFileSync(sourcePath);
    const extension = path.extname(sourcePath).toLowerCase();
    const mimeType = ({ ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".avif": "image/avif" } as Record<string, string>)[extension];
    if (!mimeType) throw new Error(`Unsupported seed media: ${item.source}`);
    const created = await payload.create({
      collection: "media",
      data: { alt: item.alt, caption: item.caption ?? undefined },
      file: { data, name: path.basename(sourcePath), mimetype: mimeType, size: data.length },
      overrideAccess: true,
    });
    mediaIds.set(item.sourceId, created.id);
  }

  for (const item of snapshot.routes) {
    const data = withSeoMedia(clone(item));
    data.thumbnail = resolveMedia(data.thumbnail);
    data.slides = (data.slides ?? []).map((slide: Record<string, any>) => ({
      ...slide,
      image: resolveMedia(slide.image),
    }));
    delete data.relatedRoutes;
    const created = await payload.create({ collection: "routes", data: data as never, overrideAccess: true });
    routeIds.set(item.sourceId, created.id);
  }

  for (const item of snapshot.routes) {
    const related = item.data.relatedRoutes as number[] | undefined;
    if (related?.length) {
      await payload.update({
        collection: "routes",
        id: resolveRoute(item.sourceId)!,
        data: { relatedRoutes: related.map((id) => resolveRoute(id)!) },
        overrideAccess: true,
      });
    }
  }

  for (const item of snapshot.pages) {
    await payload.create({ collection: "pages", data: withSeoMedia(clone(item)) as never, overrideAccess: true });
  }
  for (const item of snapshot.articles) {
    const data = withSeoMedia(clone(item));
    data.featuredImage = resolveMedia(data.featuredImage);
    data.relatedRoute = resolveRoute(data.relatedRoute);
    await payload.create({ collection: "articles", data: data as never, overrideAccess: true });
  }
  for (const item of snapshot.airportPricing) {
    await payload.create({ collection: "airport_pricing", data: clone(item) as never, overrideAccess: true });
  }
  for (const item of [...snapshot.distanceRates].sort((a, b) => a.data.minKm - b.data.minKm)) {
    await payload.create({ collection: "distance_rates", data: clone(item) as never, overrideAccess: true });
  }
  for (const item of snapshot.redirects) {
    await payload.create({ collection: "redirects", data: clone(item) as never, overrideAccess: true });
  }

  const company = structuredClone(snapshot.companySettings);
  if (company.brandSeo) {
    company.brandSeo.logo = resolveMedia(company.brandSeo.logo);
    company.brandSeo.defaultOgImage = resolveMedia(company.brandSeo.defaultOgImage);
  }
  if (company.banner) company.banner.heroImage = resolveMedia(company.banner.heroImage);
  await payload.updateGlobal({ slug: "company_settings", data: company, overrideAccess: true });
  await payload.updateGlobal({ slug: "pricing_settings", data: snapshot.pricingSettings, overrideAccess: true });

  console.log(`Seeded DB snapshot: ${snapshot.media.length} media records, ${snapshot.routes.length} routes, ${snapshot.pages.length} pages, ${snapshot.articles.length} articles, ${snapshot.airportPricing.length} airport rows, ${snapshot.distanceRates.length} distance rates, ${snapshot.redirects.length} redirects, 2 settings globals.`);
  await payload.destroy();
  process.exit(0);
} catch (error) {
  console.error(error);
  await payload.destroy();
  process.exit(1);
}
