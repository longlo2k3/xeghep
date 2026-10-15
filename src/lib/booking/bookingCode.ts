import { randomInt } from 'node:crypto';

export const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const maxBookingCodeAttempts = 5;

export function generateBookingCode(date: Date, exists: (code: string) => boolean): string {
  const yy = String(date.getFullYear() % 100).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const datePart = `${yy}${mm}${dd}`;
  for (let attempt = 0; attempt < maxBookingCodeAttempts; attempt++) {
    let suffix = '';
    for (let i = 0; i < 6; i++) suffix += ALPHABET[randomInt(ALPHABET.length)];
    const code = `XG-${datePart}-${suffix}`;
    if (!exists(code)) return code;
  }
  throw new Error('Không sinh được mã đặt chỗ duy nhất sau 5 lần thử.');
}
