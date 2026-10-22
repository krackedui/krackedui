import { TODAY } from '../data/workspace';

const DAY_MS = 86_400_000;

/** Local midnight of an ISO date ("2026-10-21"). */
export function parseDay(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISODay(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export const today = (): Date => parseDay(TODAY);

/** Whole days from a to b (b - a). */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Monday of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  return addDays(date, -((date.getDay() + 6) % 7));
}

const short = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const long = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

/** "Oct 24", or "Jan 15, 2027" outside the current year. */
export function formatDay(iso: string): string {
  const d = parseDay(iso);
  return d.getFullYear() === today().getFullYear() ? short.format(d) : long.format(d);
}

/** "Today", "Tomorrow", "Yesterday" or a date. */
export function formatDue(iso: string): string {
  const diff = daysBetween(today(), parseDay(iso));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return formatDay(iso);
}

/** Activity timestamps: "9:42 AM" today, "Yesterday", otherwise the date. */
export function formatWhen(isoDateTime: string): string {
  const [day, clock = '00:00:00'] = isoDateTime.split('T');
  const diff = daysBetween(parseDay(day), today());
  if (diff === 0) {
    const [h, m] = clock.split(':').map(Number);
    const d = parseDay(day);
    d.setHours(h, m);
    return time.format(d);
  }
  if (diff === 1) return 'Yesterday';
  return formatDay(day);
}

/** A due date before today, on a task that is not done. */
export function isOverdue(due: string | null, done: boolean): boolean {
  return !!due && !done && daysBetween(today(), parseDay(due)) < 0;
}

/** Due between Monday and Sunday of the current week. */
export function isThisWeek(iso: string | null): boolean {
  if (!iso) return false;
  const start = startOfWeek(today());
  const d = daysBetween(start, parseDay(iso));
  return d >= 0 && d < 7;
}

/** "now" for new comments and activity: the fixed sample day at the current wall-clock time. */
export function nowStamp(): string {
  const n = new Date();
  const p = (x: number) => String(x).padStart(2, '0');
  return `${TODAY}T${p(n.getHours())}:${p(n.getMinutes())}:00`;
}
