import { useState } from 'react';
import { Badge, Button, IconButton, Popover } from '@krackedui/motion';
import { useStore } from '../state/store';
import { ActivityItem } from './ActivityItem';

/** Bell button with the latest activity on tasks assigned to me or created by others. */
export function NotificationsPopover() {
  const { activity, me, taskById } = useStore();
  const [seenCount, setSeenCount] = useState(0);
  const mine = activity.filter((e) => e.actorId !== me.id && (taskById(e.taskId)?.assigneeId === me.id || (e.kind === 'assigned' && e.detail === me.name)));
  const items = (mine.length ? mine : activity).slice(0, 6);
  const unread = Math.max(0, mine.length - seenCount);
  return (
    <Popover.Root onOpenChange={(open) => { if (open) setSeenCount(mine.length); }}>
      <span className="relative inline-flex">
        <Popover.Trigger asChild>
          <IconButton icon="bell" label={unread ? `Notifications, ${unread} unread` : 'Notifications'} />
        </Popover.Trigger>
        {unread > 0 && (
          <Badge variant="solid" tone="danger" aria-hidden className="pointer-events-none absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]">{unread}</Badge>
        )}
      </span>
      <Popover.Content width={360} align="end" aria-label="Notifications" className="p-0">
        <div className="flex items-center justify-between border-b border-n-border-primary px-3 py-2">
          <h2 className="m-0 text-n-ui-medium">Notifications</h2>
          <Popover.Close asChild><Button size="sm">Mark all read</Button></Popover.Close>
        </div>
        <ul className="m-0 list-none px-3 py-1">
          {items.map((e) => <ActivityItem key={e.id} event={e} />)}
        </ul>
      </Popover.Content>
    </Popover.Root>
  );
}
