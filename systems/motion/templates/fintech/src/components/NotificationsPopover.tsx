import { useMemo } from 'react';
import { Badge, Icon, IconButton, Popover } from '@krackedui/motion';
import { useStore } from '../state/store';
import { deriveAlerts } from '../lib/alerts';
import { href } from '../lib/router';

const toneIcon = { warning: 'text-n-orange-icon-accent-primary', danger: 'text-n-red-icon-accent-primary', info: 'text-n-blue-icon-accent-primary' } as const;

export function NotificationsPopover() {
  const { state } = useStore();
  const alerts = useMemo(() => deriveAlerts(state), [state]);
  return (
    <Popover.Root>
      <div className="relative">
        <Popover.Trigger asChild>
          <IconButton icon="bell" label={`Notifications, ${alerts.length} unread`} />
        </Popover.Trigger>
        {alerts.length > 0 && (
          <Badge variant="solid" tone="danger" aria-hidden className="pointer-events-none absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]">
            {alerts.length}
          </Badge>
        )}
      </div>
      <Popover.Content width={340} align="end" aria-label="Notifications">
        <div className="flex items-center justify-between border-b border-n-border-primary px-3 py-2">
          <h2 className="text-n-ui-medium text-n-text-primary">Notifications</h2>
          <span className="text-n-ui-sm text-n-text-secondary">{alerts.length} new</span>
        </div>
        <ul className="flex flex-col p-1">
          {alerts.map((a) => (
            <li key={a.id}>
              <Popover.Close asChild>
                <a
                  href={href(a.route)}
                  className="flex gap-2.5 rounded-n-md px-2 py-2 no-underline outline-none hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow"
                >
                  <Icon name={a.icon} size={18} className={`mt-px shrink-0 ${toneIcon[a.tone]}`} />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-n-ui-medium text-n-text-primary">{a.title}</span>
                    <span className="text-n-ui-sm text-n-text-secondary">{a.description}</span>
                  </span>
                </a>
              </Popover.Close>
            </li>
          ))}
          {alerts.length === 0 && <li className="px-2 py-6 text-center text-n-ui text-n-text-secondary">You're all caught up.</li>}
        </ul>
      </Popover.Content>
    </Popover.Root>
  );
}
