import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PageList } from '@/admin/features/pages/PageList';
import { PageForm } from '@/admin/features/pages/PageForm';
import { apiClient } from '@/admin/lib/api-client';
import type { PageDoc } from '@/admin/types/pages';

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

const mockPages: PageDoc[] = [
  {
    id: 1,
    title: 'Trang chủ Xe Ghép Liên Tỉnh',
    slug: 'home',
    kind: 'system',
    status: 'published',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
    seo: {
      metaTitle: 'Đặt Xe Ghép Giá Rẻ - Đón Trả Tận Nơi',
      appendBrand: true,
      metaDescription: 'Dịch vụ xe ghép liên tỉnh giá rẻ nhất miền Bắc.',
      noindex: false,
    },
  },
  {
    id: 2,
    title: 'Giới thiệu về Xe Ghép Liên Tỉnh',
    slug: 'gioi-thieu',
    kind: 'system',
    status: 'published',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
    seo: {
      metaTitle: 'Giới thiệu về chúng tôi',
      appendBrand: true,
      metaDescription: 'Thông tin đội ngũ và cam kết chất lượng xe ghép.',
      noindex: false,
    },
  },
  {
    id: 3,
    title: 'Chính sách bảo mật thông tin',
    slug: 'chinh-sach/bao-mat',
    kind: 'content',
    contentHtml: '<h2>1. Thu thập thông tin</h2><p>Quy định bảo mật thông tin khách hàng...</p>',
    status: 'published',
    createdAt: '2026-10-02T00:00:00Z',
    updatedAt: '2026-10-02T00:00:00Z',
    seo: {
      metaTitle: 'Chính sách bảo mật',
      appendBrand: true,
      metaDescription: 'Cam kết bảo mật dữ liệu khách hàng tuyệt đối.',
      noindex: false,
    },
  },
  {
    id: 4,
    title: 'Điều khoản và điều kiện đặt xe',
    slug: 'chinh-sach/dieu-khoan',
    kind: 'content',
    contentHtml: '<h2>1. Điều kiện sử dụng</h2><p>Các điều khoản ràng buộc khi đặt xe...</p>',
    status: 'draft',
    createdAt: '2026-10-03T00:00:00Z',
    updatedAt: '2026-10-03T00:00:00Z',
  },
];

