"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  AlertCircle,
  Loader2,
  Sparkles,
  MapPin,
} from "lucide-react";
import type { RouteItem } from "@/lib/types";
import {
  buildBookingPayload,
  buildLocationOptions,
  createIdempotencyKey,
  isValidVietnamPhone,
  matchRoute,
  deriveStaticPrice,
} from "@/lib/booking";
import { DateTimeField } from "@/components/booking/DateTimeField";
import { isApiError, postBooking } from "@/lib/api/client";

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

interface HeroBookingBarProps {
  routes?: RouteItem[];
}

export function HeroBookingBar({ routes = [] }: HeroBookingBarProps) {
  const router = useRouter();

  // Tab Loại hình: "ghep" (Đi xe ghép) | "bao" (Bao xe trọn gói)
  const [rideType, setRideType] = useState<"ghep" | "bao">("ghep");

  // Hàng 1: Điểm đi & Điểm đến
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  // Điều khiển dropdown gợi ý từ database
  const [isPickupOpen, setIsPickupOpen] = useState(false);
  const [isDropoffOpen, setIsDropoffOpen] = useState(false);
  const pickupBoxRef = useRef<HTMLDivElement>(null);
  const dropoffBoxRef = useRef<HTMLDivElement>(null);

  // Hàng 2: Ngày đi, Số người / Số ghế, Số điện thoại (tất cả để placeholder mặc định)
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [serviceOption, setServiceOption] = useState("");
  const [phone, setPhone] = useState("");

  // Trạng thái gửi
  const [submitting, setSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [error, setError] = useState("");
  const idempotencyRef = useRef<{ key: string; signature: string } | null>(
    null,
  );

  // Tuyến 2 chiều: mọi `origin`/`destination` đều là điểm đi/đến hợp lệ.
  // Loại trừ điểm đã chọn ở ô đối diện để không trùng nhau.
  const pickupLocations = useMemo(
    () => buildLocationOptions(routes, dropoff),
    [routes, dropoff],
  );
  const dropoffLocations = useMemo(
    () => buildLocationOptions(routes, pickup),
    [routes, pickup],
  );

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
  const activeRoute = matchRoute(routes, pickup, dropoff);

  // Tính giá cước tĩnh niêm yết
  const staticPrice = deriveStaticPrice(activeRoute, {
    vehicleType,
    rideType,
    passengerCount,
  });

  // Trạng thái hiệu ứng tính giá cước ước tính
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

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
    }, 800);

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
      website: "",
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
    <div className="w-full max-w-6xl">
      {/* Tabs: Đi xe ghép / Bao xe trọn gói */}
      <div
        role="tablist"
        aria-label="Loại hình di chuyển"
        className="flex items-center gap-1.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={rideType === "ghep"}
          onClick={() => handleTabChange("ghep")}
          className={`px-5 sm:px-7 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-t-lg transition-all cursor-pointer ${
            rideType === "ghep"
              ? "bg-[#990000] text-white shadow-sm"
              : "bg-[#e2e8f0] hover:bg-slate-300 text-slate-800"
          }`}
        >
          Đi xe ghép
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={rideType === "bao"}
          onClick={() => handleTabChange("bao")}
          className={`px-5 sm:px-7 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-t-lg transition-all cursor-pointer ${
            rideType === "bao"
              ? "bg-[#990000] text-white shadow-sm"
              : "bg-[#e2e8f0] hover:bg-slate-300 text-slate-800"
          }`}
        >
          Bao xe trọn gói
        </button>
      </div>

      {/* Khung đặt xe viền gradient đỏ - cam to và nổi bật */}
      <div className="bg-gradient-to-r from-[#990000] via-[#c62828] to-[#e64a19] rounded-b-xl rounded-tr-xl p-3 sm:p-4 shadow-2xl shadow-red-950/25">
        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
            {/* Cột trái: 2 hàng input (giữ nguyên bố cục 2 cột hàng 1 và 3 cột hàng 2 trên cả mobile và desktop) */}
            <div className="lg:col-span-9 flex flex-col gap-2 sm:gap-3 justify-between">
              {/* Hàng 1: Điểm đi + Điểm đến (2 cột) */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* Điểm đi */}
                <div ref={pickupBoxRef} className="relative">
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
                    placeholder="Điểm đi (Hà Nội...)"
                    aria-label="Điểm đi (Ví dụ: Hà Nội)"
                    required
                    className="w-full h-11 sm:h-12 bg-white text-slate-900 font-medium text-xs sm:text-sm px-2.5 sm:px-4 rounded-md border border-slate-200 placeholder:text-slate-500 placeholder:text-[11px] sm:placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
                  />

                  {/* Dropdown gợi ý điểm đi từ Database */}
                  {isPickupOpen && filteredPickups.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 max-h-56 overflow-y-auto py-1 text-slate-800 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-100">
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

                {/* Điểm đến */}
                <div ref={dropoffBoxRef} className="relative">
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
                    placeholder="Điểm đến (Hải Phòng...)"
                    aria-label="Điểm đến (Ví dụ: Hải Phòng)"
                    required
                    className="w-full h-11 sm:h-12 bg-white text-slate-900 font-medium text-xs sm:text-sm px-2.5 sm:px-4 rounded-md border border-slate-200 placeholder:text-slate-500 placeholder:text-[11px] sm:placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
                  />

                  {/* Dropdown gợi ý điểm đến từ Database */}
                  {isDropoffOpen && filteredDropoffs.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 max-h-56 overflow-y-auto py-1 text-slate-800 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-100">
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
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                {/* Ngày đi */}
                <div className="relative">
                  <DateTimeField
                    value={pickupDateTime}
                    onChange={(next) => {
                      setPickupDateTime(next);
                      if (error) setError("");
                    }}
                    placeholder="Ngày đi"
                    ariaLabel="Ngày đi"
                    iconClassName="w-4 h-4 sm:w-5 sm:h-5 text-slate-500"
                    className="h-11 sm:h-12 bg-white border border-slate-200 font-medium text-xs sm:text-sm pl-2 sm:pl-3.5 pr-2 sm:pr-3 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
                  />
                </div>

                {/* Số người/Số ghế */}
                <div className="relative">
                  <select
                    value={serviceOption}
                    onChange={(e) => setServiceOption(e.target.value)}
                    aria-label="Số người/Số ghế"
                    className={`w-full h-11 sm:h-12 bg-white font-medium text-xs sm:text-sm pl-2 sm:pl-3.5 pr-5 sm:pr-8 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm cursor-pointer appearance-none truncate ${
                      !serviceOption ? "text-slate-500" : "text-slate-900"
                    }`}
                  >
                    <option value="" disabled className="text-slate-400">
                      Số người/ghế
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
                  <ChevronDown className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-slate-500 absolute right-1 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Số điện thoại của bạn */}
                <div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError("");
                      if (error) setError("");
                    }}
                    placeholder="Số điện thoại"
                    aria-label="Số điện thoại của bạn"
                    required
                    className="w-full h-11 sm:h-12 bg-white text-slate-900 font-medium text-xs sm:text-sm px-2 sm:px-4 rounded-md border border-slate-200 placeholder:text-slate-500 placeholder:text-[11px] sm:placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Cột phải: Nút NHẬN BÁO GIÁ & ĐẶT XE NGAY kèm giá ước tính */}
            <div className="lg:col-span-3 flex">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-full min-h-[46px] sm:min-h-[56px] lg:min-h-0 bg-[#d50000] hover:bg-[#b70000] active:bg-[#990000] text-white font-black text-xs sm:text-sm lg:text-[13px] xl:text-sm uppercase tracking-tight rounded-md flex flex-row lg:flex-col items-center justify-center gap-1.5 lg:gap-0 py-2.5 sm:py-3 px-3 shadow-md transition-all hover:brightness-105 active:scale-[0.99] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed leading-snug text-center"
              >
                {submitting ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>Đang gửi...</span>
                  </div>
                ) : (
                  <>
                    <span className="block whitespace-nowrap">
                      NHẬN BÁO GIÁ &
                    </span>
                    <span className="block whitespace-nowrap">ĐẶT XE NGAY</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dải hiển thị Giá cước ước tính chi tiết theo lộ trình */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 text-xs text-white">
            <div className="flex flex-wrap items-center gap-1.5 font-bold min-h-[28px]">
              <span className="inline-flex items-center gap-1 text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                <span>Giá cước ước tính:</span>
              </span>

              {isCalculatingPrice ? (
                <span className="inline-flex items-center gap-1.5 text-amber-200 text-xs sm:text-sm font-semibold animate-pulse bg-black/25 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300 flex-shrink-0" />
                  <span>Đang tính cước...</span>
                </span>
              ) : (
                <>
                  <span
                    className={`font-black drop-shadow-sm ${
                      displayPrice === "Liên hệ báo giá"
                        ? "text-sm sm:text-base text-amber-300 uppercase tracking-tight"
                        : "text-base sm:text-lg text-amber-300"
                    }`}
                  >
                    {displayPrice}
                  </span>
                </>
              )}
            </div>

            <div className="text-[11px] text-red-100/90 font-medium italic">
              {hasCalculated && !activeRoute
                ? "* Tuyến ngoài niêm yết, tổng đài sẽ gọi báo giá ưu đãi nhất"
                : "* Giá trọn gói niêm yết, đưa đón tận nhà, miễn phí hủy chuyến"}
            </div>
          </div>

          {/* Hiển thị lỗi nếu có */}
          {(error || phoneError) && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-950 text-white text-xs font-semibold border border-white/20 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>{phoneError || error}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
