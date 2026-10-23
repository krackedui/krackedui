'use client';

import { useMemo, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../foundations/icon';
import { TableRoot, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import { Checkbox } from '../forms/choice';
import { Skeleton } from '../feedback/status';
import { EmptyState } from './stat';

type Align = 'start' | 'center' | 'end';

export interface DataTableColumn<Row> {
  key: string;
  header: ReactNode;
  // Method syntax, not a property: a method's parameters are compared bivariantly, so a column list
  // written for a concrete row type still satisfies `DataTableColumn<Row>` for a wider `Row`. As a
  // property under `strictFunctionTypes` it would not, and the component would be unusable through
  // the contract's own type.
  cell?(this: void, row: Row): ReactNode;
  align?: Align;
  sortable?: boolean;
  width?: number | string;
  /** Hidden below this width, so the important columns survive a narrow screen. */
  hideBelow?: 'sm' | 'md' | 'lg';
}

export interface DataTableProps<Row = Record<string, unknown>> {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  getRowId?(this: void, row: Row): string;
  sort?: { key: string; direction: 'asc' | 'desc' } | null;
  onSortChange?: (sort: { key: string; direction: 'asc' | 'desc' } | null) => void;
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  onRowClick?(this: void, row: Row): void;
  loading?: boolean;
  empty?: ReactNode;
  density?: 'compact' | 'comfortable';
}

/**
 * A cell's content when the column has no `cell`. Anything that is not a primitive is left blank
 * rather than stringified: `[object Object]` in a table is a bug the reader has to decode, and a
 * column holding objects wants a `cell` of its own.
 */
function text(value: unknown): ReactNode {
  if (value == null) return '';
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
  return '';
}

/**
 * Columns and rows with sorting, selection, and loading and empty states.
 *
 * Sorting is reported, not performed: `onSortChange` tells the caller what was asked for, and the
 * caller supplies `rows` in that order. A table that sorted its own page of rows would disagree
 * with the server as soon as the data outgrew one page.
 */
export function DataTable<Row>({
  className, style, id, columns, rows, getRowId, sort, onSortChange,
  selectedIds, onSelectedIdsChange, onRowClick, loading, empty, density = 'comfortable',
}: DataTableProps<Row>) {
  const ids = useMemo(() => rows.map((r, i) => (getRowId ? getRowId(r) : String(i))), [rows, getRowId]);
  const selectable = Boolean(onSelectedIdsChange);
  const selected = selectedIds ?? [];
  const allSelected = ids.length > 0 && ids.every((i) => selected.includes(i));
  const someSelected = !allSelected && ids.some((i) => selected.includes(i));

  const toggleAll = () => onSelectedIdsChange?.(allSelected ? [] : ids);
  const toggleOne = (rowId: string) =>
    onSelectedIdsChange?.(selected.includes(rowId) ? selected.filter((x) => x !== rowId) : [...selected, rowId]);

  const nextSort = (key: string) => {
    if (!onSortChange) return;
    if (sort?.key !== key) return onSortChange({ key, direction: 'asc' });
    if (sort.direction === 'asc') return onSortChange({ key, direction: 'desc' });
    onSortChange(null); // third press clears it, so the caller's own order can come back
  };

  if (!loading && rows.length === 0) {
    return <div className={cn('bay-datatable', className)} style={style} id={id}>{empty ?? <EmptyState icon="inbox" title="Nothing here yet" />}</div>;
  }

  return (
    <div className={cn('bay-datatable', className)} style={style} id={id}>
      <TableRoot density={density}>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="bay-datatable__check">
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={toggleAll}
                  aria-label={allSelected ? 'Clear selection' : 'Select all rows'}
                />
              </TableHead>
            )}
            {columns.map((c) => (
              <TableHead
                key={c.key}
                align={c.align}
                style={c.width ? { width: c.width } : undefined}
                data-hide-below={c.hideBelow}
                sort={c.sortable ? (sort?.key === c.key ? sort.direction : false) : undefined}
                onSort={c.sortable ? () => nextSort(c.key) : undefined}
              >
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 4 }, (_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {selectable && <TableCell />}
                  {columns.map((c) => (
                    <TableCell key={c.key} data-hide-below={c.hideBelow}>
                      <Skeleton height={10} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : rows.map((row, i) => {
                const rowId = ids[i];
                return (
                  <TableRow
                    key={rowId}
                    selected={selected.includes(rowId)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <TableCell className="bay-datatable__check">
                        <Checkbox
                          checked={selected.includes(rowId)}
                          onCheckedChange={() => toggleOne(rowId)}
                          aria-label={`Select row ${i + 1}`}
                          // the row may be clickable; selecting must not also open it
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    {columns.map((c) => (
                      <TableCell key={c.key} align={c.align} data-hide-below={c.hideBelow}>
                        {c.cell ? c.cell(row) : text((row as Record<string, unknown>)[c.key])}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
        </TableBody>
      </TableRoot>
    </div>
  );
}

export interface PaginationProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

/** Page navigation. Shows the ends and a window around the current page, with gaps marked. */
export function Pagination({ className, style, id, page, pageCount, onPageChange }: PaginationProps) {
  const pages = useMemo(() => {
    const out: (number | 'gap')[] = [];
    for (let p = 1; p <= pageCount; p++) {
      if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) out.push(p);
      else if (out[out.length - 1] !== 'gap') out.push('gap');
    }
    return out;
  }, [page, pageCount]);

  return (
    <nav className={cn('bay-pagination', className)} style={style} id={id} aria-label="Pagination">
      <button type="button" className="bay-pagination__step" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
        <Icon name="chevronLeft" size={14} />
      </button>
      {pages.map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="bay-pagination__gap" aria-hidden="true">…</span>
        ) : (
          <button
            key={p}
            type="button"
            className="bay-pagination__page"
            data-current={p === page ? '' : undefined}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" className="bay-pagination__step" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} aria-label="Next page">
        <Icon name="chevronRight" size={14} />
      </button>
    </nav>
  );
}
