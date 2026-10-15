import {
  Clock,
  Navigation,
  Car,
  Users,
  Star,
  Edit,
  Calendar,
  FileText,
  Tag,
} from 'lucide-react';
import { Modal } from '@/admin/components/ui/Modal';
import { Button } from '@/admin/components/ui/Button';
import { Badge } from '@/admin/components/ui/Badge';
import { StatusBadge } from '@/admin/components/common/StatusBadge';
import { formatDateTime, formatVND } from '@/admin/lib/utils';
import type { RouteDoc, PriceTier } from '@/admin/types/routes';

export interface RouteDetailModalProps {
  route: RouteDoc | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (route: RouteDoc) => void;
}

function renderTierPrice(tier?: PriceTier | null) {
  if (!tier) {
    return <span className="text-slate-400 italic">Chưa thiết lập</span>;
  }
  if (tier.negotiable) {
    return (
      <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
        Giá thỏa thuận
      </span>
    );
  }
  if (tier.from && tier.min) {
    return (
      <span className="font-bold text-emerald-600">
        Từ {formatVND(tier.min)}
      </span>
    );
  }
  if (tier.min && tier.max) {
    return (
      <span className="font-bold text-emerald-600">
        {formatVND(tier.min)} – {formatVND(tier.max)}
      </span>
    );
  }
  if (tier.min) {
    return (
      <span className="font-bold text-emerald-600">
        {formatVND(tier.min)}
      </span>
    );
  }
  return <span className="text-slate-400 italic">Liên hệ</span>;
}

