import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { BlockColor } from './types';
import { blockColorClass, leafBase, renderLeaf, type TextContentProps } from './parts';

export interface QuoteProps extends TextContentProps, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  color?: BlockColor;
  /** Large quote style (1.2em), the "Quote size: large" option. */
  large?: boolean;
  children?: ReactNode;
}

/**
 * Quote block. Measured: block padding 8, 3px solid currentColor start border,
 * padding-inline 14 + leaf padding-inline 8 (text starts 33px in), 16/24.
 */
export const Quote = forwardRef<HTMLDivElement, QuoteProps>(function Quote({ text, renderLeaf: rl, color, large, children, className, ...props }, ref) {
  return (
    <div ref={ref} className={cn('w-full p-2', className)} {...props}>
      <blockquote className={cn('m-0 flex rounded-n-md', large ? 'text-[1.2em]' : 'text-[1em]', blockColorClass(color))}>
        <div className="w-full border-s-[3px] border-solid border-current px-3.5">
          {renderLeaf({ text, renderLeaf: rl }, { className: cn(leafBase, 'px-2'), placeholder: 'Empty quote' })}
          {children}
        </div>
      </blockquote>
    </div>
  );
});
