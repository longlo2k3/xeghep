import { loadEnv } from "payload/node";

(process.env as Record<string, string | undefined>).NODE_ENV = "development";
loadEnv();

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config");
const { SEED_PRICE_CHECKS, SEED_ROUTES } = await import("./data/routes");
const { assertPriceFrom } = await import("./parseVndText");
const { getMediaId, runSeedMedia } = await import("./seedMedia");

/**
 * Seed collection `routes` (9 tuyến) + `media` (ảnh TestSEO/public) — Phụ lục B.
 * Chạy: `npm run seed:routes`. Idempotent: chạy lại = update theo slug.
 */

const payload = await getPayload({ config });

// 1) priceFrom "cũ" phải khớp tierShare1.min — ném lỗi loud (B.2)
for (const check of SEED_PRICE_CHECKS) {
  assertPriceFrom(check);
}

// 2) media trước để resolve relationship thumbnail/slides
const mediaStats = await runSeedMedia(payload);
payload.logger.info(
  `Seed media: ${mediaStats.created} tạo mới, ${mediaStats.updated} cập nhật alt, ${mediaStats.total} bản ghi (${mediaStats.copied} file copy vào media/).`,
);

function resolveMediaId(filename: string | null | undefined, slug: string): number | undefined {
  if (!filename) return undefined;
  const id = getMediaId(filename);
  if (id == null) {
    payload.logger.warn(`Thiếu media "${filename}" cho tuyến ${slug} — bỏ qua quan hệ.`);
    return undefined;
  }
  return Number(id);
}

function toRouteData(route: (typeof SEED_ROUTES)[number]) {
  const thumbnail = resolveMediaId(route.thumbnailFilename, route.slug);
  const slides = route.slides.flatMap((slide) => {
    const image = resolveMediaId(slide.filename, route.slug);
    if (image == null) return [];
    return [{ image, badge: slide.badge, caption: slide.caption, alt: slide.alt }];
  });

  return {
    slug: route.slug,
    name: route.name,
    origin: route.origin,
    destination: route.destination,
    distance: route.distance,
    duration: route.duration,
    description: route.description,
    status: route.status,
    sortOrder: route.sortOrder,
    tierShare1: route.tierShare1 ?? undefined,
    tierShare2: route.tierShare2 ?? undefined,
    tierCharter45: route.tierCharter45 ?? undefined,
    tierCharter7: route.tierCharter7 ?? undefined,
    pricingDetails: route.pricingDetails,
    pickups: route.pickups.map((text) => ({ text })),
    dropoffs: route.dropoffs.map((text) => ({ text })),
    originAliases: route.originAliases.map((text) => ({ text })),
    destinationAliases: route.destinationAliases.map((text) => ({ text })),
    regions: route.regions,
    thumbnail,
    slides,
    faqs: route.faqs,
    isBannerTop: route.isBannerTop,
    ...(route.bannerLabel ? { bannerLabel: route.bannerLabel } : {}),
  };
}

// 3) upsert theo slug
let created = 0;
let updated = 0;

for (const route of SEED_ROUTES) {
  const data = toRouteData(route);
  const existing = await payload.find({
    collection: "routes",
    limit: 1,
    where: { slug: { equals: route.slug } },
    overrideAccess: true,
  });

  if (existing.docs.length > 0) {
    await payload.update({
      id: existing.docs[0].id,
      collection: "routes",
      data,
      overrideAccess: true,
    });
    updated += 1;
  } else {
    await payload.create({ collection: "routes", data, overrideAccess: true });
    created += 1;
  }
}

payload.logger.info(`Seed routes: ${created} tạo mới, ${updated} cập nhật.`);

// 4) đối soát priceFrom (DB) vs tierShare1.min
const rows: { ok: boolean; priceFrom: number | null; slug: string; tierShare1Min: number | null }[] = [];

for (const route of SEED_ROUTES) {
  const result = await payload.find({
    collection: "routes",
    depth: 0,
    limit: 1,
    where: { slug: { equals: route.slug } },
    overrideAccess: true,
  });
  const doc = result.docs[0];
  const priceFrom = doc?.priceFrom ?? null;
  const tierShare1Min = doc?.tierShare1?.min ?? null;
  const ok = priceFrom === tierShare1Min;
  rows.push({ ok, priceFrom, slug: route.slug, tierShare1Min });
  if (!ok) {
    throw new Error(`Lệch priceFrom sau seed ở ${route.slug}: ${priceFrom} vs ${tierShare1Min}`);
  }
}

console.table(rows);
payload.logger.info(`Đối soát priceFrom: ${rows.length}/${rows.length} tuyến khớp.`);

await payload.destroy();
process.exit(0);
