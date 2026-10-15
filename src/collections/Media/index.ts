import type { CollectionConfig } from "payload";

import { isAdminOrEditor, openRead } from "../shared/access";

const API_FILE_PREFIX = /^\/api\/media\/file\//;

/** Payload luôn sinh URL dạng `/api/media/file/*` — chuẩn hóa về `/media/*`. */
const toMediaUrl = (value: string): string => value.replace(API_FILE_PREFIX, "/media/");

const mediaUrlHooks = {
  afterRead: [
    ({ data, originalDoc, value }: any) => {
      const filename = data?.filename ?? originalDoc?.filename;
      if (filename) return `/media/${encodeURIComponent(String(filename))}`;
      if (typeof value === "string") {
        return toMediaUrl(value);
      }
      return value;
    },
  ],
  beforeChange: [
    ({ value }: any) =>
      typeof value === "string" ? toMediaUrl(value) : value,
  ],
};

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: ({ req }) => isAdminOrEditor({ req }),
    delete: ({ req }) => isAdminOrEditor({ req }),
    read: openRead,
    update: ({ req }) => isAdminOrEditor({ req }),
  },
  hooks: {
    // URL của các size (`sizes.card.url`…) do Payload sinh ra dưới `/api/media/file/*`.
    // Hook collection chạy SAU field hooks → chuẩn hóa về `/media/*` (KHÔNG dưới /api/,
    // robots Disallow /api/, Constitution §2.1 / plan AD-5).
    afterRead: [
      ({ doc }: { doc: any }) => {
        if (!doc || typeof doc !== "object") return doc;
        if (typeof doc.url === "string") doc.url = toMediaUrl(doc.url);
        if (doc.sizes && typeof doc.sizes === "object") {
          for (const size of Object.values<any>(doc.sizes)) {
            if (size && typeof size.url === "string") size.url = toMediaUrl(size.url);
          }
        }
        return doc;
      },
    ],
  },
  upload: {
    staticDir: "media",
    // Chỉ chấp nhận ảnh (JPG/PNG/WebP/AVIF).
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    adminThumbnail: ({ doc }: { doc: Record<string, unknown> }) => {
      const filename = doc?.filename;
      return filename ? `/media/${encodeURIComponent(String(filename))}` : null;
    },
    // Bản gốc giới hạn ≤ 2400px (sharp `fit: inside`, không phóng to) — spec §6.3.
    resizeOptions: {
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
    },
    // Sharp sizes: card 640w / hero 1600w / og 1200×630 crop (AD-5, spec §6.3).
    // Tên file tự thêm hậu tố kích thước: `<ten>-640x426.webp`…
    imageSizes: [
      { name: "card", width: 640, withoutEnlargement: true },
      { name: "hero", width: 1600, withoutEnlargement: true },
      { name: "og", width: 1200, height: 630, fit: "cover" },
    ],
  },
  admin: {
    description: "Ảnh JPG/PNG/WebP/AVIF. Alt bắt buộc (a11y + SEO).",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Alt text",
      required: true,
      admin: { description: "Mô tả nội dung ảnh — bắt buộc cho a11y và SEO ảnh." },
      validate: (value: unknown) => {
        if (typeof value === "string" && value.trim().length > 0) return true;
        return "Alt text không được để trống.";
      },
    },
    {
      name: "caption",
      type: "text",
      label: "Chú thích ảnh",
      admin: { description: "Để trống nếu không cần chú thích." },
    },
    {
      // Override field `url` mặc định của Payload: file luôn được serve tại /media/*
      // (KHÔNG dưới /api/ — robots Disallow /api/, Constitution §2.1 / AD-5).
      name: "url",
      type: "text",
      label: "URL",
      admin: { hidden: true, readOnly: true },
      hooks: mediaUrlHooks,
    },
  ],
};
