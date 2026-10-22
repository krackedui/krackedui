'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { cn, variants } from '../lib/cn';
import { Icon, type IconName } from '../foundations/icon';
import { useFieldControl } from './field';
import { useControllable } from '../lib/use-controllable';

type Size = 'sm' | 'md' | 'lg';

export interface Option<V extends string = string> {
  value: V;
  label: ReactNode;
  icon?: IconName;
  description?: ReactNode;
  disabled?: boolean;
}

/* ---------- checkbox ---------- */

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'checked' | 'defaultChecked' | 'onChange' | 'type'> {
  checked?: boolean | 'indeterminate';
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  invalid?: boolean;
}

/**
 * A checkbox. `checked="indeterminate"` draws the mixed state and reports `aria-checked="mixed"`,
 * for a parent whose children are only partly selected.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { checked, defaultChecked, onCheckedChange, label, invalid, className, disabled, id, ...rest },
  ref,
) {
  const field = useFieldControl();
  const auto = useId();
  const inputId = id ?? (label ? auto : field?.controlId) ?? auto;
  const indeterminate = checked === 'indeterminate';
  const [on, setOn] = useControllable<boolean>(
    indeterminate ? undefined : (checked as boolean | undefined),
    defaultChecked ?? false,
    onCheckedChange,
  );
  const inner = useRef<HTMLInputElement | null>(null);
  // `indeterminate` is a property, not an attribute — React cannot set it in JSX
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <span className={cn('bay-check', className)} data-disabled={disabled ? '' : undefined}>
      <input
        ref={(node) => {
          inner.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        id={inputId}
        type="checkbox"
        className="bay-check__input"
        checked={indeterminate ? false : on}
        aria-checked={indeterminate ? 'mixed' : on}
        aria-invalid={invalid || field?.invalid ? true : undefined}
        aria-describedby={field?.describedBy}
        disabled={disabled}
        onChange={(e) => setOn(e.target.checked)}
        {...rest}
      />
      <span className="bay-check__box" aria-hidden="true">
        <Icon name={indeterminate ? 'minus' : 'check'} size={12} />
      </span>
      {label && (
        <label className="bay-check__label" htmlFor={inputId}>
          {label}
        </label>
      )}
    </span>
  );
});

/* ---------- radio ---------- */

interface RadioContextValue {
  name: string;
  value?: string;
  setValue: (v: string) => void;
  disabled?: boolean;
}
const RadioContext = createContext<RadioContextValue | null>(null);

export interface RadioGroupProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  children?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  orientation?: 'horizontal' | 'vertical';
}

/** A set of mutually exclusive options. Arrow keys move between them, as the radio pattern expects. */
export function RadioGroup({ children, value, defaultValue, onValueChange, disabled, name, orientation = 'vertical', className, style, id }: RadioGroupProps) {
  const auto = useId();
  const [chosen, setChosen] = useControllable<string>(value, defaultValue ?? '', onValueChange);
  return (
    <RadioContext.Provider value={{ name: name ?? auto, value: chosen, setValue: setChosen, disabled }}>
      <div role="radiogroup" aria-orientation={orientation} className={cn('bay-radios', className)} data-orientation={orientation} style={style} id={id}>
        {children}
      </div>
    </RadioContext.Provider>
  );
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
  value: string;
  label?: ReactNode;
}

/** One option inside a `RadioGroup`. Throws outside one, rather than silently doing nothing. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, label, className, disabled, id, ...rest },
  ref,
) {
  const group = useContext(RadioContext);
  if (!group) throw new Error('<Radio> must be inside a <RadioGroup> — it takes its name and value from the group.');
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <span className={cn('bay-radio', className)} data-disabled={disabled || group.disabled ? '' : undefined}>
      <input
        ref={ref}
        id={inputId}
        type="radio"
        className="bay-radio__input"
        name={group.name}
        value={value}
        checked={group.value === value}
        disabled={disabled || group.disabled}
        onChange={() => group.setValue(value)}
        {...rest}
      />
      <span className="bay-radio__dot" aria-hidden="true" />
      {label && (
        <label className="bay-radio__label" htmlFor={inputId}>
          {label}
        </label>
      )}
    </span>
  );
});

/* ---------- switch ---------- */

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'checked' | 'defaultChecked' | 'onChange' | 'type' | 'size'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  size?: 'sm' | 'md';
}

