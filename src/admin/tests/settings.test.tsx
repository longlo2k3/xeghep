import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CompanySettingsForm } from '@/admin/features/settings/CompanySettingsForm';
import { PricingSettingsForm } from '@/admin/features/settings/PricingSettingsForm';
import { SettingsPage } from '@/admin/features/settings/SettingsPage';
import { AirportPricingTable } from '@/admin/features/pricing/AirportPricingTable';
import { DistanceRatesTable } from '@/admin/features/pricing/DistanceRatesTable';
import { PricingPage } from '@/admin/features/pricing/PricingPage';
import { apiClient } from '@/admin/lib/api-client';

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

const mockCompanySettings = {
  identity: {
    companyName: 'Công ty Cổ phần Vận tải Xe Ghép Test',
    brandName: 'Xe Ghép Test',
    website: 'https://test.xegheplientinh.vn',
    taxCode: '0109999999',
  },
  contact: {
    hotline: '0962.298.293',
    hotlineRaw: '0962298293',
    email: 'support@test.vn',
    zaloUrl: 'https://zalo.me/0962298293',
    fanpageName: 'Xe Ghép Fanpage',
    fanpageUrl: 'https://facebook.com/xegheptest',
  },
  location: {
    address: '123 Đường Láng, Đống Đa, Hà Nội',
  },
  banner: {
    heroTitleLine1: 'XE GHÉP THEO YÊU CẦU',
    heroTitleLine2: 'ĐẶT XE NHANH',
    heroDescription: 'Đón khách tận nơi.',
  },
  commitments: [
    { title: 'Cam kết 1', description: 'Mô tả cam kết 1', iconName: 'Clock' },
    { title: 'Cam kết 2', description: 'Mô tả cam kết 2', iconName: 'ShieldCheck' },
  ],
  paymentMethods: [
    { title: 'Tiền mặt', description: 'Trả sau', iconName: 'Banknote' },
  ],
  testimonials: [
    { author: 'Bác Ba', location: 'Hà Nội', content: 'Xe rất tốt', rating: 5, isVisible: true },
  ],
};

const mockPricingSettings = {
  minLeadTimeMinutes: 20,
  freeCancelMinutes: 45,
  maxPassengersPerShareTrip: 3,
  returningCustomerDiscountPercent: 10,
  priceValidUntil: '2026-12-31',
  priceValidUntilWarning: null,
  overnightNote: 'Phụ thu đêm 50k',
  overnightPhone: '0858.911.247',
  holidayNote: 'Tết phụ thu 20%',
  waitingFreeMinutes: 30,
  waitingFeePerHour: 60000,
  roundTripDiscountText: 'Giảm 25% chiều về',
  tollsNote: 'Đã gồm phí cao tốc',
  parcelFromPrice: 150000,
  parcelDeliveryText: '2–4 giờ',
};

