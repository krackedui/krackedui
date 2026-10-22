import { useState, type FormEvent } from 'react';
import {
  Avatar, Badge, Button, Card, DataTable, Field, Grid, Select, SettingsRow, SettingsSection, Switch, Tabs, TextInput, Textarea,
  useToast, type DataTableColumn,
} from '@krackedui/motion';
import { Page } from '../components/Page';
import { company } from '../data/company';
import { roles } from '../data/team';
import type { Role, TeamMember } from '../data/types';
import { useStore } from '../state/store';
import { navigate } from '../lib/router';

const tabs = [
  { value: 'profile', label: 'Company profile' },
  { value: 'team', label: 'Team access' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'integrations', label: 'Integrations' },
];

function ProfileForm() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: company.name, legalName: company.legalName, email: company.email, phone: company.phone, address: company.address, taxId: company.taxId, fiscalStart: 'jan' });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const set = (key: keyof typeof form, value: string) => { setForm((f) => ({ ...f, [key]: value })); setErrors((e) => ({ ...e, [key]: undefined })); };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = {
      name: form.name.trim() ? undefined : 'Enter the company name.',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? undefined : 'Enter a valid email address.',
    };
    setErrors(next);
    if (next.name || next.email) return;
    toast({ message: 'Company profile saved', tone: 'success' });
  };
  return (
    <form noValidate onSubmit={submit} className="flex max-w-[720px] flex-col gap-4">
      <Grid columns={{ base: 1, md: 2 }} gap={4}>
        <Field label="Display name" required error={errors.name}><TextInput value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Legal name"><TextInput value={form.legalName} onChange={(e) => set('legalName', e.target.value)} /></Field>
        <Field label="Finance email" required error={errors.email} description="Receipts and statements go here.">
          <TextInput type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Phone" description="For your bank's fraud checks."><TextInput type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
        <Field label="Tax ID (EIN)"><TextInput value={form.taxId} onChange={(e) => set('taxId', e.target.value)} /></Field>
        <Field label="Fiscal year starts">
          <Select value={form.fiscalStart} onValueChange={(v) => set('fiscalStart', v)} options={[{ value: 'jan', label: 'January' }, { value: 'apr', label: 'April' }, { value: 'jul', label: 'July' }, { value: 'oct', label: 'October' }]} />
        </Field>
      </Grid>
      <Field label="Business address"><Textarea rows={2} value={form.address} onChange={(e) => set('address', e.target.value)} /></Field>
      <div><Button type="submit" variant="primary">Save changes</Button></div>
    </form>
  );
}

function TeamTable() {
  const { state, dispatch } = useStore();
  const { toast } = useToast();
  const roleOptions = roles.map((r) => ({ value: r, label: r }));
  const columns: DataTableColumn<TeamMember>[] = [
    {
      key: 'name',
      header: 'Member',
      sortable: true,
      cell: (m) => (
        <span className="flex min-w-0 items-center gap-2 py-0.5">
          <Avatar name={m.name} shape="user" size="md" aria-hidden />
          <span className="flex min-w-0 flex-col">
            <span className="truncate">{m.name}</span>
            <span className="truncate text-n-ui-sm text-n-text-secondary">{m.email}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      width: 160,
      cell: (m) => (
        <Select
          size="sm"
          aria-label={`Role for ${m.name}`}
          options={roleOptions}
          value={m.role}
          disabled={m.role === 'Owner'}
          onValueChange={(v) => { dispatch({ type: 'team/role', id: m.id, role: v as Role }); toast({ message: `${m.name} is now ${v}`, tone: 'success' }); }}
        />
      ),
    },
    { key: 'lastActive', header: 'Last active', hideBelow: 'md' },
  ];
  return <DataTable label="Team members" columns={columns} rows={state.team} />;
}

const notificationSettings = [
  { id: 'low', label: 'Low balance', description: 'When an account drops below $25,000.', on: true },
  { id: 'large', label: 'Large transactions', description: 'Any single transaction over $5,000.', on: true },
  { id: 'failed', label: 'Failed payments', description: 'When a payment or card charge fails.', on: true },
  { id: 'budget', label: 'Budget alerts', description: 'At 80% and 100% of a category budget.', on: false },
  { id: 'weekly', label: 'Weekly summary', description: 'Cash flow digest every Monday morning.', on: false },
];

function NotificationSettings() {
  const { toast } = useToast();
  return (
    <div className="flex max-w-[720px] flex-col">
      <SettingsSection title="Email me about">
        {notificationSettings.map((n) => (
          <SettingsRow
            key={n.id}
            label={n.label}
            description={n.description}
            control={<Switch defaultChecked={n.on} onCheckedChange={(on) => toast({ message: `${n.label} ${on ? 'on' : 'off'}` })} />}
          />
        ))}
      </SettingsSection>
    </div>
  );
}

const integrations = [
  { id: 'ledger', name: 'Accounting ledger', description: 'Sync categorized transactions to your general ledger nightly.', icon: 'book' as const, connected: true },
  { id: 'pos', name: 'Point of sale', description: 'Match card settlements to daily sales reports.', icon: 'creditCard' as const, connected: true },
  { id: 'payroll', name: 'Payroll provider', description: 'Fund payroll runs from the Payroll account automatically.', icon: 'users' as const, connected: false },
  { id: 'receipts', name: 'Receipt inbox', description: 'Forward receipts by email and attach them to transactions.', icon: 'envelope' as const, connected: false },
];

function Integrations() {
  const { toast } = useToast();
  const [connected, setConnected] = useState(() => new Set(integrations.filter((i) => i.connected).map((i) => i.id)));
  const toggle = (id: string, name: string) => {
    setConnected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    toast({ message: connected.has(id) ? `${name} disconnected` : `${name} connected`, tone: 'success' });
  };
  return (
    <Grid columns={{ base: 1, md: 2 }} gap={4}>
      {integrations.map((i) => {
        const on = connected.has(i.id);
        return (
          <Card.Root key={i.id}>
            <Card.Header>
              <div className="flex items-center justify-between gap-2">
                <Card.Title asChild><h2>{i.name}</h2></Card.Title>
                <Badge tone={on ? 'success' : 'neutral'}>{on ? 'Connected' : 'Not connected'}</Badge>
              </div>
              <Card.Description>{i.description}</Card.Description>
            </Card.Header>
            <Card.Footer>
              <Button size="sm" variant={on ? 'secondary' : 'primary'} icon={on ? undefined : 'integration'} onClick={() => toggle(i.id, i.name)}>
                {on ? 'Disconnect' : 'Connect'}
              </Button>
            </Card.Footer>
          </Card.Root>
        );
      })}
    </Grid>
  );
}

export function SettingsPage({ tab }: { tab?: string }) {
  const value = tabs.some((t) => t.value === tab) ? (tab as string) : 'profile';
  return (
    <Page title="Settings" description={`${company.name} workspace settings`}>
      <Tabs.Root value={value} onValueChange={(v) => navigate({ page: 'settings', tab: v })}>
        <Tabs.List aria-label="Settings sections">
          {tabs.map((t) => <Tabs.Trigger key={t.value} value={t.value}>{t.label}</Tabs.Trigger>)}
        </Tabs.List>
        <Tabs.Content value="profile" className="pt-5"><ProfileForm /></Tabs.Content>
        <Tabs.Content value="team" className="pt-5"><TeamTable /></Tabs.Content>
        <Tabs.Content value="notifications" className="pt-5"><NotificationSettings /></Tabs.Content>
        <Tabs.Content value="integrations" className="pt-5"><Integrations /></Tabs.Content>
      </Tabs.Root>
    </Page>
  );
}
