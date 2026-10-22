// Domain model of the template. Everything the screens show is derived from these types.

export const STATUSES = ['Backlog', 'To do', 'In progress', 'In review', 'Done'] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITIES = ['Urgent', 'High', 'Medium', 'Low', 'None'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const LABELS = ['Design', 'Frontend', 'Backend', 'Bug', 'Research', 'Content', 'QA'] as const;
export type Label = (typeof LABELS)[number];

export type ProjectStatus = 'On track' | 'At risk' | 'Off track' | 'Planned' | 'Completed';
export const PROJECT_STATUSES: ProjectStatus[] = ['On track', 'At risk', 'Off track', 'Planned', 'Completed'];

export type Role = 'Owner' | 'Admin' | 'Member' | 'Guest';
export const ROLES: Role[] = ['Owner', 'Admin', 'Member', 'Guest'];

export interface Member {
  id: string;
  name: string;
  role: Role;
  title: string;
  email: string;
  initials: string;
}

export interface Project {
  /** Used in the URL: #/projects/<slug>. */
  slug: string;
  /** Task id prefix, e.g. "WEB". */
  key: string;
  name: string;
  emoji: string;
  description: string;
  status: ProjectStatus;
  leadId: string;
  /** ISO dates (yyyy-mm-dd). */
  start: string;
  target: string;
}

export interface Comment {
  id: string;
  authorId: string;
  /** ISO date-time. */
  at: string;
  text: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  projectSlug: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string | null;
  labels: Label[];
  /** ISO date or null. */
  due: string | null;
  estimate: number;
  created: string;
  updated: string;
  comments: Comment[];
  subtasks: Subtask[];
  /** Position inside its status column (lower first). */
  order: number;
}

export type ActivityKind = 'created' | 'moved' | 'commented' | 'assigned' | 'updated';

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  actorId: string;
  taskId: string;
  /** ISO date-time. */
  at: string;
  /** Extra detail: the new status, the assignee's name, the comment excerpt… */
  detail?: string;
}

export interface Workspace {
  name: string;
  emoji: string;
  /** The signed-in member. */
  meId: string;
}
