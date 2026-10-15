import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RouteList } from '@/admin/features/routes/RouteList';
import { RouteForm } from '@/admin/features/routes/RouteForm';
import {
  PricingTiersSection,
  computePriceFrom,
  detectPriceType,
} from '@/admin/features/routes/PricingTiersSection';
import { apiClient } from '@/admin/lib/api-client';
import type { RouteDoc } from '@/admin/types/routes';

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

const mockRoutes: RouteDoc[] = [
  {
    id: 1,
    name: 'Hải Phòng ⇄ Hà Nội',
    slug: 'hai-phong-ha-noi',
    origin: 'Hải Phòng',
    destination: 'Hà Nội',
    distance: '120 km',
    duration: '1 giờ 30 phút',
    tierShare1: { min: 200000, max: null, from: false, negotiable: false },
    tierShare2: { min: 380000, max: null, from: false, negotiable: false },
    tierCharter45: { min: 600000, max: null, from: false, negotiable: false },
    tierCharter7: { min: 800000, max: null, from: false, negotiable: false },
    priceFrom: 200000,
    priceValidUntil: '2026-12-31',
    description: 'Tuyến xe ghép Hải Phòng đi Hà Nội đón trả tận nơi.',
    isBannerTop: true,
    bannerLabel: 'Hải Phòng ⇔ Hà Nội',
    sortOrder: 1,
    regions: ['Hải Phòng', 'Hà Nội'],
    status: 'active',
    pickups: [{ text: 'Bến xe Niệm Nghĩa' }],
    dropoffs: [{ text: 'Bến xe Nước Ngầm' }],
    faqs: [{ question: 'Có đón tận nhà không?', answer: 'Có đón trả tận nơi.' }],
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Hà Nội ⇄ Hạ Long',
    slug: 'ha-noi-ha-long',
    origin: 'Hà Nội',
    destination: 'Hạ Long',
    distance: '155 km',
    duration: '2 giờ',
    tierShare1: { min: 250000, max: null, from: false, negotiable: false },
    tierCharter45: { min: 850000, max: null, from: false, negotiable: false },
    priceFrom: 250000,
    priceValidUntil: '2026-12-31',
    description: 'Tuyến xe ghép Hà Nội - Quảng Ninh chạy cao tốc 5B.',
    isBannerTop: false,
    bannerLabel: null,
    sortOrder: 2,
    regions: ['Hà Nội', 'Hạ Long'],
    status: 'draft',
    createdAt: '2026-10-02T00:00:00Z',
    updatedAt: '2026-10-02T00:00:00Z',
  },
  {
    id: 3,
    name: 'Hải Phòng ⇄ Móng Cái',
    slug: 'hai-phong-mong-cai',
    origin: 'Hải Phòng',
    destination: 'Móng Cái',
    distance: '190 km',
    duration: '2 giờ 30 phút',
    tierShare1: { min: null, max: null, from: false, negotiable: true },
    tierCharter45: { min: 1200000, max: null, from: false, negotiable: false },
    priceFrom: 1200000,
    priceValidUntil: '2026-12-31',
    description: 'Tuyến cửa khẩu Móng Cái xe VIP.',
    isBannerTop: false,
    bannerLabel: null,
    sortOrder: 3,
    regions: ['Móng Cái', 'Hải Phòng'],
    status: 'archived',
    createdAt: '2026-10-03T00:00:00Z',
    updatedAt: '2026-10-03T00:00:00Z',
  },
];

