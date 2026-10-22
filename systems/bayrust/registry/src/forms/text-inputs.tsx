'use client';

import {
  forwardRef,
  useId,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cn, variants } from '../lib/cn';
import { Icon, type IconName } from '../foundations/icon';
import { IconButton } from '../actions/actions';
import { useFieldControl } from './field';
import { useControllable } from '../lib/use-controllable';

type Size = 'sm' | 'md' | 'lg';

export const inputVariants = variants('bay-input', {
  size: { sm: 'bay-input--sm', md: 'bay-input--md', lg: 'bay-input--lg' },
});

/** The attributes a control takes from its surrounding `Field`, if there is one. */
function useControlAttrs(own: { id?: string; invalid?: boolean; required?: boolean }) {
  const field = useFieldControl();
  return {
    id: own.id ?? field?.controlId,
    'aria-describedby': field?.describedBy,
    'aria-invalid': own.invalid ?? field?.invalid ? true : undefined,
    required: own.required ?? field?.required,
  };
}

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  invalid?: boolean;
  size?: Size;
  type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'number' | 'search';
  icon?: IconName;
  /** Content pinned to the right of the field: a unit, a count, a small button. */
  trailing?: ReactNode;
}

/** A single-line text input. Inside a `Field` it takes its id, description and invalid state from it. */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { invalid, size = 'md', type = 'text', icon, trailing, className, disabled, required, id, ...rest },
  ref,
) {
  const attrs = useControlAttrs({ id, invalid, required });
  return (
    <div className={cn(inputVariants({ size }), className)} data-invalid={attrs['aria-invalid'] ? '' : undefined} data-disabled={disabled ? '' : undefined}>
      {icon && <Icon name={icon} size={14} className="bay-input__icon" />}
      <input ref={ref} type={type} className="bay-input__control" disabled={disabled} {...attrs} {...rest} />
      {trailing && <span className="bay-input__trailing">{trailing}</span>}
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

/** A multi-line text input. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, rows = 3, disabled, required, id, ...rest },
  ref,
) {
  const attrs = useControlAttrs({ id, invalid, required });
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn('bay-input', 'bay-input--md', 'bay-textarea', className)}
      data-invalid={attrs['aria-invalid'] ? '' : undefined}
      disabled={disabled}
      {...attrs}
      {...rest}
    />
  );
});

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  invalid?: boolean;
  size?: Size;
  /** Called when the clear button is pressed, after the value is emptied. */
  onClear?: () => void;
}

/** A search field with a clear button, which appears only once there is something to clear. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { invalid, size = 'md', className, disabled, required, id, value, defaultValue, onChange, onClear, placeholder = 'Search', ...rest },
  ref,
) {
  const attrs = useControlAttrs({ id, invalid, required });
  const [text, setText] = useControllable<string>(
    value as string | undefined,
    (defaultValue as string | undefined) ?? '',
  );
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onChange?.(e);
  };
  return (
    <div className={cn(inputVariants({ size }), className)} data-disabled={disabled ? '' : undefined}>
      <Icon name="search" size={14} className="bay-input__icon" />
      <input
        ref={ref}
        type="search"
        className="bay-input__control"
        placeholder={placeholder}
        disabled={disabled}
        value={text}
        onChange={handleChange}
        {...attrs}
        {...rest}
      />
      {text !== '' && !disabled && (
        <IconButton
          icon="close"
          label="Clear search"
          size="sm"
          className="bay-input__clear"
          onClick={() => {
            setText('');
            onClear?.();
          }}
        />
      )}
    </div>
  );
});

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'defaultValue' | 'onChange'> {
  invalid?: boolean;
  size?: Size;
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Intl.NumberFormat options — currency, percent, decimals — applied while the field is not focused. */
  format?: Intl.NumberFormatOptions;
}

/**
 * A numeric input with steppers. Empty means `null`, not 0, so "no value" and "zero" stay different.
 * While the field is not focused the value is shown through `Intl.NumberFormat`; while it is, the
 * raw number is shown so it can be typed.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { invalid, size = 'md', className, disabled, required, id, value, defaultValue, onValueChange, min, max, step = 1, format, ...rest },
  ref,
) {
  const attrs = useControlAttrs({ id, invalid, required });
  const [num, setNum] = useControllable<number | null>(value, defaultValue ?? null, onValueChange);
  const [focused, setFocused] = useState(false);
  const labelId = useId();

  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  const nudge = (by: number) => setNum(clamp((num ?? 0) + by));
  const shown = num == null ? '' : focused || !format ? String(num) : new Intl.NumberFormat(undefined, format).format(num);

  return (
    <div className={cn(inputVariants({ size }), 'bay-number', className)} data-invalid={attrs['aria-invalid'] ? '' : undefined} data-disabled={disabled ? '' : undefined}>
      <input
        ref={ref}
        className="bay-input__control"
        inputMode="decimal"
        role="spinbutton"
        aria-valuenow={num ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        disabled={disabled}
        value={shown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const raw = e.target.value.trim();
          if (raw === '') return setNum(null);
          const parsed = Number(raw.replace(/[^0-9.eE+-]/g, ''));
          if (!Number.isNaN(parsed)) setNum(clamp(parsed));
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') { e.preventDefault(); nudge(step); }
          if (e.key === 'ArrowDown') { e.preventDefault(); nudge(-step); }
        }}
        {...attrs}
        {...rest}
      />
      <span className="bay-number__steppers" aria-hidden="true" id={labelId}>
        <button type="button" tabIndex={-1} className="bay-number__step" disabled={disabled} onClick={() => nudge(step)}>
          <Icon name="chevronUp" size={12} />
        </button>
        <button type="button" tabIndex={-1} className="bay-number__step" disabled={disabled} onClick={() => nudge(-step)}>
          <Icon name="chevronDown" size={12} />
        </button>
      </span>
    </div>
  );
});
