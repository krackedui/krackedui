import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { tv, type VariantProps } from '../lib/tv';
import { Icon, type IconName } from '../icons/Icon';
import { Tooltip } from './Tooltip';

/**
 * Square icon-only button. Topbar actions are 28×28 (radius 6, icon 20); sidebar and row affordances
 * 24×24 / 20×20 with the tertiary icon color. Grows to 24×24 on touch screens.
 */
export const iconButtonVariants = tv({
  base: [
    'inline-flex shrink-0 select-none items-center justify-center cursor-pointer outline-none',
    'transition-[background,box-shadow] duration-[20ms] ease-in hover:bg-n-button-hover-bg-a active:bg-n-button-pressed-bg-a',
    'focus-visible:shadow-n-focus-shadow disabled:cursor-default disabled:opacity-40',
    'pointer-coarse:min-h-6 pointer-coarse:min-w-6',
  ],
  variants: {
    size: {
      xs: 'size-5 rounded-n-xs',
      sm: 'size-6 rounded-n-sm',
      md: 'size-7 rounded-n-md',
      lg: 'size-8 rounded-n-lg',
    },
    variant: {
      ghost: '',
      secondary: 'bg-n-bg-primary shadow-[inset_0_0_0_1px_var(--n-border-primary)]',
    },
    tone: {
      primary: 'text-n-icon-primary',
      secondary: 'text-n-icon-secondary',
      tertiary: 'text-n-icon-tertiary',
    },
    active: { true: 'bg-n-button-hover-bg-a' },
  },
  defaultVariants: { size: 'md', variant: 'ghost', tone: 'primary' },
});

const ICON_PX = { xs: 16, sm: 18, md: 20, lg: 22 } as const;

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {
  /** Icon name. */
  icon: IconName;
  /** Accessible name (required: the button has no visible text). */
  label: string;
  /** Show the label in a tooltip on hover and focus. `false` (default) uses the native `title` hint. */
  tooltip?: ReactNode;
  /** Override the icon size in px. */
  iconSize?: number;
}

/**
 * Icon-only action, e.g. "More", "Close", "Add". Always pass `label`; it is the accessible name and
 * the hover hint. Use Button when there is room for a word.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, size, variant, tone, active, tooltip = false, iconSize, type = 'button', className, ...props },
  ref,
) {
  const button = (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={tooltip ? undefined : label}
      data-active={active || undefined}
      className={iconButtonVariants({ size, variant, tone, active, className })}
      {...props}
    >
      <Icon name={icon} size={iconSize ?? ICON_PX[size ?? 'md']} />
    </button>
  );
  if (!tooltip) return button;
  return <Tooltip content={tooltip === true ? label : tooltip}>{button}</Tooltip>;
});
