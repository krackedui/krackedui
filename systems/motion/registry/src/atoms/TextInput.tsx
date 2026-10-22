import {
  forwardRef,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '../lib/cn';
import { composeRefs } from '../lib/refs';
import { tv, type VariantProps } from '../lib/tv';
import { useFieldProps } from '../forms/Field';
import { Icon, type IconName } from '../icons/Icon';

/**
 * Text field surface: 28px (md), 4px 6px padding, 6px radius, translucent grey fill, 14/20 text,
 * hairline ring at rest; the ring turns blue on focus and red when invalid. Leading icon: a 24px slot
 * with a 16px tertiary glyph.
 */
export const textInputVariants = tv({
  slots: {
    root: [
      'relative flex w-full min-w-0 cursor-text items-center rounded-n-md bg-n-bg-secondary-translucent-a text-n-text-primary',
      'shadow-[0_0_0_1px_var(--n-border-primary-translucent-a)] focus-within:shadow-n-input-blue-focus-ring',
      'pointer-coarse:min-h-8',
    ],
    input: [
      'block min-w-0 flex-1 self-stretch resize-none border-0 bg-transparent p-0 text-inherit outline-none',
      'placeholder:text-n-text-tertiary disabled:cursor-default',
      'focus-visible:shadow-none', // the ring lives on the root
      '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
    ],
    field: 'flex min-w-0 flex-1 cursor-text items-center self-stretch',
    icon: 'mr-1.5 flex size-6 shrink-0 items-center justify-center text-n-icon-tertiary',
    trailing: 'ml-1.5 flex shrink-0 items-center text-n-icon-tertiary',
  },
  variants: {
    size: {
      sm: { root: 'h-6 px-1.5 text-[12px] leading-4', icon: 'mr-1 size-5' },
      md: { root: 'h-7 px-1.5 text-[14px] leading-5' },
      lg: { root: 'h-8 px-2 text-[14px] leading-5' },
    },
    // Invalid: red ring; focus adds a soft red halo so the focused state differs from rest.
    invalid: { true: { root: 'shadow-n-input-red-focus-ring focus-within:shadow-[var(--n-input-red-focus-ring),0_0_0_3px_var(--n-red-border-strong-translucent-a)]' } },
    disabled: { true: { root: 'cursor-default opacity-50' } },
  },
  defaultVariants: { size: 'md' },
});

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, Omit<VariantProps<typeof textInputVariants>, 'disabled' | 'invalid'> {
  /** Marks the value as invalid: red ring and `aria-invalid`. Field sets it from its `error`. */
  invalid?: boolean;
  /** Leading icon name (e.g. `search`). */
  icon?: IconName;
  /** Content at the end of the field (unit, button, shortcut). */
  trailing?: ReactNode;
  /** Class for the `<input>` itself (`className` styles the box). */
  inputClassName?: string;
}

/**
 * Single-line text field with an optional leading icon and trailing content. Wrap it in Field for a
 * label, description and error message.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  rawProps,
  ref,
) {
  // Inside a Field: id, aria-describedby, aria-invalid/required and invalid styling come from it.
  const { size, invalid, icon, trailing, className, inputClassName, disabled, style, ...props } = useFieldProps(rawProps);
  const s = textInputVariants({ size, invalid: !!invalid, disabled: !!disabled });
  return (
    <div className={s.root({ className })} style={style}>
      {/* The label makes the icon and padding focus the field; it holds no text, so it adds nothing to the name. */}
      <label className={s.field()}>
        {icon && <span className={s.icon()}><Icon name={icon} size={16} /></span>}
        <input ref={ref} disabled={disabled} aria-invalid={invalid || undefined} className={s.input({ className: inputClassName })} {...props} />
      </label>
      {trailing && <span className={s.trailing()}>{trailing}</span>}
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Marks the value as invalid: red ring and `aria-invalid`. */
  invalid?: boolean;
}

