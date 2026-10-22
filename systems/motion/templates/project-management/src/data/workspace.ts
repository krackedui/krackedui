import type { Member, Project, Workspace } from './types';

/** "Today" is fixed so the sample data (due dates, overdue counts, the timeline marker) never drifts. */
export const TODAY = '2026-10-21';

export const workspace: Workspace = { name: 'Northwind Studio', emoji: '🧭', meId: 'm1' };

export const members: Member[] = [
  { id: 'm1', name: 'Maya Okafor', initials: 'MO', role: 'Owner', title: 'Product lead', email: 'maya@northwind.example' },
  { id: 'm2', name: 'Lucas Brennan', initials: 'LB', role: 'Admin', title: 'Design lead', email: 'lucas@northwind.example' },
  { id: 'm3', name: 'Priya Raman', initials: 'PR', role: 'Member', title: 'Frontend engineer', email: 'priya@northwind.example' },
  { id: 'm4', name: 'Tomás Alvarez', initials: 'TA', role: 'Member', title: 'Backend engineer', email: 'tomas@northwind.example' },
  { id: 'm5', name: 'Hana Sato', initials: 'HS', role: 'Member', title: 'Product designer', email: 'hana@northwind.example' },
  { id: 'm6', name: 'Jonah Whitfield', initials: 'JW', role: 'Admin', title: 'Mobile engineer', email: 'jonah@northwind.example' },
  { id: 'm7', name: 'Amara Nwosu', initials: 'AN', role: 'Member', title: 'QA engineer', email: 'amara@northwind.example' },
  { id: 'm8', name: 'Elise Moreau', initials: 'EM', role: 'Guest', title: 'Content strategist', email: 'elise@northwind.example' },
];

export const projects: Project[] = [
  {
    slug: 'website',
    key: 'WEB',
    name: 'Website relaunch',
    emoji: '🌐',
    description: 'New marketing site: information architecture, design system, CMS migration and launch.',
    status: 'On track',
    leadId: 'm2',
    start: '2026-09-07',
    target: '2026-11-27',
  },
  {
    slug: 'mobile',
    key: 'MOB',
    name: 'Mobile app v2',
    emoji: '📱',
    description: 'Offline mode, a rebuilt onboarding and push notifications for the iOS and Android apps.',
    status: 'At risk',
    leadId: 'm6',
    start: '2026-08-24',
    target: '2026-12-18',
  },
  {
    slug: 'brand',
    key: 'BRD',
    name: 'Brand refresh',
    emoji: '🎨',
    description: 'Updated logo lockups, color and type system, and templates for every team.',
    status: 'Planned',
    leadId: 'm5',
    start: '2026-10-05',
    target: '2027-01-15',
  },
];
