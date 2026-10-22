import type { IconName, MotionColor } from '@krackedui/motion';
import type { Label, Priority, ProjectStatus, Status } from './types';

/** Display colors for statuses, priorities, labels and project health (Motion's named palette). */
export const statusColor: Record<Status, MotionColor> = {
  Backlog: 'gray',
  'To do': 'brown',
  'In progress': 'blue',
  'In review': 'purple',
  Done: 'green',
};

export const priorityMeta: Record<Priority, { icon: IconName; className: string }> = {
  Urgent: { icon: 'warning', className: 'text-n-red-icon-accent-primary' },
  High: { icon: 'arrowUp', className: 'text-n-orange-icon-accent-primary' },
  Medium: { icon: 'minus', className: 'text-n-yellow-icon-accent-primary' },
  Low: { icon: 'arrowDown', className: 'text-n-blue-icon-accent-primary' },
  None: { icon: 'dashFillSmall', className: 'text-n-icon-tertiary' },
};

export const labelColor: Record<Label, MotionColor> = {
  Design: 'purple',
  Frontend: 'blue',
  Backend: 'teal',
  Bug: 'red',
  Research: 'yellow',
  Content: 'pink',
  QA: 'green',
};

export const projectTone: Record<ProjectStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  'On track': 'success',
  'At risk': 'warning',
  'Off track': 'danger',
  Planned: 'neutral',
  Completed: 'info',
};
