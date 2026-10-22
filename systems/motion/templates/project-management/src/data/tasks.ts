import type { Comment, Label, Priority, Status, Subtask, Task } from './types';

// Sample tasks. Each row: id, title, status, priority, assignee, labels, due, estimate, created, updated.
type Row = [string, string, Status, Priority, string | null, Label[], string | null, number, string, string];

const rows: Row[] = [
  // Website relaunch
  ['WEB-3', 'Audit the current site map and analytics', 'Done', 'Medium', 'm8', ['Research', 'Content'], '2026-09-18', 3, '2026-09-08', '2026-09-17'],
  ['WEB-4', 'Define the new information architecture', 'Done', 'High', 'm2', ['Design', 'Research'], '2026-09-30', 5, '2026-09-09', '2026-09-29'],
  ['WEB-5', 'Homepage hero: three layout directions', 'Done', 'High', 'm5', ['Design'], '2026-10-09', 5, '2026-09-21', '2026-10-08'],
  ['WEB-6', 'Set up the CMS content models', 'In review', 'High', 'm4', ['Backend'], '2026-10-20', 8, '2026-09-24', '2026-10-20'],
  ['WEB-7', 'Build the responsive navigation', 'In progress', 'Medium', 'm3', ['Frontend'], '2026-10-23', 5, '2026-09-28', '2026-10-21'],
  ['WEB-8', 'Write copy for the pricing page', 'In progress', 'Medium', 'm8', ['Content'], '2026-10-26', 3, '2026-10-01', '2026-10-19'],
  ['WEB-9', 'Footer links point to retired pages', 'To do', 'Urgent', 'm3', ['Bug', 'Frontend'], '2026-10-19', 1, '2026-10-14', '2026-10-16'],
  ['WEB-10', 'Migrate 140 blog posts to the CMS', 'To do', 'Medium', 'm4', ['Backend', 'Content'], '2026-11-06', 8, '2026-10-02', '2026-10-15'],
  ['WEB-11', 'Accessibility review of key templates', 'To do', 'High', 'm7', ['QA'], '2026-11-04', 3, '2026-10-05', '2026-10-12'],
  ['WEB-12', 'Design the pricing page', 'In progress', 'High', 'm1', ['Design', 'Frontend'], '2026-10-24', 5, '2026-10-06', '2026-10-21'],
  ['WEB-13', 'Image pipeline with responsive sizes', 'Backlog', 'Low', null, ['Frontend', 'Backend'], null, 5, '2026-10-07', '2026-10-07'],
  ['WEB-14', 'Contact form spam protection', 'Backlog', 'Medium', 'm4', ['Backend'], '2026-11-13', 2, '2026-10-08', '2026-10-08'],
  ['WEB-15', 'Case study page template', 'To do', 'Medium', 'm5', ['Design'], '2026-10-30', 3, '2026-10-09', '2026-10-14'],
  ['WEB-16', 'Redirect map for old URLs', 'Backlog', 'High', 'm4', ['Backend'], '2026-11-20', 2, '2026-10-12', '2026-10-12'],
  ['WEB-17', 'Launch checklist and rollback plan', 'Backlog', 'Medium', 'm1', ['Research'], '2026-11-25', 2, '2026-10-13', '2026-10-13'],
  ['WEB-18', 'Cookie banner layout shifts on load', 'In review', 'Low', 'm3', ['Bug', 'Frontend'], '2026-10-22', 1, '2026-10-15', '2026-10-20'],
  // Mobile app v2
  ['MOB-21', 'Offline sync: conflict resolution spec', 'Done', 'Urgent', 'm6', ['Research', 'Backend'], '2026-09-25', 5, '2026-08-26', '2026-09-24'],
  ['MOB-22', 'Local database schema for offline mode', 'Done', 'High', 'm4', ['Backend'], '2026-10-07', 8, '2026-09-01', '2026-10-06'],
  ['MOB-23', 'Onboarding: new welcome screens', 'In progress', 'High', 'm5', ['Design'], '2026-10-22', 5, '2026-09-14', '2026-10-20'],
  ['MOB-24', 'Push notification permissions flow', 'In progress', 'Medium', 'm6', ['Frontend'], '2026-10-28', 5, '2026-09-22', '2026-10-21'],
  ['MOB-25', 'Crash when rotating on the settings screen', 'In review', 'Urgent', 'm6', ['Bug'], '2026-10-20', 2, '2026-10-12', '2026-10-21'],
  ['MOB-26', 'Background refresh for the task list', 'To do', 'High', 'm4', ['Backend'], '2026-11-02', 5, '2026-09-29', '2026-10-10'],
  ['MOB-27', 'Usability test of the new onboarding', 'To do', 'Medium', 'm1', ['Research'], '2026-10-23', 3, '2026-10-01', '2026-10-15'],
  ['MOB-28', 'Dark mode contrast fixes', 'To do', 'Low', 'm5', ['Design', 'Bug'], '2026-11-09', 2, '2026-10-05', '2026-10-05'],
  ['MOB-29', 'Release notes for 2.0', 'Backlog', 'Low', 'm8', ['Content'], '2026-12-11', 1, '2026-10-06', '2026-10-06'],
  ['MOB-30', 'Regression suite on six devices', 'Backlog', 'High', 'm7', ['QA'], '2026-12-04', 8, '2026-10-08', '2026-10-08'],
  ['MOB-31', 'Login fails with long email addresses', 'To do', 'Urgent', 'm3', ['Bug', 'Frontend'], '2026-10-16', 1, '2026-10-13', '2026-10-17'],
  ['MOB-32', 'Analytics events for onboarding funnel', 'Backlog', 'Medium', null, ['Backend'], null, 3, '2026-10-14', '2026-10-14'],
  ['MOB-33', 'Haptics on swipe actions', 'Done', 'Low', 'm6', ['Frontend'], '2026-10-19', 1, '2026-10-02', '2026-10-19'],
  ['MOB-34', 'App store screenshots', 'Backlog', 'Medium', 'm2', ['Design', 'Content'], '2026-12-09', 3, '2026-10-16', '2026-10-16'],
  // Brand refresh
  ['BRD-2', 'Interview stakeholders about the brand', 'Done', 'High', 'm2', ['Research'], '2026-10-14', 3, '2026-10-05', '2026-10-14'],
  ['BRD-3', 'Moodboards: three directions', 'Done', 'Medium', 'm5', ['Design'], '2026-10-20', 3, '2026-10-06', '2026-10-20'],
  ['BRD-4', 'Logo lockups and clear space rules', 'In progress', 'High', 'm2', ['Design'], '2026-10-29', 5, '2026-10-12', '2026-10-21'],
  ['BRD-5', 'Color palette with accessible pairs', 'In progress', 'Medium', 'm5', ['Design', 'QA'], '2026-10-25', 3, '2026-10-12', '2026-10-20'],
  ['BRD-6', 'Type scale and font licensing', 'To do', 'Medium', 'm2', ['Design', 'Research'], '2026-11-05', 2, '2026-10-13', '2026-10-13'],
  ['BRD-7', 'Voice and tone guide', 'To do', 'Medium', 'm8', ['Content'], '2026-11-12', 5, '2026-10-14', '2026-10-14'],
  ['BRD-8', 'Slide and document templates', 'Backlog', 'Low', 'm5', ['Design'], '2026-12-02', 3, '2026-10-15', '2026-10-15'],
  ['BRD-9', 'Brand portal page on the new site', 'Backlog', 'Low', 'm3', ['Frontend'], '2026-12-16', 3, '2026-10-16', '2026-10-16'],
  ['BRD-10', 'Rollout plan for social channels', 'Backlog', 'None', 'm1', ['Content'], null, 2, '2026-10-19', '2026-10-19'],
  ['BRD-11', 'Merch and signage refresh quote', 'Backlog', 'None', null, ['Research'], null, 1, '2026-10-20', '2026-10-20'],
];

