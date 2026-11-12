import { createHash } from 'node:crypto';

import type { Payload } from 'payload';

let payloadPromise: Promise<Payload> | null = null;

export async function getPayloadInstance(): Promise<Payload> {
  if (!payloadPromise) {
    const init = (async () => {
      const { getPayload } = await import('payload');
      const { default: config } = await import('../../payload.config');
      return getPayload({ config });
    })();
    // Không reset cache khi init thất bại thì mọi request sau đó ném mãi lỗi của
    // lần khởi động đầu tiên (vd DB chưa lên kịp), dù DB đã healthy trở lại.
    payloadPromise = init.catch((err: unknown) => {
      payloadPromise = null;
      throw err;
    });
  }
  return payloadPromise;
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return 'unknown';
}

export function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + (process.env.IP_SALT ?? 'dev-ip-salt'))
    .digest('hex');
}
