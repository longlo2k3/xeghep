import type { CollectionConfig } from "payload";
import { APIError } from "payload";

import {
  normalizeRedirectUrl,
  validateRedirect,
  type RedirectRule,
} from "../../lib/seo/redirectRules";
import { adminWrite, openRead } from "../shared/access";

export const Redirects: CollectionConfig = {
  slug: "redirects",
  access: {
    create: adminWrite,
    delete: adminWrite,
    read: openRead,
    update: adminWrite,
  },
  admin: {
    useAsTitle: "fromUrl",
    defaultColumns: ["fromUrl", "toUrl", "statusCode", "source", "isActive", "createdAt"],
    description:
      "Chuyển hướng 301/308/410 (spec 4.2.7) — chuẩn hóa RD-1, chống vòng lặp/chuỗi RD-3 khi lưu.",
  },
  hooks: {
    beforeValidate: [
      ({ data }: { data?: Record<string, any> }) => {
        if (!data) return data;
        data.fromUrl = normalizeRedirectUrl(data.fromUrl);
        data.toUrl = normalizeRedirectUrl(data.toUrl);
        return data;
      },
    ],
    // RD-1…RD-4 kiểm trên TẬP bản ghi (graph) — sai → chặn lưu 422.
    beforeChange: [
      async ({ data, req }: { data?: Record<string, any>; req?: any }) => {
        if (!data || !req?.payload) return;
        const existing = await req.payload.find({
          collection: "redirects",
          limit: 2000,
          depth: 0,
          overrideAccess: true,
        });
        const result = validateRedirect(
          {
            fromUrl: data.fromUrl,
            toUrl: data.toUrl,
            statusCode: data.statusCode,
          },
          existing.docs as unknown as RedirectRule[],
        );
        if (!result.ok) throw new APIError(result.message, 422);
        data.fromUrl = result.fromUrl;
        data.toUrl = result.toUrl;
        data.statusCode = String(result.statusCode);
      },
    ],
  },
  fields: [
    {
      name: "fromUrl",
      type: "text",
      label: "URL cũ",
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          "RD-1: chữ thường, leading '/', bỏ '/' cuối, giữ query — tự chuẩn hóa khi lưu. Duy nhất.",
      },
    },
    {
      name: "toUrl",
      type: "text",
      label: "URL mới",
      admin: {
        description: "Bắt buộc (trừ statusCode 410) và phải khác URL cũ (RD-2).",
      },
    },
    {
      name: "statusCode",
      type: "select",
      label: "HTTP status",
      required: true,
      defaultValue: "301",
      options: [
        { label: "301 — Moved Permanently", value: "301" },
        { label: "308 — Permanent Redirect", value: "308" },
        { label: "410 — Gone (không có URL mới)", value: "410" },
      ],
      admin: { description: "RD-4: chỉ 301/308/410 — 410 là nội dung gỡ vĩnh viễn." },
    },
    {
      name: "source",
      type: "select",
      label: "Nguồn",
      defaultValue: "manual",
      options: [
        { label: "Auto (hook đổi slug)", value: "auto" },
        { label: "Manual", value: "manual" },
        { label: "Seed", value: "seed" },
      ],
    },
    {
      name: "isActive",
      type: "checkbox",
      label: "Kích hoạt",
      defaultValue: true,
      admin: { description: "Bỏ chọn → tạm tắt redirect (API chỉ trả bản ghi đang bật)." },
    },
    {
      name: "note",
      type: "textarea",
      label: "Ghi chú",
      admin: { description: "Lý do tạo / ghi chú nội bộ (không xuất API công khai)." },
    },
  ],
};
