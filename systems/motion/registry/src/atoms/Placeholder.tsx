import { forwardRef, type HTMLAttributes } from 'react';
import { tv, type VariantProps } from '../lib/tv';

/**
 * Empty-state hint text, as drawn via `placeholder` on editable blocks.
 * - `block`: "Type '/' for commands", "To-do", "Toggle": text-tertiary at the block's own size
 * - `title`: empty page title "New page": page-title-placeholder-text-color
 * - `ui`:    "Empty" values in properties/cells: 14px text-tertiary
 */
export const placeholderVariants = tv({
  base: 'pointer-events-none select-none',
  variants: {
    variant: {
      block: 'text-n-text-tertiary',
      title: 'text-n-text-tertiary', // tertiary text: placeholder text still needs WCAG AA contrast
      ui: 'text-[14px] leading-5 text-n-text-tertiary',
    },
  },
  defaultVariants: { variant: 'block' },
});

export interface PlaceholderProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof placeholderVariants> {}

export const Placeholder = forwardRef<HTMLSpanElement, PlaceholderProps>(function Placeholder({ variant, className, ...props }, ref) {
  return <span ref={ref} className={placeholderVariants({ variant, className })} {...props} />;
});
