import { Badge, type BadgeVariant, type BadgeSize } from '@/admin/components/ui/Badge';
import type { BookingStatus } from '@/admin/types/bookings';

export type StatusCategory = 'booking' | 'article' | 'route' | 'page' | 'auto';

export interface StatusBadgeProps {
  status: BookingStatus | string | boolean | null | undefined;
  type?: StatusCategory;
  className?: string;
  size?: BadgeSize;
}

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

const bookingStatusMap: Record<BookingStatus, StatusConfig> = {
  pending: { label: 'Chờ xử lý', variant: 'warning' },
  confirmed: { label: 'Đã nhận đơn', variant: 'info' },
  in_progress: { label: 'Đang chạy', variant: 'info' },
  completed: { label: 'Hoàn thành', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'destructive' },
};

const articleStatusMap: Record<string, StatusConfig> = {
  draft: { label: 'Bản nháp', variant: 'secondary' },
  published: { label: 'Đã xuất bản', variant: 'success' },
  archived: { label: 'Lưu trữ', variant: 'warning' },
};

const routeStatusMap: Record<string, StatusConfig> = {
  active: { label: 'Hoạt động', variant: 'success' },
  draft: { label: 'Bản nháp', variant: 'secondary' },
  inactive: { label: 'Tạm dừng', variant: 'warning' },
  archived: { label: 'Lưu trữ', variant: 'warning' },
};

const pageStatusMap: Record<string, StatusConfig> = {
  published: { label: 'Đã xuất bản', variant: 'success' },
  draft: { label: 'Bản nháp', variant: 'secondary' },
};

export function getStatusConfig(
  status: string | boolean | null | undefined,
  type: StatusCategory = 'auto'
): StatusConfig {
  if (status === null || status === undefined) {
    return { label: 'Chưa xác định', variant: 'secondary' };
  }

  const strStatus = typeof status === 'boolean' ? String(status) : String(status).toLowerCase();

  if (type === 'booking' && strStatus in bookingStatusMap) {
    return bookingStatusMap[strStatus as BookingStatus];
  }

  if (type === 'article' && strStatus in articleStatusMap) {
    return articleStatusMap[strStatus];
  }

  if (type === 'route' && strStatus in routeStatusMap) {
    return routeStatusMap[strStatus];
  }

  if (type === 'page' && strStatus in pageStatusMap) {
    return pageStatusMap[strStatus];
  }

  // Auto detect
  if (strStatus in bookingStatusMap) {
    return bookingStatusMap[strStatus as BookingStatus];
  }
  if (strStatus in articleStatusMap) {
    return articleStatusMap[strStatus];
  }
  if (strStatus in routeStatusMap) {
    return routeStatusMap[strStatus];
  }

  return { label: String(status), variant: 'secondary' };
}

export function StatusBadge({
  status,
  type = 'auto',
  className,
  size = 'sm',
}: StatusBadgeProps) {
  const { label, variant } = getStatusConfig(status, type);

  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  );
}

export default StatusBadge;
