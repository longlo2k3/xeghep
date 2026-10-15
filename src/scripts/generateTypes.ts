import { loadEnv } from "payload/node";

loadEnv();

const { generateTypes } = await import("payload/node");
const configModule = await import("../payload.config");
const config = await configModule.default;

/**
 * Thay `payload generate:types` (CLI bị lỗi loader `?namespace=` với tsx trên
 * Node 24 — xem payload issue #16949). Chạy: `npm run generate:types`.
 */
await generateTypes(config);
process.exit(0);
