"use client";

import { useState, useId, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  ArrowLeftRight,
  Phone,
  User,
  Car,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Users,
  Navigation,
} from "lucide-react";
import { COMPANY_INFO } from "@/data/company-info";
import { type RouteItem } from "@/lib/types";
import { isApiError, postBooking, type CompanyInfoData } from "@/lib/api/client";
import {
  buildBookingPayload,
  createIdempotencyKey,
  deriveStaticPrice,
  isValidVietnamPhone,
} from "@/lib/booking";

interface BookingFormProps {
  routes: RouteItem[];
  companyInfo?: CompanyInfoData;
  initialOrigin?: string;
  initialDestination?: string;
  initialRouteSlug?: string;
  title?: string;
  compact?: boolean;
  variant?: "glass" | "solid";
}

const COMMON_LOCATIONS = [
  "Hải Phòng (Nội thành, Quán Toan)",
  "Hà Nội (Các quận nội thành)",
  "Sân bay Nội Bài",
  "Hạ Long (Bãi Cháy, Hòn Gai, Tuần Châu)",
  "Móng Cái (Cửa khẩu, Trà Cổ)",
  "Bắc Ninh (TP. Bắc Ninh, KCN Quế Võ, Yên Phong)",
  "Bắc Giang (TP. Bắc Giang, KCN Quang Châu, Đình Trám)",
  "Hải Dương (TP. Hải Dương, KCN Nam Sách)",
  "Thái Nguyên (TP. Thái Nguyên, KCN Samsung)",
];

// Helper tìm tuyến khớp với điểm đón và điểm đến (hỗ trợ cả 2 chiều)
function findMatchingRoute(
  routes: RouteItem[],
  pickupStr: string,
  dropoffStr: string,
  explicitSlug?: string,
): RouteItem | undefined {
  if (explicitSlug && explicitSlug !== "custom") {
    const bySlug = routes.find((r) => r.slug === explicitSlug);
    if (bySlug) return bySlug;
  }

  if (!pickupStr || !dropoffStr) return undefined;

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .trim();

  const p = normalize(pickupStr);
  const d = normalize(dropoffStr);

  return routes.find((r) => {
    const o = normalize(r.origin);
    const dest = normalize(r.destination);

    // Chiều thuận
    const directOrigin = p.includes(o) || o.includes(p);
    const directDest =
      d.includes(dest) ||
      dest.includes(d) ||
      r.dropoffs.some((item) => {
        const normItem = normalize(item);
        return d.includes(normItem) || normItem.includes(d);
      });

    if (directOrigin && directDest) return true;

    // Chiều ngược
    const revOrigin = d.includes(o) || o.includes(d);
    const revDest =
      p.includes(dest) ||
      dest.includes(p) ||
      r.dropoffs.some((item) => {
        const normItem = normalize(item);
        return p.includes(normItem) || normItem.includes(p);
      });

    return revOrigin && revDest;
  });
}

function submitErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return "Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.";
  }
  if (error.status === 422) {
    const messages = error.fields
      .filter((field) => field.field !== "customerPhone")
      .map((field) => field.message);
    if (messages.length > 0) return messages.join(" ");
    return error.message || "Dữ liệu đặt xe chưa hợp lệ. Vui lòng kiểm tra lại.";
  }
  if (error.status === 429) {
    return "Bạn thao tác quá nhanh. Vui lòng đợi ít phút rồi thử lại hoặc gọi tổng đài.";
  }
  return error.message || "Đặt xe thất bại. Vui lòng thử lại hoặc gọi tổng đài.";
}

