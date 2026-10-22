// Docs pages for the data group (Card, Stat, Table, DataTable, Pagination, EmptyState, Skeleton, Progress,
// Alert, Accordion, KanbanBoard, Timeline). Live previews import straight from @krackedui/motion; every `code` string is the
// complete, copy-paste version of its preview.
import { useState } from 'react';
import {
  Accordion,
  Alert,
  Button,
  Card,
  DataTable,
  EmptyState,
  KanbanBoard,
  Pagination,
  Progress,
  Skeleton,
  Sparkline,
  Stat,
  Table,
  Timeline,
  type DataTableColumn,
  type DataTableSort,
  type KanbanMove,
  type TimelineChange,
  type TimelineItem,
} from '@krackedui/motion';
import type { DocPage, InstallStep, NavGroup, Section } from '../../../../apps/docs/lib/types';

/* ---------------------------------------------------------------- helpers */

const eyebrow = 'Components';

const install = (names: string, usage: string): InstallStep[] => [
  { title: 'Install the design system package:', packages: ['@krackedui/motion'] },
  {
    title: 'Import the styles once, in your app entry or root layout:',
    file: { filename: '/app/layout.tsx', lang: 'tsx', code: `import '@krackedui/motion/styles.css';` },
  },
  {
    title: 'Import the component and render it inside `<Theme>`:',
    file: { filename: '/app/page.tsx', lang: 'tsx', code: `import { Theme, ${names} } from '@krackedui/motion';\n\nexport default function Page() {\n  return (\n    <Theme>\n      ${usage}\n    </Theme>\n  );\n}` },
  },
];

const accessibility = (keys: string[], notes: string[]): Section => ({
  title: 'Accessibility',
  blocks: [
    ...(keys.length ? ['Keyboard:', { list: keys }] : ['No keyboard interaction of its own.']),
    'ARIA and semantics:',
    { list: notes },
  ],
});

const usage = (use: string[], avoid: string[]): Section => ({
  title: 'Usage',
  blocks: ['Use it for:', { list: use }, 'Avoid it when:', { list: avoid }],
});

const base = [
  { name: 'className', type: 'string', description: 'Extra classes, merged with `cn`.' },
];

/* ---------------------------------------------------------------- sample data */

interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  account: string;
  amount: number;
}

const transactions: Transaction[] = [
  { id: 'tx-1041', date: '2026-10-18', merchant: 'Northwind Coffee', category: 'Food', account: 'Checking', amount: -4.8 },
  { id: 'tx-1040', date: '2026-10-17', merchant: 'Acme Payroll', category: 'Income', account: 'Checking', amount: 4250 },
  { id: 'tx-1039', date: '2026-10-16', merchant: 'Metro Transit', category: 'Transport', account: 'Card •• 4411', amount: -32 },
  { id: 'tx-1038', date: '2026-10-15', merchant: 'Greenleaf Market', category: 'Food', account: 'Card •• 4411', amount: -86.45 },
  { id: 'tx-1037', date: '2026-10-14', merchant: 'Cloudhost', category: 'Software', account: 'Card •• 4411', amount: -24 },
  { id: 'tx-1036', date: '2026-10-12', merchant: 'City Apartments', category: 'Housing', account: 'Checking', amount: -1450 },
  { id: 'tx-1035', date: '2026-10-11', merchant: 'Bright Books', category: 'Shopping', account: 'Card •• 4411', amount: -18.99 },
  { id: 'tx-1034', date: '2026-10-09', merchant: 'Freelance invoice #208', category: 'Income', account: 'Savings', amount: 900 },
  { id: 'tx-1033', date: '2026-10-08', merchant: 'Power & Light', category: 'Utilities', account: 'Checking', amount: -64.2 },
  { id: 'tx-1032', date: '2026-10-06', merchant: 'Northwind Coffee', category: 'Food', account: 'Card •• 4411', amount: -5.1 },
  { id: 'tx-1031', date: '2026-10-04', merchant: 'Fitness Club', category: 'Health', account: 'Card •• 4411', amount: -45 },
  { id: 'tx-1030', date: '2026-10-02', merchant: 'Metro Transit', category: 'Transport', account: 'Card •• 4411', amount: -32 },
];

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const shortDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const txColumns: DataTableColumn<Transaction>[] = [
  { key: 'date', header: 'Date', sortable: true, width: 96, cell: (t) => shortDate(t.date) },
  { key: 'merchant', header: 'Merchant', sortable: true },
  { key: 'category', header: 'Category', sortable: true, hideBelow: 'sm' },
  { key: 'account', header: 'Account', hideBelow: 'md' },
  {
    key: 'amount',
    header: 'Amount',
    sortable: true,
    align: 'end',
    cell: (t) => <span className={t.amount > 0 ? 'text-n-green-text-primary' : undefined}>{usd.format(t.amount)}</span>,
  },
];

const txColumnsCode = `interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  account: string;
  amount: number;
}

const transactions: Transaction[] = [
  { id: 'tx-1041', date: '2026-10-18', merchant: 'Northwind Coffee', category: 'Food', account: 'Checking', amount: -4.8 },
  { id: 'tx-1040', date: '2026-10-17', merchant: 'Acme Payroll', category: 'Income', account: 'Checking', amount: 4250 },
  { id: 'tx-1039', date: '2026-10-16', merchant: 'Metro Transit', category: 'Transport', account: 'Card •• 4411', amount: -32 },
  { id: 'tx-1038', date: '2026-10-15', merchant: 'Greenleaf Market', category: 'Food', account: 'Card •• 4411', amount: -86.45 },
  { id: 'tx-1037', date: '2026-10-14', merchant: 'Cloudhost', category: 'Software', account: 'Card •• 4411', amount: -24 },
  { id: 'tx-1036', date: '2026-10-12', merchant: 'City Apartments', category: 'Housing', account: 'Checking', amount: -1450 },
  { id: 'tx-1035', date: '2026-10-11', merchant: 'Bright Books', category: 'Shopping', account: 'Card •• 4411', amount: -18.99 },
  { id: 'tx-1034', date: '2026-10-09', merchant: 'Freelance invoice #208', category: 'Income', account: 'Savings', amount: 900 },
  { id: 'tx-1033', date: '2026-10-08', merchant: 'Power & Light', category: 'Utilities', account: 'Checking', amount: -64.2 },
  { id: 'tx-1032', date: '2026-10-06', merchant: 'Northwind Coffee', category: 'Food', account: 'Card •• 4411', amount: -5.1 },
  { id: 'tx-1031', date: '2026-10-04', merchant: 'Fitness Club', category: 'Health', account: 'Card •• 4411', amount: -45 },
  { id: 'tx-1030', date: '2026-10-02', merchant: 'Metro Transit', category: 'Transport', account: 'Card •• 4411', amount: -32 },
];

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const shortDate = (iso: string) => new Date(\`\${iso}T00:00:00\`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const columns: DataTableColumn<Transaction>[] = [
  { key: 'date', header: 'Date', sortable: true, width: 96, cell: (t) => shortDate(t.date) },
  { key: 'merchant', header: 'Merchant', sortable: true },
  { key: 'category', header: 'Category', sortable: true, hideBelow: 'sm' },
  { key: 'account', header: 'Account', hideBelow: 'md' },
  {
    key: 'amount',
    header: 'Amount',
    sortable: true,
    align: 'end',
    cell: (t) => <span className={t.amount > 0 ? 'text-n-green-text-primary' : undefined}>{usd.format(t.amount)}</span>,
  },
];`;

/* ================================================================== CARD */

