import type { ServerProps } from "payload";
import React from "react";

/**
 * Logo admin (T083): thay PayloadLogo trên nav + trang đăng nhập.
 * Render server-side (RSC) — nhận serverProps của Payload (i18n, user, …).
 */
export const Logo: React.FC<ServerProps> = () => (
  <span
    style={{
      alignItems: "center",
      display: "flex",
      gap: "0.5rem",
      lineHeight: 1.15,
    }}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/logo.svg"
      alt="Xe Ghép Liên Tỉnh"
      width={32}
      height={32}
      style={{ display: "block", flexShrink: 0 }}
    />
    <span style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>
        Xe Ghép Liên Tỉnh
      </span>
      <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>Quản trị</span>
    </span>
  </span>
);
