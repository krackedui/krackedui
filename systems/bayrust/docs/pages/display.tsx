// Data display: the small status pieces, the surfaces, and the two tables.
import type { DocPage, NavGroup } from '../../../../apps/docs/lib/types';
import {
  Accordion, Avatar, AvatarGroup, Badge, Button, CardContent, CardDescription, CardFooter, CardHeader,
  CardRoot, CardTitle, DataTable, EmptyState, Kbd, Pagination, Progress, Skeleton, Spinner, Stack,
  Stat, Table, Tag,
} from '@krackedui/bayrust';
import { a11y, install, usage } from './helpers';

const badgePage: DocPage = {
  eyebrow: 'Data display',
  title: 'Badge, Tag and Kbd',
  description: 'The three smallest pieces: a state, a label you can remove, and a key.',
  hero: {
    title: 'Badge, Tag and Kbd',
    render: () => (
      <Stack direction="row" gap={8} align="center" wrap>
        <Badge tone="success">Passing</Badge>
        <Badge tone="warning">Flagged</Badge>
        <Badge tone="danger">Failing</Badge>
        <Tag color="blue">clipboard</Tag>
        <Kbd>⌘K</Kbd>
      </Stack>
    ),
    code: `<Stack direction="row" gap={8} align="center" wrap>
  <Badge tone="success">Passing</Badge>
  <Badge tone="warning">Flagged</Badge>
  <Badge tone="danger">Failing</Badge>
  <Tag color="blue">clipboard</Tag>
  <Kbd>⌘K</Kbd>
</Stack>`,
  },
  install,
  sections: [
    usage([
      'A `Badge` is a state the system decided. A `Tag` is a label a person attached, which is why only a Tag can be removed.',
      'Tone carries meaning; colour on a Tag is just identity.',
    ]),
    a11y(['Tone is never the only signal: a badge says what it means in words as well as colour.']),
  ],
  examples: [
    {
      title: 'Variants',
      render: () => (
        <Stack direction="row" gap={8} wrap>
          <Badge variant="soft">Soft</Badge>
          <Badge variant="solid">Solid</Badge>
          <Badge variant="outline">Outline</Badge>
        </Stack>
      ),
      code: `<Stack direction="row" gap={8} wrap>
  <Badge variant="soft">Soft</Badge>
  <Badge variant="solid">Solid</Badge>
  <Badge variant="outline">Outline</Badge>
</Stack>`,
    },
  ],
  api: [
    { name: 'Badge', props: [{ name: 'tone', type: ['"neutral"', '"accent"', '"info"', '"success"', '"warning"', '"danger"'], default: '"neutral"' }, { name: 'variant', type: ['"soft"', '"solid"', '"outline"'], default: '"soft"' }] },
    { name: 'Tag', props: [{ name: 'color', type: 'Color' }, { name: 'size', type: ['"sm"', '"md"'] }, { name: 'onRemove', type: '() => void', description: 'Adds the remove button.' }] },
  ],
};

const avatarPage: DocPage = {
  eyebrow: 'Data display',
  title: 'Avatar',
  description: 'A person. Falls back to an initial when there is no image, and never to a broken one.',
  hero: {
    title: 'Avatar',
    render: () => (
      <Stack direction="row" gap={10} align="center">
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" size="lg" />
        <AvatarGroup max={3}>
          <Avatar name="Ada" />
          <Avatar name="Grace" />
          <Avatar name="Katherine" />
          <Avatar name="Dorothy" />
        </AvatarGroup>
      </Stack>
    ),
    code: `<Stack direction="row" gap={10} align="center">
  <Avatar name="Ada Lovelace" />
  <Avatar name="Grace Hopper" size="lg" />
  <AvatarGroup max={3}>
    <Avatar name="Ada" />
    <Avatar name="Grace" />
    <Avatar name="Katherine" />
    <Avatar name="Dorothy" />
  </AvatarGroup>
</Stack>`,
  },
  install,
  sections: [a11y(['`name` is the accessible name as well as the source of the initial.', '`AvatarGroup` counts the rest rather than hiding them silently.'])],
  api: [
    { name: 'Avatar', props: [{ name: 'name', type: 'string' }, { name: 'src', type: 'string' }, { name: 'size', type: ['"xs"', '"sm"', '"md"', '"lg"'] }] },
    { name: 'AvatarGroup', props: [{ name: 'max', type: 'number', description: 'How many to show before "+n".' }] },
  ],
};

