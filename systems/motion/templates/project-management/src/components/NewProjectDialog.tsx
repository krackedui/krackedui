import { useState, type FormEvent } from 'react';
import { Button, Combobox, DatePicker, Dialog, Field, Grid, Select, TextInput, Textarea, useToast } from '@krackedui/motion';
import { PROJECT_STATUSES, type ProjectStatus } from '../data/types';
import { addDays, toISODay, today } from '../lib/dates';
import { memberOptions } from '../lib/options';
import { navigate } from '../lib/router';
import { useStore } from '../state/store';

interface Errors { name?: string; target?: string }

/** "New project" form with validation; opens the new (empty) board on success. */
export function NewProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="md">
        <Dialog.Title>New project</Dialog.Title>
        <Dialog.Description>Projects group tasks on their own board.</Dialog.Description>
        {open && <NewProjectForm onDone={() => onOpenChange(false)} />}
      </Dialog.Content>
    </Dialog.Root>
  );
}

const slugify = (name: string) => name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';

function NewProjectForm({ onDone }: { onDone: () => void }) {
  const { projects, members, me, addProject } = useStore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lead, setLead] = useState(me.id);
  const [status, setStatus] = useState<ProjectStatus>('Planned');
  const [start, setStart] = useState<Date | null>(today());
  const [target, setTarget] = useState<Date | null>(addDays(today(), 42));
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): Errors => {
    const e: Errors = {};
    const trimmed = name.trim();
    if (!trimmed) e.name = 'Enter a project name.';
    else if (trimmed.length < 3) e.name = 'Use at least 3 characters.';
    else if (projects.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) e.name = 'A project with this name already exists.';
    if (!target) e.target = 'Pick a target date.';
    else if (start && target < start) e.target = 'The target date must be after the start date.';
    return e;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (e.name || e.target) return;
    let slug = slugify(name);
    while (projects.some((p) => p.slug === slug)) slug += '-2';
    const project = addProject({
      slug, name: name.trim(), emoji: '📁', description: description.trim(), status, leadId: lead,
      start: toISODay(start ?? today()), target: toISODay(target ?? today()),
    });
    onDone();
    navigate({ name: 'project', slug: project.slug });
    toast({ message: `Created ${project.name}`, tone: 'success' });
  };

  return (
    <form onSubmit={submit} noValidate className="mt-2 flex flex-col gap-4">
      <Field label="Name" error={errors.name} required>
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Customer portal" autoFocus />
      </Field>
      <Field label="Description" description="Optional. Shown on the project card.">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </Field>
      <Grid columns={{ base: 1, sm: 2 }} gap={3}>
        <Field label="Lead">
          <Combobox options={memberOptions(members)} value={lead} onValueChange={setLead} searchPlaceholder="Search people" />
        </Field>
        <Field label="Status">
          <Select options={PROJECT_STATUSES.map((s) => ({ value: s, label: s }))} value={status} onValueChange={(v) => setStatus(v as ProjectStatus)} />
        </Field>
        <Field label="Start date">
          <DatePicker value={start} onValueChange={setStart} clearable={false} />
        </Field>
        <Field label="Target date" error={errors.target} required>
          <DatePicker value={target} onValueChange={setTarget} min={start ?? undefined} />
        </Field>
      </Grid>
      <Dialog.Footer>
        <Dialog.Close asChild><Button variant="secondary">Cancel</Button></Dialog.Close>
        <Button type="submit" variant="primary">Create project</Button>
      </Dialog.Footer>
    </form>
  );
}