/** An on/off toggle that applies immediately — no Save beside it. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { checked, defaultChecked, onCheckedChange, label, size = 'md', className, disabled, id, ...rest },
  ref,
) {
  const field = useFieldControl();
  const auto = useId();
  const inputId = id ?? (label ? auto : field?.controlId) ?? auto;
  const [on, setOn] = useControllable<boolean>(checked, defaultChecked ?? false, onCheckedChange);
  return (
    <span className={cn('bay-switch', `bay-switch--${size}`, className)} data-disabled={disabled ? '' : undefined}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        role="switch"
        className="bay-switch__input"
        checked={on}
        disabled={disabled}
        aria-describedby={field?.describedBy}
        onChange={(e) => setOn(e.target.checked)}
        {...rest}
      />
      <span className="bay-switch__track" aria-hidden="true">
        <span className="bay-switch__thumb" />
      </span>
      {label && (
        <label className="bay-switch__label" htmlFor={inputId}>
          {label}
        </label>
      )}
    </span>
  );
});

/* ---------- segmented control ---------- */

export const segmentedVariants = variants('bay-segmented', {
  size: { sm: 'bay-segmented--sm', md: 'bay-segmented--md', lg: 'bay-segmented--lg' },
});

export interface SegmentedControlProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: Size;
}

/** A small set of exclusive options, shown inline. Uses the radio pattern, so arrow keys move. */
export function SegmentedControl({ options, value, defaultValue, onValueChange, size = 'md', className, style, id }: SegmentedControlProps) {
  const [chosen, setChosen] = useControllable<string>(value, defaultValue ?? options[0]?.value ?? '', onValueChange);
  return (
    <div role="radiogroup" className={cn(segmentedVariants({ size }), className)} style={style} id={id}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={chosen === o.value}
          disabled={o.disabled}
          className="bay-segmented__option"
          data-selected={chosen === o.value ? '' : undefined}
          onClick={() => setChosen(o.value)}
        >
          {o.icon && <Icon name={o.icon} size={14} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- select ---------- */

export const selectVariants = variants('bay-select', {
  size: { sm: 'bay-select--sm', md: 'bay-select--md', lg: 'bay-select--lg' },
});

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'defaultValue' | 'onChange' | 'size'> {
  options: Option[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  size?: Size;
  invalid?: boolean;
}

/**
 * Pick one option from a short list.
 *
 * Built on the native `<select>`, so it gets the platform's own listbox, keyboard handling and
 * mobile picker. An option's `icon` and `description` are accepted but not drawn — a native option
 * cannot hold them. `Combobox` is the one to use when those matter.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, value, defaultValue, onValueChange, placeholder, size = 'md', invalid, className, disabled, required, id, ...rest },
  ref,
) {
  const field = useFieldControl();
  const [chosen, setChosen] = useControllable<string>(value, defaultValue ?? '', onValueChange);
  return (
    <div className={cn(selectVariants({ size }), className)} data-invalid={invalid || field?.invalid ? '' : undefined} data-disabled={disabled ? '' : undefined}>
      <select
        ref={ref}
        className="bay-select__control"
        id={id ?? field?.controlId}
        aria-describedby={field?.describedBy}
        aria-invalid={invalid || field?.invalid ? true : undefined}
        required={required ?? field?.required}
        disabled={disabled}
        value={chosen}
        onChange={(e) => setChosen(e.target.value)}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {typeof o.label === 'string' ? o.label : o.value}
          </option>
        ))}
      </select>
      <Icon name="chevronsUpDown" size={14} className="bay-select__arrow" />
    </div>
  );
});
