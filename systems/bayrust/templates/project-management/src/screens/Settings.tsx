import { useState } from 'react';
import {
  Alert, Button, CardContent, CardRoot, ConfirmDialog, Field, PageHeader, Select, Stack, Switch,
  Tabs, TextInput, useToast,
} from '@krackedui/bayrust';
import { members as seed, workspace } from '../data';

const ROLES = ['Owner', 'Admin', 'Member', 'Guest'];

export function Settings() {
  const { toast } = useToast();
  const [name, setName] = useState(workspace.name);
  const [members, setMembers] = useState(seed.map((m) => ({ ...m, access: 'Member' })));
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <PageHeader title="Settings" />
      <Tabs.Root defaultValue="general">
        <Tabs.List>
          <Tabs.Trigger value="general">General</Tabs.Trigger>
          <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
          <Tabs.Trigger value="members">Members</Tabs.Trigger>
          <Tabs.Trigger value="danger">Danger zone</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="general">
          <CardRoot>
            <CardContent>
              <Stack gap={10} style={{ maxWidth: 420 }}>
                <Field label="Workspace name" required>
                  <TextInput value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Button variant="primary" onClick={() => toast({ message: 'Workspace saved', tone: 'success' })}>
                  Save changes
                </Button>
              </Stack>
            </CardContent>
          </CardRoot>
        </Tabs.Content>

        <Tabs.Content value="notifications">
          <CardRoot>
            <CardContent>
              <Stack gap={10}>
                <Switch label="Email me when a task is assigned to me" defaultChecked />
                <Switch label="Email me when someone comments on my task" defaultChecked />
                <Switch label="Daily digest at 08:00" />
                <Switch label="Notify the project lead when a task goes overdue" defaultChecked />
              </Stack>
            </CardContent>
          </CardRoot>
        </Tabs.Content>

        <Tabs.Content value="members">
          <CardRoot>
            <CardContent>
              <Stack gap={8}>
                {members.map((m) => (
                  <Stack key={m.id} direction="row" justify="between" align="center" gap={8}>
                    <span>{m.name}</span>
                    <Select
                      aria-label={`Access for ${m.name}`}
                      value={m.access}
                      onValueChange={(access) => setMembers((list) => list.map((x) => (x.id === m.id ? { ...x, access } : x)))}
                      options={ROLES.map((r) => ({ value: r, label: r }))}
                    />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </CardRoot>
        </Tabs.Content>

        <Tabs.Content value="danger">
          <Stack gap={10}>
            <Alert tone="danger" title="Deleting the workspace removes every project and task">
              There is no undo and no export afterwards.
            </Alert>
            <Button variant="danger" icon="trash" onClick={() => setDeleting(true)}>
              Delete workspace
            </Button>
          </Stack>
        </Tabs.Content>
      </Tabs.Root>

      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete this workspace?"
        description="Every project, task and comment goes with it. This cannot be undone."
        confirmLabel="Delete workspace"
        destructive
        onConfirm={() => {
          toast({ message: 'Nothing was deleted — this is a template', tone: 'neutral' });
          setDeleting(false);
        }}
      />
    </>
  );
}
