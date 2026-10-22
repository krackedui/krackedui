import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { RadioGroup as RRadioGroup } from 'radix-ui';
import { cn } from '../lib/cn';
import { composeRefs } from '../lib/refs';
import { tv, type VariantProps } from '../lib/tv';
import { useFieldProps } from '../forms/Field';
import { Icon } from '../icons/Icon';

/**
 * Checkbox: the to-do box. Unchecked = 16px square with a 1.5px icon-primary border and 1.5px radius;
 * checked / indeterminate = accent fill with a white mark. A native `<input type="checkbox">` sits on top
 * (opacity 0), so forms, labels and assistive tech work; on touch screens it grows to a 24px hit area.
 */
export const checkboxVariants = tv({
  slots: {
    root: [
      'relative inline-flex shrink-0 items-center justify-center rounded-[1.5px] transition-[background,box-shadow] duration-[20ms] ease-in', // 1.5px radius: no token
      'has-[input:focus-visible]:shadow-n-focus-shadow',
    ],
    input: 'absolute inset-0 m-0 size-full cursor-pointer appearance-none opacity-0 outline-none disabled:cursor-default pointer-coarse:-inset-1 pointer-coarse:size-6',
    mark: 'pointer-events-none text-n-text-on-solid',
    label: 'inline-flex cursor-pointer items-center gap-2 text-n-ui text-n-text-primary has-[input:disabled]:cursor-default has-[input:disabled]:text-n-text-tertiary',
  },
  variants: {
    size: { sm: { root: 'size-3.5' }, md: { root: 'size-4' } },
    checked: {
      true: { root: 'bg-n-blue-icon-accent-primary' },
      false: { root: 'border-[1.5px] border-solid border-n-icon-primary hover:bg-n-button-hover-bg-a' },
    },
    invalid: { true: {} },
    disabled: { true: { root: 'opacity-40' } },
  },
  compoundVariants: [{ checked: false, invalid: true, class: { root: 'border-n-red-icon-accent-primary' } }],
  defaultVariants: { size: 'md', checked: false },
});

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'checked' | 'defaultChecked' | 'onChange'>,
    Pick<VariantProps<typeof checkboxVariants>, 'size'> {
  /** Controlled state. `'indeterminate'` shows a dash (some children checked). */
  checked?: boolean | 'indeterminate';
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: InputHTMLAttributes<HTMLInputElement>['onChange'];
  /** Text next to the box; clicking it toggles the box. Without it, pass `aria-label` or use a Field. */
  label?: ReactNode;
  /** Marks the value as invalid (red border, `aria-invalid`). */
  invalid?: boolean;
}

/**
 * Checkbox for independent on/off choices in forms and lists, with an indeterminate state for
 * "select all" rows. Use Switch for settings that apply immediately.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  rawProps,
  ref,
) {
  // Inside a Field: id, aria-describedby, aria-invalid/required and invalid styling come from it.
  const { checked, defaultChecked = false, onCheckedChange, onChange, size = 'md', disabled, invalid, label, className, style, ...props } = useFieldProps(rawProps);
  const [inner, setInner] = useState(defaultChecked);
  const inputRef = useRef<HTMLInputElement>(null);
  const state = checked ?? inner;
  const indeterminate = state === 'indeterminate';
  const on = state === true;
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const s = checkboxVariants({ size, checked: on || indeterminate, invalid: !!invalid, disabled: !!disabled });
  const box = (
    <span className={s.root({ className: label ? undefined : className })} style={label ? undefined : style}>
      {on && <Icon name="checkmarkFillSmall" size={size === 'sm' ? 12 : 14} className={s.mark()} />}
      {indeterminate && <Icon name="minus" size={size === 'sm' ? 10 : 12} strokeWidth={2.5} className={s.mark()} />}
      <input
        ref={composeRefs(ref, inputRef)}
        type="checkbox"
        checked={on}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={s.input()}
        onChange={(e) => {
          if (checked === undefined) setInner(e.target.checked);
          onCheckedChange?.(e.target.checked);
          onChange?.(e);
        }}
        {...props}
      />
    </span>
  );
  if (!label) return box;
  return (
    <label className={s.label({ className })} style={style}>
      {box}
      <span>{label}</span>
    </label>
  );
});

/* ------------------------------------------------------------------ radio */

