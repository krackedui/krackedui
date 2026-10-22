import { Sheet } from '@krackedui/motion';
import type { Task } from '../data/types';
import { useStore } from '../state/store';
import { TaskDetail } from './TaskDetail';
import { StatusLabel } from './TaskMeta';

/** The task detail in a right-hand sheet over the board (desktop). Closing returns to the board URL. */
export function TaskSheet({ task, onClose }: { task: Task; onClose: () => void }) {
  const { projectBySlug } = useStore();
  const project = projectBySlug(task.projectSlug);
  return (
    <Sheet.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Sheet.Content side="right" size="lg" aria-describedby={undefined} closeLabel="Close task"
        // Focus the panel, not the editable title, so it opens scrolled to the top without a focus ring on the title.
        onOpenAutoFocus={(e) => { e.preventDefault(); if (e.currentTarget instanceof HTMLElement) e.currentTarget.focus(); }}
      >
        <div className="flex items-center gap-2 pr-8 text-n-ui text-n-text-secondary">
          <Sheet.Title className="pr-0 text-n-ui font-medium text-n-text-secondary">{task.id}</Sheet.Title>
          <span aria-hidden>·</span>
          <span className="truncate">{project?.emoji} {project?.name}</span>
          <span className="ml-auto"><StatusLabel status={task.status} /></span>
        </div>
        <TaskDetail task={task} />
      </Sheet.Content>
    </Sheet.Root>
  );
}
