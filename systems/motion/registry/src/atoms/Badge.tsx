import { forwardRef, type HTMLAttributes } from 'react';
import { tv, type VariantProps } from '../lib/tv';

/**
 * Small status label. Geometry of Motion's "New" chip: 18px tall, 2px 4px padding, 4px radius,
 * 11px medium text. Tones map onto the palette: neutral = gray, accent / info = blue, success = green,
 * warning = yellow (soft) / orange (solid), danger = red. Every tone × variant reaches 4.5:1.
 */
export const badgeVariants = tv({
  base: 'inline-flex h-[18px] min-w-[18px] shrink-0 select-none items-center justify-center whitespace-nowrap rounded-n-sm px-1 py-0.5 text-[11px] font-medium leading-[14.3px] tabular-nums',
  variants: {
    tone: { neutral: '', accent: '', success: '', warning: '', danger: '', info: '' },
    variant: {
      soft: '',
      solid: 'text-n-text-on-solid',
      outline: 'bg-transparent',
    },
  },
  compoundVariants: [
    { variant: 'soft', tone: 'neutral', class: 'bg-n-bg-tertiary-translucent-a text-n-text-secondary' },
    { variant: 'soft', tone: ['accent', 'info'], class: 'bg-n-blue-bg-secondary-translucent-a text-n-blue-text-primary' },
    { variant: 'soft', tone: 'success', class: 'bg-n-green-bg-secondary-translucent-a text-n-green-text-primary' },
    { variant: 'soft', tone: 'warning', class: 'bg-n-yellow-bg-secondary-translucent-a text-n-yellow-text-primary' },
    { variant: 'soft', tone: 'danger', class: 'bg-n-red-bg-secondary-translucent-a text-n-red-text-primary' },
    { variant: 'solid', tone: 'neutral', class: 'bg-n-gray-bg-solid' },
    { variant: 'solid', tone: ['accent', 'info'], class: 'bg-n-blue-bg-solid' },
    { variant: 'solid', tone: 'success', class: 'bg-n-green-bg-solid' },
    { variant: 'solid', tone: 'warning', class: 'bg-n-orange-bg-solid' },
    { variant: 'solid', tone: 'danger', class: 'bg-n-red-bg-solid' },
    { variant: 'outline', tone: 'neutral', class: 'text-n-text-secondary shadow-[inset_0_0_0_1px_var(--n-border-strong)]' },
    { variant: 'outline', tone: ['accent', 'info'], class: 'text-n-blue-text-primary shadow-[inset_0_0_0_1px_var(--n-blue-border-strong)]' },
    { variant: 'outline', tone: 'success', class: 'text-n-green-text-primary shadow-[inset_0_0_0_1px_var(--n-green-border-strong)]' },
    { variant: 'outline', tone: 'warning', class: 'text-n-yellow-text-primary shadow-[inset_0_0_0_1px_var(--n-yellow-border-strong)]' },
    { variant: 'outline', tone: 'danger', class: 'text-n-red-text-primary shadow-[inset_0_0_0_1px_var(--n-red-border-strong)]' },
  ],
  defaultVariants: { tone: 'neutral', variant: 'soft' },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

/**
 * Short status or count label next to a title, menu item or nav item ("New", "Beta", "3").
 * A count badge is `variant="solid" tone="danger"`. Use Tag for user-defined categories.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ tone, variant, className, ...props }, ref) {
  return <span ref={ref} className={badgeVariants({ tone, variant, className })} {...props} />;
});
