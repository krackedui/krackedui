import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

const PX = { sm: 12, md: 16, lg: 20 } as const;

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** `sm` 12px, `md` 16px (default), `lg` 20px, or any size in px. */
  size?: keyof typeof PX | number;
  /** Text announced to screen readers (default "Loading"). */
  label?: string;
}

/**
 * Loading indicator: a thin ring with a spinning quarter arc, in the tertiary icon color. Use it for
 * waits of a second or more inside a region or control; prefer Skeleton for loading page content.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', label = 'Loading', className, ...props },
  ref,
) {
  const px = typeof size === 'number' ? size : PX[size];
  return (
    <span ref={ref} role="status" className={cn('inline-flex shrink-0 text-n-icon-tertiary', className)} {...props}>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 16 16"
        width={px}
        height={px}
        fill="none"
        className="block animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite]"
      >
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
        <path d="M8 1.5a6.5 6.5 0 0 1 6.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
});
