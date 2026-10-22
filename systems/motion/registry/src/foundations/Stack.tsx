import { forwardRef, type HTMLAttributes } from 'react';
import { Slot } from 'radix-ui';
import { cn } from '../lib/cn';
import { DIRECTION, GAP, responsiveClasses, type Responsive, type Space, type StackDirection } from './responsive';

const ALIGN = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch', baseline: 'items-baseline' } as const;
const JUSTIFY = { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between' } as const;

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** `column` (default) or `row`; per breakpoint with `{ base: 'column', md: 'row' }`. */
  direction?: Responsive<StackDirection>;
  /** Space between children on the 4px scale (`2` = 8px); per breakpoint too. */
  gap?: Responsive<Space>;
  /** Cross-axis alignment. */
  align?: keyof typeof ALIGN;
  /** Main-axis distribution. */
  justify?: keyof typeof JUSTIFY;
  /** Let children wrap onto new lines. */
  wrap?: boolean;
  /** Put the layout on the child element instead of a `<div>`. */
  asChild?: boolean;
}

/**
 * Flex row or column with gaps from the spacing scale. Use it to lay out groups of controls and content
 * blocks; direction and gap can change per breakpoint (stack on mobile, row from `md`).
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { direction = 'column', gap, align, justify, wrap, asChild, className, ...props },
  ref,
) {
  const Comp = asChild ? Slot.Root : 'div';
  return (
    <Comp
      ref={ref}
      className={cn(
        'flex min-w-0',
        responsiveClasses(direction, DIRECTION),
        responsiveClasses(gap, GAP),
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        wrap && 'flex-wrap',
        className,
      )}
      {...props}
    />
  );
});
