import { loadEnv } from "payload/node";

import { normalizeRedirectUrl } from "../lib/seo/redirectRules";

(process.env as Record<string, string | undefined>).NODE_ENV = "development";
loadEnv();

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config");

/**
 * Seed collection `redirects` — 5 URL cũ trong `next.config.ts` của TestSEO
 * (AD-7 / T048). `source='seed'`, statusCode 301 (permanent: true).
 * Chạy: `npm run seed:redirects`. Idempotent: upsert theo fromUrl.
 */

type SeedRedirect = { fromUrl: string; toUrl: string; note: string };

export const SEED_REDIRECTS: SeedRedirect[] = [
  {
    fromUrl: "/dich-vu-xe-ghep",
    toUrl: "/tuyen-lien-tinh",
    note: "Seed từ next.config.ts cũ — trang dịch vụ gộp vào listing tuyến.",
  },
  {
    fromUrl: "/bang-gia",
    toUrl: "/tuyen-lien-tinh",
    note: "Seed từ next.config.ts cũ — trang bảng giá gộp vào listing tuyến.",
  },
  {
    fromUrl: "/taxi-dua-don-san-bay-noi-bai",
    toUrl: "/tuyen-lien-tinh/hai-phong-ha-noi-noi-bai",
    note: "Seed từ next.config.ts cũ — trang sân bay Nội Bài -> chi tiết tuyến.",
  },
  {
    fromUrl: "/taxi-duong-dai",
    toUrl: "/tuyen-lien-tinh",
    note: "Seed từ next.config.ts cũ — trang taxi đường dài gộp listing tuyến.",
  },
  {
    fromUrl: "/dang-ky-doi-tac",
    toUrl: "/lien-he",
    note: "Seed từ next.config.ts cũ — đăng ký đối tác chuyển trang liên hệ.",
  },
];

const invokedAsScript = (process.argv[1] ?? "").replace(/\\/g, "/").endsWith("/seedRedirects.ts");

if (invokedAsScript) {
  const payload = await getPayload({ config });
  let created = 0;
  let updated = 0;

  for (const row of SEED_REDIRECTS) {
    const fromUrl = normalizeRedirectUrl(row.fromUrl);
    const toUrl = normalizeRedirectUrl(row.toUrl);
    const data = {
      fromUrl,
      toUrl,
      statusCode: "301" as const,
      source: "seed" as const,
      isActive: true,
      note: row.note,
    };

    const existing = await payload.find({
      collection: "redirects",
      limit: 1,
      where: { fromUrl: { equals: fromUrl } },
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      await payload.update({
        id: existing.docs[0].id,
        collection: "redirects",
        data,
        overrideAccess: true,
      });
      updated += 1;
    } else {
      await payload.create({ collection: "redirects", data, overrideAccess: true });
      created += 1;
    }
  }

  const verify = await payload.find({
    collection: "redirects",
    limit: 20,
    where: { source: { equals: "seed" } },
    overrideAccess: true,
  });
  if (verify.totalDocs !== SEED_REDIRECTS.length) {
    throw new Error(`Lệch số redirect source=seed: ${verify.totalDocs} ≠ ${SEED_REDIRECTS.length}.`);
  }

  payload.logger.info(
    `Seed redirects: ${created} tạo mới, ${updated} cập nhật, ${verify.totalDocs} bản ghi source=seed.`,
  );
  await payload.destroy();
  process.exit(0);
}
