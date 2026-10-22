import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

/**
 * Keyboard key or shortcut chip, e.g. "⌘K" next to Search. 18px tall, 2px 4px padding, 4px radius,
 * 11/14.3 medium text in the secondary text color on a translucent grey fill. Use it to show a shortcut
 * next to the control it triggers; use Shortcut for plain shortcut text at the end of menu rows.
 */
export const Kbd = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Kbd({ className, ...props }, ref) {
  return (
    <kbd
      ref={ref}
      className={cn(
        'inline-flex h-[18px] shrink-0 items-center whitespace-nowrap rounded-n-sm px-1 py-0.5 font-sans text-[11px] font-medium leading-[14.3px]',
        'bg-n-bg-tertiary-translucent-a text-n-text-secondary dark:bg-n-border-primary-translucent-a',
        className,
      )}
      {...props}
    />
  );
});

/** Plain shortcut text at the end of menu rows and in tooltips, e.g. "⌘⌃L": 12/16.8, tertiary text. */
export const Shortcut = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function Shortcut({ className, ...props }, ref) {
  return <span ref={ref} className={cn('whitespace-nowrap text-[12px] leading-[16.8px] text-n-text-tertiary', className)} {...props} />;
});