export interface RadioGroupProps extends ComponentPropsWithoutRef<typeof RRadioGroup.Root> {
  /** Layout and arrow-key direction. */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * A set of mutually exclusive options (Radio items). Arrow keys move and select; Tab leaves the group.
 * Use Select for long lists and SegmentedControl for a few inline view options.
 */
/** Whether the last key in the group was an arrow, so focus moved by arrows also selects (WAI-ARIA radio). */
const ArrowNavContext = createContext<{ current: boolean } | null>(null);

export const RadioGroup = forwardRef<ElementRef<typeof RRadioGroup.Root>, RadioGroupProps>(function RadioGroup(
  { orientation = 'vertical', className, onKeyDown, onPointerDown, ...props },
  ref,
) {
  const arrowNav = useRef(false);
  return (
    <ArrowNavContext.Provider value={arrowNav}>
      <RRadioGroup.Root
        ref={ref}
        orientation={orientation}
        onKeyDown={(e) => { arrowNav.current = e.key.startsWith('Arrow'); onKeyDown?.(e); }}
        onPointerDown={(e) => { arrowNav.current = false; onPointerDown?.(e); }}
        className={cn('flex', orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row flex-wrap gap-x-4 gap-y-2', className)}
        {...props}
      />
    </ArrowNavContext.Provider>
  );
});

export interface RadioProps extends ComponentPropsWithoutRef<typeof RRadioGroup.Item> {
  size?: 'sm' | 'md';
  /** Text next to the circle; clicking it selects the option. */
  label?: ReactNode;
}

/**
 * One option in a RadioGroup: a 16px ring that fills with the accent and a white dot when selected.
 * The button grows to 24×24 on touch screens while the ring keeps its size.
 */
export const Radio = forwardRef<ElementRef<typeof RRadioGroup.Item>, RadioProps>(function Radio(
  { className, size = 'md', label, style, onFocus, ...props },
  ref,
) {
  const arrowNav = useContext(ArrowNavContext);
  const item = (
    <RRadioGroup.Item
      ref={ref}
      onFocus={(e) => {
        onFocus?.(e);
        // Radix selects on arrow focus only while the key is still down; select reliably here too.
        if (arrowNav?.current && !props.disabled && e.currentTarget.getAttribute('aria-checked') !== 'true') e.currentTarget.click();
      }}
      className={cn(
        'group/radio inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full outline-none',
        'focus-visible:shadow-n-focus-shadow disabled:cursor-default disabled:opacity-40',
        size === 'sm' ? 'size-3.5' : 'size-4',
        'pointer-coarse:size-6',
        !label && className,
      )}
      style={label ? undefined : style}
      {...props}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-solid border-n-icon-primary',
          'group-hover/radio:bg-n-button-hover-bg-a group-data-[state=checked]/radio:border-0 group-data-[state=checked]/radio:bg-n-blue-icon-accent-primary',
          size === 'sm' ? 'size-3.5' : 'size-4',
        )}
      >
        <RRadioGroup.Indicator className={cn('block rounded-full bg-n-text-on-solid', size === 'sm' ? 'size-[5px]' : 'size-1.5')} />
      </span>
    </RRadioGroup.Item>
  );
  if (!label) return item;
  return (
    <label
      className={cn('inline-flex cursor-pointer items-center gap-2 text-n-ui text-n-text-primary has-[button:disabled]:cursor-default has-[button:disabled]:text-n-text-tertiary', className)}
      style={style}
    >
      {item}
      <span>{label}</span>
    </label>
  );
});
