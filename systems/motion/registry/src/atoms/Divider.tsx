import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

/**
 * Hairline separator between groups of content, horizontal or vertical (`role="separator"`).
 * `block` adds the spacing of a divider block in a document (13px row, 8px side padding).
 */
export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  block?: boolean;
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider({ orientation = 'horizontal', block, className, ...props }, ref) {
  const line = (
    <div
      ref={block ? undefined : ref}
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-n-border-primary-translucent-a',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px self-stretch',
        !block && className,
      )}
      {...(block ? {} : props)}
    />
  );
  if (!block) return line;
  return (
    <div ref={ref} className={cn('flex h-[13px] w-full items-center justify-center px-2', className)} {...props}>
      {line}
    </div>
  );
});
