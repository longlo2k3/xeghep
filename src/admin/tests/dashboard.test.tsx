import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthContext, { type AuthContextType } from '@/admin/context/AuthContext';
import { DashboardOverview } from '@/admin/features/dashboard/DashboardOverview';
import { apiClient } from '@/admin/lib/api-client';
import type { BookingDoc } from '@/admin/types/bookings';
import type { RouteDoc } from '@/admin/types/routes';
import type { ArticleDoc } from '@/admin/types/articles';
import type { Role, User } from '@/admin/types/auth';

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

function createMockAuth(role: Role = 'admin', fullName?: string): AuthContextType {
  const user: User = {
    id: 1,
    email: `${role}@xegheplientinh.vn`,
    fullName: fullName || `Người dùng ${role.toUpperCase()}`,
    role,
  };

  return {
    user,
    token: 'test-token',
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    hasRole: (roles: Role | Role[]) => {
      const list = Array.isArray(roles) ? roles : [roles];
      return list.includes(user.role);
    },
    refreshUser: vi.fn().mockResolvedValue(user),
  };
}

const mockBookings: BookingDoc[] = [
  {
    id: 101,
    bookingCode: 'BK-101',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0912345678',
    serviceType: 'passenger',
    pickupLocation: 'Hà Nội',
    dropoffLocation: 'Hải Phòng',
    vehicleType: '4cho',
    pickupDatetime: '2026-10-15T08:30:00Z',
    estimatedPrice: 250000,
    status: 'pending',
    createdAt: '2026-10-11T01:00:00Z',
    updatedAt: '2026-10-11T01:00:00Z',
  },
  {
    id: 102,
    bookingCode: 'BK-102',
    customerName: 'Trần Thị Bình',
    customerPhone: '0987654321',
    serviceType: 'passenger',
    pickupLocation: 'Hải Phòng',
    dropoffLocation: 'Nội Bài',
    vehicleType: '7cho',
    pickupDatetime: '2026-10-15T10:00:00Z',
    estimatedPrice: 450000,
    status: 'pending',
    createdAt: '2026-10-11T02:00:00Z',
    updatedAt: '2026-10-11T02:00:00Z',
  },
  {
    id: 103,
    bookingCode: 'BK-103',
    customerName: 'Lê Hoàng Cường',
    customerPhone: '0905123456',
    serviceType: 'passenger',
    pickupLocation: 'Hạ Long',
    dropoffLocation: 'Hà Nội',
    vehicleType: '5cho',
    pickupDatetime: '2026-10-15T14:00:00Z',
    estimatedPrice: 350000,
    status: 'confirmed',
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-10T10:00:00Z',
  },
  {
    id: 104,
    bookingCode: 'BK-104',
    customerName: 'Phạm Đức Dũng',
    customerPhone: '0977112233',
    serviceType: 'passenger',
    pickupLocation: 'Hà Nội',
    dropoffLocation: 'Bắc Giang',
    vehicleType: '4cho',
    pickupDatetime: '2026-10-14T09:00:00Z',
    finalPrice: 300000,
    paymentMethod: 'cash',
    status: 'completed',
    createdAt: '2026-10-09T10:00:00Z',
    updatedAt: '2026-10-09T10:00:00Z',
  },
];

