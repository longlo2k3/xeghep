"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  AlertCircle,
  Loader2,
  Sparkles,
  MapPin,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { COMPANY_INFO } from "@/data/company-info";
import type { RouteItem } from "@/lib/types";
import {
  buildBookingPayload,
  createIdempotencyKey,
  isValidVietnamPhone,
  deriveStaticPrice,
} from "@/lib/booking";
import {
  isApiError,
  postBooking,
  type CompanyInfoData,
} from "@/lib/api/client";

function submitErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return "Không kết nối được máy chủ. Vui lòng kiểm tra mạng hoặc gọi hotline 24/7.";
  }
  if (error.status === 422) {
    const messages = error.fields
      .filter((field) => field.field !== "customerPhone")
      .map((field) => field.message);
    if (messages.length > 0) return messages.join(" ");
    return (
      error.message || "Dữ liệu đặt xe chưa hợp lệ. Vui lòng kiểm tra lại."
    );
  }
  if (error.status === 429) {
    return "Bạn thao tác quá nhanh. Vui lòng đợi ít phút rồi thử lại hoặc gọi hotline.";
  }
  return (
    error.message ||
    "Đặt xe chưa thành công. Vui lòng thử lại hoặc gọi hotline."
  );
}

function getMinDateTime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 20);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

// Khớp tuyến từ điểm đón / điểm đến
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

  if (!pickupStr || !dropoffStr || routes.length === 0) return undefined;

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

    const direct =
      (p.includes(o) || o.includes(p)) &&
      (d.includes(dest) ||
        dest.includes(d) ||
        (r.dropoffs &&
          r.dropoffs.some((item) => {
            const normItem = normalize(item);
            return d.includes(normItem) || normItem.includes(d);
          })));

    const reverse =
      (d.includes(o) || o.includes(d)) &&
      (p.includes(dest) ||
        dest.includes(p) ||
        (r.pickups &&
          r.pickups.some((item) => {
            const normItem = normalize(item);
            return p.includes(normItem) || normItem.includes(p);
          })));

    return direct || reverse;
  });
}

interface BookingFormProps {
  routes?: RouteItem[];
  companyInfo?: CompanyInfoData;
  initialOrigin?: string;
  initialDestination?: string;
  initialRouteSlug?: string;
  initialRideType?: "ghep" | "bao";
  title?: string;
  compact?: boolean;
  variant?: "glass" | "solid";
}

