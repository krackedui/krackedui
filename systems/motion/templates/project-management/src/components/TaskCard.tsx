import type { ReactNode } from 'react';
import { Card } from '@krackedui/motion';
import type { Task } from '../data/types';
import { href } from '../lib/router';
import { useStore } from '../state/store';
import { Assignee, DueDate, LabelTags, PriorityIcon } from './TaskMeta';

/**
 * Board card: id, title (links to the task), labels, priority, due date and assignee. `actions` is the
 * board's "…" menu (Move to…, Move up/down, Open, Delete), handed in by KanbanBoard.
 */
export function TaskCard({ task, actions }: { task: Task; actions: ReactNode }) {
  const { memberById } = useStore();
  return (
    <Card.Root className="group/card relative cursor-grab gap-2 px-3 py-2.5 shadow-n-shadow-outline-sm transition-[background] duration-[20ms] hover:bg-n-card-hover-bg has-[a:focus-visible]:shadow-n-focus-shadow active:cursor-grabbing">
      <div className="flex min-h-6 items-center justify-between gap-2">
        <span className="text-n-ui-sm text-n-text-secondary">{task.id}</span>
        <span className="-my-1 -mr-1.5">{actions}</span>
      </div>
      {/* The title link covers the whole card, so a click anywhere opens the task. */}
      <a
        href={href({ name: 'task', id: task.id })}
        draggable={false}
        className="text-n-ui-medium text-n-text-primary no-underline outline-none after:absolute after:inset-0 after:rounded-n-lg focus-visible:shadow-none"
      >
        {task.title}
      </a>
      <LabelTags labels={task.labels} />
      <div className="flex min-h-6 items-center gap-3">
        <PriorityIcon priority={task.priority} />
        <DueDate due={task.due} done={task.status === 'Done'} />
        <span className="ml-auto"><Assignee member={memberById(task.assigneeId)} /></span>
      </div>
    </Card.Root>
  );
}
