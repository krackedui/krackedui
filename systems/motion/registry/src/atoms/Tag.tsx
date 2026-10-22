import { forwardRef, type HTMLAttributes, type MouseEvent } from 'react';
import { cn } from '../lib/cn';
import { tv, type VariantProps } from '../lib/tv';
import { Icon } from '../icons/Icon';

/** Option colors (select / multi-select / status), in the menu order: `default` plus the ten palette colors. */
export const motionColors = ['default', 'gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red', 'teal'] as const;
export type MotionColor = (typeof motionColors)[number];

// Literal class strings so Tailwind can see them. Option pill: bg <color>-bg-tertiary-translucent-a, text <color>-text-primary.
const TAG_COLOR: Record<MotionColor, string> = {
  default: 'bg-n-bg-tertiary-translucent-a text-n-text-primary',
  gray: 'bg-n-gray-bg-tertiary-translucent-a text-n-gray-text-primary',
  brown: 'bg-n-brown-bg-tertiary-translucent-a text-n-brown-text-primary',
  orange: 'bg-n-orange-bg-tertiary-translucent-a text-n-orange-text-primary',
  yellow: 'bg-n-yellow-bg-tertiary-translucent-a text-n-yellow-text-primary',
  green: 'bg-n-green-bg-tertiary-translucent-a text-n-green-text-primary',
  blue: 'bg-n-blue-bg-tertiary-translucent-a text-n-blue-text-primary',
  purple: 'bg-n-purple-bg-tertiary-translucent-a text-n-purple-text-primary',
  pink: 'bg-n-pink-bg-tertiary-translucent-a text-n-pink-text-primary',
  red: 'bg-n-red-bg-tertiary-translucent-a text-n-red-text-primary',
  teal: 'bg-n-teal-bg-tertiary-translucent-a text-n-teal-text-primary',
};

// Status pill: same bg, text <color>-icon-primary, dot <color>-icon-accent-primary.
const STATUS_COLOR: Record<MotionColor, [string, string]> = {
  default: ['bg-n-gray-bg-tertiary-translucent-a text-n-gray-icon-primary', 'bg-n-gray-icon-accent-primary'],
  gray: ['bg-n-gray-bg-tertiary-translucent-a text-n-gray-icon-primary', 'bg-n-gray-icon-accent-primary'],
  brown: ['bg-n-brown-bg-tertiary-translucent-a text-n-brown-icon-primary', 'bg-n-brown-icon-accent-primary'],
  orange: ['bg-n-orange-bg-tertiary-translucent-a text-n-orange-icon-primary', 'bg-n-orange-icon-accent-primary'],
  yellow: ['bg-n-yellow-bg-tertiary-translucent-a text-n-yellow-icon-primary', 'bg-n-yellow-icon-accent-primary'],
  green: ['bg-n-green-bg-tertiary-translucent-a text-n-green-icon-primary', 'bg-n-green-icon-accent-primary'],
  blue: ['bg-n-blue-bg-tertiary-translucent-a text-n-blue-icon-primary', 'bg-n-blue-icon-accent-primary'],
  purple: ['bg-n-purple-bg-tertiary-translucent-a text-n-purple-icon-primary', 'bg-n-purple-icon-accent-primary'],
  pink: ['bg-n-pink-bg-tertiary-translucent-a text-n-pink-icon-primary', 'bg-n-pink-icon-accent-primary'],
  red: ['bg-n-red-bg-tertiary-translucent-a text-n-red-icon-primary', 'bg-n-red-icon-accent-primary'],
  teal: ['bg-n-teal-bg-tertiary-translucent-a text-n-teal-icon-primary', 'bg-n-teal-icon-accent-primary'],
};

/**
 * Option pill: 20px tall, 0 6px padding, 4px radius, 14/20 text, truncating. With a remove button:
 * left padding only, a 20×20 button (24×24 on touch screens). `sm` = 18px, 13/18 for dense cards.
 */
export const tagVariants = tv({
  base: 'inline-flex min-w-0 max-w-full shrink-0 items-center overflow-hidden whitespace-nowrap rounded-n-sm',
  variants: {
    size: { sm: 'h-[18px] px-1.5 text-[13px] leading-[18px]', md: 'h-5 px-1.5 text-[14px] leading-5' },
    removable: { true: 'pr-0' },
  },
  defaultVariants: { size: 'md' },
});

export interface TagProps extends HTMLAttributes<HTMLSpanElement>, Omit<VariantProps<typeof tagVariants>, 'removable'> {
  /** One of the ten palette colors, or `default` (neutral grey). */
  color?: MotionColor;
  /** Shows the × remove button (multi-select editor) and is called when it is pressed. */
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Accessible name of the remove button. Defaults to "Remove <text>" for text tags. */
  removeLabel?: string;
}

/**
 * Colored label for user-defined categories: select options, labels, tags on cards. Removable in
 * editors. Use Badge for system statuses and counts.
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag({ color = 'default', size, onRemove, removeLabel, className, children, ...props }, ref) {
  const name = removeLabel ?? (typeof children === 'string' || typeof children === 'number' ? `Remove ${children}` : 'Remove');
  return (
    <span ref={ref} className={cn(tagVariants({ size, removable: !!onRemove }), TAG_COLOR[color], className)} {...props}>
      <span className="min-w-0 truncate">{children}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={name}
          onClick={onRemove}
          className="mx-0.5 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary outline-none transition-[background] duration-100 ease-in-out hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow pointer-coarse:size-6"
        >
          <Icon name="xMark" size={16} />
        </button>
      )}
    </span>
  );
});

/**
 * Status property pill: dot + label (db-table/db-board "Not started" gray, "In progress" blue, "Done" green).
 * Measured md: 20px, padding 0 9px 0 7px, radius 10, 14/20; dot 8x8 round with 5px right margin.
 * sm (db-list): 18px, padding 0 11px 0 9px, radius 9, 13/18.
 */
export const statusPillVariants = tv({
  base: 'inline-flex min-w-0 max-w-full shrink-0 items-center overflow-hidden whitespace-nowrap',
  variants: {
    size: {
      sm: 'h-[18px] rounded-[9px] pl-[9px] pr-[11px] text-[13px] leading-[18px]', // radius 9/10: pill = half height, no token
      md: 'h-5 rounded-n-xl pl-[7px] pr-[9px] text-[14px] leading-5',
    },
  },
  defaultVariants: { size: 'md' },
});

/** Default status groups. */
export const statusColors = { 'not-started': 'gray', 'in-progress': 'blue', done: 'green' } as const satisfies Record<string, MotionColor>;

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusPillVariants> {
  /** A color, or one of the default groups: not-started / in-progress / done. */
  color?: MotionColor | keyof typeof statusColors;
}

export const StatusPill = forwardRef<HTMLSpanElement, StatusPillProps>(function StatusPill({ color = 'gray', size, className, children, ...props }, ref) {
  const c: MotionColor = color in statusColors ? statusColors[color as keyof typeof statusColors] : (color as MotionColor);
  const [pill, dot] = STATUS_COLOR[c];
  return (
    <span ref={ref} className={cn(statusPillVariants({ size }), pill, className)} {...props}>
      <span className={cn('mr-[5px] size-2 shrink-0 rounded-full', dot)} />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
});
