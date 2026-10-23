import { useState } from 'react';
import {
  Avatar, Button, DataTable, Dialog, Field, PageHeader, Progress, Select, Stack, TextInput, useToast,
} from '@krackedui/bayrust';
import { members as seed, type Task } from '../data';

const ROLES = ['Design lead', 'Engineering lead', 'Frontend', 'Backend', 'Product', 'Research', 'Design'];

export function Team({ tasks }: { tasks: Task[] }) {
  const { toast } = useToast();
  const [members, setMembers] = useState(seed);
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES[2]);
  const [touched, setTouched] = useState(false);

  const emailError = touched && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? 'Enter a work email address.' : undefined;
  const busiest = Math.max(...members.map((m) => tasks.filter((t) => t.assignee === m.name && t.status !== 'Done').length), 1);

  const invite = () => {
    setTouched(true);
    if (emailError || !email) return;
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    setMembers((list) => [...list, { id: `m${list.length + 1}`, name, role, email }]);
    toast({ message: 'Invitation sent', description: email, tone: 'success' });
    setInviting(false);
    setEmail('');
    setTouched(false);
  };

  return (
    <>
      <PageHeader
        title="Team"
        description={`${members.length} people`}
        actions={<Button variant="primary" icon="plus" onClick={() => setInviting(true)}>Invite member</Button>}
      />

      <DataTable
        rows={members}
        getRowId={(m) => m.id}
        columns={[
          {
            key: 'name',
            header: 'Member',
            cell: (m) => (
              <Stack direction="row" gap={8} align="center">
                <Avatar name={m.name} size="sm" />
                <span>{m.name}</span>
              </Stack>
            ),
          },
          { key: 'email', header: 'Email', hideBelow: 'md' },
          {
            key: 'role',
            header: 'Role',
            cell: (m) => (
              <Select
                aria-label={`Role for ${m.name}`}
                value={m.role}
                onValueChange={(next) => {
                  setMembers((list) => list.map((x) => (x.id === m.id ? { ...x, role: next } : x)));
                  toast({ message: `${m.name} is now ${next}`, tone: 'success' });
                }}
                options={ROLES.map((r) => ({ value: r, label: r }))}
              />
            ),
          },
          {
            key: 'workload',
            header: 'Workload',
            hideBelow: 'sm',
            cell: (m) => {
              const open = tasks.filter((t) => t.assignee === m.name && t.status !== 'Done').length;
              return (
                <Stack gap={2}>
                  <Progress value={Math.round((open / busiest) * 100)} label={`${m.name}: ${open} open tasks`} tone={open > busiest * 0.8 ? 'warning' : 'accent'} />
                  <span>{open} open</span>
                </Stack>
              );
            },
          },
        ]}
      />

      <Dialog.Root open={inviting} onOpenChange={setInviting}>
        <Dialog.Content>
          <Dialog.Title>Invite a member</Dialog.Title>
          <Dialog.Description>They get access to every project in this workspace.</Dialog.Description>
          <Stack gap={10}>
            <Field label="Work email" error={emailError} required>
              <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@northwind.studio" />
            </Field>
            <Field label="Role">
              <Select aria-label="Role" value={role} onValueChange={setRole} options={ROLES.map((r) => ({ value: r, label: r }))} />
            </Field>
          </Stack>
          <Dialog.Footer>
            <Dialog.Close asChild><Button>Cancel</Button></Dialog.Close>
            <Button variant="primary" onClick={invite}>Send invitation</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
