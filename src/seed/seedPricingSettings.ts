import { loadEnv } from "payload/node";

(process.env as Record<string, string | undefined>).NODE_ENV = "development";
loadEnv();

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config");

/**
 * Seed global `pricing_settings` — hằng số & chính sách giá (spec 4.2.11 / T048).
 * Nguồn: `TestSEO/src/data/long-distance-pricing.ts` + mặc định FR.
 * Chạy: `npm run seed:pricing`. Idempotent: update global.
 * `priceValidUntil` bắt buộc (SCH-1) — seed 31/12 của năm sau (D12).
 */

export function seedPriceValidUntilIso(now = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear() + 1, 11, 31)).toISOString();
}

export const SEED_PRICING_SETTINGS = {
  parcelFromPrice: 150000,
  parcelDeliveryText: "2–4 giờ",
  maxPassengersPerShareTrip: 3,
  minLeadTimeMinutes: 15,
  freeCancelMinutes: 30,
  returningCustomerDiscountPercent: 10,
  priceValidUntil: seedPriceValidUntilIso(),
  roundTripDiscountText:
    "Giảm 60% - 70% giá cước chiều về khi khách hàng đi khứ hồi trong ngày.",
  waitingTimeText:
    "Miễn phí 1 giờ chờ đầu tiên. Các giờ chờ tiếp theo tính 60.000đ/giờ (tối đa 3 giờ chờ ban ngày).",
  waitingFreeMinutes: 60,
  waitingFeePerHour: 60000,
  waitingMaxHours: 3,
  tollsNote:
    "Giá cước tính theo km chưa bao gồm phí cầu đường, cao tốc và vé phà (nếu có). Quý khách thanh toán trực tiếp theo hóa đơn BOT.",
  tollsNoteShort: "Giá chưa bao gồm phí cầu đường, cao tốc, vé phà.",
  overnightNote:
    "Khách có nhu cầu lưu đêm qua ngày vui lòng liên hệ tổng đài 0858.911.247 để nhận báo giá ưu đãi trọn gói gồm chi phí lưu đêm tài xế.",
  overnightPhone: "0858.911.247",
  holidayNote: "Giá có thể thay đổi dịp lễ, tết.",
};

const invokedAsScript = (process.argv[1] ?? "")
  .replace(/\\/g, "/")
  .endsWith("/seedPricingSettings.ts");

if (invokedAsScript) {
  const payload = await getPayload({ config });

  const doc = await payload.updateGlobal({
    slug: "pricing_settings",
    data: SEED_PRICING_SETTINGS,
    overrideAccess: true,
  });

  if (doc.parcelFromPrice !== SEED_PRICING_SETTINGS.parcelFromPrice) {
    throw new Error("Lệch parcelFromPrice sau seed pricing_settings.");
  }
  if (!doc.priceValidUntil) {
    throw new Error("Thiếu priceValidUntil sau seed pricing_settings (bắt buộc SCH-1).");
  }

  payload.logger.info(
    `Seed pricing_settings: parcelFrom=${doc.parcelFromPrice}, priceValidUntil=${String(doc.priceValidUntil).slice(0, 10)}.`,
  );
  await payload.destroy();
  process.exit(0);
}
