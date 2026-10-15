import type { CollectionConfig } from "payload";

import { isAdmin } from "../shared/access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "fullName", "role", "updatedAt"],
    description: "Tài khoản quản trị: admin / editor / dispatcher.",
  },
  access: {
    // Chỉ admin tạo được tài khoản mới
    create: ({ req }) => isAdmin({ req }),
    // Chỉ admin xóa được tài khoản
    delete: ({ req }) => isAdmin({ req }),
    // Admin xem tất cả; user thường chỉ xem chính mình
    read: ({ req, id }) => {
      const user = req?.user;
      if (!user) return false;
      if (user.role === "admin") return true;
      return id != null && String(user.id) === String(id);
    },
    // Admin sửa bất kỳ ai; user thường chỉ sửa hồ sơ của mình
    // (role chỉ admin đổi được — xem field access của `role`)
    update: ({ req, id }) => {
      const user = req?.user;
      if (!user) return false;
      if (user.role === "admin") return true;
      return id != null && String(user.id) === String(id);
    },
  },
  fields: [
    {
      name: "fullName",
      type: "text",
      label: "Họ và tên",
      admin: { position: "sidebar", description: "Tên hiển thị trong admin." },
    },
    {
      name: "role",
      type: "select",
      label: "Vai trò",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Dispatcher", value: "dispatcher" },
      ],
      access: {
        // Chỉ admin được thay đổi vai trò
        update: ({ req }) => isAdmin({ req }),
      },
      admin: {
        position: "sidebar",
        description: "Admin: toàn quyền · Editor: routes/articles/pages/media · Dispatcher: bookings.",
      },
    },
  ],
};
