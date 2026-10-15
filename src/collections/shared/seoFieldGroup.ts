import type { Field } from "payload";

export const BRAND_SUFFIX = " | Xe Ghép Liên Tỉnh"; // 20 ký tự, do template layout thêm vào

export const seoFieldGroup: Field = {
  name: "seo",
  label: "Tối ưu hóa tìm kiếm (SEO & Social)",
  type: "group",
  fields: [
    {
      name: "metaTitle",
      type: "text",
      label: "Tiêu đề SEO (Meta Title)",
      maxLength: 70,
      admin: {
        description:
          'Tối ưu 50–60 ký tự TÍNH CẢ hậu tố thương hiệu nếu bật "Tự thêm tên thương hiệu". ' +
          'Để trống: tự sinh theo mẫu "{Tên} | Xe Ghép Liên Tỉnh".',
      },
      validate: (val: any, { siblingData }: any) => {
        if (!val) return true;
        const total =
          val.length +
          (siblingData?.appendBrand !== false ? BRAND_SUFFIX.length : 0);
        return (
          total <= 70 ||
          `Tổng độ dài hiển thị ${total} ký tự (> 70). Rút gọn hoặc tắt "Tự thêm tên thương hiệu".`
        );
      },
    },
    {
      name: "appendBrand",
      type: "checkbox",
      label: 'Tự thêm " | Xe Ghép Liên Tỉnh" vào cuối title',
      defaultValue: true,
      admin: {
        description:
          "Tắt nếu title đã dài hoặc đã có tên thương hiệu. Khi tắt, frontend dùng title.absolute.",
      },
    },
    {
      name: "metaDescription",
      type: "textarea",
      label: "Mô tả SEO (Meta Description)",
      maxLength: 160,
      admin: {
        description: "Tối ưu 120–155 ký tự. Để trống: lấy từ description/excerpt.",
      },
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
      label: "Ảnh chia sẻ MXH (Zalo / Facebook) — 1200×630",
      admin: {
        description:
          "Để trống: ảnh đại diện của trang → `company_settings.defaultOgImage`.",
      },
    },
    {
      name: "noindex",
      type: "checkbox",
      label: "Chặn Google lập chỉ mục (noindex)",
      defaultValue: false,
      admin: { description: "Trang noindex sẽ tự bị loại khỏi sitemap.xml." },
    },
  ],
};
