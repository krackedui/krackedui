/*
 * Northwind Studio's work. Generated deterministically from a fixed seed and a fixed "today", so
 * every render, machine and screenshot agrees. No network calls, no random values at render.
 */

export type Status = 'Backlog' | 'To do' | 'In progress' | 'In review' | 'Done';
export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low' | 'None';

export const STATUSES: Status[] = ['Backlog', 'To do', 'In progress', 'In review', 'Done'];
export const PRIORITIES: Priority[] = ['Urgent', 'High', 'Medium', 'Low', 'None'];
export const LABELS = ['Design', 'Frontend', 'Backend', 'Bug', 'Research', 'Copy'] as const;
export type Label = (typeof LABELS)[number];

export interface Member {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface Comment {
  id: string;
  author: string;
  date: string;
  text: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string;
  labels: Label[];
  due: string;
  estimate: number;
  created: string;
  updated: string;
  comments: Comment[];
  subtasks: Subtask[];
}

export interface Project {
  id: string;
  key: string;
  name: string;
  status: 'On track' | 'At risk' | 'Paused';
  lead: string;
  start: string;
  target: string;
  progress: number;
}

export const workspace = { name: 'Northwind Studio' };

export const members: Member[] = [
  { id: 'm1', name: 'Ada Okonjo', role: 'Design lead', email: 'ada@northwind.studio' },
  { id: 'm2', name: 'Bram de Vries', role: 'Frontend', email: 'bram@northwind.studio' },
  { id: 'm3', name: 'Chen Wei', role: 'Backend', email: 'chen@northwind.studio' },
  { id: 'm4', name: 'Dalia Haddad', role: 'Product', email: 'dalia@northwind.studio' },
  { id: 'm5', name: 'Eero Nieminen', role: 'Frontend', email: 'eero@northwind.studio' },
  { id: 'm6', name: 'Farah Sadiq', role: 'Research', email: 'farah@northwind.studio' },
  { id: 'm7', name: 'Giorgio Rossi', role: 'Design', email: 'giorgio@northwind.studio' },
  { id: 'm8', name: 'Hana Takumi', role: 'Engineering lead', email: 'hana@northwind.studio' },
];

const TODAY = new Date(2026, 9, 23);
export const today = () => TODAY;
const shift = (n: number) => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + n);
export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseDay = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const projects: Project[] = [
  { id: 'website', key: 'WEB', name: 'Website relaunch', status: 'On track', lead: 'Ada Okonjo', start: isoDay(shift(-60)), target: isoDay(shift(24)), progress: 62 },
  { id: 'mobile', key: 'MOB', name: 'Mobile app v2', status: 'At risk', lead: 'Hana Takumi', start: isoDay(shift(-40)), target: isoDay(shift(51)), progress: 34 },
  { id: 'brand', key: 'BRD', name: 'Brand refresh', status: 'Paused', lead: 'Giorgio Rossi', start: isoDay(shift(-90)), target: isoDay(shift(10)), progress: 80 },
];

function sequence(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1_664_525 + 1_013_904_223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

const TITLES = [
  'Rebuild the pricing page', 'Audit colour contrast', 'Ship the new nav', 'Write the migration guide',
  'Fix the sticky header on iOS', 'Interview five customers', 'Replace the icon set', 'Cache the search index',
  'Draft the launch copy', 'Measure first paint', 'Tidy the design tokens', 'Remove the legacy endpoint',
  'Add empty states', 'Trim the bundle', 'Document the API', 'Fix the date picker on Safari',
];

export const tasks: Task[] = (() => {
  const rnd = sequence(10_231);
  const out: Task[] = [];
  let n = 10;
  for (const project of projects) {
    const count = project.id === 'website' ? 18 : project.id === 'mobile' ? 14 : 8;
    for (let i = 0; i < count; i++) {
      const status = STATUSES[Math.floor(rnd() * STATUSES.length)];
      const assignee = members[Math.floor(rnd() * members.length)].name;
      const labelCount = 1 + Math.floor(rnd() * 2);
      const labels = Array.from({ length: labelCount }, () => LABELS[Math.floor(rnd() * LABELS.length)]);
      const subtaskCount = Math.floor(rnd() * 4);
      out.push({
        id: `${project.key}-${n++}`,
        projectId: project.id,
        title: TITLES[Math.floor(rnd() * TITLES.length)],
        description:
          'The current version was written before the design system existed, so it carries its own spacing, its own type scale and three shades of grey that are in no palette.\n\nBring it onto the system, keep the copy, and note anything the system turns out to be missing.',
        status,
        priority: PRIORITIES[Math.floor(rnd() * PRIORITIES.length)],
        assignee,
        labels: [...new Set(labels)],
        due: isoDay(shift(Math.floor(rnd() * 40) - 12)),
        estimate: [1, 2, 3, 5, 8][Math.floor(rnd() * 5)],
        created: isoDay(shift(-Math.floor(rnd() * 50) - 5)),
        updated: isoDay(shift(-Math.floor(rnd() * 5))),
        comments:
          rnd() > 0.5
            ? [
                { id: 'c1', author: 'Dalia Haddad', date: isoDay(shift(-3)), text: 'Can we keep the old URL working for a release?' },
                { id: 'c2', author: assignee, date: isoDay(shift(-1)), text: 'Yes — redirect in place, removed next minor.' },
              ]
            : [],
        subtasks: Array.from({ length: subtaskCount }, (_, s) => ({
          id: `s${s}`,
          title: ['Spec it', 'Build it', 'Review it', 'Ship it'][s],
          done: rnd() > 0.5,
        })),
      });
    }
  }
  return out;
})();

export interface Activity {
  id: string;
  who: string;
  what: string;
  taskId: string;
  when: string;
}

export const activity: Activity[] = (() => {
  const rnd = sequence(4_404);
  const verbs = ['created', 'moved to In progress', 'commented on', 'was assigned', 'moved to Done'];
  return Array.from({ length: 20 }, (_, i) => {
    const task = tasks[Math.floor(rnd() * tasks.length)];
    return {
      id: `a${i}`,
      who: members[Math.floor(rnd() * members.length)].name,
      what: verbs[Math.floor(rnd() * verbs.length)],
      taskId: task.id,
      when: isoDay(shift(-Math.floor(rnd() * 7))),
    };
  });
})();

/** The signed-in person, so "my work" means something. */
export const me = members[1];
