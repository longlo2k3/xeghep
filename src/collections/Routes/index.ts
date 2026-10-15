import type { CollectionConfig, Field } from "payload";

import { slugify } from "../../lib/seo/slugify";
import { createRedirectOnSlugChange } from "../hooks/createRedirectOnSlugChange";
import { isAdminOrEditor, openRead } from "../shared/access";
import {
  computePriceFrom,
  priceTierGroup,
  TIER_KEYS,
  type PriceTierValue,
} from "../shared/priceTier";
import { seoFieldGroup } from "../shared/seoFieldGroup";

const textArray = (name: string, label: string, description: string): Field => ({
  name,
  label,
  type: "array",
  admin: { description },
  fields: [
    {
      name: "text",
      type: "text",
      label: "Giá trị",
      required: true,
    },
  ],
});

export const Routes: CollectionConfig = {
  slug: "routes",
  access: {
    create: ({ req }) => isAdminOrEditor({ req }),
    delete: ({ req }) => isAdminOrEditor({ req }),
    read: openRead,
    update: ({ req }) => isAdminOrEditor({ req }),
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "origin", "destination", "status", "sortOrder", "updatedAt"],
    description: "Tuyến liên tỉnh + giá + FAQ + slides + SEO (spec 4.2.1).",
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, originalDoc }: any) => {
        if (!data) return data;

        // slug: tự sinh từ name khi để trống (FR-D03 / spec 2.4)
        const name = data.name ?? originalDoc?.name;
        if (name && (!data.slug || typeof data.slug !== "string")) {
          const generated = slugify(String(name));
          if (generated) data.slug = generated;
        }

        // priceFrom: min của các tier không negotiable (FR-D04), read-only
        const tierOf = (key: string): PriceTierValue | null => {
          if (data[key] !== undefined && data[key] !== null) {
            return data[key] as PriceTierValue;
          }
          return (originalDoc?.[key] as PriceTierValue | undefined) ?? null;
        };
        data.priceFrom = computePriceFrom(TIER_KEYS.map((key) => tierOf(key)));

        return data;
      },
    ],
    afterChange: [createRedirectOnSlugChange("tuyen-lien-tinh")],
  },
  fields: [
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "Tự sinh từ tên tuyến khi để trống. Đổi slug sẽ tạo redirect 301 (xem 2.5).",
      },
    },
    {
      name: "name",
      type: "text",
      label: "Tên tuyến",
      required: true,
      admin: { description: "Ví dụ: Hải Phòng ⇄ Hà Nội ⇄ Nội Bài" },
    },
    {
      name: "origin",
      type: "text",
      label: "Điểm đi",
      required: true,
      admin: { description: "Dùng cho schema areaServed và pre-fill form." },
    },
    {
      name: "destination",
      type: "text",
      label: "Điểm đến",
      required: true,
      admin: { description: "Dùng cho schema areaServed và pre-fill form." },
    },
    {
      name: "distance",
      type: "text",
      label: "Khoảng cách",
      admin: { description: 'Hiển thị, ví dụ "120 - 145 km".' },
    },
    {
      name: "duration",
      type: "text",
      label: "Thời gian di chuyển",
      admin: { description: 'Hiển thị, ví dụ "1 giờ 30 phút".' },
    },
    priceTierGroup({
      name: "tierShare1",
      label: "Ghép 1 khách",
      adminDescription: "Bắt buộc ít nhất tierShare1 hoặc tierCharter45 (FR-D05).",
      requireMinRule: true,
    }),
    priceTierGroup({
      name: "tierShare2",
      label: "Ghép 2 khách",
      adminDescription: "Để trống → engine dùng share1 × 2.",
    }),
    priceTierGroup({
      name: "tierCharter45",
      label: "Thuê xe 45 chỗ",
      adminDescription: "Bắt buộc ít nhất tierShare1 hoặc tierCharter45 (FR-D05).",
    }),
    priceTierGroup({
      name: "tierCharter7",
      label: "Thuê xe 7 chỗ",
    }),
    {
      name: "priceFrom",
      type: "number",
      label: "Giá từ (tự tính)",
      admin: {
        readOnly: true,
        description: "min nhỏ nhất của các tier không negotiable (FR-D04).",
      },
    },
    {
      name: "priceValidUntil",
      type: "date",
      label: "Giá còn hiệu lực đến",
      admin: { description: "Để trống → dùng giá trị global pricing_settings.priceValidUntil." },
    },
    {
      name: "pricingDetails",
      label: "Bảng giá hiển thị",
      type: "array",
      admin: { description: "Giá của mỗi dòng luôn lấy từ tier tương ứng — không nhập giá tay." },
      fields: [
        {
          name: "tierKey",
          type: "select",
          label: "Tier",
          required: true,
          options: [
            { label: "share1", value: "share1" },
            { label: "share2", value: "share2" },
            { label: "charter45", value: "charter45" },
            { label: "charter7", value: "charter7" },
          ],
        },
        {
          name: "label",
          type: "text",
          label: "Nhãn hiển thị",
          required: true,
        },
        {
          name: "note",
          type: "text",
          label: "Ghi chú",
        },
      ],
    },
    {
      name: "description",
      type: "textarea",
      label: "Mô tả ngắn",
      required: true,
      maxLength: 300,
      admin: { description: "Mô tả hero tuyến, fallback meta description (≤ 300 ký tự)." },
    },
    {
      name: "detailedContent",
      type: "richText",
      label: "Giới thiệu tuyến (chi tiết)",
      admin: { description: "Để trống → frontend dùng mẫu chung." },
    },
    {
      name: "operatingHoursText",
      type: "text",
      label: "Giờ hoạt động",
      admin: { description: "Để trống → dùng mặc định global (24/7)." },
    },
    {
      name: "frequencyText",
      type: "text",
      label: "Tần suất khai thác",
      admin: { description: "Để trống → dùng mặc định global (30–60 phút)." },
    },
    textArray("pickups", "Điểm đón", "Mỗi phần tử là MỘT địa danh (không gộp cả chuỗi dài)."),
    textArray("dropoffs", "Điểm trả", "Mỗi phần tử là MỘT địa danh (không gộp cả chuỗi dài)."),
    textArray(
      "originAliases",
      "Từ khóa khớp điểm đi",
      "Từ khóa khớp tuyến cho Pricing Engine (PR-2). Gợi ý từ origin/pickups, Admin chỉnh được.",
    ),
    textArray(
      "destinationAliases",
      "Từ khóa khớp điểm đến",
      "Từ khóa khớp tuyến cho Pricing Engine (PR-2). Gợi ý từ destination/dropoffs, Admin chỉnh được.",
    ),
    {
      name: "regions",
      type: "select",
      label: "Khu vực",
      hasMany: true,
      options: [
        { label: "Hải Phòng", value: "Hải Phòng" },
        { label: "Hà Nội", value: "Hà Nội" },
        { label: "Hạ Long", value: "Hạ Long" },
        { label: "Móng Cái", value: "Móng Cái" },
        { label: "Bắc Ninh – Bắc Giang", value: "Bắc Ninh – Bắc Giang" },
      ],
      admin: { description: "Dùng cho tab lọc khu vực." },
    },
    {
      name: "thumbnail",
      type: "upload",
      label: "Ảnh card",
      relationTo: "media",
    },
    {
      name: "slides",
      label: "Slide chi tiết",
      type: "array",
      admin: { description: "Slide đầu tiên là LCP. alt để trống → lấy media.alt." },
      fields: [
        {
          name: "image",
          type: "upload",
          label: "Ảnh",
          relationTo: "media",
          required: true,
        },
        {
          name: "badge",
          type: "text",
          label: "Badge",
          required: true,
        },
        {
          name: "caption",
          type: "text",
          label: "Chú thích",
          required: true,
        },
        {
          name: "alt",
          type: "text",
          label: "Alt text",
          admin: { description: "Để trống → lấy media.alt." },
        },
      ],
    },
    {
      name: "faqs",
      label: "Câu hỏi thường gặp",
      type: "array",
      fields: [
        {
          name: "question",
          type: "text",
          label: "Câu hỏi",
          required: true,
        },
        {
          name: "answer",
          type: "textarea",
          label: "Câu trả lời",
          required: true,
        },
      ],
    },
    {
      name: "relatedRoutes",
      type: "relationship",
      label: "Tuyến liên quan",
      relationTo: "routes",
      hasMany: true,
      admin: { description: "Tối đa 3 tuyến. Để trống → frontend lấy 3 tuyến đầu theo sortOrder." },
      validate: (value: unknown) => {
        if (Array.isArray(value) && value.length > 3) {
          return "Chỉ được chọn tối đa 3 tuyến liên quan.";
        }
        return true;
      },
    },
    {
      name: "isBannerTop",
      type: "checkbox",
      label: "Hiện ở banner trang chủ",
      defaultValue: false,
    },
    {
      name: "bannerLabel",
      type: "text",
      label: "Nhãn banner",
      admin: { description: 'Để trống → dùng name. (Banner dùng "⇔" khác name "⇄")' },
    },
    {
      name: "sortOrder",
      type: "number",
      label: "Thứ tự",
      required: true,
      defaultValue: 0,
      admin: { description: "Thứ tự lưới và header." },
    },
    {
      name: "status",
      type: "select",
      label: "Trạng thái",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      admin: { description: "Chỉ active mới hiển thị / vào sitemap." },
    },
    seoFieldGroup,
  ],
};
