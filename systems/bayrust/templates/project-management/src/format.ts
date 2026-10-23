import { parseDay, today } from './data';

const DAY = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' });

export const day = (iso: string) => DAY.format(parseDay(iso));

/** How a due date reads to someone scanning a board. */
export function due(iso: string): { text: string; overdue: boolean; soon: boolean } {
  const d = parseDay(iso);
  const t = today();
  const days = Math.round((d.getTime() - new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime()) / 86_400_000);
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, overdue: true, soon: false };
  if (days === 0) return { text: 'Today', overdue: false, soon: true };
  if (days <= 7) return { text: `in ${days}d`, overdue: false, soon: true };
  return { text: DAY.format(d), overdue: false, soon: false };
}

export const initials = (name: string) => name.split(' ').map((p) => p[0]).join('').slice(0, 2);
