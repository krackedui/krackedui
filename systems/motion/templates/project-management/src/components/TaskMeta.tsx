import { Avatar, Icon, StatusPill, Tag, cn } from '@krackedui/motion';
import { labelColor, priorityMeta, statusColor } from '../data/meta';
import type { Label, Member, Priority, Status } from '../data/types';
import { formatDue, isOverdue } from '../lib/dates';

/** Priority as a colored icon (with its name for assistive tech, and as text when `showLabel`). */
export function PriorityIcon({ priority, showLabel }: { priority: Priority; showLabel?: boolean }) {
  const m = priorityMeta[priority];
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon name={m.icon} size={16} label={showLabel ? undefined : `Priority: ${priority}`} className={m.className} />
      {showLabel && <span>{priority}</span>}
    </span>
  );
}

export function StatusLabel({ status }: { status: Status }) {
  return <StatusPill color={statusColor[status]}>{status}</StatusPill>;
}

export function LabelTags({ labels, size = 'sm' }: { labels: Label[]; size?: 'sm' | 'md' }) {
  if (!labels.length) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {labels.map((l) => <Tag key={l} size={size} color={labelColor[l]}>{l}</Tag>)}
    </span>
  );
}

/** Due date with a calendar icon; red when overdue. */
export function DueDate({ due, done }: { due: string | null; done: boolean }) {
  if (!due) return null;
  const overdue = isOverdue(due, done);
  return (
    <span className={cn('inline-flex items-center gap-1 text-n-ui-sm', overdue ? 'text-n-red-text-primary' : 'text-n-text-secondary')}>
      <Icon name="calendar" size={14} />
      <span>{overdue ? `Overdue · ${formatDue(due)}` : formatDue(due)}</span>
    </span>
  );
}

export function Assignee({ member, showName }: { member: Member | undefined; showName?: boolean }) {
  if (!member) return showName ? <span className="text-n-text-secondary">Unassigned</span> : null;
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Avatar name={member.name} shape="user" size="md" />
      {showName && <span className="truncate">{member.name}</span>}
    </span>
  );
}
