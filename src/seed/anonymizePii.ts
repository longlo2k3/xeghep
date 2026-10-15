import { loadEnv } from "payload/node";

loadEnv();

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config");

/**
 * Ẩn danh dữ liệu cá nhân của đơn đặt xe cũ — FR-B08 (spec §2.3):
 * đơn hàng cũ hơn `ANONYMIZE_MONTHS` (mặc định 24 tháng) bị ẩn:
 * - `customerPhone`  → mask, giữ 4 số cuối (`******8293`)
 * - `customerName`   → `Khách hàng ****`
 * - `customerEmail`  → redacted (nếu collection có trường này)
 * - `note` / `dispatcherNote` → chuỗi giống số điện thoại bị thay bằng `***`
 * - `sourceIpHash`   → GIỮ NGUYÊN (đã hash, không phải PII dạng thô)
 *
 * Idempotent: chạy lại lần 2 không còn gì để sửa.
 * Chạy: `npm run anonymize:pii` · xem trước: `npm run anonymize:pii -- --dry-run`
 * Env: `ANONYMIZE_MONTHS` (mặc định 24).
 */

const MONTHS = Number.parseInt(process.env.ANONYMIZE_MONTHS ?? "24", 10);
const DRY_RUN = process.argv.includes("--dry-run");
const PAGE_SIZE = 100;

if (!Number.isFinite(MONTHS) || MONTHS <= 0) {
  console.error(`ANONYMIZE_MONTHS không hợp lệ: ${process.env.ANONYMIZE_MONTHS}`);
  process.exit(1);
}

const ANONYMIZED_NAME_PREFIX = "Khách hàng";

/** Mask SĐT: giữ 4 số cuối, phần còn lại thành `*`. Trả null nếu đã ẩn danh. */
export function maskPhone(phone: string | null | undefined): string | null {
  if (typeof phone !== "string") return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 5) return null; // không còn số thật để ẩn
  return `${"*".repeat(digits.length - 4)}${digits.slice(-4)}`;
}

/** Tên khách → `Khách hàng ****`. Trả null nếu đã ẩn danh. */
export function anonymizeName(name: string | null | undefined): string | null {
  if (typeof name !== "string" || name.trim().length === 0) return null;
  if (name.startsWith(ANONYMIZED_NAME_PREFIX)) return null;
  return `${ANONYMIZED_NAME_PREFIX} ****`;
}

/** Email → redacted. Trả null nếu không còn email thật. */
export function anonymizeEmail(email: string | null | undefined): string | null {
  if (typeof email !== "string" || !email.includes("@")) return null;
  if (email.endsWith("@redacted.invalid")) return null;
  return "redacted@redacted.invalid";
}

/** Thay chuỗi giống SĐT (≥9 chữ số, có thể có +/-/. và khoảng trắng) trong ghi chú. */
const PHONE_LIKE = /\+?\d(?:[ \-.]?\d){8,}/g;

export function scrubNotes(text: string | null | undefined): string | null {
  if (typeof text !== "string" || text.length === 0) return null;
  const next = text.replace(PHONE_LIKE, "***");
  return next === text ? null : next;
}

type BookingPII = {
  id: number | string;
  customerEmail?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  dispatcherNote?: string | null;
  note?: string | null;
};

/** Tính dữ liệu PII cần ghi đè cho 1 đơn. Trả null nếu không có gì để sửa. */
export function buildAnonymizedData(doc: BookingPII): Record<string, string> | null {
  const data: Record<string, string> = {};

  const phone = maskPhone(doc.customerPhone);
  if (phone) data.customerPhone = phone;

  const name = anonymizeName(doc.customerName);
  if (name) data.customerName = name;

  const email = anonymizeEmail(doc.customerEmail);
  if (email) data.customerEmail = email;

  const note = scrubNotes(doc.note);
  if (note) data.note = note;

  const dispatcherNote = scrubNotes(doc.dispatcherNote);
  if (dispatcherNote) data.dispatcherNote = dispatcherNote;

  return Object.keys(data).length > 0 ? data : null;
}

const invokedAsScript = (process.argv[1] ?? "").replace(/\\/g, "/").endsWith("/anonymizePii.ts");

if (invokedAsScript) {
  const payload = await getPayload({ config });

  const cutoff = new Date();
  cutoff.setUTCMonth(cutoff.getUTCMonth() - MONTHS);

  let eligible = 0;
  let toUpdate = 0;
  let updated = 0;
  let page = 1;

  // `createdAt` được payload-types khai báo là chuỗi → cast where cho operator date.
  const where = { createdAt: { less_than: cutoff.toISOString() } } as any;

  payload.logger.info(
    `Ẩn danh PII: đơn trước ${cutoff.toISOString()} (ANONYMIZE_MONTHS=${MONTHS})${DRY_RUN ? " — DRY RUN (không ghi)" : ""}.`,
  );

  for (;;) {
    const result = await payload.find({
      collection: "bookings",
      depth: 0,
      limit: PAGE_SIZE,
      overrideAccess: true,
      page,
      sort: "createdAt",
      where,
    });

    for (const doc of result.docs as BookingPII[]) {
      eligible += 1;
      const data = buildAnonymizedData(doc);
      if (!data) continue;
      toUpdate += 1;
      if (DRY_RUN) continue;
      await payload.update({
        id: doc.id,
        collection: "bookings",
        data,
        overrideAccess: true,
      });
      updated += 1;
    }

    if (result.docs.length < PAGE_SIZE || page >= (result.totalPages ?? 1)) break;
    page += 1;
  }

  payload.logger.info(
    DRY_RUN
      ? `DRY RUN: ${eligible} đơn đủ điều kiện, ${toUpdate} đơn cần ẩn danh (chưa ghi).`
      : `Hoàn tất: ${eligible} đơn đủ điều kiện, ${toUpdate} đơn cần ẩn danh, ${updated} đơn đã ghi.`,
  );

  await payload.destroy();
  process.exit(0);
}
