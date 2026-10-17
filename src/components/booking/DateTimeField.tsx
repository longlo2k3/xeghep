"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MINUTE_STEP = 5;

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** Giờ đón sớm nhất = hiện tại + leadMinutes, làm tròn lên theo MINUTE_STEP (dạng "YYYY-MM-DDTHH:mm"). */
function computeMin(leadMinutes: number): string {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + leadMinutes);
  d.setMinutes(Math.ceil(d.getMinutes() / MINUTE_STEP) * MINUTE_STEP);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatDisplay(value: string): string {
  if (!value) return "";
  const [date, time] = value.split("T");
  const parts = date.split("-");
  if (parts.length !== 3) return value;
  const [y, m, d] = parts;
  return time ? `${d}/${m}/${y} • ${time.slice(0, 5)}` : `${d}/${m}/${y}`;
}

export interface DateTimeFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Số phút tối thiểu kể từ hiện tại (mặc định 20). */
  leadMinutes?: number;
  placeholder?: string;
  ariaLabel?: string;
  /** Class cho vùng bấm (đã gồm chiều cao, viền, padding...). */
  className?: string;
  iconClassName?: string;
}

export function DateTimeField({
  value,
  onChange,
  leadMinutes = 20,
  placeholder = "Chọn ngày & giờ",
  ariaLabel = "Ngày đi",
  className = "",
  iconClassName = "w-4 h-4 text-slate-400",
}: DateTimeFieldProps) {
  const [open, setOpen] = useState(false);
  const [minValue, setMinValue] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMinValue(computeMin(leadMinutes));
  }, [leadMinutes]);

  const minDate = minValue ? minValue.slice(0, 10) : "";
  const minTime = minValue ? minValue.slice(11, 16) : "";

  const [draftDate, setDraftDate] = useState("");
  const [draftTime, setDraftTime] = useState("08:00");
  const [view, setView] = useState(() => {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  });

  // Đồng bộ bản nháp khi mở panel
  useEffect(() => {
    if (!open) return;
    const base = value || minValue;
    if (!base) return;
    const date = base.slice(0, 10);
    const time = base.length >= 16 ? base.slice(11, 16) : "08:00";
    setDraftDate(date);
    setDraftTime(time);
    setView({ y: Number(date.slice(0, 4)), m: Number(date.slice(5, 7)) - 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Đóng khi bấm ra ngoài hoặc nhấn Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const today = todayStr();
  const defaultDate = minDate || today;

  const commit = (date: string, time: string) => {
    if (!date) return;
    if (minDate && date < minDate) return;
    let next = time || draftTime || "08:00";
    if (minDate && date === minDate && minTime && next < minTime) next = minTime;
    setDraftDate(date);
    setDraftTime(next);
    onChange(`${date}T${next}`);
  };

  const weeks = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const offset = (first.getDay() + 6) % 7; // Thứ 2 là đầu tuần
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < offset; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [view]);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => {
    const set = new Set<number>();
    for (let m = 0; m < 60; m += MINUTE_STEP) set.add(m);
    const cur = Number(draftTime.slice(3, 5));
    if (!Number.isNaN(cur)) set.add(cur);
    return Array.from(set).sort((a, b) => a - b);
  }, [draftTime]);

  const shiftMonth = (delta: number) => {
    setView((prev) => {
      const d = new Date(prev.y, prev.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`relative flex w-full items-center justify-between gap-2 text-left ${className}`}
      >
        <span
          className={`block min-w-0 flex-1 truncate ${
            value ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {value ? formatDisplay(value) : placeholder}
        </span>
        <Calendar className={`${iconClassName} flex-shrink-0`} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Chọn ngày và giờ"
          className="absolute left-0 right-auto top-full z-50 mt-1 w-[19rem] max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Tháng trước"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-slate-900">
              Tháng {view.m + 1}/{view.y}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Tháng sau"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((w) => (
              <span
                key={w}
                className="py-1 text-center text-[10px] font-bold uppercase text-slate-400"
              >
                {w}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {weeks.flat().map((day, index) => {
              if (day === null) {
                return <span key={`empty-${index}`} />;
              }
              const dateStr = `${view.y}-${pad2(view.m + 1)}-${pad2(day)}`;
              const disabled = Boolean(minDate && dateStr < minDate);
              const selected = dateStr === draftDate;
              const isToday = dateStr === today;
              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={disabled}
                  onClick={() => commit(dateStr, draftTime)}
                  className={`h-8 rounded-lg text-xs font-semibold transition-colors ${
                    selected
                      ? "bg-[#990000] text-white"
                      : disabled
                        ? "cursor-not-allowed text-slate-300"
                        : isToday
                          ? "text-red-600 ring-1 ring-inset ring-red-300 hover:bg-red-50"
                          : "text-slate-700 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 p-2">
            <Clock className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Giờ đón
            </span>
            <div className="ml-auto flex items-center gap-1">
              <select
                aria-label="Giờ"
                value={draftTime.slice(0, 2)}
                onChange={(e) =>
                  commit(draftDate || defaultDate, `${e.target.value}:${draftTime.slice(3, 5)}`)
                }
                className="h-8 rounded-lg border border-slate-300 bg-white px-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                {hours.map((h) => (
                  <option key={h} value={pad2(h)}>
                    {pad2(h)}
                  </option>
                ))}
              </select>
              <span className="font-bold text-slate-400">:</span>
              <select
                aria-label="Phút"
                value={draftTime.slice(3, 5)}
                onChange={(e) =>
                  commit(draftDate || defaultDate, `${draftTime.slice(0, 2)}:${e.target.value}`)
                }
                className="h-8 rounded-lg border border-slate-300 bg-white px-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                {minutes.map((m) => (
                  <option key={m} value={pad2(m)}>
                    {pad2(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-2 text-[11px] text-slate-500">
            Giờ đón sớm nhất:{" "}
            <span className="font-semibold text-slate-700">
              {minValue ? formatDisplay(minValue) : "--"}
            </span>
          </p>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 w-full rounded-lg bg-[#990000] py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#b70000] cursor-pointer"
          >
            Xong
          </button>
        </div>
      )}
    </div>
  );
}
