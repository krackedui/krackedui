import { useState } from 'react';
import {
  Badge, Button, CardContent, CardHeader, CardRoot, CardTitle, DataTable, Field, Grid, PageHeader,
  Select, Stack, Switch, Tabs, TextInput, Textarea, useToast,
} from '@krackedui/bayrust';
import { company, team as seed } from '../data';

const ROLES = ['Owner', 'Admin', 'Bookkeeper', 'Viewer'];

export function Settings() {
  const { toast } = useToast();
  const [team, setTeam] = useState(seed);
  const [name, setName] = useState(company.name);

  return (
    <>
      <PageHeader title="Settings" />
      <Tabs.Root defaultValue="company">
        <Tabs.List>
          <Tabs.Trigger value="company">Company</Tabs.Trigger>
          <Tabs.Trigger value="team">Team access</Tabs.Trigger>
          <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
          <Tabs.Trigger value="integrations">Integrations</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="company">
          <CardRoot>
            <CardContent>
              <Stack gap={10} style={{ maxWidth: 420 }}>
                <Field label="Company name" required>
                  <TextInput value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="Registered address">
                  <Textarea rows={3} defaultValue={'14 Harbour Row\nPortland, OR 97203'} />
                </Field>
                <Button variant="primary" onClick={() => toast({ message: 'Company profile saved', tone: 'success' })}>
                  Save changes
                </Button>
              </Stack>
            </CardContent>
          </CardRoot>
        </Tabs.Content>

        <Tabs.Content value="team">
          <DataTable
            rows={team}
            getRowId={(t) => t.id}
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'email', header: 'Email', hideBelow: 'sm' },
              {
                key: 'role',
                header: 'Role',
                cell: (t) => (
                  <Select
                    aria-label={`Role for ${t.name}`}
                    value={t.role}
                    onValueChange={(role) => {
                      setTeam((list) => list.map((m) => (m.id === t.id ? { ...m, role } : m)));
                      toast({ message: `${t.name} is now ${role}`, tone: 'success' });
                    }}
                    options={ROLES.map((r) => ({ value: r, label: r }))}
                  />
                ),
              },
            ]}
          />
        </Tabs.Content>

        <Tabs.Content value="notifications">
          <CardRoot>
            <CardContent>
              <Stack gap={10}>
                <Switch label="Email me when a payment fails" defaultChecked />
                <Switch label="Email me when a card nears its limit" defaultChecked />
                <Switch label="Weekly summary on Mondays" />
                <Switch label="Notify the whole team about failed payments" />
              </Stack>
            </CardContent>
          </CardRoot>
        </Tabs.Content>

        <Tabs.Content value="integrations">
          <Grid columns={{ base: 1, md: 2 }} gap={10}>
            {[
              { name: 'Meridian Bank', state: 'Connected' },
              { name: 'Northgate Trust', state: 'Connected' },
              { name: 'Stripe', state: 'Not connected' },
              { name: 'Xero', state: 'Not connected' },
            ].map((i) => (
              <CardRoot key={i.name}>
                <CardHeader>
                  <CardTitle>{i.name}</CardTitle>
                  <Badge tone={i.state === 'Connected' ? 'success' : 'neutral'}>{i.state}</Badge>
                </CardHeader>
                <CardContent>
                  <Button size="sm" variant={i.state === 'Connected' ? 'secondary' : 'primary'}>
                    {i.state === 'Connected' ? 'Disconnect' : 'Connect'}
                  </Button>
                </CardContent>
              </CardRoot>
            ))}
          </Grid>
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}
