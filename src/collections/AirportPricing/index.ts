import type { CollectionConfig } from "payload";

import { airportRoundTripWarnings } from "../../lib/settings/airportRules";
import { adminWrite, openRead } from "../shared/access";
import { vehiclePriceGroup } from "../shared/priceTier";

export const AirportPricing: CollectionConfig = {
  slug: "airport_pricing",
  access: {
    create: adminWrite,
    delete: adminWrite,
    read: openRead,
    update: adminWrite,
  },
  admin: {
    useAsTitle: "district",
    defaultColumns: ["slug", "district", "isActive", "sortOrder"],
    description: "Giá sân bay Nội Bài theo 12 quận (spec 4.2.8) — cảnh báo khứ hồi FR-D06.",
  },
  hooks: {
    // FR-D06: giá khứ hồi > tổng hai chiều → CẢNH BÁO, không chặn lưu.
    afterRead: [
      ({ doc }: any) => {
        if (!doc) return doc;
        const warnings = airportRoundTripWarnings(doc);
        return { ...doc, roundTripWarning: warnings.length ? warnings.join(" ") : "" };
      },
    ],
  },
  fields: [
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "district",
      type: "text",
      label: "Quận",
      required: true,
      admin: { description: "12 quận nội thành Hà Nội." },
    },
    vehiclePriceGroup("fromHanoiToAirport", "Đi từ Hà Nội → Sân bay"),
    vehiclePriceGroup("fromAirportToHanoi", "Đi từ Sân bay → Hà Nội"),
    vehiclePriceGroup("roundTrip", "Khứ hồi"),
    {
      name: "roundTripWarning",
      type: "text",
      label: "Cảnh báo khứ hồi (tự sinh)",
      virtual: true,
      admin: {
        readOnly: true,
        description:
          "Cảnh báo khi giá khứ hồi lớn hơn tổng hai chiều (FR-D06) — chỉ cảnh báo, không chặn lưu.",
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      label: "Kích hoạt",
      defaultValue: true,
    },
    {
      name: "sortOrder",
      type: "number",
      label: "Thứ tự",
      defaultValue: 0,
    },
  ],
};
