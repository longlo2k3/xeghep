import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ArticleList } from '@/admin/features/articles/ArticleList';
import { ArticleForm } from '@/admin/features/articles/ArticleForm';
import { apiClient } from '@/admin/lib/api-client';
import type { ArticleDoc } from '@/admin/types/articles';
import type { MediaDoc } from '@/admin/types/media';

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

const mockMedia: MediaDoc = {
  id: 101,
  filename: 'xe-ghep-noi-bai.webp',
  alt: 'Xe ghép Nội Bài đón tận nơi',
  caption: 'Đưa đón sân bay',
  url: '/media/xe-ghep-noi-bai.webp',
  thumbnailURL: '/media/xe-ghep-noi-bai-thumb.webp',
  width: 1200,
  height: 800,
  filesize: 120000,
  mimeType: 'image/webp',
  createdAt: '2026-10-10T08:00:00Z',
  updatedAt: '2026-10-10T08:00:00Z',
};

const mockArticles: ArticleDoc[] = [
  {
    id: 1,
    title: 'Kinh nghiệm đi xe ghép Hà Nội Hải Phòng tiết kiệm',
    slug: 'kinh-nghiem-di-xe-ghep-ha-noi-hai-phong',
    category: 'kinh-nghiem',
    excerpt: 'Tổng hợp mẹo và kinh nghiệm đi xe ghép an toàn, giá rẻ.',
    content: '<p>Nội dung kinh nghiệm đi xe ghép...</p>',
    contentHtml: '<p>Nội dung kinh nghiệm đi xe ghép...</p>',
    author: 'Xe Ghép Liên Tỉnh',
    featuredImage: mockMedia,
    status: 'published',
    publishedAt: '2026-10-01T10:00:00Z',
    createdAt: '2026-10-01T09:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
    seo: {
      metaTitle: 'Kinh nghiệm đi xe ghép Hà Nội Hải Phòng',
      appendBrand: true,
      metaDescription: 'Mẹo đi xe ghép an toàn',
      noindex: false,
    },
  },
  {
    id: 2,
    title: 'Báo giá tuyến Hà Nội đi Quảng Ninh mới nhất 2026',
    slug: 'bao-gia-tuyen-ha-noi-quang-ninh-2026',
    category: 'tin-tuyen',
    excerpt: 'Cập nhật bảng giá xe ghép Hà Nội Quảng Ninh chi tiết từng loại xe.',
    content: '<p>Bảng giá cước xe ghép các tuyến liên tỉnh...</p>',
    contentHtml: '<p>Bảng giá cước xe ghép các tuyến liên tỉnh...</p>',
    author: 'Ban Biên Tập',
    featuredImage: mockMedia,
    status: 'draft',
    publishedAt: null,
    createdAt: '2026-10-05T09:00:00Z',
    updatedAt: '2026-10-05T09:00:00Z',
  },
  {
    id: 3,
    title: 'Ưu đãi giảm 20% đón trả sân bay Nội Bài cuối tuần',
    slug: 'uu-dai-giam-20-san-bay-noi-bai',
    category: 'khuyen-mai',
    excerpt: 'Chương trình khuyến mãi giảm giá cước đưa đón sân bay.',
    content: '<p>Chi tiết ưu đãi xe ghép sân bay...</p>',
    contentHtml: '<p>Chi tiết ưu đãi xe ghép sân bay...</p>',
    author: 'Marketing Team',
    featuredImage: mockMedia,
    status: 'published',
    publishedAt: '2026-10-08T08:00:00Z',
    createdAt: '2026-10-08T07:00:00Z',
    updatedAt: '2026-10-08T08:00:00Z',
  },
];

