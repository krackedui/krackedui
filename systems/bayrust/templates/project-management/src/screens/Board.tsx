import { useEffect, useMemo, useState } from 'react';
import {
  Avatar, Badge, Button, CardContent, CardRoot, Checkbox, Combobox, ConfirmDialog, ContextMenu,
  DataTable, DatePicker, EmptyState, Field, Icon, Kbd, Menu, PageHeader, Progress, SearchInput,
  SegmentedControl, Select, Sheet, Skeleton, Stack, Tag, Textarea, TextInput, Tooltip, useToast,
} from '@krackedui/bayrust';
import { LABELS, PRIORITIES, STATUSES, members, parseDay, type Label, type Priority, type Project, type Status, type Task } from '../data';
import { day, due, initials } from '../format';
import { go } from '../router';
import type { useTasks } from '../store';

const PRIORITY_ICON: Record<Priority, 'arrowUp' | 'arrowDown' | 'more' | 'warning'> = {
  Urgent: 'warning', High: 'arrowUp', Medium: 'more', Low: 'arrowDown', None: 'more',
};
const STATUS_TONE: Record<Status, 'neutral' | 'info' | 'accent' | 'warning' | 'success'> = {
  Backlog: 'neutral', 'To do': 'info', 'In progress': 'accent', 'In review': 'warning', Done: 'success',
};

interface Props {
  store: ReturnType<typeof useTasks>;
  project: Project;
  openTaskId?: string;
}

