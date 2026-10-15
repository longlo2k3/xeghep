import { Modal } from '@/admin/components/ui/Modal';
import { Button } from '@/admin/components/ui/Button';
import { StatusBadge } from '@/admin/components/common/StatusBadge';
import { useAuth } from '@/admin/context/AuthContext';
import { formatDateTime, formatVND, maskPhone } from '@/admin/lib/utils';
import type { BookingDoc } from '@/admin/types/bookings';
import {
  User,
  MapPin,
  FileText,
  CreditCard,
} from 'lucide-react';

export interface BookingDetailModalProps {
  booking: BookingDoc | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: (updatedBooking: BookingDoc) => void;
}

export function BookingDetailModal({
  booking,
  isOpen,
  onClose,
  onStatusUpdated,
}: BookingDetailModalProps) {
  const { user } = useAuth();

  if (!booking) return null;

  const isEditor = user?.role === 'editor';
  const displayedPhone = isEditor
    ? maskPhone(booking.customerPhone)
    : booking.customerPhone;

  // Tên loại xe hiển thị
  const vehicleTypeMap: Record<string, string> = {
    '4cho': '4 chỗ',
    '5cho': '5 chỗ',
    '7cho': '7 chỗ',
    '16cho': '16 chỗ',
    guihang: 'Gửi hàng',
  };
  const vehicleLabel = vehicleTypeMap[booking.vehicleType] || booking.vehicleType;

  // Loại dịch vụ & hình thức
  const serviceLabel = booking.serviceType === 'parcel' ? 'Gửi hàng / Bưu phẩm' : 'Chở khách';
  const rideLabel =
    booking.rideType === 'ghep'
      ? 'Đi ghép (Tiết kiệm)'
      : booking.rideType === 'bao'
      ? 'Bao xe trọn gói'
      : 'Tiêu chuẩn';

  // Chiều sân bay
  const directionMap: Record<string, string> = {
    to_airport: 'Đi sân bay',
    from_airport: 'Đón tại sân bay',
    round_trip: 'Khứ hồi',
  };
  const directionLabel = booking.airportDirection
    ? directionMap[booking.airportDirection] || booking.airportDirection
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-wrap items-center gap-3">
          <span>Chi tiết Đơn đặt xe #{booking.bookingCode || booking.id}</span>
          <StatusBadge status={booking.status} type="booking" />
        </div>
      }
      description={`Tạo lúc: ${formatDateTime(booking.createdAt)} • Cập nhật: ${formatDateTime(booking.updatedAt)}`}
      size="2xl"
      footer={
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-6 text-xs text-slate-700">
        {/* Khối Thông tin khách hàng & Chuyến đi (Grid 2 cột) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Thông tin khách hàng */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Thông tin Khách hàng</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Họ và tên:</span>
                <span className="font-semibold text-slate-800">{booking.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Số điện thoại:</span>
                <span
                  data-testid="detail-customer-phone"
                  className="font-mono font-medium text-emerald-600"
                >
                  {displayedPhone}
                </span>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block mb-1">Ghi chú của khách:</span>
                <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  {booking.note || 'Không có ghi chú thêm từ khách hàng.'}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin chuyến đi */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Lộ trình & Chuyến đi</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-500 shrink-0">Điểm đón:</span>
                <span className="font-medium text-slate-800 text-right">
                  {booking.pickupLocation}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-500 shrink-0">Điểm trả:</span>
                <span className="font-medium text-slate-800 text-right">
                  {booking.dropoffLocation}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Thời gian đón:</span>
                <span className="font-medium text-blue-600">
                  {formatDateTime(booking.pickupDatetime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Loại xe / Dịch vụ:</span>
                <span className="text-slate-800">
                  {vehicleLabel} • {serviceLabel}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Hình thức / Số khách:</span>
                <span className="text-slate-800">
                  {rideLabel} {booking.passengerCount ? `(${booking.passengerCount} người)` : ''}
                </span>
              </div>
              {directionLabel && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Chiều sân bay:</span>
                  <span className="text-indigo-600">{directionLabel}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Khối Thanh toán & Điều phối (Grid 2 cột) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Thông tin thanh toán */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>Thông tin Thanh toán</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Giá dự tính:</span>
                <span className="font-semibold text-slate-800">
                  {formatVND(booking.estimatedPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Giá thực tế (final):</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {booking.finalPrice ? formatVND(booking.finalPrice) : 'Chưa cập nhật'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Hình thức thanh toán:</span>
                <span className="text-slate-800">
                  {booking.paymentMethod === 'cash'
                    ? 'Tiền mặt'
                    : booking.paymentMethod === 'transfer'
                    ? 'Chuyển khoản'
                    : 'Chưa xác định'}
                </span>
              </div>
              {booking.depositAmount ? (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Đặt cọc trước:</span>
                  <span className="text-amber-600">{formatVND(booking.depositAmount)}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Ghi chú điều phối & Lý do hủy */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Ghi chú điều phối</span>
            </h4>
            <div className="space-y-2">
              <div>
                <span className="text-slate-500 block mb-1">Ghi chú điều phối (Dispatcher):</span>
                <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  {booking.dispatcherNote || 'Không có ghi chú điều phối.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default BookingDetailModal;
