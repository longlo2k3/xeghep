import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadEnv } from "payload/node";

loadEnv();

/**
 * Seed tổng — chạy tuần tự mọi script seed (idempotent, T048).
 * Chạy: `npm run seed`. Dừng ngay khi bước nào exit ≠ 0.
 *
 * Thứ tự: admin → routes (kèm media + assertPriceFrom) → pages → articles
 * (kèm media, cần routes cho relatedRoute) → airport → distance → redirects
 * → company → pricing → users.
 */

const SEED_DIR = path.dirname(fileURLToPath(import.meta.url));

const STEPS: { name: string; file: string }[] = [
  { name: "admin", file: "seedAdmin.ts" },
  { name: "routes", file: "seedRoutes.ts" },
  { name: "pages", file: "seedPages.ts" },
  { name: "articles", file: "seedArticles.ts" },
  { name: "airport", file: "seedAirport.ts" },
  { name: "distance", file: "seedDistance.ts" },
  { name: "redirects", file: "seedRedirects.ts" },
  { name: "company", file: "seedCompany.ts" },
  { name: "pricing", file: "seedPricingSettings.ts" },
  { name: "users", file: "seedUsers.ts" },
];

for (const step of STEPS) {
  const scriptPath = path.join(SEED_DIR, step.file);
  console.log(`\n=== Seed: ${step.name} (${step.file}) ===`);
  const result = spawnSync(process.execPath, ["--import", "tsx", scriptPath], {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "development",
      PAYLOAD_DB_PUSH: step.name === "admin" ? "true" : "false",
    },
  });
  if (result.status !== 0) {
    console.error(`Seed thất bại ở bước "${step.name}" (exit ${result.status}).`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nSeed tổng hoàn tất: mọi bước exit 0.");
process.exit(0);
