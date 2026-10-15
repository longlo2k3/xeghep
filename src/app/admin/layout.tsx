import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/admin/index.css";

/**
 * Root layout của khu quản trị CMS (SPA) — Multiple Root Layouts (MIGRATION D5):
 * KHÔNG có chrome public (Header/Footer), không index (rule 1.5 + AC):
 * meta robots + middleware X-Robots-Tag là 2 lớp phòng thủ.
 */
export const metadata: Metadata = {
  title: "Xe Ghép Liên Tỉnh — Quản trị",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
