import { loadEnv } from "payload/node";

import { slugify } from "../lib/seo/slugify";

(process.env as Record<string, string | undefined>).NODE_ENV = "development";
loadEnv();

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config");

/**
 * Seed collection `airport_pricing` — 12 quận nội thành Hà Nội (spec 4.2.8 / T048).
 * Giá copy từ `TestSEO/src/data/airport-pricing.ts`. Chạy: `npm run seed:airport`.
 * Idempotent: upsert theo slug. FR-D06 (cảnh báo khứ hồi) chạy qua hook afterRead.
 */

type VehiclePrice = { sedan5Seats: number; suv7Seats: number; van16Seats: number };
type AirportRow = {
  district: string;
  fromHanoiToAirport: VehiclePrice;
  fromAirportToHanoi: VehiclePrice;
  roundTrip: VehiclePrice;
};

export const SEED_AIRPORT_PRICING: AirportRow[] = [
  {
    district: "Quận Cầu Giấy",
    fromHanoiToAirport: { sedan5Seats: 190000, suv7Seats: 230000, van16Seats: 450000 },
    fromAirportToHanoi: { sedan5Seats: 240000, suv7Seats: 280000, van16Seats: 500000 },
    roundTrip: { sedan5Seats: 390000, suv7Seats: 480000, van16Seats: 850000 },
  },
  {
    district: "Quận Ba Đình",
    fromHanoiToAirport: { sedan5Seats: 190000, suv7Seats: 230000, van16Seats: 450000 },
    fromAirportToHanoi: { sedan5Seats: 240000, suv7Seats: 280000, van16Seats: 500000 },
    roundTrip: { sedan5Seats: 390000, suv7Seats: 480000, van16Seats: 850000 },
  },
  {
    district: "Quận Tây Hồ",
    fromHanoiToAirport: { sedan5Seats: 180000, suv7Seats: 220000, van16Seats: 430000 },
    fromAirportToHanoi: { sedan5Seats: 230000, suv7Seats: 270000, van16Seats: 480000 },
    roundTrip: { sedan5Seats: 380000, suv7Seats: 460000, van16Seats: 800000 },
  },
  {
    district: "Quận Đống Đa",
    fromHanoiToAirport: { sedan5Seats: 200000, suv7Seats: 240000, van16Seats: 470000 },
    fromAirportToHanoi: { sedan5Seats: 250000, suv7Seats: 290000, van16Seats: 520000 },
    roundTrip: { sedan5Seats: 410000, suv7Seats: 500000, van16Seats: 900000 },
  },
  {
    district: "Quận Hoàn Kiếm",
    fromHanoiToAirport: { sedan5Seats: 200000, suv7Seats: 240000, van16Seats: 470000 },
    fromAirportToHanoi: { sedan5Seats: 250000, suv7Seats: 290000, van16Seats: 520000 },
    roundTrip: { sedan5Seats: 410000, suv7Seats: 500000, van16Seats: 900000 },
  },
  {
    district: "Quận Hai Bà Trưng",
    fromHanoiToAirport: { sedan5Seats: 210000, suv7Seats: 250000, van16Seats: 480000 },
    fromAirportToHanoi: { sedan5Seats: 260000, suv7Seats: 300000, van16Seats: 530000 },
    roundTrip: { sedan5Seats: 430000, suv7Seats: 520000, van16Seats: 920000 },
  },
  {
    district: "Quận Thanh Xuân",
    fromHanoiToAirport: { sedan5Seats: 210000, suv7Seats: 250000, van16Seats: 480000 },
    fromAirportToHanoi: { sedan5Seats: 260000, suv7Seats: 300000, van16Seats: 530000 },
    roundTrip: { sedan5Seats: 430000, suv7Seats: 520000, van16Seats: 920000 },
  },
  {
    district: "Quận Nam Từ Liêm",
    fromHanoiToAirport: { sedan5Seats: 200000, suv7Seats: 240000, van16Seats: 470000 },
    fromAirportToHanoi: { sedan5Seats: 250000, suv7Seats: 290000, van16Seats: 520000 },
    roundTrip: { sedan5Seats: 410000, suv7Seats: 500000, van16Seats: 900000 },
  },
  {
    district: "Quận Bắc Từ Liêm",
    fromHanoiToAirport: { sedan5Seats: 190000, suv7Seats: 230000, van16Seats: 450000 },
    fromAirportToHanoi: { sedan5Seats: 240000, suv7Seats: 280000, van16Seats: 500000 },
    roundTrip: { sedan5Seats: 390000, suv7Seats: 480000, van16Seats: 850000 },
  },
  {
    district: "Quận Hà Đông",
    fromHanoiToAirport: { sedan5Seats: 230000, suv7Seats: 270000, van16Seats: 520000 },
    fromAirportToHanoi: { sedan5Seats: 280000, suv7Seats: 330000, van16Seats: 580000 },
    roundTrip: { sedan5Seats: 470000, suv7Seats: 560000, van16Seats: 1000000 },
  },
  {
    district: "Quận Hoàng Mai",
    fromHanoiToAirport: { sedan5Seats: 220000, suv7Seats: 260000, van16Seats: 500000 },
    fromAirportToHanoi: { sedan5Seats: 270000, suv7Seats: 320000, van16Seats: 560000 },
    roundTrip: { sedan5Seats: 450000, suv7Seats: 540000, van16Seats: 960000 },
  },
  {
    district: "Quận Long Biên",
    fromHanoiToAirport: { sedan5Seats: 200000, suv7Seats: 240000, van16Seats: 470000 },
    fromAirportToHanoi: { sedan5Seats: 250000, suv7Seats: 290000, van16Seats: 520000 },
    roundTrip: { sedan5Seats: 410000, suv7Seats: 500000, van16Seats: 900000 },
  },
];

const invokedAsScript = (process.argv[1] ?? "").replace(/\\/g, "/").endsWith("/seedAirport.ts");

if (invokedAsScript) {
  const payload = await getPayload({ config });
  let created = 0;
  let updated = 0;

  for (const [index, row] of SEED_AIRPORT_PRICING.entries()) {
    const slug = slugify(row.district);
    const data = {
      slug,
      district: row.district,
      fromHanoiToAirport: row.fromHanoiToAirport,
      fromAirportToHanoi: row.fromAirportToHanoi,
      roundTrip: row.roundTrip,
      isActive: true,
      sortOrder: index + 1,
    };

    const existing = await payload.find({
      collection: "airport_pricing",
      limit: 1,
      where: { slug: { equals: slug } },
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      await payload.update({
        id: existing.docs[0].id,
        collection: "airport_pricing",
        data,
        overrideAccess: true,
      });
      updated += 1;
    } else {
      await payload.create({ collection: "airport_pricing", data, overrideAccess: true });
      created += 1;
    }
  }

  const verify = await payload.find({
    collection: "airport_pricing",
    limit: 1,
    where: { slug: { exists: true } },
    overrideAccess: true,
  });
  if (verify.totalDocs !== SEED_AIRPORT_PRICING.length) {
    throw new Error(
      `Lệch số bản ghi airport_pricing: ${verify.totalDocs} ≠ ${SEED_AIRPORT_PRICING.length}.`,
    );
  }

  payload.logger.info(
    `Seed airport_pricing: ${created} tạo mới, ${updated} cập nhật, ${verify.totalDocs} quận.`,
  );
  await payload.destroy();
  process.exit(0);
}
