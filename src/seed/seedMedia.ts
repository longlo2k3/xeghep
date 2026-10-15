import fs from "node:fs";
import path from "node:path";

import type { Payload } from "payload";

/**
 * Seed collection `media` từ ảnh có sẵn trong `TestSEO/public/` (Phụ lục B.1/B.3.5).
 * Chạy: `npm run seed:media`. File được copy vào `backend/media/` qua upload của
 * Payload (ghi đúng tên nguồn, không đẻ bản sao `-1`); alt bắt buộc (spec 4.2.6).
 */

/** Alt bắt buộc cho từng ảnh (stem = tên file không đuôi). */
export const MEDIA_ALT_BY_STEM: Record<string, string> = {
  BacGiang: "Xe ghép Hải Phòng Bắc Giang",
  BacNinh: "Xe ghép Hải Phòng Bắc Ninh",
  HaLong: "Xe ghép Hải Phòng Hạ Long",
  HaNoi: "Xe ghép Hà Nội",
  HaiPhong: "Xe ghép Hải Phòng Hà Nội Nội Bài",
  MongCai: "Xe ghép Hải Phòng Móng Cái",
  NoiBai: "Xe ghép Hải Phòng Nội Bài",
  banner: "Xe ghép liên tỉnh",
  banner2: "Xe ghép liên tỉnh",
  letan: "Lái xe nghiệm thu",
  photo01: "Bảng giá xe ghép liên tỉnh mới nhất 2026",
  photo02: "Kinh nghiệm đặt xe ghép liên tỉnh tiết kiệm",
  photo03: "Đón trả tận nhà trên mọi tuyến xe ghép liên tỉnh",
  photo04: "Đặt xe ghép liên tỉnh 24/7 qua tổng đài",
  tongdai: "Tổng đài đặt xe",
};

/** Thư mục ảnh nguồn của frontend (override qua env khi cần). */
const SOURCE_DIR =
  process.env.SEED_IMAGE_SOURCE_DIR || "C:/Users/LongVi/OneDrive/Desktop/TestSEO/public";

const MIME_BY_EXT: Record<string, string> = {
  ".avif": "image/avif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/** Ưu tiên .webp (LCP/SEO), fallback định dạng còn lại (vd photo0x chỉ có .avif). */
const EXT_PREFERENCE = [".webp", ".jpg", ".jpeg", ".png", ".avif"];

const mediaIdByFilename = new Map<string, number>();

/** Tra media id (string) theo filename đã seed trong phiên chạy hiện tại. */
export function getMediaId(filename: string): string | undefined {
  const base = path.basename(filename);
  const stem = base.replace(/\.[^.]+$/, "");
  const id = mediaIdByFilename.get(base) ?? mediaIdByFilename.get(stem);
  return id == null ? undefined : String(id);
}

function pickSourceFile(stem: string): string | null {
  for (const ext of EXT_PREFERENCE) {
    const candidate = path.join(SOURCE_DIR, `${stem}${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export type SeedMediaStats = { copied: number; created: number; total: number; updated: number };

/** Upsert media doc theo filename (đã có → cập nhật alt; thiếu → copy file + tạo mới). */
export async function runSeedMedia(payload: Payload): Promise<SeedMediaStats> {
  let copied = 0;
  let created = 0;
  let updated = 0;

  for (const [stem, alt] of Object.entries(MEDIA_ALT_BY_STEM)) {
    const sourcePath = pickSourceFile(stem);
    if (!sourcePath) {
      payload.logger.warn(`Thiếu ảnh nguồn "${stem}" trong ${SOURCE_DIR} — bỏ qua.`);
      continue;
    }
    const filename = path.basename(sourcePath);

    const existing = await payload.find({
      collection: "media",
      limit: 1,
      where: {
        or: [
          { filename: { equals: filename } },
          { filename: { like: `${stem}%` } },
        ],
      },
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      const doc = existing.docs[0];
      if (doc.alt !== alt) {
        const next = await payload.update({
          id: doc.id,
          collection: "media",
          data: { alt },
          overrideAccess: true,
        });
        mediaIdByFilename.set(filename, next.id);
        mediaIdByFilename.set(stem, next.id);
        if (next.filename) mediaIdByFilename.set(next.filename, next.id);
        updated += 1;
      } else {
        mediaIdByFilename.set(filename, doc.id);
        mediaIdByFilename.set(stem, doc.id);
        if (doc.filename) mediaIdByFilename.set(doc.filename, doc.id);
      }
      continue;
    }

    const data = fs.readFileSync(sourcePath);
    const createdDoc = await payload.create({
      collection: "media",
      data: { alt },
      file: {
        data,
        mimetype: MIME_BY_EXT[path.extname(filename).toLowerCase()] || "application/octet-stream",
        name: filename,
        size: data.length,
      },
      overrideAccess: true,
    });
    mediaIdByFilename.set(filename, createdDoc.id);
    mediaIdByFilename.set(stem, createdDoc.id);
    if (createdDoc.filename) mediaIdByFilename.set(createdDoc.filename, createdDoc.id);
    created += 1;
    copied += 1;
  }

  return { copied, created, total: mediaIdByFilename.size, updated };
}

const invokedAsScript = (process.argv[1] ?? "").replace(/\\/g, "/").endsWith("/seedMedia.ts");

if (invokedAsScript) {
  const { loadEnv } = await import("payload/node");
  (process.env as Record<string, string | undefined>).NODE_ENV = "development";
  loadEnv();

  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");

  const payload = await getPayload({ config });
  const stats = await runSeedMedia(payload);
  payload.logger.info(
    `Seed media: ${stats.created} tạo mới, ${stats.updated} cập nhật alt, ${stats.total} bản ghi (${stats.copied} file copy vào media/).`,
  );
  await payload.destroy();
  process.exit(0);
}
