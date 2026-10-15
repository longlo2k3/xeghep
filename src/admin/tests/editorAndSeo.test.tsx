import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SeoPreview } from '@/admin/components/common/SeoPreview';
import { RichTextEditor } from '@/admin/components/common/RichTextEditor';

// Mock MediaPickerModal trong RichTextEditor để test tương tác
vi.mock('@/admin/components/common/MediaPickerModal', () => ({
  MediaPickerModal: ({ isOpen, onClose, onSelect }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-media-picker-modal">
        <button
          type="button"
          onClick={() =>
            onSelect({
              id: 99,
              filename: 'test-car.webp',
              alt: 'Ảnh xe 7 chỗ',
              caption: 'Xe du lịch đời mới',
              url: '/media/test-car.webp',
              sizes: { hero: { url: '/media/test-car-hero.webp' } },
            })
          }
          data-testid="mock-select-media-btn"
        >
          Chọn ảnh mock
        </button>
        <button type="button" onClick={onClose} data-testid="mock-close-picker-btn">
          Đóng
        </button>
      </div>
    );
  },
}));

describe('Editor & SEO Utilities (Task T111)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SeoPreview Component', () => {
    it('render thông tin SEO cơ bản trên Google SERP', () => {
      render(
        <SeoPreview
          title="Xe ghép Hải Phòng Hà Nội giá rẻ"
          description="Dịch vụ xe ghép Hải Phòng đi Hà Nội đưa đón tận nơi giá chỉ từ 150k."
          slug="xe-ghep-hai-phong-ha-noi"
          prefix="tuyen-duong"
        />
      );

      expect(screen.getByTestId('google-serp-preview')).toBeDefined();
      expect(screen.getByText('Xe Ghép Liên Tỉnh')).toBeDefined();
      expect(screen.getByText('https://xegheplientinh.vn/tuyen-duong/xe-ghep-hai-phong-ha-noi')).toBeDefined();
      expect(screen.getByTestId('serp-title').textContent).toBe('Xe ghép Hải Phòng Hà Nội giá rẻ');
      expect(screen.getByTestId('serp-description').textContent).toContain('Dịch vụ xe ghép');
    });

    it('tính toán và hiển thị bộ đếm ký tự chính xác cho Tiêu đề và Mô tả', () => {
      const title = 'Kinh nghiệm đặt xe ghép tiết kiệm'; // 33 ký tự
      const desc = 'Hướng dẫn chi tiết cách đặt xe ghép liên tỉnh an toàn, nhanh chóng và tiết kiệm chi phí nhất.'; // 93 ký tự

      render(
        <SeoPreview
          title={title}
          description={desc}
          slug="kinh-nghiem"
        />
      );

      expect(screen.getByTestId('title-counter').textContent).toBe('33 / 70 ký tự');
      expect(screen.getByTestId('desc-counter').textContent).toBe('93 / 160 ký tự');
    });

    it('hiển thị cảnh báo màu đỏ khi tiêu đề vượt quá 70 ký tự', () => {
      const longTitle = 'Xe ghép Hải Phòng Hà Nội đưa đón tận nhà uy tín chất lượng cao giá rẻ nhất năm 2026'; // > 70 ký tự

      render(
        <SeoPreview
          title={longTitle}
          description="Mô tả chuẩn"
          slug="test"
        />
      );

      expect(screen.getByTestId('title-warning')).toBeDefined();
      expect(screen.getByText(/Vượt quá 70 ký tự!/i)).toBeDefined();
    });

    it('hiển thị cảnh báo khi mô tả vượt quá 160 ký tự', () => {
      const longDesc =
        'Dịch vụ xe ghép chuyên nghiệp hàng đầu miền Bắc phục vụ đưa đón tận nơi từ Hà Nội về Hải Phòng, Quảng Ninh, Bắc Ninh, Thái Nguyên với đội xe đời mới, tài xế lịch sự, cam kết đúng giờ và giá cước siêu tiết kiệm không phát sinh phụ phí.'; // > 160 ký tự

      render(
        <SeoPreview
          title="Tiêu đề chuẩn"
          description={longDesc}
          slug="test"
        />
      );

      expect(screen.getByTestId('desc-warning')).toBeDefined();
      expect(screen.getByText(/Vượt quá 160 ký tự!/i)).toBeDefined();
    });

    it('hỗ trợ cờ appendBrand tự động thêm hậu tố thương hiệu vào tiêu đề', () => {
      render(
        <SeoPreview
          title="Giới thiệu dịch vụ"
          description="Mô tả"
          slug="gioi-thieu"
          appendBrand={true}
        />
      );

      expect(screen.getByTestId('serp-title').textContent).toBe('Giới thiệu dịch vụ | Xe Ghép Liên Tỉnh');
    });

    it('chuyển đổi tab sang Mạng xã hội (OG) hiển thị preview Facebook/Zalo', () => {
      render(
        <SeoPreview
          title="Tiêu đề bài viết"
          description="Mô tả bài viết"
          slug="bai-viet"
          ogImage="https://example.com/banner.jpg"
        />
      );

      const socialTabBtn = screen.getByTestId('tab-social-btn');
      fireEvent.click(socialTabBtn);

      expect(screen.getByTestId('social-og-preview')).toBeDefined();
      expect(screen.getByText('XEGHEPLIENTINH.VN')).toBeDefined();
    });
  });

  describe('RichTextEditor Component', () => {
    it('render editor với label và các nút toolbar', () => {
      const handleChange = vi.fn();
      render(
        <RichTextEditor
          value="<p>Xin chào</p>"
          onChange={handleChange}
          label="Nội dung bài viết"
        />
      );

      expect(screen.getByText('Nội dung bài viết')).toBeDefined();
      expect(screen.getByTestId('toolbar-bold-btn')).toBeDefined();
      expect(screen.getByTestId('toolbar-italic-btn')).toBeDefined();
      expect(screen.getByTestId('toolbar-h2-btn')).toBeDefined();
      expect(screen.getByTestId('toolbar-h3-btn')).toBeDefined();
      expect(screen.getByTestId('toolbar-ul-btn')).toBeDefined();
      expect(screen.getByTestId('toolbar-ol-btn')).toBeDefined();
      expect(screen.getByTestId('toolbar-image-btn')).toBeDefined();
      expect(screen.getByTestId('rich-editor-visual')).toBeDefined();
    });

    it('chuyển đổi qua lại giữa chế độ Trực quan và Mã HTML', () => {
      const handleChange = vi.fn();
      render(
        <RichTextEditor
          value="<p>Nội dung mẫu</p>"
          onChange={handleChange}
        />
      );

      // Ban đầu là visual mode
      expect(screen.getByTestId('rich-editor-visual')).toBeDefined();
      expect(screen.queryByTestId('rich-editor-code')).toBeNull();

      // Chuyển sang code mode
      const codeModeBtn = screen.getByTestId('mode-code-btn');
      fireEvent.click(codeModeBtn);

      expect(screen.getByTestId('rich-editor-code')).toBeDefined();
      expect(screen.queryByTestId('rich-editor-visual')).toBeNull();

      // Chuyển lại visual mode
      const visualModeBtn = screen.getByTestId('mode-visual-btn');
      fireEvent.click(visualModeBtn);

      expect(screen.getByTestId('rich-editor-visual')).toBeDefined();
    });

    it('tự động gắn id chuẩn TOC vào thẻ h2 khi nhập mã HTML', () => {
      const handleChange = vi.fn();
      render(
        <RichTextEditor
          value=""
          onChange={handleChange}
        />
      );

      // Chuyển sang code mode
      fireEvent.click(screen.getByTestId('mode-code-btn'));

      const textarea = screen.getByTestId('rich-editor-code');
      fireEvent.change(textarea, {
        target: { value: '<h2>Lợi ích đi xe ghép</h2><p>Chi tiết...</p>' },
      });

      expect(handleChange).toHaveBeenCalledWith(
        '<h2 id="loi-ich-di-xe-ghep">Lợi ích đi xe ghép</h2><p>Chi tiết...</p>'
      );
    });

    it('mở MediaPickerModal và chèn ảnh vào bài viết khi chọn ảnh', async () => {
      const handleChange = vi.fn();
      render(
        <RichTextEditor
          value="<p>Đoạn mở đầu</p>"
          onChange={handleChange}
        />
      );

      // Bấm nút Chèn ảnh trên toolbar
      const imageBtn = screen.getByTestId('toolbar-image-btn');
      fireEvent.click(imageBtn);

      // Modal MediaPicker hiển thị
      expect(screen.getByTestId('mock-media-picker-modal')).toBeDefined();

      // Chọn ảnh từ modal
      const selectBtn = screen.getByTestId('mock-select-media-btn');
      fireEvent.click(selectBtn);

      await waitFor(() => {
        expect(screen.queryByTestId('mock-media-picker-modal')).toBeNull();
      });
    });

    it('chèn link khi xác nhận nhập url', () => {
      document.execCommand = vi.fn();
      const handleChange = vi.fn();

      render(
        <RichTextEditor
          value="<p>Chọn đoạn văn</p>"
          onChange={handleChange}
        />
      );

      const linkBtn = screen.getByTestId('toolbar-link-btn');
      fireEvent.click(linkBtn);

      const urlInput = screen.getByTestId('link-url-input');
      fireEvent.change(urlInput, { target: { value: 'https://xegheplientinh.vn' } });

      const confirmBtn = screen.getByTestId('confirm-link-btn');
      fireEvent.click(confirmBtn);

      expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'https://xegheplientinh.vn');
    });
  });
});
