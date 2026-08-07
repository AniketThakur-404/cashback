import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_FORMATTER = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });
const DISPLAY_FORMATTER = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

const parseDateValue = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
};

const toDateValue = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const getMonthStart = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);

const MonthDatePicker = ({ value, onChange, label, min, max, className = "" }) => {
  const selectedDate = useMemo(() => parseDateValue(value), [value]);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStart(selectedDate || new Date()));
  const pickerRef = useRef(null);

  useEffect(() => {
    if (max && value && value > max) onChange(max);
  }, [max, onChange, value]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeWhenOutside = (event) => {
      if (!pickerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", closeWhenOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeWhenOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const firstDayOffset = (visibleMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const calendarCells = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;
  const selectDate = (date) => {
    onChange(toDateValue(date));
    setIsOpen(false);
  };

  return (
    <div ref={pickerRef} className={`relative min-w-0 ${className}`}>
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{label}</span>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          setVisibleMonth(getMonthStart(selectedDate || new Date()));
          setIsOpen(true);
        }}
        className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-left text-sm font-medium text-slate-800 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 dark:border-zinc-700 dark:bg-[#0f0f0f] dark:text-zinc-100 dark:hover:border-emerald-500/70 dark:hover:bg-emerald-500/10"
      >
        <CalendarDays size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <span className={selectedDate ? "truncate" : "truncate text-slate-400 dark:text-zinc-500"}>
          {selectedDate ? DISPLAY_FORMATTER.format(selectedDate).replace(/\//g, "-") : "dd-mm-yyyy"}
        </span>
      </button>

      {isOpen && (
        <div role="dialog" aria-label={`${label} calendar`} className="absolute left-0 z-50 mt-2 w-[19.5rem] rounded-xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 dark:border-zinc-700 dark:bg-[#171717] dark:shadow-black/30">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" aria-label="Previous month" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 dark:text-zinc-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300">
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{MONTH_FORMATTER.format(visibleMonth)}</p>
            <button type="button" aria-label="Next month" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 dark:text-zinc-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300">
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday} className="py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-zinc-500">{weekday}</span>
            ))}
            {Array.from({ length: calendarCells }, (_, index) => {
              const day = index - firstDayOffset + 1;
              if (day < 1 || day > daysInMonth) return <span key={`empty-${index}`} aria-hidden="true" className="h-9" />;

              const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
              const dateValue = toDateValue(date);
              const isSelected = dateValue === value;
              const isToday = dateValue === toDateValue(new Date());
              const isDisabled = (min && dateValue < min) || (max && dateValue > max);

              return (
                <button
                  key={dateValue}
                  type="button"
                  disabled={isDisabled}
                  aria-label={DISPLAY_FORMATTER.format(date)}
                  aria-pressed={isSelected}
                  onClick={() => selectDate(date)}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/35 ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                      : isToday
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30 dark:hover:bg-emerald-500/20"
                        : "text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  } disabled:cursor-not-allowed disabled:opacity-30`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-zinc-800">
            <button type="button" onClick={() => { onChange(""); setIsOpen(false); }} className="rounded-md px-2 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white">Clear</button>
            <button type="button" onClick={() => selectDate(new Date())} className="rounded-md px-2 py-1 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10">Today</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthDatePicker;