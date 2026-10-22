import { Avatar, Link } from '@krackedui/motion';
import type { ActivityEvent } from '../data/types';
import { formatWhen } from '../lib/dates';
import { href } from '../lib/router';
import { useStore } from '../state/store';

const verb: Record<ActivityEvent['kind'], string> = {
  created: 'created',
  moved: 'moved',
  commented: 'commented on',
  assigned: 'assigned',
  updated: 'updated',
};

function suffix(e: ActivityEvent): string {
  if (e.kind === 'moved' && e.detail) return ` to ${e.detail}`;
  if (e.kind === 'assigned' && e.detail) return ` to ${e.detail}`;
  return '';
}

/** One line of the activity feed: who did what to which task, and when. */
export function ActivityItem({ event, showTask = true }: { event: ActivityEvent; showTask?: boolean }) {
  const { memberById, taskById } = useStore();
  const actor = memberById(event.actorId);
  const task = taskById(event.taskId);
  return (
    <li className="flex gap-2.5 py-2">
      <Avatar name={actor?.name} shape="user" size="md" className="mt-px" />
      <div className="min-w-0 flex-1 text-n-ui">
        <p className="m-0 text-n-text-primary">
          <span className="font-medium">{actor?.name ?? 'Someone'}</span>{' '}
          <span className="text-n-text-secondary">{verb[event.kind]}</span>{' '}
          {showTask ? (
            task ? <Link href={href({ name: 'task', id: task.id })} variant="inline">{task.id} {task.title}</Link> : <span>{event.taskId}</span>
          ) : <span className="text-n-text-secondary">this task</span>}
          <span className="text-n-text-secondary">{suffix(event)}</span>
        </p>
        {event.kind === 'commented' && event.detail && <p className="m-0 mt-0.5 truncate text-n-text-secondary">“{event.detail}”</p>}
        <p className="m-0 mt-0.5 text-n-ui-sm text-n-text-secondary">{formatWhen(event.at)}</p>
      </div>
    </li>
  );
}
