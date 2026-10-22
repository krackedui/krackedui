import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { Slot } from 'radix-ui';
import { tv, type VariantProps } from '../lib/tv';
import { Icon, type IconName } from '../icons/Icon';
import { Spinner } from './Spinner';

/**
 * Button recipe. Geometry follows Motion's toolbar buttons: 28px (md), 8px side padding, 6px radius,
 * 14px medium text. `primary` / `danger` are solid fills with white text at ≥ 4.5:1; `secondary` is a
 * hairline-bordered surface; `ghost` is text on a translucent hover wash.
 */
export const buttonVariants = tv({
  base: [
    'relative inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-n-md',
    'text-[14px] leading-[1.2] font-medium outline-none transition-[background,box-shadow] duration-[20ms] ease-in',
    'cursor-pointer focus-visible:shadow-n-focus-shadow',
    'disabled:cursor-default disabled:opacity-40 aria-disabled:cursor-default',
    'pointer-coarse:min-h-6 pointer-coarse:min-w-6',
  ],
  variants: {
    variant: {
      primary: 'bg-n-blue-bg-solid text-n-text-on-solid hover:bg-n-blue-bg-solid-hover active:bg-n-blue-bg-solid-pressed',
      secondary: 'bg-n-bg-primary text-n-text-primary shadow-[inset_0_0_0_1px_var(--n-border-primary)] hover:bg-n-button-hover-bg-a',
      ghost: 'font-normal text-n-text-primary hover:bg-n-button-hover-bg-a active:bg-n-button-pressed-bg-a',
      danger: 'bg-n-red-bg-solid text-n-text-on-solid hover:bg-n-red-bg-solid-hover active:bg-n-red-bg-solid-pressed',
      'danger-ghost': 'font-normal text-n-red-text-secondary hover:bg-n-red-bg-secondary',
    },
    size: {
      sm: 'h-6 px-1.5 text-[12px]',
      md: 'h-7 px-2',
      lg: 'h-8 px-3',
      xl: 'h-9 px-3 text-[15px]',
    },
    full: { true: 'w-full' },
    loading: { true: 'cursor-progress aria-disabled:cursor-progress' },
  },
  defaultVariants: { variant: 'ghost', size: 'md' },
});

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Omit<VariantProps<typeof buttonVariants>, 'loading'> {
  /** Leading icon name. */
  icon?: IconName;
  /** Trailing icon name, e.g. `chevronDown` for a menu button. */
  trailingIcon?: IconName;
  /** Shows a spinner over the content (the width and accessible name stay), sets `aria-busy` and ignores clicks. */
  loading?: boolean;
  /** Render as the child element (Radix Slot), e.g. a link styled as a button. */
  asChild?: boolean;
  children?: ReactNode;
}

const ICON_PX = { sm: 14, md: 16, lg: 16, xl: 16 } as const;
const SPINNER = { sm: 'sm', md: 'md', lg: 'md', xl: 'lg' } as const;

/**
 * Text button for actions. `primary` for the main action of a view, `secondary` for alternatives,
 * `ghost` for toolbar and inline actions, `danger` to confirm destructive actions.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, full, icon, trailingIcon, loading = false, asChild, type = 'button', className, children, onClick, disabled, ...props },
  ref,
) {
  const s = size ?? 'md';
  const className_ = buttonVariants({ variant, size, full, loading, className });
  if (asChild) {
    return (
      <Slot.Root ref={ref} className={className_} onClick={onClick} {...props}>
        {children}
      </Slot.Root>
    );
  }
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      className={className_}
      onClick={handleClick}
      {...props}
    >
      <span className={loading ? 'inline-flex items-center gap-[inherit] opacity-0' : 'contents'}>
        {icon && <Icon name={icon} size={ICON_PX[s]} />}
        {children}
        {trailingIcon && <Icon name={trailingIcon} size={ICON_PX[s]} className="opacity-60" />}
      </span>
      {loading && (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center">
          <Spinner size={SPINNER[s]} className="text-current" />
        </span>
      )}
    </button>
  );
});
