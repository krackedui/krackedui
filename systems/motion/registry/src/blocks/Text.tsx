import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { BlockColor } from './types';
import { blockColorClass, leafBase, renderLeaf, type TextContentProps } from './parts';

export interface TextBlockProps extends TextContentProps, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  color?: BlockColor;
  /** Nested (indented) child blocks. */
  children?: ReactNode;
  placeholder?: string;
}

/**
 * Text (paragraph) block. Measured (page-content): 16/24, block padding 6px all sides,
 * leaf padding 2px; children indented 24px.
 */
export const TextBlock = forwardRef<HTMLDivElement, TextBlockProps>(function TextBlock(
  { text, renderLeaf: rl, color, children, placeholder = ' ', className, ...props }, ref,
) {
  return (
    <div ref={ref} className={cn('w-full', className)} {...props}>
      <div className="w-full p-1.5">
        <div className={cn('flex rounded-n-md', blockColorClass(color))}>
          <div className="w-full">{renderLeaf({ text, renderLeaf: rl }, { className: cn(leafBase, 'p-0.5'), placeholder })}</div>
        </div>
      </div>
      {children && <div className="flex flex-col ps-6">{children}</div>}
    </div>
  );
});