export function BookingForm({
  routes = [],
  companyInfo = COMPANY_INFO,
  initialOrigin = "",
  initialDestination = "",
  initialRouteSlug = "",
  initialRideType = "ghep",
  title = "ĐẶT XE TRỰC TUYẾN",
  compact = false,
  variant,
}: BookingFormProps) {
  const router = useRouter();
  const isGlass = variant ? variant === "glass" : compact;
  const info = companyInfo ?? COMPANY_INFO;

  // Tab Loại hình: "ghep" (Đi xe ghép) | "bao" (Bao xe trọn gói)
  const [rideType, setRideType] = useState<"ghep" | "bao">(initialRideType);

  // Khởi tạo điểm đi & điểm đến từ props nếu có
  const initialRoute = useMemo(() => {
    if (!initialRouteSlug || initialRouteSlug === "custom") return undefined;
    return routes.find((r) => r.slug === initialRouteSlug);
  }, [routes, initialRouteSlug]);

  const [pickup, setPickup] = useState(
    initialOrigin || initialRoute?.origin || "",
  );
  const [dropoff, setDropoff] = useState(
    initialDestination || initialRoute?.destination || "",
  );

  // Điều khiển dropdown gợi ý từ database
  const [isPickupOpen, setIsPickupOpen] = useState(false);
  const [isDropoffOpen, setIsDropoffOpen] = useState(false);
  const pickupBoxRef = useRef<HTMLDivElement>(null);
  const dropoffBoxRef = useRef<HTMLDivElement>(null);

  // Ngày đi, Số người / Số ghế, Số điện thoại
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [isDateActive, setIsDateActive] = useState(false);
  const [serviceOption, setServiceOption] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  // Trạng thái gửi
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [error, setError] = useState("");
  const idempotencyRef = useRef<{ key: string; signature: string } | null>(
    null,
  );

  // Trích xuất danh sách các điểm đi chính từ các tuyến đường trong database
  const pickupLocations = useMemo(() => {
    const list: string[] = [];
    routes.forEach((r) => {
      if (r.origin) list.push(r.origin.trim());
      if (r.destination) list.push(r.destination.trim());
    });
    return Array.from(new Set(list)).filter(Boolean);
  }, [routes]);

  // Trích xuất danh sách các điểm đến chính từ database (ưu tiên điểm kết nối với điểm đi đã chọn)
  const dropoffLocations = useMemo(() => {
    if (pickup.trim()) {
      const norm = pickup.toLowerCase().trim();
      const connected: string[] = [];
      routes.forEach((r) => {
        const o = (r.origin || "").toLowerCase();
        const d = (r.destination || "").toLowerCase();
        if (norm.includes(o) || o.includes(norm)) {
          if (r.destination) connected.push(r.destination.trim());
        } else if (norm.includes(d) || d.includes(norm)) {
          if (r.origin) connected.push(r.origin.trim());
        }
      });
      if (connected.length > 0) {
        return Array.from(new Set(connected)).filter(Boolean);
      }
    }
    const list: string[] = [];
    routes.forEach((r) => {
      if (r.destination) list.push(r.destination.trim());
      if (r.origin) list.push(r.origin.trim());
    });
    return Array.from(new Set(list)).filter(Boolean);
  }, [routes, pickup]);

  // Bộ lọc tìm kiếm theo từ khóa gõ
  const filteredPickups = useMemo(() => {
    if (!pickup.trim()) return pickupLocations;
    const q = pickup.toLowerCase().trim();
    return pickupLocations.filter((loc) => loc.toLowerCase().includes(q));
  }, [pickupLocations, pickup]);

  const filteredDropoffs = useMemo(() => {
    if (!dropoff.trim()) return dropoffLocations;
    const q = dropoff.toLowerCase().trim();
    return dropoffLocations.filter((loc) => loc.toLowerCase().includes(q));
  }, [dropoffLocations, dropoff]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickupBoxRef.current &&
        !pickupBoxRef.current.contains(e.target as Node)
      ) {
        setIsPickupOpen(false);
      }
      if (
        dropoffBoxRef.current &&
        !dropoffBoxRef.current.contains(e.target as Node)
      ) {
        setIsDropoffOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tính toán vehicleType và passengerCount (nếu để placeholder thì lấy mặc định tương ứng với tab)
  const effectiveOption =
    serviceOption || (rideType === "ghep" ? "1_ghep" : "4cho");
  let vehicleType = "4cho";
  let passengerCount = 1;

  if (rideType === "ghep") {
    if (effectiveOption === "guihang") {
      vehicleType = "guihang";
    } else if (effectiveOption === "2_ghep") {
      passengerCount = 2;
    } else if (effectiveOption === "3_ghep") {
      passengerCount = 3;
    } else {
      passengerCount = 1;
    }
  } else {
    vehicleType = effectiveOption; // 4cho, 5cho, 7cho, 16cho
  }

  // Khớp tuyến đường từ dữ liệu nhập
  const activeRoute = useMemo(() => {
    return findMatchingRoute(routes, pickup, dropoff, initialRouteSlug);
  }, [routes, pickup, dropoff, initialRouteSlug]);

  // Tính giá cước tĩnh niêm yết
  const staticPrice = deriveStaticPrice(activeRoute, {
    vehicleType,
    rideType,
    passengerCount,
  });

  // Trạng thái hiệu ứng tính giá cước ước tính
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(
    Boolean(pickup.trim() && dropoff.trim()),
  );

  useEffect(() => {
    // Nếu chưa nhập đủ cả điểm đi và điểm đến thì giá ban đầu là 0đ
    if (!pickup.trim() || !dropoff.trim()) {
      setIsCalculatingPrice(false);
      setHasCalculated(false);
      return;
    }

    // Khi đã nhập đủ cả 2 điểm, chạy hiệu ứng loading tính giá tạo cảm giác tra cước thời gian thực
    setIsCalculatingPrice(true);
    setHasCalculated(false);

    const timer = setTimeout(() => {
      setIsCalculatingPrice(false);
      setHasCalculated(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [pickup, dropoff, rideType, serviceOption]);

  // Giá cước ước tính hiển thị: ban đầu 0đ, chọn đúng tuyến hiện giá, không đúng tuyến hiện "Liên hệ báo giá"
  let displayPrice = "0đ";
  let unitDisplay = "";

  if (pickup.trim() && dropoff.trim() && hasCalculated) {
    if (activeRoute) {
      displayPrice = staticPrice.displayPrice;
      unitDisplay = staticPrice.unit;
    } else {
      displayPrice = "Liên hệ báo giá";
      unitDisplay = "";
    }
  }

  const handleTabChange = (type: "ghep" | "bao") => {
    setRideType(type);
    setServiceOption("");
    setError("");
  };

  const handleSwap = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!pickup.trim()) {
      setError("Vui lòng nhập hoặc chọn điểm đi.");
      return;
    }
    if (!dropoff.trim()) {
      setError("Vui lòng nhập hoặc chọn điểm đến.");
      return;
    }
    if (!pickupDateTime) {
      setError("Vui lòng chọn ngày đi.");
      return;
    }
    if (!isValidVietnamPhone(phone)) {
      setPhoneError("Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 số).");
      return;
    }
    setPhoneError("");
    setError("");

    const payload = buildBookingPayload({
      customerName: "Khách đặt xe",
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

    const signature = JSON.stringify(payload);
    if (
      !idempotencyRef.current ||
      idempotencyRef.current.signature !== signature
    ) {
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
    } catch (err) {
      setError(submitErrorMessage(err));
      if (isApiError(err)) {
        const phoneField = err.fields.find((f) => f.field === "customerPhone");
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
          ? "bg-slate-950/25 backdrop-blur-[6px] border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] ring-1 ring-white/20"
          : "bg-white rounded-2xl border-slate-200/90 shadow-xl"
      }`}
    >
      {/* Header bar */}
      <div
        className={`text-white text-center border-b ${
          isGlass
            ? "bg-gradient-to-r from-[#990000] via-[#c62828] to-[#e64a19] backdrop-blur-sm border-white/20"
            : "bg-gradient-to-r from-[#990000] via-[#c62828] to-[#e64a19] border-red-800"
        } ${compact ? "p-3.5 sm:p-4" : "p-4 sm:p-6"}`}
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

      <div className={compact ? "p-3.5 sm:p-5" : "p-4 sm:p-7"}>
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
          <div className="space-y-4">
            {/* Tabs: Đi xe ghép / Bao xe trọn gói (Theo HeroBookingBar) */}
            <div
              role="tablist"
              aria-label="Loại hình di chuyển"
              className="flex items-center gap-2 border-b border-slate-200 pb-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={rideType === "ghep"}
                onClick={() => handleTabChange("ghep")}
                className={`px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  rideType === "ghep"
                    ? "bg-[#990000] text-white shadow-sm"
                    : isGlass
                      ? "bg-white/10 hover:bg-white/20 text-slate-200"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                Đi xe ghép
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={rideType === "bao"}
                onClick={() => handleTabChange("bao")}
                className={`px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  rideType === "bao"
                    ? "bg-[#990000] text-white shadow-sm"
                    : isGlass
                      ? "bg-white/10 hover:bg-white/20 text-slate-200"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                Bao xe trọn gói
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              {/* Honeypot chống bot */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {/* Hàng 1: Điểm đi + Nút Hoán đổi + Điểm đến */}
              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {/* Điểm đi */}
                <div ref={pickupBoxRef} className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Điểm đi *</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={pickup}
                    onFocus={() => setIsPickupOpen(true)}
                    onChange={(e) => {
                      setPickup(e.target.value);
                      setIsPickupOpen(true);
                      if (error) setError("");
                    }}
                    placeholder="Điểm đi (Hà Nội, Hải Phòng...)"
                    aria-label="Điểm đi"
                    required
                    className={`w-full h-11 sm:h-12 text-slate-900 font-medium text-xs sm:text-sm px-3 sm:px-4 rounded-xl border border-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-all ${
                      isGlass ? "bg-white/95" : "bg-white"
                    }`}
                  />

                  {/* Dropdown gợi ý điểm đi từ Database */}
                  {isPickupOpen && filteredPickups.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-56 overflow-y-auto py-1 text-slate-800 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <span>Điểm đón</span>
                        <span className="text-[10px] text-red-600 font-semibold">
                          {filteredPickups.length} điểm
                        </span>
                      </div>
                      {filteredPickups.map((loc) => (
                        <button
                          key={`p-loc-${loc}`}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setPickup(loc);
                            setIsPickupOpen(false);
                            if (error) setError("");
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 cursor-pointer border-b border-slate-50 last:border-0"
                        >
                          <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                          <span className="truncate font-medium">{loc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nút Đảo chiều giữa 2 ô (hiển thị trên màn hình lớn) */}
                <button
                  type="button"
                  onClick={handleSwap}
                  title="Đảo chiều điểm đi - điểm đến"
                  aria-label="Đảo chiều đón - trả"
                  className="hidden sm:flex absolute left-1/2 top-[34px] -translate-x-1/2 z-10 w-7 h-7 rounded-full bg-white hover:bg-red-50 border border-slate-300 shadow-md items-center justify-center text-slate-600 hover:text-red-600 transition-all cursor-pointer active:scale-95"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>

                {/* Điểm đến */}
                <div ref={dropoffBoxRef} className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                      <span>Điểm đến *</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleSwap}
                      className="sm:hidden text-[11px] text-red-600 font-semibold inline-flex items-center gap-1"
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                      <span>Đảo chiều</span>
                    </button>
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={dropoff}
                    onFocus={() => setIsDropoffOpen(true)}
                    onChange={(e) => {
                      setDropoff(e.target.value);
                      setIsDropoffOpen(true);
                      if (error) setError("");
                    }}
                    placeholder="Điểm đến (Hạ Long, Móng Cái...)"
                    aria-label="Điểm đến"
                    required
                    className={`w-full h-11 sm:h-12 text-slate-900 font-medium text-xs sm:text-sm px-3 sm:px-4 rounded-xl border border-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-all ${
                      isGlass ? "bg-white/95" : "bg-white"
                    }`}
                  />

                  {/* Dropdown gợi ý điểm đến từ Database */}
                  {isDropoffOpen && filteredDropoffs.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-56 overflow-y-auto py-1 text-slate-800 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <span>Điểm đến</span>
                        <span className="text-[10px] text-red-600 font-semibold">
                          {filteredDropoffs.length} điểm
                        </span>
                      </div>
                      {filteredDropoffs.map((loc) => (
                        <button
                          key={`d-loc-${loc}`}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setDropoff(loc);
                            setIsDropoffOpen(false);
                            if (error) setError("");
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 cursor-pointer border-b border-slate-50 last:border-0"
                        >
                          <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                          <span className="truncate font-medium">{loc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Hàng 2: Ngày đi + Số người/Số ghế + Số điện thoại (3 cột) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {/* Ngày đi */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ngày đi *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={
                        isDateActive || pickupDateTime
                          ? "datetime-local"
                          : "text"
                      }
                      onFocus={() => setIsDateActive(true)}
                      onBlur={() => {
                        if (!pickupDateTime) setIsDateActive(false);
                      }}
                      value={pickupDateTime}
                      min={getMinDateTime()}
                      onChange={(e) => {
                        setPickupDateTime(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Chọn ngày & giờ"
                      aria-label="Ngày đi"
                      required
                      className={`w-full h-11 sm:h-12 text-slate-900 font-medium text-xs sm:text-sm pl-3 sm:pl-3.5 pr-8 rounded-xl border border-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-all ${
                        isGlass ? "bg-white/95" : "bg-white"
                      }`}
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Số người / Số ghế */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    <span>Số người / số ghế *</span>
                  </label>
                  <div className="relative">
                    <select
                      value={serviceOption}
                      onChange={(e) => setServiceOption(e.target.value)}
                      aria-label="Số người/Số ghế"
                      className={`w-full h-11 sm:h-12 font-medium text-xs sm:text-sm pl-3 sm:pl-3.5 pr-8 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm cursor-pointer appearance-none truncate transition-all ${
                        isGlass ? "bg-white/95" : "bg-white"
                      } ${!serviceOption ? "text-slate-500" : "text-slate-900"}`}
                    >
                      <option value="" disabled className="text-slate-400">
                        Chọn số người/ghế
                      </option>
                      {rideType === "ghep" ? (
                        <>
                          <option value="1_ghep" className="text-slate-900">
                            1 người (Ghép)
                          </option>
                          <option value="2_ghep" className="text-slate-900">
                            2 người (Ghép)
                          </option>
                          <option value="3_ghep" className="text-slate-900">
                            3 người (Ghép)
                          </option>
                          <option value="guihang" className="text-slate-900">
                            Gửi hàng hỏa tốc
                          </option>
                        </>
                      ) : (
                        <>
                          <option value="4cho" className="text-slate-900">
                            Bao xe 4 chỗ
                          </option>
                          <option value="5cho" className="text-slate-900">
                            Bao xe 5 chỗ
                          </option>
                          <option value="7cho" className="text-slate-900">
                            Bao xe 7 chỗ
                          </option>
                          <option value="16cho" className="text-slate-900">
                            Bao xe 16 chỗ
                          </option>
                        </>
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Số điện thoại *</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError("");
                      if (error) setError("");
                    }}
                    placeholder="Ví dụ: 0962298293"
                    aria-label="Số điện thoại của bạn"
                    required
                    className={`w-full h-11 sm:h-12 text-slate-900 font-medium text-xs sm:text-sm px-3 sm:px-4 rounded-xl border border-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-all ${
                      isGlass ? "bg-white/95" : "bg-white"
                    } ${phoneError ? "border-red-500 ring-1 ring-red-400" : ""}`}
                  />
                </div>
              </div>

              {/* Dải hiển thị Giá cước ước tính chi tiết theo lộ trình */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5 font-bold min-h-[28px]">
                  <span className="inline-flex items-center gap-1 text-red-700">
                    <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>Giá cước ước tính:</span>
                  </span>

                  {isCalculatingPrice ? (
                    <span className="inline-flex items-center gap-1.5 text-red-600 text-xs sm:text-sm font-semibold animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                      <span>Đang tính cước...</span>
                    </span>
                  ) : (
                    <>
                      <span
                        className={`font-black ${
                          displayPrice === "Liên hệ báo giá"
                            ? "text-sm sm:text-base text-red-600 uppercase tracking-tight"
                            : "text-base sm:text-lg text-red-600"
                        }`}
                      >
                        {displayPrice}
                      </span>
                    </>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 font-medium italic">
                  {hasCalculated && !activeRoute
                    ? "* Tuyến ngoài niêm yết, tổng đài sẽ gọi báo giá ưu đãi nhất"
                    : "* Giá trọn gói niêm yết, đưa đón tận nhà, miễn phí hủy chuyến"}
                </div>
              </div>

              {/* Hiển thị lỗi nếu có */}
              {(error || phoneError) && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{phoneError || error}</span>
                </div>
              )}

              {/* Nút Submit Đặt xe ngay */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full rounded-xl bg-[#d50000] hover:bg-[#b70000] active:bg-[#990000] text-white font-black uppercase tracking-wider shadow-lg shadow-red-600/30 hover:shadow-xl transition-all hover:brightness-105 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
                    compact
                      ? "py-3 px-4 text-xs sm:text-sm"
                      : "py-3.5 sm:py-4 px-6 text-sm sm:text-base"
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>Đang gửi đơn...</span>
                    </div>
                  ) : (
                    <>
                      <span>NHẬN BÁO GIÁ & ĐẶT XE NGAY</span>
                      {displayPrice && displayPrice !== "0đ" && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                          <span className="text-amber-300 font-extrabold normal-case">
                            {displayPrice} {unitDisplay}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] sm:text-xs text-slate-500 mt-2.5 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Thông tin bảo mật 100% • Tài xế liên hệ trước 15 phút
                  </span>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
