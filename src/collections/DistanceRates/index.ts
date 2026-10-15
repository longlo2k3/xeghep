import type { CollectionConfig } from "payload";
import { APIError } from "payload";

import { validateDistanceRanges } from "../../lib/settings/distanceRules";
import { adminWrite, openRead } from "../shared/access";

export const DistanceRates: CollectionConfig = {
  slug: "distance_rates",
  access: {
    create: adminWrite,
    delete: adminWrite,
    read: openRead,
    update: adminWrite,
  },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "minKm", "maxKm", "sedan5Seats", "suv7Seats", "van16Seats", "sortOrder"],
    description: "Đơn giá theo dải km (spec 4.2.9) — validate không chồng lấn/không hở (FR-D07).",
  },
  hooks: {
    // FR-D07: kiểm tra TRÊN TẬP dải (dải mới + các dải còn lại) — sai → chặn lưu 422.
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        if (!data || !req?.payload) return;
        const where =
          originalDoc?.id != null ? { id: { not_equals: originalDoc.id } } : undefined;
        const others = await req.payload.find({
          collection: "distance_rates",
          limit: 100,
          depth: 0,
          sort: "minKm",
          where,
          overrideAccess: true,
        });
        const current = {
          label: data.label ?? originalDoc?.label ?? null,
          minKm: data.minKm ?? originalDoc?.minKm ?? null,
          maxKm: data.maxKm !== undefined ? data.maxKm : (originalDoc?.maxKm ?? null),
        };
        const merged = [...others.docs, current].map((row: any) => ({
          label: row.label ?? null,
          minKm: row.minKm ?? null,
          maxKm: row.maxKm ?? null,
        }));
        const result = validateDistanceRanges(merged);
        if (!result.ok) throw new APIError(result.message, 422);
      },
    ],
  },
  fields: [
    {
      name: "label",
      type: "text",
      label: "Nhãn dải",
      required: true,
      admin: { description: 'Ví dụ: "Dưới 30 km (tối thiểu)".' },
    },
    {
      name: "minKm",
      type: "number",
      label: "Từ (km)",
      required: true,
      min: 0,
      validate: (value: unknown) => {
        if (typeof value !== "number" || Number.isNaN(value)) return true;
        if (value < 0 || !Number.isInteger(value)) {
          return "Từ (km) phải là số nguyên dương lớn hơn hoặc bằng 0.";
        }
        return true;
      },
    },
    {
      name: "maxKm",
      type: "number",
      label: "Đến (km)",
      admin: { description: "Để trống = không giới hạn (phải là dải cuối cùng)." },
      validate: (value: unknown, { siblingData }: any) => {
        if (value == null || value === "") return true;
        if (typeof value === "number" && !Number.isInteger(value)) {
          return "Đến (km) phải là số nguyên.";
        }
        const minKm = siblingData?.minKm;
        if (typeof minKm === "number" && typeof value === "number" && value <= minKm) {
          return "maxKm phải lớn hơn minKm.";
        }
        return true;
      },
    },
    {
      name: "sedan5Seats",
      type: "number",
      label: "Sedan 5 chỗ (đ/km)",
      required: true,
      validate: (value: unknown) =>
        typeof value === "number" && value > 0 ? true : "Đơn giá phải lớn hơn 0.",
    },
    {
      name: "suv7Seats",
      type: "number",
      label: "SUV 7 chỗ (đ/km)",
      required: true,
      validate: (value: unknown) =>
        typeof value === "number" && value > 0 ? true : "Đơn giá phải lớn hơn 0.",
    },
    {
      name: "van16Seats",
      type: "number",
      label: "Van 16 chỗ (đ/km)",
      required: true,
      validate: (value: unknown) =>
        typeof value === "number" && value > 0 ? true : "Đơn giá phải lớn hơn 0.",
    },
    {
      name: "sortOrder",
      type: "number",
      label: "Thứ tự",
      defaultValue: 0,
    },
  ],
};
