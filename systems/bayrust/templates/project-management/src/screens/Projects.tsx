import { useState } from 'react';
import {
  Avatar, Badge, Button, CardContent, CardHeader, CardRoot, CardTitle, Dialog, Field, Grid,
  PageHeader, Progress, Select, Stack, TextInput, useToast,
} from '@krackedui/bayrust';
import { members, projects as seed } from '../data';
import { day } from '../format';
import { go } from '../router';

const TONE = { 'On track': 'success', 'At risk': 'warning', Paused: 'neutral' } as const;

export function Projects() {
  const { toast } = useToast();
  const [projects, setProjects] = useState(seed);
  const [filter, setFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [lead, setLead] = useState(members[0].name);
  const [touched, setTouched] = useState(false);

  const shown = filter ? projects.filter((p) => p.status === filter) : projects;
  const nameError = touched && !name.trim() ? 'Give the project a name.' : undefined;

  const create = () => {
    setTouched(true);
    if (!name.trim()) return;
    setProjects((list) => [
      ...list,
      { id: name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8) || `p${list.length}`, key: name.slice(0, 3).toUpperCase(), name: name.trim(), status: 'On track', lead, start: '', target: '', progress: 0 },
    ]);
    toast({ message: 'Project created', description: name.trim(), tone: 'success' });
    setCreating(false);
    setName('');
    setTouched(false);
  };

  return (
    <>
      <PageHeader
        title="Projects"
        description={`${shown.length} of ${projects.length}`}
        actions={
          <Stack direction="row" gap={6}>
            <Select
              aria-label="Filter by status"
              value={filter}
              onValueChange={setFilter}
              options={[
                { value: '', label: 'Any status' },
                { value: 'On track', label: 'On track' },
                { value: 'At risk', label: 'At risk' },
                { value: 'Paused', label: 'Paused' },
              ]}
            />
            <Button variant="primary" icon="plus" onClick={() => setCreating(true)}>
              New project
            </Button>
          </Stack>
        }
      />

      <Grid columns={{ base: 1, md: 2, xl: 3 }} gap={10}>
        {shown.map((p) => (
          <CardRoot key={p.id} interactive onClick={() => go(`/projects/${p.id}`)}>
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
              <Badge tone={TONE[p.status]}>{p.status}</Badge>
            </CardHeader>
            <CardContent>
              <Stack gap={8}>
                <Stack direction="row" gap={6} align="center">
                  <Avatar name={p.lead} size="xs" />
                  <span>{p.lead}</span>
                </Stack>
                <Progress value={p.progress} label={`${p.name}: ${p.progress}% complete`} />
                <span>{p.target ? `Target ${day(p.target)}` : 'No target date'}</span>
              </Stack>
            </CardContent>
          </CardRoot>
        ))}
      </Grid>

      <Dialog.Root open={creating} onOpenChange={setCreating}>
        <Dialog.Content>
          <Dialog.Title>New project</Dialog.Title>
          <Dialog.Description>It starts empty, on track, with you as a member.</Dialog.Description>
          <Stack gap={10}>
            <Field label="Name" error={nameError} required>
              <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Website relaunch" />
            </Field>
            <Field label="Lead">
              <Select aria-label="Lead" value={lead} onValueChange={setLead} options={members.map((m) => ({ value: m.name, label: m.name }))} />
            </Field>
          </Stack>
          <Dialog.Footer>
            <Dialog.Close asChild><Button>Cancel</Button></Dialog.Close>
            <Button variant="primary" onClick={create}>Create project</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
