import { loadEnv } from "payload/node";

(process.env as Record<string, string | undefined>).NODE_ENV = "development";
process.env.PAYLOAD_DB_PUSH = "true";
loadEnv();

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config");

/**
 * Seed tài khoản admin đầu tiên. Chạy: `npm run seed:admin`.
 * Env: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (xem .env.example).
 */
const payload = await getPayload({ config });

const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
const password = process.env.SEED_ADMIN_PASSWORD || "Admin123!";

const existing = await payload.find({
  collection: "users",
  limit: 1,
  where: { email: { equals: email } },
  overrideAccess: true,
});

if (existing.docs.length === 0) {
  await payload.create({
    collection: "users",
    data: {
      email,
      fullName: "Administrator",
      password,
      role: "admin",
    },
    overrideAccess: true,
  });
  payload.logger.info(`Đã tạo admin: ${email}`);
} else {
  await payload.update({
    id: existing.docs[0].id,
    collection: "users",
    data: {
      fullName: (existing.docs[0] as { fullName?: string }).fullName || "Administrator",
      password,
      role: "admin",
    },
    overrideAccess: true,
  });
  payload.logger.info(`Đã cập nhật admin: ${email} (role=admin)`);
}

await payload.destroy();
process.exit(0);
