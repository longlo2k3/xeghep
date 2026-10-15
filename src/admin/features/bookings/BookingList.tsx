import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarCheck,
  RefreshCw,
  Eye,
  Clock,
  Car,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { Select } from '@/admin/components/ui/Select';
import { Input } from '@/admin/components/ui/Input';
import { DataTable, type Column } from '@/admin/components/common/DataTable';
import { StatusBadge } from '@/admin/components/common/StatusBadge';
import { BookingDetailModal } from './BookingDetailModal';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import { useAuth } from '@/admin/context/AuthContext';
import { formatDateTime, formatVND, maskPhone } from '@/admin/lib/utils';
import type { BookingDoc } from '@/admin/types/bookings';
import type { PaginatedResponse } from '@/admin/types/api';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ duyệt (Pending)' },
  { value: 'confirmed', label: 'Đã xác nhận (Confirmed)' },
  { value: 'in_progress', label: 'Đang chạy (In Progress)' },
  { value: 'completed', label: 'Hoàn thành (Completed)' },
  { value: 'cancelled', label: 'Đã hủy (Cancelled)' },
];

const VEHICLE_TYPE_MAP: Record<string, string> = {
  '4cho': '4 chỗ',
  '5cho': '5 chỗ',
  '7cho': '7 chỗ',
  '16cho': '16 chỗ',
  guihang: 'Gửi hàng',
};

