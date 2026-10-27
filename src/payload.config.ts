import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";

import { AirportPricing } from "./collections/AirportPricing";
import { Articles } from "./collections/Articles";
import { Bookings } from "./collections/Bookings";
import { DistanceRates } from "./collections/DistanceRates";
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
import { Redirects } from "./collections/Redirects";
import { Routes } from "./collections/Routes";
import { Users } from "./collections/Users";
import { CompanySettings } from "./globals/CompanySettings";
import { PricingSettings } from "./globals/PricingSettings";
import { NotificationSettings } from "./globals/NotificationSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  onInit: async (payload) => {
    try {
      const pool = (payload.db as any)?.pool;
      if (pool) {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS notification_settings (
            id serial PRIMARY KEY,
            email_enabled boolean DEFAULT false,
            email_to text,
            smtp_host text DEFAULT 'smtp.gmail.com',
            smtp_port numeric DEFAULT 587,
            smtp_secure boolean DEFAULT false,
            smtp_user text,
            smtp_password text,
            sender_name text DEFAULT 'Xe Ghép Liên Tỉnh — Tổng đài',
            sender_email text,
            telegram_enabled boolean DEFAULT false,
            telegram_bot_token text,
            telegram_chat_id text,
            updated_at timestamp(3) with time zone DEFAULT now(),
            created_at timestamp(3) with time zone DEFAULT now()
          );

          ALTER TABLE notification_settings
            ADD COLUMN IF NOT EXISTS smtp_host text DEFAULT 'smtp.gmail.com',
            ADD COLUMN IF NOT EXISTS smtp_port numeric DEFAULT 587,
            ADD COLUMN IF NOT EXISTS smtp_secure boolean DEFAULT false,
            ADD COLUMN IF NOT EXISTS smtp_user text,
            ADD COLUMN IF NOT EXISTS smtp_password text,
            ADD COLUMN IF NOT EXISTS sender_name text DEFAULT 'Xe Ghép Liên Tỉnh — Tổng đài',
            ADD COLUMN IF NOT EXISTS sender_email text,
            ADD COLUMN IF NOT EXISTS email_enabled boolean DEFAULT false,
            ADD COLUMN IF NOT EXISTS email_to text,
            ADD COLUMN IF NOT EXISTS telegram_enabled boolean DEFAULT false,
            ADD COLUMN IF NOT EXISTS telegram_bot_token text,
            ADD COLUMN IF NOT EXISTS telegram_chat_id text;

          INSERT INTO notification_settings (id, email_enabled, smtp_host, smtp_port, sender_name)
          SELECT 1, false, 'smtp.gmail.com', 587, 'Xe Ghép Liên Tỉnh — Tổng đài'
          WHERE NOT EXISTS (SELECT 1 FROM notification_settings WHERE id = 1);
        `);
      }
    } catch (err) {
      console.error("[NotificationSettings] Auto schema migration error:", err);
    }
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // T083 — branding admin (logo/tên/favicon) + T081 — chặn index khu quản trị
    // (FR-C06: header X-Robots-Tag do middleware src/middleware.ts đảm nhiệm;
    // meta robots dưới đây là lớp phòng thủ bổ sung).
    meta: {
      title: "Xe Ghép Liên Tỉnh — Quản trị",
      titleSuffix: "",
      description:
        "Quản trị nội dung, tuyến đường, đơn đặt xe và SEO — Xe Ghép Liên Tỉnh.",
      icons: { icon: "/logo.svg" },
      robots: "noindex, nofollow",
      openGraph: {
        title: "Xe Ghép Liên Tỉnh — Quản trị",
        description:
          "Quản trị nội dung, tuyến đường, đơn đặt xe và SEO — Xe Ghép Liên Tỉnh.",
        siteName: "Xe Ghép Liên Tỉnh",
        type: "website",
      },
      defaultOGImageType: "off",
    },
    components: {
      graphics: {
        Logo: { path: "@/components/admin/Logo", exportName: "Logo" },
      },
    },
  },
  collections: [
    Users,
    Media,
    Routes,
    Articles,
    Pages,
    Bookings,
    Redirects,
    AirportPricing,
    DistanceRates,
  ],
  globals: [CompanySettings, PricingSettings, NotificationSettings],
  cors: [
    "http://localhost:4000",
    "http://127.0.0.1:4000",
    "http://localhost:4002",
    "http://127.0.0.1:4002",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...(process.env.PAYLOAD_PUBLIC_SERVER_URL ? [process.env.PAYLOAD_PUBLIC_SERVER_URL.replace(/\/+$/, "")] : []),
    ...(process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "")] : []),
    "https://xeghep24h.vn",
    "https://xeghephaiphonghanoi.com",
  ],
  csrf: [
    "http://localhost:4000",
    "http://127.0.0.1:4000",
    "http://localhost:4002",
    "http://127.0.0.1:4002",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...(process.env.PAYLOAD_PUBLIC_SERVER_URL ? [process.env.PAYLOAD_PUBLIC_SERVER_URL.replace(/\/+$/, "")] : []),
    ...(process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "")] : []),
    "https://xeghep24h.vn",
    "https://xeghephaiphonghanoi.com",
  ],
  editor: lexicalEditor(),
  // Payload 3 không tự nạp sharp — pass vào đây để imageSizes/resizeOptions
  // (media pipeline T080) thực sự chạy khi upload.
  sharp,
  secret: process.env.PAYLOAD_SECRET || "change-me-32chars-minimum",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
    // Tránh việc Drizzle tự động quét/pull schema từ database mỗi khi khởi động/recompile trong dev.
    // Tiết kiệm 2-5s thời gian khởi tạo và ngăn ngừa lock database khi có nhiều request đồng thời.
    // Khi cần push schema, chạy: npm run db:push (đã set PAYLOAD_DB_PUSH=true).
    push: process.env.PAYLOAD_DB_PUSH === "true",
  }),
});
