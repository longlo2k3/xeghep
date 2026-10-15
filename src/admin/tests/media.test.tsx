import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MediaUploadModal } from '@/admin/features/media/MediaUploadModal';
import { MediaGallery } from '@/admin/features/media/MediaGallery';
import { MediaPickerModal } from '@/admin/components/common/MediaPickerModal';
import { apiClient } from '@/admin/lib/api-client';
import type { MediaDoc } from '@/admin/types/media';

// Mock apiClient
vi.mock('@/admin/lib/api-client', async () => {
  const actual = await vi.importActual<typeof import('@/admin/lib/api-client')>('@/admin/lib/api-client');
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    },
  };
});

const mockMediaList: MediaDoc[] = [
  {
    id: 1,
    filename: 'xe-ghep-ha-noi-hai-phong.webp',
    alt: 'Xe ghép Hải Phòng Hà Nội giá rẻ',
    caption: 'Dịch vụ đưa đón tận nơi',
    url: '/media/xe-ghep-ha-noi-hai-phong.webp',
    thumbnailURL: '/media/xe-ghep-ha-noi-hai-phong-thumb.webp',
    width: 1200,
    height: 800,
    filesize: 153600,
    mimeType: 'image/webp',
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-10T08:00:00Z',
    sizes: {
      card: { url: '/media/card.webp', width: 640, height: 426 },
      hero: { url: '/media/hero.webp', width: 1600, height: 1066 },
      og: { url: '/media/og.webp', width: 1200, height: 630 },
    },
  },
  {
    id: 2,
    filename: 'noi-bai-ha-long.jpg',
    alt: 'Xe ghép Nội Bài đi Hạ Long',
    caption: null,
    url: '/media/noi-bai-ha-long.jpg',
    thumbnailURL: '/media/noi-bai-ha-long.jpg',
    width: 1920,
    height: 1080,
    filesize: 350000,
    mimeType: 'image/jpeg',
    createdAt: '2026-10-10T09:00:00Z',
    updatedAt: '2026-10-10T09:00:00Z',
  },
];

