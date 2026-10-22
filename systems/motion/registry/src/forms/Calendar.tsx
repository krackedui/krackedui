import { forwardRef, useEffect, useId, useMemo, useState, type CSSProperties } from 'react';
import { useFieldControl } from './Field';
import { joinIds, useControllableState } from './internal';
import {
  calendarVariants, CalendarCaption, clampDay, compareDay, MonthGrid, sameDay, sameMonth, startOfDay, startOfMonth, addMonths,
} from './calendarCore';

export { calendarVariants };

export interface CalendarProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  /** Earliest selectable day. */
  min?: Date;
  /** Latest selectable day. */
  max?: Date;
  /** Month shown first (defaults to the value, else today). */
  defaultMonth?: Date;
  /** Called when the visible month changes (first day of the month). */
  onMonthChange?: (month: Date) => void;
  /** "Today" for the marker and the Today button; pass a fixed date for static renders. Defaults to now. */
  today?: Date;
  /** BCP 47 locale for month and weekday names (default "en-US"). */
  locale?: string;
  /** 0 = Sunday (default), 1 = Monday. */
  weekStartsOn?: 0 | 1;
  /** Show the "Today" button in the caption (default true). */
  showTodayButton?: boolean;
  /** Show days of the neighbouring months, dimmed (default true). */
  showOutsideDays?: boolean;
  /** Focus the selected (or today's) day on mount, e.g. inside a popover. */
  autoFocus?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

/**
 * Calendar: an inline month grid for picking one date. Use it on a page or in a panel; for a form field
 * use DatePicker (which opens this in a popover). Arrow keys move by day/week, Page Up/Down by month.
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  { value: valueProp, defaultValue = null, onValueChange, min, max, defaultMonth, onMonthChange, today: todayProp, locale = 'en-US',
    weekStartsOn = 0, showTodayButton = true, showOutsideDays = true, autoFocus = false, id, className, style,
    'aria-label': ariaLabel, 'aria-describedby': describedBy }, ref,
) {
  const field = useFieldControl();
  const [value, setValue] = useControllableState<Date | null>(valueProp, defaultValue, onValueChange);
  const [now] = useState(() => new Date());
  const today = useMemo(() => startOfDay(todayProp ?? now), [todayProp, now]);
  const [month, setMonthState] = useState(() => startOfMonth(defaultMonth ?? value ?? today));
  const [focused, setFocused] = useState<Date>(() => clampDay(value ?? (defaultMonth ? startOfMonth(defaultMonth) : today), min, max));
  const [moveFocus, setMoveFocus] = useState(autoFocus);
  const captionId = useId();

  const setMonth = (m: Date) => {
    const first = startOfMonth(m);
    if (first.getTime() !== month.getTime()) { setMonthState(first); onMonthChange?.(first); }
  };
  // Follow a controlled value that changes from outside.
  useEffect(() => {
    if (!value) return;
    setFocused((f) => (sameDay(f, value) ? f : value));
    setMonthState((m) => (m.getFullYear() === value.getFullYear() && m.getMonth() === value.getMonth() ? m : startOfMonth(value)));
  }, [value]);

  const focusDate = (d: Date) => { setFocused(d); setMoveFocus(true); setMonth(d); };
  const shift = (n: number) => {
    const m = addMonths(month, n);
    setMonth(m);
    setFocused(clampDay(addMonths(focused, n), min, max));
    setMoveFocus(false);
  };
  const prevDisabled = !!min && compareDay(startOfMonth(month), startOfMonth(min)) <= 0;
  const nextDisabled = !!max && compareDay(startOfMonth(month), startOfMonth(max)) >= 0;
  // The tabbable day must be in the visible month.
  const tabDay = sameMonth(focused, month) ? focused : clampDay(value && sameMonth(value, month) ? value : month, min, max);
  const s = calendarVariants();

  return (
    <div
      ref={ref}
      id={id ?? field?.controlId}
      role="group"
      aria-label={ariaLabel ?? (field ? undefined : 'Calendar')}
      aria-labelledby={!ariaLabel && field ? field.labelId : undefined}
      aria-describedby={joinIds(field?.descriptionId, field?.invalid ? field.errorId : undefined, describedBy)}
      className={s.root({ className })}
      style={style}
    >
      <CalendarCaption
        id={captionId}
        month={month}
        locale={locale}
        onPrev={() => shift(-1)}
        onNext={() => shift(1)}
        prevDisabled={prevDisabled}
        nextDisabled={nextDisabled}
        onToday={showTodayButton ? () => focusDate(clampDay(today, min, max)) : undefined}
      />
      <MonthGrid
        month={month}
        focusedDate={tabDay}
        moveFocus={moveFocus}
        onFocusDate={focusDate}
        onSelect={(d) => { setValue(d); setFocused(d); setMonth(d); }}
        dayState={(d) => ({ selected: sameDay(d, value) })}
        min={min}
        max={max}
        today={today}
        locale={locale}
        weekStartsOn={weekStartsOn}
        labelledBy={captionId}
        showOutsideDays={showOutsideDays}
      />
    </div>
  );
});