const cardPage: DocPage = {
  eyebrow,
  title: 'Card',
  description: 'A quiet surface that groups related content: a hairline border, an 8px radius and no shadow. Compose a header, content and footer inside.',
  install: install('Card', `<Card.Root>\n        <Card.Header><Card.Title>Budget</Card.Title></Card.Header>\n        <Card.Content>$1,240 of $2,000 spent</Card.Content>\n      </Card.Root>`),
  examples: [
    {
      title: 'Basic',
      render: () => (
        <Card.Root className="w-full max-w-sm">
          <Card.Header>
            <Card.Title>October budget</Card.Title>
            <Card.Description>Household · resets Nov 1</Card.Description>
          </Card.Header>
          <Card.Content>
            <Progress label="Spent" value={1240} max={2000} valueText="$1,240 of $2,000" />
          </Card.Content>
          <Card.Footer>
            <Button size="sm" variant="secondary">Adjust budget</Button>
          </Card.Footer>
        </Card.Root>
      ),
      code: `import { Button, Card, Progress } from '@krackedui/motion';

export function BudgetCard() {
  return (
    <Card.Root className="w-full max-w-sm">
      <Card.Header>
        <Card.Title>October budget</Card.Title>
        <Card.Description>Household · resets Nov 1</Card.Description>
      </Card.Header>
      <Card.Content>
        <Progress label="Spent" value={1240} max={2000} valueText="$1,240 of $2,000" />
      </Card.Content>
      <Card.Footer>
        <Button size="sm" variant="secondary">Adjust budget</Button>
      </Card.Footer>
    </Card.Root>
  );
}`,
    },
    {
      title: 'Header action',
      description: '`Card.Header action` puts a control at the right of the title; it wraps under the title when the card is narrow.',
      render: () => (
        <Card.Root className="w-full max-w-md">
          <Card.Header action={<Button size="sm" variant="ghost" trailingIcon="chevronRight">View all</Button>}>
            <Card.Title asChild><h3>Recent payments</h3></Card.Title>
            <Card.Description>Last 7 days</Card.Description>
          </Card.Header>
          <Card.Content>3 payments, $1,204.50 in total</Card.Content>
        </Card.Root>
      ),
      code: `import { Button, Card } from '@krackedui/motion';

export function RecentPaymentsCard() {
  return (
    <Card.Root className="w-full max-w-md">
      <Card.Header action={<Button size="sm" variant="ghost" trailingIcon="chevronRight">View all</Button>}>
        <Card.Title asChild><h3>Recent payments</h3></Card.Title>
        <Card.Description>Last 7 days</Card.Description>
      </Card.Header>
      <Card.Content>3 payments, $1,204.50 in total</Card.Content>
    </Card.Root>
  );
}`,
    },
    {
      title: 'Interactive (link card)',
      description: 'With `interactive` and `asChild` the whole card is one link: hover wash, pressed state and a focus ring. Keep other links and buttons out of it.',
      render: () => (
        <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
          <Card.Root interactive asChild>
            <a href="#project-website">
              <Card.Header>
                <Card.Title>Website redesign</Card.Title>
                <Card.Description>12 open tasks · due Nov 30</Card.Description>
              </Card.Header>
            </a>
          </Card.Root>
          <Card.Root interactive asChild>
            <a href="#project-onboarding">
              <Card.Header>
                <Card.Title>Onboarding flow</Card.Title>
                <Card.Description>4 open tasks · due Dec 12</Card.Description>
              </Card.Header>
            </a>
          </Card.Root>
        </div>
      ),
      code: `import { Card } from '@krackedui/motion';

export function ProjectCards() {
  return (
    <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
      <Card.Root interactive asChild>
        <a href="#project-website">
          <Card.Header>
            <Card.Title>Website redesign</Card.Title>
            <Card.Description>12 open tasks · due Nov 30</Card.Description>
          </Card.Header>
        </a>
      </Card.Root>
      <Card.Root interactive asChild>
        <a href="#project-onboarding">
          <Card.Header>
            <Card.Title>Onboarding flow</Card.Title>
            <Card.Description>4 open tasks · due Dec 12</Card.Description>
          </Card.Header>
        </a>
      </Card.Root>
    </div>
  );
}`,
    },
  ],
  api: [
    {
      name: 'Card.Root',
      description: 'A `<div>` (or its child with `asChild`); all `<div>` props are forwarded.',
      props: [
        { name: 'interactive', type: 'boolean', default: 'false', description: 'Hover and pressed washes plus a focus ring, for a card that is a single link or button.' },
        { name: 'asChild', type: 'boolean', default: 'false', description: 'Render the child element (e.g. `<a>`) with the card styles.' },
        ...base,
      ],
    },
    {
      name: 'Card.Header / Title / Description / Content / Footer',
      description: 'Layout parts (`<div>` by default). Footer has a top hairline; Title is 16px semibold.',
      props: [
        { name: 'action', type: 'ReactNode', description: 'Card.Header only: a right-aligned control next to the title ("View all", a SegmentedControl, a "…" menu). Wraps under the title when the card is narrow.' },
        { name: 'asChild', type: 'boolean', default: 'false', description: 'Render the child element, e.g. `<Card.Title asChild><h2>…</h2></Card.Title>` for a real heading (ignored on a Header with `action`).' },
        ...base,
      ],
    },
  ],
  sections: [
    accessibility(
      ['Tab: focuses an interactive card (it is the link or button itself).'],
      [
        'A plain card has no role; give its title a heading element with `asChild` when it starts a section.',
        'An interactive card must wrap exactly one link or button and contain no other interactive elements (no nested controls).',
        'The focus ring uses Motion’s focus shadow; it is visible in both themes.',
      ],
    ),
    usage(
      ['Grouping a metric, a chart or a short list on a dashboard.', 'A grid of entries that each open one thing (project, account).'],
      ['The content is the whole page: use the page layout instead.', 'You would nest a card in a card: use a Divider or spacing.', 'The card would hold several actions and also be clickable.'],
    ),
  ],
};

/* ================================================================== STAT */

const statPage: DocPage = {
  eyebrow,
  title: 'Stat',
  description: 'A key metric: label, a large tabular value, a delta chip whose color follows whether the change is good, and a line of context.',
  install: install('Stat', `<Stat label="Revenue" value="$48,200" delta="+4.2%" trend="up" description="vs last month" />`),
  examples: [
    {
      title: 'KPI grid',
      description: '`upIsGood={false}` turns a rising cost red and a falling one green.',
      render: () => (
        <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3">
          <Card.Root><Card.Content><Stat icon="wallet" label="Balance" value="$12,480.20" delta="+$1,120" trend="up" description="this month" /></Card.Content></Card.Root>
          <Card.Root><Card.Content><Stat icon="trendingUp" label="Income" value="$5,150.00" delta="+4.2%" trend="up" description="vs September" /></Card.Content></Card.Root>
          <Card.Root><Card.Content><Stat icon="creditCard" label="Spending" value="$1,808.54" delta="+12%" trend="up" upIsGood={false} description="vs September" /></Card.Content></Card.Root>
          <Card.Root><Card.Content><Stat icon="receipt" label="Subscriptions" value="$64.00" delta="0%" trend="flat" description="4 active" /></Card.Content></Card.Root>
        </div>
      ),
      code: `import { Card, Stat } from '@krackedui/motion';

export function KpiGrid() {
  return (
    <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3">
      <Card.Root><Card.Content><Stat icon="wallet" label="Balance" value="$12,480.20" delta="+$1,120" trend="up" description="this month" /></Card.Content></Card.Root>
      <Card.Root><Card.Content><Stat icon="trendingUp" label="Income" value="$5,150.00" delta="+4.2%" trend="up" description="vs September" /></Card.Content></Card.Root>
      <Card.Root><Card.Content><Stat icon="creditCard" label="Spending" value="$1,808.54" delta="+12%" trend="up" upIsGood={false} description="vs September" /></Card.Content></Card.Root>
      <Card.Root><Card.Content><Stat icon="receipt" label="Subscriptions" value="$64.00" delta="0%" trend="flat" description="4 active" /></Card.Content></Card.Root>
    </div>
  );
}`,
    },
    {
      title: 'With a sparkline',
      description: '`chart` renders under the meta row; give the Sparkline its own `label`.',
      render: () => (
        <Card.Root className="w-full max-w-xs">
          <Card.Content>
            <Stat label="Revenue" value="$48.2k" delta="+12%" trend="up" description="vs last month" chart={<Sparkline label="Revenue, last 8 weeks" data={[31, 34, 33, 38, 41, 40, 45, 48]} tone="success" />} />
          </Card.Content>
        </Card.Root>
      ),
      code: `import { Card, Sparkline, Stat } from '@krackedui/motion';

export function RevenueKpi() {
  return (
    <Card.Root className="w-full max-w-xs">
      <Card.Content>
        <Stat
          label="Revenue"
          value="$48.2k"
          delta="+12%"
          trend="up"
          description="vs last month"
          chart={<Sparkline label="Revenue, last 8 weeks" data={[31, 34, 33, 38, 41, 40, 45, 48]} tone="success" />}
        />
      </Card.Content>
    </Card.Root>
  );
}`,
    },
    {
      title: 'Project metrics',
      render: () => (
        <div className="flex w-full flex-wrap gap-x-10 gap-y-4">
          <Stat label="Open tasks" value={38} delta="-6" trend="down" upIsGood={false} description="since Monday" />
          <Stat label="Completed" value={112} delta="+18" trend="up" description="this sprint" />
          <Stat label="Cycle time" value="3.4 days" delta="+0.6" trend="up" upIsGood={false} />
        </div>
      ),
      code: `import { Stat } from '@krackedui/motion';

export function ProjectMetrics() {
  return (
    <div className="flex w-full flex-wrap gap-x-10 gap-y-4">
      <Stat label="Open tasks" value={38} delta="-6" trend="down" upIsGood={false} description="since Monday" />
      <Stat label="Completed" value={112} delta="+18" trend="up" description="this sprint" />
      <Stat label="Cycle time" value="3.4 days" delta="+0.6" trend="up" upIsGood={false} />
    </div>
  );
}`,
    },
  ],
  api: [
    {
      name: 'Stat',
      description: 'A `<div>`; other `<div>` props are forwarded.',
      props: [
        { name: 'label', type: 'ReactNode', description: 'What the number is.' },
        { name: 'value', type: 'ReactNode', description: 'The metric, already formatted. Rendered with tabular numbers.' },
        { name: 'delta', type: 'ReactNode', description: 'Change vs the previous period, e.g. "+4.2%".' },
        { name: 'trend', type: ['"up"', '"down"', '"flat"'], description: 'Direction of the change: sets the arrow, the spoken word and (with `upIsGood`) the tone.' },
        { name: 'upIsGood', type: 'boolean', default: 'true', description: 'Whether up is good (revenue) or bad (costs).' },
        { name: 'deltaTone', type: ['"neutral"', '"accent"', '"success"', '"warning"', '"danger"', '"info"'], description: 'Overrides the tone derived from `trend` and `upIsGood`.' },
        { name: 'description', type: 'ReactNode', description: 'Context after the delta, e.g. "vs last month".' },
        { name: 'icon', type: 'IconName', description: 'Icon before the label.' },
        { name: 'chart', type: 'ReactNode', description: 'A small chart under the meta row, usually a `<Sparkline label="…">` of the same metric.' },
        ...base,
      ],
    },
  ],
  sections: [
    accessibility([], [
      'The trend is also spoken as a word ("Up", "Down", "No change") before the delta, so it never relies on the arrow or the color.',
      'Icons are decorative (`aria-hidden`).',
      'Values use tabular numbers so columns of stats line up.',
    ]),
    usage(
      ['The 2–6 numbers a dashboard is about.', 'Showing a change and whether it is good or bad.'],
      ['The number needs its history: pair it with a Sparkline or use a LineChart.', 'You have many numbers: use a Table.'],
    ),
  ],
};

/* ================================================================== TABLE */

const invoiceRows = [
  { id: 'INV-208', client: 'Acme Corp', status: 'Paid', amount: 4200 },
  { id: 'INV-209', client: 'Globex', status: 'Due Nov 2', amount: 1850 },
  { id: 'INV-210', client: 'Initech', status: 'Overdue', amount: 960 },
];

