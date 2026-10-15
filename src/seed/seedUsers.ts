import { loadEnv } from "payload/node";

(process.env as Record<string, string | undefined>).NODE_ENV = "development";
loadEnv();

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config");

/**
 * Seed tài khoản test roles: editor + dispatcher (T048).
 * Chạy: `npm run seed:users`. Idempotent: upsert theo email (reset password mỗi lần chạy).
 * Env: SEED_EDITOR_EMAIL/SEED_EDITOR_PASSWORD, SEED_DISPATCHER_EMAIL/SEED_DISPATCHER_PASSWORD.
 */

type SeedUserRow = { email: string; fullName: string; role: "editor" | "dispatcher" };

export const SEED_USERS: SeedUserRow[] = [
  {
    email: process.env.SEED_EDITOR_EMAIL || "editor@example.com",
    fullName: "Editor Test",
    role: "editor",
  },
  {
    email: process.env.SEED_DISPATCHER_EMAIL || "dispatcher@example.com",
    fullName: "Dispatcher Test",
    role: "dispatcher",
  },
];

const PASSWORD_BY_ROLE: Record<SeedUserRow["role"], string> = {
  editor: process.env.SEED_EDITOR_PASSWORD || "Editor123!",
  dispatcher: process.env.SEED_DISPATCHER_PASSWORD || "Dispatcher123!",
};

const invokedAsScript = (process.argv[1] ?? "").replace(/\\/g, "/").endsWith("/seedUsers.ts");

if (invokedAsScript) {
  const payload = await getPayload({ config });
  let created = 0;
  let updated = 0;

  for (const row of SEED_USERS) {
    const password = PASSWORD_BY_ROLE[row.role];
    const existing = await payload.find({
      collection: "users",
      limit: 1,
      where: { email: { equals: row.email } },
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      await payload.update({
        id: existing.docs[0].id,
        collection: "users",
        data: { fullName: row.fullName, role: row.role, password },
        overrideAccess: true,
      });
      updated += 1;
    } else {
      await payload.create({
        collection: "users",
        data: { email: row.email, fullName: row.fullName, role: row.role, password },
        overrideAccess: true,
      });
      created += 1;
    }
  }

  const verify = await payload.find({
    collection: "users",
    limit: 10,
    where: { role: { in: ["editor", "dispatcher"] } },
    overrideAccess: true,
  });

  payload.logger.info(
    `Seed users: ${created} tạo mới, ${updated} cập nhật, ${verify.totalDocs} tài khoản editor/dispatcher.`,
  );
  await payload.destroy();
  process.exit(0);
}
