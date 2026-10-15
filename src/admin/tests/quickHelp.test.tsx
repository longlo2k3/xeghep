import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QuickHelpModal } from "@/admin/components/common/QuickHelpModal";
import { HelpCenterPage } from "@/admin/features/help";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("QuickHelpModal Component & Sidebar Guides", () => {
  it("hiển thị đầy đủ tiêu đề và tab hướng dẫn 9 chức năng sidebar mặc định", () => {
    const handleClose = vi.fn();

    render(
      <MemoryRouter>
        <QuickHelpModal isOpen={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    // Tiêu đề modal
    expect(
      screen.getByText("Cẩm nang Hướng dẫn & Trợ giúp Vận hành CMS"),
    ).toBeDefined();

    // Các tab điều hướng
    expect(screen.getByText("9 Chức năng Sidebar")).toBeDefined();
    expect(screen.getByText("Quy trình Xử lý đơn")).toBeDefined();
    expect(screen.getByText("Tuyến xe & Giá")).toBeDefined();
    expect(screen.getByText("Phím tắt & Mẹo")).toBeDefined();
    expect(screen.getByText("Hỗ trợ")).toBeDefined();

    // Mục đầu tiên mặc định là "Tổng quan"
    expect(
      screen.getByText("DÙNG LÀM GÌ? (MỤC ĐÍCH & VAI TRÒ CỐT LÕI)"),
    ).toBeDefined();
    expect(
      screen.getByText("DÙNG NHƯ NÀO? (HƯỚNG DẪN CÁC BƯỚC THAO TÁC)"),
    ).toBeDefined();
    expect(screen.getByText("MẸO HAY & LƯU Ý THỰC CHIẾN")).toBeDefined();
  });

  it("chuyển đổi xem chi tiết hướng dẫn của Đơn đặt xe khi bấm vào danh sách", () => {
    const handleClose = vi.fn();

    render(
      <MemoryRouter>
        <QuickHelpModal isOpen={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    // Bấm chọn chức năng "Đơn đặt xe" trong danh sách sidebar
    const bookingsItemBtn = screen.getByRole("button", { name: /Đơn đặt xe/i });
    fireEvent.click(bookingsItemBtn);

    // Kiểm tra nội dung chi tiết của "Đơn đặt xe"
    expect(
      screen.getByText(
        "Trái tim vận hành: Tiếp nhận, gọi điện tư vấn, điều phối tài xế và chốt đơn xe của khách hàng.",
      ),
    ).toBeDefined();
    expect(screen.getByText("Tiếp nhận đơn Chờ duyệt (Pending)")).toBeDefined();
    expect(screen.getByText("Xem chi tiết & Gọi điện xác nhận")).toBeDefined();
    expect(screen.getByText("Xác nhận đơn (Confirmed)")).toBeDefined();
  });

  it("chuyển đổi xem chi tiết hướng dẫn của Tuyến đường & Giá", () => {
    const handleClose = vi.fn();

    render(
      <MemoryRouter>
        <QuickHelpModal isOpen={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    const routesItemBtn = screen.getByRole("button", {
      name: /Tuyến đường & Giá/i,
    });
    fireEvent.click(routesItemBtn);

    expect(screen.getByText("Cấu hình 4 hạng vé cước & Giá từ")).toBeDefined();
    expect(screen.getByText("Bật Ghim Banner Top trang chủ")).toBeDefined();
  });

  it("chuyển đổi xem chi tiết chức năng Chuyển hướng 301", () => {
    const handleClose = vi.fn();

    render(
      <MemoryRouter>
        <QuickHelpModal isOpen={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    const redirectsItemBtn = screen.getByRole("button", {
      name: /Chuyển hướng 301/i,
    });
    fireEvent.click(redirectsItemBtn);

    expect(
      screen.getByText("Tạo tự động khi đổi Slug Tuyến đường/Bài viết"),
    ).toBeDefined();
    expect(
      screen.getByText(/Công cụ bảo vệ thứ hạng SEO chuyên sâu/),
    ).toBeDefined();
  });

  it("hỗ trợ lọc danh sách chức năng theo nhóm (Vận hành xe, Nội dung & SEO, Hệ thống)", () => {
    const handleClose = vi.fn();

    render(
      <MemoryRouter>
        <QuickHelpModal isOpen={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    // Bấm lọc nhóm "Hệ thống"
    const systemFilterBtn = screen.getByRole("button", {
      name: /Hệ thống \(2\)/i,
    });
    fireEvent.click(systemFilterBtn);

    // Cấu hình chung & Quản lý tài khoản phải xuất hiện
    expect(
      screen.getByRole("button", { name: /Cấu hình chung/i }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: /Quản lý tài khoản/i }),
    ).toBeDefined();

    // Các mục nhóm khác bị ẩn khỏi danh sách
    expect(screen.queryByRole("button", { name: /Bài viết/i })).toBeNull();
  });

  it("hỗ trợ tìm kiếm nhanh chức năng qua ô tìm kiếm", () => {
    const handleClose = vi.fn();

    render(
      <MemoryRouter>
        <QuickHelpModal isOpen={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText(
      "Tìm kiếm tính năng sidebar...",
    );
    fireEvent.change(searchInput, { target: { value: "Media" } });

    expect(
      screen.getByRole("button", { name: /Thư viện Media/i }),
    ).toBeDefined();
    expect(
      screen.queryByRole("button", { name: /Quản lý tài khoản/i }),
    ).toBeNull();
  });

  it('điều hướng tới trang chức năng và đóng modal khi bấm nút "Mở trang"', () => {
    mockNavigate.mockClear();
    const handleClose = vi.fn();

    render(
      <MemoryRouter>
        <QuickHelpModal isOpen={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    // Đang xem Tổng quan (/dashboard), bấm nút Mở trang
    const openPageBtn = screen.getByRole("button", { name: /Mở trang/i });
    fireEvent.click(openPageBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it('đóng modal khi bấm nút "Tôi đã hiểu, cảm ơn!" ở chân trang', () => {
    const handleClose = vi.fn();

    render(
      <MemoryRouter>
        <QuickHelpModal isOpen={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    const closeBtn = screen.getByRole("button", {
      name: /Tôi đã hiểu, cảm ơn!/i,
    });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe("HelpCenterPage Component (Trang Cẩm nang Riêng Biệt)", () => {
  it("hiển thị tiêu đề trang, mô tả và các tab điều hướng", () => {
    render(
      <MemoryRouter>
        <HelpCenterPage />
      </MemoryRouter>,
    );

    // Tiêu đề trang
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Cẩm nang Hướng dẫn & Trợ giúp Vận hành CMS",
      }),
    ).toBeDefined();

    // Các tab điều hướng
    expect(
      screen.getByRole("button", { name: /9 Chức năng Sidebar/i }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: /Quy trình Xử lý đơn/i }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: /Tuyến xe & Giá/i }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: /Phím tắt & Mẹo/i }),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: /Hỗ trợ/i })).toBeDefined();
  });

  it('cho phép xem chi tiết chức năng, lọc nhóm và điều hướng sang trang khi bấm "Mở trang"', () => {
    mockNavigate.mockClear();

    render(
      <MemoryRouter>
        <HelpCenterPage />
      </MemoryRouter>,
    );

    // Mặc định tab 1 hiển thị Tổng quan
    expect(
      screen.getByText("DÙNG LÀM GÌ? (MỤC ĐÍCH & VAI TRÒ CỐT LÕI)"),
    ).toBeDefined();

    // Bấm nút Mở trang -> điều hướng tới /dashboard
    const openPageBtn = screen.getByRole("button", { name: /Mở trang/i });
    fireEvent.click(openPageBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");

    // Chuyển sang chọn Đơn đặt xe
    const bookingsItemBtn = screen.getByRole("button", { name: /Đơn đặt xe/i });
    fireEvent.click(bookingsItemBtn);
    expect(
      screen.getAllByText(
        "Trái tim vận hành: Tiếp nhận, gọi điện tư vấn, điều phối tài xế và chốt đơn xe của khách hàng.",
      ).length,
    ).toBeGreaterThanOrEqual(1);

    // Lọc theo nhóm Hệ thống
    const systemFilterBtn = screen.getByRole("button", {
      name: /Hệ thống \(2\)/i,
    });
    fireEvent.click(systemFilterBtn);
    expect(
      screen.getByRole("button", { name: /Cấu hình chung/i }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: /Quản lý tài khoản/i }),
    ).toBeDefined();
    expect(screen.queryByRole("button", { name: /Bài viết/i })).toBeNull();
  });

  it("chuyển tab xem Quy trình Xử lý đơn, Tuyến xe & Giá, Phím tắt, Hỗ trợ", () => {
    render(
      <MemoryRouter>
        <HelpCenterPage />
      </MemoryRouter>,
    );

    // Chuyển sang tab Quy trình Xử lý đơn
    fireEvent.click(
      screen.getByRole("button", { name: /Quy trình Xử lý đơn/i }),
    );
    expect(screen.getByText(/Quy tắc vàng 5 phút:/i)).toBeDefined();
    expect(
      screen.getByText(/Tiếp nhận đơn Chờ duyệt \(Pending\)/i),
    ).toBeDefined();

    // Chuyển sang tab Tuyến xe & Giá
    fireEvent.click(screen.getByRole("button", { name: /Tuyến xe & Giá/i }));
    expect(screen.getByText(/Ghim Banner Top là gì\?/i)).toBeDefined();
    expect(screen.getByText(/Cấu hình 4 hạng vé cước & Giá từ/i)).toBeDefined();

    // Chuyển sang tab Phím tắt & Mẹo
    fireEvent.click(screen.getByRole("button", { name: /Phím tắt & Mẹo/i }));
    expect(screen.getByText("Ctrl + K")).toBeDefined();

    // Chuyển sang tab Hỗ trợ
    fireEvent.click(screen.getByRole("button", { name: /Hỗ trợ/i }));
    expect(screen.getByText("0962.298.293")).toBeDefined();
  });
});
