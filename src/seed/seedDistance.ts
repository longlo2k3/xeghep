import { loadEnv } from "payload/node";

(process.env as Record<string, string | undefined>).NODE_ENV = "development";
loadEnv();

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config");

/**
 * Seed collection `distance_rates` — 4 dải km (spec 4.2.9 / T048).
 * Đơn giá copy từ `TestSEO/src/data/long-distance-pricing.ts`.
 * Chạy: `npm run seed:distance`. Idempotent: upsert theo label.
 * FR-D07 (không chồng lấn/không hở) chạy qua hook beforeChange của collection.
 */

type DistanceRow = {
  label: string;
  minKm: number;
  maxKm: number | null;
  sedan5Seats: number;
  suv7Seats: number;
  van16Seats: number;
};

export const SEED_DISTANCE_RATES: DistanceRow[] = [
  {
    label: "Dưới 30 km (tối thiểu)",
    minKm: 0,
    maxKm: 30,
    sedan5Seats: 11000,
    suv7Seats: 13000,
    van16Seats: 18000,
  },
  {
    label: "Từ 31 km - 100 km",
    minKm: 31,
    maxKm: 100,
    sedan5Seats: 9500,
    suv7Seats: 11500,
    van16Seats: 16000,
  },
  {
    label: "Từ 101 km - 200 km",
    minKm: 101,
    maxKm: 200,
    sedan5Seats: 8500,
    suv7Seats: 10500,
    van16Seats: 14500,
  },
  {
    label: "Trên 200 km",
    minKm: 201,
    maxKm: null,
    sedan5Seats: 8000,
    suv7Seats: 9500,
    van16Seats: 13500,
  },
];

const invokedAsScript = (process.argv[1] ?? "").replace(/\\/g, "/").endsWith("/seedDistance.ts");

if (invokedAsScript) {
  const payload = await getPayload({ config });
  let created = 0;
  let updated = 0;

  // Tạo theo thứ tự minKm tăng dần để hook FR-D07 thấy dải liên tục (không hở).
  for (const [index, row] of SEED_DISTANCE_RATES.entries()) {
    const data = {
      label: row.label,
      minKm: row.minKm,
      ...(row.maxKm != null ? { maxKm: row.maxKm } : {}),
      sedan5Seats: row.sedan5Seats,
      suv7Seats: row.suv7Seats,
      van16Seats: row.van16Seats,
      sortOrder: index + 1,
    };

    const existing = await payload.find({
      collection: "distance_rates",
      limit: 1,
      where: { label: { equals: row.label } },
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      await payload.update({
        id: existing.docs[0].id,
        collection: "distance_rates",
        data,
        overrideAccess: true,
      });
      updated += 1;
    } else {
      await payload.create({ collection: "distance_rates", data, overrideAccess: true });
      created += 1;
    }
  }

  const verify = await payload.find({
    collection: "distance_rates",
    limit: 20,
    sort: "minKm",
    overrideAccess: true,
  });
  if (verify.totalDocs !== SEED_DISTANCE_RATES.length) {
    throw new Error(
      `Lệch số bản ghi distance_rates: ${verify.totalDocs} ≠ ${SEED_DISTANCE_RATES.length}.`,
    );
  }

  payload.logger.info(
    `Seed distance_rates: ${created} tạo mới, ${updated} cập nhật, ${verify.totalDocs} dải.`,
  );
  await payload.destroy();
  process.exit(0);
}
