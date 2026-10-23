import { useCallback, useState } from 'react';
import { tasks as seed, type Status, type Task } from './data';

/** One place the screens share, so a change on the board shows up in the sheet and the list. */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(seed);

  const update = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const move = useCallback((id: string, status: Status) => update(id, { status }), [update]);

  const add = useCallback((task: Omit<Task, 'id'> & { id?: string }, key: string) => {
    setTasks((list) => {
      const n = list.filter((t) => t.id.startsWith(key)).length + 10;
      return [...list, { ...task, id: task.id ?? `${key}-${n}` } as Task];
    });
  }, []);

  const remove = useCallback((ids: string[]) => {
    setTasks((list) => list.filter((t) => !ids.includes(t.id)));
  }, []);

  return { tasks, setTasks, update, move, add, remove };
}
