import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes } from 'react';
import { Popover as P } from 'radix-ui';
import { cn } from '../lib/cn';
import { tv, type VariantProps } from '../lib/tv';

/**
 * Popover surface: the floating card behind pickers (emoji, date, color), the share panel and
 * property editors. Radius 10 (`radius="lg"` = 12 for larger panels), popover background,
 * outline-lg shadow, overflow hidden.
 */
export const popoverVariants = tv({
  base: 'relative max-w-[calc(100vw-16px)] overflow-hidden bg-n-popover-bg shadow-n-shadow-outline-lg outline-none',
  variants: {
    radius: { md: 'rounded-n-xl', lg: 'rounded-n-2xl' },
  },
  defaultVariants: { radius: 'md' },
});

export interface PopoverSurfaceProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof popoverVariants> {
  /** Fixed width in px (never wider than the viewport minus 16px). */
  width?: number;
}

/** Static popover card (no positioning or behavior): for custom floating UI and static renders. */
export const PopoverSurface = forwardRef<HTMLDivElement, PopoverSurfaceProps>(function PopoverSurface({ className, radius, width, style, ...props }, ref) {
  return <div ref={ref} className={popoverVariants({ radius, className })} style={{ width, ...style }} {...props} />;
});

export type PopoverContentProps = ComponentPropsWithoutRef<typeof P.Content> & VariantProps<typeof popoverVariants> & {
  /** Fixed width in px (never wider than the viewport minus 16px). */
  width?: number;
};
const Content = forwardRef<ElementRef<typeof P.Content>, PopoverContentProps>(function Content(
  { className, radius, width, style, sideOffset = 4, align = 'start', collisionPadding = 8, ...props }, ref,
) {
  return (
    <P.Portal>
      <P.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        collisionPadding={collisionPadding}
        className={cn('motion-floating motion-portal', popoverVariants({ radius }), 'z-50 max-h-[var(--radix-popover-content-available-height)] overflow-y-auto', className)}
        style={{ width, ...style }}
        {...props}
      />
    </P.Portal>
  );
});

/**
 * Floating panel anchored to a trigger (WAI-ARIA non-modal dialog): pickers, small forms, details.
 * Focus moves inside on open, Escape or an outside click closes it, focus returns to the trigger.
 * Use Menu for a list of actions and Dialog when the task needs the user's full attention.
 *
 * <Popover.Root><Popover.Trigger asChild><Button>Rename</Button></Popover.Trigger>
 *   <Popover.Content width={248}>…<Popover.Close asChild><Button>Done</Button></Popover.Close></Popover.Content></Popover.Root>
 */
export const Popover = {
  Root: P.Root,
  Trigger: P.Trigger,
  Anchor: P.Anchor,
  Close: P.Close,
  Content,
};