export function BookingList() {
  const { user } = useAuth();
  const isEditor = user?.role === 'editor';

  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pickupDateFilter, setPickupDateFilter] = useState('');

  // Modal Chi tiết & Xử lý
  const [selectedBooking, setSelectedBooking] = useState<BookingDoc | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get<PaginatedResponse<BookingDoc> | BookingDoc[]>(
        '/bookings',
        {
          params: {
            limit: 200,
            sort: '-createdAt',
          },
        }
      );

      const data = res.data;
      if (Array.isArray(data)) {
        setBookings(data);
      } else if (data && Array.isArray(data.docs)) {
        setBookings(data.docs);
      } else {
        setBookings([]);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Cập nhật khi xử lý xong trong modal
  const handleBookingUpdated = (updated: BookingDoc) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
    );
    setSelectedBooking(updated);
  };

  // Tính toán tóm tắt thống kê
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const inProgress = bookings.filter((b) => b.status === 'in_progress').length;
    const completedToday = bookings.filter((b) => {
      if (b.status !== 'completed') return false;
      const pickupDate = b.pickupDatetime ? b.pickupDatetime.slice(0, 10) : '';
      const updatedDate = b.updatedAt ? b.updatedAt.slice(0, 10) : '';
      return pickupDate === todayStr || updatedDate === todayStr;
    }).length;

    return { pending, inProgress, completedToday };
  }, [bookings]);

  // Lọc dữ liệu client-side
  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      // 1. Lọc theo trạng thái
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      // 2. Lọc theo ngày đón (pickupDatetime dạng YYYY-MM-DD...)
      if (pickupDateFilter) {
        if (!item.pickupDatetime || !item.pickupDatetime.startsWith(pickupDateFilter)) {
          return false;
        }
      }

      // 3. Tìm kiếm theo mã đơn, tên khách, số điện thoại
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const code = String(item.bookingCode || item.id || '').toLowerCase();
        const name = String(item.customerName || '').toLowerCase();
        const phone = String(item.customerPhone || '').toLowerCase();
        const pickup = String(item.pickupLocation || '').toLowerCase();
        const dropoff = String(item.dropoffLocation || '').toLowerCase();

        const match =
          code.includes(q) ||
          name.includes(q) ||
          phone.includes(q) ||
          pickup.includes(q) ||
          dropoff.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [bookings, selectedStatus, pickupDateFilter, searchQuery]);

  const columns: Column<BookingDoc>[] = [
    {
      key: 'bookingCode',
      header: 'Mã đơn',
      sortable: true,
      className: 'w-28 font-mono font-medium',
      render: (item) => (
        <span className="text-blue-400 font-semibold">
          {item.bookingCode ? item.bookingCode : `#${item.id}`}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'Khách hàng',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-white block">{item.customerName}</span>
        </div>
      ),
    },
    {
      key: 'customerPhone',
      header: 'Số điện thoại',
      className: 'w-32',
      render: (item) => {
        const phone = isEditor ? maskPhone(item.customerPhone) : item.customerPhone;
        return (
          <span
            data-testid={`booking-phone-${item.id}`}
            className="font-mono text-emerald-400 font-medium"
          >
            {phone}
          </span>
        );
      },
    },
    {
      key: 'route',
      header: 'Lộ trình đón trả',
      render: (item) => (
        <div className="max-w-xs space-y-0.5">
          <div className="text-slate-200 truncate font-medium">
            {item.pickupLocation}
          </div>
          <div className="text-slate-400 text-[11px] truncate">
            → {item.dropoffLocation}
          </div>
        </div>
      ),
    },
    {
      key: 'pickupDatetime',
      header: 'Ngày giờ đón',
      sortable: true,
      className: 'w-36',
      render: (item) => (
        <span className="text-slate-600">
          {formatDateTime(item.pickupDatetime)}
        </span>
      ),
    },
    {
      key: 'vehicleType',
      header: 'Loại xe',
      className: 'w-24',
      render: (item) => (
        <span className="text-slate-700 font-medium">
          {VEHICLE_TYPE_MAP[item.vehicleType] || item.vehicleType}
        </span>
      ),
    },
    {
      key: 'estimatedPrice',
      header: 'Giá dự tính',
      sortable: true,
      className: 'w-28 text-right',
      align: 'right',
      render: (item) => (
        <span className="font-semibold text-amber-400">
          {formatVND(item.estimatedPrice)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      className: 'w-32',
      render: (item) => <StatusBadge status={item.status} type="booking" />,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center',
      className: 'w-28',
      render: (item) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs h-8 border-slate-200 hover:bg-slate-50 text-blue-600 hover:text-blue-700"
          onClick={() => {
            setSelectedBooking(item);
            setIsDetailModalOpen(true);
          }}
          data-testid={`booking-detail-btn-${item.id}`}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            <span>Quản lý Đơn đặt xe & Điều phối</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tiếp nhận, kiểm tra và phân bổ tài xế cho các chuyến xe liên tỉnh
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchBookings}
          disabled={isLoading}
          className="self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`}
          />
          Làm mới
        </Button>
      </div>

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={fetchBookings}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-100"
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Khối tóm tắt thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Đơn mới chờ duyệt */}
        <div
          data-testid="stat-pending"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">Đơn mới chờ duyệt</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {stats.pending}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Cần tiếp nhận & xác nhận</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Đang chạy */}
        <div
          data-testid="stat-in-progress"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">Đang chạy</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">
              {stats.inProgress}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Tài xế đang vận chuyển</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Car className="w-5 h-5" />
          </div>
        </div>

        {/* Hoàn thành trong ngày */}
        <div
          data-testid="stat-completed"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">Hoàn thành hôm nay</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.completedToday}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Chuyến xe đã kết thúc</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu chính với DataTable */}
      <DataTable
        data={filteredBookings}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Tìm mã đơn, tên, SĐT, điểm đón/trả..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterSlot={
          <div className="flex flex-wrap items-center gap-2">
            {/* Lọc Trạng thái */}
            <div className="w-48">
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={STATUS_FILTER_OPTIONS}
                data-testid="status-filter"
              />
            </div>

            {/* Lọc Ngày đón */}
            <div className="w-44">
              <Input
                type="date"
                value={pickupDateFilter}
                onChange={(e) => setPickupDateFilter(e.target.value)}
                data-testid="pickup-date-filter"
                placeholder="Ngày đón..."
              />
            </div>

            {pickupDateFilter && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPickupDateFilter('')}
                className="text-xs text-slate-500 hover:text-slate-800"
                title="Bỏ lọc ngày"
              >
                Xóa ngày
              </Button>
            )}
          </div>
        }
        emptyTitle="Không có đơn đặt xe nào"
        emptyMessage="Chưa có bản ghi đơn đặt xe phù hợp với bộ lọc hoặc từ khóa tìm kiếm."
      />

      {/* Modal Chi tiết đơn đặt xe */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBooking(null);
        }}
        onStatusUpdated={handleBookingUpdated}
      />
    </div>
  );
}

export default BookingList;
