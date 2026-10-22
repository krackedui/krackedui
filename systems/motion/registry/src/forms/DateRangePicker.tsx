import { forwardRef, useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Popover as RPopover } from 'radix-ui';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';
import { Icon } from '../icons/Icon';
import { Popover } from '../components/Popover';
import { FieldBoundary, useFieldControl, useFieldProps } from './Field';
import { datePickerVariants, toISODate } from './DatePicker';
import {
  addMonths, calendarVariants, CalendarCaption, clampDay, compareDay, formatDate, monthDiff, MonthGrid, sameDay, startOfDay, startOfMonth,
} from './calendarCore';
import { joinIds, useControllableState, useMediaQuery } from './internal';

export interface DateRange { from: Date | null; to: Date | null }
export interface DateRangePreset { label: string; range: DateRange }

/** Range picker: the DatePicker field; popover = presets column (menu rows) beside one or two month grids. */
export const dateRangePickerVariants = tv({
  slots: {
    content: 'flex max-w-[calc(100vw-16px)] flex-col sm:flex-row',
    presets: [
      'flex shrink-0 gap-1 overflow-x-auto border-b border-n-border-primary p-2',
      'sm:w-40 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r',
    ],
    preset: [
      'flex h-7 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-n-md px-2 text-left text-[14px] leading-[16.8px] text-n-text-primary outline-none',
      'hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow aria-pressed:bg-n-blue-bg-secondary aria-pressed:font-medium',
    ],
    calendars: 'flex flex-col gap-1 p-2',
    months: 'flex gap-4',
    footer: 'flex min-h-6 items-center px-1 text-[12px] leading-4 text-n-text-secondary',
  },
});