describe('Routes & Pricing Tiers Module (Task T114 & T115)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
  });

  describe('Pricing Engine & computePriceFrom Logic', () => {
    it('tính toán priceFrom là giá min thấp nhất trong các hạng vé không thỏa thuận', () => {
      const tiers = {
        tierShare1: { min: 250000, max: null, from: false, negotiable: false },
        tierShare2: { min: 450000, max: null, from: false, negotiable: false },
        tierCharter45: { min: 700000, max: null, from: false, negotiable: false },
        tierCharter7: { min: 900000, max: null, from: false, negotiable: false },
      };

      expect(computePriceFrom(tiers)).toBe(250000);
    });

    it('bỏ qua hạng vé thỏa thuận (negotiable) khi tính priceFrom', () => {
      const tiers = {
        tierShare1: { min: null, max: null, from: false, negotiable: true },
        tierCharter45: { min: 650000, max: null, from: false, negotiable: false },
      };

      expect(computePriceFrom(tiers)).toBe(650000);
    });

    it('trả về null nếu tất cả các hạng vé đều thỏa thuận hoặc không có giá', () => {
      const tiers = {
        tierShare1: { min: null, max: null, from: false, negotiable: true },
        tierCharter45: { min: null, max: null, from: false, negotiable: true },
      };

      expect(computePriceFrom(tiers)).toBeNull();
    });

    it('nhận diện đúng bí danh tierCharter4to5 tương đương tierCharter45', () => {
      const tiers = {
        tierCharter4to5: { min: 550000, max: null, from: false, negotiable: false },
      };

      expect(computePriceFrom(tiers)).toBe(550000);
    });

    it('detectPriceType nhận diện chính xác fixed, range, from, negotiable', () => {
      expect(detectPriceType({ negotiable: true })).toBe('negotiable');
      expect(detectPriceType({ min: 200000, from: true })).toBe('from');
      expect(detectPriceType({ min: 200000, max: 300000 })).toBe('range');
      expect(detectPriceType({ min: 200000, max: null })).toBe('fixed');
      expect(detectPriceType(null)).toBe('fixed');
    });
  });

  describe('PricingTiersSection Component', () => {
    it('render đầy đủ 4 hạng vé và hiển thị giá từ ước tính', () => {
      const handleChange = vi.fn();
      render(
        <PricingTiersSection
          value={{
            tierShare1: { min: 200000, max: null, from: false, negotiable: false },
            tierCharter45: { min: 600000, max: null, from: false, negotiable: false },
          }}
          onChange={handleChange}
        />
      );

      // 4 Hạng vé
      expect(screen.getByTestId('tier-card-share1')).toBeDefined();
      expect(screen.getByTestId('tier-card-share2')).toBeDefined();
      expect(screen.getByTestId('tier-card-charter4to5')).toBeDefined();
      expect(screen.getByTestId('tier-card-charter7')).toBeDefined();

      // PriceFrom hiển thị format VND
      const priceFromEl = screen.getByTestId('computed-price-from');
      expect(priceFromEl.textContent).toContain('200.000 ₫');
    });

    it('cập nhật giá cố định gọi onChange với giá mới', () => {
      const handleChange = vi.fn();
      render(
        <PricingTiersSection
          value={{
            tierShare1: { min: 200000, max: null, from: false, negotiable: false },
          }}
          onChange={handleChange}
        />
      );

      const fixedInput = screen.getByTestId('tier-share1-fixed-price');
      fireEvent.change(fixedInput, { target: { value: '220000' } });

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          tierShare1: expect.objectContaining({ min: 220000 }),
        })
      );
    });

    it('chuyển loại giá sang Thỏa thuận (negotiable) ẩn input tiền và hiển thị ghi chú', () => {
      const handleChange = vi.fn();
      render(
        <PricingTiersSection
          value={{
            tierShare1: { min: 200000, max: null, from: false, negotiable: false },
          }}
          onChange={handleChange}
        />
      );

      const negotiableBtn = screen.getByTestId('tier-share1-type-negotiable');
      fireEvent.click(negotiableBtn);

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          tierShare1: expect.objectContaining({ negotiable: true, min: null }),
        })
      );
    });

    it('chuyển loại giá sang Khoảng giá (range) hiển thị minPrice và maxPrice', () => {
      const handleChange = vi.fn();
      render(
        <PricingTiersSection
          value={{
            tierShare1: { min: 200000, max: 250000, from: false, negotiable: false },
          }}
          onChange={handleChange}
        />
      );

      const rangeBtn = screen.getByTestId('tier-share1-type-range');
      fireEvent.click(rangeBtn);

      expect(screen.getByTestId('tier-share1-min-price')).toBeDefined();
      expect(screen.getByTestId('tier-share1-max-price')).toBeDefined();
    });
  });

  describe('RouteList Component (Task T114)', () => {
    it('hiển thị danh sách tuyến từ API kèm Banner Top và format tiền VND', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          docs: mockRoutes,
          totalDocs: 3,
          totalPages: 1,
          page: 1,
          limit: 100,
        },
      });

      render(
        <MemoryRouter>
          <RouteList />
        </MemoryRouter>
      );

      // Chờ dữ liệu nạp
      await waitFor(() => {
        expect(screen.getByText('Hải Phòng ⇄ Hà Nội')).toBeDefined();
      });

      expect(screen.getByText('Hà Nội ⇄ Hạ Long')).toBeDefined();
      expect(screen.getByText('Hải Phòng ⇄ Móng Cái')).toBeDefined();

      // Kiểm tra format giá VND: 200.000 ₫
      expect(screen.getByText('200.000 ₫')).toBeDefined();

      // Kiểm tra badge Banner Top
      expect(screen.getByTestId('banner-top-badge-1')).toBeDefined();
      expect(screen.getByTestId('banner-top-badge-1').textContent).toContain('Hải Phòng ⇔ Hà Nội');
    });

    it('lọc danh sách tuyến theo trạng thái (status filter)', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          docs: mockRoutes,
          totalDocs: 3,
        },
      });

      render(
        <MemoryRouter>
          <RouteList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Hải Phòng ⇄ Hà Nội')).toBeDefined();
      });

      // Lọc active
      const statusSelect = screen.getByTestId('status-filter');
      fireEvent.change(statusSelect, { target: { value: 'active' } });

      expect(screen.getByText('Hải Phòng ⇄ Hà Nội')).toBeDefined();
      expect(screen.queryByText('Hà Nội ⇄ Hạ Long')).toBeNull();
      expect(screen.queryByText('Hải Phòng ⇄ Móng Cái')).toBeNull();
    });

    it('lọc danh sách tuyến theo vùng miền (region filter)', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          docs: mockRoutes,
          totalDocs: 3,
        },
      });

      render(
        <MemoryRouter>
          <RouteList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Hải Phòng ⇄ Hà Nội')).toBeDefined();
      });

      // Lọc Hạ Long
      const regionSelect = screen.getByTestId('region-filter');
      fireEvent.change(regionSelect, { target: { value: 'Hạ Long' } });

      expect(screen.getByText('Hà Nội ⇄ Hạ Long')).toBeDefined();
      expect(screen.queryByText('Hải Phòng ⇄ Hà Nội')).toBeNull();
    });

    it('mở ConfirmDialog và gọi DELETE /routes/:id khi xác nhận xóa tuyến', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { docs: mockRoutes },
      });
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { success: true } });

      render(
        <MemoryRouter>
          <RouteList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('delete-route-1')).toBeDefined();
      });

      // Bấm nút xóa tuyến ID=1
      fireEvent.click(screen.getByTestId('delete-route-1'));

      // Hộp thoại ConfirmDialog xuất hiện
      expect(screen.getByText('Xóa tuyến đường')).toBeDefined();

      // Bấm Xác nhận xóa
      const confirmBtn = screen.getByRole('button', { name: 'Xác nhận xóa' });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(apiClient.delete).toHaveBeenCalledWith('/routes/1');
      });
    });

    it('điều hướng đến trang chi tiết /routes/1?mode=view khi bấm nút Xem chi tiết (Eye)', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { docs: mockRoutes },
      });

      render(
        <MemoryRouter initialEntries={['/routes']}>
          <Routes>
            <Route path="/routes" element={<RouteList />} />
            <Route path="/routes/:id" element={<div data-testid="route-detail-page">Trang chi tiết / form</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('view-route-1')).toBeDefined();
      });

      // Bấm nút xem chi tiết tuyến ID=1
      fireEvent.click(screen.getByTestId('view-route-1'));

      // Đã chuyển sang trang chi tiết tuyến
      await waitFor(() => {
        expect(screen.getByTestId('route-detail-page')).toBeDefined();
      });
    });
  });

  describe('RouteForm Component (Task T115)', () => {
    it('hiển thị đầy đủ thông tin ở chế độ chỉ đọc (view mode) khi URL có ?mode=view', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { doc: mockRoutes[0] },
      });

      render(
        <MemoryRouter initialEntries={['/routes/1?mode=view']}>
          <Routes>
            <Route path="/routes/:id" element={<RouteForm />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Chi tiết tuyến đường')).toBeDefined();
        expect(screen.getByText('Chế độ xem')).toBeDefined();
      });

      // Nút chuyển sang chỉnh sửa
      expect(screen.getByTestId('switch-to-edit-btn')).toBeDefined();

      // Các trường input bị disabled ở chế độ xem
      const nameInput = screen.getByTestId('route-name-input') as HTMLInputElement;
      expect(nameInput.disabled).toBe(true);

      const originInput = screen.getByTestId('route-origin-input') as HTMLInputElement;
      expect(originInput.disabled).toBe(true);

      // Nút lưu nháp và cập nhật bị ẩn
      expect(screen.queryByTestId('save-draft-btn')).toBeNull();
      expect(screen.queryByTestId('save-route-btn')).toBeNull();
    });
    it('tự động sinh slug từ tên tuyến khi tạo mới', async () => {
      render(
        <MemoryRouter initialEntries={['/routes/new']}>
          <Routes>
            <Route path="/routes/new" element={<RouteForm />} />
          </Routes>
        </MemoryRouter>
      );

      const nameInput = screen.getByTestId('route-name-input');
      const slugInput = screen.getByTestId('route-slug-input');

      fireEvent.change(nameInput, { target: { value: 'Hải Phòng - Nam Định' } });

      expect((slugInput as HTMLInputElement).value).toBe('hai-phong-nam-dinh');
    });

    it('báo lỗi validation khi thiếu các trường bắt buộc và thiếu priceValidUntil', async () => {
      render(
        <MemoryRouter initialEntries={['/routes/new']}>
          <Routes>
            <Route path="/routes/new" element={<RouteForm />} />
          </Routes>
        </MemoryRouter>
      );

      const submitBtn = screen.getByTestId('save-route-btn');
      fireEvent.click(submitBtn);

      // Hiển thị lỗi bắt buộc
      expect(
        screen.getByText('Vui lòng nhập tên tuyến đường.')
      ).toBeDefined();
    });

    it('hiển thị cảnh báo 301 Redirect khi chỉnh sửa slug của tuyến đang active', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockRoutes[0], // Active route: slug = hai-phong-ha-noi
      });

      render(
        <MemoryRouter initialEntries={['/routes/1']}>
          <Routes>
            <Route path="/routes/:id" element={<RouteForm />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const nameEl = screen.getByTestId('route-name-input') as HTMLInputElement;
        expect(nameEl.value).toBe('Hải Phòng ⇄ Hà Nội');
      });

      // Chưa đổi slug -> Chưa có cảnh báo 301
      expect(screen.queryByTestId('slug-redirect-warning')).toBeNull();

      // Đổi slug sang 'hai-phong-ha-noi-cao-toc'
      const slugInput = screen.getByTestId('route-slug-input');
      fireEvent.change(slugInput, { target: { value: 'hai-phong-ha-noi-cao-toc' } });

      // Xuất hiện cảnh báo 301
      expect(screen.getByTestId('slug-redirect-warning')).toBeDefined();
      expect(screen.getByTestId('slug-redirect-warning').textContent).toContain(
        'Cảnh báo tự động tạo chuyển hướng 301 (Redirects)'
      );
    });

    it('không hiển thị cảnh báo 301 nếu tuyến ở trạng thái draft dù có đổi slug', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockRoutes[1], // Draft route: status = draft
      });

      render(
        <MemoryRouter initialEntries={['/routes/2']}>
          <Routes>
            <Route path="/routes/:id" element={<RouteForm />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const nameEl = screen.getByTestId('route-name-input') as HTMLInputElement;
        expect(nameEl.value).toBe('Hà Nội ⇄ Hạ Long');
      });

      // Đổi slug tuyến draft
      const slugInput = screen.getByTestId('route-slug-input');
      fireEvent.change(slugInput, { target: { value: 'ha-noi-ha-long-quang-ninh' } });

      // Không cảnh báo vì chưa active
      expect(screen.queryByTestId('slug-redirect-warning')).toBeNull();
    });

    it('gọi POST /routes khi tạo mới thành công với đầy đủ thông tin hợp lệ', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { id: 10, name: 'Bắc Ninh ⇄ Hà Nội' },
      });

      render(
        <MemoryRouter initialEntries={['/routes/new']}>
          <Routes>
            <Route path="/routes/new" element={<RouteForm />} />
            <Route path="/routes" element={<div>Danh sách tuyến</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Điền thông tin
      fireEvent.change(screen.getByTestId('route-name-input'), {
        target: { value: 'Bắc Ninh ⇄ Hà Nội' },
      });
      fireEvent.change(screen.getByTestId('route-origin-input'), {
        target: { value: 'Bắc Ninh' },
      });
      fireEvent.change(screen.getByTestId('route-destination-input'), {
        target: { value: 'Hà Nội' },
      });
      fireEvent.change(screen.getByTestId('route-description-input'), {
        target: { value: 'Tuyến xe ghép Bắc Ninh Hà Nội đón trả tận nơi.' },
      });
      fireEvent.change(screen.getByTestId('route-price-valid-until-input'), {
        target: { value: '2026-12-31' },
      });

      // Nhập giá tierShare1
      fireEvent.change(screen.getByTestId('tier-share1-fixed-price'), {
        target: { value: '180000' },
      });

      // Bấm Lưu tuyến
      fireEvent.click(screen.getByTestId('save-route-btn'));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/routes',
          expect.objectContaining({
            name: 'Bắc Ninh ⇄ Hà Nội',
            slug: 'bac-ninh-ha-noi',
            origin: 'Bắc Ninh',
            destination: 'Hà Nội',
            priceValidUntil: '2026-12-31',
            priceFrom: 180000,
          })
        );
      });
    });
  });
});
