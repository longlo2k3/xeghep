import { describe, it, expect } from 'vitest';
import { cn } from '@/admin/lib/utils';

describe('Admin CMS Sanity Test', () => {
  it('kiểm tra môi trường Vitest hoạt động chính xác', () => {
    expect(1 + 1).toBe(2);
  });

  it('kiểm tra cấu hình hằng số môi trường và chuỗi tiếng Việt', () => {
    const appName = 'Hệ Thống Quản Trị Xe Du Lịch';
    expect(appName).toContain('Quản Trị');
  });

  it('kiểm tra resolve path alias @ hoạt động trơn tru với hàm cn', () => {
    const result = cn('font-bold', false && 'hidden', 'text-blue-500');
    expect(result).toBe('font-bold text-blue-500');
  });
});
