import { useEffect, useRef, useState, useCallback } from "react";
import { apiClient } from "@/admin/lib/api-client";
import { playNotificationChime } from "@/admin/lib/sound";
import type { BookingDoc } from "@/admin/types/bookings";
import type { PaginatedResponse } from "@/admin/types/api";

export interface UseBookingPollingOptions {
  /** Khoảng thời gian thăm dò khi tab đang mở (mặc định 15000ms = 15s) */
  intervalMs?: number;
  /** Khoảng thời gian thăm dò khi tab bị ẩn / minimize (mặc định 60000ms = 60s) */
  backgroundIntervalMs?: number;
  /** Bật/tắt tính năng polling */
  enabled?: boolean;
  /** Callback được gọi khi phát hiện có 1 đơn đặt xe hoàn toàn mới */
  onNewBooking?: (newBooking: BookingDoc) => void;
  /** Callback cập nhật danh sách đơn vào state mà không gây chớp giật UI */
  onUpdateBookings?: (bookings: BookingDoc[]) => void;
}

export function useBookingPolling(options: UseBookingPollingOptions = {}) {
  const {
    intervalMs = 15000,
    backgroundIntervalMs = 60000,
    enabled = true,
    onNewBooking,
    onUpdateBookings,
  } = options;

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("cms_booking_sound_enabled") !== "false";
  });

  const [lastPolledAt, setLastPolledAt] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const knownBookingIdsRef = useRef<Set<string | number>>(new Set());
  const isInitialisedRef = useRef(false);

  // Bật / tắt âm thanh chuông báo
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("cms_booking_sound_enabled", String(next));
      if (next) {
        playNotificationChime();
      }
      return next;
    });
  }, []);

  // Yêu cầu quyền Browser Web Notification
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        try {
          await Notification.requestPermission();
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const checkNewBookings = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsPolling(true);
      const res = await apiClient.get<PaginatedResponse<BookingDoc> | BookingDoc[]>("/bookings", {
        params: { limit: 50, sort: "-createdAt" },
      });

      const data = res.data;
      const latestDocs: BookingDoc[] = Array.isArray(data)
        ? data
        : data && Array.isArray(data.docs)
        ? data.docs
        : [];

      setLastPolledAt(new Date());

      if (latestDocs.length === 0) return;

      // Lần đầu tiên chạy hook: chỉ ghi nhận các ID đang có, không phát chuông
      if (!isInitialisedRef.current) {
        latestDocs.forEach((b) => knownBookingIdsRef.current.add(b.id));
        isInitialisedRef.current = true;
        return;
      }

      // Các lần sau: kiểm tra đơn nào mới xuất hiện
      const newlyDiscovered: BookingDoc[] = [];
      for (const b of latestDocs) {
        if (!knownBookingIdsRef.current.has(b.id)) {
          newlyDiscovered.push(b);
          knownBookingIdsRef.current.add(b.id);
        }
      }

      if (newlyDiscovered.length > 0) {
        const newest = newlyDiscovered[0];

        // 1. Phát âm thanh chuông Ting Ting
        if (soundEnabled) {
          playNotificationChime();
        }

        // 2. Hiển thị Desktop Web Notification nếu được cho phép
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          const routeName =
            typeof newest.route === "object" && newest.route?.name
              ? newest.route.name
              : `${newest.pickupLocation} → ${newest.dropoffLocation}`;

          new Notification("🚖 Có đơn đặt xe mới!", {
            body: `Khách: ${newest.customerName || "Khách hàng"} (${newest.customerPhone || ""}) • Tuyến: ${routeName}`,
            icon: "/icon.svg",
          });
        }

        // 3. Callback thông báo đơn mới
        onNewBooking?.(newest);
      }

      // 4. Đồng bộ dữ liệu mới nhất vào component
      onUpdateBookings?.(latestDocs);
    } catch (err) {
      console.debug("[useBookingPolling] silent fetch error:", err);
    } finally {
      setIsPolling(false);
    }
  }, [enabled, soundEnabled, onNewBooking, onUpdateBookings]);

  useEffect(() => {
    if (!enabled) return;

    let timerId: NodeJS.Timeout;

    const scheduleNext = () => {
      const isHidden = typeof document !== "undefined" && document.hidden;
      const delay = isHidden ? backgroundIntervalMs : intervalMs;

      timerId = setTimeout(async () => {
        await checkNewBookings();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Khi người dùng chuyển tab quay lại, lập tức cập nhật đơn mới
        checkNewBookings();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, intervalMs, backgroundIntervalMs, checkNewBookings]);

  return {
    soundEnabled,
    toggleSound,
    lastPolledAt,
    isPolling,
    requestNotificationPermission,
    refetchNow: checkNewBookings,
  };
}