/** Multi-line text field with the TextInput surface (4px 10px padding, 14/20), resizable vertically. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(rawProps, ref) {
  const { invalid, className, rows = 3, ...props } = useFieldProps(rawProps);
  const s = textInputVariants({ invalid: !!invalid, disabled: !!props.disabled });
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        s.root(),
        'block h-auto resize-y px-2.5 py-1 text-[14px] leading-5 outline-none placeholder:text-n-text-tertiary',
        'focus:shadow-n-input-blue-focus-ring focus-visible:shadow-n-input-blue-focus-ring',
        invalid && 'shadow-n-input-red-focus-ring focus:shadow-[var(--n-input-red-focus-ring),0_0_0_3px_var(--n-red-border-strong-translucent-a)] focus-visible:shadow-[var(--n-input-red-focus-ring),0_0_0_3px_var(--n-red-border-strong-translucent-a)]',
        className,
      )}
      {...props}
    />
  );
});

export interface SearchInputProps extends Omit<TextInputProps, 'icon' | 'type'> {
  /**
   * `field` = boxed search/filter field; `bare` = unboxed header field of a search dialog
   * (22px icon, 16/24 text).
   */
  variant?: 'field' | 'bare';
  /**
   * Called when the clear button (or Escape) empties the field. Uncontrolled fields clear themselves;
   * controlled fields should reset `value` here.
   */
  onClear?: () => void;
  /** Label of the clear button. */
  clearLabel?: string;
}

/**
 * Search field (`type="search"`) with a leading magnifier and a clear button that appears once there
 * is text; Escape also clears. Use it to filter lists, tables and pickers.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  rawProps,
  ref,
) {
  // Inside a Field: id, aria-describedby, aria-invalid/required and invalid styling come from it.
  const { variant = 'field', onClear, clearLabel = 'Clear search', value, defaultValue, onChange, onKeyDown, className, placeholder = 'Search', trailing, size, invalid, inputClassName, style, ...props } = useFieldProps(rawProps);
  const inputRef = useRef<HTMLInputElement>(null);
  const controlled = value !== undefined;
  const [inner, setInner] = useState(String(defaultValue ?? ''));
  const v = controlled ? String(value) : inner;
  const canClear = v !== '' && !props.disabled && !props.readOnly && (!controlled || !!onClear);
  const clear = () => {
    if (!controlled) setInner('');
    onClear?.();
    inputRef.current?.focus();
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!controlled) setInner(e.target.value);
    onChange?.(e);
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (!e.defaultPrevented && e.key === 'Escape' && canClear) {
      e.preventDefault();
      e.stopPropagation();
      clear();
    }
  };
  const clearButton = canClear ? (
    <button
      type="button"
      aria-label={clearLabel}
      className={cn(
        'flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-n-icon-tertiary outline-none hover:text-n-icon-secondary',
        'focus-visible:shadow-n-focus-shadow pointer-coarse:size-6',
      )}
      onClick={clear}
    >
      <Icon name="xMarkFillSmall" size={16} />
    </button>
  ) : null;
  const inputProps = {
    type: 'search' as const,
    value: v,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    placeholder,
    'aria-invalid': invalid || undefined,
    ...props,
  };

  if (variant === 'bare') {
    return (
      <div className={cn('flex w-full items-center gap-2 text-[16px] leading-6 text-n-text-primary', className)} style={style}>
        <label className="flex min-w-0 flex-1 cursor-text items-center gap-2 self-stretch">
          <Icon name="magnifyingGlass" size={22} className="mx-1 text-n-icon-secondary" />
          <input
            ref={composeRefs(ref, inputRef)}
            className={cn(
              'min-w-0 flex-1 border-0 bg-transparent p-0 text-inherit outline-none placeholder:text-n-text-tertiary focus-visible:shadow-none',
              '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
              inputClassName,
            )}
            {...inputProps}
          />
        </label>
        {clearButton}
        {trailing}
      </div>
    );
  }
  return (
    <TextInput
      ref={composeRefs(ref, inputRef)}
      icon="magnifyingGlassSmall"
      size={size}
      invalid={invalid}
      inputClassName={inputClassName}
      className={className}
      style={style}
      trailing={clearButton || trailing ? <>{clearButton}{trailing}</> : undefined}
      {...inputProps}
    />
  );
});
