// Charts and the application shell.
import type { DocPage, NavGroup } from '../../../../apps/docs/lib/types';
import {
  AppFrame, BarChart, Breadcrumbs, Button, CardContent, CardHeader, CardRoot, CardTitle, DonutChart,
  LineChart, PageHeader, Sidebar, Sparkline, Stack, Topbar,
} from '@krackedui/bayrust';
import { a11y, install, usage } from './helpers';

const months = [
  { month: 'Jan', revenue: 42000, costs: 31000 },
  { month: 'Feb', revenue: 48000, costs: 33000 },
  { month: 'Mar', revenue: 51000, costs: 34000 },
  { month: 'Apr', revenue: 58000, costs: 36000 },
  { month: 'May', revenue: 61000, costs: 37000 },
  { month: 'Jun', revenue: 72000, costs: 39000 },
];
const series = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'costs', label: 'Costs' },
];
const money = (v: number) => `$${(v / 1000).toFixed(0)}k`;

const chartsPage: DocPage = {
  eyebrow: 'Charts',
  title: 'Charts',
  description:
    'Four forms, one fixed palette. The categorical colours are steps of Bayrust’s own hues, checked for colour-vision separation rather than chosen by eye.',
  hero: {
    title: 'LineChart',
    align: 'start',
    render: () => (
      <div style={{ width: '100%', maxWidth: 520 }}>
        <LineChart data={months} index="month" series={series} label="Revenue vs costs" valueFormat={money} area />
      </div>
    ),
    code: `const months = [
  { month: 'Jan', revenue: 42000, costs: 31000 },
  { month: 'Feb', revenue: 48000, costs: 33000 },
  { month: 'Mar', revenue: 51000, costs: 34000 },
  { month: 'Apr', revenue: 58000, costs: 36000 },
  { month: 'May', revenue: 61000, costs: 37000 },
  { month: 'Jun', revenue: 72000, costs: 39000 },
];
const series = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'costs', label: 'Costs' },
];
const money = (v: number) => \`$\${(v / 1000).toFixed(0)}k\`;

<LineChart data={months} index="month" series={series} label="Revenue vs costs" valueFormat={money} area />`,
  },
  install,
  sections: [
    usage([
      'There are six categorical slots, assigned in order and never cycled. A seventh series folds into "Other" or becomes a facet — a generated hue would not be separable.',
      'Never a second y-axis. Two measures of different scale are two charts, or one indexed to a common base.',
      'Green is not a categorical slot: in the light appearance it has no step that clears the chroma floor. It keeps its separate job as the success colour.',
    ]),
    a11y([
      'Every chart renders a visually hidden table of the same numbers, so the data is readable without the picture.',
      '`label` is the chart’s accessible name and the caption of that table.',
      'Two or more series always draw a legend, so identity is never colour alone.',
      'Grid lines and axis text take text tokens, never a series colour.',
    ]),
  ],
  examples: [
    {
      title: 'Bars, stacked',
      align: 'start',
      render: () => (
        <div style={{ width: '100%', maxWidth: 520 }}>
          <BarChart data={months} index="month" series={series} label="By month" valueFormat={money} stacked />
        </div>
      ),
      code: `const months = [
  { month: 'Jan', revenue: 42000, costs: 31000 },
  { month: 'Feb', revenue: 48000, costs: 33000 },
  { month: 'Mar', revenue: 51000, costs: 34000 },
  { month: 'Apr', revenue: 58000, costs: 36000 },
  { month: 'May', revenue: 61000, costs: 37000 },
  { month: 'Jun', revenue: 72000, costs: 39000 },
];
const series = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'costs', label: 'Costs' },
];
const money = (v: number) => \`$\${(v / 1000).toFixed(0)}k\`;

<BarChart data={months} index="month" series={series} label="By month" valueFormat={money} stacked />`,
    },
    {
      title: 'Donut',
      render: () => (
        <DonutChart
          label="Share by source"
          center="2.3k"
          data={[
            { label: 'Commands', value: 1284 },
            { label: 'Extensions', value: 742 },
            { label: 'Snippets', value: 431 },
          ]}
        />
      ),
      code: `<DonutChart
  label="Share by source"
  center="2.3k"
  data={[
    { label: 'Commands', value: 1284 },
    { label: 'Extensions', value: 742 },
    { label: 'Snippets', value: 431 },
  ]}
/>`,
    },
    {
      title: 'Sparkline',
      description: 'For a trend inside a row or a card, where an axis would be noise.',
      render: () => (
        <Stack direction="row" gap={10} align="center">
          <Sparkline data={[4, 6, 5, 8, 7, 11, 13]} label="Weekly runs" />
          <Sparkline data={[13, 11, 12, 8, 7, 6, 4]} label="Weekly failures" tone="danger" />
        </Stack>
      ),
      code: `<Stack direction="row" gap={10} align="center">
  <Sparkline data={[4, 6, 5, 8, 7, 11, 13]} label="Weekly runs" />
  <Sparkline data={[13, 11, 12, 8, 7, 6, 4]} label="Weekly failures" tone="danger" />
</Stack>`,
    },
  ],
  api: [
    {
      name: 'LineChart',
      props: [
        { name: 'data', type: 'Datum[]' },
        { name: 'index', type: 'keyof Datum & string', description: 'The field each datum is placed by.' },
        { name: 'series', type: 'ChartSeries[]' },
        { name: 'label', type: 'string', description: 'Required: the accessible name and the data table caption.' },
        { name: 'valueFormat', type: '(value: number) => string' },
        { name: 'area', type: 'boolean' },
        { name: 'curved', type: 'boolean' },
        { name: 'height', type: 'number', default: '180' },
      ],
    },
    { name: 'BarChart', props: [{ name: 'stacked', type: 'boolean', description: 'Only the top segment of a stack is rounded.' }, { name: 'layout', type: ['"vertical"', '"horizontal"'] }] },
    { name: 'DonutChart', props: [{ name: 'data', type: '{ label: string; value: number }[]' }, { name: 'center', type: 'ReactNode', description: 'Text in the hole, usually the total.' }, { name: 'size', type: 'number' }] },
    { name: 'Sparkline', props: [{ name: 'data', type: 'number[]' }, { name: 'tone', type: 'Tone' }, { name: 'label', type: 'string', description: 'Required.' }] },
  ],
};