const prefixToProject: Record<string, string> = { WEB: 'website', MOB: 'mobile', BRD: 'brand' };

const why: Record<Label, string> = {
  Design: 'Start from the components we already have; anything new should be added to the shared library before it is used here. Share a first pass early so feedback arrives while changes are still cheap.',
  Frontend: 'It has to work from 320 px phones to wide desktops, with keyboard navigation and visible focus. Keep the bundle lean: no new dependencies without a quick discussion in the channel.',
  Backend: 'Document the data model in the project wiki and add a migration that can be rolled back. Anything that touches production data needs a dry run on staging first.',
  Bug: 'Reproduce it first and write down the exact steps, the device and the browser. Add a regression test with the fix so it does not come back.',
  Research: 'Summarise what we learned in a short note with links to the raw material, then list the decisions it supports and the open questions.',
  Content: 'Follow the voice and tone guide: short sentences, plain words, sentence case. Get a second pair of eyes on every page before it is published.',
  QA: 'Test with a screen reader and keyboard only, in light and dark mode, and at 200% zoom. File every issue as its own task with a screenshot.',
};

function describe(title: string, labels: Label[]): string {
  const intro = `${title}. This is part of the current milestone, so it should be ready for review before the due date.`;
  const body = labels.map((l) => why[l]).join('\n\n');
  return `${intro}\n\n${body}\n\nDefinition of done: reviewed by one teammate, linked from the project page, and demoed in the Friday review.`;
}