const mockRoutes: RouteDoc[] = [
  {
    id: 1,
    slug: 'ha-noi-hai-phong',
    name: 'Hà Nội — Hải Phòng',
    origin: 'Hà Nội',
    destination: 'Hải Phòng',
    distance: '105 km',
    duration: '1h30m',
    priceFrom: 200000,
    description: 'Tuyến xe ghép Hà Nội đi Hải Phòng cao tốc',
    sortOrder: 1,
    status: 'active',
    isBannerTop: true,
    bannerLabel: 'HOT NHẤT',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 2,
    slug: 'hai-phong-noi-bai',
    name: 'Hải Phòng — Sân bay Nội Bài',
    origin: 'Hải Phòng',
    destination: 'Sân bay Nội Bài',
    distance: '120 km',
    duration: '1h45m',
    priceFrom: 400000,
    description: 'Tuyến đón trả tận nơi sân bay Nội Bài',
    sortOrder: 2,
    status: 'active',
    isBannerTop: true,
    bannerLabel: 'SÂN BAY',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 3,
    slug: 'ha-noi-quang-ninh',
    name: 'Hà Nội — Quảng Ninh',
    origin: 'Hà Nội',
    destination: 'Quảng Ninh',
    distance: '150 km',
    priceFrom: 300000,
    description: 'Tuyến xe Hà Nội Quảng Ninh tạm dừng',
    sortOrder: 3,
    status: 'inactive',
    isBannerTop: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
];

const mockArticles: ArticleDoc[] = [
  {
    id: 1,
    slug: 'kinh-nghiem-di-xe-ghep',
    title: 'Kinh nghiệm đi xe ghép Hà Nội Hải Phòng an toàn tiết kiệm',
    category: 'kinh-nghiem',
    excerpt: 'Tóm tắt kinh nghiệm đi xe',
    content: 'Nội dung bài viết',
    author: 'Admin',
    featuredImage: 1,
    status: 'published',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 2,
    slug: 'khuyen-mai-thang-10',
    title: 'Khuyến mại đặc biệt tháng 10 cho chuyến xe sân bay',
    category: 'khuyen-mai',
    excerpt: 'Ưu đãi đặt xe',
    content: 'Nội dung khuyến mại',
    author: 'Admin',
    featuredImage: 2,
    status: 'draft',
    createdAt: '2026-10-02T00:00:00Z',
    updatedAt: '2026-10-02T00:00:00Z',
  },
];

describe('DashboardOverview Module (Task T121)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url.includes('/bookings')) {
        return Promise.resolve({ data: { docs: mockBookings } }) as any;
      }
      if (url.includes('/routes')) {
        return Promise.resolve({ data: { docs: mockRoutes } }) as any;
      }
      if (url.includes('/articles')) {
        return Promise.resolve({ data: { docs: mockArticles } }) as any;
      }
      return Promise.resolve({ data: [] }) as any;
    });
  });

  it('render đầy đủ lời chào mừng và vai trò của người dùng', async () => {
    const auth = createMockAuth('admin', 'Nguyễn Quản Trị');

    render(
      <MemoryRouter>
        <AuthContext.Provider value={auth}>
          <DashboardOverview />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Xin chào, Nguyễn Quản Trị!/i)).toBeDefined();
      expect(screen.getByText('Quản trị viên (Admin)')).toBeDefined();
    });
  });

  it('render đầy đủ 4 KPI cards với dữ liệu thống kê chính xác', async () => {
    const auth = createMockAuth('admin');

    render(
      <MemoryRouter>
        <AuthContext.Provider value={auth}>
          <DashboardOverview />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Chờ tải xong dữ liệu
    await waitFor(() => {
      // KPI 1: Số đơn chờ duyệt (status = pending -> 2 đơn)
      const pendingKpi = screen.getByTestId('kpi-card-pending');
      expect(pendingKpi.textContent).toContain('2');
      expect(pendingKpi.textContent).toContain('Chờ xác nhận');

      // KPI 2: Số tuyến xe đang hoạt động (status = active -> 2 tuyến)
      const routesKpi = screen.getByTestId('kpi-card-routes');
      expect(routesKpi.textContent).toContain('2');
      expect(routesKpi.textContent).toContain('Tuyến xe hoạt động');

      // KPI 3: Số bài viết đã xuất bản (status = published -> 1 bài)
      const articlesKpi = screen.getByTestId('kpi-card-articles');
      expect(articlesKpi.textContent).toContain('1');
      expect(articlesKpi.textContent).toContain('Bài viết xuất bản');

      // KPI 4: Số đơn hoàn thành (status = completed -> 1 đơn)
      const completedKpi = screen.getByTestId('kpi-card-completed');
      expect(completedKpi.textContent).toContain('1');
      expect(completedKpi.textContent).toContain('Đơn hoàn thành');
    });
  });

  it('hiển thị widget Đơn đặt xe mới nhất cần xử lý với đầy đủ thông tin các cột', async () => {
    const auth = createMockAuth('admin');

    render(
      <MemoryRouter>
        <AuthContext.Provider value={auth}>
          <DashboardOverview />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('pending-bookings-table')).toBeDefined();
    });

    // Kiểm tra hàng đơn BK-101
    const row1 = screen.getByTestId('booking-row-101');
    expect(row1.textContent).toContain('BK-101');
    expect(row1.textContent).toContain('Nguyễn Văn An');
    expect(row1.textContent).toContain('Hà Nội → Hải Phòng');
    expect(row1.textContent).toContain('250.000 ₫');
    expect(row1.textContent).toContain('Xem & Xử lý');

    // Kiểm tra hàng đơn BK-102
    const row2 = screen.getByTestId('booking-row-102');
    expect(row2.textContent).toContain('BK-102');
    expect(row2.textContent).toContain('Trần Thị Bình');
    expect(row2.textContent).toContain('450.000 ₫');

    // Đơn BK-103 (status=confirmed) KHÔNG xuất hiện trong bảng đơn pending
    expect(screen.queryByTestId('booking-row-103')).toBeNull();
  });

  it('hiển thị widget Tuyến xe nổi bật (Banner Top) với cự ly và giá vé', async () => {
    const auth = createMockAuth('admin');

    render(
      <MemoryRouter>
        <AuthContext.Provider value={auth}>
          <DashboardOverview />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('banner-route-1')).toBeDefined();
      expect(screen.getByTestId('banner-route-2')).toBeDefined();
    });

    const route1 = screen.getByTestId('banner-route-1');
    expect(route1.textContent).toContain('Hà Nội — Hải Phòng');
    expect(route1.textContent).toContain('HOT NHẤT');
    expect(route1.textContent).toContain('105 km');
    expect(route1.textContent).toContain('200.000 ₫');

    const route2 = screen.getByTestId('banner-route-2');
    expect(route2.textContent).toContain('Hải Phòng — Sân bay Nội Bài');
    expect(route2.textContent).toContain('SÂN BAY');
    expect(route2.textContent).toContain('120 km');
    expect(route2.textContent).toContain('400.000 ₫');

    // Tuyến route 3 (isBannerTop = false) không hiển thị trong banner top
    expect(screen.queryByTestId('banner-route-3')).toBeNull();
  });

  describe('Kiểm thử phân quyền Quick Actions theo từng Role', () => {
    it('vai trò ADMIN: hiển thị đầy đủ tất cả 5 nút Quick Actions', async () => {
      const adminAuth = createMockAuth('admin');

      render(
        <MemoryRouter>
          <AuthContext.Provider value={adminAuth}>
            <DashboardOverview />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Duyệt đơn đặt xe')).toBeDefined();
        expect(screen.getByText('Tạo tuyến đường mới')).toBeDefined();
        expect(screen.getByText('Viết bài mới')).toBeDefined();
        expect(screen.getByText('Thư viện Media')).toBeDefined();
        expect(screen.getByText('Cấu hình hệ thống')).toBeDefined();
      });
    });

    it('vai trò DISPATCHER: chỉ hiển thị Duyệt đơn đặt xe, ẩn các chức năng nội dung & cấu hình', async () => {
      const dispatcherAuth = createMockAuth('dispatcher');

      render(
        <MemoryRouter>
          <AuthContext.Provider value={dispatcherAuth}>
            <DashboardOverview />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        // Có quyền duyệt đơn
        expect(screen.getByText('Duyệt đơn đặt xe')).toBeDefined();

        // Ẩn các thao tác của editor và admin
        expect(screen.queryByText('Tạo tuyến đường mới')).toBeNull();
        expect(screen.queryByText('Viết bài mới')).toBeNull();
        expect(screen.queryByText('Thư viện Media')).toBeNull();
        expect(screen.queryByText('Cấu hình hệ thống')).toBeNull();
      });
    });

    it('vai trò EDITOR: chỉ hiển thị Tạo tuyến, Viết bài, Thư viện Media, ẩn Duyệt đơn & Cấu hình', async () => {
      const editorAuth = createMockAuth('editor');

      render(
        <MemoryRouter>
          <AuthContext.Provider value={editorAuth}>
            <DashboardOverview />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      await waitFor(() => {
        // Có quyền biên tập
        expect(screen.getByText('Tạo tuyến đường mới')).toBeDefined();
        expect(screen.getByText('Viết bài mới')).toBeDefined();
        expect(screen.getByText('Thư viện Media')).toBeDefined();

        // Ẩn quyền duyệt đơn và quyền admin
        expect(screen.queryByText('Duyệt đơn đặt xe')).toBeNull();
        expect(screen.queryByText('Cấu hình hệ thống')).toBeNull();
      });
    });
  });

  it('cho phép bấm nút Làm mới để gọi lại API', async () => {
    const auth = createMockAuth('admin');

    render(
      <MemoryRouter>
        <AuthContext.Provider value={auth}>
          <DashboardOverview />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(3);
    });

    const refreshBtn = screen.getByRole('button', { name: /Làm mới/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(6);
    });
  });

  it('hiển thị empty state thân thiện khi không có đơn pending nào', async () => {
    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url.includes('/bookings')) {
        return Promise.resolve({ data: { docs: [] } }) as any;
      }
      return Promise.resolve({ data: { docs: [] } }) as any;
    });

    const auth = createMockAuth('admin');

    render(
      <MemoryRouter>
        <AuthContext.Provider value={auth}>
          <DashboardOverview />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('empty-pending-bookings')).toBeDefined();
      expect(screen.getByText(/Hiện không có đơn nào đang chờ duyệt/i)).toBeDefined();
    });
  });
});
