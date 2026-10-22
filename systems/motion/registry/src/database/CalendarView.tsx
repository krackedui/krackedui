import { useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';
import { useDatabaseContext } from './useDatabase';
import { monthGrid } from './DateCellPicker';
import { MONTHS_SHORT, getProperty, monthLabel, parseDate, queryRows, rowTitle, sameDay, toISODate } from './query';
import type { Row } from './types';

export interface CalendarToolbarProps {
  label: ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  /** Extra controls between "Manage in Calendar" and the arrows (timeline: "Month ▾"). */
  extra?: ReactNode;
  /** Leading control (timeline: » toggle for the table sidebar). */
  leading?: ReactNode;
  className?: string;
}

/**
 * Month header shared by calendar and timeline (db-calendar, db-timeline). Measured: 42px row; month 14/600 (margin 0 8);
 * "Manage in Calendar" 24px, 1px border-primary-translucent-a, radius 6, padding 0 6, gap 6, 14/500, calendarDate15 16;
 * prev/next 24x24 radius 6; "Today" padding 0 6, 14/16.8.
 */
export function CalendarToolbar({ label, onPrev, onNext, onToday, extra, leading, className }: CalendarToolbarProps) {
  return (
    <div className={cn('flex h-[42px] min-w-0 items-center [&>button]:shrink-0', className)}>
      {leading}
      <div className="mx-2 min-w-0 flex-1 truncate text-[14px] font-semibold leading-[14px]">{label}</div>
      {/* Icon only on phones (the label stays as the accessible name). */}
      <button type="button" className="mr-2 mt-0.5 inline-flex h-6 cursor-pointer items-center gap-1.5 rounded-n-md border border-n-border-primary-translucent-a px-1.5 text-[14px] font-medium leading-[16.8px] hover:bg-n-button-hover-bg-a">
        <Icon name="calendarDate15" size={16} />
        <span className="max-sm:sr-only">Manage in Calendar</span>
      </button>
      {extra}
      <button type="button" aria-label="Previous Month" onClick={onPrev} className="flex size-6 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a">
        <Icon name="arrowChevronSingleLeftSmall" size={16} />
      </button>
      <button type="button" onClick={onToday} className="flex h-6 cursor-pointer items-center rounded-n-md px-1.5 text-[14px] leading-[16.8px] hover:bg-n-button-hover-bg-a">Today</button>
      <button type="button" aria-label="Next Month" onClick={onNext} className="flex size-6 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a">
        <Icon name="arrowChevronSingleRightSmall" size={16} />
      </button>
    </div>
  );
}

export interface CalendarViewProps {
  onOpenRow?: (row: Row) => void;
  /** ISO "today" (capture: 2026-10-15). */
  today?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayLabel = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

/**
 * Calendar view, month grid (capture: db-calendar). Measured: inset 8px; weekday header 24px 12/18 text-tertiary
 * with a 1px border-primary rule; weeks 124px; cells 1px border-primary right/bottom, weekends bg-secondary;
 * day number 14/24 at top 4 right 10 (outside month text-tertiary, 1st of month "Oct 1"); today = 24px red-bg-solid (AA; capture: red-icon-accent-primary)
 * circle with white text; events 28px cards (radius 6, bg-elevated, shadow-outline-sm, 14/21 600, padding 0 6) in 3 6 slots.
 */
export function CalendarView({ onOpenRow, today: todayIso }: CalendarViewProps) {
  const db = useDatabaseContext();
  const { collection } = db.data;
  const view = db.activeView;
  const today = parseDate(todayIso) ?? new Date();
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const dateProp = getProperty(collection, view.dateProperty) ?? collection.properties.find((p) => p.type === 'date');
  const rows = queryRows(collection, db.data.rows, view);
  const days = monthGrid(month);
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const dim = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const weeks = Math.ceil((first.getDay() + dim) / 7);
  const [dragRow, setDragRow] = useState<string | null>(null);

  return (
    <div className="ml-2 mr-5 min-w-[560px] pl-px">
      <div className="sticky top-0 z-[3] bg-n-bg-primary">
        <CalendarToolbar
          className="mb-0.5"
          label={monthLabel(month)}
          onPrev={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          onNext={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          onToday={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}
        />
        <div className="flex shadow-[0_1px_0_var(--n-border-primary)]">
          {WEEKDAYS.map((d) => <div key={d} aria-hidden className="flex-1 text-center text-[12px] leading-6 text-n-text-tertiary">{d}</div>)}
        </div>
      </div>
      <div className="mt-px overflow-hidden shadow-[-1px_0_0_var(--n-border-primary)]">
        {Array.from({ length: weeks }, (_, w) => (
          <div key={w} className="flex">
            {days.slice(w * 7, w * 7 + 7).map((d, i) => {
              const outside = d.getMonth() !== month.getMonth();
              const isToday = sameDay(d, today);
              const events = dateProp ? rows.filter((r) => { const v = parseDate(r.values[dateProp.id] as string | null); return v && sameDay(v, d); }) : [];
              return (
                <div
                  key={i}
                  role="group"
                  aria-label={dayLabel(d)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (dragRow && dateProp) db.updateRow(dragRow, dateProp.id, toISODate(d)); setDragRow(null); }}
                  className={cn('group/day relative h-[124px] min-w-0 flex-1 border-b border-r border-n-border-primary', (i === 0 || i === 6) && 'bg-n-bg-secondary')}
                >
                  <button
                    type="button"
                    aria-label={`Add page on ${dayLabel(d)}`}
                    onClick={() => dateProp && db.addRow({ [dateProp.id]: toISODate(d) })}
                    className="absolute left-1.5 top-1 flex size-6 cursor-pointer focus-visible:shadow-n-focus-shadow items-center justify-center rounded-n-md bg-n-bg-elevated text-n-icon-secondary opacity-0 shadow-n-shadow-outline-sm hover:bg-n-card-hover-bg focus-visible:opacity-100 group-hover/day:opacity-100"
                  >
                    <Icon name="plusSmall" size={16} />
                  </button>
                  <div
                    aria-hidden
                    className={cn(
                      'absolute top-1 text-[14px] leading-6',
                      isToday ? 'right-[5px] size-6 rounded-full bg-n-red-bg-solid text-center text-n-text-on-solid' : 'right-[11px]',
                      !isToday && outside && 'text-n-text-tertiary',
                    )}
                  >
                    {d.getDate() === 1 && !isToday ? `${MONTHS_SHORT[d.getMonth()]} 1` : d.getDate()}
                  </div>
                  <div className="absolute inset-x-0 top-[30px] flex flex-col">
                    {events.map((r) => (
                      <div key={r.id} className="px-1.5 py-[3px]">
                        <button
                          type="button"
                          draggable
                          onDragStart={() => setDragRow(r.id)}
                          onClick={() => onOpenRow?.(r)}
                          className="flex h-7 w-full min-w-0 cursor-pointer focus-visible:shadow-n-focus-shadow items-center rounded-n-md bg-n-bg-elevated text-left text-n-text-primary shadow-n-shadow-outline-sm hover:bg-n-calendar-item-hover-bg"
                        >
                          <span className="truncate px-1.5 text-[14px] font-semibold leading-[21px]">{rowTitle(collection, r)}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
