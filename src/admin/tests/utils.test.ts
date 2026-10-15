import { describe, it, expect } from 'vitest';
import { cn, formatVND, formatDateTime, maskPhone, formatFileSize, slugify, injectTocIds } from '@/admin/lib/utils';

describe('Utility Functions (admin/src/lib/utils.ts)', () => {
  describe('cn (Class Names & Tailwind Merge)', () => {
    it('kết hợp các class thông thường', () => {
      expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
    });

    it('bỏ qua các giá trị falsy và điều kiện sai', () => {
      expect(cn('btn', false && 'btn-disabled', undefined, null, 'active')).toBe('btn active');
    });

    it('hợp nhất chính xác các class Tailwind xung đột (tailwind-merge)', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });
  });

  describe('formatVND', () => {
    it('định dạng số tiền dương chính xác', () => {
      expect(formatVND(150000)).toBe('150.000 ₫');
      expect(formatVND(2500000)).toBe('2.500.000 ₫');
      expect(formatVND(10000000)).toBe('10.000.000 ₫');
    });

    it('định dạng số 0 chính xác', () => {
      expect(formatVND(0)).toBe('0 ₫');
    });

    it('định dạng số âm chính xác', () => {
      expect(formatVND(-50000)).toBe('-50.000 ₫');
    });

    it('xử lý chuỗi số hợp lệ', () => {
      expect(formatVND('150000')).toBe('150.000 ₫');
      expect(formatVND(' 350000 ')).toBe('350.000 ₫');
    });

    it('xử lý an toàn khi giá trị null, undefined hoặc rỗng', () => {
      expect(formatVND(null)).toBe('0 ₫');
      expect(formatVND(undefined)).toBe('0 ₫');
      expect(formatVND('')).toBe('0 ₫');
    });

    it('xử lý chuỗi không phải là số', () => {
      expect(formatVND('invalid')).toBe('0 ₫');
    });
  });

  describe('formatDateTime', () => {
    it('định dạng ngày giờ ISO theo giờ Việt Nam (UTC+7)', () => {
      // 08:30 UTC = 15:30 UTC+7
      const result = formatDateTime('2026-10-15T08:30:00Z');
      expect(result).toBe('15:30 15/10/2026');
    });

    it('định dạng từ đối tượng Date', () => {
      const date = new Date('2026-10-15T08:30:00Z');
      expect(formatDateTime(date)).toBe('15:30 15/10/2026');
    });

    it('trả về chuỗi rỗng khi null, undefined hoặc rỗng', () => {
      expect(formatDateTime(null)).toBe('');
      expect(formatDateTime(undefined)).toBe('');
      expect(formatDateTime('')).toBe('');
    });

    it('trả về chuỗi rỗng khi chuỗi ngày không hợp lệ', () => {
      expect(formatDateTime('invalid-date')).toBe('');
    });
  });

  describe('maskPhone', () => {
    it('mask số điện thoại 10 chữ số chuẩn: giữ 4 số đầu, 3 số cuối', () => {
      expect(maskPhone('0962298293')).toBe('0962***293');
      expect(maskPhone('0912345678')).toBe('0912***678');
    });

    it('mask số điện thoại có chứa dấu chấm, khoảng trắng hoặc dấu gạch nối', () => {
      expect(maskPhone('0962.298.293')).toBe('0962***293');
      expect(maskPhone('0962 298 293')).toBe('0962***293');
      expect(maskPhone('0962-298-293')).toBe('0962***293');
    });

    it('trả về *** khi số điện thoại quá ngắn (< 7 ký tự)', () => {
      expect(maskPhone('12345')).toBe('***');
      expect(maskPhone('123')).toBe('***');
    });

    it('trả về chuỗi rỗng khi phone là null, undefined hoặc rỗng', () => {
      expect(maskPhone(null)).toBe('');
      expect(maskPhone(undefined)).toBe('');
      expect(maskPhone('')).toBe('');
    });
  });

  describe('formatFileSize', () => {
    it('định dạng kích thước bytes chính xác', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(null)).toBe('0 B');
      expect(formatFileSize(undefined)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1048576)).toBe('1.0 MB');
      expect(formatFileSize(2621440)).toBe('2.5 MB');
    });
  });

  describe('slugify', () => {
    it('chuyển đổi chuỗi tiếng Việt có dấu thành slug không dấu chuẩn', () => {
      expect(slugify('Hải Phòng - Hà Nội')).toBe('hai-phong-ha-noi');
      expect(slugify('Bảng giá xe ghép mới nhất 2026')).toBe('bang-gia-xe-ghep-moi-nhat-2026');
      expect(slugify('Đi Xe Ghép Tiết Kiệm & An Toàn')).toBe('di-xe-ghep-tiet-kiem-an-toan');
    });

    it('loại bỏ ký tự đặc biệt và dấu gạch nối thừa', () => {
      expect(slugify('---Xe ghép??? Đón tận nơi!---')).toBe('xe-ghep-don-tan-noi');
    });

    it('xử lý an toàn khi chuỗi rỗng', () => {
      expect(slugify('')).toBe('');
    });
  });

  describe('injectTocIds', () => {
    it('tự động gắn id chuẩn SEO vào các thẻ h2 chưa có id', () => {
      const html = '<h2>Lợi ích đi xe ghép</h2><p>Nội dung</p><h2>Bảng giá cước</h2>';
      const { html: resultHtml, toc } = injectTocIds(html);

      expect(resultHtml).toContain('<h2 id="loi-ich-di-xe-ghep">Lợi ích đi xe ghép</h2>');
      expect(resultHtml).toContain('<h2 id="bang-gia-cuoc">Bảng giá cước</h2>');
      expect(toc).toEqual([
        { id: 'loi-ich-di-xe-ghep', text: 'Lợi ích đi xe ghép', level: 2 },
        { id: 'bang-gia-cuoc', text: 'Bảng giá cước', level: 2 },
      ]);
    });

    it('tự sinh hậu tố -2, -3 khi có các thẻ h2 trùng tên', () => {
      const html = '<h2>Tổng quan</h2><p>...</p><h2>Tổng quan</h2>';
      const { html: resultHtml, toc } = injectTocIds(html);

      expect(resultHtml).toContain('<h2 id="tong-quan">Tổng quan</h2>');
      expect(resultHtml).toContain('<h2 id="tong-quan-2">Tổng quan</h2>');
      expect(toc[0].id).toBe('tong-quan');
      expect(toc[1].id).toBe('tong-quan-2');
    });

    it('xử lý chuỗi rỗng an toàn', () => {
      expect(injectTocIds('')).toEqual({ html: '', toc: [] });
      expect(injectTocIds(null)).toEqual({ html: '', toc: [] });
    });
  });
});

