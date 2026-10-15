import type { CollectionConfig } from "payload";

import { slugify } from "../../lib/seo/slugify";
import { validateArticleHtml } from "../../lib/seo/sanitize";
import { processArticleContent } from "../../lib/seo/toc";
import { createRedirectOnSlugChange } from "../hooks/createRedirectOnSlugChange";
import { isAdminOrEditor } from "../shared/access";
import { seoFieldGroup } from "../shared/seoFieldGroup";

export type ArticleChangeInput = {
  data: Record<string, any>;
  originalDoc?: Record<string, any>;
};

/**
 * beforeChange của bài viết: sinh `contentHtml` (sanitize allowlist) +
 * `tableOfContents` (gắn id vào h2) và tự đặt `publishedAt` lần đầu publish (US5).
 */
export function articleBeforeChange({ data, originalDoc }: ArticleChangeInput): Record<string, any> {
  const status = data.status ?? originalDoc?.status;
  if (status === "published" && data.publishedAt == null) {
    data.publishedAt = originalDoc?.publishedAt ?? new Date().toISOString();
  }

  const content =
    typeof data.content === "string"
      ? data.content
      : typeof originalDoc?.content === "string"
        ? originalDoc.content
        : null;
  if (content !== null) {
    const { contentHtml, tableOfContents } = processArticleContent(content);
    data.contentHtml = contentHtml;
    data.tableOfContents = tableOfContents;
  }

  return data;
}

export const Articles: CollectionConfig = {
  slug: "articles",
  access: {
    create: ({ req }) => isAdminOrEditor({ req }),
    delete: ({ req }) => isAdminOrEditor({ req }),
    // Khách chưa đăng nhập chỉ đọc được bài đã đăng (draft → 404 ở API public)
    read: ({ req }) => (req?.user ? true : { status: { equals: "published" } }),
    update: ({ req }) => isAdminOrEditor({ req }),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "status", "publishedAt", "updatedAt"],
    description: "Tin tức / cẩm nang (spec 4.2.2).",
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }: any) => {
        if (!data) return data;

        // slug: tự sinh từ title khi để trống
        const title = data.title ?? originalDoc?.title;
        if (title && (!data.slug || typeof data.slug !== "string")) {
          const generated = slugify(String(title));
          if (generated) data.slug = generated;
        }

        return data;
      },
    ],
    beforeChange: [
      ({ data, originalDoc }: any) => (data ? articleBeforeChange({ data, originalDoc }) : data),
    ],
    afterChange: [createRedirectOnSlugChange("tin-tuc")],
  },
  fields: [
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      index: true,
      admin: { description: "Tự sinh từ tiêu đề khi để trống. Đổi slug → redirect 301." },
    },
    {
      name: "title",
      type: "text",
      label: "Tiêu đề",
      required: true,
    },
    {
      name: "category",
      type: "select",
      label: "Danh mục",
      required: true,
      defaultValue: "tin-tuyen",
      options: [
        { label: "Kinh nghiệm đi xe", value: "kinh-nghiem" },
        { label: "Tin tuyến & Báo giá", value: "tin-tuyen" },
        { label: "Khuyến mãi", value: "khuyen-mai" },
      ],
      admin: { description: "categoryName suy ra từ map cố định — không lưu riêng." },
    },
    {
      name: "excerpt",
      type: "textarea",
      label: "Mô tả ngắn",
      required: true,
      maxLength: 300,
      admin: { description: "Fallback meta description (≤ 300 ký tự)." },
    },
    {
      name: "content",
      type: "textarea",
      label: "Nội dung (HTML)",
      required: true,
      admin: {
        description:
          "HTML thô. Khi lưu hệ thống tự làm sạch theo allowlist và sinh contentHtml + mục lục.",
      },
      validate: (value: unknown) => validateArticleHtml(typeof value === "string" ? value : null),
    },
    {
      name: "contentHtml",
      type: "textarea",
      label: "HTML đã sanitize (tự sinh)",
      admin: { readOnly: true, description: "Sinh khi lưu qua sanitize-html + mục lục (T057)." },
    },
    {
      name: "tableOfContents",
      type: "json",
      label: "Mục lục (tự sinh)",
      admin: { readOnly: true, description: "Sinh từ h2: { id, text, level } — gắn id vào contentHtml." },
    },
    {
      name: "author",
      type: "text",
      label: "Tác giả",
      required: true,
      defaultValue: "Xe Ghép Liên Tỉnh",
      admin: { description: "Mặc định company_settings.brandName." },
    },
    {
      name: "authorType",
      type: "select",
      label: "Loại tác giả",
      defaultValue: "Organization",
      options: [
        { label: "Organization", value: "Organization" },
        { label: "Person", value: "Person" },
      ],
    },
    {
      name: "featuredImage",
      type: "upload",
      label: "Ảnh đại diện",
      relationTo: "media",
      required: true,
    },
    {
      name: "relatedRoute",
      type: "relationship",
      label: "Tuyến liên quan",
      relationTo: "routes",
    },
    {
      name: "status",
      type: "select",
      label: "Trạng thái",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Ngày xuất bản",
      admin: { description: "Tự đặt lần đầu publish, Admin sửa được." },
    },
    seoFieldGroup,
  ],
};