const commentPool: Omit<Comment, 'id' | 'at'>[] = [
  { authorId: 'm2', text: 'Looks good so far. Can we check the spacing on small screens before review?' },
  { authorId: 'm3', text: 'I pushed a first version to the preview branch, feedback welcome.' },
  { authorId: 'm7', text: 'Found two small issues while testing, both noted in the subtasks.' },
  { authorId: 'm1', text: 'Thanks! Let us keep the scope tight and ship this before the end of the week.' },
  { authorId: 'm5', text: 'Added the updated designs to the project files, with notes on the edge cases.' },
];

const subtaskPool = ['Write a short brief', 'First draft', 'Review with the team', 'Address feedback', 'Final check on mobile'];

function sample(index: number, created: string, updated: string, status: Status): { comments: Comment[]; subtasks: Subtask[] } {
  const nComments = index % 4 === 3 ? 0 : (index % 3) + 1;
  const comments = Array.from({ length: nComments }, (_, i) => {
    const c = commentPool[(index + i) % commentPool.length];
    return { id: `c${index}-${i}`, ...c, at: `${i === nComments - 1 ? updated : created}T${10 + i}:${i % 2 ? '45' : '15'}:00` };
  });
  const nSub = index % 5 === 4 ? 0 : 3 + (index % 3);
  const doneCount = status === 'Done' ? nSub : status === 'Backlog' || status === 'To do' ? 0 : Math.ceil(nSub / 2);
  const subtasks = Array.from({ length: nSub }, (_, i) => ({ id: `s${index}-${i}`, title: subtaskPool[i % subtaskPool.length], done: i < doneCount }));
  return { comments, subtasks };
}

/** The demo task (#/tasks/WEB-12) gets a fuller conversation and checklist. */
const featured: Record<string, Pick<Task, 'comments' | 'subtasks'>> = {
  'WEB-12': {
    subtasks: [
      { id: 'web12-1', title: 'Collect competitor pricing pages', done: true },
      { id: 'web12-2', title: 'Wireframe monthly / annual toggle', done: true },
      { id: 'web12-3', title: 'Plan comparison table', done: true },
      { id: 'web12-4', title: 'FAQ section copy review', done: false },
      { id: 'web12-5', title: 'Responsive pass at 320 px', done: false },
    ],
    comments: [
      { id: 'web12-c1', authorId: 'm2', at: '2026-10-15T17:30:00', text: 'Let us compare annual and monthly side by side.' },
      { id: 'web12-c2', authorId: 'm8', at: '2026-10-19T09:40:00', text: 'Plan descriptions are in the copy doc, one line each.' },
      { id: 'web12-c3', authorId: 'm3', at: '2026-10-21T09:42:00', text: 'Started on the build: the toggle and the table are on the preview branch.' },
    ],
  },
};

export const initialTasks: Task[] = rows.map(([id, title, status, priority, assigneeId, labels, due, estimate, created, updated], index) => ({
  id,
  projectSlug: prefixToProject[id.split('-')[0]],
  title,
  description: describe(title, labels),
  status,
  priority,
  assigneeId,
  labels,
  due,
  estimate,
  created,
  updated,
  order: index,
  ...sample(index, created, updated, status),
  ...featured[id],
}));
