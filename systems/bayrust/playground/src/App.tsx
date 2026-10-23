import { useState } from 'react';
import {
  Alert, AppFrame, Badge, Breadcrumbs, Button, CardContent, CardHeader, CardRoot, CardTitle,
  Checkbox, Field, PageHeader, SearchInput, Sidebar, Stack, Stat, Switch, Theme, Topbar,
  type Appearance,
} from '@krackedui/bayrust';

/**
 * The lab: one page that puts the system's own surfaces next to each other so a change can be seen
 * in both appearances at once. Internal — never published, never a substitute for the docs.
 */
export function App() {
  const [appearance, setAppearance] = useState<Appearance>('dark');
  return (
    <Theme appearance={appearance} style={{ minHeight: '100vh' }}>
      <AppFrame
        sidebar={
          <Sidebar.Root>
            <Sidebar.Header>Lab</Sidebar.Header>
            <Sidebar.Section title="Surfaces">
              <Sidebar.Item icon="home" active>
                Overview
              </Sidebar.Item>
              <Sidebar.Item icon="chart">Charts</Sidebar.Item>
              <Sidebar.Item icon="settings">Settings</Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Root>
        }
        topbar={
          <Topbar
            breadcrumbs={<Breadcrumbs items={[{ label: 'Lab', href: '#' }, { label: 'Overview' }]} />}
            actions={
              <Button
                variant="secondary"
                icon={appearance === 'dark' ? 'sun' : 'moon'}
                onClick={() => setAppearance(appearance === 'dark' ? 'light' : 'dark')}
              >
                {appearance === 'dark' ? 'Light' : 'Dark'}
              </Button>
            }
          />
        }
      >
        <PageHeader title="Overview" description="Every surface, both appearances, one screen." />
        <Stack gap={12}>
          <Alert tone="info" title="This is the lab">
            It is not published and it is not the docs. It exists so a change can be looked at.
          </Alert>
          <CardRoot>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <Stack gap={10}>
                <Field label="Search">
                  <SearchInput placeholder="Search commands…" />
                </Field>
                <Checkbox defaultChecked>Checked by default</Checkbox>
                <Switch defaultChecked label="Switch" />
                <Stack direction="row" gap={6}>
                  <Badge tone="success">Passing</Badge>
                  <Badge tone="warning">Flagged</Badge>
                  <Badge tone="danger">Failing</Badge>
                </Stack>
              </Stack>
            </CardContent>
          </CardRoot>
          <Stat label="Commands run" value="12,480" delta="+8.2%" trend="up" />
        </Stack>
      </AppFrame>
    </Theme>
  );
}
