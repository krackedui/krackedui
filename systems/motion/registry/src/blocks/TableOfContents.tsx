import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface TocItem {
  id: string;
  /** 1–4 (H1 → no indent, each level +24px). */
  level: number;
  text: string;
}
export interface TableOfContentsProps extends HTMLAttributes<HTMLDivElement> {
  items: TocItem[];
  /** Click handler; default scrolls to `[data-block-id=<id>]`. */
  onItemClick?: (id: string) => void;
}

/**
 * Table of contents. Measured (page-scroll-3): block padding 8; rows 14/1.3 gray-text-secondary,
 * padding 6 2, indent 24 per level, 1px underline in border-primary-translucent-a, hover bg-interactive.
 */
export const TableOfContents = forwardRef<HTMLDivElement, TableOfContentsProps>(function TableOfContents({ items, onItemClick, className, ...props }, ref) {
  const go = (id: string) => {
    if (onItemClick) return onItemClick(id);
    document.querySelector(`[data-block-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div ref={ref} className={cn('w-full p-2', className)} contentEditable={false} {...props}>
      <div className="relative">
        {items.length === 0 && <div className="px-0.5 py-1.5 text-[14px] leading-[1.3] text-n-text-tertiary">Add headings to create a table of contents.</div>}
        {items.map((it) => (
          <div key={it.id} className="text-n-text-secondary">
            <a
              href={`#${it.id}`}
              onClick={(e) => { e.preventDefault(); go(it.id); }}
              className="block cursor-pointer select-none rounded-n-sm text-inherit no-underline transition-[background] duration-[20ms] ease-in hover:bg-n-bg-interactive-translucent-a"
            >
              <div className="flex items-center px-0.5 py-1.5 text-[14px] leading-[1.3]" style={{ marginInlineStart: (Math.max(1, it.level) - 1) * 24 }}>
                <div className="truncate bg-[linear-gradient(to_right,var(--n-border-primary-translucent-a)_0%,var(--n-border-primary-translucent-a)_100%)] bg-[length:100%_1px] bg-[position:0_100%] bg-repeat-x">
                  {it.text}
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
});
