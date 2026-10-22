import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';

/**
 * The ⋮⋮ block handle shown on hover left of a block (block-hover, toggle-open).
 * Measured: 18x24 button, radius 4, `dragHandle` 20px glyph in icon-tertiary,
 * hover button-hover-bg-a (20ms ease-in). aria-label "Drag to move, click to open menu".
 * `size="sm"` (select-picker option rows) is a 16x20 hit area.
 */
export interface DragHandleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md';
}

export const DragHandle = forwardRef<HTMLButtonElement, DragHandleProps>(function DragHandle({ size = 'md', className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label="Drag to move, click to open menu"
      className={cn(
        'inline-flex shrink-0 cursor-grab select-none items-center justify-center rounded-n-sm text-n-icon-tertiary active:cursor-grabbing outline-none focus-visible:shadow-n-focus-shadow pointer-coarse:min-h-6 pointer-coarse:min-w-6',
        'transition-[background] duration-[20ms] ease-in hover:bg-n-button-hover-bg-a',
        size === 'sm' ? 'h-5 w-4' : 'h-6 w-[18px]',
        className,
      )}
      {...props}
    >
      <Icon name={size === 'sm' ? 'dragHandleFillSmall' : 'dragHandle'} size={size === 'sm' ? 16 : 20} />
    </button>
  );
});
