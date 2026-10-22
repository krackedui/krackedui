import { forwardRef, type HTMLAttributes } from 'react';
import { Slot } from 'radix-ui';
import { cn } from '../lib/cn';
import { COLUMNS, GAP, responsiveClasses, type GridColumns, type Responsive, type Space } from './responsive';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Equal columns: 1–6 or 12; per breakpoint with `{ base: 1, sm: 2, lg: 4 }`. */
  columns?: Responsive<GridColumns>;
  /** Space between cells on the 4px scale (`4` = 16px); per breakpoint too. */
  gap?: Responsive<Space>;
  /** Put the grid on the child element instead of a `<div>`. */
  asChild?: boolean;
}

/**
 * Responsive grid of equal columns with gaps from the spacing scale. Use it for cards, stats and
 * galleries that reflow from one column on phones to several on wide screens.
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid({ columns = 1, gap, asChild, className, ...props }, ref) {
  const Comp = asChild ? Slot.Root : 'div';
  return (
    <Comp
      ref={ref}
      className={cn('grid min-w-0 [&>*]:min-w-0', responsiveClasses(columns, COLUMNS), responsiveClasses(gap, GAP), className)}
      {...props}
    />
  );
});