const cardPage: DocPage = {
  eyebrow: 'Data display',
  title: 'Card and Stat',
  description: 'A grouped surface, and the number that usually goes on it.',
  hero: {
    title: 'Card and Stat',
    render: () => (
      <CardRoot style={{ width: '100%', maxWidth: 300 }}>
        <CardHeader>
          <CardTitle>This month</CardTitle>
          <CardDescription>Commands run across every workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <Stat label="Commands run" value="12,480" delta="+8.2%" trend="up" />
        </CardContent>
        <CardFooter>
          <Button size="sm">Open report</Button>
        </CardFooter>
      </CardRoot>
    ),
    code: `<CardRoot style={{ width: '100%', maxWidth: 300 }}>
  <CardHeader>
    <CardTitle>This month</CardTitle>
    <CardDescription>Commands run across every workspace.</CardDescription>
  </CardHeader>
  <CardContent>
    <Stat label="Commands run" value="12,480" delta="+8.2%" trend="up" />
  </CardContent>
  <CardFooter>
    <Button size="sm">Open report</Button>
  </CardFooter>
</CardRoot>`,
  },
  install,
  sections: [
    usage([
      '`Stat`’s delta tone comes from `trend` and `upIsGood` together. Costs rising is not a success, so set `upIsGood={false}` for costs, churn and latency.',
      '`CardTitle` renders an h3. Use `asChild` to render the heading level the page actually needs.',
    ]),
  ],
  examples: [
    {
      title: 'A metric where up is bad',
      render: () => <Stat label="Average latency" value="412 ms" delta="+11%" trend="up" upIsGood={false} />,
      code: `<Stat label="Average latency" value="412 ms" delta="+11%" trend="up" upIsGood={false} />`,
    },
  ],
  api: [
    { name: 'CardRoot', props: [{ name: 'interactive', type: 'boolean', description: 'Hover and focus affordances, for a card that is one target.' }, { name: 'asChild', type: 'boolean' }] },
    { name: 'Stat', props: [{ name: 'label', type: 'ReactNode' }, { name: 'value', type: 'ReactNode' }, { name: 'delta', type: 'ReactNode' }, { name: 'trend', type: ['"up"', '"down"', '"flat"'] }, { name: 'upIsGood', type: 'boolean', default: 'true' }] },
  ],
};

const rows = [
  { id: '1', command: 'Clipboard history', uses: 1284, owner: 'Ada' },
  { id: '2', command: 'Calculator', uses: 862, owner: 'Grace' },
  { id: '3', command: 'Snippets', uses: 431, owner: 'Ada' },
];

const tablePage: DocPage = {
  eyebrow: 'Data display',
  title: 'Table and DataTable',
  description: 'Table is the markup. DataTable is columns and rows, with sorting, selection and empty states.',
  hero: {
    title: 'DataTable',
    align: 'start',
    render: () => (
      <DataTable
        columns={[
          { key: 'command', header: 'Command', sortable: true },
          { key: 'uses', header: 'Uses', align: 'end', sortable: true },
          { key: 'owner', header: 'Owner', hideBelow: 'sm' },
        ]}
        rows={rows}
        getRowId={(r) => r.id}
        sort={{ key: 'uses', direction: 'desc' }}
      />
    ),
    code: `const rows = [
  { id: '1', command: 'Clipboard history', uses: 1284, owner: 'Ada' },
  { id: '2', command: 'Calculator', uses: 862, owner: 'Grace' },
  { id: '3', command: 'Snippets', uses: 431, owner: 'Ada' },
];

<DataTable
  columns={[
    { key: 'command', header: 'Command', sortable: true },
    { key: 'uses', header: 'Uses', align: 'end', sortable: true },
    { key: 'owner', header: 'Owner', hideBelow: 'sm' },
  ]}
  rows={rows}
  getRowId={(r) => r.id}
  sort={{ key: 'uses', direction: 'desc' }}
/>`,
  },
  install,
  sections: [
    usage([
      'Sorting is reported, not performed: `onSortChange` says what was asked for and you supply `rows` in that order. A table that sorted its own page would disagree with the server the moment the data outgrew one page.',
      '`hideBelow` drops a column on narrow screens, so the columns that matter survive a phone.',
    ]),
    a11y(['A sorted column reports `aria-sort`. The select-all box reports `mixed` when only some rows are selected.']),
  ],
  examples: [
    {
      title: 'Pagination',
      align: 'start',
      render: () => <Pagination page={3} pageCount={12} onPageChange={() => {}} />,
      code: `<Pagination page={3} pageCount={12} onPageChange={() => {}} />`,
    },
    {
      title: 'Markup directly',
      align: 'start',
      render: () => (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Command</Table.Head>
              <Table.Head align="end">Uses</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Clipboard history</Table.Cell>
              <Table.Cell align="end">1,284</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      ),
      code: `<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>Command</Table.Head>
      <Table.Head align="end">Uses</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>Clipboard history</Table.Cell>
      <Table.Cell align="end">1,284</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>`,
    },
  ],
  api: [
    {
      name: 'DataTable',
      props: [
        { name: 'columns', type: 'DataTableColumn<Row>[]' },
        { name: 'rows', type: 'Row[]' },
        { name: 'getRowId', type: '(row: Row) => string' },
        { name: 'sort', type: '{ key: string; direction: "asc" | "desc" } | null' },
        { name: 'onSortChange', type: '(sort) => void', description: 'Reports the requested sort; it does not reorder rows.' },
        { name: 'selectedIds', type: 'string[]' },
        { name: 'loading', type: 'boolean', description: 'Shows skeleton rows.' },
        { name: 'empty', type: 'ReactNode' },
        { name: 'density', type: ['"compact"', '"comfortable"'], default: '"comfortable"' },
      ],
    },
  ],
};

const statusPage: DocPage = {
  eyebrow: 'Data display',
  title: 'Accordion, EmptyState and loading',
  description: 'Disclosure, nothing-here, and the three ways of saying "working".',
  hero: {
    title: 'Accordion',
    align: 'start',
    render: () => (
      <div style={{ width: '100%', maxWidth: 320 }}>
        <Accordion.Root type="single" collapsible defaultValue="a">
          <Accordion.Item value="a">
            <Accordion.Trigger>What is a command?</Accordion.Trigger>
            <Accordion.Content>Anything the launcher can run: a script, an extension, a snippet.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="b">
            <Accordion.Trigger>Where do they live?</Accordion.Trigger>
            <Accordion.Content>In a workspace, which syncs between your machines.</Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    ),
    code: `<Accordion.Root type="single" collapsible defaultValue="a">
  <Accordion.Item value="a">
    <Accordion.Trigger>What is a command?</Accordion.Trigger>
    <Accordion.Content>Anything the launcher can run: a script, an extension, a snippet.</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="b">
    <Accordion.Trigger>Where do they live?</Accordion.Trigger>
    <Accordion.Content>In a workspace, which syncs between your machines.</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>`,
  },
  install,
  sections: [
    a11y([
      'Each accordion trigger carries `aria-expanded` and `aria-controls`, and each panel is a region labelled by its trigger.',
      '`Progress` is a `progressbar` with its value and name; `Spinner` is a `status` with text; `Skeleton` is hidden from assistive tech, because a placeholder has nothing to say.',
    ]),
  ],
  examples: [
    {
      title: 'Empty state',
      render: () => (
        <EmptyState
          icon="inbox"
          title="No snippets yet"
          description="Snippets expand as you type. Create one to get started."
          action={<Button variant="primary" icon="plus">New snippet</Button>}
        />
      ),
      code: `<EmptyState
  icon="inbox"
  title="No snippets yet"
  description="Snippets expand as you type. Create one to get started."
  action={<Button variant="primary" icon="plus">New snippet</Button>}
/>`,
    },
    {
      title: 'Loading',
      align: 'start',
      render: () => (
        <Stack gap={12} style={{ width: '100%', maxWidth: 280 }}>
          <Progress value={64} label="Indexing commands" />
          <Stack direction="row" gap={8} align="center">
            <Spinner label="Loading" />
            <Skeleton width={160} />
          </Stack>
          <Skeleton lines={3} />
        </Stack>
      ),
      code: `<Stack gap={12} style={{ width: '100%', maxWidth: 280 }}>
  <Progress value={64} label="Indexing commands" />
  <Stack direction="row" gap={8} align="center">
    <Spinner label="Loading" />
    <Skeleton width={160} />
  </Stack>
  <Skeleton lines={3} />
</Stack>`,
    },
  ],
  api: [
    { name: 'Accordion.Root', props: [{ name: 'type', type: ['"single"', '"multiple"'], default: '"single"' }, { name: 'collapsible', type: 'boolean' }, { name: 'defaultValue', type: 'string | string[]' }] },
    { name: 'EmptyState', props: [{ name: 'title', type: 'ReactNode' }, { name: 'description', type: 'ReactNode' }, { name: 'icon', type: 'IconName' }, { name: 'action', type: 'ReactNode' }] },
    { name: 'Progress', props: [{ name: 'value', type: 'number' }, { name: 'max', type: 'number', default: '100' }, { name: 'label', type: 'string' }, { name: 'tone', type: 'Tone' }] },
  ],
};

export const displayPages: Record<string, DocPage> = {
  badge: badgePage,
  avatar: avatarPage,
  card: cardPage,
  table: tablePage,
  'accordion-and-status': statusPage,
};

export const displayNav: NavGroup = {
  title: 'Data display',
  items: [{ slug: 'badge' }, { slug: 'avatar' }, { slug: 'card' }, { slug: 'table' }, { slug: 'accordion-and-status' }],
};