describe('Articles Module (Task T112)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ArticleList Component', () => {
    it('hiển thị danh sách bài viết từ API và render badge danh mục tiếng Việt', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          docs: mockArticles,
          totalDocs: 3,
          totalPages: 1,
          page: 1,
          limit: 100,
        },
      });

      render(
        <MemoryRouter>
          <ArticleList />
        </MemoryRouter>
      );

      // Chờ API hoàn tất
      await waitFor(() => {
        expect(screen.getByText('Kinh nghiệm đi xe ghép Hà Nội Hải Phòng tiết kiệm')).toBeDefined();
      });

      expect(screen.getByText('Báo giá tuyến Hà Nội đi Quảng Ninh mới nhất 2026')).toBeDefined();
      expect(screen.getByText('Ưu đãi giảm 20% đón trả sân bay Nội Bài cuối tuần')).toBeDefined();

      // Kiểm tra Badge danh mục tiếng Việt
      expect(screen.getAllByText('Kinh nghiệm').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Tin tuyến').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Khuyến mãi').length).toBeGreaterThanOrEqual(1);

      // Kiểm tra nút Viết bài mới
      expect(screen.getByTestId('create-article-btn')).toBeDefined();
    });

    it('lọc bài viết theo danh mục (category)', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          docs: mockArticles,
          totalDocs: 3,
          totalPages: 1,
          page: 1,
          limit: 100,
        },
      });

      render(
        <MemoryRouter>
          <ArticleList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Kinh nghiệm đi xe ghép Hà Nội Hải Phòng tiết kiệm')).toBeDefined();
      });

      const categorySelect = screen.getByTestId('filter-category-select');

      // Chọn danh mục "Kinh nghiệm"
      fireEvent.change(categorySelect, { target: { value: 'kinh-nghiem' } });

      expect(screen.getByText('Kinh nghiệm đi xe ghép Hà Nội Hải Phòng tiết kiệm')).toBeDefined();
      expect(screen.queryByText('Báo giá tuyến Hà Nội đi Quảng Ninh mới nhất 2026')).toBeNull();
      expect(screen.queryByText('Ưu đãi giảm 20% đón trả sân bay Nội Bài cuối tuần')).toBeNull();

      // Đổi sang "Khuyến mãi"
      fireEvent.change(categorySelect, { target: { value: 'khuyen-mai' } });
      expect(screen.getByText('Ưu đãi giảm 20% đón trả sân bay Nội Bài cuối tuần')).toBeDefined();
      expect(screen.queryByText('Kinh nghiệm đi xe ghép Hà Nội Hải Phòng tiết kiệm')).toBeNull();
    });

    it('lọc bài viết theo trạng thái (status: draft / published)', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          docs: mockArticles,
          totalDocs: 3,
          totalPages: 1,
          page: 1,
          limit: 100,
        },
      });

      render(
        <MemoryRouter>
          <ArticleList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Báo giá tuyến Hà Nội đi Quảng Ninh mới nhất 2026')).toBeDefined();
      });

      const statusSelect = screen.getByTestId('filter-status-select');

      // Chọn "Bản nháp"
      fireEvent.change(statusSelect, { target: { value: 'draft' } });
      expect(screen.getByText('Báo giá tuyến Hà Nội đi Quảng Ninh mới nhất 2026')).toBeDefined();
      expect(screen.queryByText('Kinh nghiệm đi xe ghép Hà Nội Hải Phòng tiết kiệm')).toBeNull();
    });

    it('mở ConfirmDialog và gọi DELETE /articles/:id khi xác nhận xóa bài viết', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          docs: mockArticles,
          totalDocs: 3,
          totalPages: 1,
          page: 1,
          limit: 100,
        },
      });
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { success: true } });

      render(
        <MemoryRouter>
          <ArticleList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('delete-article-1')).toBeDefined();
      });

      // Nhấn nút Xóa bài viết 1
      fireEvent.click(screen.getByTestId('delete-article-1'));

      // Kiểm tra ConfirmDialog xuất hiện
      expect(screen.getByRole('heading', { name: 'Xác nhận xóa bài viết' })).toBeDefined();

      // Nhấn nút xác nhận Xóa trong dialog
      const confirmDeleteBtn = screen.getByRole('button', { name: 'Xác nhận xóa bài viết' });
      fireEvent.click(confirmDeleteBtn);

      await waitFor(() => {
        expect(apiClient.delete).toHaveBeenCalledWith('/articles/1');
      });
    });
  });

  describe('ArticleForm Component', () => {
    it('tự động sinh slug từ tiêu đề khi tạo mới bài viết', async () => {
      render(
        <MemoryRouter initialEntries={['/articles/new']}>
          <Routes>
            <Route path="/articles/new" element={<ArticleForm />} />
          </Routes>
        </MemoryRouter>
      );

      const titleInput = screen.getByTestId('article-title-input');
      const slugInput = screen.getByTestId('article-slug-input') as HTMLInputElement;

      fireEvent.change(titleInput, {
        target: { value: 'Kinh nghiệm đặt xe ghép giá rẻ' },
      });

      expect(slugInput.value).toBe('kinh-nghiem-dat-xe-ghep-gia-re');
    });

    it('kiểm tra validation khi gửi form thiếu thông tin bắt buộc', async () => {
      render(
        <MemoryRouter initialEntries={['/articles/new']}>
          <Routes>
            <Route path="/articles/new" element={<ArticleForm />} />
          </Routes>
        </MemoryRouter>
      );

      const publishBtn = screen.getByTestId('publish-btn');
      fireEvent.click(publishBtn);

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập tiêu đề bài viết.')).toBeDefined();
        expect(screen.getByText('Vui lòng nhập tóm tắt ngắn (excerpt).')).toBeDefined();
      });

      // Không được gọi API khi chưa hợp lệ
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('hiển thị cảnh báo redirect 301 khi thay đổi slug của bài viết đã xuất bản', async () => {
      const publishedArticle = mockArticles[0]; // status: published, slug: 'kinh-nghiem-di-xe-ghep-ha-noi-hai-phong'

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { doc: publishedArticle },
      });

      render(
        <MemoryRouter initialEntries={['/articles/1']}>
          <Routes>
            <Route path="/articles/:id" element={<ArticleForm />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue(publishedArticle.title)).toBeDefined();
      });

      const slugInput = screen.getByTestId('article-slug-input');

      // Ban đầu slug chưa đổi -> không có cảnh báo 301
      expect(screen.queryByTestId('slug-redirect-warning')).toBeNull();

      // Thay đổi slug của bài viết đã published
      fireEvent.change(slugInput, {
        target: { value: 'kinh-nghiem-di-xe-ghep-ha-noi-hai-phong-moi' },
      });

      // Xuất hiện cảnh báo 301
      expect(screen.getByTestId('slug-redirect-warning')).toBeDefined();
      expect(screen.getByText(/Cảnh báo chuyển hướng 301/i)).toBeDefined();
    });

    it('lưu thành công bài viết với status=published qua POST /articles', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { doc: { id: 10, title: 'Bài viết test' } },
      });
      // Mock thư viện media cho modal
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { docs: [mockMedia], totalDocs: 1 },
      });

      render(
        <MemoryRouter initialEntries={['/articles/new']}>
          <Routes>
            <Route path="/articles/new" element={<ArticleForm />} />
            <Route path="/articles" element={<div>Danh sách bài viết</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Điền tiêu đề
      fireEvent.change(screen.getByTestId('article-title-input'), {
        target: { value: 'Bí quyết chọn xe ghép an toàn' },
      });

      // Điền excerpt
      fireEvent.change(screen.getByTestId('article-excerpt-input'), {
        target: { value: 'Tổng hợp mẹo hay giúp hành khách chọn xe ghép uy tín.' },
      });

      // Chọn ảnh đại diện từ MediaPickerModal
      fireEvent.click(screen.getByTestId('select-featured-image-btn'));

      // Chờ modal mở và click chọn ảnh
      await waitFor(() => {
        expect(screen.getByTestId('picker-item-101')).toBeDefined();
      });
      fireEvent.click(screen.getByTestId('picker-item-101'));
      fireEvent.click(screen.getByTestId('picker-confirm-select-btn'));

      // Nhập nội dung qua RichTextEditor ở visual mode
      const editorVisual = screen.getByTestId('rich-editor-visual');
      fireEvent.input(editorVisual, {
        target: { innerHTML: '<p>Nội dung chi tiết bài viết bí quyết...</p>' },
      });

      // Nhấn nút Xuất bản ngay
      fireEvent.click(screen.getByTestId('publish-btn'));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/articles',
          expect.objectContaining({
            title: 'Bí quyết chọn xe ghép an toàn',
            slug: 'bi-quyet-chon-xe-ghep-an-toan',
            status: 'published',
            featuredImage: 101,
          })
        );
      });
    });
  });
});
