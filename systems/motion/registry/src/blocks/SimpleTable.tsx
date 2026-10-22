import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { RichTextView } from './RichText';
import type { RichText as RichTextValue } from './types';
import { useScrollRegion } from './scrollRegion';

export interface SimpleTableProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  rows: RichTextValue[][];
  hasHeaderRow?: boolean;
  hasHeaderColumn?: boolean;
  /** Column widths in px (default 120 each). */
  columnWidths?: number[];
  /** Replace a cell's content (editor). */
  renderCell?: (row: number, col: number, className: string) => ReactNode;
}

const cellText = 'w-full max-w-full whitespace-break-spaces break-words px-[9px] py-[7px] text-[14px] leading-5 outline-none';

/**
 * Simple table. Measured (simple-table / page-scroll-2): block padding 8 (6 inline), inner start 8, top 8,
 * bottom/end 24; border-collapse, 1px border-primary cells, min 120 / max 240 wide, rows 34 tall;
 * cell text 14/20, padding 7 9; header row bg table-hea-row-color-bg, weight 500.
 */
export const SimpleTable = forwardRef<HTMLDivElement, SimpleTableProps>(function SimpleTable(
  { rows, hasHeaderRow = true, hasHeaderColumn, columnWidths, renderCell, className, ...props }, ref,
) {
  const cols = Math.max(0, ...rows.map((r) => r.length));
  // Wide tables scroll sideways; without focusable cells the scroller itself becomes a labelled Tab stop.
  const [scrollerRef, scrollRegion] = useScrollRegion<HTMLDivElement>('Table', 'x');
  return (
    <div ref={ref} className={cn('w-full px-1.5 py-2', className)} {...props}>
      <div className="relative flex" contentEditable={false}>
        <div ref={scrollerRef} {...scrollRegion} className="-ms-5 grow overflow-x-auto ps-5">
          <div className="relative w-full ps-2">
            <div className="flex">
              <div className="pb-6 pe-6 pt-2">
                <table className="border-collapse">
                  <colgroup>{Array.from({ length: cols }, (_, i) => <col key={i} style={{ width: columnWidths?.[i] ?? 120 }} />)}</colgroup>
                  <tbody>
                    {rows.map((row, r) => (
                      <tr key={r} className="h-[34px]">
                        {Array.from({ length: cols }, (_, c) => {
                          const header = (hasHeaderRow && r === 0) || (hasHeaderColumn && c === 0);
                          const Tag = header ? 'th' : 'td';
                          return (
                            <Tag
                              key={c}
                              scope={header ? (r === 0 ? 'col' : 'row') : undefined}
                              className={cn(
                                'relative min-h-8 min-w-[120px] max-w-[240px] border border-n-border-primary text-start align-top',
                                header ? 'bg-n-table-hea-row-color-bg font-medium' : 'font-normal',
                              )}
                            >
                              {renderCell ? renderCell(r, c, cellText) : <div className={cellText}><RichTextView value={row[c]} /></div>}
                            </Tag>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