describe('Media Module (Task T109 & T110)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL / revokeObjectURL for file previews
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-image-url');
    window.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('MediaUploadModal Component', () => {
    it('không render khi isOpen=false', () => {
      render(<MediaUploadModal isOpen={false} onClose={vi.fn()} />);
      expect(screen.queryByText(/Tải ảnh mới lên hệ thống/i)).toBeNull();
    });

    it('render modal và vùng kéo thả khi isOpen=true', () => {
      render(<MediaUploadModal isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText(/Tải ảnh mới lên hệ thống/i)).toBeDefined();
      expect(screen.getByTestId('drop-zone')).toBeDefined();
      expect(screen.getByText(/Kéo thả hình ảnh vào đây hoặc click để chọn/i)).toBeDefined();
    });

    it('hiển thị preview ảnh khi người dùng chọn file hợp lệ', async () => {
      render(<MediaUploadModal isOpen={true} onClose={vi.fn()} />);

      const fileInput = screen.getByTestId('media-file-input');
      const testFile = new File(['dummy-image'], 'xe-fortuner.webp', { type: 'image/webp' });

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      await waitFor(() => {
        expect(screen.getByTestId('image-preview')).toBeDefined();
        expect(screen.getByText('xe-fortuner.webp')).toBeDefined();
      });
    });

    it('báo lỗi khi chọn file không đúng định dạng', async () => {
      render(<MediaUploadModal isOpen={true} onClose={vi.fn()} />);

      const fileInput = screen.getByTestId('media-file-input');
      const invalidFile = new File(['text'], 'document.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(screen.getByText(/Chỉ chấp nhận định dạng ảnh JPG, PNG, WebP hoặc AVIF/i)).toBeDefined();
      });
    });

    it('yêu cầu Alt text và báo lỗi khi để trống Alt text', async () => {
      render(<MediaUploadModal isOpen={true} onClose={vi.fn()} />);

      const fileInput = screen.getByTestId('media-file-input');
      const testFile = new File(['dummy'], 'test.png', { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [testFile] } });

      // Xóa alt text đã gợi ý
      const altInput = screen.getByTestId('media-alt-input');
      fireEvent.change(altInput, { target: { value: '' } });

      const submitBtn = screen.getByTestId('media-upload-submit-btn');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Alt text là bắt buộc để tối ưu SEO hình ảnh/i)).toBeDefined();
      });
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('gửi POST /api/media với FormData khi thông tin hợp lệ', async () => {
      const handleSuccess = vi.fn();
      const handleClose = vi.fn();

      const newMediaDoc: MediaDoc = {
        id: 3,
        filename: 'hinh-anh-moi.png',
        alt: 'Hình ảnh xe 7 chỗ sang trọng',
        caption: 'Xe đưa đón sân bay',
        url: '/media/hinh-anh-moi.png',
        createdAt: '2026-10-10T10:00:00Z',
        updatedAt: '2026-10-10T10:00:00Z',
      };

      (apiClient.post as any).mockResolvedValueOnce({
        data: { doc: newMediaDoc },
      });

      render(
        <MediaUploadModal
          isOpen={true}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      );

      const fileInput = screen.getByTestId('media-file-input');
      const testFile = new File(['dummy'], 'hinh-anh-moi.png', { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [testFile] } });

      const altInput = screen.getByTestId('media-alt-input');
      fireEvent.change(altInput, { target: { value: 'Hình ảnh xe 7 chỗ sang trọng' } });

      const captionInput = screen.getByTestId('media-caption-input');
      fireEvent.change(captionInput, { target: { value: 'Xe đưa đón sân bay' } });

      const submitBtn = screen.getByTestId('media-upload-submit-btn');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/media',
          expect.any(FormData),
          expect.objectContaining({
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        );
        expect(handleSuccess).toHaveBeenCalledWith(newMediaDoc);
        expect(handleClose).toHaveBeenCalled();
      });
    });
  });

  describe('MediaGallery Component (Task T109)', () => {
    it('render danh sách ảnh thành công từ API', async () => {
      (apiClient.get as any).mockResolvedValueOnce({
        data: {
          docs: mockMediaList,
          totalDocs: 2,
          totalPages: 1,
          page: 1,
          limit: 24,
        },
      });

      render(<MediaGallery />);

      expect(screen.getByText(/Thư viện Media/i)).toBeDefined();

      await waitFor(() => {
        expect(screen.getByText('xe-ghep-ha-noi-hai-phong.webp')).toBeDefined();
        expect(screen.getByText('noi-bai-ha-long.jpg')).toBeDefined();
      });
    });

    it('chuyển đổi giữa chế độ Lưới (Grid) và Bảng (Table)', async () => {
      (apiClient.get as any).mockResolvedValue({
        data: { docs: mockMediaList, totalDocs: 2, totalPages: 1, page: 1 },
      });

      render(<MediaGallery />);

      await waitFor(() => {
        expect(screen.getByTestId('media-grid')).toBeDefined();
      });

      const tableModeBtn = screen.getByTestId('view-mode-table');
      fireEvent.click(tableModeBtn);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeDefined();
        expect(screen.getByText('Tên file & Alt text')).toBeDefined();
      });
    });

    it('sao chép URL ảnh vào clipboard khi bấm nút copy', async () => {
      (apiClient.get as any).mockResolvedValue({
        data: { docs: mockMediaList, totalDocs: 2, totalPages: 1, page: 1 },
      });

      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<MediaGallery />);

      await waitFor(() => {
        expect(screen.getByTestId('grid-copy-1')).toBeDefined();
      });

      fireEvent.click(screen.getByTestId('grid-copy-1'));

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled();
        expect(screen.getByTestId('toast-notification')).toBeDefined();
      });
    });

    it('mở ConfirmDialog và gọi DELETE /api/media/:id khi xác nhận xóa', async () => {
      (apiClient.get as any).mockResolvedValue({
        data: { docs: mockMediaList, totalDocs: 2, totalPages: 1, page: 1 },
      });
      (apiClient.delete as any).mockResolvedValueOnce({ data: { message: 'Deleted' } });

      render(<MediaGallery />);

      await waitFor(() => {
        expect(screen.getByTestId('grid-delete-1')).toBeDefined();
      });

      fireEvent.click(screen.getByTestId('grid-delete-1'));

      // ConfirmDialog mở ra
      await waitFor(() => {
        expect(screen.getByText(/Xác nhận xóa hình ảnh\?/i)).toBeDefined();
      });

      const confirmBtn = screen.getByRole('button', { name: /Xác nhận xóa/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(apiClient.delete).toHaveBeenCalledWith('/media/1');
      });
    });

    it('mở MediaUploadModal khi bấm nút "Tải ảnh lên"', async () => {
      (apiClient.get as any).mockResolvedValue({
        data: { docs: [], totalDocs: 0, totalPages: 1, page: 1 },
      });

      render(<MediaGallery />);

      const openUploadBtn = screen.getByTestId('open-upload-modal-btn');
      fireEvent.click(openUploadBtn);

      await waitFor(() => {
        expect(screen.getByText(/Tải ảnh mới lên hệ thống/i)).toBeDefined();
      });
    });
  });

  describe('MediaPickerModal Component (Task T110)', () => {
    it('hiển thị danh sách ảnh và cho phép chọn ảnh kèm highlight', async () => {
      (apiClient.get as any).mockResolvedValue({
        data: { docs: mockMediaList },
      });

      const handleSelect = vi.fn();
      const handleClose = vi.fn();

      render(
        <MediaPickerModal
          isOpen={true}
          onClose={handleClose}
          onSelect={handleSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('picker-item-1')).toBeDefined();
        expect(screen.getByTestId('picker-item-2')).toBeDefined();
      });

      // Ban đầu nút xác nhận disabled
      const confirmBtn = screen.getByTestId('picker-confirm-select-btn');
      expect((confirmBtn as HTMLButtonElement).disabled).toBe(true);

      // Click chọn ảnh 1
      fireEvent.click(screen.getByTestId('picker-item-1'));

      await waitFor(() => {
        expect(screen.getByTestId('selected-media-info')).toBeDefined();
        expect((confirmBtn as HTMLButtonElement).disabled).toBe(false);
      });

      // Bấm Xác nhận chọn
      fireEvent.click(confirmBtn);

      expect(handleSelect).toHaveBeenCalledWith(mockMediaList[0]);
      expect(handleClose).toHaveBeenCalled();
    });

    it('hỗ trợ chuyển sang tab "Tải ảnh mới" và upload ảnh trực tiếp', async () => {
      (apiClient.get as any).mockResolvedValue({
        data: { docs: mockMediaList },
      });

      render(
        <MediaPickerModal
          isOpen={true}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      );

      const uploadTabBtn = screen.getByTestId('tab-upload');
      fireEvent.click(uploadTabBtn);

      await waitFor(() => {
        expect(screen.getByTestId('picker-drop-zone')).toBeDefined();
        expect(screen.getByTestId('picker-alt-input')).toBeDefined();
      });
    });
  });
});
