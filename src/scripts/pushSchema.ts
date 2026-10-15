import { loadEnv } from "payload/node";

(process.env as Record<string, string | undefined>).NODE_ENV = "development";
process.env.PAYLOAD_DB_PUSH = "true";
loadEnv();

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config");

/**
 * Dev schema push: Payload/Postgres tự push schema khi connect ở môi trường
 * không phải production (adapter `push` mặc định). `payload db:push` không tồn
 * tại ở payload 3.90 → dùng script này.
 *
 * Chạy bằng `node --import tsx` (không dùng `payload run` — bị lỗi loader
 * `?namespace=` với tsx trên Node 24, xem payload issue #16949).
 */
const payload = await getPayload({ config });
payload.logger.info("Schema push hoàn tất (dev push on connect).");
await payload.destroy();
process.exit(0);
