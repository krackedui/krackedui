import { useMemo, useState } from 'react';
import { Button, ConfirmDialog, DataTable, Menu, Pagination, compareValues, type DataTableColumn, type DataTableSort } from '@krackedui/motion';
import { PRIORITIES, STATUSES, type Task } from '../data/types';
import { parseDay } from '../lib/dates';
import { href } from '../lib/router';
import { useStore } from '../state/store';
import { useTaskActions } from '../state/useTaskActions';
import { Assignee, DueDate, PriorityIcon, StatusLabel } from './TaskMeta';

const PAGE_SIZE = 10;

/** List view of a project: sortable table with selection and bulk actions (status, assignee, delete). */
export function TaskListView({ tasks }: { tasks: Task[] }) {
  const { members, memberById } = useStore();
  const { bulkUpdate, remove } = useTaskActions();
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const columns = useMemo<DataTableColumn<Task>[]>(() => [
    { key: 'id', header: 'ID', sortable: true, width: 88, sortValue: (t) => t.id, cell: (t) => <span className="text-n-text-secondary">{t.id}</span> },
    {
      key: 'title', header: 'Title', sortable: true,
      cell: (t) => <a href={href({ name: 'task', id: t.id })} className="font-medium text-n-text-primary no-underline hover:underline">{t.title}</a>,
    },
    { key: 'status', header: 'Status', sortable: true, width: 140, sortValue: (t) => STATUSES.indexOf(t.status), cell: (t) => <StatusLabel status={t.status} /> },
    { key: 'priority', header: 'Priority', sortable: true, width: 120, hideBelow: 'md', sortValue: (t) => PRIORITIES.indexOf(t.priority), cell: (t) => <PriorityIcon priority={t.priority} showLabel /> },
    { key: 'assignee', header: 'Assignee', sortable: true, width: 190, hideBelow: 'lg', sortValue: (t) => memberById(t.assigneeId)?.name, cell: (t) => <Assignee member={memberById(t.assigneeId)} showName /> },
    { key: 'due', header: 'Due', sortable: true, width: 150, hideBelow: 'sm', sortValue: (t) => (t.due ? parseDay(t.due) : null), cell: (t) => <DueDate due={t.due} done={t.status === 'Done'} /> },
  ], [memberById]);

  // Sort the whole list here so pagination slices the sorted rows.
  const sorted = useMemo(() => {
    if (!sort) return tasks;
    const col = columns.find((c) => c.key === sort.key);
    const value = (t: Task) => (col?.sortValue ? col.sortValue(t) : t.id);
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...tasks].sort((a, b) => compareValues(value(a), value(b)) * dir);
  }, [tasks, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const chosen = tasks.filter((t) => selected.includes(t.id));

  return (
    <div className="flex flex-col gap-3">
      <div role="toolbar" aria-label="Bulk actions" className="flex min-h-8 flex-wrap items-center gap-2">
        {chosen.length ? (
          <>
            <span className="text-n-ui text-n-text-secondary" aria-live="polite">{chosen.length} selected</span>
            <Menu.Root>
              <Menu.Trigger asChild><Button size="sm" variant="secondary" trailingIcon="chevronDown">Set status</Button></Menu.Trigger>
              <Menu.Content width={180}>
                {STATUSES.map((s) => <Menu.Item key={s} onSelect={() => bulkUpdate(chosen, { status: s }, `Status: ${s}`)}>{s}</Menu.Item>)}
              </Menu.Content>
            </Menu.Root>
            <Menu.Root>
              <Menu.Trigger asChild><Button size="sm" variant="secondary" trailingIcon="chevronDown">Set assignee</Button></Menu.Trigger>
              <Menu.Content width={220}>
                {members.map((m) => <Menu.Item key={m.id} onSelect={() => bulkUpdate(chosen, { assigneeId: m.id }, `Assignee: ${m.name}`)}>{m.name}</Menu.Item>)}
                <Menu.Separator />
                <Menu.Item onSelect={() => bulkUpdate(chosen, { assigneeId: null }, 'Unassigned')}>Unassigned</Menu.Item>
              </Menu.Content>
            </Menu.Root>
            <Button size="sm" variant="danger-ghost" icon="trash" onClick={() => setConfirmDelete(true)}>Delete</Button>
            <Button size="sm" onClick={() => setSelected([])}>Clear selection</Button>
          </>
        ) : <span className="text-n-ui text-n-text-secondary">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} · select rows for bulk actions</span>}
      </div>
      <DataTable
        label="Tasks"
        columns={columns}
        rows={rows}
        sort={sort}
        onSortChange={(s) => { setSort(s); setPage(1); }}
        selectedIds={selected}
        onSelectedIdsChange={setSelected}
        getRowLabel={(t) => `${t.id} ${t.title}`}
      />
      {pageCount > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-n-ui-sm text-n-text-secondary">
            {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <Pagination page={current} pageCount={pageCount} onPageChange={setPage} label="Task pages" />
        </div>
      )}
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${chosen.length} ${chosen.length === 1 ? 'task' : 'tasks'}?`}
        description="They are removed from the project. You can undo right after."
        confirmLabel="Delete"
        onConfirm={() => { remove(chosen.map((t) => t.id)); setSelected([]); }}
      />
    </div>
  );
}
