const DAY_MS = 86_400_000;

const vnDayIso = (date: Date): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const toDisplayDate = (dayIso: string): string => {
  const [year, month, day] = dayIso.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * T040 / FR-C07 / D12: cảnh báo admin cho `priceValidUntil` —
 *   - null  → "Chưa đặt ngày hiệu lực giá…" (không bỏ qua)
 *   - quá hạn → "Đã hết hạn (dd/mm/yyyy)…"
 *   - còn ≤ 30 ngày → "Sắp hết hạn — còn N ngày…"
 *   - còn > 30 ngày → null (không cảnh báo)
 * Giá trị tính lúc đọc, không lưu (virtual).
 */
export function priceValidUntilWarning(
  value: string | Date | null | undefined,
  now: Date = new Date(),
): string | null {
  if (value == null || value === '') {
    return 'Chưa đặt ngày hiệu lực giá — Marketer cần cập nhật "Giá còn hiệu lực đến".';
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Ngày hiệu lực giá không hợp lệ — Marketer cần kiểm tra lại "Giá còn hiệu lực đến".';
  }

  const today = vnDayIso(now);
  const target = vnDayIso(parsed);
  const days = Math.round((Date.parse(target) - Date.parse(today)) / DAY_MS);

  if (days < 0) {
    return `Đã hết hạn (${toDisplayDate(target)}) — Marketer cần cập nhật "Giá còn hiệu lực đến" ngay.`;
  }
  if (days === 0) {
    return `Sắp hết hạn — giá hết hạn hôm nay (${toDisplayDate(target)}).`;
  }
  if (days <= 30) {
    return `Sắp hết hạn — còn ${days} ngày (${toDisplayDate(target)}). Marketer nên cập nhật giá mới.`;
  }
  return null;
}