export interface DateRangePickerProps {
  value?: DateRange;
  defaultValue?: DateRange;
  /** Called with a complete range (both ends) or an empty one (cleared). */
  onValueChange?: (value: DateRange) => void;
  placeholder?: string;
  min?: Date;
  max?: Date;
  /** Quick ranges shown beside the calendar. */
  presets?: DateRangePreset[];
  size?: 'sm' | 'md' | 'lg';
  /** Show a clear (×) button when there is a value (default true). */
  clearable?: boolean;
  /** BCP 47 locale (default "en-US"). */
  locale?: string;
  weekStartsOn?: 0 | 1;
  /** "Today" for the calendar marker; pass a fixed date for static renders. */
  today?: Date;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Form field name: hidden inputs `<name>.from` and `<name>.to` carry yyyy-mm-dd. */
  name?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const EMPTY: DateRange = { from: null, to: null };
const ordered = (a: Date, b: Date): DateRange => (compareDay(a, b) <= 0 ? { from: a, to: b } : { from: b, to: a });
const sameRange = (a: DateRange, b: DateRange) => sameDay(a.from, b.from) && sameDay(a.to, b.to) && !!a.from === !!b.from && !!a.to === !!b.to;

/**
 * DateRangePicker: a start/end date field with an optional presets list (Last 7 days, This month…).
 * Two months side by side on wide screens, one under 640px. Click (or Enter) a start day, then an end day;
 * the range previews as you hover or move with the keyboard.
 */
export const DateRangePicker = forwardRef<HTMLButtonElement, DateRangePickerProps>(function DateRangePicker(props, ref) {
  const {
    value: valueProp, defaultValue = EMPTY, onValueChange, placeholder = 'Pick a date range', min, max, presets, size, clearable = true,
    locale = 'en-US', weekStartsOn = 0, today: todayProp, open: openProp, defaultOpen = false, onOpenChange, invalid, disabled, required,
    name, id, className, style, 'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
  } = useFieldProps(props);
  const field = useFieldControl();
  const [value, setValue] = useControllableState<DateRange>(valueProp, defaultValue, onValueChange);
  const [now] = useState(() => new Date());
  const today = useMemo(() => startOfDay(todayProp ?? now), [todayProp, now]);
  const wide = useMediaQuery('(min-width: 640px)');
  const count = wide ? 2 : 1;

  const [draft, setDraft] = useState<DateRange>(value);
  const [hover, setHover] = useState<Date | null>(null);
  const [left, setLeft] = useState(() => startOfMonth(value.from ?? today));
  const [focused, setFocused] = useState<Date>(() => value.from ?? today);
  const [moveFocus, setMoveFocus] = useState(false);
  const [open, setOpenState] = useControllableState(openProp, defaultOpen, onOpenChange);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const uid = useId();
  const valueId = `${uid}-value`;

  const setOpen = (next: boolean) => {
    if (next) {
      // Start each session from the committed value.
      const start = clampDay(value.from ?? today, min, max);
      setDraft(value);
      setHover(null);
      setFocused(start);
      setLeft(startOfMonth(start));
      setMoveFocus(true);
    }
    setOpenState(next);
  };

  const focusDate = (d: Date) => {
    setFocused(d);
    setMoveFocus(true);
    const diff = monthDiff(left, d);
    if (diff < 0) setLeft(startOfMonth(d));
    else if (diff >= count) setLeft(startOfMonth(addMonths(d, -(count - 1))));
    if (draft.from && !draft.to) setHover(d);
  };
  const select = (d: Date) => {
    if (!draft.from || draft.to) { setDraft({ from: d, to: null }); setHover(d); return; }
    const range = ordered(draft.from, d);
    setDraft(range);
    setValue(range);
    setOpenState(false);
  };
  const applyPreset = (p: DateRangePreset) => { setValue(p.range); setOpenState(false); };

  // What the grid shows: the draft, or the draft start + hovered day as a preview.
  const shown: DateRange = draft.from && !draft.to && hover ? ordered(draft.from, hover) : draft;
  const dayState = (d: Date) => {
    const isFrom = sameDay(d, shown.from);
    const isTo = sameDay(d, shown.to);
    const between = !!shown.from && !!shown.to && compareDay(d, shown.from) > 0 && compareDay(d, shown.to) < 0;
    return { selected: isFrom || isTo, inRange: between || ((isFrom || isTo) && !!shown.to && !sameDay(shown.from, shown.to)), rangeStart: isFrom, rangeEnd: isTo };
  };

  const text = value.from
    ? `${formatDate(value.from, locale)} – ${value.to ? formatDate(value.to, locale) : '…'}`
    : null;
  const s = datePickerVariants({ size, invalid, disabled });
  const r = dateRangePickerVariants();
  const months = Array.from({ length: count }, (_, i) => addMonths(left, i));
  const lastShown = months[months.length - 1];
  const status = draft.from && !draft.to ? 'Pick an end date' : draft.from && draft.to ? `${formatDate(draft.from, locale)} – ${formatDate(draft.to, locale)}` : 'Pick a start date';

  return (
    <RPopover.Root open={open} onOpenChange={setOpen}>
      <RPopover.Anchor asChild>
        <div className={s.root({ className })} style={style}>
          <RPopover.Trigger asChild>
            <button
              ref={(el) => { triggerRef.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }}
              type="button"
              id={id}
              disabled={disabled}
              aria-label={!field && ariaLabel ? (text ? `${ariaLabel}, ${text}` : ariaLabel) : undefined}
              aria-labelledby={field && !ariaLabel ? joinIds(field.labelId, valueId) : undefined}
              className={s.trigger()}
              aria-describedby={ariaDescribedBy}
                          >
              <Icon name="calendarAltEmpty" size={16} className={s.icon()} />
              <span id={valueId} className={text ? s.value() : s.placeholder()}>{text ?? placeholder}</span>
            </button>
          </RPopover.Trigger>
          {clearable && value.from && !disabled && (
            <button type="button" aria-label="Clear dates" className={s.clear()} onClick={() => { setValue(EMPTY); triggerRef.current?.focus(); }}>
              <Icon name="xMarkFillSmall" size={16} />
            </button>
          )}
          {name && (
            <>
              <input type="hidden" name={`${name}.from`} value={value.from ? toISODate(value.from) : ''} required={required} />
              <input type="hidden" name={`${name}.to`} value={value.to ? toISODate(value.to) : ''} required={required} />
            </>
          )}
        </div>
      </RPopover.Anchor>
      <Popover.Content aria-label="Choose dates" className={r.content()} onOpenAutoFocus={(e) => e.preventDefault()}>
        <FieldBoundary>
          {presets && presets.length > 0 && (
            <div role="group" aria-label="Presets" className={r.presets()}>
              {presets.map((p) => (
                <button key={p.label} type="button" aria-pressed={sameRange(p.range, value)} className={r.preset()} onClick={() => applyPreset(p)}>
                  {p.label}
                </button>
              ))}
            </div>
          )}
          <div className={r.calendars()}>
            <div className={r.months()}>
              {months.map((m, i) => (
                <div key={m.getTime()} className={calendarVariants().month()}>
                  <CalendarCaption
                    id={`${uid}-caption-${i}`}
                    month={m}
                    locale={locale}
                    onPrev={i === 0 ? () => { setLeft(addMonths(left, -1)); setMoveFocus(false); } : undefined}
                    onNext={i === count - 1 ? () => { setLeft(addMonths(left, 1)); setMoveFocus(false); } : undefined}
                    prevDisabled={!!min && compareDay(left, startOfMonth(min)) <= 0}
                    nextDisabled={!!max && compareDay(lastShown, startOfMonth(max)) >= 0}
                  />
                  <MonthGrid
                    month={m}
                    focusedDate={monthDiff(m, focused) === 0 ? focused : i === 0 && (monthDiff(left, focused) < 0 || monthDiff(left, focused) >= count) ? clampDay(m, min, max) : null}
                    moveFocus={moveFocus}
                    onFocusDate={focusDate}
                    onSelect={select}
                    onHover={(d) => { if (draft.from && !draft.to) setHover(d); }}
                    dayState={dayState}
                    min={min}
                    max={max}
                    today={today}
                    locale={locale}
                    weekStartsOn={weekStartsOn}
                    labelledBy={`${uid}-caption-${i}`}
                    showOutsideDays={false}
                  />
                </div>
              ))}
            </div>
            <div aria-live="polite" className={cn(r.footer())}>{status}</div>
          </div>
        </FieldBoundary>
      </Popover.Content>
    </RPopover.Root>
  );
});