export function BookingForm({
  routes,
  companyInfo = COMPANY_INFO,
  initialOrigin = "",
  initialDestination = "",
  initialRouteSlug = "",
  title = "ĐẶT XE TRỰC TUYẾN",
  compact = false,
  variant,
}: BookingFormProps) {
  const info = companyInfo ?? COMPANY_INFO;
  const isGlass = variant ? variant === "glass" : compact;
  const baseId = useId();
  const routeSelectId = `${baseId}-route-select`;
  const pickupId = `${baseId}-pickup`;
  const dropoffId = `${baseId}-dropoff`;
  const rideGhepId = `${baseId}-ride-ghep`;
  const rideBaoId = `${baseId}-ride-bao`;
  const nameId = `${baseId}-name`;
  const phoneId = `${baseId}-phone`;
  const vehicleId = `${baseId}-vehicle`;
  const datetimeId = `${baseId}-datetime`;

  // Khởi tạo tuyến mặc định
  const defaultRoute =
    (initialRouteSlug && routes.find((r) => r.slug === initialRouteSlug)) ||
    findMatchingRoute(routes, initialOrigin, initialDestination) ||
    routes[1]; // Tuyến Hải Phòng - Hà Nội - Nội Bài làm mặc định tiêu biểu

  const [selectedRouteSlug, setSelectedRouteSlug] = useState<string>(
    initialRouteSlug ||
      (initialOrigin && initialDestination
        ? defaultRoute?.slug || "custom"
        : defaultRoute?.slug || "hai-phong-ha-noi-noi-bai"),
  );
  const [pickup, setPickup] = useState(
    initialOrigin || defaultRoute?.origin || "Hải Phòng (Nội thành, Quán Toan)",
  );
  const [dropoff, setDropoff] = useState(
    initialDestination ||
      defaultRoute?.destination ||
      "Hà Nội (Các quận nội thành) / Nội Bài",
  );
  const [rideType, setRideType] = useState<"ghep" | "bao">("ghep");
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("4cho");
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [website, setWebsite] = useState(""); // honeypot theo hợp đồng backend
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const idempotencyRef = useRef<{ key: string; signature: string } | null>(null);
  const router = useRouter();

  // Xác định tuyến xe đang chọn hoặc khớp từ điểm đón/trả
  const activeRoute =
    selectedRouteSlug !== "custom"
      ? routes.find((r) => r.slug === selectedRouteSlug) ||
        findMatchingRoute(routes, pickup, dropoff)
      : findMatchingRoute(routes, pickup, dropoff);

  // Giá niêm yết tĩnh lấy từ tuyến đã lưu (không gọi API ước lượng)
  const staticPrice = deriveStaticPrice(activeRoute, {
    vehicleType,
    rideType,
    passengerCount,
  });
  const priceDisplay = staticPrice.displayPrice;
  const unitDisplay = staticPrice.unit;

  // Get current date string for min datetime-local
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  const handleRouteChange = (slug: string) => {
    setSelectedRouteSlug(slug);
    if (slug === "custom") {
      return;
    }
    const found = routes.find((r) => r.slug === slug);
    if (found) {
      setPickup(found.origin);
      setDropoff(found.destination);
    }
  };

  const handleSwap = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!isValidVietnamPhone(phone)) {
      setPhoneError("Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 số)");
      return;
    }
    setPhoneError("");

    if (!pickupDateTime) {
      setFormError("Vui lòng chọn ngày và giờ đón.");
      return;
    }
    setFormError("");

    const payload = buildBookingPayload({
      customerName: fullName,
      customerPhone: phone,
      pickup,
      dropoff,
      routeSlug: activeRoute?.slug ?? null,
      vehicleType,
      rideType,
      passengerCount,
      pickupDateTime,
      website,
    });

    // Idempotency-Key: 1 key cho mỗi nội dung đơn, dùng lại khi retry.
    const signature = JSON.stringify(payload);
    if (!idempotencyRef.current || idempotencyRef.current.signature !== signature) {
      idempotencyRef.current = { key: createIdempotencyKey(), signature };
    }

    setSubmitting(true);
    try {
      const result = await postBooking(payload, idempotencyRef.current.key);
      setSubmitted(true);
      const query = new URLSearchParams({
        code: result.bookingCode,
        t: result.lookupToken,
      });
      router.push(`/dat-xe/thanh-cong?${query.toString()}`);
    } catch (error) {
      setFormError(submitErrorMessage(error));
      if (isApiError(error)) {
        const phoneField = error.fields.find((field) => field.field === "customerPhone");
        if (phoneField) setPhoneError(phoneField.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="form-dat-xe"
      className={`scroll-mt-24 rounded-2xl border overflow-hidden transition-all ${
        isGlass
          ? "bg-slate-950/20 backdrop-blur-[6px] border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] ring-1 ring-white/20"
          : "bg-white rounded-2xl border-slate-200/90 shadow-xl"
      }`}
    >
      {/* Header bar */}
      <div
        className={`text-white text-center border-b ${
          isGlass
            ? "bg-gradient-to-r from-red-600 via-red-600/75 to-red-700/60 backdrop-blur-sm border-white/20"
            : "bg-gradient-to-r from-red-600 to-red-700 border-red-700"
        } ${compact ? "p-3.5 sm:p-4" : "p-5 sm:p-6"}`}
      >
        <h2
          className={`font-black uppercase tracking-wide ${
            compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
          }`}
        >
          {title}
        </h2>
        <p
          className={`mt-0.5 ${
            isGlass ? "text-red-100/90" : "text-red-100"
          } ${compact ? "text-xs" : "text-xs sm:text-sm"}`}
        >
          Báo giá trọn gói niêm yết • Đón trả tận nhà • Miễn phí hủy chuyến
        </p>
      </div>

      <div className={compact ? "p-4 sm:p-6" : "p-6 sm:p-8"}>
        {submitted ? (
          <div className="py-8 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-400/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3
              className={`text-xl sm:text-2xl font-extrabold ${isGlass ? "text-white" : "text-slate-900"}`}
            >
              Đặt xe thành công!
            </h3>
            <p
              className={`text-sm sm:text-base max-w-md mx-auto font-medium ${isGlass ? "text-slate-200" : "text-slate-700"}`}
            >
              Chúng tôi sẽ gọi lại trong ít phút để xác nhận điểm đón và giờ
              xuất phát của quý khách.
            </p>
            <div
              className={`p-4 rounded-xl border max-w-md mx-auto text-left text-xs sm:text-sm space-y-2 ${
                isGlass
                  ? "bg-black/35 border-white/20 text-slate-200 backdrop-blur-sm"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <p>
                <strong>Khách hàng:</strong> {fullName} ({phone})
              </p>
              <p>
                <strong>Tuyến di chuyển:</strong>{" "}
                <span className="font-semibold text-amber-400">
                  {activeRoute ? activeRoute.name : `${pickup} ⇄ ${dropoff}`}
                </span>
              </p>
              <p>
                <strong>Điểm đón:</strong> {pickup || "Theo thỏa thuận"}
              </p>
              <p>
                <strong>Điểm đến:</strong> {dropoff || "Theo thỏa thuận"}
              </p>
              <p>
                <strong>Hình thức:</strong>{" "}
                {vehicleType === "guihang"
                  ? "Gửi hàng hỏa tốc"
                  : rideType === "ghep"
                    ? `Đi ghép (${passengerCount} khách)`
                    : `Bao xe riêng (${
                        vehicleType === "7cho"
                          ? "7 chỗ"
                          : vehicleType === "5cho"
                            ? "5 chỗ"
                            : "4 chỗ"
                      })`}
              </p>
              <div
                className={`pt-2.5 mt-2 border-t flex items-center justify-between ${
                  isGlass ? "border-white/15" : "border-slate-200"
                }`}
              >
                <span className="font-bold">Giá cước niêm yết:</span>
                <span className="font-black text-amber-400 text-base sm:text-lg">
                  {priceDisplay} {unitDisplay}
                </span>
              </div>
            </div>
            <div className="pt-2">
              <a
                href={info.hotlineHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md"
              >
                <Phone className="w-4 h-4 animate-pulse" />
                <span>Hoặc gọi trực tiếp: {info.hotline}</span>
              </a>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className={
              compact ? "space-y-3.5 sm:space-y-4" : "space-y-4 sm:space-y-5"
            }
          >
            {/* Mục 1: Tuyến xe di chuyển - Chọn nhanh tuyến & xem giá tức thì */}
            <div>
              <label
                htmlFor={routeSelectId}
                className={`block text-xs font-bold mb-1.5 flex items-center justify-between ${
                  isGlass ? "text-slate-200" : "text-slate-700"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Navigation
                    className="w-4 h-4 text-amber-400"
                    aria-hidden="true"
                  />
                  <span>Chọn tuyến đường di chuyển *</span>
                </span>
                <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Báo giá tự động</span>
                </span>
              </label>
              <select
                id={routeSelectId}
                value={selectedRouteSlug}
                onChange={(e) => handleRouteChange(e.target.value)}
                className={`w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm font-semibold transition-all ${
                  isGlass
                    ? "bg-slate-950/40 hover:bg-slate-950/55 focus:bg-slate-950/70 border-white/20 focus:border-red-400 text-white backdrop-blur-xs"
                    : "bg-white border-slate-300 text-slate-900"
                } ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}
              >
                {routes.map((r) => (
                  <option
                    key={r.slug}
                    value={r.slug}
                    className={
                      isGlass
                        ? "bg-slate-900 text-white font-medium"
                        : "text-slate-900"
                    }
                  >
                    {r.name}
                  </option>
                ))}
                <option
                  value="custom"
                  className={
                    isGlass
                      ? "bg-slate-900 text-white font-medium"
                      : "text-slate-900"
                  }
                >
                  Tuyến liên tỉnh khác (Tự nhập điểm đón & trả)
                </option>
              </select>
            </div>

            {/* Mục 2: Điểm đón & Điểm đến với nút Đảo chiều ⇄ */}
            <div className="grid grid-cols-1 sm:grid-cols-11 gap-2.5 sm:gap-3 items-center">
              {/* Điểm đón */}
              <div className="sm:col-span-5 relative">
                <label
                  htmlFor={pickupId}
                  className={`block text-xs font-bold mb-1 flex items-center gap-1.5 ${
                    isGlass ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  <MapPin
                    className="w-4 h-4 text-emerald-400"
                    aria-hidden="true"
                  />
                  <span>Điểm đón *</span>
                </label>
                <input
                  id={pickupId}
                  type="text"
                  required
                  list="pickup-locations"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Điểm đón / Nơi xuất phát..."
                  className={`w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm transition-all ${
                    isGlass
                      ? "bg-slate-950/25 hover:bg-slate-950/35 focus:bg-slate-950/50 border-white/20 focus:border-red-400 text-white placeholder:text-slate-400 backdrop-blur-xs"
                      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-500"
                  } ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}
                />
                <datalist id="pickup-locations">
                  {COMMON_LOCATIONS.map((loc, i) => (
                    <option key={i} value={loc} />
                  ))}
                </datalist>
              </div>

              {/* Nút Đảo chiều (⇄) */}
              <div className="sm:col-span-1 flex justify-center pt-0 sm:pt-4">
                <button
                  type="button"
                  onClick={handleSwap}
                  className={`rounded-full flex items-center justify-center transition-colors shadow-sm ${
                    isGlass
                      ? "bg-white/10 hover:bg-red-600/40 hover:border-red-400 border border-white/25 text-white backdrop-blur-xs"
                      : "bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 text-slate-600"
                  } ${compact ? "w-8 h-8" : "w-10 h-10"}`}
                  aria-label="Hoán đổi Điểm đón và Điểm đến"
                  title="Hoán đổi chiều đi"
                >
                  <ArrowLeftRight
                    className={compact ? "w-3.5 h-3.5" : "w-4 h-4"}
                  />
                </button>
              </div>

              {/* Điểm đến */}
              <div className="sm:col-span-5 relative">
                <label
                  htmlFor={dropoffId}
                  className={`block text-xs font-bold mb-1 flex items-center gap-1.5 ${
                    isGlass ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  <MapPin className="w-4 h-4 text-red-400" aria-hidden="true" />
                  <span>Điểm đến *</span>
                </label>
                <input
                  id={dropoffId}
                  type="text"
                  required
                  list="dropoff-locations"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  placeholder="Điểm đến / Nơi trả..."
                  className={`w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm transition-all ${
                    isGlass
                      ? "bg-slate-950/25 hover:bg-slate-950/35 focus:bg-slate-950/50 border-white/20 focus:border-red-400 text-white placeholder:text-slate-400 backdrop-blur-xs"
                      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-500"
                  } ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}
                />
                <datalist id="dropoff-locations">
                  {COMMON_LOCATIONS.map((loc, i) => (
                    <option key={i} value={loc} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Mục 3: Hình thức di chuyển: Đi Ghép / Bao xe */}
            <div>
              <span
                className={`block text-xs font-bold mb-1.5 ${
                  isGlass ? "text-slate-200" : "text-slate-700"
                }`}
              >
                Hình thức di chuyển *
              </span>
              <div
                className="grid grid-cols-2 gap-2 sm:gap-3"
                role="radiogroup"
                aria-label="Hình thức di chuyển"
              >
                <label
                  htmlFor={rideGhepId}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border cursor-pointer font-bold transition-all ${
                    compact ? "p-2.5 text-xs" : "p-3 text-xs sm:text-sm"
                  } ${
                    rideType === "ghep"
                      ? isGlass
                        ? "bg-red-600/40 border-red-500 text-white shadow-md ring-1 ring-red-400/50 backdrop-blur-xs"
                        : "bg-red-50 border-red-500 text-red-700 shadow-sm"
                      : isGlass
                        ? "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10 backdrop-blur-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    id={rideGhepId}
                    type="radio"
                    name="rideType"
                    value="ghep"
                    checked={rideType === "ghep"}
                    onChange={() => setRideType("ghep")}
                    className="sr-only"
                  />
                  <span>Đi Ghép (1–3 Khách)</span>
                </label>

                <label
                  htmlFor={rideBaoId}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border cursor-pointer font-bold transition-all ${
                    compact ? "p-2.5 text-xs" : "p-3 text-xs sm:text-sm"
                  } ${
                    rideType === "bao"
                      ? isGlass
                        ? "bg-red-600/40 border-red-500 text-white shadow-md ring-1 ring-red-400/50 backdrop-blur-xs"
                        : "bg-red-50 border-red-500 text-red-700 shadow-sm"
                      : isGlass
                        ? "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10 backdrop-blur-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    id={rideBaoId}
                    type="radio"
                    name="rideType"
                    value="bao"
                    checked={rideType === "bao"}
                    onChange={() => setRideType("bao")}
                    className="sr-only"
                  />
                  <span>Bao Xe (Trọn Gói)</span>
                </label>
              </div>

              {/* Tùy chọn số lượng khách khi Đi Ghép */}
              {rideType === "ghep" && vehicleType !== "guihang" && (
                <div
                  className={`mt-2.5 flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-xs transition-all ${
                    isGlass
                      ? "bg-white/5 border-white/15 text-slate-200 backdrop-blur-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <span className="font-semibold flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Số người đi ghép:</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPassengerCount(num)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                          passengerCount === num
                            ? "bg-amber-400 text-slate-950 shadow-sm font-black scale-105"
                            : isGlass
                              ? "bg-white/10 text-slate-300 hover:bg-white/20"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {num} người
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mục 4: Tùy chọn dịch vụ + Ngày và giờ đón */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label
                  htmlFor={vehicleId}
                  className={`block text-xs font-bold mb-1 flex items-center gap-1.5 ${
                    isGlass ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  <Car className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  <span>Tùy chọn dịch vụ *</span>
                </label>
                <select
                  id={vehicleId}
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className={`w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm transition-all ${
                    isGlass
                      ? "bg-slate-950/25 hover:bg-slate-950/35 focus:bg-slate-950/50 border-white/20 focus:border-red-400 text-white backdrop-blur-xs"
                      : "bg-white border-slate-300 text-slate-900"
                  } ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}
                >
                  <option
                    value="4cho"
                    className={isGlass ? "bg-slate-900 text-white" : ""}
                  >
                    Xe 4 chỗ
                  </option>
                  <option
                    value="5cho"
                    className={isGlass ? "bg-slate-900 text-white" : ""}
                  >
                    Xe 5 chỗ
                  </option>
                  <option
                    value="7cho"
                    className={isGlass ? "bg-slate-900 text-white" : ""}
                  >
                    Xe 7 chỗ
                  </option>
                  <option
                    value="guihang"
                    className={isGlass ? "bg-slate-900 text-white" : ""}
                  >
                    Gửi hàng (Hỏa tốc từ 150k)
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor={datetimeId}
                  className={`block text-xs font-bold mb-1 flex items-center gap-1.5 ${
                    isGlass ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  <Calendar
                    className="w-4 h-4 text-slate-400"
                    aria-hidden="true"
                  />
                  <span>Ngày và giờ đón *</span>
                </label>
                <input
                  id={datetimeId}
                  type="datetime-local"
                  required
                  min={minDateTime}
                  value={pickupDateTime}
                  onChange={(e) => setPickupDateTime(e.target.value)}
                  className={`w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm transition-all ${
                    isGlass
                      ? "bg-slate-950/25 hover:bg-slate-950/35 focus:bg-slate-950/50 border-white/20 focus:border-red-400 text-white [color-scheme:dark] backdrop-blur-xs"
                      : "bg-white border-slate-300 text-slate-900"
                  } ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}
                />
              </div>
            </div>

            {/* Mục 5: Thông tin khách hàng: Họ và tên + Số điện thoại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label
                  htmlFor={nameId}
                  className={`block text-xs font-bold mb-1 flex items-center gap-1.5 ${
                    isGlass ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  <User className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  <span>Họ và tên *</span>
                </label>
                <input
                  id={nameId}
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className={`w-full rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 text-xs sm:text-sm transition-all ${
                    isGlass
                      ? "bg-slate-950/25 hover:bg-slate-950/35 focus:bg-slate-950/50 border-white/20 focus:border-red-400 text-white placeholder:text-slate-400 backdrop-blur-xs"
                      : "bg-white border-slate-300 text-slate-900"
                  } ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}
                />
              </div>

              <div>
                <label
                  htmlFor={phoneId}
                  className={`block text-xs font-bold mb-1 flex items-center gap-1.5 ${
                    isGlass ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  <Phone
                    className="w-4 h-4 text-slate-400"
                    aria-hidden="true"
                  />
                  <span>Số điện thoại *</span>
                </label>
                <input
                  id={phoneId}
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError("");
                  }}
                  placeholder="Ví dụ: 0962298293"
                  className={`w-full rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                    phoneError
                      ? "border-red-500 bg-red-500/20 text-white"
                      : isGlass
                        ? "bg-slate-950/25 hover:bg-slate-950/35 focus:bg-slate-950/50 border-white/20 focus:border-red-400 text-white placeholder:text-slate-400 backdrop-blur-xs"
                        : "bg-white border-slate-300 text-slate-900"
                  } ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}
                />
                {phoneError && (
                  <p className="text-xs text-red-400 mt-1 font-semibold">
                    {phoneError}
                  </p>
                )}
              </div>
            </div>

            {/* Nút Submit: Đặt xe ngay kèm giá tiền */}
            <div className="pt-1 sm:pt-2">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-800 text-white font-black uppercase tracking-wider shadow-lg shadow-red-600/40 hover:shadow-xl transition-all hover:scale-[1.01] border border-red-400/30 flex items-center justify-center gap-2 ${
                  submitting ? "opacity-80 cursor-not-allowed" : "cursor-pointer"
                } ${
                  compact
                    ? "py-3 px-4 text-xs sm:text-sm"
                    : "py-4 px-6 text-sm sm:text-base"
                }`}
              >
                <span>{submitting ? "Đang gửi đơn..." : "ĐẶT XE NGAY"}</span>
                {priceDisplay && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                    <span className="text-amber-300 font-extrabold normal-case">
                      {priceDisplay}
                    </span>
                  </>
                )}
              </button>
              <p
                className={`text-center text-[11px] sm:text-xs mt-2 flex items-center justify-center gap-1.5 ${
                  isGlass ? "text-slate-300" : "text-slate-600"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Thông tin bảo mật 100% • Tài xế liên hệ trước 15 phút
                </span>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
