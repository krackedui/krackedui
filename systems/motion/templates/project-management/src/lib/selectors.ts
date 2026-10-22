import type { Task } from '../data/types';

/** Share of done tasks, 0–100. */
export function progressOf(tasks: Task[]): number {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((t) => t.status === 'Done').length / tasks.length) * 100);
}

export interface TaskFilters {
  query: string;
  assigneeId: string;
  label: string;
  priority: string;
}

export const ANY = 'any';
export const emptyFilters: TaskFilters = { query: '', assigneeId: ANY, label: ANY, priority: ANY };

export function isFiltered(f: TaskFilters): boolean {
  return f.query.trim() !== '' || f.assigneeId !== ANY || f.label !== ANY || f.priority !== ANY;
}

export function filterTasks(tasks: Task[], f: TaskFilters): Task[] {
  const q = f.query.trim().toLowerCase();
  return tasks.filter((t) =>
    (!q || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
    && (f.assigneeId === ANY || (f.assigneeId === 'none' ? t.assigneeId === null : t.assigneeId === f.assigneeId))
    && (f.label === ANY || t.labels.some((l) => l === f.label))
    && (f.priority === ANY || t.priority === f.priority));
}
