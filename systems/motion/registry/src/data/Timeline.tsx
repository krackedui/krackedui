import {
  useId, useLayoutEffect, useRef, useState,
  type HTMLAttributes, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode,
} from 'react';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';
import type { MotionColor } from '../atoms/Tag';

/**
 * Timeline (Gantt): one row per item, a bar from its start to its end date on a week or month scale, and a
 * red today marker. The label column stays put while the chart scrolls sideways in its own region (its bars
 * are the focus stops, so keyboard users reach every part of it).
 * Rows 36px with hairlines, group rows on bg-secondary, bars 24px radius 6 in the item's palette color
 * (bg-tertiary + text-primary), scale header 52px (month names 12/16 medium, week dates 11px secondary).
 * Inferred from Motion's database timeline and Table; no reference capture.
 */
export const timelineVariants = tv({
  slots: {
    root: 'relative overflow-x-auto rounded-n-lg border border-n-border-primary outline-none focus-visible:shadow-n-focus-shadow',
    inner: 'relative w-max min-w-full',
    scale: 'flex border-b border-n-border-primary',
    labelCell: 'sticky left-0 z-[2] flex shrink-0 items-center gap-1.5 border-r border-n-border-primary px-3 text-n-ui',
    month: 'absolute top-1.5 whitespace-nowrap px-2 text-n-ui-sm font-medium text-n-text-primary',
    week: 'absolute bottom-0 h-5 whitespace-nowrap border-l border-n-border-primary pl-1 text-[11px] leading-5 text-n-text-secondary',
    row: 'flex border-b border-n-border-primary last:border-b-0',
    bar: [
      'absolute top-1.5 flex h-6 items-center overflow-hidden whitespace-nowrap rounded-n-md px-2 text-n-ui-sm outline-none',
      'focus-visible:shadow-n-focus-shadow touch-pan-y select-none',
    ],
    today: 'absolute bottom-0 w-0.5 bg-n-red-icon-accent-primary',
    todayLabel: 'absolute left-1 top-0 whitespace-nowrap rounded-n-sm border border-n-red-icon-accent-primary bg-n-bg-primary px-1 text-[11px] font-medium leading-4 text-n-red-text-primary',
  },
  variants: {
    group: {
      true: { row: 'bg-n-bg-secondary', labelCell: 'bg-n-bg-secondary font-medium' },
      false: { labelCell: 'bg-n-bg-primary pl-5' },
    },
    movable: { true: { bar: 'cursor-grab active:cursor-grabbing' }, false: { bar: 'cursor-pointer' } },
  },
});

// Literal classes so Tailwind generates them.
const BAR_COLOR: Record<MotionColor, string> = {
  default: 'bg-n-gray-bg-tertiary text-n-text-primary',
  gray: 'bg-n-gray-bg-tertiary text-n-gray-text-primary',
  brown: 'bg-n-brown-bg-tertiary text-n-brown-text-primary',
  orange: 'bg-n-orange-bg-tertiary text-n-orange-text-primary',
  yellow: 'bg-n-yellow-bg-tertiary text-n-yellow-text-primary',
  green: 'bg-n-green-bg-tertiary text-n-green-text-primary',
  blue: 'bg-n-blue-bg-tertiary text-n-blue-text-primary',
  purple: 'bg-n-purple-bg-tertiary text-n-purple-text-primary',
  pink: 'bg-n-pink-bg-tertiary text-n-pink-text-primary',
  red: 'bg-n-red-bg-tertiary text-n-red-text-primary',
  teal: 'bg-n-teal-bg-tertiary text-n-teal-text-primary',
};

export type TimelineScale = 'week' | 'month';

export interface TimelineItem {
  id: string;
  /** Row name (also in the bar's accessible name). */
  label: string;
  /** Short prefix in the label column, e.g. a task id. */
  meta?: string;
  start: Date;
  end: Date;
  /** Group header row (a project above its tasks): bold label, tinted row, not movable. */
  group?: boolean;
  color?: MotionColor;
  /** Extra words for the bar's accessible name, e.g. the status. */
  description?: string;
}

export interface TimelineChange {
  id: string;
  start: Date;
  end: Date;
}

export interface TimelineProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TimelineItem[];
  /** Day width: `week` 28px with a date per week, `month` 9px with month names only. Default `week`. */
  scale?: TimelineScale;
  /** Where the today marker goes, and what the chart scrolls to first. Default: the current date. */
  today?: Date;
  /** Bar clicked or Enter / Space pressed on it. */
  onOpen?(this: void, item: TimelineItem): void;
  /** A bar was dragged or moved with ← / → (Shift: a week). Without it bars do not move. */
  onChange?(this: void, change: TimelineChange): void;
  /** Accessible name of the scroll region (default "Timeline"). */
  label?: string;
  /** Text in the top-left corner (default "By week" / "By month"). */
  corner?: ReactNode;
}

const DAY_PX: Record<TimelineScale, number> = { week: 28, month: 9 };
const HEADER = 52;
const ROW = 36;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const diffDays = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000);
const monday = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
const dayFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const fmt = (d: Date) => dayFmt.format(d);

/**
 * A Gantt-style timeline: bars from start to end on a week or month scale, with a today marker. Bars are
 * buttons: Enter opens (`onOpen`), ← / → move them by a day (`onChange`, announced); they also drag with a
 * pointer. Use it for plans and roadmaps; for dates in a month grid use Calendar, for one date a DatePicker.
 */
