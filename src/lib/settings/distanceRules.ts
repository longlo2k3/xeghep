export type DistanceRangeInput = {
  label?: string | null;
  minKm?: number | null;
  maxKm?: number | null;
};

export type RangeValidation =
  | { ok: true; message: null }
  | { ok: false; message: string };

const ok = (): RangeValidation => ({ ok: true, message: null });
const fail = (message: string): RangeValidation => ({ ok: false, message });

const isIntegerKm = (value: number): boolean => Number.isInteger(value);

/**
 * FR-D07: dải km không chồng lấn, không khoảng hở — kiểm trên tập dải đã sort
 * theo minKm. Quy ước biên nguyên: dải kế tiếp phải bắt đầu đúng = max dải
 * trước + 1 (seed 0–30 / 31–100 / 101–200 / 201+). `maxKm = null` = không giới
 * hạn → phải là dải cuối cùng.
 */
export function validateDistanceRanges(rows: DistanceRangeInput[]): RangeValidation {
  const list = rows
    .filter((row) => row && typeof row.minKm === 'number')
    .map((row) => ({
      label: row.label?.trim() || `từ ${row.minKm} km`,
      minKm: row.minKm as number,
      maxKm: row.maxKm ?? null,
    }));

  for (const row of list) {
    if (!isIntegerKm(row.minKm) || row.minKm < 0) {
      return fail(`Dải "${row.label}": từ (km) phải là số nguyên dương ≥ 0.`);
    }
    if (row.maxKm != null) {
      if (!isIntegerKm(row.maxKm)) {
        return fail(`Dải "${row.label}": đến (km) phải là số nguyên.`);
      }
      if (row.maxKm <= row.minKm) {
        return fail(`Dải "${row.label}": đến (km) phải lớn hơn từ (km).`);
      }
    }
  }

  const sorted = [...list].sort((a, b) => a.minKm - b.minKm);

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const next = sorted[i];
    const prevEnd = prev.maxKm;

    if (prevEnd == null) {
      return fail(
        `Dải "${prev.label}" không giới hạn nên phải là dải cuối cùng — dải "${next.label}" chồng lấn.`,
      );
    }
    if (next.minKm <= prevEnd) {
      return fail(
        `Dải km chồng lấn: "${next.label}" (từ ${next.minKm} km) trùng với "${prev.label}" (đến ${prevEnd} km).`,
      );
    }
    if (next.minKm > prevEnd + 1) {
      return fail(
        `Dải km có khoảng hở: chưa có giá cho ${prevEnd + 1}–${next.minKm - 1} km (giữa "${prev.label}" và "${next.label}").`,
      );
    }
  }

  return ok();
}
