import { useCallback } from 'react';
import { useToast } from '@krackedui/motion';
import type { Status, Task } from '../data/types';
import { useStore } from './store';

/** Task actions that confirm with a toast and can be undone. */
export function useTaskActions() {
  const store = useStore();
  const { toast } = useToast();
  const { moveTask, restoreTasks, projectTasks, deleteTasks, updateTask } = store;

  /** Move to a column (and position); toasts with Undo when the status changes. */
  const move = useCallback((task: Task, status: Status, beforeId?: string) => {
    const snapshot = projectTasks(task.projectSlug);
    moveTask(task.id, status, beforeId);
    if (task.status !== status) {
      toast({
        message: `Moved ${task.id} to ${status}`,
        tone: status === 'Done' ? 'success' : 'neutral',
        action: { label: 'Undo', onClick: () => restoreTasks(snapshot) },
      });
    }
  }, [moveTask, restoreTasks, projectTasks, toast]);

  const remove = useCallback((ids: string[]) => {
    const removed = deleteTasks(ids);
    toast({
      message: removed.length === 1 ? `Deleted ${removed[0].id}` : `Deleted ${removed.length} tasks`,
      action: { label: 'Undo', onClick: () => restoreTasks(removed) },
    });
  }, [deleteTasks, restoreTasks, toast]);

  /** Change a field on several tasks at once (list view bulk actions). */
  const bulkUpdate = useCallback((tasks: Task[], patch: Partial<Pick<Task, 'status' | 'assigneeId'>>, description: string) => {
    const snapshot = tasks.map((t) => ({ ...t }));
    for (const t of tasks) updateTask(t.id, patch, patch.status ? { kind: 'moved', detail: patch.status } : { kind: 'assigned', detail: description });
    toast({
      message: `Updated ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`,
      description,
      tone: 'success',
      action: { label: 'Undo', onClick: () => restoreTasks(snapshot) },
    });
  }, [updateTask, restoreTasks, toast]);

  return { move, remove, bulkUpdate };
}
