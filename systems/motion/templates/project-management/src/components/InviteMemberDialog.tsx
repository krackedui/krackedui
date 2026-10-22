import { useState, type FormEvent } from 'react';
import { Button, Dialog, Field, Select, TextInput, useToast } from '@krackedui/motion';
import { ROLES, type Role } from '../data/types';
import { useStore } from '../state/store';

/** Invite a teammate by email with a role. */
export function InviteMemberDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="sm">
        <Dialog.Title>Invite a member</Dialog.Title>
        <Dialog.Description>They get an email with a link to join the workspace.</Dialog.Description>
        {open && <InviteForm onDone={() => onOpenChange(false)} />}
      </Dialog.Content>
    </Dialog.Root>
  );
}

function InviteForm({ onDone }: { onDone: () => void }) {
  const { members, inviteMember, workspace } = useStore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Member');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Enter their name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address.';
    else if (members.some((m) => m.email.toLowerCase() === email.trim().toLowerCase())) e.email = 'This person is already a member.';
    setErrors(e);
    if (e.name || e.email) return;
    inviteMember({ name: name.trim(), email: email.trim(), role });
    onDone();
    toast({ message: `Invitation sent to ${email.trim()}`, description: `They will join ${workspace.name} as ${role.toLowerCase()}.`, tone: 'success' });
  };

  return (
    <form onSubmit={submit} noValidate className="mt-2 flex flex-col gap-4">
      <Field label="Name" error={errors.name} required>
        <TextInput value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      <Field label="Email" error={errors.email} required>
        <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
      </Field>
      <Field label="Role">
        <Select options={ROLES.filter((r) => r !== 'Owner').map((r) => ({ value: r, label: r }))} value={role} onValueChange={(v) => setRole(v as Role)} />
      </Field>
      <Dialog.Footer>
        <Dialog.Close asChild><Button variant="secondary">Cancel</Button></Dialog.Close>
        <Button type="submit" variant="primary">Send invite</Button>
      </Dialog.Footer>
    </form>
  );
}
