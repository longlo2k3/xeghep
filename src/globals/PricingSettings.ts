import type { GlobalConfig } from "payload";

import { adminWrite, openRead } from "../collections/shared/access";
import { priceValidUntilWarning } from "../lib/settings/priceValidUntil";

export const PricingSettings: GlobalConfig = {
  slug: "pricing_settings",
  access: {
    read: openRead,
    update: adminWrite,
  },
  admin: {
    description: "Hằng số & chính sách giá (spec 4.2.11).",
  },
  hooks: {
    // T040: cảnh báo "Sắp hết hạn / Đã hết hạn" tính lúc đọc (virtual, không lưu DB).
    afterRead: [
      ({ doc }: any) => {
        if (!doc) return doc;
        return { ...doc, priceValidUntilWarning: priceValidUntilWarning(doc.priceValidUntil) };
      },
    ],
  },
  fields: [
    {
      name: "parcelFromPrice",
      type: "number",
      label: "Giá gửi hàng từ (VND)",
      defaultValue: 150000,
      min: 0,
    },
    {
      name: "parcelDeliveryText",
      type: "text",
      label: "Thời gian gửi hàng",
      defaultValue: "2–4 giờ",
    },
    {
      name: "maxPassengersPerShareTrip",
      type: "number",
      label: "Số khách tối đa/ chuyến ghép",
      defaultValue: 3,
      min: 1,
    },
    {
      name: "minLeadTimeMinutes",
      type: "number",
      label: "Đặt trước tối thiểu (phút)",
      defaultValue: 15,
      min: 0,
    },
    {
      name: "freeCancelMinutes",
      type: "number",
      label: "Miễn phí hủy trước (phút)",
      defaultValue: 30,
      min: 0,
    },
    {
      name: "returningCustomerDiscountPercent",
      type: "number",
      label: "Ưu đãi khách quay lại (%)",
      defaultValue: 10,
      min: 0,
      max: 100,
      admin: { description: "Chỉ hiển thị." },
    },
    {
      name: "priceValidUntil",
      type: "date",
      label: "Giá còn hiệu lực đến",
      required: true,
      admin: {
        description:
          "Bắt buộc — Marketer cập nhật mỗi khi đổi bảng giá (dùng cho schema Offer, SCH-1, không bao giờ hardcode). Còn ≤ 30 ngày hoặc quá hạn sẽ hiện cảnh báo đỏ ở ô " +
          '"Giá còn hiệu lực đến (cảnh báo)" phía dưới.',
      },
    },
    {
      name: "roundTripDiscountText",
      type: "textarea",
      label: "Ưu đãi khứ hồi",
      defaultValue:
        "Giảm 60% - 70% giá cước chiều về khi khách hàng đi khứ hồi trong ngày.",
    },
    {
      name: "waitingTimeText",
      type: "textarea",
      label: "Chính sách thời gian chờ",
    },
    {
      name: "waitingFreeMinutes",
      type: "number",
      label: "Thời gian chờ miễn phí (phút)",
      defaultValue: 60,
      min: 0,
    },
    {
      name: "waitingFeePerHour",
      type: "number",
      label: "Phí chờ mỗi giờ (VND)",
      defaultValue: 60000,
      min: 0,
    },
    {
      name: "waitingMaxHours",
      type: "number",
      label: "Chờ tối đa (giờ)",
      defaultValue: 3,
      min: 0,
    },
    { name: "tollsNote", type: "textarea", label: "Ghi chú phí cầu đường" },
    {
      name: "tollsNoteShort",
      type: "text",
      label: "Ghi chú phí cầu đường (ngắn)",
    },
    { name: "overnightNote", type: "textarea", label: "Ghi chú lưu đêm" },
    {
      name: "overnightPhone",
      type: "text",
      label: "Số lưu đêm",
      admin: { description: 'Ví dụ: 0858.911.247 — xuất hiện trong policies của /api/v1/pricing/distance.' },
    },
    {
      name: "holidayNote",
      type: "text",
      label: "Ghi chú ngày lễ",
      defaultValue: "Giá có thể thay đổi dịp lễ, tết.",
    },
    {
      name: "priceValidUntilWarning",
      type: "text",
      label: "Giá còn hiệu lực đến (cảnh báo)",
      virtual: true,
      admin: {
        readOnly: true,
        description:
          "Tự sinh khi đọc: 'Sắp hết hạn' khi còn ≤ 30 ngày, 'Đã hết hạn' khi quá ngày (T040 / SCH-1 / D12) — không lưu DB.",
      },
    },
  ],
};
