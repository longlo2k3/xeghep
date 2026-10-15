import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Định dạng số tiền VND.
 * Ví dụ: 150000 -> "150.000 ₫"
 */
export function formatVND(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0 ₫';
  const num = typeof value === 'number' ? value : Number(String(value).trim());
  if (isNaN(num)) return '0 ₫';
  return `${new Intl.NumberFormat('vi-VN').format(num)} ₫`;
}

/**
 * Định dạng ngày giờ theo múi giờ Việt Nam (Asia/Ho_Chi_Minh).
 * Ví dụ: "15:30 15/10/2026"
 */
export function formatDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

/**
 * Mask số điện thoại bảo mật cho vai trò Editor (giữ 4 số đầu, 3 số cuối).
 * Ví dụ: "0962298293" -> "0962***293"
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length >= 7) {
    return `${digits.slice(0, 4)}***${digits.slice(-3)}`;
  }
  if (trimmed.length >= 7) {
    return `${trimmed.slice(0, 4)}***${trimmed.slice(-3)}`;
  }
  return '***';
}

/**
 * Định dạng kích thước tệp tin (bytes -> B / KB / MB / GB).
 * Ví dụ: 125000 -> "122.1 KB", 1048576 -> "1.0 MB"
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const unitIndex = Math.min(Math.max(i, 0), units.length - 1);
  const formatted = (bytes / Math.pow(1024, unitIndex)).toFixed(unitIndex === 0 ? 0 : 1);
  return `${formatted} ${units[unitIndex]}`;
}

/**
 * Slugify tiếng Việt chuẩn SEO: bỏ dấu, đ/Đ -> d, chữ thường, ký tự lạ -> '-', gộp '-', bỏ '-' đầu/cuối.
 */
export function slugify(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Xử lý gắn id tự động cho các thẻ <h2> trong nội dung HTML phục vụ Mục lục (TOC).
 */
export function injectTocIds(html: string | null | undefined): {
  html: string;
  toc: Array<{ id: string; text: string; level: number }>;
} {
  if (!html) return { html: '', toc: [] };

  const toc: Array<{ id: string; text: string; level: number }> = [];
  const used = new Set<string>();

  const output = html.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (_match, _attrs: string | undefined, inner: string) => {
    const text = inner.replace(/<[^>]*>/g, '').trim();
    const base = slugify(text) || `phan-${toc.length + 1}`;
    let id = base;
    let suffix = 2;
    while (used.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    used.add(id);
    toc.push({ id, text, level: 2 });
    return `<h2 id="${id}">${inner}</h2>`;
  });

  return { html: output, toc };
}

