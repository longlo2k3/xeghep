import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { constructMetadata } from "@/lib/seo";
import { CheckCircle2, Phone, Home, Clock, MapPin, ShieldCheck } from "lucide-react";
import { COMPANY_INFO } from "@/data/company-info";
import { lookupBooking, getCompanySettings, type BookingLookupResult } from "@/lib/api";

export const metadata: Metadata = constructMetadata({
  title: "Đặt Xe Thành Công - Xe Ghép Liên Tỉnh",
  description: "Cảm ơn bạn đã đặt chuyến đi cùng Xe Ghép Liên Tỉnh.",
  path: "/dat-xe/thanh-cong",
  noindex: true, // Strictly obeys AGENTS.md rule 1.5 (Thank you pages must have noindex)
});

interface ThankYouProps {
  searchParams: Promise<{
    code?: string;
    t?: string;
    name?: string;
    phone?: string;
    service?: string;
    route?: string;
    pickup?: string;
    dropoff?: string;
    date?: string;
    time?: string;
    price?: string;
    payment?: string;
  }>;
}

async function ThankYouContent({ searchParams }: ThankYouProps) {
  const [params, companySettings] = await Promise.all([
    searchParams,
    getCompanySettings(),
  ]);
  const info = companySettings.info ?? COMPANY_INFO;

  let booking: BookingLookupResult | null = null;
  if (params.code && params.t) {
    try {
      booking = await lookupBooking(params.code, { token: params.t });
    } catch {
      // Fallback an toàn nếu token không khớp hoặc CMS bận
    }
  }

  const bookingCode = booking?.bookingCode || params.code || "XG-CHUA-TAO";
  const customerName = booking?.customerName || params.name || "Quý khách";
  const customerPhone = booking?.customerPhoneMasked || params.phone || "---";
  const routeName =
    booking?.route?.name ||
    params.route ||
    (booking ? `${booking.pickupLocation} ⇄ ${booking.dropoffLocation}` : "Tuyến xe ghép liên tỉnh");
  const pickup = booking?.pickupLocation || params.pickup || "Địa chỉ theo yêu cầu";
  const dropoff = booking?.dropoffLocation || params.dropoff || "Điểm đến theo yêu cầu";

  let travelDate = params.date || "Hôm nay";
  let travelTime = params.time || "Theo thỏa thuận";
  if (booking?.pickupDateTime) {
    try {
      const d = new Date(booking.pickupDateTime);
      travelDate = d.toLocaleDateString("vi-VN");
      travelTime = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch {
      // Giữ nguyên fallback
    }
  }

  const price = booking?.estimatedPriceFormatted || params.price || "Theo biểu phí niêm yết";
  const paymentText =
    booking?.paymentMethodLabel ||
    (params.payment === "chuyen-khoan"
      ? "Chuyển khoản trực tuyến (Banking/QR)"
      : "Tiền mặt trực tiếp cho tài xế");

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block mb-2">
            {booking?.statusLabel ? `Trạng Thái: ${booking.statusLabel}` : "Đã Tiếp Nhận Thông Tin Đặt Chỗ"}
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Đặt Chuyến Đi Thành Công!
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            Cảm ơn <strong>{customerName}</strong> đã tin tưởng lựa chọn dịch vụ của {info.name}.
          </p>

          {/* Booking Code Highlight */}
          <div className="p-4 rounded-xl bg-slate-900 text-white mb-8">
            <span className="text-xs text-slate-400 block mb-1">MÃ ĐƠN HÀNG CỦA BẠN:</span>
            <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-wider">
              {bookingCode}
            </span>
            <span className="text-xs text-slate-400 block mt-1">
              (Vui lòng lưu lại mã này khi cần tra cứu chuyến đi hoặc đổi hủy vé)
            </span>
          </div>

          {/* Booking Summary */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 text-left text-xs sm:text-sm space-y-3 mb-8">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Số điện thoại liên hệ:</span>
              <span className="font-bold text-slate-900">{customerPhone}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Tuyến đường:</span>
              <span className="font-bold text-slate-900 text-right">{routeName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                <span>Điểm đón:</span>
              </span>
              <span className="font-medium text-slate-900 text-right max-w-xs">{pickup}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Điểm trả:</span>
              </span>
              <span className="font-medium text-slate-900 text-right max-w-xs">{dropoff}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                <span>Thời gian đón:</span>
              </span>
              <span className="font-bold text-slate-900">{travelTime} ngày {travelDate}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Hình thức thanh toán:</span>
              <span className="font-bold text-slate-900">{paymentText}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-700 font-bold">Cước phí ước tính:</span>
              <span className="font-black text-sky-700 text-base">{price}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 mb-8 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-600" aria-hidden="true" />
              Quy trình tiếp theo trong 5 phút tới:
            </p>
            <p>1. Tổng đài viên {info.name} sẽ gọi điện thoại hoặc nhắn tin Zalo tới số <strong>{customerPhone}</strong> để xác nhận điểm đón chính xác.</p>
            <p>2. Tài xế sẽ liên hệ trước 15-20 phút giờ khởi hành, đón đúng giờ tại sảnh/cửa nhà.</p>
            <p>3. Quý khách được đổi hoặc hủy chuyến hoàn toàn miễn phí khi thông báo trước qua hotline.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Về Trang Chủ</span>
            </Link>

            <a
              href={info.hotlineHref}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span>Hotline 24/7 ({info.hotline})</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function BookingSuccessPage(props: ThankYouProps) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Đang tải thông tin đơn hàng...</div>}>
      <ThankYouContent {...props} />
    </Suspense>
  );
}
