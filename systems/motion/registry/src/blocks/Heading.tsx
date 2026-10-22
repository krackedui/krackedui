import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';
import type { BlockColor } from './types';
import { blockColorClass, EmptyToggleHint, leafBase, renderLeaf, ToggleButton, type TextContentProps } from './parts';

/**
 * Heading sizes, measured in page-content (font-size relative to the 16px page):
 * H1 1.875em/1.3 (30/39) pt 30 · H2 1.5em/1.3 (24/31.2) pt 26 · H3 1.25em/1.3 (20/26) pt 22, all weight 600,
 * pb 6, leaf padding 2. H4 is not in the captures: 1.125em/1.3, pt 18 (extrapolated).
 */
export const headingVariants = tv({
  slots: {
    root: 'w-full',
    pad: 'w-full px-1.5 pb-1.5',
    leaf: 'm-0 p-0.5 font-sans font-semibold',
  },
  variants: {
    level: {
      1: { pad: 'pt-[30px]', leaf: 'text-[1.875em]/[1.3]' },
      2: { pad: 'pt-[26px]', leaf: 'text-[1.5em]/[1.3]' },
      3: { pad: 'pt-[22px]', leaf: 'text-[1.25em]/[1.3]' },
      4: { pad: 'pt-[18px]', leaf: 'text-[1.125em]/[1.3]' },
    },
  },
  defaultVariants: { level: 1 },
});

const EM = { 1: 1.875, 2: 1.5, 3: 1.25, 4: 1.125 } as const;

export interface HeadingProps extends TextContentProps, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  level?: 1 | 2 | 3 | 4;
  color?: BlockColor;
  /** Toggle heading: shows a disclosure triangle and hides `children` when closed. */
  toggleable?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Toggle heading content. */
  children?: ReactNode;
  /** Shown when an open toggle heading has no children. */
  onEmptyClick?: () => void;
}

/** Heading 1/2/3 (+4) block, optionally a toggle heading. */
export const Heading = forwardRef<HTMLDivElement, HeadingProps>(function Heading(
  { level = 1, text, renderLeaf: rl, color, toggleable, open, onOpenChange, children, onEmptyClick, className, ...props }, ref,
) {
  const s = headingVariants({ level });
  // Heading semantics: the page title is the h1, so heading_1 blocks are level 2 … heading_4 level 5.
  const leaf = (
    <div role="heading" aria-level={level + 1} className="w-full min-w-0">
      {renderLeaf({ text, renderLeaf: rl }, { className: cn(leafBase, s.leaf()), placeholder: `Heading ${level}` })}
    </div>
  );
  return (
    <div ref={ref} className={cn(s.root(), className)} {...props}>
      <div className="flex w-full">
        <div className={s.pad()}>
          <div className={cn('flex rounded-n-md', blockColorClass(color))}>
            {toggleable ? (
              <div className="flex w-full items-start">
                {/* caret at 50% opacity while the toggle heading is empty (page-scroll-3) */}
                {/* box: 24 wide, height = one heading line (1.3 × size), 2px top/start margin */}
                <div className="ms-0.5 mt-0.5 flex w-6 shrink-0 items-center justify-center" style={{ height: `${EM[level] * 1.3}em` }} contentEditable={false}>
                  <ToggleButton open={!!open} onOpenChange={onOpenChange} contentEditable={false} className={cn(!children && '[&_svg]:opacity-50')} />
                </div>
                <div className="min-w-px flex-1">{leaf}</div>
              </div>
            ) : leaf}
          </div>
        </div>
      </div>
      {toggleable && open && (
        <div className="flex flex-col ps-[26px]">{children ?? <EmptyToggleHint onClick={onEmptyClick} />}</div>
      )}
    </div>
  );
});
