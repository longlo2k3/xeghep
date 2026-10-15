import type { CollectionConfig } from "payload";
import { APIError } from "payload";

import { createRedirectOnSlugChange } from "../hooks/createRedirectOnSlugChange";
import { isAdminOrEditor, openRead } from "../shared/access";
import { seoFieldGroup } from "../shared/seoFieldGroup";

const isRichTextEmpty = (value: unknown): boolean => {
  if (!value || typeof value !== "object") return true;
  const root = (value as { root?: { children?: unknown[] } }).root;
  const children = root?.children;
  if (!Array.isArray(children) || children.length === 0) return true;
  return children.every((child: any) => {
    if (typeof child?.text === "string" && child.text.trim().length > 0) return false;
    if (Array.isArray(child?.children)) return isRichTextEmpty({ root: { children: child.children } });
    return true;
  });
};

export const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    // Không tạo được trang hệ thống (kind=system) — seed sẵn 6 trang (FR-C08)
    create: ({ data, req }) => {
      if (!isAdminOrEditor({ req })) return false;
      return data?.kind !== "system";
    },
    // Không xóa được bản ghi hệ thống (FR-C08) — kiểm tra trong beforeDelete
    delete: ({ req }) => isAdminOrEditor({ req }),
    read: openRead,
    update: ({ req }) => isAdminOrEditor({ req }),
  },
  hooks: {
    beforeDelete: [
      async ({ id, req }: { id: number | string; req: any }) => {
        const doc = await req.payload.findByID({
          id,
          collection: "pages",
          depth: 0,
          overrideAccess: true,
        });
        if (doc?.kind === "system") {
          throw new APIError("Không thể xóa trang hệ thống (kind = system).", 400);
        }
      },
    ],
    // Trang hệ thống có slug → cũng tham gia redirect khi đổi slug (spec không loại trừ).
    afterChange: [createRedirectOnSlugChange()],
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["slug", "kind", "title", "status", "updatedAt"],
    description: "SEO trang hệ thống + nội dung trang chính sách (spec 4.2.3).",
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
        description:
          "Ví dụ: home, gioi-thieu, chinh-sach/bao-mat (được phép chứa '/').",
      },
    },
    {
      name: "kind",
      type: "select",
      label: "Loại trang",
      required: true,
      defaultValue: "system",
      options: [
        { label: "System (chỉ SEO, nội dung ở code)", value: "system" },
        { label: "Content (có nội dung trong CMS)", value: "content" },
      ],
    },
    {
      name: "title",
      type: "text",
      label: "Tiêu đề",
      required: true,
      admin: { description: "H1 / tiêu đề trang chính sách." },
    },
    {
      name: "content",
      type: "richText",
      label: "Nội dung",
      admin: { description: "Bắt buộc khi kind = content." },
      validate: (value: unknown, { siblingData, data }: any) => {
        const kind = siblingData?.kind ?? data?.kind;
        if (kind === "content" && isRichTextEmpty(value)) {
          return "Trang nội dung (kind = content) bắt buộc phải có nội dung.";
        }
        return true;
      },
    },
    {
      name: "contentHtml",
      type: "textarea",
      label: "Nội dung HTML",
      admin: {
        description:
          "Nội dung HTML cho trang chính sách (kind=content) — được seed tự động; chỉnh sửa trong admin",
      },
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
      ],
    },
    seoFieldGroup,
  ],
};
