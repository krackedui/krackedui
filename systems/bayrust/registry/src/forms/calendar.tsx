'use client';

import { useMemo, useRef, useState, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { IconButton } from '../actions/actions';
import { useControllable } from '../lib/use-controllable';

/*
 * Dates here are calendar days, not instants. Everything below works in the local timezone and
 * compares by year-month-day, because "is this the 3rd?" must not change with the clock: building a
 * Date from an ISO string would land on the previous day west of UTC.
 */

/** Midnight local on the same calendar day. */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Same calendar day, ignoring the time of day. */
export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const MONTH_LABEL = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
const DAY_LABEL = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const WEEKDAYS = (() => {
  // a known Monday, so the labels follow the viewer's locale without hard-coding English
  const base = new Date(2024, 0, 1);
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
  return Array.from({ length: 7 }, (_, i) => fmt.format(addDays(base, i)));
})();

/** The 6×7 grid a month is drawn on, Monday first, including the days either side that fill it. */
function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7; // Sunday is 0; this calendar starts on Monday
  const start = addDays(first, -lead);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

const outside = (d: Date, min?: Date, max?: Date) =>
  Boolean((min && startOfDay(d) < startOfDay(min)) || (max && startOfDay(d) > startOfDay(max)));

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'defaultValue'> {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  min?: Date;
  max?: Date;
  /** Highlight a span. The picker uses it to shade a range while one is being chosen. */
  range?: { from: Date | null; to: Date | null };
  /** Called for every day clicked, selected or not — the range picker needs both ends. */
  onDayClick?: (day: Date) => void;
}

/**
 * A month of days.
 *
 * One tab stop, as the grid pattern asks: Tab reaches the calendar, the arrow keys move inside it.
 * Only the focused day is tabbable, so a calendar never costs 42 tab stops.
 */
export function Calendar({
  value, defaultValue = null, onValueChange, min, max, range, onDayClick, className, ...rest
}: CalendarProps) {
  const [selected, setSelected] = useControllable<Date | null>(value, defaultValue, onValueChange);
  // Open on the month being looked at, not on today: a range picker passes `range` rather than
  // `value`, and landing on the current month would make an existing range invisible.
  const anchorDay = selected ?? range?.from ?? range?.to ?? new Date();
  const [month, setMonth] = useState<Date>(() => new Date(anchorDay.getFullYear(), anchorDay.getMonth(), 1));
  const [focused, setFocused] = useState<Date>(() => anchorDay);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const days = useMemo(() => monthGrid(month), [month]);

  const focusDay = (d: Date) => {
    setFocused(d);
    if (d.getMonth() !== month.getMonth() || d.getFullYear() !== month.getFullYear()) {
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
    // the grid re-renders with a new tabbable cell; move focus to it once it exists
    requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${dayKey(d)}"]`)?.focus();
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in moves) {
      e.preventDefault();
      focusDay(addDays(focused, moves[e.key]));
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusDay(addDays(focused, -((focused.getDay() + 6) % 7)));
    } else if (e.key === 'End') {
      e.preventDefault();
      focusDay(addDays(focused, 6 - ((focused.getDay() + 6) % 7)));
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      const next = addMonths(month, e.key === 'PageUp' ? -1 : 1);
      setMonth(next);
      focusDay(new Date(next.getFullYear(), next.getMonth(), Math.min(focused.getDate(), 28)));
    }
  };

  const pick = (d: Date) => {
    if (outside(d, min, max)) return;
    onDayClick?.(d);
    if (!onDayClick) setSelected(startOfDay(d));
    setFocused(d);
  };

  const today = new Date();
  const inRange = (d: Date) =>
    Boolean(range?.from && range.to && startOfDay(d) >= startOfDay(range.from) && startOfDay(d) <= startOfDay(range.to));

  return (
    <div className={cn('bay-calendar', className)} {...rest}>
      <div className="bay-calendar__header">
        <IconButton icon="chevronLeft" label="Previous month" size="sm" onClick={() => setMonth(addMonths(month, -1))} />
        <div className="bay-calendar__month" aria-live="polite">
          {MONTH_LABEL.format(month)}
        </div>
        <IconButton icon="chevronRight" label="Next month" size="sm" onClick={() => setMonth(addMonths(month, 1))} />
      </div>
      <div className="bay-calendar__weekdays" aria-hidden="true">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div ref={gridRef} role="grid" tabIndex={-1} aria-label={MONTH_LABEL.format(month)} className="bay-calendar__grid" onKeyDown={onKeyDown}>
        {days.map((d) => {
          const isOutside = outside(d, min, max);
          const isOther = d.getMonth() !== month.getMonth();
          const isSelected = isSameDay(d, selected) || isSameDay(d, range?.from) || isSameDay(d, range?.to);
          return (
            <button
              key={dayKey(d)}
              type="button"
              role="gridcell"
              data-day={dayKey(d)}
              className="bay-calendar__day"
              data-outside={isOther ? '' : undefined}
              data-today={isSameDay(d, today) ? '' : undefined}
              data-selected={isSelected ? '' : undefined}
              data-in-range={inRange(d) ? '' : undefined}
              aria-label={DAY_LABEL.format(d)}
              aria-selected={isSelected}
              aria-current={isSameDay(d, today) ? 'date' : undefined}
              disabled={isOutside}
              tabIndex={isSameDay(d, focused) ? 0 : -1}
              onClick={() => pick(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
