import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

/**
 * Config gộp từ 3 dự án nguồn (xem MIGRATION.md):
 * - website: trailingSlash/compress/images/security headers
 * - backend: withPayload + CORS header cho payload REST (/api/*)
 * - KHÔNG có rewrite /api/v1/* → API chạy cùng app (quyết định D6);
 *   giữ rewrite kebab-case → payload underscore để không đổi hành vi API cũ.
 */
const nextConfig: NextConfig = {
  trailingSlash: false,
  compress: true,
  serverExternalPackages: ["nodemailer"],
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4001",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "4001",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "xeghep24h.vn",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "api.xeghep24h.vn",
        pathname: "/media/**",
      },
    ],
  },
  async headers() {
    return [
      // Security headers (giữ nguyên từ website)
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // CORS cho payload REST (giữ từ backend; bỏ x-revalidate-secret — webhook đã xóa)
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Content-Type, Authorization, Idempotency-Key, X-Requested-With, Accept",
          },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Payload REST dùng tên underscore; giữ alias kebab-case như cũ (không đổi API phía ngoài)
      {
        source: "/api/airport-pricing/:path*",
        destination: "/api/airport_pricing/:path*",
      },
      {
        source: "/api/airport-pricing",
        destination: "/api/airport_pricing",
      },
      {
        source: "/api/distance-rates/:path*",
        destination: "/api/distance_rates/:path*",
      },
      {
        source: "/api/distance-rates",
        destination: "/api/distance_rates",
      },
      {
        source: "/api/globals/company-settings",
        destination: "/api/globals/company_settings",
      },
      {
        source: "/api/globals/pricing-settings",
        destination: "/api/globals/pricing_settings",
      },
    ];
  },
};

export default withPayload(nextConfig);
