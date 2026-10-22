import type { ReactNode } from 'react';
import { Card } from '@krackedui/motion';

interface PanelProps {
  title: string;
  description?: ReactNode;
  /** Controls at the right of the title (a SegmentedControl, a "View all" link). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A titled Card section of a dashboard: heading row with an optional control, then content. */
export function Panel({ title, description, action, children, className }: PanelProps) {
  return (
    <Card.Root className={className}>
      <Card.Header className="flex-row flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Card.Title asChild><h2>{title}</h2></Card.Title>
          {description && <Card.Description>{description}</Card.Description>}
        </div>
        {action}
      </Card.Header>
      <Card.Content className="flex min-w-0 flex-1 flex-col">{children}</Card.Content>
    </Card.Root>
  );
}