export function Board({ store, project, openTaskId }: Props) {
  const { toast } = useToast();
  const [view, setView] = useState('board');
  const [assignee, setAssignee] = useState('');
  const [label, setLabel] = useState('');
  const [priority, setPriority] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [adding, setAdding] = useState<Status | null>(null);
  const [draft, setDraft] = useState('');
  const [dragging, setDragging] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const tasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.tasks.filter((t) => {
      if (t.projectId !== project.id) return false;
      if (assignee && t.assignee !== assignee) return false;
      if (label && !t.labels.includes(label as Label)) return false;
      if (priority && t.priority !== priority) return false;
      if (q && !`${t.title} ${t.id}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [store.tasks, project.id, assignee, label, priority, query]);

  const open = openTaskId ? store.tasks.find((t) => t.id === openTaskId) : undefined;
  const filtersOn = Boolean(assignee || label || priority || query);
  const clear = () => { setAssignee(''); setLabel(''); setPriority(''); setQuery(''); };

  const moveTo = (task: Task, status: Status) => {
    const from = task.status;
    store.move(task.id, status);
    toast({
      message: `${task.id} moved to ${status}`,
      tone: 'success',
      action: { label: 'Undo', onClick: () => store.move(task.id, from) },
    });
  };

  const quickAdd = (status: Status) => {
    if (!draft.trim()) return;
    store.add(
      {
        projectId: project.id, title: draft.trim(), description: '', status, priority: 'Medium',
        assignee: members[0].name, labels: [], due: '', estimate: 2, created: '', updated: '',
        comments: [], subtasks: [],
      },
      project.key,
    );
    toast({ message: 'Task created', description: draft.trim(), tone: 'success' });
    setDraft('');
    setAdding(null);
  };

  return (
    <>
      <PageHeader
        title={project.name}
        description={`${tasks.length} tasks · lead ${project.lead}`}
        actions={
          <SegmentedControl
            aria-label="View"
            value={view}
            onValueChange={setView}
            size="sm"
            options={[{ value: 'board', label: 'Board' }, { value: 'list', label: 'List' }]}
          />
        }
      />

      <Stack gap={10}>
        <Stack direction={{ base: 'column', md: 'row' }} gap={8} align="start">
          <Combobox
            label="Assignee"
            placeholder="Anyone"
            value={assignee}
            onValueChange={setAssignee}
            options={[{ value: '', label: 'Anyone' }, ...members.map((m) => ({ value: m.name, label: m.name, description: m.role }))]}
          />
          <Select
            aria-label="Label"
            value={label}
            onValueChange={setLabel}
            options={[{ value: '', label: 'Any label' }, ...LABELS.map((l) => ({ value: l, label: l }))]}
          />
          <Select
            aria-label="Priority"
            value={priority}
            onValueChange={setPriority}
            options={[{ value: '', label: 'Any priority' }, ...PRIORITIES.map((p) => ({ value: p, label: p }))]}
          />
          <SearchInput aria-label="Search tasks" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery('')} />
          {filtersOn && <Button size="sm" onClick={clear}>Clear filters</Button>}
        </Stack>

        {loading ? (
          <Stack direction="row" gap={10}>
            {STATUSES.map((s) => (
              <div key={s} style={{ flex: 1 }}>
                <Skeleton height={120} />
              </div>
            ))}
          </Stack>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon="board"
            title={filtersOn ? 'No tasks match' : 'Nothing here yet'}
            description={filtersOn ? 'Clear a filter to see the rest.' : 'Add the first task to this project.'}
            action={filtersOn ? <Button onClick={clear}>Clear filters</Button> : undefined}
          />
        ) : view === 'list' ? (
          <>
            {selected.length > 0 && (
              <Stack direction="row" gap={8} align="center">
                <span>{selected.length} selected</span>
                <Select
                  aria-label="Change status"
                  value=""
                  onValueChange={(s) => {
                    selected.forEach((id) => store.move(id, s as Status));
                    toast({ message: `${selected.length} tasks moved to ${s}`, tone: 'success' });
                    setSelected([]);
                  }}
                  options={[{ value: '', label: 'Change status…' }, ...STATUSES.map((s) => ({ value: s, label: s }))]}
                />
                <Button size="sm" variant="danger" icon="trash" onClick={() => setDeleting(true)}>
                  Delete
                </Button>
              </Stack>
            )}
            <DataTable
              rows={tasks}
              getRowId={(t) => t.id}
              selectedIds={selected}
              onSelectedIdsChange={setSelected}
              onRowClick={(t) => go(`/tasks/${t.id}`)}
              columns={[
                { key: 'id', header: 'ID', hideBelow: 'sm' },
                { key: 'title', header: 'Title' },
                { key: 'status', header: 'Status', cell: (t) => <Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge> },
                { key: 'assignee', header: 'Assignee', hideBelow: 'md' },
                { key: 'priority', header: 'Priority', hideBelow: 'md' },
                { key: 'due', header: 'Due', hideBelow: 'sm', cell: (t) => (t.due ? day(t.due) : '—') },
              ]}
            />
          </>
        ) : (
          // The columns hold focusable cards and buttons, which is what makes this scroll region
          // reachable without a pointer; a tabIndex on the container would be the wrong tool.
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {STATUSES.map((status) => {
              const column = tasks.filter((t) => t.status === status);
              return (
                <section
                  key={status}
                  aria-label={`${status} (${column.length})`}
                  style={{ flex: '0 0 230px', minWidth: 0 }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    const task = store.tasks.find((t) => t.id === dragging);
                    if (task && task.status !== status) moveTo(task, status);
                    setDragging(null);
                  }}
                >
                  <Stack direction="row" justify="between" align="center">
                    <strong>{status}</strong>
                    <Badge tone="neutral">{column.length}</Badge>
                  </Stack>
                  <Stack gap={6}>
                    {column.map((task) => {
                      const d = task.due ? due(task.due) : null;
                      return (
                        <ContextMenu.Root key={task.id}>
                          <ContextMenu.Trigger>
                            <CardRoot
                              interactive
                              draggable
                              onDragStart={() => setDragging(task.id)}
                              onDragEnd={() => setDragging(null)}
                              onClick={() => go(`/tasks/${task.id}`)}
                            >
                              <CardContent>
                                <Stack gap={6}>
                                  <Stack direction="row" justify="between" align="center">
                                    <span>{task.id}</span>
                                    <Tooltip content={`Priority: ${task.priority}`}>
                                      <Icon name={PRIORITY_ICON[task.priority]} size={13} />
                                    </Tooltip>
                                  </Stack>
                                  <span>{task.title}</span>
                                  <Stack direction="row" gap={4} wrap>
                                    {task.labels.map((l) => (
                                      <Tag key={l} size="sm" color="blue">
                                        {l}
                                      </Tag>
                                    ))}
                                  </Stack>
                                  <Stack direction="row" justify="between" align="center">
                                    <Avatar name={task.assignee} size="xs" />
                                    {d && <Badge tone={d.overdue ? 'danger' : d.soon ? 'warning' : 'neutral'}>{d.text}</Badge>}
                                  </Stack>
                                </Stack>
                              </CardContent>
                            </CardRoot>
                          </ContextMenu.Trigger>
                          <ContextMenu.Content>
                            <ContextMenu.Label>Move to</ContextMenu.Label>
                            {STATUSES.filter((s) => s !== task.status).map((s) => (
                              <ContextMenu.Item key={s} onClick={() => moveTo(task, s)}>
                                {s}
                              </ContextMenu.Item>
                            ))}
                            <ContextMenu.Separator />
                            <ContextMenu.Item icon="edit" onClick={() => go(`/tasks/${task.id}`)}>
                              Open
                            </ContextMenu.Item>
                          </ContextMenu.Content>
                        </ContextMenu.Root>
                      );
                    })}

                    {adding === status ? (
                      <Stack gap={4}>
                        <TextInput
                          autoFocus
                          aria-label={`New task in ${status}`}
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') quickAdd(status);
                            if (e.key === 'Escape') { setAdding(null); setDraft(''); }
                          }}
                          placeholder="What needs doing?"
                        />
                        <Stack direction="row" gap={4}>
                          <Button size="sm" variant="primary" onClick={() => quickAdd(status)}>Add</Button>
                          <Button size="sm" onClick={() => { setAdding(null); setDraft(''); }}>Cancel</Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Button size="sm" variant="ghost" icon="plus" onClick={() => setAdding(status)}>
                        Add task
                      </Button>
                    )}
                  </Stack>
                </section>
              );
            })}
          </div>
        )}

        <Stack direction="row" gap={6} align="center">
          <Kbd>⌘K</Kbd>
          <span>to jump to a task, or right-click a card to move it without a mouse drag.</span>
        </Stack>
      </Stack>

      <TaskSheet task={open} store={store} />

      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={`Delete ${selected.length} tasks?`}
        description="They are removed from the board. This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          store.remove(selected);
          toast({ message: `${selected.length} tasks deleted`, tone: 'neutral' });
          setSelected([]);
          setDeleting(false);
        }}
      />
    </>
  );
}

function TaskSheet({ task, store }: { task?: Task; store: ReturnType<typeof useTasks> }) {
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  if (!task) return null;
  const done = task.subtasks.filter((s) => s.done).length;

  return (
    <Sheet.Root open onOpenChange={(v) => !v && go(`/projects/${task.projectId}`)}>
      <Sheet.Content side="right" size="lg">
        <Sheet.Title>{task.title}</Sheet.Title>
        <Sheet.Description>
          {task.id} · created {task.created ? day(task.created) : '—'}
        </Sheet.Description>
        <Stack gap={12}>
          <Stack direction={{ base: 'column', sm: 'row' }} gap={8}>
            <Field label="Status">
              <Select
                aria-label="Status"
                value={task.status}
                onValueChange={(s) => store.move(task.id, s as Status)}
                options={STATUSES.map((s) => ({ value: s, label: s }))}
              />
            </Field>
            <Field label="Assignee">
              <Combobox
                label="Assignee"
                value={task.assignee}
                onValueChange={(assignee) => {
                  store.update(task.id, { assignee });
                  toast({ message: `Assigned to ${assignee}`, tone: 'success' });
                }}
                options={members.map((m) => ({ value: m.name, label: m.name, description: m.role }))}
              />
            </Field>
            <Field label="Due">
              <DatePicker
                label="Due date"
                value={task.due ? parseDay(task.due) : null}
                onValueChange={(d) => {
                  store.update(task.id, { due: d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : '' });
                  toast({ message: 'Due date updated', tone: 'success' });
                }}
              />
            </Field>
          </Stack>

          <section aria-label="Description">
            {task.description.split('\n\n').map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </section>

          {task.subtasks.length > 0 && (
            <section aria-label="Subtasks">
              <Stack gap={6}>
                <Progress value={Math.round((done / task.subtasks.length) * 100)} label={`Subtasks: ${done} of ${task.subtasks.length} done`} />
                {task.subtasks.map((s) => (
                  <Checkbox
                    key={s.id}
                    label={s.title}
                    checked={s.done}
                    onCheckedChange={(checked) =>
                      store.update(task.id, { subtasks: task.subtasks.map((x) => (x.id === s.id ? { ...x, done: checked } : x)) })
                    }
                  />
                ))}
              </Stack>
            </section>
          )}

          <section aria-label="Comments">
            <Stack gap={8}>
              {task.comments.map((c) => (
                <Stack key={c.id} direction="row" gap={8} align="start">
                  <Avatar name={c.author} size="sm" />
                  <Stack gap={2}>
                    <span>
                      <strong>{initials(c.author) && c.author}</strong> · {day(c.date)}
                    </span>
                    <span>{c.text}</span>
                  </Stack>
                </Stack>
              ))}
              <Field label="Add a comment" hideLabel>
                <Textarea aria-label="Add a comment" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment…" />
              </Field>
              <Button
                variant="primary"
                size="sm"
                disabled={!comment.trim()}
                onClick={() => {
                  store.update(task.id, {
                    comments: [...task.comments, { id: `c${task.comments.length + 1}`, author: 'Bram de Vries', date: '', text: comment.trim() }],
                  });
                  setComment('');
                  toast({ message: 'Comment added', tone: 'success' });
                }}
              >
                Comment
              </Button>
            </Stack>
          </section>
        </Stack>
        <Sheet.Footer>
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button>Move to…</Button>
            </Menu.Trigger>
            <Menu.Content>
              {STATUSES.map((s) => (
                <Menu.Item key={s} onClick={() => store.move(task.id, s)}>
                  {s}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Root>
          <Sheet.Close asChild>
            <Button>Close</Button>
          </Sheet.Close>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  );
}
