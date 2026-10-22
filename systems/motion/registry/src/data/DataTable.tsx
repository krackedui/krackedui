import { useMemo, useState, type CSSProperties, type ReactNode, type Ref } from 'react';
import { cn } from '../lib/cn';
import { Checkbox } from '../atoms/Checkbox';
import { Table } from './Table';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

type Align = 'start' | 'center' | 'end';
type SortValue = string | number | boolean | Date | null | undefined;

export interface DataTableSort {
  key: string;
  direction: 'asc' | 'desc';
}

export interface DataTableColumn<Row> {
  /** Field of the row to show and sort by (unless `cell` / `sortValue` are given). Also the column id. */
  key: string;
  header: ReactNode;
  /** Custom cell content. Defaults to the row's `key` field as text. */
  cell?(this: void, row: Row): ReactNode;
  /** Value used for sorting when the cell is custom (e.g. a Date or a number behind a formatted label). */
  sortValue?(this: void, row: Row): SortValue;
  align?: Align;
  sortable?: boolean;
  /** Column width (number = px). */
  width?: number | string;
  /**
   * Hide the column while the table itself is narrower than this (sm 640, md 768, lg 1024 px of the table's
   * width, a container query), so narrow cards and phones keep the important columns.
   */
  hideBelow?: 'sm' | 'md' | 'lg';
}

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  /** Stable id per row (selection, keys). Defaults to `row.id`, then the row index. */
  getRowId?(this: void, row: Row): string;
  /** Controlled sort. Omit it (and use `defaultSort`) to let the table sort by itself. */
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  /** Called with the next sort: none → ascending → descending → none. */
  onSortChange?(this: void, sort: DataTableSort | null): void;
  /** Controlled selection; passing it (or `onSelectedIdsChange`, or `selectable`) adds the checkbox column. */
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectedIdsChange?(this: void, ids: string[]): void;
  /** Adds the checkbox column with uncontrolled selection. */
  selectable?: boolean;
  /**
   * Makes rows clickable. The first visible cell becomes a button (the keyboard target); clicks anywhere else
   * on the row work too, except on links, buttons and inputs inside it.
   */
  onRowClick?(this: void, row: Row): void;
  /** Shows skeleton rows and marks the table busy. */
  loading?: boolean;
  /** Number of skeleton rows while loading. Defaults to 5. */
  loadingRows?: number;
  /** Shown when there are no rows: a string becomes an EmptyState title; any node renders as-is. */
  empty?: ReactNode;
  density?: 'compact' | 'comfortable';
  /** Limits the height; the header stays visible while the body scrolls. */
  maxHeight?: number | string;
  /** Accessible name of the table (and its scroll region). */
  label?: string;
  /** Rows per page. Turns on built-in paging (after sorting) with a Pagination footer when there are more rows. */
  pageSize?: number;
  /** Controlled current page (1-based). */
  page?: number;
  /** Initial page when uncontrolled. Defaults to 1. */
  defaultPage?: number;
  /** Called with the new page (Pagination, or 1 when the sort changes). */
  onPageChange?(this: void, page: number): void;
  /** Name of a row for its selection checkbox. Defaults to the text of the first column. */
  getRowLabel?(this: void, row: Row): string;
  className?: string;
  style?: CSSProperties;
  id?: string;
  ref?: Ref<HTMLTableElement>;
}

// Container queries on the table's wrapper (`@container`), not the viewport: a table in a narrow card drops columns too.
const hideClass = { sm: '@max-[640px]:hidden', md: '@max-[768px]:hidden', lg: '@max-[1024px]:hidden' } as const;

function field(row: unknown, key: string): unknown {
  return typeof row === 'object' && row !== null ? Reflect.get(row, key) : undefined;
}

