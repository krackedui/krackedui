import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';
import { Icon } from '../icons/Icon';

/**
 * Table primitives in the look of Motion's database table (database/TableView): 36px header in
 * text-secondary over an inset hairline, 36px body rows with hairline row and column rules, a faint
 * row hover and the blue selection wash. Root wraps the `<table>` in its own horizontal scroller, so
 * wide tables never widen the page.
 */
export const tableVariants = tv({
  slots: {
    container: 'relative w-full max-w-full overflow-x-auto overscroll-x-contain',
    table: 'w-full border-separate border-spacing-0 text-left text-n-ui text-n-text-primary tabular-nums',
    head: [
      'h-9 whitespace-nowrap bg-n-bg-primary px-2 align-middle font-normal text-n-text-secondary',
      'shadow-[inset_0_-1px_0_var(--n-border-secondary-translucent-a)]',
    ],
    cell: 'whitespace-nowrap border-b border-n-border-secondary-translucent-a px-2 align-middle',
  },
  variants: {
    density: {
      compact: { cell: 'h-9 py-1.5', head: 'h-9' },
      comfortable: { cell: 'h-11 px-3 py-2.5', head: 'h-10 px-3' },
    },
  },
  defaultVariants: { density: 'compact' },
});

type Density = 'compact' | 'comfortable';
type Align = 'start' | 'center' | 'end';

const TableContext = createContext<{ density: Density }>({ density: 'compact' });

const alignClass: Record<Align, string> = { start: 'text-left', center: 'text-center', end: 'text-right' };
const justifyClass: Record<Align, string> = { start: 'justify-start', center: 'justify-center', end: 'justify-end' };

/** True while the element's content is wider than its box (so it needs to be reachable by keyboard). */
function useHorizontalOverflow<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [overflowing, setOverflowing] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, []);
  return [ref, overflowing] as const;
}

export interface TableRootProps extends HTMLAttributes<HTMLTableElement> {
  /** Row height and cell padding. `compact` is the 36px database row. */
  density?: Density;
  /** Classes for the scroll container around the `<table>` (e.g. a `max-h-*` to enable the sticky header). */
  containerClassName?: string;
  /** Inline styles for the scroll container (e.g. `{ maxHeight: 320 }`). */
  containerStyle?: CSSProperties;
}

/**
 * The table and its horizontal scroll container. When the table is wider than the container, the container
 * becomes a focusable, labelled region so keyboard users can scroll it.
 */
