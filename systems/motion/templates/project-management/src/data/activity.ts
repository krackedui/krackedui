import type { ActivityEvent } from './types';

/** Recent activity across the workspace, newest first. */
export const initialActivity: ActivityEvent[] = [
  { id: 'a1', kind: 'moved', actorId: 'm3', taskId: 'WEB-12', at: '2026-10-21T09:42:00', detail: 'In progress' },
  { id: 'a2', kind: 'commented', actorId: 'm6', taskId: 'MOB-25', at: '2026-10-21T09:15:00', detail: 'Fix is on the release branch, ready for QA.' },
  { id: 'a3', kind: 'moved', actorId: 'm2', taskId: 'BRD-4', at: '2026-10-21T08:50:00', detail: 'In progress' },
  { id: 'a4', kind: 'assigned', actorId: 'm1', taskId: 'WEB-7', at: '2026-10-21T08:30:00', detail: 'Priya Raman' },
  { id: 'a5', kind: 'moved', actorId: 'm4', taskId: 'WEB-6', at: '2026-10-20T17:05:00', detail: 'In review' },
  { id: 'a6', kind: 'commented', actorId: 'm5', taskId: 'MOB-23', at: '2026-10-20T16:20:00', detail: 'Uploaded the revised welcome screens.' },
  { id: 'a7', kind: 'moved', actorId: 'm5', taskId: 'BRD-3', at: '2026-10-20T15:10:00', detail: 'Done' },
  { id: 'a8', kind: 'created', actorId: 'm1', taskId: 'BRD-11', at: '2026-10-20T11:00:00' },
  { id: 'a9', kind: 'moved', actorId: 'm3', taskId: 'WEB-18', at: '2026-10-20T10:35:00', detail: 'In review' },
  { id: 'a10', kind: 'assigned', actorId: 'm2', taskId: 'BRD-5', at: '2026-10-20T09:40:00', detail: 'Hana Sato' },
  { id: 'a11', kind: 'commented', actorId: 'm7', taskId: 'WEB-11', at: '2026-10-19T16:45:00', detail: 'I will start with the navigation and the forms.' },
  { id: 'a12', kind: 'moved', actorId: 'm6', taskId: 'MOB-33', at: '2026-10-19T14:00:00', detail: 'Done' },
  { id: 'a13', kind: 'created', actorId: 'm2', taskId: 'BRD-10', at: '2026-10-19T10:20:00' },
  { id: 'a14', kind: 'commented', actorId: 'm8', taskId: 'WEB-8', at: '2026-10-19T09:30:00', detail: 'First draft of the plan comparison is in the doc.' },
  { id: 'a15', kind: 'assigned', actorId: 'm6', taskId: 'MOB-31', at: '2026-10-17T15:00:00', detail: 'Priya Raman' },
  { id: 'a16', kind: 'moved', actorId: 'm8', taskId: 'WEB-8', at: '2026-10-16T13:25:00', detail: 'In progress' },
  { id: 'a17', kind: 'created', actorId: 'm2', taskId: 'MOB-34', at: '2026-10-16T11:10:00' },
  { id: 'a18', kind: 'commented', actorId: 'm2', taskId: 'WEB-12', at: '2026-10-15T17:30:00', detail: 'Let us compare annual and monthly side by side.' },
  { id: 'a19', kind: 'moved', actorId: 'm2', taskId: 'BRD-2', at: '2026-10-14T16:00:00', detail: 'Done' },
  { id: 'a20', kind: 'created', actorId: 'm3', taskId: 'WEB-18', at: '2026-10-15T09:05:00' },
];