const shellPage: DocPage = {
  eyebrow: 'App shell',
  title: 'AppFrame',
  description: 'Sidebar, top bar and content. One state for the sidebar, two behaviours depending on the room available.',
  hero: {
    title: 'AppFrame',
    align: 'start',
    previewClassName: 'min-h-80',
    render: () => (
      <div style={{ width: '100%', height: 320, overflow: 'hidden', borderRadius: 8 }}>
        <AppFrame
          sidebar={
            <Sidebar.Root>
              <Sidebar.Header>Workspace</Sidebar.Header>
              <Sidebar.Section title="Pages">
                <Sidebar.Item icon="home" active>Overview</Sidebar.Item>
                <Sidebar.Item icon="chart">Analytics</Sidebar.Item>
                <Sidebar.Item icon="list">Commands</Sidebar.Item>
              </Sidebar.Section>
              <Sidebar.Footer>
                <Sidebar.Item icon="settings">Settings</Sidebar.Item>
              </Sidebar.Footer>
            </Sidebar.Root>
          }
          topbar={
            <Topbar
              breadcrumbs={<Breadcrumbs items={[{ label: 'Workspace', href: '#' }, { label: 'Overview' }]} />}
              actions={<Button variant="primary" icon="plus" size="sm">New</Button>}
            />
          }
        >
          <PageHeader title="Overview" description="The last 30 days." />
          <CardRoot>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
            </CardHeader>
            <CardContent>Commands run across every workspace.</CardContent>
          </CardRoot>
        </AppFrame>
      </div>
    ),
    code: `<AppFrame
  sidebar={
    <Sidebar.Root>
      <Sidebar.Header>Workspace</Sidebar.Header>
      <Sidebar.Section title="Pages">
        <Sidebar.Item icon="home" active>Overview</Sidebar.Item>
        <Sidebar.Item icon="chart">Analytics</Sidebar.Item>
        <Sidebar.Item icon="list">Commands</Sidebar.Item>
      </Sidebar.Section>
      <Sidebar.Footer>
        <Sidebar.Item icon="settings">Settings</Sidebar.Item>
      </Sidebar.Footer>
    </Sidebar.Root>
  }
  topbar={
    <Topbar
      breadcrumbs={<Breadcrumbs items={[{ label: 'Workspace', href: '#' }, { label: 'Overview' }]} />}
      actions={<Button variant="primary" icon="plus" size="sm">New</Button>}
    />
  }
>
  <PageHeader title="Overview" description="The last 30 days." />
</AppFrame>`,
  },
  install,
  sections: [
    usage([
      'Above `md` the sidebar is docked and `sidebarOpen` collapses it. Below `md` the same state opens it as a drawer over the content, closed by default. One prop, two behaviours — which is what stops every app writing its own breakpoint logic.',
      '`PageHeader` renders the page’s single `h1`.',
    ]),
    a11y([
      'The frame renders one `main`. The sidebar is a `nav` landmark named "Main".',
      'On a narrow screen the drawer traps focus and closes on Escape, and its scrim is a real button with a name.',
    ]),
  ],
  api: [
    {
      name: 'AppFrame',
      props: [
        { name: 'sidebar', type: 'ReactNode' },
        { name: 'topbar', type: 'ReactNode' },
        { name: 'sidebarOpen', type: 'boolean' },
        { name: 'defaultSidebarOpen', type: 'boolean', default: 'true' },
        { name: 'onSidebarOpenChange', type: '(open: boolean) => void' },
      ],
    },
    { name: 'Sidebar.Item', props: [{ name: 'icon', type: 'IconName' }, { name: 'active', type: 'boolean', description: 'Sets aria-current="page".' }, { name: 'href', type: 'string', description: 'Renders a link; without it, a button.' }, { name: 'trailing', type: 'ReactNode' }] },
    { name: 'PageHeader', props: [{ name: 'title', type: 'ReactNode', description: 'Rendered as the page h1.' }, { name: 'description', type: 'ReactNode' }, { name: 'actions', type: 'ReactNode' }] },
  ],
};

export const chartShellPages: Record<string, DocPage> = { charts: chartsPage, 'app-frame': shellPage };

export const chartShellNav: NavGroup[] = [
  { title: 'Charts', items: [{ slug: 'charts' }] },
  { title: 'App shell', items: [{ slug: 'app-frame' }] },
];
