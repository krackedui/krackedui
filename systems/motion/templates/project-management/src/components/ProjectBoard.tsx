import { KanbanBoard, useToast } from '@krackedui/motion';
import { statusColor } from '../data/meta';
import { STATUSES, type Status, type Task } from '../data/types';
import { navigate } from '../lib/router';
import { useStore } from '../state/store';
import { useTaskActions } from '../state/useTaskActions';
import { TaskCard } from './TaskCard';

const columns = STATUSES.map((s) => ({ id: s, title: s, color: statusColor[s] }));

interface ProjectBoardProps {
  projectSlug: string;
  /** Tasks to show (already filtered), in board order. */
  tasks: Task[];
  onDelete: (task: Task) => void;
  /** Column whose quick-add field starts open (empty project). */
  quickAddStatus?: Status;
}

/** Motion's KanbanBoard wired to the store: moves (with an undo toast), quick add, open and delete. */
export function ProjectBoard({ projectSlug, tasks, onDelete, quickAddStatus }: ProjectBoardProps) {
  const { addTask, taskById } = useStore();
  const { move } = useTaskActions();
  const { toast } = useToast();
  return (
    <KanbanBoard
      label="Task board"
      columns={columns}
      items={tasks}
      getItemId={(t) => t.id}
      getColumnId={(t) => t.status}
      getItemLabel={(t) => `${t.id} ${t.title}`}
      renderCard={(t, { actions }) => <TaskCard task={t} actions={actions} />}
      onMove={({ itemId, toColumnId, toIndex }) => {
        const task = taskById(itemId);
        if (!task) return;
        // toIndex counts the visible cards of the target column without the moved one.
        const target = tasks.filter((t) => t.status === toColumnId && t.id !== itemId);
        move(task, toColumnId as Status, target[toIndex]?.id);
      }}
      onQuickAdd={(status, title) => {
        const task = addTask({ projectSlug, title, status: status as Status });
        toast({ message: `Created ${task.id} in ${status}`, tone: 'success' });
      }}
      quickAddLabel="Add task"
      defaultQuickAddColumnId={quickAddStatus}
      emptyColumnText="No tasks"
      itemActions={(t, M) => (
        <>
          <M.Item icon="peekSide" onSelect={() => navigate({ name: 'task', id: t.id })}>Open</M.Item>
          <M.Item icon="trash" destructive onSelect={() => onDelete(t)}>Delete…</M.Item>
        </>
      )}
    />
  );
}