const Root = forwardRef<HTMLTableElement, TableRootProps>(function TableRoot(
  { density = 'compact', containerClassName, containerStyle, className, children, ...props },
  ref,
) {
  const [containerRef, overflowing] = useHorizontalOverflow<HTMLDivElement>();
  const s = tableVariants({ density });
  const label = props['aria-label'] ?? 'Table';
  return (
    <TableContext.Provider value={{ density }}>
      <div
        ref={containerRef}
        className={s.container({ className: containerClassName })}
        style={containerStyle}
        {...(overflowing ? { role: 'region', 'aria-label': `${label} (scrollable)`, tabIndex: 0 } : {})}
      >
        <table ref={ref} className={s.table({ className })} {...props}>
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
});

export type TableSectionProps = HTMLAttributes<HTMLTableSectionElement>;

/** `<thead>`. Header cells stick to the top of the scroll container. */
const Header = forwardRef<HTMLTableSectionElement, TableSectionProps>(function TableHeader({ className, ...props }, ref) {
  return <thead ref={ref} className={cn('[&_th]:sticky [&_th]:top-0 [&_th]:z-[1]', className)} {...props} />;
});

/** `<tbody>`. */
const Body = forwardRef<HTMLTableSectionElement, TableSectionProps>(function TableBody({ className, ...props }, ref) {
  return <tbody ref={ref} className={cn('[&>tr:last-child>td]:border-b-0', className)} {...props} />;
});

/** `<tfoot>`: totals in medium weight over a hairline. */
const Footer = forwardRef<HTMLTableSectionElement, TableSectionProps>(function TableFooter({ className, ...props }, ref) {
  return (
    <tfoot
      ref={ref}
      className={cn('font-medium [&_td]:border-b-0 [&_td]:shadow-[inset_0_1px_0_var(--n-border-secondary-translucent-a)]', className)}
      {...props}
    />
  );
});

const interactiveSelector = 'a, button, input, select, textarea, label, summary, [role="button"], [role="checkbox"], [role="link"], [tabindex]:not([tabindex="-1"])';

/** Whether an event started on an interactive element inside the row (which handles it itself). */
function fromNestedControl(event: { target: EventTarget; currentTarget: EventTarget }) {
  const target = event.target as Element;
  const hit = target.closest?.(interactiveSelector);
  return !!hit && hit !== event.currentTarget;
}

export interface TableRowProps extends Omit<HTMLAttributes<HTMLTableRowElement>, 'onClick'> {
  /** Shows the selection wash. Pair it with a checkbox in the row so the state is announced. */
  selected?: boolean;
  /** Makes the whole row clickable. Clicks on links, buttons and inputs inside the row are ignored. */
  onClick?: (event: MouseEvent<HTMLTableRowElement> | KeyboardEvent<HTMLTableRowElement>) => void;
  /**
   * With `onClick`, the row is a tab stop activated by Enter or Space (default). Set `false` when the row
   * already holds a button that does the same thing (DataTable does this), to avoid a second tab stop.
   */
  focusable?: boolean;
}

/** `<tr>` with hover, selection and optional whole-row activation. */
const Row = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { selected, onClick, focusable = true, onKeyDown, className, ...props },
  ref,
) {
  const clickable = !!onClick;
  return (
    <tr
      ref={ref}
      data-state={selected ? 'selected' : undefined}
      tabIndex={clickable && focusable ? 0 : undefined}
      onClick={onClick ? (e) => { if (!fromNestedControl(e)) onClick(e); } : undefined}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (!onClick || !focusable || e.defaultPrevented || e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      }}
      className={cn(
        'hover:bg-n-table-row-hover-bg-a data-[state=selected]:bg-n-palette-ui-blue-200-a',
        clickable && 'cursor-pointer',
        className,
      )}
      {...props}
    />
  );
});

export interface TableHeadProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: Align;
  /** Current sort of this column. Pass `false` for a sortable column that is not sorted. */
  sort?: 'asc' | 'desc' | false;
  /** Makes the header a sort button (announced through `aria-sort` on the header cell). */
  onSort?: () => void;
}

const sortValue = { asc: 'ascending', desc: 'descending' } as const;

/** `<th scope="col">`. With `onSort`, the label becomes a button and the cell carries `aria-sort`. */
const Head = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { align = 'start', sort, onSort, className, children, ...props },
  ref,
) {
  const { density } = useContext(TableContext);
  const s = tableVariants({ density });
  const sortable = !!onSort;
  return (
    <th
      ref={ref}
      scope="col"
      aria-sort={sortable ? (sort ? sortValue[sort] : 'none') : undefined}
      className={s.head({ className: cn(alignClass[align], sortable && 'p-0', className) })}
      {...props}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            'group/sort flex h-full min-h-9 w-full cursor-pointer items-center gap-1 whitespace-nowrap px-2 text-inherit',
            'hover:bg-n-button-hover-bg-a hover:text-n-text-primary',
            density === 'comfortable' && 'px-3',
            justifyClass[align],
          )}
        >
          <span>{children}</span>
          <Icon
            name={sort === 'asc' ? 'arrowUp' : sort === 'desc' ? 'arrowDown' : 'chevronsUpDown'}
            size={14}
            className={cn('text-n-icon-secondary', !sort && 'opacity-0 group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100 pointer-coarse:opacity-100')}
          />
        </button>
      ) : children}
    </th>
  );
});

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: Align;
}

/** `<td>`. Use `align="end"` for numbers. */
const Cell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell({ align = 'start', className, ...props }, ref) {
  const { density } = useContext(TableContext);
  return <td ref={ref} className={tableVariants({ density }).cell({ className: cn(alignClass[align], className) })} {...props} />;
});

/**
 * Table primitives for static or hand-built tables (`Table.Root`, `Header`, `Body`, `Footer`, `Row`, `Head`,
 * `Cell`). For sorting, selection, loading and empty states from data, use `DataTable`.
 */
export const Table = { Root, Header, Body, Footer, Row, Head, Cell };
