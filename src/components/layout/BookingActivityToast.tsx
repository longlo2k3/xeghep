"use client";

import { CheckCircle2, Clock3, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

type BookingActivityRecord = {
  name: string;
  phone: string;
  route: string;
  bookedAt: string;
  status: "Đã xác nhận";
};

export const BOOKING_ACTIVITY_RECORDS: readonly BookingActivityRecord[] = [
  {
    name: "Anh Minh",
    phone: "09•• ••• 218",
    route: "Hà Nội → Hải Phòng",
    bookedAt: "2 phút trước",
    status: "Đã xác nhận",
  },
  {
    name: "Chị Lan",
    phone: "08•• ••• 536",
    route: "Hải Phòng → Hà Nội",
    bookedAt: "5 phút trước",
    status: "Đã xác nhận",
  },
  {
    name: "Anh Hùng",
    phone: "09•• ••• 742",
    route: "Bắc Ninh → Hải Phòng",
    bookedAt: "8 phút trước",
    status: "Đã xác nhận",
  },
  {
    name: "Chị Hương",
    phone: "03•• ••• 195",
    route: "Hạ Long → Hà Nội",
    bookedAt: "11 phút trước",
    status: "Đã xác nhận",
  },
  {
    name: "Anh Tuấn",
    phone: "09•• ••• 864",
    route: "Hà Nội → Bắc Giang",
    bookedAt: "14 phút trước",
    status: "Đã xác nhận",
  },
  {
    name: "Chị Mai",
    phone: "08•• ••• 327",
    route: "Móng Cái → Hải Phòng",
    bookedAt: "18 phút trước",
    status: "Đã xác nhận",
  },
  {
    name: "Anh Nam",
    phone: "03•• ••• 681",
    route: "Hải Phòng → Hạ Long",
    bookedAt: "22 phút trước",
    status: "Đã xác nhận",
  },
  {
    name: "Chị Thảo",
    phone: "09•• ••• 459",
    route: "Bắc Giang → Hà Nội",
    bookedAt: "27 phút trước",
    status: "Đã xác nhận",
  },
  {
    name: "Anh Quân",
    phone: "08•• ••• 903",
    route: "Hà Nội → Móng Cái",
    bookedAt: "31 phút trước",
    status: "Đã xác nhận",
  },
  {
    name: "Chị Linh",
    phone: "03•• ••• 614",
    route: "Hải Phòng → Bắc Ninh",
    bookedAt: "36 phút trước",
    status: "Đã xác nhận",
  },
] as const;

const INITIAL_DELAY_MS = 20_000;
const VISIBLE_DURATION_MS = 6_000;
const BETWEEN_RECORDS_MS = 4_000;

export function BookingActivityToast() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let hideTimer: number | undefined;
    let nextTimer: number | undefined;

    const showRecord = () => {
      setIsVisible(true);

      hideTimer = window.setTimeout(() => {
        setIsVisible(false);

        nextTimer = window.setTimeout(() => {
          setCurrentIndex(
            (index) => (index + 1) % BOOKING_ACTIVITY_RECORDS.length,
          );
          showRecord();
        }, BETWEEN_RECORDS_MS);
      }, VISIBLE_DURATION_MS);
    };

    const initialTimer = window.setTimeout(showRecord, INITIAL_DELAY_MS);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(nextTimer);
    };
  }, []);

  const record = BOOKING_ACTIVITY_RECORDS[currentIndex];

  return (
    <aside
      className={`pointer-events-none fixed right-4 top-20 z-30 w-[min(280px,calc(100vw-2rem))] rounded-lg border border-emerald-200/80 bg-white/95 p-2 shadow-[0_6px_20px_rgba(15,23,42,0.14)] transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none sm:right-6 sm:top-24 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-[calc(100%_+_1.5rem)] opacity-0"
      }`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-hidden={!isVisible}
    >
      <div className="flex items-center gap-2">
        {/* Icon trạng thái */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        </span>

        {/* Nội dung chính */}
        <div className="min-w-0 flex-1 text-left">
          {/* Dòng 1: Tên + SĐT + Badge */}
          <div className="flex items-center justify-between gap-1.5">
            <p className="truncate text-[11px] font-bold text-slate-900">
              {record.name}{" "}
              <span className="font-normal text-slate-500">
                ({record.phone})
              </span>
            </p>
            <span className="shrink-0 rounded bg-emerald-50 px-1 py-0.5 text-[9px] font-semibold text-emerald-700">
              {record.status}
            </span>
          </div>

          {/* Dòng 2: Tuyến đường + Thời gian */}
          <div className="mt-0.5 flex items-center justify-between gap-1 text-[10px]">
            <span className="inline-flex min-w-0 items-center gap-1 truncate font-semibold text-orange-600">
              <MapPin
                className="h-3 w-3 shrink-0 text-orange-500"
                aria-hidden="true"
              />
              <span className="truncate">{record.route}</span>
            </span>

            <span className="inline-flex shrink-0 items-center gap-1 text-[9px] text-slate-400">
              <Clock3 className="h-2.5 w-2.5" aria-hidden="true" />
              {record.bookedAt}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
