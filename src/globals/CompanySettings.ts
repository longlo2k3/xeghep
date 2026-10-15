import type { GlobalConfig } from "payload";

import { adminWrite, openRead } from "../collections/shared/access";
import { deriveCompanyLinks } from "../lib/settings/company";

const derivedField = (name: string, label: string, description: string) => ({
  name,
  label,
  type: "text" as const,
  virtual: true,
  admin: { readOnly: true, description },
});

export const CompanySettings: GlobalConfig = {
  slug: "company_settings",
  access: {
    read: openRead,
    update: adminWrite,
  },
  admin: {
    description: "Thông tin công ty, thương hiệu, cam kết, thanh toán, đánh giá (spec 4.2.10).",
  },
  hooks: {
    // FR-D10: hotlineHref / zaloHref / smsHref / domainName tính lúc đọc — không lưu DB.
    afterRead: [
      ({ doc }: any) => {
        if (!doc) return doc;
        return {
          ...doc,
          ...deriveCompanyLinks({
            hotlineRaw: doc.contact?.hotlineRaw,
            website: doc.identity?.website,
          }),
        };
      },
    ],
  },
  fields: [
    {
      name: "identity",
      label: "Định danh",
      type: "group",
      fields: [
        { name: "companyName", type: "text", label: "Tên công ty", required: true },
        { name: "brandName", type: "text", label: "Tên thương hiệu", required: true },
        {
          name: "website",
          type: "text",
          label: "Website",
          required: true,
          admin: { description: "Ví dụ: https://xegheplientinh.vn" },
        },
      ],
    },
    {
      name: "contact",
      label: "Liên hệ",
      type: "group",
      fields: [
        {
          name: "hotline",
          type: "text",
          label: "Hotline (hiển thị)",
          required: true,
          admin: { description: "Ví dụ: 0962.298.293" },
        },
        {
          name: "hotlineRaw",
          type: "text",
          label: "Hotline (số thuần)",
          required: true,
          validate: (value: unknown) => {
            if (typeof value === "string" && /^0\d{9}$/.test(value)) return true;
            return "Số điện thoại phải khớp định dạng ^0\\d{9}$ (ví dụ: 0962298293).";
          },
        },
        {
          name: "secondaryPhone",
          label: "Số phụ",
          type: "group",
          fields: [
            { name: "label", type: "text", label: "Nhãn", admin: { description: "Ví dụ: Tổng đài lưu đêm" } },
            { name: "number", type: "text", label: "Số điện thoại", admin: { description: "Ví dụ: 0858.911.247" } },
          ],
        },
        { name: "email", type: "email", label: "Email", required: true },
        { name: "zaloUrl", type: "text", label: "Zalo URL" },
        { name: "fanpageName", type: "text", label: "Tên fanpage" },
        { name: "fanpageUrl", type: "text", label: "Fanpage URL" },
      ],
    },
    {
      name: "location",
      label: "Địa điểm",
      type: "group",
      fields: [
        { name: "address", type: "text", label: "Địa chỉ" },
        {
          name: "mapEmbedUrl",
          type: "text",
          label: "URL nhúng bản đồ",
          admin: { description: "Dùng cho trang Liên hệ." },
        },
        { name: "latitude", type: "number", label: "Vĩ độ" },
        { name: "longitude", type: "number", label: "Kinh độ" },
      ],
    },
    {
      name: "banner",
      label: "Banner & nội dung chung",
      type: "group",
      fields: [
        { name: "topBannerLine1", type: "text", label: "Banner dòng 1" },
        { name: "topBannerLine2", type: "text", label: "Banner dòng 2" },
        { name: "coverage", type: "textarea", label: "Phạm vi phủ sóng" },
        { name: "workingHours", type: "text", label: "Giờ làm việc" },
        { name: "fleetDescription", type: "textarea", label: "Mô tả đội xe" },
        { name: "bookingPromise", type: "textarea", label: "Cam kết đặt xe" },
        { name: "summary", type: "textarea", label: "Tóm tắt dịch vụ" },
      ],
    },
    {
      name: "brandSeo",
      label: "Thương hiệu / SEO",
      type: "group",
      fields: [
        {
          name: "logo",
          type: "upload",
          label: "Logo (512×512)",
          relationTo: "media",
        },
        {
          name: "defaultOgImage",
          type: "upload",
          label: "Ảnh OG mặc định (1200×630)",
          relationTo: "media",
        },
        {
          name: "areaServed",
          label: "Khu vực phục vụ (schema.org)",
          type: "array",
          fields: [
            {
              name: "type",
              type: "select",
              label: "Loại",
              required: true,
              defaultValue: "City",
              options: [
                { label: "City", value: "City" },
                { label: "AdministrativeArea", value: "AdministrativeArea" },
              ],
            },
            { name: "name", type: "text", label: "Tên khu vực", required: true },
          ],
        },
        {
          name: "priceRange",
          type: "text",
          label: "Khoảng giá (schema.org priceRange)",
          admin: { description: "Ví dụ: ₫" },
        },
      ],
    },
    {
      name: "commitments",
      label: "Cam kết",
      type: "array",
      fields: [
        { name: "title", type: "text", label: "Tiêu đề", required: true },
        { name: "description", type: "textarea", label: "Mô tả", required: true },
        {
          name: "iconName",
          type: "select",
          label: "Icon (lucide-react)",
          required: true,
          defaultValue: "ShieldCheck",
          options: [
            { label: "ShieldCheck", value: "ShieldCheck" },
            { label: "MapPin", value: "MapPin" },
            { label: "Users", value: "Users" },
            { label: "BadgePercent", value: "BadgePercent" },
            { label: "Clock", value: "Clock" },
            { label: "Award", value: "Award" },
          ],
        },
      ],
    },
    {
      name: "paymentMethods",
      label: "Phương thức thanh toán",
      type: "array",
      fields: [
        { name: "title", type: "text", label: "Tiêu đề", required: true },
        { name: "description", type: "textarea", label: "Mô tả", required: true },
        {
          name: "iconName",
          type: "select",
          label: "Icon (lucide-react)",
          required: true,
          defaultValue: "Banknote",
          options: [
            { label: "Banknote", value: "Banknote" },
            { label: "CreditCard", value: "CreditCard" },
            { label: "Smartphone", value: "Smartphone" },
            { label: "CheckCircle", value: "CheckCircle" },
            { label: "QrCode", value: "QrCode" },
            { label: "Wallet", value: "Wallet" },
          ],
        },
      ],
    },
    {
      name: "testimonials",
      label: "Đánh giá của khách",
      type: "array",
      fields: [
        { name: "author", type: "text", label: "Tên khách", required: true },
        { name: "location", type: "text", label: "Khu vực" },
        { name: "content", type: "textarea", label: "Nội dung", required: true },
        {
          name: "rating",
          type: "number",
          label: "Điểm (1–5)",
          min: 1,
          max: 5,
          defaultValue: 5,
        },
        {
          name: "avatarText",
          type: "text",
          label: "Chữ đại diện",
          admin: { description: "2 ký tự đầu làm avatar, ví dụ 'MH'." },
        },
        {
          name: "isVisible",
          type: "checkbox",
          label: "Hiển thị",
          defaultValue: true,
          admin: { description: "API lọc testimonials có isVisible = true." },
        },
      ],
    },
    derivedField(
      "hotlineHref",
      "Liên kết gọi (tự sinh)",
      'Tính từ "Hotline (số thuần)" lúc đọc, ví dụ tel:+84962298293 — không lưu DB (FR-D10).',
    ),
    derivedField(
      "zaloHref",
      "Liên kết Zalo (tự sinh)",
      'Tính từ hotline, ví dụ https://zalo.me/84962298293 — không lưu DB (FR-D10).',
    ),
    derivedField(
      "smsHref",
      "Liên kết SMS (tự sinh)",
      'Tính từ hotline, ví dụ sms:+84962298293 — không lưu DB (FR-D10).',
    ),
    derivedField(
      "domainName",
      "Domain (tự sinh)",
      "Tính từ Website, bỏ www. — không lưu DB (FR-D10).",
    ),
  ],
};