function toSortValue(v: unknown): SortValue {
  if (v === null || v === undefined || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v instanceof Date) return v;
  return typeof v === 'bigint' ? Number(v) : undefined;
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/** Compares two sort values: numbers and dates numerically, strings naturally ("Item 2" < "Item 10"); empty last. */
export function compareValues(a: SortValue, b: SortValue): number {
  const empty = (v: SortValue) => v === null || v === undefined || v === '' || (v instanceof Date && Number.isNaN(v.getTime()));
  if (empty(a) || empty(b)) return empty(a) === empty(b) ? 0 : empty(a) ? 1 : -1;
  const num = (v: SortValue) => (v instanceof Date ? v.getTime() : typeof v === 'boolean' ? Number(v) : v);
  const x = num(a);
  const y = num(b);
  if (typeof x === 'number' && typeof y === 'number') return x - y;
  return collator.compare(String(x), String(y));
}

function defaultRowId(row: unknown, index: number): string {
  const id = field(row, 'id');
  return typeof id === 'string' || typeof id === 'number' ? String(id) : String(index);
}

function text(v: unknown): ReactNode {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toLocaleDateString();
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint') return String(v);
  return typeof v === 'object' ? JSON.stringify(v) : '';
}

/**
 * Data-driven table: columns + rows with sorting, row selection, row click, loading and empty states,
 * responsive columns and a sticky header. Built from the `Table` primitives.
 */
export function DataTable<Row>({
  columns,
  rows,
  getRowId,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  selectedIds: selectedProp,
  defaultSelectedIds = [],
  onSelectedIdsChange,
  selectable,
  onRowClick,
  loading,
  loadingRows = 5,
  empty,
  density,
  maxHeight,
  label,
  getRowLabel,
  pageSize,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  className,
  style,
  id,
  ref,
}: DataTableProps<Row>) {
  const [sortState, setSortState] = useState<DataTableSort | null>(defaultSort);
  const [selectedState, setSelectedState] = useState<string[]>(defaultSelectedIds);
  const sort = sortProp === undefined ? sortState : sortProp;
  const selected = selectedProp ?? selectedState;
  const hasSelection = !!selectable || selectedProp !== undefined || !!onSelectedIdsChange;

  const sortedRows = useMemo(() => {
    const indexed = rows.map((row, i) => ({ row, id: getRowId ? getRowId(row) : defaultRowId(row, i) }));
    // Controlled sort with onSortChange: the parent may sort on the server; still sort locally so the view is consistent.
    const col = sort ? columns.find((c) => c.key === sort.key) : undefined;
    if (!sort || !col) return indexed;
    const value = (row: Row) => (col.sortValue ? col.sortValue(row) : toSortValue(field(row, col.key)));
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...indexed].sort((a, b) => {
      const va = value(a.row);
      const vb = value(b.row);
      const emptyA = va === null || va === undefined || va === '';
      const emptyB = vb === null || vb === undefined || vb === '';
      if (emptyA || emptyB) return compareValues(va, vb); // empty values stay last in both directions
      return compareValues(va, vb) * dir;
    });
  }, [rows, columns, sort, getRowId]);

  // Built-in paging (after sorting). The page is clamped when rows shrink (filtering) below it.
  const [pageState, setPageState] = useState(defaultPage);
  const pageCount = pageSize ? Math.max(1, Math.ceil(sortedRows.length / pageSize)) : 1;
  const page = Math.min(Math.max(1, pageProp ?? pageState), pageCount);
  const setPage = (next: number) => {
    if (pageProp === undefined) setPageState(next);
    onPageChange?.(next);
  };
  const visibleRows = pageSize ? sortedRows.slice((page - 1) * pageSize, page * pageSize) : sortedRows;

  const setSort = (next: DataTableSort | null) => {
    if (sortProp === undefined) setSortState(next);
    onSortChange?.(next);
    if (pageSize && page !== 1) setPage(1);
  };
  const cycleSort = (key: string) => {
    if (!sort || sort.key !== key) setSort({ key, direction: 'asc' });
    else if (sort.direction === 'asc') setSort({ key, direction: 'desc' });
    else setSort(null);
  };

  const setSelected = (ids: string[]) => {
    if (selectedProp === undefined) setSelectedState(ids);
    onSelectedIdsChange?.(ids);
  };
  const pageIds = visibleRows.map((r) => r.id);
  const selectedOnPage = pageIds.filter((rid) => selected.includes(rid)).length;
  const allChecked = pageIds.length > 0 && selectedOnPage === pageIds.length;
  const headerChecked: boolean | 'indeterminate' = allChecked ? true : selectedOnPage > 0 ? 'indeterminate' : false;
  const toggleAll = () => {
    if (allChecked) setSelected(selected.filter((rid) => !pageIds.includes(rid)));
    else setSelected([...selected, ...pageIds.filter((rid) => !selected.includes(rid))]);
  };
  const toggleRow = (rid: string, on: boolean) => setSelected(on ? [...selected.filter((x) => x !== rid), rid] : selected.filter((x) => x !== rid));

  const primary = columns.find((c) => !c.hideBelow) ?? columns[0];
  const rowLabel = (row: Row, i: number) => {
    if (getRowLabel) return getRowLabel(row);
    const v = primary ? field(row, primary.key) : undefined;
    return typeof v === 'string' || typeof v === 'number' ? String(v) : `row ${i + 1}`;
  };
  const colSpan = columns.length + (hasSelection ? 1 : 0);
  const selectCell = 'w-10 px-0 text-center';

  const renderCell = (col: DataTableColumn<Row>, row: Row) => (col.cell ? col.cell(row) : text(field(row, col.key)));

  let body: ReactNode;
  if (loading) {
    body = Array.from({ length: loadingRows }, (_, i) => (
      <Table.Row key={`loading-${i}`} aria-hidden>
        {hasSelection && <Table.Cell className={selectCell}><Skeleton width={16} height={16} className="mx-auto" /></Table.Cell>}
        {columns.map((col) => (
          <Table.Cell key={col.key} align={col.align} className={col.hideBelow && hideClass[col.hideBelow]}>
            <Skeleton height={12} width={col.align === 'end' ? '50%' : `${60 + ((i * 17 + col.key.length * 7) % 35)}%`} className={cn(col.align === 'end' && 'ml-auto')} />
          </Table.Cell>
        ))}
      </Table.Row>
    ));
  } else if (sortedRows.length === 0) {
    body = (
      <tr>
        <td colSpan={colSpan} className="p-0">
          {typeof empty === 'string' || empty === undefined ? (
            <EmptyState size="sm" icon="inbox" title={empty ?? 'No results'} />
          ) : empty}
        </td>
      </tr>
    );
  } else {
    body = visibleRows.map(({ row, id: rid }, i) => {
      const isSelected = selected.includes(rid);
      return (
        <Table.Row
          key={rid}
          selected={isSelected}
          onClick={onRowClick ? () => onRowClick(row) : undefined}
          focusable={false}
        >
          {hasSelection && (
            <Table.Cell className={selectCell}>
              <div className="flex min-h-9 w-full items-center justify-center">
                <Checkbox
                  aria-label={`Select ${rowLabel(row, i)}`}
                  checked={isSelected}
                  onCheckedChange={(on) => toggleRow(rid, on)}
                />
              </div>
            </Table.Cell>
          )}
          {columns.map((col) => {
            const content = renderCell(col, row);
            return (
              <Table.Cell key={col.key} align={col.align} className={col.hideBelow && hideClass[col.hideBelow]}>
                {onRowClick && col === primary ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRowClick(row); }}
                    className={cn(
                      '-mx-1 block w-[calc(100%+0.5rem)] cursor-pointer rounded-n-sm px-1 text-inherit',
                      col.align === 'end' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                    )}
                  >
                    {content}
                  </button>
                ) : content}
              </Table.Cell>
            );
          })}
        </Table.Row>
      );
    });
  }

  return (
    <div id={id} className={cn('@container relative w-full min-w-0', className)} style={style}>
      <Table.Root
        ref={ref}
        density={density}
        aria-label={label}
        aria-busy={loading || undefined}
        containerClassName={maxHeight !== undefined ? 'overflow-y-auto' : undefined}
        containerStyle={maxHeight !== undefined ? { maxHeight } : undefined}
      >
        <Table.Header>
          <tr>
            {hasSelection && (
              <Table.Head className={selectCell}>
                <div className="flex min-h-9 w-full items-center justify-center">
                  <Checkbox
                    aria-label="Select all rows"
                    checked={headerChecked}
                    disabled={loading || pageIds.length === 0}
                    onCheckedChange={toggleAll}
                  />
                </div>
              </Table.Head>
            )}
            {columns.map((col) => (
              <Table.Head
                key={col.key}
                align={col.align}
                style={col.width !== undefined ? { width: col.width } : undefined}
                className={col.hideBelow && hideClass[col.hideBelow]}
                sort={col.sortable ? (sort?.key === col.key ? sort.direction : false) : undefined}
                onSort={col.sortable ? () => cycleSort(col.key) : undefined}
              >
                {col.header}
              </Table.Head>
            ))}
          </tr>
        </Table.Header>
        <Table.Body>{body}</Table.Body>
      </Table.Root>
      {pageSize !== undefined && pageCount > 1 && !loading && (
        <Pagination className="mt-3" page={page} pageCount={pageCount} onPageChange={setPage} label={label ? `${label} pages` : undefined} />
      )}
      {loading && <span role="status" className="sr-only">Loading</span>}
    </div>
  );
}
