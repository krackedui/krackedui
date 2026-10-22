import { forwardRef, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FocusEvent, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { tv } from '../lib/tv';
import { Icon, type IconName } from '../icons/Icon';
import { useFieldProps } from './Field';
import { controlBox, controlDisabled, controlFocusWithin, controlInvalid, controlSizes, useControllableState } from './internal';

/** NumberInput: the TextInput box with tabular digits and an optional stepper (two 12px chevron buttons; 24px side by side on touch). */
export const numberInputVariants = tv({
  slots: {
    root: [controlBox, controlFocusWithin, 'cursor-text'],
    icon: 'mr-1.5 flex size-5 shrink-0 items-center justify-center text-n-icon-tertiary',
    input: [
      'block h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-inherit tabular-nums outline-none',
      'placeholder:text-n-text-tertiary disabled:cursor-default [&:focus-visible]:shadow-none',
    ],
    // Desktop: two stacked 12px chevrons. Touch (pointer: coarse): side by side, 24x24 each (WCAG 2.5.8),
    // decrease first.
    stepper: '-mr-1 ml-1 flex shrink-0 flex-col self-stretch py-0.5 pointer-coarse:flex-row-reverse pointer-coarse:items-center pointer-coarse:gap-0.5 pointer-coarse:py-0',
    step: [
      'flex min-h-0 w-4 flex-1 cursor-pointer items-center justify-center rounded-n-xs text-n-icon-tertiary hover:bg-n-button-hover-bg-a hover:text-n-icon-secondary',
      'disabled:cursor-default disabled:opacity-40 pointer-coarse:size-6 pointer-coarse:flex-none',
    ],
  },
  variants: {
    size: { sm: { root: controlSizes.sm }, md: { root: controlSizes.md }, lg: { root: controlSizes.lg } },
    invalid: { true: { root: controlInvalid } },
    disabled: { true: { root: controlDisabled } },
    align: { start: { input: 'text-left' }, end: { input: 'text-right' } },
  },
  defaultVariants: { size: 'md', align: 'start' },
});

/** Native input attributes NumberInput passes through (autoFocus, aria-*, data-*, onKeyDown…); the rest it owns. */
type PassThroughInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'size' | 'type' | 'min' | 'max' | 'step' | 'role' | 'inputMode' | 'placeholder' | 'disabled' | 'required' | 'readOnly' | 'name' | 'id' | 'className' | 'style' | 'onBlur' | 'onFocus'
>;

export interface NumberInputProps extends PassThroughInputProps {
  value?: number | null;
  defaultValue?: number | null;
  /** Called with the parsed, clamped number (or null when emptied) on blur, Enter, arrow keys and stepper clicks. */
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Arrow / stepper increment (default 1). Shift+Arrow and PageUp/PageDown step 10×. */
  step?: number;
  /** Intl.NumberFormat options used to display the value when not editing: currency, percent, decimals. */
  format?: Intl.NumberFormatOptions;
  /** BCP 47 locale for formatting and parsing (default "en-US"). */
  locale?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Show increment / decrement buttons at the end. */
  stepper?: boolean;
  /** Text alignment; use "end" for amounts in tables and forms with right-aligned numbers. */
  align?: 'start' | 'end';
  icon?: IconName;
  /** Content after the number (a unit). */
  trailing?: ReactNode;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  /** Form field name (a hidden input carries the raw number). */
  name?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/** Decimal and group separators of a locale, e.g. en-US → ".", ","; de-DE → ",", ".". */
function separators(locale: string) {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  return {
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
    group: parts.find((p) => p.type === 'group')?.value ?? ',',
  };
}

/**
 * Parse what a person typed in `locale`: ignores group separators, currency symbols, percent signs and
 * spaces; accepts the locale's decimal separator (and "." as a fallback). Returns null for empty, NaN for junk.
 */
export function parseLocaleNumber(text: string, locale = 'en-US'): number | null {
  const { decimal, group } = separators(locale);
  let t = text.trim();
  if (!t) return null;
  const negative = /^[-−(]/.test(t) || /[-−)]$/.test(t);
  t = t.split(group).join('').replace(/[\s\u00a0\u202f]/g, '');
  if (group !== '.' && decimal !== '.') t = t.replace('.', decimal);
  t = t.replace(decimal, '.').replace(/[^0-9.eE]/g, '');
  if (!t || t === '.') return Number.NaN;
  const n = Number(t);
  return negative ? -n : n;
}

/**
 * NumberInput: a numeric field with min / max / step, arrow-key stepping and Intl formatting (currency,
 * percent, units) when not focused. Use it for amounts, quantities and percentages; use TextInput for
 * numeric codes (ZIP, card numbers) that aren't quantities.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(props, ref) {
  const {
    value: valueProp, defaultValue = null, onValueChange, min, max, step = 1, format, locale = 'en-US', placeholder, size,
    stepper = false, align, icon, trailing, invalid, disabled, required, readOnly, name, id, className, style, onBlur, onFocus, onKeyDown: onKeyDownProp, ...rest
  } = useFieldProps(props);
  const [value, setValue] = useControllableState<number | null>(valueProp, defaultValue, onValueChange);
  const [draft, setDraft] = useState<string | null>(null); // text while editing; null = show formatted value
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Focus swaps the formatted text ("$1,250.00") for the edit text ("1250"); a full selection (Tab focus,
  // select-all) would be lost and typing would append. Re-select the new text when the old one was all selected.
  const reselect = useRef(false);
  useLayoutEffect(() => {
    if (!reselect.current) return;
    reselect.current = false;
    inputRef.current?.select();
  });

  const percent = format?.style === 'percent';
  const formatter = useMemo(() => new Intl.NumberFormat(locale, format), [locale, format]);
  const { decimal } = useMemo(() => separators(locale), [locale]);

  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  /** Drop floating-point noise (0.1 + 0.2) without truncating what was typed. */
  const round = (n: number) => Number.parseFloat(n.toPrecision(12));
  /** Editing text: the plain number in the locale's decimal separator (percent shown as 12.5 for 0.125). */
  const toEditText = (n: number | null) => (n === null ? '' : String(round(percent ? n * 100 : n)).replace('.', decimal));
  const display = draft ?? (value === null || value === undefined ? '' : formatter.format(value));

  const commit = (text: string) => {
    const parsed = parseLocaleNumber(text, locale);
    if (parsed === null) { if (value !== null) setValue(null); return; }
    if (Number.isNaN(parsed)) return; // keep the previous value; the draft is discarded on blur
    const next = clamp(round(percent ? parsed / 100 : parsed));
    if (next !== value) setValue(next);
  };
  const stepBy = (factor: number) => {
    if (disabled || readOnly) return;
    const base = draft !== null ? parseLocaleNumber(draft, locale) : value;
    const inc = percent ? (step / 100) * factor : step * factor;
    const empty = base === null || Number.isNaN(base);
    const next = empty ? clamp(min ?? 0) : clamp(round((percent && draft !== null ? base / 100 : base) + inc));
    setValue(next);
    if (draft !== null) setDraft(toEditText(next));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDownProp?.(e);
    if (e.defaultPrevented) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); stepBy((e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : 1)); }
    else if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); stepBy(e.key === 'PageUp' ? 10 : -10); }
    else if (e.key === 'Home' && min !== undefined) { e.preventDefault(); setValue(min); if (draft !== null) setDraft(toEditText(min)); }
    else if (e.key === 'End' && max !== undefined) { e.preventDefault(); setValue(max); if (draft !== null) setDraft(toEditText(max)); }
    else if (e.key === 'Enter' && draft !== null) { commit(draft); setDraft(toEditText(clampedDraftValue(draft))); }
  };
  const clampedDraftValue = (text: string) => {
    const parsed = parseLocaleNumber(text, locale);
    if (parsed === null) return null;
    if (Number.isNaN(parsed)) return value ?? null;
    return clamp(round(percent ? parsed / 100 : parsed));
  };

  const s = numberInputVariants({ size, invalid, disabled, align });
  const atMin = value !== null && value !== undefined && min !== undefined && value <= min;
  const atMax = value !== null && value !== undefined && max !== undefined && value >= max;
  return (
    <div className={s.root({ className })} style={style} onPointerDown={(e) => { if (e.target === e.currentTarget) { e.preventDefault(); inputRef.current?.focus(); } }}>
      {icon && <span className={s.icon()}><Icon name={icon} size={16} /></span>}
      <input
        {...rest}
        ref={(el) => { inputRef.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }}
        id={id}
        type="text"
        inputMode={Number.isInteger(step) && !percent && format?.style !== 'currency' && !format?.maximumFractionDigits ? 'numeric' : 'decimal'}
        role="spinbutton"
        aria-valuenow={value ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={value === null || value === undefined ? undefined : formatter.format(value)}
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        value={display}
        onFocus={(e) => {
          const el = e.currentTarget;
          reselect.current = el.value.length > 0 && el.selectionStart === 0 && el.selectionEnd === el.value.length;
          setDraft(toEditText(value ?? null));
          onFocus?.(e);
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => { if (draft !== null) commit(draft); setDraft(null); onBlur?.(e); }}
        onKeyDown={onKeyDown}
        className={s.input()}
      />
      {trailing && <span className="ml-1.5 flex shrink-0 items-center text-n-text-secondary">{trailing}</span>}
      {stepper && (
        <span className={s.stepper()}>
          <button type="button" tabIndex={-1} aria-label="Increase" disabled={disabled || readOnly || atMax} className={s.step()} onPointerDown={(e) => e.preventDefault()} onClick={() => stepBy(1)}>
            <Icon name="arrowChevronSingleUp" size={12} />
          </button>
          <button type="button" tabIndex={-1} aria-label="Decrease" disabled={disabled || readOnly || atMin} className={s.step()} onPointerDown={(e) => e.preventDefault()} onClick={() => stepBy(-1)}>
            <Icon name="arrowChevronSingleDown" size={12} />
          </button>
        </span>
      )}
      {name && <input type="hidden" name={name} value={value ?? ''} />}
    </div>
  );
});
