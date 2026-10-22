import { Button, DataTable, Progress, type DataTableColumn } from '@krackedui/motion';
import { Assignee } from '../components/TaskMeta';
import { ScreenLayout } from '../components/ScreenLayout';
import type { Member } from '../data/types';
import { isOverdue } from '../lib/dates';
import { useStore } from '../state/store';

interface Row {
  id: string;
  member: Member;
  open: number;
  inProgress: number;
  overdue: number;
  done: number;
  /** Open tasks vs the busiest teammate, 0–100. */
  load: number;
}

/** Members with their workload. */
export function TeamPage({ onInvite }: { onInvite: () => void }) {
  const { members, tasks } = useStore();
  const counts = members.map((m) => {
    const theirs = tasks.filter((t) => t.assigneeId === m.id);
    const open = theirs.filter((t) => t.status !== 'Done');
    return {
      id: m.id, member: m, open: open.length,
      inProgress: theirs.filter((t) => t.status === 'In progress' || t.status === 'In review').length,
      overdue: open.filter((t) => isOverdue(t.due, false)).length,
      done: theirs.length - open.length,
    };
  });
  const busiest = Math.max(1, ...counts.map((c) => c.open));
  const rows: Row[] = counts.map((c) => ({ ...c, load: Math.round((c.open / busiest) * 100) }));

  const columns: DataTableColumn<Row>[] = [
    {
      key: 'name', header: 'Member', sortable: true, sortValue: (r) => r.member.name,
      cell: (r) => (
        <span className="flex min-w-0 flex-col">
          <Assignee member={r.member} showName />
          <span className="truncate pl-8 text-n-ui-sm text-n-text-secondary">{r.member.email}</span>
        </span>
      ),
    },
    { key: 'role', header: 'Role', sortable: true, width: 110, hideBelow: 'sm', sortValue: (r) => r.member.role, cell: (r) => <span>{r.member.role}<span className="block text-n-ui-sm text-n-text-secondary">{r.member.title}</span></span> },
    { key: 'open', header: 'Open', sortable: true, align: 'end', width: 80 },
    { key: 'inProgress', header: 'Active', sortable: true, align: 'end', width: 80, hideBelow: 'md' },
    { key: 'overdue', header: 'Overdue', sortable: true, align: 'end', width: 90, hideBelow: 'md', cell: (r) => <span className={r.overdue ? 'font-medium text-n-red-text-primary' : undefined}>{r.overdue}</span> },
    { key: 'done', header: 'Done', sortable: true, align: 'end', width: 80, hideBelow: 'lg' },
    {
      key: 'load', header: 'Workload', sortable: true, width: 180, hideBelow: 'sm',
      cell: (r) => <Progress value={r.load} size="sm" aria-label={`${r.member.name} workload`} valueText={`${r.open} open tasks`} tone={r.load > 80 ? 'warning' : 'accent'} />,
    },
  ];

  return (
    <ScreenLayout
      title="Team"
      description={`${members.length} members in Northwind Studio`}
      actions={<Button variant="primary" icon="inviteMember" onClick={onInvite}>Invite member</Button>}
    >
      <DataTable label="Team members" columns={columns} rows={rows} defaultSort={{ key: 'open', direction: 'desc' }} />
    </ScreenLayout>
  );
}
