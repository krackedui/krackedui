import { useState, type PointerEvent as ReactPointerEvent } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';
import { CalendarToolbar } from './CalendarView';
import { useDatabaseContext } from './useDatabase';
import { getProperty, monthLabel, parseDate, queryRows, rowTitle, sameDay, toISODate } from './query';
import type { Row } from './types';

export interface TimelineViewProps {
  onOpenRow?: (row: Row) => void;
  today?: string;
  /** Visible width in px (days = width / 40). */
  width?: number;
}

const DAY = 40; // db-timeline: 40px per day (weekend bands 80 wide, weeks 280 apart)
const ROW = 36; // item rows 36px (34px bars + 1px margins)

/**
 * Timeline view, "Month" scale (capture: db-timeline). Measured: 40px days; body bg timeline-bg with weekend
 * bands timeline-dark-bg; 1px red-icon-accent-primary today line; day numbers 12px text-tertiary, today as a red-bg-solid pill (AA; capture: red-icon-accent-primary)
 * (padding 2 7, white); bars radius 6, bg-elevated, shadow-outline-sm, 34px tall, title 14/500 after a 6px inset;
 * off-screen items show a 16px arrow chip (bg icon-secondary, white arrow) at the edge. Drag a bar to move its date.
 */
export function TimelineView({ onOpenRow, today: todayIso, width = 708 }: TimelineViewProps) {
  const db = useDatabaseContext();
  const { collection } = db.data;
  const view = db.activeView;
  const today = parseDate(todayIso) ?? new Date();
  const [start, setStart] = useState(() => new Date(today.getFullYear(), today.getMonth(), today.getDate() - 9));
  const dateProp = getProperty(collection, view.dateProperty) ?? collection.properties.find((p) => p.type === 'date');
  const rows = queryRows(collection, db.data.rows, view);
  const offset = -34; // first visible day is partially scrolled out, as captured
  const nDays = Math.ceil((width - offset) / DAY) + 1;
  const days = Array.from({ length: nDays }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const x = (d: Date) => offset + Math.round((d.getTime() - start.getTime()) / 864e5) * DAY;
  const todayX = x(today) + DAY * 0.7; // capture: line 28px into the day (afternoon)
  const [drag, setDrag] = useState<{ id: string; x0: number; dx: number } | null>(null);
  const shift = (n: number) => setStart((s) => new Date(s.getFullYear(), s.getMonth(), s.getDate() + n));

  const onPointerDown = (e: ReactPointerEvent, row: Row) => {
    const x0 = e.clientX;
    let dx = 0;
    setDrag({ id: row.id, x0, dx: 0 });
    const move = (ev: PointerEvent) => { dx = ev.clientX - x0; setDrag({ id: row.id, x0, dx }); };
    const up = () => {
      removeEventListener('pointermove', move); removeEventListener('pointerup', up);
      const days = Math.round(dx / DAY);
      const d = parseDate(row.values[dateProp!.id] as string);
      if (days && d) db.updateRow(row.id, dateProp!.id, toISODate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)));
      else if (Math.abs(dx) < 3) onOpenRow?.(row);
      setDrag(null);
    };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
  };

  return (
    <div className="relative">
      <CalendarToolbar
        className="mr-5"
        leading={<button type="button" aria-label="Open table" className="flex size-6 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a"><Icon name="arrowChevronDoubleForwardSmall" size={16} /></button>}
        label={monthLabel(days[Math.min(10, days.length - 1)])}
        extra={<button type="button" className="mr-1 flex h-6 cursor-pointer items-center gap-0.5 rounded-n-md px-1.5 text-[14px] text-n-text-secondary hover:bg-n-button-hover-bg-a">Month<Icon name="arrowChevronSingleDownSmall" size={14} className="text-n-icon-tertiary" /></button>}
        onPrev={() => shift(-7)}
        onNext={() => shift(7)}
        onToday={() => setStart(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 9))}
      />
      <div className="relative overflow-hidden border-b border-n-border-primary bg-n-timeline-bg" style={{ width, height: 32 + rows.length * ROW + 40 + 8 }}>
        {/* weekend bands + today line */}
        {days.map((d) => (d.getDay() === 6 ? <div key={d.toISOString()} className="absolute bottom-0 top-8 bg-n-timeline-dark-bg" style={{ left: x(d), width: DAY * 2 }} /> : null))}
        <div className="absolute bottom-0 top-8 z-[1] w-px bg-n-red-icon-accent-primary" style={{ left: todayX }}>
          <span className="absolute -left-[3px] top-0 size-[7px] rounded-full bg-n-red-icon-accent-primary" />
        </div>
        {/* day numbers */}
        <div className="relative h-8 border-b border-n-border-primary bg-n-bg-primary">
          {days.map((d) => (
            <div key={d.toISOString()} className="absolute top-0 flex h-[30px] items-center justify-center text-[12px] leading-[14px]" style={{ left: x(d), width: DAY }}>
              {sameDay(d, today)
                ? <span className="relative z-[2] rounded-full bg-n-red-bg-solid px-[7px] py-0.5 text-n-text-on-solid">{d.getDate()}</span>
                : <span className="text-n-text-tertiary">{d.getDate()}</span>}
            </div>
          ))}
        </div>
        {/* rows */}
        <div className="relative">
          {rows.map((r, i) => {
            const d = dateProp ? parseDate(r.values[dateProp.id] as string | null) : null;
            const left = d ? x(d) + 2 : 0;
            const dx = drag?.id === r.id ? drag.dx : 0;
            const off = !d ? null : left + dx < 0 ? 'left' : left + dx > width - 40 ? 'right' : null;
            return (
              <div key={r.id} className="absolute inset-x-0" style={{ top: i * ROW, height: ROW }}>
                {d && !off && (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`${rowTitle(collection, r)}, ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. Enter opens, arrow keys move the date.`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenRow?.(r); }
                      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && dateProp) {
                        e.preventDefault();
                        const n = e.key === 'ArrowLeft' ? -1 : 1;
                        db.updateRow(r.id, dateProp.id, toISODate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)));
                      }
                    }}
                    onPointerDown={(e) => onPointerDown(e, r)}
                    className={cn('absolute top-px z-[2] flex h-[34px] cursor-grab touch-none select-none items-center', drag?.id === r.id && 'cursor-grabbing')}
                    style={{ left: left + dx }}
                  >
                    <span aria-hidden className="h-[34px] w-[37px] rounded-n-md bg-n-bg-elevated shadow-n-shadow-outline-sm" />
                    <span aria-hidden className="pointer-events-none absolute left-1.5 whitespace-nowrap text-[14px] font-medium leading-[21px]">{rowTitle(collection, r)}</span>
                  </div>
                )}
                {off && (
                  <button
                    type="button"
                    aria-label={`Scroll to ${rowTitle(collection, r)}`}
                    onClick={() => setStart(new Date(d!.getFullYear(), d!.getMonth(), d!.getDate() - 9))}
                    className={cn('absolute top-[9px] z-[2] flex size-4 cursor-pointer items-center justify-center rounded-n-sm border border-n-white bg-n-icon-secondary text-n-text-on-solid', off === 'left' ? 'left-2' : 'right-2')}
                  >
                    <Icon name={off === 'left' ? 'arrowStraightLeftFillSmall' : 'arrowStraightRightFillSmall'} size={12} />
                  </button>
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => dateProp && db.addRow({ [dateProp.id]: toISODate(today) })}
            className="absolute left-1 flex h-[30px] cursor-pointer items-center gap-1.5 rounded-n-md px-1.5 text-[14px] text-n-text-secondary hover:bg-n-button-hover-bg-a"
            style={{ top: rows.length * ROW + 4 }}
          >
            <Icon name="plusSmall" size={16} className="text-n-icon-secondary" />
            New
          </button>
        </div>
      </div>
    </div>
  );
}