function SortableTableDemo() {
  const [dir, setDir] = useState<'asc' | 'desc' | false>(false);
  const sorted = dir ? [...invoiceRows].sort((a, b) => (dir === 'asc' ? a.amount - b.amount : b.amount - a.amount)) : invoiceRows;
  return (
    <Table.Root aria-label="Invoices" className="min-w-[420px]">
      <Table.Header>
        <Table.Row>
          <Table.Head>Invoice</Table.Head>
          <Table.Head>Client</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head align="end" sort={dir} onSort={() => setDir(dir === 'asc' ? 'desc' : dir === 'desc' ? false : 'asc')}>Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sorted.map((r) => (
          <Table.Row key={r.id}>
            <Table.Cell className="text-n-text-secondary">{r.id}</Table.Cell>
            <Table.Cell>{r.client}</Table.Cell>
            <Table.Cell>{r.status}</Table.Cell>
            <Table.Cell align="end">{usd.format(r.amount)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Cell colSpan={3}>Total</Table.Cell>
          <Table.Cell align="end">{usd.format(7010)}</Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table.Root>
  );
}

const tablePage: DocPage = {
  eyebrow,
  title: 'Table',
  description: 'Styled table primitives in the look of Motion’s database table: 36px rows, hairline rules, a quiet header. The table scrolls inside its own container on small screens.',
  install: install('Table', `<Table.Root aria-label="Invoices">…</Table.Root>`),
  examples: [
    {
      title: 'Sortable header and footer',
      description: 'A header with `onSort` becomes a button and its cell gets `aria-sort`. Sorting itself is yours; DataTable does it for you.',
      align: 'start',
      render: () => <SortableTableDemo />,
      code: `import { useState } from 'react';
import { Table } from '@krackedui/motion';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const invoiceRows = [
  { id: 'INV-208', client: 'Acme Corp', status: 'Paid', amount: 4200 },
  { id: 'INV-209', client: 'Globex', status: 'Due Nov 2', amount: 1850 },
  { id: 'INV-210', client: 'Initech', status: 'Overdue', amount: 960 },
];

export function InvoicesTable() {
  const [dir, setDir] = useState<'asc' | 'desc' | false>(false);
  const sorted = dir ? [...invoiceRows].sort((a, b) => (dir === 'asc' ? a.amount - b.amount : b.amount - a.amount)) : invoiceRows;
  return (
    <Table.Root aria-label="Invoices" className="min-w-[420px]">
      <Table.Header>
        <Table.Row>
          <Table.Head>Invoice</Table.Head>
          <Table.Head>Client</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head align="end" sort={dir} onSort={() => setDir(dir === 'asc' ? 'desc' : dir === 'desc' ? false : 'asc')}>Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sorted.map((r) => (
          <Table.Row key={r.id}>
            <Table.Cell className="text-n-text-secondary">{r.id}</Table.Cell>
            <Table.Cell>{r.client}</Table.Cell>
            <Table.Cell>{r.status}</Table.Cell>
            <Table.Cell align="end">{usd.format(r.amount)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Cell colSpan={3}>Total</Table.Cell>
          <Table.Cell align="end">{usd.format(7010)}</Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table.Root>
  );
}`,
    },
    {
      title: 'Comfortable density',
      align: 'start',
      render: () => (
        <Table.Root aria-label="Team" density="comfortable">
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Role</Table.Head>
              <Table.Head align="end">Hours</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row><Table.Cell>Ada Lovelace</Table.Cell><Table.Cell>Engineering</Table.Cell><Table.Cell align="end">34</Table.Cell></Table.Row>
            <Table.Row selected><Table.Cell>Grace Hopper</Table.Cell><Table.Cell>Design</Table.Cell><Table.Cell align="end">28</Table.Cell></Table.Row>
          </Table.Body>
        </Table.Root>
      ),
      code: `import { Table } from '@krackedui/motion';

export function TeamTable() {
  return (
    <Table.Root aria-label="Team" density="comfortable">
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Role</Table.Head>
          <Table.Head align="end">Hours</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row><Table.Cell>Ada Lovelace</Table.Cell><Table.Cell>Engineering</Table.Cell><Table.Cell align="end">34</Table.Cell></Table.Row>
        <Table.Row selected><Table.Cell>Grace Hopper</Table.Cell><Table.Cell>Design</Table.Cell><Table.Cell align="end">28</Table.Cell></Table.Row>
      </Table.Body>
    </Table.Root>
  );
}`,
    },
  ],
  api: [
    {
      name: 'Table.Root',
      description: 'The `<table>` (ref and `<table>` props), wrapped in a horizontal scroll container.',
      props: [
        { name: 'density', type: ['"compact"', '"comfortable"'], default: '"compact"', description: '36px rows (database look) or 44px rows with more padding.' },
        { name: 'containerClassName', type: 'string', description: 'Classes for the scroll container (e.g. `max-h-80` so the sticky header has something to stick in).' },
        { name: 'containerStyle', type: 'CSSProperties', description: 'Inline styles for the scroll container.' },
        { name: 'aria-label', type: 'string', description: 'Names the table and, when it overflows, its scroll region.' },
        ...base,
      ],
    },
    { name: 'Table.Header / Body / Footer', description: '`<thead>`, `<tbody>`, `<tfoot>`. Header cells stick to the top of the scroll container.', props: [...base] },
    {
      name: 'Table.Row',
      description: '`<tr>`; other `<tr>` props are forwarded.',
      props: [
        { name: 'selected', type: 'boolean', default: 'false', description: 'Blue selection wash (`data-state="selected"`). Pair it with a checkbox so the state is announced.' },
        { name: 'onClick', type: '(event) => void', description: 'Whole-row activation. Clicks on links, buttons and inputs inside the row are ignored.' },
        { name: 'focusable', type: 'boolean', default: 'true', description: 'With `onClick`, the row is a tab stop activated by Enter / Space. Set `false` when the row already holds an equivalent button.' },
        ...base,
      ],
    },
    {
      name: 'Table.Head',
      description: '`<th scope="col">`; other `<th>` props are forwarded.',
      props: [
        { name: 'align', type: ['"start"', '"center"', '"end"'], default: '"start"', description: 'Text alignment; use `end` for numbers.' },
        { name: 'sort', type: ['"asc"', '"desc"', 'false'], description: 'Current sort of the column (`false` = sortable, not sorted).' },
        { name: 'onSort', type: '() => void', description: 'Makes the label a sort button and sets `aria-sort` on the cell.' },
        ...base,
      ],
    },
    {
      name: 'Table.Cell',
      description: '`<td>`; other `<td>` props are forwarded. Cells do not wrap (the table scrolls instead, like the database table); add `whitespace-normal` for long text.',
      props: [{ name: 'align', type: ['"start"', '"center"', '"end"'], default: '"start"', description: 'Text alignment.' }, ...base],
    },
  ],
  sections: [
    accessibility(
      [
        'Tab: reaches sort buttons, and the scroll container when the table is wider than the screen (then ← → scroll it).',
        'Enter / Space: on a sort button, sorts; on a clickable row (`onClick`, `focusable`), activates it.',
      ],
      [
        'Native table semantics: `<table>`, `<th scope="col">`, `<td>`, so screen readers announce headers with each cell.',
        'Sortable headers expose `aria-sort` (`none`, `ascending`, `descending`) on the `<th>`; the sort control is a real `<button>`.',
        'When content overflows, the container becomes `role="region"` with a label and `tabIndex=0`, so keyboard users can scroll it.',
        'Name the table with `aria-label` (or a `<caption>`).',
      ],
    ),
    usage(
      ['Static or hand-assembled tabular data (invoices, a pricing table).', 'Building your own data grid with custom rows.'],
      ['You need sorting, selection, loading and empty states from data: use DataTable.', 'Layout that is not tabular: use Grid or Stack.'],
    ),
  ],
};

/* ================================================================== DATA TABLE */

function TransactionsDemo() {
  const [sort, setSort] = useState<DataTableSort | null>({ key: 'date', direction: 'desc' });
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const sorted = [...transactions].sort((a, b) => {
    if (!sort) return 0;
    const dir = sort.direction === 'asc' ? 1 : -1;
    const key = sort.key as keyof Transaction;
    const x = a[key];
    const y = b[key];
    return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * dir;
  });
  const pageCount = Math.ceil(sorted.length / pageSize);
  const rows = sorted.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex min-h-7 items-center justify-between gap-2 text-n-ui text-n-text-secondary">
        <span>{selected.length ? `${selected.length} selected` : `${transactions.length} transactions`}</span>
        {selected.length > 0 && <Button size="sm" variant="secondary" onClick={() => setSelected([])}>Clear selection</Button>}
      </div>
      <DataTable
        label="Transactions"
        columns={txColumns}
        rows={rows}
        sort={sort}
        onSortChange={(next) => { setSort(next); setPage(1); }}
        selectedIds={selected}
        onSelectedIdsChange={setSelected}
      />
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}

function StatesDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="flex w-full flex-col gap-3">
      <div>
        <Button size="sm" variant="secondary" onClick={() => setLoading(!loading)}>{loading ? 'Show empty' : 'Show loading'}</Button>
      </div>
      <DataTable
        label="Payouts"
        columns={txColumns}
        rows={[]}
        loading={loading}
        loadingRows={3}
        empty={<EmptyState size="sm" icon="bank" title="No payouts yet" description="Payouts appear here after your first sale." />}
      />
    </div>
  );
}

const dataTablePage: DocPage = {
  eyebrow,
  title: 'DataTable',
  description: 'Columns + rows with sorting, row selection, row click, skeleton loading, an empty state, responsive columns and a sticky header. Built on the Table primitives.',
  install: install('DataTable', `<DataTable label="Transactions" columns={columns} rows={rows} />`),
  examples: [
    {
      title: 'Transactions: sorting, selection and pagination',
      description: 'Controlled sort and selection; the page slices the sorted rows and Pagination moves through them. Category and Account hide on small screens (`hideBelow`).',
      align: 'start',
      render: () => <TransactionsDemo />,
      code: `import { useState } from 'react';
import { Button, DataTable, Pagination, type DataTableColumn, type DataTableSort } from '@krackedui/motion';

${txColumnsCode}

export function Transactions() {
  const [sort, setSort] = useState<DataTableSort | null>({ key: 'date', direction: 'desc' });
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const sorted = [...transactions].sort((a, b) => {
    if (!sort) return 0;
    const dir = sort.direction === 'asc' ? 1 : -1;
    const key = sort.key as keyof Transaction;
    const x = a[key];
    const y = b[key];
    return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * dir;
  });
  const pageCount = Math.ceil(sorted.length / pageSize);
  const rows = sorted.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex min-h-7 items-center justify-between gap-2 text-n-ui text-n-text-secondary">
        <span>{selected.length ? \`\${selected.length} selected\` : \`\${transactions.length} transactions\`}</span>
        {selected.length > 0 && <Button size="sm" variant="secondary" onClick={() => setSelected([])}>Clear selection</Button>}
      </div>
      <DataTable
        label="Transactions"
        columns={columns}
        rows={rows}
        sort={sort}
        onSortChange={(next) => { setSort(next); setPage(1); }}
        selectedIds={selected}
        onSelectedIdsChange={setSelected}
      />
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}`,
    },
    {
      title: 'Uncontrolled sorting, row click and sticky header',
      description: 'Without `sort` the table sorts itself (numbers numerically, text naturally, dates in order). `maxHeight` keeps the header in view. `onRowClick` makes the merchant cell a button.',
      align: 'start',
      render: () => <DataTable label="All transactions" columns={txColumns} rows={transactions} defaultSort={{ key: 'amount', direction: 'asc' }} maxHeight={260} onRowClick={(t) => window.alert(`Open ${t.merchant}`)} />,
      code: `import { DataTable, type DataTableColumn } from '@krackedui/motion';

${txColumnsCode}

export function AllTransactions() {
  return (
    <DataTable
      label="All transactions"
      columns={columns}
      rows={transactions}
      defaultSort={{ key: 'amount', direction: 'asc' }}
      maxHeight={260}
      onRowClick={(t) => window.alert(\`Open \${t.merchant}\`)}
    />
  );
}`,
    },
    {
      title: 'Built-in paging',
      description: '`pageSize` pages the sorted rows and adds a Pagination footer; pass `page` / `onPageChange` to control it. Sorting returns to page 1.',
      align: 'start',
      render: () => <DataTable label="Paged transactions" columns={txColumns} rows={transactions} pageSize={4} defaultSort={{ key: 'amount', direction: 'desc' }} />,
      code: `import { DataTable, type DataTableColumn } from '@krackedui/motion';

${txColumnsCode}

export function PagedTransactions() {
  return <DataTable label="Paged transactions" columns={columns} rows={transactions} pageSize={4} defaultSort={{ key: 'amount', direction: 'desc' }} />;
}`,
    },
    {
      title: 'Loading and empty',
      align: 'start',
      render: () => <StatesDemo />,
      code: `import { useState } from 'react';
import { Button, DataTable, EmptyState, type DataTableColumn } from '@krackedui/motion';

const columns: DataTableColumn<{ id: string; date: string; amount: number }>[] = [
  { key: 'date', header: 'Date' },
  { key: 'amount', header: 'Amount', align: 'end' },
];

export function PayoutsTable() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="flex w-full flex-col gap-3">
      <div>
        <Button size="sm" variant="secondary" onClick={() => setLoading(!loading)}>{loading ? 'Show empty' : 'Show loading'}</Button>
      </div>
      <DataTable
        label="Payouts"
        columns={columns}
        rows={[]}
        loading={loading}
        loadingRows={3}
        empty={<EmptyState size="sm" icon="bank" title="No payouts yet" description="Payouts appear here after your first sale." />}
      />
    </div>
  );
}`,
    },
  ],
  api: [
    {
      name: 'DataTable',
      description: 'Generic over the row type: `DataTable<Row>`.',
      props: [
        { name: 'columns', type: 'DataTableColumn<Row>[]', description: 'Column definitions (see below).' },
        { name: 'rows', type: 'Row[]', description: 'The data.' },
        { name: 'getRowId', type: '(row: Row) => string', description: 'Stable id per row. Defaults to `row.id`, then the index.' },
        { name: 'sort', type: '{ key: string; direction: "asc" | "desc" } | null', description: 'Controlled sort. Omit it to let the table sort by itself.' },
        { name: 'defaultSort', type: 'DataTableSort | null', default: 'null', description: 'Initial sort when uncontrolled.' },
        { name: 'onSortChange', type: '(sort: DataTableSort | null) => void', description: 'Next sort when a header is activated: none → ascending → descending → none.' },
        { name: 'selectedIds', type: 'string[]', description: 'Controlled selection; adds the checkbox column.' },
        { name: 'defaultSelectedIds', type: 'string[]', default: '[]', description: 'Initial selection when uncontrolled.' },
        { name: 'onSelectedIdsChange', type: '(ids: string[]) => void', description: 'Called with the new selection; also adds the checkbox column.' },
        { name: 'selectable', type: 'boolean', default: 'false', description: 'Adds the checkbox column with uncontrolled selection.' },
        { name: 'onRowClick', type: '(row: Row) => void', description: 'Row activation. The first visible cell becomes a button (the keyboard target); clicking elsewhere on the row works too.' },
        { name: 'loading', type: 'boolean', default: 'false', description: 'Skeleton rows, `aria-busy` on the table and a "Loading" status.' },
        { name: 'loadingRows', type: 'number', default: '5', description: 'Number of skeleton rows.' },
        { name: 'empty', type: 'ReactNode', default: '"No results"', description: 'Shown without rows. A string becomes an EmptyState title.' },
        { name: 'density', type: ['"compact"', '"comfortable"'], default: '"compact"', description: 'Row height.' },
        { name: 'maxHeight', type: 'number | string', description: 'Limits the height; the body scrolls under a sticky header.' },
        { name: 'label', type: 'string', description: 'Accessible name of the table.' },
        { name: 'getRowLabel', type: '(row: Row) => string', description: 'Name for a row’s checkbox ("Select …"). Defaults to the first column’s text.' },
        { name: 'pageSize', type: 'number', description: 'Rows per page: turns on built-in paging of the sorted rows, with a Pagination footer when there is more than one page.' },
        { name: 'page', type: 'number', description: 'Controlled current page (1-based); clamped to the page count.' },
        { name: 'defaultPage', type: 'number', default: '1', description: 'Initial page when uncontrolled.' },
        { name: 'onPageChange', type: '(page: number) => void', description: 'Called with the new page; sorting returns to page 1.' },
        { name: 'ref', type: 'Ref<HTMLTableElement>', description: 'The `<table>` element.' },
        { name: 'style', type: 'CSSProperties', description: 'Styles for the outer wrapper.' },
        { name: 'id', type: 'string', description: 'Id of the outer wrapper.' },
        ...base,
      ],
    },
    {
      name: 'DataTableColumn',
      description: 'One column definition.',
      props: [
        { name: 'key', type: 'string', description: 'Row field to show and sort by; also the column id.' },
        { name: 'header', type: 'ReactNode', description: 'Header content.' },
        { name: 'cell', type: '(row: Row) => ReactNode', description: 'Custom cell. Defaults to the field as text.' },
        { name: 'sortValue', type: '(row: Row) => string | number | boolean | Date | null', description: 'Value to sort by when the cell is custom.' },
        { name: 'align', type: ['"start"', '"center"', '"end"'], default: '"start"', description: 'Alignment of header and cells.' },
        { name: 'sortable', type: 'boolean', default: 'false', description: 'Header becomes a sort button.' },
        { name: 'width', type: 'number | string', description: 'Column width (number = px).' },
        { name: 'hideBelow', type: ['"sm"', '"md"', '"lg"'], description: 'Hide while the table is narrower than 640 / 768 / 1024 px (a container query on the table, so it also works in narrow cards).' },
      ],
    },
  ],
  sections: [
    accessibility(
      [
        'Tab: header checkbox → sort buttons → each row’s checkbox and row button, in reading order.',
        'Space: toggles a checkbox. Enter / Space on a sort button cycles the sort; on a row button, opens the row.',
        '← →: scroll the table container when it is wider than the screen.',
      ],
      [
        'Native table semantics with `aria-sort` on sortable headers.',
        'The select-all checkbox is mixed (indeterminate) when some rows on the page are selected.',
        'Row checkboxes are named "Select <first column text>" (override with `getRowLabel`).',
        'Row click never nests controls: the keyboard target is one button in the first cell, and clicks on other controls in the row are ignored.',
        'While loading, the table is `aria-busy` and a polite status says "Loading"; skeletons are hidden from assistive technology.',
      ],
    ),
    usage(
      ['Lists of records people scan, sort and act on (transactions, tasks, invoices).', 'Bulk actions on a selection.'],
      ['Fewer than ~5 rows of reference data: a plain Table or a list reads better.', 'Cells need inline editing like a spreadsheet: use the database TableView module.', 'Cards with images or rich previews: use a Grid of Cards.'],
    ),
  ],
};

/* ================================================================== PAGINATION */

function PaginationDemo({ initial, pageCount, label }: { initial: number; pageCount: number; label: string }) {
  const [page, setPage] = useState(initial);
  return <Pagination label={label} page={page} pageCount={pageCount} onPageChange={setPage} />;
}

const paginationPage: DocPage = {
  eyebrow,
  title: 'Pagination',
  description: 'Previous / next and page numbers with ellipses for long ranges. Under 640px it collapses to "Page 3 of 10" between the arrows.',
  install: install('Pagination', `<Pagination page={1} pageCount={10} onPageChange={() => {}} />`),
  examples: [
    {
      title: 'Basic',
      render: () => <PaginationDemo label="Invoices pages" initial={3} pageCount={10} />,
      code: `import { useState } from 'react';
import { Pagination } from '@krackedui/motion';

export function Pager() {
  const [page, setPage] = useState(3);
  return <Pagination label="Invoices pages" page={page} pageCount={10} onPageChange={setPage} />;
}`,
    },
    {
      title: 'Few pages',
      render: () => <PaginationDemo label="Team pages" initial={1} pageCount={4} />,
      code: `import { useState } from 'react';
import { Pagination } from '@krackedui/motion';

export function ShortPager() {
  const [page, setPage] = useState(1);
  return <Pagination label="Team pages" page={page} pageCount={4} onPageChange={setPage} />;
}`,
    },
  ],
  api: [
    {
      name: 'Pagination',
      description: 'A `<nav>`; other `<nav>` props are forwarded.',
      props: [
        { name: 'page', type: 'number', description: 'Current page, 1-based.' },
        { name: 'pageCount', type: 'number', description: 'Number of pages.' },
        { name: 'onPageChange', type: '(page: number) => void', description: 'Called with the requested page.' },
        { name: 'siblingCount', type: 'number', default: '1', description: 'Pages shown on each side of the current one.' },
        { name: 'label', type: 'string', default: '"Pagination"', description: 'Accessible name of the navigation landmark. Give each one a unique name when a page has several.' },
        ...base,
      ],
    },
  ],
  sections: [
    accessibility(
      ['Tab / Shift+Tab: move between previous, page and next buttons.', 'Enter / Space: go to that page.'],
      [
        '`<nav aria-label="Pagination">` landmark with a list of buttons.',
        'The current page has `aria-current="page"`; page buttons are named "Page N".',
        'Previous / next are disabled (not hidden) at the ends.',
        'A polite live region reads "Page N of M" after a change; ellipses are hidden from assistive technology.',
        'Under coarse pointers the buttons grow to 36px.',
      ],
    ),
    usage(
      ['Long tables and lists where people jump to a position.', 'Server-paged data.'],
      ['Feeds people read top to bottom: load more on scroll or with a button.', 'Two or three pages of a small list: show everything.'],
    ),
  ],
};

/* ================================================================== EMPTY STATE */

const emptyStatePage: DocPage = {
  eyebrow,
  title: 'EmptyState',
  description: 'What to show when there is nothing yet: a quiet icon, a one-line title, a sentence of help and the next action.',
  install: install('EmptyState', `<EmptyState icon="inbox" title="No transactions yet" />`),
  examples: [
    {
      title: 'With action',
      render: () => (
        <EmptyState
          icon="bank"
          title="No accounts connected"
          description="Connect a bank account to import transactions automatically."
          action={<Button variant="primary">Connect account</Button>}
        />
      ),
      code: `import { Button, EmptyState } from '@krackedui/motion';

export function NoAccounts() {
  return (
    <EmptyState
      icon="bank"
      title="No accounts connected"
      description="Connect a bank account to import transactions automatically."
      action={<Button variant="primary">Connect account</Button>}
    />
  );
}`,
    },
    {
      title: 'Small, inside a card',
      render: () => (
        <Card.Root className="w-full max-w-sm">
          <Card.Header><Card.Title>Tasks due this week</Card.Title></Card.Header>
          <Card.Content><EmptyState size="sm" icon="check" title="All caught up" description="Nothing is due before Friday." /></Card.Content>
        </Card.Root>
      ),
      code: `import { Card, EmptyState } from '@krackedui/motion';

export function NoTasks() {
  return (
    <Card.Root className="w-full max-w-sm">
      <Card.Header><Card.Title>Tasks due this week</Card.Title></Card.Header>
      <Card.Content><EmptyState size="sm" icon="check" title="All caught up" description="Nothing is due before Friday." /></Card.Content>
    </Card.Root>
  );
}`,
    },
  ],
  api: [
    {
      name: 'EmptyState',
      description: 'A `<div>`; other `<div>` props are forwarded. Children render under the description.',
      props: [
        { name: 'icon', type: 'IconName', description: 'Decorative icon in a soft tile.' },
        { name: 'title', type: 'ReactNode', description: 'One line: what is empty.' },
        { name: 'description', type: 'ReactNode', description: 'Why, and what to do.' },
        { name: 'action', type: 'ReactNode', description: 'The next step, usually a primary Button.' },
        { name: 'size', type: ['"sm"', '"md"'], default: '"md"', description: '`sm` for cards and table bodies.' },
        ...base,
      ],
    },
  ],
  sections: [
    accessibility([], ['Title and description are plain text in reading order; the icon is decorative.', 'The action is whatever you pass (a real button or link), so it keeps its own semantics.']),
    usage(['First-run states with a clear next action.', 'No search or filter results (say how to widen the search).'], ['Something failed: use an Alert with a retry.', 'Content is loading: use Skeleton.']),
  ],
};

/* ================================================================== SKELETON */

const skeletonPage: DocPage = {
  eyebrow,
  title: 'Skeleton',
  description: 'A loading placeholder shaped like the content: a quiet grey block or a few text lines that pulse gently, and hold still under reduced motion.',
  install: install('Skeleton', `<Skeleton lines={3} />`),
  examples: [
    {
      title: 'Card placeholder',
      render: () => (
        <Card.Root className="w-full max-w-sm" aria-busy="true">
          <Card.Header>
            <Skeleton width="40%" height={16} />
          </Card.Header>
          <Card.Content className="flex items-center gap-3">
            <Skeleton width={40} height={40} radius="full" />
            <Skeleton lines={2} className="flex-1" />
          </Card.Content>
          <span className="sr-only" role="status">Loading account</span>
        </Card.Root>
      ),
      code: `import { Card, Skeleton } from '@krackedui/motion';

export function AccountLoading() {
  return (
    <Card.Root className="w-full max-w-sm" aria-busy="true">
      <Card.Header>
        <Skeleton width="40%" height={16} />
      </Card.Header>
      <Card.Content className="flex items-center gap-3">
        <Skeleton width={40} height={40} radius="full" />
        <Skeleton lines={2} className="flex-1" />
      </Card.Content>
      <span className="sr-only" role="status">Loading account</span>
    </Card.Root>
  );
}`,
    },
    {
      title: 'Shapes',
      render: () => (
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Skeleton height={120} radius="lg" />
          <Skeleton lines={4} />
        </div>
      ),
      code: `import { Skeleton } from '@krackedui/motion';

export function ArticleLoading() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Skeleton height={120} radius="lg" />
      <Skeleton lines={4} />
    </div>
  );
}`,
    },
  ],
  api: [
    {
      name: 'Skeleton',
      description: 'A `<div>` (`aria-hidden`); other `<div>` props are forwarded.',
      props: [
        { name: 'width', type: 'number | string', default: '"100%"', description: 'Width (number = px).' },
        { name: 'height', type: 'number | string', default: '20px (12px per line)', description: 'Height of the block, or of each line.' },
        { name: 'radius', type: ['"sm"', '"md"', '"lg"', '"full"'], default: '"sm"', description: 'Corner radius.' },
        { name: 'lines', type: 'number', description: 'Render N text lines (the last one shorter) instead of one block.' },
        { name: 'style', type: 'CSSProperties', description: 'Inline styles.' },
        ...base,
      ],
    },
  ],
  sections: [
    accessibility([], [
      'Skeletons are `aria-hidden`: mark the loading region with `aria-busy="true"` and add a short text status (`role="status"`) for screen readers.',
      'The pulse stops under `prefers-reduced-motion: reduce`.',
    ]),
    usage(['Content that takes more than ~300ms and has a known shape.', 'Table rows while data loads (DataTable does this).'], ['Unknown layout or a short wait: use Spinner.', 'Long operations with progress: use Progress.']),
  ],
};

/* ================================================================== PROGRESS */

const budgets = [
  { label: 'Groceries', spent: 412, budget: 500 },
  { label: 'Dining out', spent: 238, budget: 200 },
  { label: 'Transport', spent: 64, budget: 150 },
];

const progressPage: DocPage = {
  eyebrow,
  title: 'Progress',
  description: 'A determinate progress bar with a label and a value. The fill uses the tone color and grows with a short transition.',
  install: install('Progress', `<Progress label="Upload" value={42} />`),
  examples: [
    {
      title: 'Budgets',
      description: 'Tone by state: on track, close to the limit, over budget. `valueText` shows (and announces) the real amounts.',
      render: () => (
        <div className="flex w-full max-w-sm flex-col gap-4">
          {budgets.map((b) => {
            const ratio = b.spent / b.budget;
            return (
              <Progress
                key={b.label}
                label={b.label}
                value={b.spent}
                max={b.budget}
                tone={ratio > 1 ? 'danger' : ratio > 0.8 ? 'warning' : 'success'}
                valueText={`${usd.format(b.spent)} of ${usd.format(b.budget)}`}
              />
            );
          })}
        </div>
      ),
      code: `import { Progress } from '@krackedui/motion';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const budgets = [
  { label: 'Groceries', spent: 412, budget: 500 },
  { label: 'Dining out', spent: 238, budget: 200 },
  { label: 'Transport', spent: 64, budget: 150 },
];

export function Budgets() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {budgets.map((b) => {
        const ratio = b.spent / b.budget;
        return (
          <Progress
            key={b.label}
            label={b.label}
            value={b.spent}
            max={b.budget}
            tone={ratio > 1 ? 'danger' : ratio > 0.8 ? 'warning' : 'success'}
            valueText={\`\${usd.format(b.spent)} of \${usd.format(b.budget)}\`}
          />
        );
      })}
    </div>
  );
}`,
    },
    {
      title: 'Sizes and no label',
      render: () => (
        <div className="flex w-full max-w-sm flex-col gap-4">
          <Progress aria-label="Sprint progress" value={64} size="sm" />
          <Progress label="Onboarding" value={3} max={5} valueText="3 of 5 steps" description="Next: invite your team" />
        </div>
      ),
      code: `import { Progress } from '@krackedui/motion';

export function ProgressSizes() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Progress aria-label="Sprint progress" value={64} size="sm" />
      <Progress label="Onboarding" value={3} max={5} valueText="3 of 5 steps" description="Next: invite your team" />
    </div>
  );
}`,
    },
  ],
  api: [
    {
      name: 'Progress',
      description: 'The ref and other `<div>` props (e.g. `aria-label`) go to the `role="progressbar"` track; `className` and `style` to the wrapper.',
      props: [
        { name: 'value', type: 'number', description: 'Current value (clamped to 0…max).' },
        { name: 'max', type: 'number', default: '100', description: 'Maximum.' },
        { name: 'tone', type: ['"neutral"', '"accent"', '"success"', '"warning"', '"danger"', '"info"'], default: '"accent"', description: 'Fill color.' },
        { name: 'label', type: 'string', description: 'Visible label; also the accessible name. Without it, pass `aria-label`.' },
        { name: 'size', type: ['"sm"', '"md"'], default: '"md"', description: '4px or 6px track.' },
        { name: 'valueText', type: 'string', description: 'Text for the value (shown and set as `aria-valuetext`). Defaults to the percentage.' },
        { name: 'hideValue', type: 'boolean', default: 'false', description: 'Hide the value next to the label.' },
        { name: 'description', type: 'ReactNode', description: 'Line under the bar.' },
        { name: 'style', type: 'CSSProperties', description: 'Wrapper styles.' },
        ...base,
      ],
    },
  ],
  sections: [
    accessibility([], [
      '`role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext`.',
      'Named by the visible label (`aria-labelledby`), or by `aria-label`.',
      'The value is always available as text; color only reinforces it.',
      'The fill transition is off under reduced motion.',
    ]),
    usage(['Budgets, quotas, uploads, onboarding steps.', 'Anything with a known total.'], ['The duration is unknown: use Spinner.', 'Several values make up a whole: use a DonutChart or a stacked BarChart.']),
  ],
};

/* ================================================================== ALERT */

function DismissibleAlert() {
  const [open, setOpen] = useState(true);
  return open ? (
    <Alert tone="info" title="Statement ready" action={<Button size="sm" variant="secondary">View</Button>} onDismiss={() => setOpen(false)}>
      Your October statement for Checking •• 2210 is available.
    </Alert>
  ) : (
    <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>Show alert again</Button>
  );
}

const alertPage: DocPage = {
  eyebrow,
  title: 'Alert',
  description: 'An inline message in the shape of a callout: tinted surface, tone icon, title and text, with an optional action and dismiss button.',
  install: install('Alert', `<Alert tone="success" title="Payment sent" />`),
  examples: [
    {
      title: 'Tones',
      align: 'start',
      render: () => (
        <div className="flex w-full flex-col gap-2">
          <Alert tone="neutral" title="Sync paused">Bank sync resumes when you reconnect.</Alert>
          <Alert tone="info" title="New feature">You can now split transactions.</Alert>
          <Alert tone="success" title="Payment sent">$1,450.00 to City Apartments.</Alert>
          <Alert tone="warning" title="Budget almost used">Dining out is at 92% with 10 days left.</Alert>
          <Alert tone="danger" title="Payment failed">The card ending 4411 was declined.</Alert>
        </div>
      ),
      code: `import { Alert } from '@krackedui/motion';

export function AlertTones() {
  return (
    <div className="flex w-full flex-col gap-2">
      <Alert tone="neutral" title="Sync paused">Bank sync resumes when you reconnect.</Alert>
      <Alert tone="info" title="New feature">You can now split transactions.</Alert>
      <Alert tone="success" title="Payment sent">$1,450.00 to City Apartments.</Alert>
      <Alert tone="warning" title="Budget almost used">Dining out is at 92% with 10 days left.</Alert>
      <Alert tone="danger" title="Payment failed">The card ending 4411 was declined.</Alert>
    </div>
  );
}`,
    },
    {
      title: 'Action and dismiss',
      align: 'start',
      render: () => <DismissibleAlert />,
      code: `import { useState } from 'react';
import { Alert, Button } from '@krackedui/motion';

export function StatementAlert() {
  const [open, setOpen] = useState(true);
  return open ? (
    <Alert tone="info" title="Statement ready" action={<Button size="sm" variant="secondary">View</Button>} onDismiss={() => setOpen(false)}>
      Your October statement for Checking •• 2210 is available.
    </Alert>
  ) : (
    <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>Show alert again</Button>
  );
}`,
    },
  ],
  api: [
    {
      name: 'Alert',
      description: 'A `<div>`; other `<div>` props are forwarded. Children are the message text.',
      props: [
        { name: 'tone', type: ['"neutral"', '"accent"', '"success"', '"warning"', '"danger"', '"info"'], default: '"info"', description: 'Color, default icon and role.' },
        { name: 'title', type: 'ReactNode', description: 'Bold first line.' },
        { name: 'icon', type: 'IconName', description: 'Leading icon; defaults per tone (info, success, warning, error).' },
        { name: 'action', type: 'ReactNode', description: 'A button or link for the next step.' },
        { name: 'onDismiss', type: '() => void', description: 'Shows a close button that calls this.' },
        { name: 'dismissLabel', type: 'string', default: '"Dismiss"', description: 'Accessible name of the close button.' },
        ...base,
      ],
    },
  ],
  sections: [
    accessibility(['Tab: reaches the action and the dismiss button.', 'Enter / Space: activates them.'], [
      'Danger and warning alerts are `role="alert"` (announced right away); other tones are `role="status"` (polite).',
      'Render an alert when the condition happens; one present at page load is read with the page, not announced.',
      'The tone is carried by the icon and the title text, not by color alone.',
      'The dismiss button is named (default "Dismiss").',
    ]),
    usage(['Conditions about the page or a section: failed payment, sync paused, budget warnings.', 'Messages that stay until resolved.'], ['Confirmation of an action people just took: use a toast.', 'Blocking decisions: use ConfirmDialog.', 'Field errors: use Field’s error.']),
  ],
};

/* ================================================================== ACCORDION */

const faq = [
  { value: 'fees', q: 'Are there monthly fees?', a: 'No. The standard plan has no monthly fee and no minimum balance.' },
  { value: 'transfers', q: 'How long do transfers take?', a: 'Transfers between your accounts are instant. Transfers to other banks arrive in 1–2 business days.' },
  { value: 'cards', q: 'Can I freeze a card?', a: 'Yes. Open the card in Settings › Cards and choose Freeze. You can unfreeze it at any time.' },
];

const accordionPage: DocPage = {
  eyebrow,
  title: 'Accordion',
  description: 'Expandable sections separated by hairlines. The chevron turns and the content animates its height (instant under reduced motion).',
  install: install('Accordion', `<Accordion.Root type="single" collapsible>…</Accordion.Root>`),
  examples: [
    {
      title: 'FAQ (single, collapsible)',
      align: 'start',
      render: () => (
        <Accordion.Root type="single" collapsible defaultValue="fees" className="max-w-lg">
          {faq.map((f) => (
            <Accordion.Item key={f.value} value={f.value}>
              <Accordion.Trigger>{f.q}</Accordion.Trigger>
              <Accordion.Content>{f.a}</Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      ),
      code: `import { Accordion } from '@krackedui/motion';

const faq = [
  { value: 'fees', q: 'Are there monthly fees?', a: 'No. The standard plan has no monthly fee and no minimum balance.' },
  { value: 'transfers', q: 'How long do transfers take?', a: 'Transfers between your accounts are instant. Transfers to other banks arrive in 1–2 business days.' },
  { value: 'cards', q: 'Can I freeze a card?', a: 'Yes. Open the card in Settings › Cards and choose Freeze. You can unfreeze it at any time.' },
];

export function Faq() {
  return (
    <Accordion.Root type="single" collapsible defaultValue="fees" className="max-w-lg">
      {faq.map((f) => (
        <Accordion.Item key={f.value} value={f.value}>
          <Accordion.Trigger>{f.q}</Accordion.Trigger>
          <Accordion.Content>{f.a}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}`,
    },
    {
      title: 'Multiple, controlled',
      align: 'start',
      render: () => <MultipleAccordion />,
      code: `import { useState } from 'react';
import { Accordion } from '@krackedui/motion';

export function ProjectSections() {
  const [open, setOpen] = useState<string[]>(['scope']);
  return (
    <Accordion.Root type="multiple" value={open} onValueChange={setOpen} className="max-w-lg">
      <Accordion.Item value="scope">
        <Accordion.Trigger>Scope</Accordion.Trigger>
        <Accordion.Content>Redesign the checkout and the account settings.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="timeline">
        <Accordion.Trigger>Timeline</Accordion.Trigger>
        <Accordion.Content>Design review Nov 4, build Nov 5–28, launch Dec 2.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="archived" disabled>
        <Accordion.Trigger>Archived notes</Accordion.Trigger>
        <Accordion.Content>Old notes.</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}`,
    },
  ],
  api: [
    {
      name: 'Accordion.Root',
      description: 'Radix `Accordion.Root`; all of its props are supported.',
      props: [
        { name: 'type', type: ['"single"', '"multiple"'], description: 'One open item at a time, or any number. With `type="single"`, add `collapsible` (boolean, default false) to allow closing the open item.' },
        { name: 'value', type: 'string | string[]', description: 'Controlled open item(s).' },
        { name: 'defaultValue', type: 'string | string[]', description: 'Initially open item(s).' },
        { name: 'onValueChange', type: '(value: string | string[]) => void', description: 'Called when items open or close.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every item.' },
        ...base,
      ],
    },
    {
      name: 'Accordion.Item',
      description: 'Radix `Accordion.Item`, with a bottom hairline.',
      props: [
        { name: 'value', type: 'string', description: 'Unique id of the item.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'The trigger cannot be toggled.' },
        ...base,
      ],
    },
    {
      name: 'Accordion.Trigger',
      description: 'The toggle button, inside a heading.',
      props: [
        { name: 'level', type: ['2', '3', '4', '5', '6'], default: '3', description: 'Heading level around the trigger; match your page outline.' },
        ...base,
      ],
    },
    { name: 'Accordion.Content', description: 'The panel (`role="region"`, labelled by its trigger). Animates its height with `.motion-collapse`.', props: [...base] },
  ],
  sections: [
    accessibility(
      [
        'Tab: moves to the next trigger (and into open content).',
        'Enter / Space: toggles the focused section.',
        '↓ / ↑: next / previous trigger; Home / End: first / last trigger. Disabled triggers are skipped.',
      ],
      [
        'WAI-ARIA accordion pattern (Radix): each trigger is a button inside a heading, with `aria-expanded` and `aria-controls`.',
        'Content is a `region` labelled by its trigger.',
        'Height animation and chevron rotation are off under reduced motion.',
      ],
    ),
    usage(['FAQs and help.', 'Long settings or details grouped into sections people open one at a time.'], ['People need to compare sections side by side: show them all.', 'Switching between views of the same thing: use Tabs.', 'A single show/hide: use a disclosure toggle.']),
  ],
};

function MultipleAccordion() {
  const [open, setOpen] = useState<string[]>(['scope']);
  return (
    <Accordion.Root type="multiple" value={open} onValueChange={setOpen} className="max-w-lg">
      <Accordion.Item value="scope">
        <Accordion.Trigger>Scope</Accordion.Trigger>
        <Accordion.Content>Redesign the checkout and the account settings.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="timeline">
        <Accordion.Trigger>Timeline</Accordion.Trigger>
        <Accordion.Content>Design review Nov 4, build Nov 5–28, launch Dec 2.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="archived" disabled>
        <Accordion.Trigger>Archived notes</Accordion.Trigger>
        <Accordion.Content>Old notes.</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

/* ================================================================== KANBAN BOARD */

interface BoardTask { id: string; title: string; status: string }
const boardColumns = [
  { id: 'todo', title: 'To do', color: 'brown' as const },
  { id: 'doing', title: 'In progress', color: 'blue' as const },
  { id: 'done', title: 'Done', color: 'green' as const },
];
const boardTasks: BoardTask[] = [
  { id: 'T-1', title: 'Write the project brief', status: 'todo' },
  { id: 'T-2', title: 'Sketch three layouts', status: 'todo' },
  { id: 'T-3', title: 'Build the pricing page', status: 'doing' },
  { id: 'T-4', title: 'Set up analytics', status: 'done' },
];

/** Applies a KanbanMove to a flat, ordered list. */
function applyMove(list: BoardTask[], { itemId, toColumnId, toIndex }: KanbanMove): BoardTask[] {
  const moved = list.find((t) => t.id === itemId);
  if (!moved) return list;
  const rest = list.filter((t) => t.id !== itemId);
  const target = rest.filter((t) => t.status === toColumnId);
  const before = target[toIndex];
  const at = before ? rest.indexOf(before) : rest.length;
  return [...rest.slice(0, at), { ...moved, status: toColumnId }, ...rest.slice(at)];
}

function SprintBoardDemo() {
  const [tasks, setTasks] = useState(boardTasks);
  return (
    <KanbanBoard
      label="Sprint board"
      columns={boardColumns}
      items={tasks}
      getItemId={(t) => t.id}
      getColumnId={(t) => t.status}
      getItemLabel={(t) => t.title}
      onMove={(move) => setTasks((list) => applyMove(list, move))}
      renderCard={(t, { actions }) => (
        <Card.Root className="gap-1 px-3 py-2.5">
          <div className="flex items-center justify-between text-n-ui-sm text-n-text-secondary">{t.id}{actions}</div>
          <span className="text-n-ui-medium">{t.title}</span>
        </Card.Root>
      )}
    />
  );
}

let nextTaskNumber = 5;
function QuickAddBoardDemo() {
  const [tasks, setTasks] = useState(boardTasks.slice(0, 2));
  return (
    <KanbanBoard
      label="Backlog board"
      columns={boardColumns}
      items={tasks}
      getItemId={(t) => t.id}
      getColumnId={(t) => t.status}
      getItemLabel={(t) => t.title}
      onMove={(move) => setTasks((list) => applyMove(list, move))}
      onQuickAdd={(status, title) => setTasks((list) => [...list, { id: `T-${nextTaskNumber++}`, title, status }])}
      quickAddLabel="Add task"
      emptyColumnText="Drop tasks here"
      itemActions={(t, M) => <M.Item icon="trash" destructive onSelect={() => setTasks((list) => list.filter((x) => x.id !== t.id))}>Delete</M.Item>}
      renderCard={(t, { actions }) => (
        <Card.Root className="flex-row items-center justify-between gap-2 px-3 py-2">
          <span className="text-n-ui">{t.title}</span>{actions}
        </Card.Root>
      )}
    />
  );
}

const kanbanCodeHead = `import { useState } from 'react';
import { Card, KanbanBoard, type KanbanMove } from '@krackedui/motion';

interface Task { id: string; title: string; status: string }
const columns = [
  { id: 'todo', title: 'To do', color: 'brown' as const },
  { id: 'doing', title: 'In progress', color: 'blue' as const },
  { id: 'done', title: 'Done', color: 'green' as const },
];
const initial: Task[] = [
  { id: 'T-1', title: 'Write the project brief', status: 'todo' },
  { id: 'T-2', title: 'Sketch three layouts', status: 'todo' },
  { id: 'T-3', title: 'Build the pricing page', status: 'doing' },
  { id: 'T-4', title: 'Set up analytics', status: 'done' },
];

/** Applies a KanbanMove to a flat, ordered list. */
function applyMove(list: Task[], { itemId, toColumnId, toIndex }: KanbanMove): Task[] {
  const moved = list.find((t) => t.id === itemId);
  if (!moved) return list;
  const rest = list.filter((t) => t.id !== itemId);
  const target = rest.filter((t) => t.status === toColumnId);
  const before = target[toIndex];
  const at = before ? rest.indexOf(before) : rest.length;
  return [...rest.slice(0, at), { ...moved, status: toColumnId }, ...rest.slice(at)];
}
`;

const kanbanPage: DocPage = {
  eyebrow,
  title: 'KanbanBoard',
  description: 'Cards in status columns that people move by dragging (mouse, pen or touch) or with the keyboard through each card’s menu. Controlled: it reports moves, you update the list.',
  install: install('KanbanBoard', `<KanbanBoard columns={columns} items={tasks} getItemId={(t) => t.id} getColumnId={(t) => t.status} renderCard={(t, { actions }) => <div>{t.title}{actions}</div>} onMove={move} />`),
  examples: [
    {
      title: 'Sprint board',
      render: () => <SprintBoardDemo />,
      code: `${kanbanCodeHead}
export function SprintBoard() {
  const [tasks, setTasks] = useState(initial);
  return (
    <KanbanBoard
      label="Sprint board"
      columns={columns}
      items={tasks}
      getItemId={(t) => t.id}
      getColumnId={(t) => t.status}
      getItemLabel={(t) => t.title}
      onMove={(move) => setTasks((list) => applyMove(list, move))}
      renderCard={(t, { actions }) => (
        <Card.Root className="gap-1 px-3 py-2.5">
          <div className="flex items-center justify-between text-n-ui-sm text-n-text-secondary">{t.id}{actions}</div>
          <span className="text-n-ui-medium">{t.title}</span>
        </Card.Root>
      )}
    />
  );
}`,
    },
    {
      title: 'Quick add, empty columns and extra actions',
      render: () => <QuickAddBoardDemo />,
      code: `${kanbanCodeHead}
let nextTaskNumber = 5;

export function BacklogBoard() {
  const [tasks, setTasks] = useState(initial.slice(0, 2));
  return (
    <KanbanBoard
      label="Backlog board"
      columns={columns}
      items={tasks}
      getItemId={(t) => t.id}
      getColumnId={(t) => t.status}
      getItemLabel={(t) => t.title}
      onMove={(move) => setTasks((list) => applyMove(list, move))}
      onQuickAdd={(status, title) => setTasks((list) => [...list, { id: \`T-\${nextTaskNumber++}\`, title, status }])}
      quickAddLabel="Add task"
      emptyColumnText="Drop tasks here"
      itemActions={(t, M) => <M.Item icon="trash" destructive onSelect={() => setTasks((list) => list.filter((x) => x.id !== t.id))}>Delete</M.Item>}
      renderCard={(t, { actions }) => (
        <Card.Root className="flex-row items-center justify-between gap-2 px-3 py-2">
          <span className="text-n-ui">{t.title}</span>{actions}
        </Card.Root>
      )}
    />
  );
}`,
    },
  ],
  api: [
    {
      name: 'KanbanBoard',
      description: 'A `<div>` holding the scroll region and a live region; other `<div>` props are forwarded. Generic over your item type.',
      props: [
        { name: 'columns', type: 'KanbanColumn[]', description: '`{ id, title, label?, color? }`. A string `title` renders as a StatusPill in `color`; `label` is the plain name used in menus and announcements.' },
        { name: 'items', type: 'Item[]', description: 'Every item in board order; each column shows its items in this order.' },
        { name: 'getItemId', type: '(item) => string', description: 'Stable id of an item.' },
        { name: 'getColumnId', type: '(item) => string', description: 'Column an item is in.' },
        { name: 'getItemLabel', type: '(item) => string', description: 'Plain-text name for announcements and the actions button. Defaults to the id.' },
        { name: 'renderCard', type: '(item, { dragging, actions }) => ReactNode', description: 'Your card. Place `actions` (the “…” move menu) inside it; it is `null` when there is nothing to show.' },
        { name: 'onMove', type: '(move: KanbanMove) => void', description: '`{ itemId, fromColumnId, toColumnId, toIndex }`; `toIndex` counts the target column without the moved item. Without it cards do not move.' },
        { name: 'onQuickAdd', type: '(columnId, title) => void', description: 'Adds “+ Add” under every column: a field that creates an item on Enter.' },
        { name: 'quickAddLabel', type: 'string', default: '"Add item"', description: 'Text of the quick-add button.' },
        { name: 'defaultQuickAddColumnId', type: 'string', description: 'Column whose quick-add field starts open (e.g. an empty project).' },
        { name: 'columnActions', type: '(column) => ReactNode', description: 'Extra controls at the right of a column header.' },
        { name: 'itemActions', type: '(item, parts) => ReactNode', description: 'Extra menu items after the move items; `parts` is Menu or ContextMenu, so render `parts.Item`.' },
        { name: 'emptyColumnText', type: 'ReactNode', default: '"No items"', description: 'Shown in an empty column (which is still a drop target).' },
        { name: 'columnWidth', type: 'number', default: '272', description: 'Column width in px.' },
        { name: 'label', type: 'string', default: '"Board"', description: 'Accessible name of the scroll region.' },
        ...base,
      ],
    },
  ],
  sections: [
    accessibility(
      [
        'Tab: moves through the cards’ own links and each card’s actions button.',
        'Enter / Space on the actions button: opens the menu with “Move to…” (→ opens the column list), “Move up” and “Move down”. The same menu opens on right-click.',
        'Escape: cancels a pointer drag in progress.',
      ],
      [
        'The board is a named `region` that scrolls sideways; each column is a `section` labelled by its heading (title + count), its cards a list.',
        'Every pick-up, move and cancel is announced in a polite live region (“Moved Write the project brief to Done, position 1 of 2.”), following the WAI-ARIA drag-and-drop guidance of a keyboard alternative plus announcements.',
        'Pointer drag works with mouse and pen after 5px of movement, and with touch after a 250ms press, so swipes still scroll. The floating copy is `aria-hidden` and inert.',
        'Lift and drop-line animations (`.motion-lift`, `.motion-drop`) are removed under reduced motion.',
      ],
    ),
    usage(
      ['Work moving through stages: tasks by status, deals by stage, tickets by queue.', 'Boards of up to a few hundred cards.'],
      ['Comparing many fields per item: use DataTable (offer both views).', 'Items placed in time: use Timeline.', 'A single ordered list: a sortable list is simpler.'],
    ),
  ],
};

/* ================================================================== TIMELINE */

const tl = (iso: string) => new Date(`${iso}T00:00:00`);
const roadmap: TimelineItem[] = [
  { id: 'web', label: 'Website relaunch', start: tl('2026-09-07'), end: tl('2026-11-27'), group: true },
  { id: 'web-4', meta: 'WEB-4', label: 'Information architecture', start: tl('2026-09-09'), end: tl('2026-09-30'), color: 'green', description: 'Done' },
  { id: 'web-12', meta: 'WEB-12', label: 'Pricing page', start: tl('2026-10-06'), end: tl('2026-10-24'), color: 'blue', description: 'In progress' },
  { id: 'web-11', meta: 'WEB-11', label: 'Accessibility review', start: tl('2026-10-26'), end: tl('2026-11-04'), color: 'brown', description: 'To do' },
];

function RoadmapDemo() {
  const [items, setItems] = useState(roadmap);
  const [opened, setOpened] = useState('');
  const move = (c: TimelineChange) => setItems((list) => list.map((i) => (i.id === c.id ? { ...i, start: c.start, end: c.end } : i)));
  return (
    <div className="flex w-full flex-col gap-2">
      <Timeline label="Roadmap" items={items} today={tl('2026-10-21')} onChange={move} onOpen={(i) => setOpened(i.label)} />
      <p className="m-0 text-n-ui-sm text-n-text-secondary">{opened ? `Opened: ${opened}` : 'Click a bar, or focus it and press Enter. ← / → move it.'}</p>
    </div>
  );
}

const timelineCodeHead = `import { useState } from 'react';
import { Timeline, type TimelineChange, type TimelineItem } from '@krackedui/motion';

const day = (iso: string) => new Date(\`\${iso}T00:00:00\`);
const roadmap: TimelineItem[] = [
  { id: 'web', label: 'Website relaunch', start: day('2026-09-07'), end: day('2026-11-27'), group: true },
  { id: 'web-4', meta: 'WEB-4', label: 'Information architecture', start: day('2026-09-09'), end: day('2026-09-30'), color: 'green', description: 'Done' },
  { id: 'web-12', meta: 'WEB-12', label: 'Pricing page', start: day('2026-10-06'), end: day('2026-10-24'), color: 'blue', description: 'In progress' },
  { id: 'web-11', meta: 'WEB-11', label: 'Accessibility review', start: day('2026-10-26'), end: day('2026-11-04'), color: 'brown', description: 'To do' },
];
`;

const timelinePage: DocPage = {
  eyebrow,
  title: 'Timeline',
  description: 'A Gantt-style chart: one bar per item from its start to its end date, on a week or month scale, with a today marker. Bars open on click or Enter and move with drag or the arrow keys.',
  install: install('Timeline', `<Timeline items={items} scale="week" onOpen={(item) => open(item.id)} />`),
  examples: [
    {
      title: 'Movable roadmap',
      render: () => <RoadmapDemo />,
      code: `${timelineCodeHead}
export function Roadmap() {
  const [items, setItems] = useState(roadmap);
  const [opened, setOpened] = useState('');
  const move = (c: TimelineChange) => setItems((list) => list.map((i) => (i.id === c.id ? { ...i, start: c.start, end: c.end } : i)));
  return (
    <div className="flex w-full flex-col gap-2">
      <Timeline label="Roadmap" items={items} today={day('2026-10-21')} onChange={move} onOpen={(i) => setOpened(i.label)} />
      <p className="m-0 text-n-ui-sm text-n-text-secondary">{opened ? \`Opened: \${opened}\` : 'Click a bar, or focus it and press Enter. ← / → move it.'}</p>
    </div>
  );
}`,
    },
    {
      title: 'Month scale, read-only',
      render: () => <Timeline label="Quarter plan" scale="month" items={roadmap} today={tl('2026-10-21')} className="w-full" />,
      code: `${timelineCodeHead}
export function QuarterPlan() {
  return <Timeline label="Quarter plan" scale="month" items={roadmap} today={day('2026-10-21')} className="w-full" />;
}`,
    },
  ],
  api: [
    {
      name: 'Timeline',
      description: 'A focusable scroll region (`role="region"`); other `<div>` props are forwarded.',
      props: [
        { name: 'items', type: 'TimelineItem[]', description: '`{ id, label, start, end, meta?, group?, color?, description? }`. `group` rows are tinted headers that do not move; `description` is added to the bar’s accessible name (e.g. the status).' },
        { name: 'scale', type: ['"week"', '"month"'], default: '"week"', description: 'Day width 28px with a date per week, or 9px with month names only.' },
        { name: 'today', type: 'Date', description: 'Position of the today marker; the chart opens scrolled to it. Defaults to the current date.' },
        { name: 'onOpen', type: '(item) => void', description: 'Bar clicked, or Enter / Space on it.' },
        { name: 'onChange', type: '(change: TimelineChange) => void', description: '`{ id, start, end }` after a drag or ← / →. Without it bars do not move.' },
        { name: 'label', type: 'string', default: '"Timeline"', description: 'Accessible name of the region.' },
        { name: 'corner', type: 'ReactNode', description: 'Text above the label column (default “By week” / “By month”).' },
        ...base,
      ],
    },
  ],
  sections: [
    accessibility(
      [
        'Tab: moves through the bars in row order (focusing a bar scrolls it into view).',
        'Enter / Space on a bar: `onOpen`.',
        '← / → on a bar: moves it a day; with Shift, a week (only with `onChange`; the bar’s description says so).',
      ],
      [
        'Bars are buttons named “WEB-12 Pricing page: Oct 6 to Oct 24, In progress”; the visible date text is hidden to avoid repeating it.',
        'Moves are announced in a polite live region (“Moved Pricing page to Oct 7 – Oct 25.”).',
        'The scale, week lines and today marker are decorative (`aria-hidden`); the today label is red text on the page background (AA contrast).',
        'The label column stays visible while the chart scrolls sideways; at 320px it is 144px wide.',
      ],
    ),
    usage(
      ['Roadmaps and project plans: phases, milestones, tasks with dates.', 'Seeing overlap and what is late against today.'],
      ['Picking a date: use DatePicker.', 'Events in a month grid: use Calendar.', 'Items without dates, moving through stages: use KanbanBoard.'],
    ),
  ],
};

/* ---------------------------------------------------------------- registry */

export const dataNav: NavGroup[] = [
  {
    title: 'Data Display',
    items: [{ slug: 'ui/card' }, { slug: 'ui/stat' }, { slug: 'ui/table' }, { slug: 'ui/data-table' }, { slug: 'ui/empty-state' }, { slug: 'ui/accordion' }, { slug: 'ui/kanban-board' }, { slug: 'ui/timeline' }],
  },
  { title: 'Navigation', items: [{ slug: 'ui/pagination' }] },
  { title: 'Feedback', items: [{ slug: 'ui/alert' }, { slug: 'ui/progress' }, { slug: 'ui/skeleton' }] },
];

export const dataPages: Record<string, DocPage> = {
  'ui/card': cardPage,
  'ui/stat': statPage,
  'ui/table': tablePage,
  'ui/data-table': dataTablePage,
  'ui/pagination': paginationPage,
  'ui/empty-state': emptyStatePage,
  'ui/skeleton': skeletonPage,
  'ui/progress': progressPage,
  'ui/alert': alertPage,
  'ui/accordion': accordionPage,
  'ui/kanban-board': kanbanPage,
  'ui/timeline': timelinePage,
};
