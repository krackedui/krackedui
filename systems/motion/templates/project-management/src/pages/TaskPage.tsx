import { Button } from '@krackedui/motion';
import { TaskDetail } from '../components/TaskDetail';
import { StatusLabel } from '../components/TaskMeta';
import type { Task } from '../data/types';
import { href } from '../lib/router';
import { useStore } from '../state/store';

/** The task detail as a full page (phones). */
export function TaskPage({ task }: { task: Task }) {
  const { projectBySlug } = useStore();
  const project = projectBySlug(task.projectSlug);
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-4 pb-16 pt-4">
      <div className="flex items-center gap-2 text-n-ui text-n-text-secondary">
        <Button asChild size="sm" icon="arrowLeft">
          <a href={href({ name: 'project', slug: task.projectSlug })}>{project?.name ?? 'Back'}</a>
        </Button>
        <span className="ml-auto">{task.id}</span>
        <StatusLabel status={task.status} />
      </div>
      <TaskDetail task={task} />
    </div>
  );
}
