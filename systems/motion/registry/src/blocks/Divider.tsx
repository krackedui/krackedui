import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

/** Divider. Measured: 13px tall row, padding-inline 8, 1px line in border-primary-translucent-a. */
export const DividerBlock = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DividerBlock({ className, ...props }, ref) {
  return (
    <div ref={ref} className={cn('w-full', className)} contentEditable={false} {...props}>
      <div className="flex h-[13px] w-full items-center justify-center px-2">
        <div role="separator" className="h-px w-full bg-n-border-primary-translucent-a" />
      </div>
    </div>
  );
});
