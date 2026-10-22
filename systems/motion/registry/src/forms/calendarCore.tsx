// Shared month grid for Calendar, DatePicker and DateRangePicker (not exported from the package).
// Implements the WAI-ARIA APG date grid: one tabbable day (roving tabindex), arrows move by day/week,
// Home/End to the start/end of the week, PageUp/PageDown by month (Shift: by year), Enter/Space selects.
import { useEffect, useMemo, useRef, type KeyboardEvent } from 'react';
import { tv } from '../lib/tv';
import { Icon } from '../icons/Icon';

/* ---------- date helpers (local time, day precision) ---------- */

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** Same day-of-month in another month, clamped to the month's length (Jan 31 + 1 month → Feb 28). */
export const addMonths = (d: Date, n: number) => {
  const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last));
};
export const sameDay = (a?: Date | null, b?: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const sameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
export const monthDiff = (a: Date, b: Date) => (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
/** Day comparison: negative when a is before b. */
export const compareDay = (a: Date, b: Date) => startOfDay(a).getTime() - startOfDay(b).getTime();
export const isOutOfRange = (d: Date, min?: Date, max?: Date) => (!!min && compareDay(d, min) < 0) || (!!max && compareDay(d, max) > 0);
export const clampDay = (d: Date, min?: Date, max?: Date) => (min && compareDay(d, min) < 0 ? startOfDay(min) : max && compareDay(d, max) > 0 ? startOfDay(max) : d);

/** 6 weeks of days covering `month`, starting on `weekStartsOn`. */
export function monthWeeks(month: Date, weekStartsOn: 0 | 1): Date[][] {
  const first = startOfMonth(month);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const start = addDays(first, -offset);
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)));
}

/** "Oct 21, 2026" in en-US; follows `locale`. */
export const formatDate = (d: Date, locale = 'en-US') => new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
const formatMonth = (d: Date, locale: string) => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(d);
const formatDayLabel = (d: Date, locale: string) => new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(d);

/* ---------- styles ---------- */

/**
 * Calendar measurements from the date property popover: caption 14/21 500, "Today" 12/500 icon-secondary,
 * prev/next 20px chevrons icon-tertiary; 7 × 32px cells, day buttons 28px radius 6 14/16.8; selected =
 * blue-icon-accent-primary fill, today = red marker. Outside-month days use text-tertiary (the capture's
 * #8b9898 has no token). Range: start/end filled, days between in blue-bg-secondary.
 */
export const calendarVariants = tv({
  slots: {
    root: 'inline-flex flex-col gap-1 p-2',
    months: 'flex flex-col gap-4 sm:flex-row',
    month: 'flex flex-col gap-1',
    caption: 'flex h-7 items-center justify-between gap-2 px-1',
    title: 'truncate px-0.5 text-[14px] font-medium leading-[21px] text-n-text-primary',
    navGroup: 'flex shrink-0 items-center gap-1',
    today: [
      'flex h-5 cursor-pointer items-center rounded-n-xs px-2 text-[12px] font-medium leading-[14.4px] text-n-text-secondary outline-none',
      'hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow pointer-coarse:h-7',
    ],
    nav: [
      'flex size-5 cursor-pointer items-center justify-center rounded-n-xs text-n-icon-secondary outline-none hover:bg-n-button-hover-bg-a',
      'focus-visible:shadow-n-focus-shadow disabled:cursor-default disabled:opacity-40 pointer-coarse:size-7',
    ],
    grid: 'border-collapse',
    head: 'size-8 p-0 text-center text-[12px] font-normal leading-[18px] text-n-text-secondary',
    cell: 'size-8 p-0 text-center',
    day: [
      'relative mx-auto flex size-7 cursor-pointer items-center justify-center rounded-n-md text-[14px] leading-[16.8px] text-n-text-primary outline-none tabular-nums',
      'hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow',
      'aria-disabled:cursor-default aria-disabled:text-n-text-tertiary aria-disabled:line-through aria-disabled:hover:bg-transparent',
    ],
    todayDot: 'pointer-events-none absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-n-red-icon-accent-primary',
  },
  variants: {
    outside: { true: { day: 'text-n-text-secondary' } },
    selected: { true: { day: 'bg-n-blue-bg-solid font-medium text-n-text-on-solid hover:bg-n-blue-bg-solid-hover', todayDot: 'bg-n-text-on-solid' } },
    inRange: { true: { cell: 'bg-n-blue-bg-secondary', day: 'rounded-n-xs hover:bg-n-button-hover-bg-a' } },
    rangeStart: { true: { cell: 'rounded-l-n-md' } },
    rangeEnd: { true: { cell: 'rounded-r-n-md' } },
  },
});

/* ---------- MonthGrid ---------- */

export interface DayState {
  selected?: boolean;
  inRange?: boolean;
  rangeStart?: boolean;
  rangeEnd?: boolean;
}

