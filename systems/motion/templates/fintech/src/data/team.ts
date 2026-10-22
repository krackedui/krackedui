import type { Role, TeamMember } from './types';

export const roles: Role[] = ['Owner', 'Admin', 'Bookkeeper', 'Viewer'];

export const initialTeam: TeamMember[] = [
  { id: 'u_1', name: 'Maya Chen', email: 'maya@lumencoffee.example', role: 'Owner', lastActive: 'Now' },
  { id: 'u_2', name: 'Diego Alvarez', email: 'diego@lumencoffee.example', role: 'Admin', lastActive: '2 hours ago' },
  { id: 'u_3', name: 'Priya Nair', email: 'priya@lumencoffee.example', role: 'Viewer', lastActive: 'Yesterday' },
  { id: 'u_4', name: 'Sam Okafor', email: 'sam@lumencoffee.example', role: 'Viewer', lastActive: '3 days ago' },
  { id: 'u_5', name: 'Hannah Brooks', email: 'hannah@ledgerworks.example', role: 'Bookkeeper', lastActive: 'Oct 14' },
];

/** People who can hold a company card (team plus staff without app access). */
export const cardholders = [...initialTeam.map((m) => m.name), 'Leo Martins', 'Ava Lindqvist', 'Tomás Reyes'];
