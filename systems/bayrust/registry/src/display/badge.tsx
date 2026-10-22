import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn, variants } from '../lib/cn';
import { Icon } from '../foundations/icon';

export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type Color = 'gray' | 'brown' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'purple' | 'pink' | 'red';

export const badgeVariants = variants('bay-badge', {
  tone: {
    neutral: 'bay-badge--neutral', accent: 'bay-badge--accent', success: 'bay-badge--success',
    warning: 'bay-badge--warning', danger: 'bay-badge--danger', info: 'bay-badge--info',
  },
  variant: { soft: 'bay-badge--soft', solid: 'bay-badge--solid', outline: 'bay-badge--outline' },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  tone?: Tone;
  variant?: 'soft' | 'solid' | 'outline';
}

/** A short status or count. `tone` carries the meaning; `variant` how loudly it says it. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { children, tone = 'neutral', variant = 'soft', className, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cn(badgeVariants({ tone, variant }), className)} {...rest}>
      {children}
    </span>
  );
});

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  color?: Color;
  size?: 'sm' | 'md';
  /** Shows a remove button. Without it the tag is just a label. */
  onRemove?: () => void;
}

/** A categorical label. `color` is for telling categories apart, not for status — that is `Badge`. */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { children, color = 'gray', size = 'md', onRemove, className, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cn('bay-tag', `bay-tag--${size}`, className)} data-color={color} {...rest}>
      <span className="bay-tag__label">{children}</span>
      {onRemove && (
        <button type="button" className="bay-tag__remove" onClick={onRemove} aria-label="Remove">
          <Icon name="close" size={10} />
        </button>
      )}
    </span>
  );
});

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/** A keyboard key or shortcut, as it is printed on the key. */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd({ children, className, ...rest }, ref) {
  return (
    <kbd ref={ref} className={cn('bay-kbd', className)} {...rest}>
      {children}
    </kbd>
  );
});