export interface MonthGridProps {
  /** Any day in the month to show. */
  month: Date;
  /** The day with tabindex=0 (null: this grid has no tabbable day). */
  focusedDate: Date | null;
  /** When true, DOM focus follows `focusedDate` (after keyboard moves). */
  moveFocus: boolean;
  onFocusDate: (date: Date) => void;
  onSelect: (date: Date) => void;
  onHover?: (date: Date | null) => void;
  dayState: (date: Date) => DayState;
  min?: Date;
  max?: Date;
  today: Date;
  locale: string;
  weekStartsOn: 0 | 1;
  /** id of the caption that labels this grid. */
  labelledBy: string;
  /** Show days of the previous/next month (dimmed). */
  showOutsideDays?: boolean;
}

export function MonthGrid({
  month, focusedDate, moveFocus, onFocusDate, onSelect, onHover, dayState, min, max, today, locale, weekStartsOn, labelledBy, showOutsideDays = true,
}: MonthGridProps) {
  const weeks = useMemo(() => monthWeeks(month, weekStartsOn), [month, weekStartsOn]);
  const weekdays = useMemo(() => weeks[0].map((d) => ({
    short: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d).slice(0, 2),
    long: new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(d),
  })), [weeks, locale]);
  const gridRef = useRef<HTMLTableElement>(null);
  const s = calendarVariants();

  useEffect(() => {
    if (!moveFocus || !focusedDate || !sameMonth(focusedDate, month)) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`button[data-day="${dayKey(focusedDate)}"]`)?.focus();
  }, [moveFocus, focusedDate, month]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, d: Date) => {
    const weekStart = addDays(d, -((d.getDay() - weekStartsOn + 7) % 7));
    const map: Record<string, () => Date> = {
      ArrowLeft: () => addDays(d, -1),
      ArrowRight: () => addDays(d, 1),
      ArrowUp: () => addDays(d, -7),
      ArrowDown: () => addDays(d, 7),
      Home: () => weekStart,
      End: () => addDays(weekStart, 6),
      PageUp: () => addMonths(d, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(d, e.shiftKey ? 12 : 1),
    };
    if (map[e.key]) {
      e.preventDefault();
      onFocusDate(clampDay(map[e.key](), min, max));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOutOfRange(d, min, max)) onSelect(d);
    }
  };

  return (
    <table ref={gridRef} role="grid" aria-labelledby={labelledBy} className={s.grid()} onMouseLeave={() => onHover?.(null)}>
      <thead>
        <tr>
          {weekdays.map((w) => (
            <th key={w.long} scope="col" abbr={w.long} className={s.head()}>{w.short}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr key={dayKey(week[0])}>
            {week.map((d) => {
              const outside = !sameMonth(d, month);
              if (outside && !showOutsideDays) return <td key={dayKey(d)} className={s.cell()} />;
              const st = dayState(d);
              const disabled = isOutOfRange(d, min, max);
              const v = calendarVariants({ outside, selected: !!st.selected, inRange: !!st.inRange && !outside, rangeStart: !!st.rangeStart, rangeEnd: !!st.rangeEnd });
              const isToday = sameDay(d, today);
              return (
                <td key={dayKey(d)} role="gridcell" aria-selected={st.selected || st.inRange ? true : undefined} className={v.cell()}>
                  <button
                    type="button"
                    data-day={dayKey(d)}
                    tabIndex={focusedDate && sameDay(d, focusedDate) && !outside ? 0 : -1}
                    aria-label={formatDayLabel(d, locale)}
                    aria-current={isToday ? 'date' : undefined}
                    aria-disabled={disabled || undefined}
                    className={v.day()}
                    onClick={() => { if (!disabled) onSelect(d); }}
                    onFocus={() => { if (!focusedDate || !sameDay(d, focusedDate)) onFocusDate(d); }}
                    onMouseEnter={() => onHover?.(d)}
                    onKeyDown={(e) => onKeyDown(e, d)}
                  >
                    {d.getDate()}
                    {isToday && <span aria-hidden="true" className={v.todayDot()} />}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/* ---------- caption ---------- */

export interface CalendarCaptionProps {
  id: string;
  month: Date;
  locale: string;
  onPrev?: () => void;
  onNext?: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  onToday?: () => void;
}

/** "October 2026" + Today + prev/next. The title is a polite live region so month changes are announced. */
export function CalendarCaption({ id, month, locale, onPrev, onNext, prevDisabled, nextDisabled, onToday }: CalendarCaptionProps) {
  const s = calendarVariants();
  return (
    <div className={s.caption()}>
      <div id={id} aria-live="polite" className={s.title()}>{formatMonth(month, locale)}</div>
      <div className={s.navGroup()}>
        {onToday && <button type="button" className={s.today()} onClick={onToday}>Today</button>}
        {onPrev && (
          <button type="button" aria-label="Previous month" disabled={prevDisabled} className={s.nav()} onClick={onPrev}>
            <Icon name="arrowChevronSingleLeftSmall" size={16} />
          </button>
        )}
        {onNext && (
          <button type="button" aria-label="Next month" disabled={nextDisabled} className={s.nav()} onClick={onNext}>
            <Icon name="arrowChevronSingleRightSmall" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