describe('Pages Module (Task T113)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PageList Component', () => {
    it('hiển thị danh sách trang, phân biệt badge Hệ thống và Nội dung', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          docs: mockPages,
          totalDocs: 4,
          totalPages: 1,
          page: 1,
          limit: 100,
        },
      });

      render(
        <MemoryRouter>
          <PageList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Trang chủ Xe Ghép Liên Tỉnh')).toBeDefined();
      });

      expect(screen.getByText('Giới thiệu về Xe Ghép Liên Tỉnh')).toBeDefined();
      expect(screen.getByText('Chính sách bảo mật thông tin')).toBeDefined();

      // Kiểm tra badges loại trang
      expect(screen.getByTestId('page-kind-badge-1')).toBeDefined();
      expect(screen.getByTestId('page-kind-badge-3')).toBeDefined();

      // Nút Tạo trang mới
      expect(screen.getByTestId('create-page-btn')).toBeDefined();
    });

    it('bảo vệ trang hệ thống: vô hiệu hóa (disable) nút Xóa đối với kind=system và cho phép xóa kind=content', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          docs: mockPages,
          totalDocs: 4,
          totalPages: 1,
          page: 1,
          limit: 100,
        },
      });
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { success: true } });

      render(
        <MemoryRouter>
          <PageList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('delete-page-1')).toBeDefined();
      });

      // Trang 1 là kind='system' -> Nút Xóa bị disabled kèm title cảnh báo
      const deleteSystemBtn = screen.getByTestId('delete-page-1') as HTMLButtonElement;
      expect(deleteSystemBtn.disabled).toBe(true);
      expect(deleteSystemBtn.getAttribute('title')).toBe('Không thể xóa trang hệ thống cốt lõi');

      // Trang 3 là kind='content' -> Nút Xóa được bật
      const deleteContentBtn = screen.getByTestId('delete-page-3') as HTMLButtonElement;
      expect(deleteContentBtn.disabled).toBe(false);

      // Click nút Xóa trang 3 -> hiện ConfirmDialog
      fireEvent.click(deleteContentBtn);
      expect(screen.getByText('Xác nhận xóa trang nội dung')).toBeDefined();

      // Xác nhận xóa
      const confirmBtn = screen.getByRole('button', { name: 'Xóa trang' });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(apiClient.delete).toHaveBeenCalledWith('/pages/3');
      });
    });

    it('lọc danh sách trang theo loại (kind=system / kind=content)', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          docs: mockPages,
          totalDocs: 4,
          totalPages: 1,
          page: 1,
          limit: 100,
        },
      });

      render(
        <MemoryRouter>
          <PageList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Trang chủ Xe Ghép Liên Tỉnh')).toBeDefined();
      });

      const kindSelect = screen.getByTestId('filter-kind-select');

      // Lọc chọn chỉ trang hệ thống
      fireEvent.change(kindSelect, { target: { value: 'system' } });
      expect(screen.getByText('Trang chủ Xe Ghép Liên Tỉnh')).toBeDefined();
      expect(screen.getByText('Giới thiệu về Xe Ghép Liên Tỉnh')).toBeDefined();
      expect(screen.queryByText('Chính sách bảo mật thông tin')).toBeNull();

      // Lọc chọn chỉ trang nội dung
      fireEvent.change(kindSelect, { target: { value: 'content' } });
      expect(screen.getByText('Chính sách bảo mật thông tin')).toBeDefined();
      expect(screen.queryByText('Trang chủ Xe Ghép Liên Tỉnh')).toBeNull();
    });
  });

  describe('PageForm Component', () => {
    it('bảo vệ trang hệ thống: khóa slug và kind ở chế độ Read-Only, ẩn trình soạn thảo nội dung', async () => {
      const systemPage = mockPages[0]; // kind='system', slug='home'

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { doc: systemPage },
      });

      render(
        <MemoryRouter initialEntries={['/pages/1']}>
          <Routes>
            <Route path="/pages/:id" element={<PageForm />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue(systemPage.title)).toBeDefined();
      });

      // Kiểm tra banner thông tin trang hệ thống
      expect(screen.getByTestId('system-page-banner')).toBeDefined();

      // Slug bị vô hiệu hóa (disabled / read-only)
      const slugInput = screen.getByTestId('page-slug-input') as HTMLInputElement;
      expect(slugInput.disabled).toBe(true);
      expect(slugInput.value).toBe('home');

      // Kind input bị disabled
      const kindInput = screen.getByTestId('page-kind-input') as HTMLInputElement;
      expect(kindInput.disabled).toBe(true);

      // Không hiển thị editor soạn thảo nội dung (vì giao diện nằm ở code frontend)
      expect(screen.queryByTestId('rich-editor-visual')).toBeNull();
    });

    it('cho phép chỉnh sửa tiêu đề và cấu hình SEO cho trang hệ thống và gọi PATCH /pages/:id', async () => {
      const systemPage = mockPages[0];

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { doc: systemPage },
      });
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { doc: { ...systemPage, title: 'Trang chủ Xe Ghép Mới' } },
      });

      render(
        <MemoryRouter initialEntries={['/pages/1']}>
          <Routes>
            <Route path="/pages/:id" element={<PageForm />} />
            <Route path="/pages" element={<div>Danh sách trang</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title-input')).toBeDefined();
      });

      // Sửa tiêu đề trang
      fireEvent.change(screen.getByTestId('page-title-input'), {
        target: { value: 'Trang chủ Xe Ghép Mới' },
      });

      // Sửa SEO title
      fireEvent.change(screen.getByTestId('seo-title-input'), {
        target: { value: 'Xe Ghép Hà Nội - Giá Cực Tốt' },
      });

      // Nhấn Lưu bản nháp
      fireEvent.click(screen.getByTestId('save-draft-btn'));

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith(
          '/pages/1',
          expect.objectContaining({
            title: 'Trang chủ Xe Ghép Mới',
            status: 'draft',
            seo: expect.objectContaining({
              metaTitle: 'Xe Ghép Hà Nội - Giá Cực Tốt',
            }),
          })
        );
      });
    });

    it('cho phép tạo trang nội dung chính sách mới (kind=content) với đầy đủ RichTextEditor và gọi POST /pages', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { doc: { id: 5, title: 'Chính sách hoàn tiền' } },
      });

      render(
        <MemoryRouter initialEntries={['/pages/new']}>
          <Routes>
            <Route path="/pages/new" element={<PageForm />} />
            <Route path="/pages" element={<div>Danh sách trang</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Điền tiêu đề trang
      fireEvent.change(screen.getByTestId('page-title-input'), {
        target: { value: 'Chính sách hoàn tiền và hủy chuyến' },
      });

      // Tự sinh slug
      const slugInput = screen.getByTestId('page-slug-input') as HTMLInputElement;
      expect(slugInput.value).toBe('chinh-sach-hoan-tien-va-huy-chuyen');

      // Chỉnh sửa slug có chứa dấu '/' theo đặc thù phân cấp
      fireEvent.change(slugInput, {
        target: { value: 'chinh-sach/hoan-tien' },
      });

      // Soạn thảo nội dung chính sách qua RichTextEditor
      const editorVisual = screen.getByTestId('rich-editor-visual');
      fireEvent.input(editorVisual, {
        target: { innerHTML: '<h2>Quy định hoàn tiền</h2><p>Hành khách được hoàn 100% nếu báo trước 2 tiếng.</p>' },
      });

      // Nhấn Xuất bản ngay
      fireEvent.click(screen.getByTestId('publish-btn'));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/pages',
          expect.objectContaining({
            title: 'Chính sách hoàn tiền và hủy chuyến',
            slug: 'chinh-sach/hoan-tien',
            kind: 'content',
            status: 'published',
            contentHtml: expect.stringContaining('Quy định hoàn tiền'),
          })
        );
      });
    });
  });
});
