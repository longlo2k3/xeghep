import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Button } from '@/admin/components/ui/Button';
import { Input } from '@/admin/components/ui/Input';
import { Textarea } from '@/admin/components/ui/Textarea';
import { Select } from '@/admin/components/ui/Select';
import { Badge } from '@/admin/components/ui/Badge';
import { Modal } from '@/admin/components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/admin/components/ui/Card';
import { StatusBadge } from '@/admin/components/common/StatusBadge';
import { ConfirmDialog } from '@/admin/components/common/ConfirmDialog';
import { DataTable, type Column } from '@/admin/components/common/DataTable';

describe('UI Primitives Components', () => {
  describe('Button Component', () => {
    it('render nhãn và phản hồi sự kiện click', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Lưu thay đổi</Button>);

      const btn = screen.getByRole('button', { name: /Lưu thay đổi/i });
      expect(btn).toBeDefined();

      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('vô hiệu hóa khi disabled=true và không kích hoạt click', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Nút vô hiệu hóa
        </Button>
      );

      const btn = screen.getByRole('button', { name: /Nút vô hiệu hóa/i });
      expect((btn as HTMLButtonElement).disabled).toBe(true);

      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('hiển thị spinner và vô hiệu hóa khi isLoading=true', () => {
      const handleClick = vi.fn();
      render(
        <Button isLoading onClick={handleClick}>
          Đang xử lý
        </Button>
      );

      const btn = screen.getByRole('button');
      expect((btn as HTMLButtonElement).disabled).toBe(true);
      expect(btn.querySelector('.animate-spin')).not.toBeNull();

      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('hỗ trợ các biến thể màu sắc (variant)', () => {
      const { rerender } = render(<Button variant="destructive">Xóa dữ liệu</Button>);
      expect(screen.getByRole('button').className).toContain('bg-red-600');

      rerender(<Button variant="secondary">Hủy bỏ</Button>);
      expect(screen.getByRole('button').className).toContain('bg-slate-100');

      rerender(<Button variant="outline">Xem chi tiết</Button>);
      expect(screen.getByRole('button').className).toContain('border-slate-200');

      rerender(<Button variant="ghost">Đóng</Button>);
      expect(screen.getByRole('button').className).toContain('bg-transparent');
    });
  });

  describe('Input, Textarea & Select Components', () => {
    it('Input render nhãn, placeholder, giá trị và thông báo lỗi', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <Input
          label="Tên khách hàng"
          placeholder="Nhập họ và tên"
          onChange={handleChange}
        />
      );

      expect(screen.getByLabelText(/Tên khách hàng/i)).toBeDefined();
      const input = screen.getByPlaceholderText(/Nhập họ và tên/i);

      fireEvent.change(input, { target: { value: 'Nguyễn Văn A' } });
      expect(handleChange).toHaveBeenCalled();

      rerender(
        <Input
          label="Tên khách hàng"
          error="Tên khách hàng không được để trống"
        />
      );
      expect(screen.getByText('Tên khách hàng không được để trống')).toBeDefined();
    });

    it('Textarea render nhãn, hàng và phản hồi thay đổi', () => {
      const handleChange = vi.fn();
      render(
        <Textarea
          label="Ghi chú điều phối"
          placeholder="Nhập ghi chú..."
          rows={4}
          onChange={handleChange}
        />
      );

      const textarea = screen.getByLabelText(/Ghi chú điều phối/i);
      expect(textarea).toBeDefined();

      fireEvent.change(textarea, { target: { value: 'Khách yêu cầu xe sạch' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('Select render danh sách tùy chọn và xử lý chọn', () => {
      const handleChange = vi.fn();
      const options = [
        { value: '4cho', label: 'Xe 4 chỗ' },
        { value: '7cho', label: 'Xe 7 chỗ' },
      ];

      render(
        <Select
          label="Loại xe"
          options={options}
          onChange={handleChange}
          defaultValue="4cho"
        />
      );

      expect(screen.getByLabelText(/Loại xe/i)).toBeDefined();
      const select = screen.getByRole('combobox');
      expect((select as HTMLSelectElement).value).toBe('4cho');

      fireEvent.change(select, { target: { value: '7cho' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Badge & Card Components', () => {
    it('Badge hiển thị đúng nội dung và các biến thể', () => {
      const { rerender } = render(<Badge variant="success">Hoạt động</Badge>);
      expect(screen.getByText('Hoạt động').className).toContain('text-emerald-700');

      rerender(<Badge variant="warning">Chờ duyệt</Badge>);
      expect(screen.getByText('Chờ duyệt').className).toContain('text-amber-700');

      rerender(<Badge variant="error">Đã hủy</Badge>);
      expect(screen.getByText('Đã hủy').className).toContain('text-rose-700');
    });

    it('Card render đầy đủ cấu trúc Card, Header, Title, Content, Footer', () => {
      render(
        <Card data-testid="test-card">
          <CardHeader>
            <CardTitle>Tổng đơn hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">128</p>
          </CardContent>
          <CardFooter>
            <span>+15% so với hôm qua</span>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Tổng đơn hôm nay')).toBeDefined();
      expect(screen.getByText('128')).toBeDefined();
      expect(screen.getByText('+15% so với hôm qua')).toBeDefined();
    });
  });

  describe('Modal Primitive Component', () => {
    it('hiển thị khi isOpen=true và gọi onClose khi bấm nút đóng hoặc ESC', () => {
      const handleClose = vi.fn();
      const { rerender } = render(
        <Modal
          isOpen={true}
          onClose={handleClose}
          title="Thông tin chi tiết"
          description="Mô tả modal"
        >
          <div>Nội dung trong modal</div>
        </Modal>
      );

      expect(screen.getByText('Thông tin chi tiết')).toBeDefined();
      expect(screen.getByText('Mô tả modal')).toBeDefined();
      expect(screen.getByText('Nội dung trong modal')).toBeDefined();

      // Bấm nút đóng (X)
      const closeBtn = screen.getByRole('button', { name: /Đóng/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);

      // Phím ESC
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(2);

      // Khi isOpen=false thì biến mất
      rerender(
        <Modal isOpen={false} onClose={handleClose} title="Thông tin chi tiết">
          <div>Nội dung trong modal</div>
        </Modal>
      );
      expect(screen.queryByText('Thông tin chi tiết')).toBeNull();
    });
  });
});

describe('Common Business Components', () => {
  describe('StatusBadge Component', () => {
    it('hiển thị đúng nhãn tiếng Việt cho các trạng thái Đơn đặt xe (BookingStatus)', () => {
      const { rerender } = render(<StatusBadge status="pending" type="booking" />);
      expect(screen.getByText('Chờ xử lý')).toBeDefined();

      rerender(<StatusBadge status="confirmed" type="booking" />);
      expect(screen.getByText('Đã nhận đơn')).toBeDefined();

      rerender(<StatusBadge status="in_progress" type="booking" />);
      expect(screen.getByText('Đang chạy')).toBeDefined();

      rerender(<StatusBadge status="completed" type="booking" />);
      expect(screen.getByText('Hoàn thành')).toBeDefined();

      rerender(<StatusBadge status="cancelled" type="booking" />);
      expect(screen.getByText('Đã hủy')).toBeDefined();
    });

    it('hiển thị đúng nhãn cho Bài viết và Tuyến đường', () => {
      const { rerender } = render(<StatusBadge status="published" type="article" />);
      expect(screen.getByText('Đã xuất bản')).toBeDefined();

      rerender(<StatusBadge status="draft" type="article" />);
      expect(screen.getByText('Bản nháp')).toBeDefined();

      rerender(<StatusBadge status="active" type="route" />);
      expect(screen.getByText('Hoạt động')).toBeDefined();

      rerender(<StatusBadge status="inactive" type="route" />);
      expect(screen.getByText('Tạm dừng')).toBeDefined();
    });
  });

  describe('ConfirmDialog Component', () => {
    it('render tiêu đề, mô tả và kích hoạt các callback xác nhận / hủy', async () => {
      const handleConfirm = vi.fn().mockResolvedValue(undefined);
      const handleClose = vi.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title="Xác nhận hủy đơn hàng"
          description="Đơn hàng sẽ chuyển sang trạng thái Đã hủy."
          confirmText="Hủy đơn ngay"
          cancelText="Đóng"
          variant="destructive"
        />
      );

      expect(screen.getByText('Xác nhận hủy đơn hàng')).toBeDefined();
      expect(screen.getByText('Đơn hàng sẽ chuyển sang trạng thái Đã hủy.')).toBeDefined();

      const cancelBtn = screen.getByRole('button', { name: 'Đóng' });
      fireEvent.click(cancelBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);

      const confirmBtn = screen.getByRole('button', { name: 'Hủy đơn ngay' });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(handleConfirm).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('DataTable Component', () => {
    interface TestItem {
      id: number;
      name: string;
      role: string;
      status: string;
    }

    const testData: TestItem[] = [
      { id: 1, name: 'Nguyễn Văn An', role: 'admin', status: 'active' },
      { id: 2, name: 'Trần Thị Bình', role: 'editor', status: 'draft' },
      { id: 3, name: 'Lê Hoàng Cường', role: 'dispatcher', status: 'active' },
      { id: 4, name: 'Phạm Minh Dũng', role: 'editor', status: 'inactive' },
    ];

    const columns: Column<TestItem>[] = [
      { key: 'name', header: 'Họ và tên', sortable: true },
      { key: 'role', header: 'Vai trò' },
      {
        key: 'status',
        header: 'Trạng thái',
        render: (item) => <StatusBadge status={item.status} />,
      },
    ];

    it('render bảng dữ liệu và tiêu đề các cột chuẩn xác', () => {
      render(<DataTable data={testData} columns={columns} />);

      expect(screen.getByText('Họ và tên')).toBeDefined();
      expect(screen.getByText('Vai trò')).toBeDefined();
      expect(screen.getByText('Trạng thái')).toBeDefined();

      expect(screen.getByText('Nguyễn Văn An')).toBeDefined();
      expect(screen.getByText('Trần Thị Bình')).toBeDefined();
      expect(screen.getByText('Lê Hoàng Cường')).toBeDefined();
      expect(screen.getByText('Phạm Minh Dũng')).toBeDefined();
    });

    it('hỗ trợ tìm kiếm từ khóa cục bộ và lọc dữ liệu tương ứng', () => {
      render(
        <DataTable
          data={testData}
          columns={columns}
          searchPlaceholder="Tìm tài khoản..."
        />
      );

      const searchInput = screen.getByPlaceholderText('Tìm tài khoản...');
      fireEvent.change(searchInput, { target: { value: 'Bình' } });

      expect(screen.getByText('Trần Thị Bình')).toBeDefined();
      expect(screen.queryByText('Nguyễn Văn An')).toBeNull();
      expect(screen.queryByText('Lê Hoàng Cường')).toBeNull();
    });

    it('sắp xếp cột tăng dần và giảm dần khi nhấp vào cột sortable', () => {
      render(<DataTable data={testData} columns={columns} />);

      const sortHeader = screen.getByText('Họ và tên');
      // Nhấp lần 1: Sort tăng dần
      fireEvent.click(sortHeader);
      const cellsAsc = screen.getAllByRole('cell');
      expect(cellsAsc[0].textContent).toContain('Lê Hoàng Cường');

      // Nhấp lần 2: Sort giảm dần
      fireEvent.click(sortHeader);
      const cellsDesc = screen.getAllByRole('cell');
      expect(cellsDesc[0].textContent).toContain('Trần Thị Bình');
    });

    it('hiển thị trạng thái đang tải (Loading spinner) khi isLoading=true', () => {
      render(<DataTable data={testData} columns={columns} isLoading={true} />);

      expect(screen.getByText('Đang tải dữ liệu...')).toBeDefined();
      expect(screen.queryByText('Nguyễn Văn An')).toBeNull();
    });

    it('hiển thị thông điệp rỗng (Empty state) tiếng Việt thân thiện khi không có dữ liệu', () => {
      render(
        <DataTable
          data={[]}
          columns={columns}
          emptyTitle="Chưa có tài khoản nào"
          emptyMessage="Vui lòng bấm nút Thêm mới để tạo tài khoản đầu tiên."
        />
      );

      expect(screen.getByText('Chưa có tài khoản nào')).toBeDefined();
      expect(
        screen.getByText('Vui lòng bấm nút Thêm mới để tạo tài khoản đầu tiên.')
      ).toBeDefined();
    });

    it('hỗ trợ phân trang: chuyển trang tiếp theo và trang trước đó', () => {
      const manyItems: TestItem[] = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `Người dùng ${i + 1}`,
        role: 'editor',
        status: 'active',
      }));

      render(
        <DataTable data={manyItems} columns={columns} pageSize={10} />
      );

      // Trang 1: Người dùng 1 -> Người dùng 10
      expect(screen.getByText('Người dùng 1')).toBeDefined();
      expect(screen.getByText('Người dùng 10')).toBeDefined();
      expect(screen.queryByText('Người dùng 11')).toBeNull();
      expect(screen.getByText('Trang 1 / 2')).toBeDefined();

      // Nhấp nút trang sau
      const nextBtn = screen.getByTitle('Trang sau');
      fireEvent.click(nextBtn);

      // Trang 2: Người dùng 11 -> Người dùng 15
      expect(screen.getByText('Người dùng 11')).toBeDefined();
      expect(screen.getByText('Người dùng 15')).toBeDefined();
      expect(screen.queryByText('Người dùng 1')).toBeNull();
      expect(screen.getByText('Trang 2 / 2')).toBeDefined();
    });
  });
});