export function RouteDetailModal({
  route,
  isOpen,
  onClose,
  onEdit,
}: RouteDetailModalProps) {
  if (!route) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-wrap items-center gap-2 pr-6">
          <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {route.name}
          </span>
          <StatusBadge type="route" status={route.status} />
          {route.isBannerTop && (
            <Badge
              variant="warning"
              size="sm"
              className="bg-amber-100 text-amber-800 border-amber-300 font-semibold"
            >
              <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500 shrink-0" />
              <span>{route.bannerLabel || 'Banner Top'}</span>
            </Badge>
          )}
        </div>
      }
      description={
        <span className="text-xs text-slate-500 font-mono">
          Slug: /{route.slug} • Mã ID: #{route.id}
        </span>
      }
      size="2xl"
    >
      <div className="space-y-5 text-xs text-slate-700">
        {/* 1. Khối Thông tin Lộ trình & Vận hành */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            Lộ trình & Thông tin vận hành
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[11px]">Điểm xuất phát</span>
              <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                {route.origin || 'Chưa cập nhật'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[11px]">Điểm đến</span>
              <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                {route.destination || 'Chưa cập nhật'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[11px]">Cự ly di chuyển</span>
              <span className="font-bold text-blue-600 text-sm mt-0.5 block">
                {route.distance || 'Đang cập nhật'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[11px]">Thời gian dự kiến</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {route.duration || 'Đang cập nhật'}
              </span>
            </div>
          </div>

          {/* Vùng miền & Giờ xe chạy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2 text-slate-600">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Vùng miền phục vụ:</span>
              <div className="flex flex-wrap gap-1">
                {route.regions && route.regions.length > 0 ? (
                  route.regions.map((reg) => (
                    <span
                      key={reg}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium border border-blue-200"
                    >
                      {reg}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">Tất cả khu vực</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Giờ xe chạy:</span>
              <span className="font-medium text-slate-800">
                {route.operatingHoursText || 'Liên tục trong ngày'}
              </span>
            </div>
          </div>

          {/* Điểm đón trả cụ thể */}
          {((route.pickups && route.pickups.length > 0) ||
            (route.dropoffs && route.dropoffs.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 block mb-1">
                  📍 Điểm đón phổ biến:
                </span>
                <div className="flex flex-wrap gap-1">
                  {route.pickups?.map((p, idx) => (
                    <span
                      key={p.id || idx}
                      className="px-2 py-0.5 bg-slate-100 rounded text-[11px] text-slate-700"
                    >
                      {p.text}
                    </span>
                  )) || <span className="text-slate-400">Đón trả tận nơi</span>}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-800 block mb-1">
                  🏁 Điểm trả phổ biến:
                </span>
                <div className="flex flex-wrap gap-1">
                  {route.dropoffs?.map((d, idx) => (
                    <span
                      key={d.id || idx}
                      className="px-2 py-0.5 bg-slate-100 rounded text-[11px] text-slate-700"
                    >
                      {d.text}
                    </span>
                  )) || <span className="text-slate-400">Trả tận nơi theo yêu cầu</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Khối Chi tiết Bảng giá 4 hạng vé */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-600" />
              Bảng giá cước chi tiết theo 4 hạng vé
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Giá khởi điểm từ:</span>
              <span className="font-extrabold text-emerald-600 text-sm">
                {route.priceFrom ? formatVND(route.priceFrom) : 'Thỏa thuận'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Hạng 1: Ghép 1 khách */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Ghép 1 người</span>
              </div>
              <p className="text-[11px] text-slate-400">Đi ghép ghế đơn</p>
              <div className="pt-1.5">{renderTierPrice(route.tierShare1)}</div>
            </div>

            {/* Hạng 2: Ghép 2 khách */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ghép 2 người</span>
              </div>
              <p className="text-[11px] text-slate-400">Đi chung 2 người</p>
              <div className="pt-1.5">{renderTierPrice(route.tierShare2)}</div>
            </div>

            {/* Hạng 3: Bao xe 4-5 chỗ */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Car className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bao xe 4-5 chỗ</span>
              </div>
              <p className="text-[11px] text-slate-400">Xe riêng 4-5 chỗ</p>
              <div className="pt-1.5">
                {renderTierPrice(route.tierCharter45 || route.tierCharter4to5)}
              </div>
            </div>

            {/* Hạng 4: Bao xe 7 chỗ */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Car className="w-3.5 h-3.5 text-purple-600" />
                <span>Bao xe 7 chỗ</span>
              </div>
              <p className="text-[11px] text-slate-400">Xe riêng 7 chỗ rộng rãi</p>
              <div className="pt-1.5">{renderTierPrice(route.tierCharter7)}</div>
            </div>
          </div>

          {route.priceValidUntil && (
            <div className="flex items-center gap-2 text-slate-500 pt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Thời hạn bảng giá có hiệu lực đến:{' '}
                <strong className="text-slate-700">
                  {formatDateTime(route.priceValidUntil)}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* 3. Khối Mô tả & Thông tin SEO */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            Mô tả giới thiệu & Cấu hình SEO
          </h4>

          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[11px] block mb-1">Mô tả ngắn tuyến:</span>
            <p className="text-slate-700 leading-relaxed">
              {route.description || 'Chưa có mô tả cho tuyến này.'}
            </p>
          </div>

          {route.seo && (route.seo.metaTitle || route.seo.metaDescription) && (
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-[11px]">
              <span className="text-slate-400 block font-semibold">Cấu hình thẻ SEO Google:</span>
              {route.seo.metaTitle && (
                <p className="text-slate-800">
                  <strong>Tiêu đề SEO:</strong> {route.seo.metaTitle}
                </p>
              )}
              {route.seo.metaDescription && (
                <p className="text-slate-600">
                  <strong>Mô tả SEO:</strong> {route.seo.metaDescription}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 4. Thời gian tạo & cập nhật */}
        <div className="flex flex-wrap items-center justify-between text-slate-400 text-[11px] px-1">
          <span>Ngày tạo: {formatDateTime(route.createdAt)}</span>
          <span>Cập nhật gần nhất: {formatDateTime(route.updatedAt)}</span>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl"
            data-testid="close-detail-modal-btn"
          >
            Đóng
          </Button>
          {onEdit && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(route);
              }}
              className="rounded-xl"
              leftIcon={<Edit className="w-3.5 h-3.5" />}
            >
              Chỉnh sửa tuyến này
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default RouteDetailModal;
