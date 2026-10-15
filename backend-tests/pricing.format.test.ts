import { describe, expect, it } from 'vitest';
import { formatTier, shortK, vnd } from '../src/lib/pricing/formatTier';
import type { PriceTier } from '../src/lib/pricing/types';

const fixed400: PriceTier = { min: 400000, max: null, from: false, negotiable: false };
const range250to300: PriceTier = { min: 250000, max: 300000, from: false, negotiable: false };
const from899: PriceTier = { min: 899000, max: null, from: true, negotiable: false };
const negotiable: PriceTier = { min: null, max: null, from: false, negotiable: true };
const nullMin: PriceTier = { min: null, max: null, from: false, negotiable: false };

describe('vnd / shortK', () => {
  it('formats 400000 as 400.000đ and 400k', () => {
    expect(vnd(400000)).toBe('400.000đ');
    expect(shortK(400000)).toBe('400k');
  });

  it('formats 1500000 as 1.500k in short style', () => {
    expect(shortK(1500000)).toBe('1.500k');
    expect(vnd(1500000)).toBe('1.500.000đ');
  });
});

describe('formatTier', () => {
  it('fixed price: full 400.000đ / short 400k', () => {
    expect(formatTier(fixed400, 'full')).toBe('400.000đ');
    expect(formatTier(fixed400, 'short')).toBe('400k');
  });

  it('range: full 250.000đ – 300.000đ / short 250k – 300k', () => {
    expect(formatTier(range250to300, 'full')).toBe('250.000đ – 300.000đ');
    expect(formatTier(range250to300, 'short')).toBe('250k – 300k');
  });

  it('from tier: full từ 899.000đ / short từ 899k', () => {
    expect(formatTier(from899, 'full')).toBe('từ 899.000đ');
    expect(formatTier(from899, 'short')).toBe('từ 899k');
  });

  it('negotiable or null min → Liên hệ thỏa thuận in both styles', () => {
    expect(formatTier(negotiable, 'full')).toBe('Liên hệ thỏa thuận');
    expect(formatTier(negotiable, 'short')).toBe('Liên hệ thỏa thuận');
    expect(formatTier(nullMin, 'full')).toBe('Liên hệ thỏa thuận');
    expect(formatTier(nullMin, 'short')).toBe('Liên hệ thỏa thuận');
  });

  it('defaults to full style', () => {
    expect(formatTier(fixed400)).toBe('400.000đ');
  });
});
