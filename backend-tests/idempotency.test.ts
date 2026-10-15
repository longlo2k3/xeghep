import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createMemoryIdempotencyStore,
  withIdempotency,
} from '../src/lib/api/idempotency';

const UUID = '123e4567-e89b-42d3-a456-426614174000';

afterEach(() => {
  vi.useRealTimers();
});

describe('withIdempotency', () => {
  it('runs fn on first call and returns stored result on second call', async () => {
    const store = createMemoryIdempotencyStore();
    let calls = 0;
    const fn = async () => {
      calls += 1;
      return { bookingCode: 'XG-261009-ABC123', attempt: calls };
    };

    const first = await withIdempotency(store, UUID, fn);
    const second = await withIdempotency(store, UUID, fn);

    expect(calls).toBe(1);
    expect(first).toEqual({ bookingCode: 'XG-261009-ABC123', attempt: 1 });
    expect(second).toEqual(first);
  });

  it('uses a different key to run fn again', async () => {
    const store = createMemoryIdempotencyStore();
    let calls = 0;
    const fn = () => ++calls;
    await withIdempotency(store, '123e4567-e89b-42d3-a456-426614174000', fn);
    await withIdempotency(store, '123e4567-e89b-42d3-a456-426614174001', fn);
    expect(calls).toBe(2);
  });

  it('expires stored value after the store ttl', async () => {
    vi.useFakeTimers();
    const store = createMemoryIdempotencyStore(1_000);
    let calls = 0;
    const fn = () => ++calls;

    expect(await withIdempotency(store, UUID, fn)).toBe(1);
    vi.advanceTimersByTime(1_500);
    expect(await withIdempotency(store, UUID, fn)).toBe(2);
  });

  it('keeps stored value before the store ttl', async () => {
    vi.useFakeTimers();
    const store = createMemoryIdempotencyStore(10 * 60_000);
    let calls = 0;
    const fn = () => ++calls;

    expect(await withIdempotency(store, UUID, fn)).toBe(1);
    vi.advanceTimersByTime(9 * 60_000);
    expect(await withIdempotency(store, UUID, fn)).toBe(1);
  });

  it('honours per-call ttl override', async () => {
    vi.useFakeTimers();
    const store = createMemoryIdempotencyStore(10 * 60_000);
    let calls = 0;
    const fn = () => ++calls;

    expect(await withIdempotency(store, UUID, fn, 500)).toBe(1);
    vi.advanceTimersByTime(600);
    expect(await withIdempotency(store, UUID, fn, 500)).toBe(2);
  });

  it('throws INVALID_IDEMPOTENCY_KEY for a non-UUID key without running fn', async () => {
    const store = createMemoryIdempotencyStore();
    let calls = 0;
    await expect(withIdempotency(store, 'not-a-uuid', () => ++calls)).rejects.toThrow(
      'INVALID_IDEMPOTENCY_KEY',
    );
    await expect(withIdempotency(store, '123e4567', () => ++calls)).rejects.toThrow(
      'INVALID_IDEMPOTENCY_KEY',
    );
    expect(calls).toBe(0);
  });

  it('runs fn on every call when no key is given', async () => {
    const store = createMemoryIdempotencyStore();
    let calls = 0;
    const fn = () => ++calls;

    expect(await withIdempotency(store, undefined, fn)).toBe(1);
    expect(await withIdempotency(store, null, fn)).toBe(2);
    expect(await withIdempotency(store, undefined, fn)).toBe(3);
    expect(calls).toBe(3);
  });

  it('propagates fn errors without storing a value', async () => {
    const store = createMemoryIdempotencyStore();
    let calls = 0;
    await expect(
      withIdempotency(store, UUID, () => {
        calls += 1;
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
    const result = await withIdempotency(store, UUID, () => ++calls);
    expect(calls).toBe(2);
    expect(result).toBe(2);
  });
});
