import { forwardRef, useId, useRef, type CSSProperties } from 'react';
import { Popover as RPopover } from 'radix-ui';
import { tv } from '../lib/tv';
import { Icon } from '../icons/Icon';
import { Popover } from '../components/Popover';
import { FieldBoundary, useFieldControl, useFieldProps } from './Field';
import { Calendar } from './Calendar';
import { formatDate } from './calendarCore';
import { controlBox, controlDisabled, controlFocusWithin, controlInvalid, controlSizes, joinIds, useControllableState } from './internal';

export { formatDate };

/** Date field: the TextInput box holding a calendar glyph, the formatted date (or placeholder) and a clear button. */
export const datePickerVariants = tv({
  slots: {
    root: [controlBox, controlFocusWithin, 'gap-1'],
    trigger: 'flex h-full min-w-0 flex-1 cursor-pointer items-center gap-1.5 bg-transparent text-left outline-none [&:focus-visible]:shadow-none disabled:cursor-default',
    icon: 'shrink-0 text-n-icon-tertiary',
    value: 'min-w-0 flex-1 truncate',
    placeholder: 'min-w-0 flex-1 truncate text-n-text-secondary',
    clear: [
      'flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-n-icon-tertiary outline-none hover:text-n-icon-secondary',
      'focus-visible:shadow-n-focus-shadow pointer-coarse:size-6',
    ],
    content: 'max-w-[calc(100vw-16px)]',
  },
  variants: {
    size: { sm: { root: controlSizes.sm }, md: { root: controlSizes.md }, lg: { root: controlSizes.lg } },
    invalid: { true: { root: controlInvalid } },
    disabled: { true: { root: controlDisabled } },
  },
  defaultVariants: { size: 'md' },
});

/** yyyy-mm-dd in local time (the form value). */
export const toISODate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export interface DatePickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  placeholder?: string;
  min?: Date;
  max?: Date;
  size?: 'sm' | 'md' | 'lg';
  /** Show a clear (×) button when there is a value (default true). */
  clearable?: boolean;
  /** Display format (default "Oct 21, 2026" in `locale`). */
  formatValue?: (date: Date) => string;
  /** BCP 47 locale for the calendar and the default format (default "en-US"). */
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
  /** Form field name (a hidden input carries yyyy-mm-dd). */
  name?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

/**
 * DatePicker: a date form field that opens a calendar in a popover. Use it for one date in a form
 * (due date, birthday); use Calendar for an always-visible month and DateRangePicker for periods.
 */
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(props, ref) {
  const {
    value: valueProp, defaultValue = null, onValueChange, placeholder = 'Pick a date', min, max, size, clearable = true, formatValue,
    locale = 'en-US', weekStartsOn, today, open: openProp, defaultOpen = false, onOpenChange, invalid, disabled, required, name, id,
    className, style, 'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
  } = useFieldProps(props);
  const field = useFieldControl();
  const [value, setValue] = useControllableState<Date | null>(valueProp, defaultValue, onValueChange);
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const uid = useId();
  const valueId = `${uid}-value`;
  const text = value ? (formatValue ? formatValue(value) : formatDate(value, locale)) : null;
  const s = datePickerVariants({ size, invalid, disabled });

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
          {clearable && value && !disabled && (
            <button type="button" aria-label="Clear date" className={s.clear()} onClick={() => { setValue(null); triggerRef.current?.focus(); }}>
              <Icon name="xMarkFillSmall" size={16} />
            </button>
          )}
          {name && <input type="hidden" name={name} value={value ? toISODate(value) : ''} required={required} />}
        </div>
      </RPopover.Anchor>
      <Popover.Content aria-label="Choose date" className={s.content()} onOpenAutoFocus={(e) => e.preventDefault()}>
        <FieldBoundary>
        <Calendar
          autoFocus
          value={value}
          onValueChange={(d) => { setValue(d); setOpen(false); }}
          min={min}
          max={max}
          locale={locale}
          weekStartsOn={weekStartsOn}
          today={today}
          aria-label="Calendar"
        />
        </FieldBoundary>
      </Popover.Content>
    </RPopover.Root>
  );
});
