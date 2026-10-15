"use client";

import dynamic from "next/dynamic";

/**
 * Mount Admin CMS SPA (src/admin) dưới /admin — D3:
 * - react-router BrowserRouter dùng window.history → phải ssr:false (client-only).
 * - Catch-all [[...path]] nhận mọi URL của SPA; router basename đã đặt trong App là "/admin".
 */
const AdminApp = dynamic(() => import("@/admin/App").then((mod) => mod.default), {
  ssr: false,
});

export default function AdminPage() {
  return <AdminApp />;
}
