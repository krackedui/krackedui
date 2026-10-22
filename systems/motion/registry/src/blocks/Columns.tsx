import { Children, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface ColumnsProps extends HTMLAttributes<HTMLDivElement> {
  /** One child per column (2–5). */
  children: ReactNode;
  /** Width shares per column (sum 1). Defaults to equal widths. */
  ratios?: number[];
}

/**
 * Column list (2–5 columns; not in the sandbox captures, inferred defaults): columns are
 * `(100% − 46px × (n−1)) × ratio` wide with 46px gutters, each column padded 12px top/bottom.
 */
export const Columns = forwardRef<HTMLDivElement, ColumnsProps>(function Columns({ children, ratios, className, ...props }, ref) {
  const cols = Children.toArray(children);
  const n = cols.length || 1;
  return (
    <div ref={ref} className={cn('flex w-full', className)} {...props}>
      {cols.flatMap((c, i) => [
        i > 0 ? <div key={`g${i}`} className="w-[46px] shrink-0" aria-hidden /> : null,
        <div key={i} className="min-w-0 shrink-0 grow-0 py-3" style={{ width: `calc((100% - ${46 * (n - 1)}px) * ${ratios?.[i] ?? 1 / n})` }}>
          {c}
        </div>,
      ])}
    </div>
  );
});