describe('Settings & Pricing Module (Task T118)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CompanySettingsForm Component', () => {
    it('nạp dữ liệu từ GET /api/globals/company-settings và hiển thị đầy đủ thông tin doanh nghiệp', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCompanySettings });

      render(
        <MemoryRouter>
          <CompanySettingsForm />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/globals/company_settings');
      });

      expect(screen.getByDisplayValue('Công ty Cổ phần Vận tải Xe Ghép Test')).toBeDefined();
      expect(screen.getByDisplayValue('Xe Ghép Test')).toBeDefined();
      expect(screen.getByDisplayValue('0962.298.293')).toBeDefined();
      expect(screen.getByDisplayValue('support@test.vn')).toBeDefined();
      expect(screen.getByDisplayValue('123 Đường Láng, Đống Đa, Hà Nội')).toBeDefined();
      expect(screen.getByDisplayValue('0109999999')).toBeDefined();
      expect(screen.getByDisplayValue('XE GHÉP THEO YÊU CẦU')).toBeDefined();
    });

    it('cho phép thêm cam kết mới và lưu thành công qua POST /api/globals/company_settings', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCompanySettings });
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { message: 'OK' } });

      render(
        <MemoryRouter>
          <CompanySettingsForm />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Công ty Cổ phần Vận tải Xe Ghép Test')).toBeDefined();
      });

      const addCommitmentBtn = screen.getByRole('button', { name: /Thêm cam kết/i });
      fireEvent.click(addCommitmentBtn);
      fireEvent.change(screen.getByDisplayValue('XE GHÉP THEO YÊU CẦU'), {
        target: { value: 'XE GHÉP MỚI' },
      });

      const submitBtn = screen.getByRole('button', { name: /Lưu cấu hình Doanh nghiệp/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/globals/company_settings',
          expect.objectContaining({
            identity: expect.objectContaining({
              companyName: 'Công ty Cổ phần Vận tải Xe Ghép Test',
            }),
            banner: expect.objectContaining({ heroTitleLine1: 'XE GHÉP MỚI' }),
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/Cập nhật thông tin doanh nghiệp thành công/i)).toBeDefined();
      });
    });
  });

  describe('PricingSettingsForm Component', () => {
    it('nạp cấu hình giá từ GET /api/globals/pricing_settings và hiển thị các trường cấu hình', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPricingSettings });

      render(
        <MemoryRouter>
          <PricingSettingsForm />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/globals/pricing_settings');
      });

      expect(screen.getByDisplayValue('2026-12-31')).toBeDefined();
      expect(screen.getByDisplayValue('20')).toBeDefined();
      expect(screen.getByDisplayValue('Phụ thu đêm 50k')).toBeDefined();
      expect(screen.getByDisplayValue('Tết phụ thu 20%')).toBeDefined();
    });

    it('yêu cầu bắt buộc hạn áp dụng bảng giá (priceValidUntil theo constitution SCH-1)', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { ...mockPricingSettings, priceValidUntil: '' },
      });

      render(
        <MemoryRouter>
          <PricingSettingsForm />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/globals/pricing_settings');
      });

      const dateInput = screen.getByLabelText(/Ngày hết hạn bảng giá/i);
      fireEvent.change(dateInput, { target: { value: '' } });

      const submitBtn = screen.getByRole('button', { name: /Lưu cấu hình Giá chung/i });
      fireEvent.submit(submitBtn.closest('form')!);

      await waitFor(() => {
        expect(screen.getByText(/Hạn áp dụng bảng giá \(priceValidUntil\) là bắt buộc/i)).toBeDefined();
      });
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('lưu cấu hình giá thành công qua POST /api/globals/pricing_settings', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPricingSettings });
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { message: 'OK' } });

      render(
        <MemoryRouter>
          <PricingSettingsForm />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('2026-12-31')).toBeDefined();
      });

      const minLeadInput = screen.getByLabelText(/Thời gian đặt trước tối thiểu/i);
      fireEvent.change(minLeadInput, { target: { value: '25' } });

      const submitBtn = screen.getByRole('button', { name: /Lưu cấu hình Giá chung/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/globals/pricing_settings',
          expect.objectContaining({
            priceValidUntil: '2026-12-31',
            minLeadTimeMinutes: 25,
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/Cập nhật cấu hình giá chung và chính sách thành công/i)).toBeDefined();
      });
    });
  });

  describe('AirportPricingTable Component', () => {
    it('hiển thị bảng giá sân bay và cho phép chỉnh sửa mức giá', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          docs: [
            {
              id: 1,
              slug: 'ba-dinh',
              district: 'Quận Ba Đình',
              fromHanoiToAirport: { sedan5Seats: 200000, suv7Seats: 250000, van16Seats: 450000 },
              fromAirportToHanoi: { sedan5Seats: 250000, suv7Seats: 300000, van16Seats: 500000 },
              roundTrip: { sedan5Seats: 400000, suv7Seats: 500000, van16Seats: 850000 },
              isActive: true,
            },
          ],
        },
      });

      render(
        <MemoryRouter>
          <AirportPricingTable />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/airport_pricing', expect.any(Object));
      });

      expect(screen.getByText('Quận Ba Đình')).toBeDefined();
      expect(screen.getByText(/200.000 ₫/i)).toBeDefined();

      // Mở modal sửa giá
      const editBtn = screen.getByRole('button', { name: /Sửa giá/i });
      fireEvent.click(editBtn);

      expect(screen.getByText(/Chỉnh sửa giá cước: Quận Ba Đình/i)).toBeDefined();

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { doc: { id: 1, district: 'Quận Ba Đình' } },
      });

      const saveBtn = screen.getByRole('button', { name: /Lưu thay đổi/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(apiClient.patch).toHaveBeenCalledWith('/airport_pricing/1', expect.any(Object));
      });
    });
  });

  describe('DistanceRatesTable Component', () => {
    it('hiển thị 4 dải km đường dài và các chính sách phụ phí đi kèm', async () => {
      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({
          data: {
            docs: [
              {
                id: 1,
                label: 'Dải 1: Dưới 100 km',
                minKm: 30,
                maxKm: 100,
                sedan5Seats: 10000,
                suv7Seats: 12000,
                van16Seats: 18000,
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            roundTripDiscountText: 'Giảm 20% chiều về',
            waitingFreeMinutes: 30,
            waitingFeePerHour: 60000,
            overnightNote: 'Phụ phí đêm 30k',
          },
        });

      render(
        <MemoryRouter>
          <DistanceRatesTable />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/distance_rates', expect.any(Object));
      });

      expect(screen.getByText(/Dải 1: Dưới 100 km/i)).toBeDefined();
      expect(screen.getByText(/Giảm giá khứ hồi/i)).toBeDefined();
      expect(screen.getByRole('heading', { name: /Chờ miễn phí/i })).toBeDefined();
      expect(screen.getByText(/Phí chờ theo giờ/i)).toBeDefined();
    });
  });

  describe('SettingsPage and PricingPage Tab Switching', () => {
    it('SettingsPage chỉ còn tab Thông tin Doanh nghiệp (tab "Cấu hình Giá chung" đã chuyển sang trang /pricing riêng)', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCompanySettings });

      render(
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      );

      expect(screen.getByText('Cấu hình Hệ thống')).toBeDefined();
      expect(
        screen.getByRole('button', { name: /Thông tin Doanh nghiệp & Thương hiệu/i }),
      ).toBeDefined();
      expect(screen.queryByRole('button', { name: /Cấu hình Giá chung/i })).toBeNull();
    });

    it('chuyển tab trong PricingPage giữa Sân bay và Đường dài theo km', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { docs: [] } });

      render(
        <MemoryRouter>
          <PricingPage />
        </MemoryRouter>
      );

      expect(screen.getByText('Bảng giá phụ & Cước mở rộng')).toBeDefined();

      const distanceTabBtn = screen.getByRole('button', { name: /Bảng giá Đường dài theo km/i });
      fireEvent.click(distanceTabBtn);

      await waitFor(() => {
        expect(screen.getByText(/Bảng giá 4 dải km đường dài theo cự ly/i)).toBeDefined();
      });
    });
  });
});
