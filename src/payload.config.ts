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

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
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
  globals: [CompanySettings, PricingSettings],
  cors: [
    "http://localhost:4000",
    "http://127.0.0.1:4000",
    "http://localhost:4002",
    "http://127.0.0.1:4002",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
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
