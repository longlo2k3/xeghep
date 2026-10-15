export const IDEMPOTENCY_TTL_MS = 10 * 60_000;

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type IdempotencyStore = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlMs?: number): Promise<void>;
};

type StoreEntry = { value: string; expiresAt: number };

export function createMemoryIdempotencyStore(ttlMs = IDEMPOTENCY_TTL_MS): IdempotencyStore {
  const entries = new Map<string, StoreEntry>();

  const purge = (now: number): void => {
    for (const [key, entry] of entries) {
      if (entry.expiresAt <= now) entries.delete(key);
    }
  };

  return {
    async get(key: string): Promise<string | null> {
      const now = Date.now();
      purge(now);
      const entry = entries.get(key);
      if (!entry) return null;
      if (entry.expiresAt <= now) {
        entries.delete(key);
        return null;
      }
      return entry.value;
    },
    async set(key: string, value: string, ttl?: number): Promise<void> {
      const now = Date.now();
      purge(now);
      entries.set(key, { value, expiresAt: now + (ttl ?? ttlMs) });
    },
  };
}

export async function withIdempotency<T>(
  store: IdempotencyStore,
  key: string | null | undefined,
  fn: () => T | Promise<T>,
  ttlMs?: number,
): Promise<T> {
  if (key === null || key === undefined || key === '') {
    return await fn();
  }
  if (!UUID_RE.test(key)) {
    throw new Error('INVALID_IDEMPOTENCY_KEY');
  }
  const stored = await store.get(key);
  if (stored !== null) {
    return JSON.parse(stored) as T;
  }
  const result = await fn();
  const serialized = JSON.stringify(result);
  if (serialized !== undefined) {
    await store.set(key, serialized, ttlMs);
  }
  return result;
}
