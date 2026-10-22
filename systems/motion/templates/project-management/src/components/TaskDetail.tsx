import { useState, type FormEvent } from 'react';
import {
  Avatar, Button, Checkbox, Combobox, DatePicker, Divider, Field, Grid, Icon, PageHeader, Progress, Select, Tabs,
  TextInput, Textarea,
} from '@krackedui/motion';
import { LABELS, type Priority, type Status, type Task } from '../data/types';
import { formatDay, formatWhen, parseDay, toISODay } from '../lib/dates';
import { labelOptions, memberOptions, priorityOptions, statusOptions } from '../lib/options';
import { useStore } from '../state/store';
import { useTaskActions } from '../state/useTaskActions';
import { ActivityItem } from './ActivityItem';

/**
 * Everything about one task, all editable in place: title, status, priority, assignee, labels, due date,
 * description, subtasks, comments and activity. Shared by the side sheet (desktop) and the task page (phones).
 */
export function TaskDetail({ task }: { task: Task }) {
  const { members, memberById, updateTask } = useStore();
  const { move } = useTaskActions();
  const set = (patch: Partial<Task>) => updateTask(task.id, patch);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        size="peek"
        title={task.title}
        onTitleChange={(title) => set({ title })}
        placeholder="Untitled task"
        className="-mx-2"
      />
      <Grid columns={{ base: 1, sm: 2 }} gap={4}>
        <Field label="Status">
          <Select options={statusOptions} value={task.status} onValueChange={(v) => move(task, v as Status)} />
        </Field>
        <Field label="Priority">
          <Select options={priorityOptions} value={task.priority} onValueChange={(v) => set({ priority: v as Priority })} />
        </Field>
        <Field label="Assignee">
          <Combobox
            options={memberOptions(members)}
            value={task.assigneeId ?? ''}
            onValueChange={(v) => updateTask(task.id, { assigneeId: v || null }, { kind: 'assigned', detail: memberById(v)?.name ?? 'nobody' })}
            placeholder="Unassigned"
            searchPlaceholder="Search people"
          />
        </Field>
        <Field label="Due date">
          <DatePicker
            value={task.due ? parseDay(task.due) : null}
            onValueChange={(d) => updateTask(task.id, { due: d ? toISODay(d) : null }, { kind: 'updated', detail: 'due date' })}
            placeholder="No due date"
          />
        </Field>
        <LabelsField task={task} onChange={(labels) => set({ labels })} />
        <div className="flex flex-col gap-1.5 text-n-ui">
          <span className="font-medium">Details</span>
          <span className="text-n-text-secondary">{task.estimate} {task.estimate === 1 ? 'point' : 'points'} · created {formatDay(task.created)} · updated {formatDay(task.updated)}</span>
        </div>
      </Grid>
      <Field label="Description">
        <Textarea value={task.description} onChange={(e) => set({ description: e.target.value })} rows={7} placeholder="Add a description…" />
      </Field>
      <Subtasks task={task} onChange={(subtasks) => set({ subtasks })} />
      <Divider />
      <Tabs.Root defaultValue="comments">
        <Tabs.List aria-label="Conversation">
          <Tabs.Trigger value="comments">Comments ({task.comments.length})</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="comments"><Comments task={task} /></Tabs.Content>
        <Tabs.Content value="activity"><TaskActivity taskId={task.id} /></Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function LabelsField({ task, onChange }: { task: Task; onChange: (labels: Task['labels']) => void }) {
  return (
    <Field label="Labels">
      <Combobox
        multiple
        options={labelOptions}
        value={task.labels}
        onValueChange={(v) => onChange(LABELS.filter((l) => v.includes(l)))}
        placeholder="No labels"
        searchPlaceholder="Search labels"
      />
    </Field>
  );
}

function Subtasks({ task, onChange }: { task: Task; onChange: (subtasks: Task['subtasks']) => void }) {
  const [title, setTitle] = useState('');
  const done = task.subtasks.filter((s) => s.done).length;
  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onChange([...task.subtasks, { id: `${task.id}-s${task.subtasks.length + 1}-${title.length}`, title: title.trim(), done: false }]);
    setTitle('');
  };
  return (
    <section aria-labelledby={`subtasks-${task.id}`} className="flex flex-col gap-3">
      <h2 id={`subtasks-${task.id}`} className="m-0 text-n-ui-medium">Subtasks</h2>
      {task.subtasks.length > 0 && (
        <Progress value={done} max={task.subtasks.length} label={`${done} of ${task.subtasks.length} done`} valueText={`${done} of ${task.subtasks.length} subtasks done`} hideValue size="sm" />
      )}
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {task.subtasks.map((s) => (
          <li key={s.id}>
            <Checkbox
              label={<span className={s.done ? 'text-n-text-secondary line-through' : undefined}>{s.title}</span>}
              checked={s.done}
              onCheckedChange={(on) => onChange(task.subtasks.map((x) => (x.id === s.id ? { ...x, done: on } : x)))}
            />
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="flex gap-2">
        <Field label="New subtask" hideLabel className="flex-1">
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a subtask" />
        </Field>
        <Button type="submit" variant="secondary" disabled={!title.trim()}>Add</Button>
      </form>
    </section>
  );
}

function Comments({ task }: { task: Task }) {
  const { memberById, addComment, me } = useStore();
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    addComment(task.id, text.trim());
    setText('');
  };
  return (
    <div className="flex flex-col gap-4 pt-3">
      {task.comments.length === 0 && <p className="m-0 text-n-ui text-n-text-secondary">No comments yet. Start the conversation.</p>}
      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {task.comments.map((c) => {
          const author = memberById(c.authorId);
          return (
            <li key={c.id} className="flex gap-2.5">
              <Avatar name={author?.name} shape="user" size="lg" />
              <div className="min-w-0 flex-1">
                <p className="m-0 text-n-ui"><span className="font-medium">{author?.name}</span> <span className="text-n-ui-sm text-n-text-secondary">{formatWhen(c.at)}</span></p>
                <p className="m-0 mt-0.5 whitespace-pre-wrap text-n-ui">{c.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <form className="flex gap-2.5" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <Avatar name={me.name} shape="user" size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Field label="Comment" hideLabel>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }}
              rows={3}
              placeholder="Write a comment… (⌘Enter to send)"
            />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm" icon="send" disabled={!text.trim()}>Comment</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function TaskActivity({ taskId }: { taskId: string }) {
  const { activity } = useStore();
  const events = activity.filter((e) => e.taskId === taskId);
  if (!events.length) {
    return <p className="m-0 flex items-center gap-2 pt-3 text-n-ui text-n-text-secondary"><Icon name="clock" size={16} />No activity yet.</p>;
  }
  return <ul className="m-0 list-none p-0 pt-1">{events.map((e) => <ActivityItem key={e.id} event={e} showTask={false} />)}</ul>;
}
