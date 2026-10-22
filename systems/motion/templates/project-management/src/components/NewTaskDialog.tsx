import { useState, type FormEvent } from 'react';
import { Button, Combobox, DatePicker, Dialog, Field, Grid, Select, TextInput, useToast } from '@krackedui/motion';
import type { Priority, Status } from '../data/types';
import { toISODay } from '../lib/dates';
import { memberOptions, priorityOptions, projectOptions, statusOptions } from '../lib/options';
import { navigate } from '../lib/router';
import { useStore } from '../state/store';

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Project preselected (the board in view). */
  projectSlug?: string;
}

/** Create a task in any project and column (from ⌘K or the top bar). */
export function NewTaskDialog({ open, onOpenChange, projectSlug }: NewTaskDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="md" aria-describedby={undefined}>
        <Dialog.Title>New task</Dialog.Title>
        {/* Remounts on every open so the form starts empty. */}
        {open && <NewTaskForm projectSlug={projectSlug} onDone={() => onOpenChange(false)} />}
      </Dialog.Content>
    </Dialog.Root>
  );
}

function NewTaskForm({ projectSlug, onDone }: { projectSlug?: string; onDone: () => void }) {
  const { projects, members, addTask } = useStore();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [project, setProject] = useState(projectSlug ?? projects[0]?.slug ?? '');
  const [status, setStatus] = useState<Status>('To do');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<Priority>('None');
  const [due, setDue] = useState<Date | null>(null);
  const [error, setError] = useState<string>();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Give the task a title.'); return; }
    const task = addTask({ projectSlug: project, title, status, assigneeId: assignee || null, priority, due: due ? toISODay(due) : null });
    onDone();
    toast({ message: `Created ${task.id}`, description: `${task.title} · ${status}`, tone: 'success', action: { label: 'Open', onClick: () => navigate({ name: 'task', id: task.id }) } });
  };

  return (
    <form onSubmit={submit} noValidate className="mt-2 flex flex-col gap-4">
      <Field label="Title" error={error} required>
        <TextInput value={title} onChange={(e) => { setTitle(e.target.value); setError(undefined); }} placeholder="What needs to be done?" autoFocus />
      </Field>
      <Grid columns={{ base: 1, sm: 2 }} gap={3}>
        <Field label="Project">
          <Select options={projectOptions(projects)} value={project} onValueChange={setProject} />
        </Field>
        <Field label="Status">
          <Select options={statusOptions} value={status} onValueChange={(v) => setStatus(v as Status)} />
        </Field>
        <Field label="Assignee">
          <Combobox options={memberOptions(members)} value={assignee} onValueChange={setAssignee} placeholder="Unassigned" searchPlaceholder="Search people" />
        </Field>
        <Field label="Priority">
          <Select options={priorityOptions} value={priority} onValueChange={(v) => setPriority(v as Priority)} />
        </Field>
        <Field label="Due date">
          <DatePicker value={due} onValueChange={setDue} placeholder="No due date" />
        </Field>
      </Grid>
      <Dialog.Footer>
        <Dialog.Close asChild><Button variant="secondary">Cancel</Button></Dialog.Close>
        <Button type="submit" variant="primary">Create task</Button>
      </Dialog.Footer>
    </form>
  );
}
