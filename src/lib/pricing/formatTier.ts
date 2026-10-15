import type { PriceTier } from './types';

export const vnd = (n: number) => `${new Intl.NumberFormat('vi-VN').format(n)}đ`;
export const shortK = (n: number) => `${new Intl.NumberFormat('vi-VN').format(n / 1000)}k`;

export function formatTier(t: PriceTier, style: 'short' | 'full' = 'full'): string {
  if (t.negotiable || t.min == null) return 'Liên hệ thỏa thuận';
  const f = style === 'short' ? shortK : vnd;
  if (t.max != null) return `${f(t.min)} – ${f(t.max)}`;
  return t.from ? `từ ${f(t.min)}` : f(t.min);
}
