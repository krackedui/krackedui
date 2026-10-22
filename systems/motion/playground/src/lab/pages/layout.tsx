import { Button, Divider, Grid, Stack, Theme, useTheme } from '@krackedui/motion';

function Cell({ children }: { children: string }) {
  return <div className="flex h-12 items-center justify-center rounded-n-md bg-n-bg-tertiary-translucent-a text-n-text-secondary">{children}</div>;
}

function Appearance() {
  const { appearance, resolvedAppearance } = useTheme();
  return <span className="text-n-text-secondary">{appearance} → {resolvedAppearance}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[12px] font-medium leading-4 text-n-text-secondary">{title}</h2>
      {children}
    </section>
  );
}

/** Lab: Theme, Stack, Grid, Divider. Resize to 375px to check the responsive props. */
export default function Layout() {
  return (
    <div className="flex flex-col gap-8 px-4 py-6 text-[14px] sm:px-8">
      <Section title="Theme (nested)">
        <Stack direction={{ base: 'column', sm: 'row' }} gap={3}>
          {(['light', 'dark', 'system'] as const).map((a) => (
            <Theme key={a} appearance={a} className="flex flex-col items-start gap-2 rounded-n-lg p-4 shadow-n-shadow-outline-sm">
              <Appearance />
              <Button variant="primary">Save</Button>
            </Theme>
          ))}
        </Stack>
      </Section>
      <Section title="Stack: column → row at md, gap 2 → 4">
        <Stack direction={{ base: 'column', md: 'row' }} gap={{ base: 2, md: 4 }}>
          <Cell>One</Cell><Cell>Two</Cell><Cell>Three</Cell>
        </Stack>
      </Section>
      <Section title="Stack: row, between, wrap">
        <Stack direction="row" justify="between" align="center" wrap gap={2}>
          <span>Members</span>
          <Stack direction="row" gap={1}><Button variant="secondary" size="sm">Cancel</Button><Button variant="primary" size="sm">Invite</Button></Stack>
        </Stack>
      </Section>
      <Section title="Grid: 1 → 2 (sm) → 4 (lg)">
        <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={3}>
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((x) => <Cell key={x}>{x}</Cell>)}
        </Grid>
      </Section>
      <Section title="Grid: 12 columns, gap 1">
        <Grid columns={12} gap={1}>
          {Array.from({ length: 12 }, (_, i) => <Cell key={i}>{String(i + 1)}</Cell>)}
        </Grid>
      </Section>
      <Section title="Divider">
        <Divider />
        <Divider block />
        <div className="flex h-6 items-center gap-3">Share<Divider orientation="vertical" />Publish</div>
      </Section>
    </div>
  );
}
