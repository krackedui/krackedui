import type { DatabaseData, Row } from './types';

/**
 * The captured sandbox database "Tasks" (DS Sandbox page): 5 properties, 8 rows, 7 views.
 * Today in the capture is 2026-10-15.
 */
export const SAMPLE_TODAY = '2026-10-15';

const rows: Row[] = [
  ['Design tokens audit', 'done', 'high', 'design', '2026-10-02'],
  ['Sidebar rebuild', 'progress', 'high', 'frontend', '2026-10-09'],
  ['Command palette', 'progress', 'medium', 'frontend', '2026-10-12'],
  ['Docs shell', 'todo', 'medium', 'docs', '2026-10-16'],
  ['Icon extraction', 'todo', 'low', 'design', '2026-10-20'],
  ['Database views', 'todo', 'high', 'frontend', '2026-10-23'],
  ['Screenshot diffing', 'done', 'low', 'qa', '2026-09-28'],
  ['Release notes', 'todo', 'low', 'docs', '2026-10-30'],
].map(([title, status, priority, team, due], i) => ({
  id: `r${i + 1}`,
  values: { title, status, priority, team: [team], due },
}));

/** Board/gallery/list in the capture show the rows newest-first (manual order). */
const newestFirst = rows.map((r) => r.id).reverse();

export function createTasksSample(): DatabaseData {
  return {
    collection: {
      id: 'tasks',
      name: 'Tasks',
      properties: [
        { id: 'title', name: 'Task', type: 'title' },
        {
          id: 'status', name: 'Status', type: 'status', options: [
            { id: 'todo', name: 'Not started', color: 'gray', group: 'todo' },
            { id: 'progress', name: 'In progress', color: 'blue', group: 'in_progress' },
            { id: 'done', name: 'Done', color: 'green', group: 'complete' },
          ],
        },
        {
          id: 'priority', name: 'Priority', type: 'select', options: [
            { id: 'low', name: 'Low', color: 'yellow' },
            { id: 'high', name: 'High', color: 'default' },
            { id: 'medium', name: 'Medium', color: 'pink' },
          ],
        },
        {
          id: 'team', name: 'Team', type: 'multi_select', options: [
            { id: 'design', name: 'Design', color: 'brown' },
            { id: 'frontend', name: 'Frontend', color: 'orange' },
            { id: 'docs', name: 'Docs', color: 'green' },
            { id: 'qa', name: 'QA', color: 'purple' },
          ],
        },
        { id: 'due', name: 'Due', type: 'date' },
      ],
    },
    rows: rows.map((r) => ({ ...r, values: { ...r.values } })),
    views: [
      { id: 'v-table', name: 'Table', type: 'table', filters: [], sorts: [], widths: { title: 280 } },
      { id: 'v-board', name: 'Board', type: 'board', filters: [], sorts: [], groupBy: 'status', order: newestFirst, visible: [] },
      { id: 'v-gallery', name: 'Gallery', type: 'gallery', filters: [], sorts: [], order: newestFirst, visible: [] },
      { id: 'v-list', name: 'List', type: 'list', filters: [], sorts: [], order: newestFirst, visible: ['status'] },
      { id: 'v-calendar', name: 'Calendar', type: 'calendar', filters: [], sorts: [], dateProperty: 'due', visible: [] },
      { id: 'v-timeline', name: 'Timeline', type: 'timeline', filters: [], sorts: [], dateProperty: 'due', order: newestFirst, visible: [] },
      { id: 'v-chart', name: 'Chart', type: 'chart', filters: [], sorts: [], chart: { locked: true, groupBy: 'status' } },
    ],
  };
}
