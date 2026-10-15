import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineWorkspace } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));
const alias = { "@": path.resolve(root, "src") };

/**
 * Gộp 3 bộ test của 3 dự án nguồn (MIGRATION D-gộp):
 * - site: website public (node)      → tests/**
 * - backend: API/Payload (node)       → backend-tests/**
 * - admin: SPA CMS (jsdom + react)    → src/admin/tests/**
 * Chạy: `npm test` (tất cả) hoặc `npx vitest run --project admin`.
 */
export default defineWorkspace([
  {
    resolve: { alias },
    test: {
      name: "site",
      environment: "node",
      include: ["tests/**/*.test.ts"],
      poolOptions: {
        forks: { singleFork: true },
      },
    },
  },
  {
    resolve: { alias },
    test: {
      name: "backend",
      environment: "node",
      include: ["backend-tests/**/*.test.ts"],
      setupFiles: [path.resolve(root, "backend-tests/setup.ts")],
    },
  },
  {
    plugins: [react()],
    resolve: { alias },
    test: {
      name: "admin",
      environment: "jsdom",
      globals: true,
      include: ["src/admin/tests/**/*.test.{ts,tsx}"],
    },
  },
]);
