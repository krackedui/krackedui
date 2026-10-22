import { useState, type FormEvent } from 'react';
import {
  Alert, Avatar, Button, Card, ConfirmDialog, EmojiPicker, Field, Popover, Select, Switch, Tabs, TextInput, useToast,
} from '@krackedui/motion';
import { ScreenLayout } from '../components/ScreenLayout';
import { ROLES, type Role } from '../data/types';
import { useStore } from '../state/store';

/** Workspace settings in tabs: general, notifications, members and the danger zone. */
export function SettingsPage() {
  return (
    <ScreenLayout title="Settings" description="Manage the Northwind Studio workspace.">
      <Tabs.Root defaultValue="general">
        <Tabs.List aria-label="Settings sections" className="overflow-x-auto">
          <Tabs.Trigger value="general">General</Tabs.Trigger>
          <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
          <Tabs.Trigger value="members">Members</Tabs.Trigger>
          <Tabs.Trigger value="danger">Danger zone</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="general" className="pt-6"><GeneralSettings /></Tabs.Content>
        <Tabs.Content value="notifications" className="pt-6"><NotificationSettings /></Tabs.Content>
        <Tabs.Content value="members" className="pt-6"><MemberSettings /></Tabs.Content>
        <Tabs.Content value="danger" className="pt-6"><DangerZone /></Tabs.Content>
      </Tabs.Root>
    </ScreenLayout>
  );
}

function GeneralSettings() {
  const { workspace, updateWorkspace } = useStore();
  const { toast } = useToast();
  const [name, setName] = useState(workspace.name);
  const [error, setError] = useState<string>();
  const [pickerOpen, setPickerOpen] = useState(false);
  const save = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) { setError('The name needs at least 2 characters.'); return; }
    updateWorkspace({ name: name.trim() });
    toast({ message: 'Workspace updated', tone: 'success' });
  };
  return (
    <form onSubmit={save} noValidate className="flex max-w-[480px] flex-col gap-5">
      <Field label="Workspace name" description="Shown in the sidebar and in invitations." error={error} required>
        <TextInput value={name} onChange={(e) => { setName(e.target.value); setError(undefined); }} />
      </Field>
      <Field label="Icon" description="Used in the sidebar and breadcrumbs." htmlFor="workspace-icon">
        <Popover.Root open={pickerOpen} onOpenChange={setPickerOpen}>
          <Popover.Trigger asChild>
            <Button id="workspace-icon" variant="secondary" className="w-fit">
              <span aria-hidden className="text-[16px]">{workspace.emoji}</span> Change icon
            </Button>
          </Popover.Trigger>
          <Popover.Content width={360} aria-label="Choose an icon">
            <EmojiPicker autoFocus onSelect={(emoji) => { updateWorkspace({ emoji }); setPickerOpen(false); }} />
          </Popover.Content>
        </Popover.Root>
      </Field>
      <div><Button type="submit" variant="primary">Save changes</Button></div>
    </form>
  );
}

const NOTIFICATIONS = [
  { id: 'assigned', label: 'A task is assigned to me', description: 'Email and in-app.', on: true },
  { id: 'mentioned', label: 'Someone mentions me in a comment', description: 'Email and in-app.', on: true },
  { id: 'status', label: 'A task I follow changes status', description: 'In-app only.', on: false },
  { id: 'due', label: 'Daily digest of tasks due soon', description: 'Every weekday at 9:00.', on: true },
  { id: 'product', label: 'Product updates', description: 'At most once a month.', on: false },
];

function NotificationSettings() {
  const [state, setState] = useState(() => Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, n.on])));
  return (
    <Card.Root className="max-w-[640px]">
      <ul className="m-0 list-none p-0">
        {NOTIFICATIONS.map((n) => (
          <li key={n.id} className="flex items-center justify-between gap-4 border-b border-n-border-primary px-4 py-3 last:border-b-0">
            <span className="flex flex-col">
              <span id={`notify-${n.id}`} className="text-n-ui">{n.label}</span>
              <span id={`notify-${n.id}-d`} className="text-n-ui-sm text-n-text-secondary">{n.description}</span>
            </span>
            <Switch
              checked={state[n.id]}
              onCheckedChange={(on) => setState((s) => ({ ...s, [n.id]: on }))}
              aria-labelledby={`notify-${n.id}`}
              aria-describedby={`notify-${n.id}-d`}
            />
          </li>
        ))}
      </ul>
    </Card.Root>
  );
}

function MemberSettings() {
  const { members, me, setMemberRole } = useStore();
  const { toast } = useToast();
  return (
    <Card.Root className="max-w-[720px]">
      <ul className="m-0 list-none p-0">
        {members.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center gap-3 border-b border-n-border-primary px-4 py-3 last:border-b-0">
            <Avatar name={m.name} shape="user" size="xl" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-n-ui">{m.name}{m.id === me.id && <span className="text-n-text-secondary"> (you)</span>}</span>
              <span className="truncate text-n-ui-sm text-n-text-secondary">{m.email}</span>
            </span>
            <Field label={`Role of ${m.name}`} hideLabel className="w-32">
              <Select
                size="sm"
                options={ROLES.map((r) => ({ value: r, label: r }))}
                value={m.role}
                disabled={m.id === me.id}
                onValueChange={(v) => { setMemberRole(m.id, v as Role); toast({ message: `${m.name} is now ${v.toLowerCase()}` }); }}
              />
            </Field>
          </li>
        ))}
      </ul>
    </Card.Root>
  );
}

function DangerZone() {
  const { workspace } = useStore();
  const { toast } = useToast();
  return (
    <div className="flex max-w-[640px] flex-col gap-4">
      <Alert tone="danger" title="Deleting a workspace cannot be undone">
        All projects, tasks, comments and files in {workspace.name} are removed for every member.
      </Alert>
      <ConfirmDialog
        trigger={<Button variant="danger" icon="trash" className="w-fit">Delete workspace</Button>}
        title={`Delete ${workspace.name}?`}
        description="This removes every project and task for all members. This is a demo, so nothing is actually deleted."
        confirmLabel="Delete workspace"
        onConfirm={() => new Promise<void>((resolve) => { window.setTimeout(resolve, 600); }).then(() => { toast({ message: 'Demo only: the workspace was not deleted.', tone: 'danger' }); })}
      />
    </div>
  );
}
