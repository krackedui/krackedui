'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../foundations/icon';
import { Calendar, isSameDay, startOfDay } from './calendar';
import { useFieldControl } from './field';
import { useControllable } from '../lib/use-controllable';
import { Portal, useAnchored, useDismiss } from '../lib/overlay';

type Size = 'sm' | 'md' | 'lg';

const DATE = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const format = (d: Date | null | undefined) => (d ? DATE.format(d) : '');

interface TriggerShape {
  className?: string;
  style?: CSSProperties;
  id?: string;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
}

/** The button both pickers open from: a control that reads as a field, not a button. */
function PickerTrigger({
  text, open, size = 'md', disabled, invalid, placeholder, buttonRef, onToggle, id, className, style, label,
}: TriggerShape & {
  text: string;
  open: boolean;
  label: string;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      id={id}
      className={cn('bay-datepicker__trigger', `bay-input--${size}`, className)}
      style={style}
      disabled={disabled}
      aria-haspopup="dialog"
      aria-expanded={open}
      data-invalid={invalid ? '' : undefined}
      aria-label={label}
      data-placeholder={text ? undefined : ''}
      onClick={onToggle}
    >
      <Icon name="calendar" size={14} className="bay-datepicker__icon" />
      <span className="bay-datepicker__value">{text || placeholder || 'Pick a date'}</span>
    </button>
  );
}

export interface DatePickerProps {
  className?: string;
  style?: CSSProperties;
  id?: string;
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  placeholder?: string;
  min?: Date;
  max?: Date;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  /** Names the control when it is not inside a Field. */
  label?: string;
}

/**
 * A single date, chosen from a calendar in a popover.
 *
 * The trigger reads the chosen date rather than only an icon, so the value is visible without
 * opening anything. Escape closes and returns focus to the trigger.
 */
export function DatePicker({
  className, style, id, value, defaultValue = null, onValueChange, placeholder, min, max,
  size = 'md', disabled, invalid, label,
}: DatePickerProps) {
  const field = useFieldControl();
  const [selected, setSelected] = useControllable<Date | null>(value, defaultValue, onValueChange);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pos = useAnchored(open, triggerRef, panelRef, 'bottom', 'start');

  useDismiss(open, () => {
    setOpen(false);
    triggerRef.current?.focus();
  }, [panelRef, triggerRef]);

  return (
    <span className={cn('bay-datepicker', className)} style={style}>
      <PickerTrigger
        id={id ?? field?.controlId}
        text={format(selected)}
        placeholder={placeholder}
        label={label ?? 'Date'}
        open={open}
        size={size}
        disabled={disabled}
        invalid={invalid || field?.invalid}
        buttonRef={triggerRef}
        onToggle={() => setOpen(!open)}
      />
      {open && (
        <Portal>
          <div
            ref={panelRef}
            role="dialog"
            aria-label={label ?? 'Choose a date'}
            className="bay-datepicker__panel"
            style={pos ? { top: pos.top, left: pos.left } : { opacity: 0 }}
          >
            <Calendar
              value={selected}
              min={min}
              max={max}
              onValueChange={(d) => {
                setSelected(d);
                setOpen(false);
                triggerRef.current?.focus();
              }}
            />
          </div>
        </Portal>
      )}
    </span>
  );
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface DateRangePickerProps {
  className?: string;
  style?: CSSProperties;
  id?: string;
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange) => void;
  placeholder?: string;
  min?: Date;
  max?: Date;
  /** Quick ranges beside the calendar: "Last 30 days" and the like. */
  presets?: { label: string; range: DateRange }[];
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  label?: string;
}

const EMPTY: DateRange = { from: null, to: null };

/**
 * A span of days.
 *
 * The first click sets the start and clears the end; the second sets the end, swapping them if the
 * second day is earlier, so a range chosen backwards is still a range rather than an error.
 */
export function DateRangePicker({
  className, style, id, value, defaultValue = EMPTY, onValueChange, placeholder, min, max, presets,
  size = 'md', disabled, invalid, label,
}: DateRangePickerProps) {
  const field = useFieldControl();
  const [range, setRange] = useControllable<DateRange>(value, defaultValue, onValueChange);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pos = useAnchored(open, triggerRef, panelRef, 'bottom', 'start');

  useDismiss(open, () => {
    setOpen(false);
    triggerRef.current?.focus();
  }, [panelRef, triggerRef]);

  const text = range.from ? `${format(range.from)} – ${range.to ? format(range.to) : '…'}` : '';

  const onDayClick = (day: Date) => {
    const d = startOfDay(day);
    if (!range.from || range.to || isSameDay(d, range.from)) {
      setRange({ from: d, to: null });
      return;
    }
    const [from, to] = d < range.from ? [d, range.from] : [range.from, d];
    setRange({ from, to });
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <span className={cn('bay-datepicker', className)} style={style}>
      <PickerTrigger
        id={id ?? field?.controlId}
        text={text}
        placeholder={placeholder}
        label={label ?? 'Date range'}
        open={open}
        size={size}
        disabled={disabled}
        invalid={invalid || field?.invalid}
        buttonRef={triggerRef}
        onToggle={() => setOpen(!open)}
      />
      {open && (
        <Portal>
          <div
            ref={panelRef}
            role="dialog"
            aria-label={label ?? 'Choose a date range'}
            className="bay-datepicker__panel bay-datepicker__panel--range"
            style={pos ? { top: pos.top, left: pos.left } : { opacity: 0 }}
          >
            {presets && presets.length > 0 && (
              <div className="bay-datepicker__presets">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className="bay-datepicker__preset"
                    onClick={() => {
                      setRange(p.range);
                      setOpen(false);
                      triggerRef.current?.focus();
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
            <Calendar range={range} min={min} max={max} onDayClick={onDayClick} />
          </div>
        </Portal>
      )}
    </span>
  );
}
