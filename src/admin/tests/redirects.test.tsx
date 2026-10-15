import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RedirectList } from '@/admin/features/redirects/RedirectList';
import { RedirectFormModal } from '@/admin/features/redirects/RedirectFormModal';
import { SitemapMonitor } from '@/admin/features/seo/SitemapMonitor';
import { apiClient } from '@/admin/lib/api-client';
import type { RedirectDoc } from '@/admin/types/redirects';

// Mock apiClient
vi.mock('@/admin/lib/api-client', async () => {
  const actual = await vi.importActual<typeof import('@/admin/lib/api-client')>('@/admin/lib/api-client');
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

const mockRedirects: RedirectDoc[] = [
  {
    id: 1,
    fromUrl: '/tuyen-xe-cu-1',
    toUrl: '/tuyen-ha-noi-thai-nguyen',
    statusCode: '301',
    source: 'auto_slug_change',
    isActive: true,
    note: 'Đổi slug tuyến đường',
    createdAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 2,
    fromUrl: '/khuyen-mai-2025',
    toUrl: '/bang-gia',
    statusCode: '302',
    source: 'manual',
    isActive: true,
    note: 'Chuyển hướng tạm thời',
    createdAt: '2026-10-02T00:00:00Z',
  },
  {
    id: 3,
    fromUrl: '/bai-viet-cu-da-xoa',
    toUrl: null,
    statusCode: '410',
    source: 'manual',
    isActive: false,
    note: 'Hủy hoàn toàn',
    createdAt: '2026-10-03T00:00:00Z',
  },
];

const mockSitemap = [
  { path: '/', lastmod: '2026-10-10T00:00:00Z', type: 'page' as const },
  { path: '/gioi-thieu', lastmod: '2026-10-10T00:00:00Z', type: 'page' as const },
  { path: '/tuyen-ha-noi-thai-nguyen', lastmod: '2026-10-10T00:00:00Z', type: 'route' as const },
  { path: '/tin-tuc/kinh-nghiem-di-xe', lastmod: '2026-10-10T00:00:00Z', type: 'article' as const },
];

describe('Redirects & SEO Module (Task T119)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RedirectList Component', () => {
    it('hiển thị danh sách chuyển hướng từ API kèm mã trạng thái 301/302/410 và nguồn tạo', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { docs: mockRedirects, totalDocs: mockRedirects.length },
      });

      render(
        <MemoryRouter>
          <RedirectList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/redirects', expect.any(Object));
      });

      expect(screen.getByText('/tuyen-xe-cu-1')).toBeDefined();
      expect(screen.getByText('/tuyen-ha-noi-thai-nguyen')).toBeDefined();
      expect(screen.getByText(/301 Permanent/i)).toBeDefined();
      expect(screen.getByText(/Tự đổi slug/i)).toBeDefined();

      expect(screen.getByText('/khuyen-mai-2025')).toBeDefined();
      expect(screen.getByText(/302 Temporary/i)).toBeDefined();

      expect(screen.getByText('/bai-viet-cu-da-xoa')).toBeDefined();
      expect(screen.getAllByText(/410 Gone/i).length).toBeGreaterThanOrEqual(1);
    });

    it('mở ConfirmDialog và gọi DELETE /api/redirects/:id khi xác nhận xóa', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { docs: mockRedirects, totalDocs: mockRedirects.length },
      });
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { message: 'Deleted' } });

      render(
        <MemoryRouter>
          <RedirectList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('/tuyen-xe-cu-1')).toBeDefined();
      });

      const deleteButtons = screen.getAllByTitle('Xóa chuyển hướng');
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText(/Xác nhận xóa quy tắc chuyển hướng/i)).toBeDefined();

      const confirmDeleteBtn = screen.getByRole('button', { name: /Xác nhận xóa/i });
      fireEvent.click(confirmDeleteBtn);

      await waitFor(() => {
        expect(apiClient.delete).toHaveBeenCalledWith('/redirects/1');
      });
    });
  });

  describe('RedirectFormModal Component', () => {
    it('cảnh báo lỗi và chặn submit khi from === to (vòng lặp chuyển hướng)', async () => {
      render(
        <RedirectFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      const fromInput = screen.getByLabelText(/Đường dẫn nguồn/i);
      const toInput = screen.getByLabelText(/Đường dẫn đích/i);

      fireEvent.change(fromInput, { target: { value: '/tuyen-ha-noi-thai-nguyen' } });
      fireEvent.change(toInput, { target: { value: '/tuyen-ha-noi-thai-nguyen' } });

      const submitBtn = screen.getByRole('button', { name: /Tạo chuyển hướng/i });
      fireEvent.submit(submitBtn.closest('form')!);

      await waitFor(() => {
        expect(
          screen.getByText(/Đường dẫn nguồn và đích không được trùng nhau/i)
        ).toBeDefined();
      });
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('gọi POST /api/redirects khi tạo mới chuyển hướng hợp lệ', async () => {
      const onSuccess = vi.fn();
      const onClose = vi.fn();

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          doc: {
            id: 99,
            fromUrl: '/duong-dan-cu',
            toUrl: '/duong-dan-moi',
            statusCode: '301',
            isActive: true,
          },
        },
      });

      render(
        <RedirectFormModal
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      );

      const fromInput = screen.getByLabelText(/Đường dẫn nguồn/i);
      const toInput = screen.getByLabelText(/Đường dẫn đích/i);

      fireEvent.change(fromInput, { target: { value: '/duong-dan-cu' } });
      fireEvent.change(toInput, { target: { value: '/duong-dan-moi' } });

      const submitBtn = screen.getByRole('button', { name: /Tạo chuyển hướng/i });
      fireEvent.submit(submitBtn.closest('form')!);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/redirects',
          expect.objectContaining({
            fromUrl: '/duong-dan-cu',
            toUrl: '/duong-dan-moi',
            statusCode: '301',
          })
        );
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('gọi PATCH /api/redirects/:id khi chỉnh sửa chuyển hướng hiện có', async () => {
      const onSuccess = vi.fn();
      const onClose = vi.fn();

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: {
          doc: {
            id: 1,
            fromUrl: '/tuyen-xe-cu-1',
            toUrl: '/tuyen-xe-cap-nhat',
            statusCode: '302',
            isActive: true,
          },
        },
      });

      render(
        <RedirectFormModal
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
          redirectDoc={mockRedirects[0]}
        />
      );

      const toInput = screen.getByLabelText(/Đường dẫn đích/i);
      fireEvent.change(toInput, { target: { value: '/tuyen-xe-cap-nhat' } });

      const submitBtn = screen.getByRole('button', { name: /Lưu thay đổi/i });
      fireEvent.submit(submitBtn.closest('form')!);

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith(
          '/redirects/1',
          expect.objectContaining({
            toUrl: '/tuyen-xe-cap-nhat',
          })
        );
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('SitemapMonitor Component', () => {
    it('gọi GET /api/v1/seo/sitemap và hiển thị danh sách URL sitemap cùng phân loại', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { success: true, data: mockSitemap },
      });

      render(
        <MemoryRouter>
          <SitemapMonitor />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/v1/seo/sitemap');
      });

      expect(screen.getByText('/')).toBeDefined();
      expect(screen.getByText('/gioi-thieu')).toBeDefined();
      expect(screen.getByText('/tuyen-ha-noi-thai-nguyen')).toBeDefined();
      expect(screen.getByText('/tin-tuc/kinh-nghiem-di-xe')).toBeDefined();

      // Kiểm tra badges phân loại
      expect(screen.getAllByText(/Trang \(Page\)/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Tuyến xe \(Route\)/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Bài viết \(Article\)/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('RedirectList Tabs Integration', () => {
    it('chuyển đổi tab giữa Danh sách chuyển hướng và Giám sát Sitemap', async () => {
      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: { docs: mockRedirects } })
        .mockResolvedValueOnce({ data: { success: true, data: mockSitemap } });

      render(
        <MemoryRouter>
          <RedirectList />
        </MemoryRouter>
      );

      expect(screen.getByText(/Chuyển hướng 301 & Giám sát SEO/i)).toBeDefined();

      // Nhấp sang tab Giám sát Sitemap
      const sitemapTabBtn = screen.getByRole('button', { name: /Giám sát Sitemap/i });
      fireEvent.click(sitemapTabBtn);

      await waitFor(() => {
        expect(screen.getByText(/Tổng URL Index/i)).toBeDefined();
      });
    });
  });
});
