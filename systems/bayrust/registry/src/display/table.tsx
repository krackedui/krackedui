'use client';

import { forwardRef, type HTMLAttributes, type ReactNode, type TdHTMLAttributes, type ThHTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../foundations/icon';

type Align = 'start' | 'center' | 'end';

export interface TableRootProps extends HTMLAttributes<HTMLTableElement> {
  children?: ReactNode;
  density?: 'compact' | 'comfortable';
}

/**
 * A table. The root scrolls horizontally rather than letting the page overflow, which is what keeps
 * a wide table usable at 320 px (check 11).
 */
export const TableRoot = forwardRef<HTMLTableElement, TableRootProps>(function TableRoot(
  { children, density = 'comfortable', className, ...rest },
  ref,
) {
  return (
    <div className="bay-table__scroll">
      <table ref={ref} className={cn('bay-table', className)} data-density={density} {...rest}>
        {children}
      </table>
    </div>
  );
});

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableHeader({ children, className, ...rest }, ref) {
    return (
      <thead ref={ref} className={cn('bay-table__header', className)} {...rest}>
        {children}
      </thead>
    );
  },
);

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody({ children, className, ...rest }, ref) {
    return (
      <tbody ref={ref} className={cn('bay-table__body', className)} {...rest}>
        {children}
      </tbody>
    );
  },
);

export const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableFooter({ children, className, ...rest }, ref) {
    return (
      <tfoot ref={ref} className={cn('bay-table__footer', className)} {...rest}>
        {children}
      </tfoot>
    );
  },
);

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

/** A row. Given `onClick` it becomes a target: focusable, and activated by Enter or Space. */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { children, selected, className, onClick, ...rest },
  ref,
) {
  const clickable = Boolean(onClick);
  return (
    <tr
      ref={ref}
      className={cn('bay-table__row', className)}
      data-selected={selected ? '' : undefined}
      data-clickable={clickable ? '' : undefined}
      aria-selected={selected}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (onClick as (e: unknown) => void)(e);
              }
            }
          : undefined
      }
      {...rest}
    >
      {children}
    </tr>
  );
});

export interface TableHeadProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: Align;
  /** The current direction, or false when the column is sortable but not sorted. */
  sort?: 'asc' | 'desc' | false;
  onSort?: () => void;
}

/** A column heading. With `onSort` it becomes a button and reports `aria-sort`. */
export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { children, align = 'start', sort, onSort, className, ...rest },
  ref,
) {
  return (
    <th
      ref={ref}
      scope="col"
      className={cn('bay-table__head', className)}
      data-align={align}
      aria-sort={sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : onSort ? 'none' : undefined}
      {...rest}
    >
      {onSort ? (
        <button type="button" className="bay-table__sort" onClick={onSort}>
          {children}
          <Icon name={sort === 'asc' ? 'arrowUp' : sort === 'desc' ? 'arrowDown' : 'chevronsUpDown'} size={12} />
        </button>
      ) : (
        children
      )}
    </th>
  );
});

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: Align;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { children, align = 'start', className, ...rest },
  ref,
) {
  return (
    <td ref={ref} className={cn('bay-table__cell', className)} data-align={align} {...rest}>
      {children}
    </td>
  );
});

/** Table as an object of parts. The flat aliases above work from React Server Components. */
export const Table = {
  Root: TableRoot,
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
};
