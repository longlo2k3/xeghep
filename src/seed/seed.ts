import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadEnv } from "payload/node";

loadEnv();

/**
 * Restore a database-synchronized content snapshot into an empty content DB,
 * then create the environment-configured admin accounts. Schema changes are
 * explicit because the current DB has unrelated tables/columns to preserve.
 */

const SEED_DIR = path.dirname(fileURLToPath(import.meta.url));

const STEPS: { name: string; file: string }[] = [
  { name: "snapshot", file: "seedDatabaseSnapshot.ts" },
  { name: "admin", file: "seedAdmin.ts" },
  { name: "users", file: "seedUsers.ts" },
];

for (const step of STEPS) {
  const scriptPath = path.join(SEED_DIR, step.file);
  console.log(`\n=== Seed: ${step.name} (${step.file}) ===`);
  const bootstrapPath = path.resolve(SEED_DIR, "../scripts/tsxUserInfoFallback.cjs");
  const result = spawnSync(process.execPath, ["--require", bootstrapPath, "--import", "tsx", scriptPath], {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "development",
      PAYLOAD_DB_PUSH: "false",
    },
  });
  if (result.status !== 0) {
    console.error(`Seed thất bại ở bước "${step.name}" (exit ${result.status}).`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nSeed tổng hoàn tất: mọi bước exit 0.");
process.exit(0);