export function Timeline({ items, scale = 'week', today: todayProp, onOpen, onChange, label = 'Timeline', corner, className, ...props }: TimelineProps) {
  const s = timelineVariants();
  const ref = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const [announcement, setAnnouncement] = useState('');
  const [drag, setDrag] = useState<{ id: string; x0: number; days: number } | null>(null);
  const moved = useRef(false);
  const today = startOfDay(todayProp ?? new Date());
  const px = DAY_PX[scale];

  const starts = items.map((i) => startOfDay(i.start).getTime());
  const ends = items.map((i) => startOfDay(i.end).getTime());
  const first = monday(addDays(new Date(Math.min(today.getTime(), ...starts)), -7));
  const last = addDays(new Date(Math.max(today.getTime(), ...ends)), 21);
  const days = diffDays(first, last);
  const x = (d: Date) => diffDays(first, d) * px;
  const todayX = x(today);
  const weeks = Array.from({ length: Math.ceil(days / 7) }, (_, i) => addDays(first, i * 7));
  const months: Date[] = [];
  for (let d = new Date(first.getFullYear(), first.getMonth(), 1); d < last; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) months.push(d);

  // Open with today in view (and again when the scale changes).
  useLayoutEffect(() => {
    const el = ref.current;
    if (el) el.scrollLeft = Math.max(0, todayX - el.clientWidth / 3);
  }, [todayX]);

  const shift = (item: TimelineItem, n: number) => {
    if (!onChange || !n) return;
    const start = addDays(item.start, n);
    const end = addDays(item.end, n);
    onChange({ id: item.id, start, end });
    setAnnouncement(`Moved ${item.label} to ${fmt(start)} – ${fmt(end)}.`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, item: TimelineItem, movable: boolean) => {
    if (!movable || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault();
    shift(item, (e.key === 'ArrowLeft' ? -1 : 1) * (e.shiftKey ? 7 : 1));
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>, item: TimelineItem) => {
    if (e.button !== 0) return;
    moved.current = false;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ id: item.id, x0: e.clientX, days: 0 });
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const dx = e.clientX - drag.x0;
    if (Math.abs(dx) > 4) moved.current = true;
    const n = Math.round(dx / px);
    if (n !== drag.days) setDrag({ ...drag, days: n });
  };
  const onPointerUp = (item: TimelineItem) => {
    if (drag && moved.current) shift(item, drag.days);
    setDrag(null);
  };

  return (
    <div ref={ref} role="region" aria-label={label} className={s.root({ className })} {...props}>
      <div className={s.inner()}>
        <div className={s.scale()} style={{ height: HEADER }}>
          <div className={cn(s.labelCell(), 'w-36 items-end bg-n-bg-primary pb-1.5 text-n-ui-sm text-n-text-secondary sm:w-60')}>
            {corner ?? (scale === 'week' ? 'By week' : 'By month')}
          </div>
          <div aria-hidden className="relative shrink-0" style={{ width: days * px }}>
            {months.map((m) => <span key={m.getTime()} className={s.month()} style={{ left: Math.max(0, x(m)) }}>{monthFmt.format(m)}</span>)}
            {scale === 'week' && weeks.map((w) => <span key={w.getTime()} className={s.week()} style={{ left: x(w) }}>{fmt(w)}</span>)}
          </div>
        </div>
        <ul className="relative m-0 list-none p-0">
          {items.map((item) => {
            const movable = !!onChange && !item.group;
            const st = timelineVariants({ group: !!item.group, movable });
            const offset = drag?.id === item.id ? drag.days : 0;
            const left = x(item.start) + offset * px;
            const width = Math.max(px * 2, x(item.end) - x(item.start) + px);
            const name = `${item.meta ? `${item.meta} ` : ''}${item.label}`;
            return (
              <li key={item.id} className={st.row()} style={{ height: ROW }}>
                <div className={cn(st.labelCell(), 'w-36 sm:w-60')}>
                  {item.meta && <span className="shrink-0 text-n-ui-sm text-n-text-secondary">{item.meta}</span>}
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="relative shrink-0" style={{ width: days * px }}>
                  <button
                    type="button"
                    className={cn(st.bar(), BAR_COLOR[item.color ?? (item.group ? 'default' : 'blue')])}
                    style={{ left, width }}
                    aria-label={`${name}: ${fmt(item.start)} to ${fmt(item.end)}${item.description ? `, ${item.description}` : ''}`}
                    aria-describedby={movable ? hintId : undefined}
                    onClick={() => { if (!moved.current) onOpen?.(item); moved.current = false; }}
                    onKeyDown={(e) => onKeyDown(e, item, movable)}
                    {...(movable ? {
                      onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => onPointerDown(e, item),
                      onPointerMove,
                      onPointerUp: () => onPointerUp(item),
                      onPointerCancel: () => setDrag(null),
                    } : {})}
                  >
                    <span aria-hidden className="truncate">{fmt(addDays(item.start, offset))} – {fmt(addDays(item.end, offset))}</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[1] flex">
          <div className="w-36 shrink-0 sm:w-60" />
          <div className="relative">
            <div className={s.today()} style={{ left: todayX, top: HEADER - 22 }}>
              <span className={s.todayLabel()}>Today</span>
            </div>
          </div>
        </div>
      </div>
      {onChange && <span id={hintId} className="sr-only">Enter opens. Left and right arrows move by a day, with Shift by a week.</span>}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</div>
    </div>
  );
}
