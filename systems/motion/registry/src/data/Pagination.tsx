import { forwardRef, type HTMLAttributes } from 'react';
import { tv } from '../lib/tv';
import { Icon } from '../icons/Icon';

/**
 * Page navigation: previous / next ghost buttons around 28px page buttons, with ellipses for long ranges.
 * The current page wears the selected wash and `aria-current="page"`. Under 640px it collapses to
 * "Page 3 of 10" between the arrows.
 */
export const paginationVariants = tv({
  slots: {
    root: 'flex w-full min-w-0 items-center justify-center text-n-ui',
    list: 'flex items-center gap-0.5',
    pages: 'hidden items-center gap-0.5 sm:flex',
    compact: 'px-2 text-n-text-secondary tabular-nums whitespace-nowrap sm:hidden',
    item: [
      'inline-flex h-7 min-w-7 cursor-pointer select-none items-center justify-center gap-1 rounded-n-md px-1.5',
      'text-n-text-primary tabular-nums transition-[background] duration-[20ms] ease-in',
      'hover:bg-n-button-hover-bg-a active:bg-n-button-pressed-bg-a',
      'disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent',
      'aria-[current=page]:bg-n-palette-ui-blue-200-a aria-[current=page]:font-medium aria-[current=page]:text-n-blue-text-primary',
      'pointer-coarse:h-9 pointer-coarse:min-w-9',
    ],
    ellipsis: 'inline-flex h-7 min-w-7 items-center justify-center text-n-text-secondary',
  },
});

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Current page, 1-based. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Pages shown on each side of the current page before an ellipsis. Defaults to 1. */
  siblingCount?: number;
  /** Accessible name of the navigation landmark. Defaults to "Pagination". */
  label?: string;
}

type Slot = number | 'start-ellipsis' | 'end-ellipsis';

/** Page numbers to show: first, last, the current page ± siblings, and ellipses for the gaps. */
export function paginationRange(page: number, pageCount: number, siblingCount = 1): Slot[] {
  const total = Math.max(1, pageCount);
  const current = Math.min(Math.max(1, page), total);
  // first + last + current + 2·siblings + 2 ellipses
  const slots = siblingCount * 2 + 5;
  if (total <= slots) return Array.from({ length: total }, (_, i) => i + 1);
  const left = Math.max(current - siblingCount, 1);
  const right = Math.min(current + siblingCount, total);
  const showLeft = left > 3;
  const showRight = right < total - 2;
  const span = siblingCount * 2 + 3;
  if (!showLeft) return [...Array.from({ length: span }, (_, i) => i + 1), 'end-ellipsis', total];
  if (!showRight) return [1, 'start-ellipsis', ...Array.from({ length: span }, (_, i) => total - span + 1 + i)];
  return [1, 'start-ellipsis', ...Array.from({ length: right - left + 1 }, (_, i) => left + i), 'end-ellipsis', total];
}

/** Page navigation for lists and tables. Controlled: keep `page` in state and update it in `onPageChange`. */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { page, pageCount, onPageChange, siblingCount = 1, label = 'Pagination', className, ...props },
  ref,
) {
  const s = paginationVariants();
  const total = Math.max(1, pageCount);
  const current = Math.min(Math.max(1, page), total);
  const go = (p: number) => { if (p !== current && p >= 1 && p <= total) onPageChange(p); };
  return (
    <nav ref={ref} aria-label={label} className={s.root({ className })} {...props}>
      <ul className={s.list()}>
        <li>
          <button type="button" className={s.item()} aria-label="Previous page" disabled={current <= 1} onClick={() => go(current - 1)}>
            <Icon name="chevronLeft" size={16} />
            <span className="hidden pr-1 md:inline" aria-hidden>Previous</span>
          </button>
        </li>
        <li className={s.compact()} aria-hidden>
          Page {current} of {total}
        </li>
        <li className={s.pages()}>
          <ul className={s.list()}>
            {paginationRange(current, total, siblingCount).map((slot) =>
              typeof slot === 'number' ? (
                <li key={slot}>
                  <button
                    type="button"
                    className={s.item()}
                    aria-label={`Page ${slot}`}
                    aria-current={slot === current ? 'page' : undefined}
                    onClick={() => go(slot)}
                  >
                    {slot}
                  </button>
                </li>
              ) : (
                <li key={slot} className={s.ellipsis()} aria-hidden>
                  …
                </li>
              ),
            )}
          </ul>
        </li>
        <li>
          <button type="button" className={s.item()} aria-label="Next page" disabled={current >= total} onClick={() => go(current + 1)}>
            <span className="hidden pl-1 md:inline" aria-hidden>Next</span>
            <Icon name="chevronRight" size={16} />
          </button>
        </li>
      </ul>
      <span className="sr-only" aria-live="polite">{`Page ${current} of ${total}`}</span>
    </nav>
  );
});
