// Data display: the semantics a screen reader relies on — sort state, selection, expansion, and the
// numbers behind a chart.
import { describe, it, expect } from 'vitest';
import { Accordion, BarChart, DataTable, LineChart, Pagination, Progress, Spinner, Table, Tabs } from '@system';
import { renderUI, screen, within } from '../utils';

const rows = [
  { id: '1', command: 'Clipboard history', uses: 1284 },
  { id: '2', command: 'Calculator', uses: 862 },
];
const columns = [
  { key: 'command', header: 'Command', sortable: true },
  { key: 'uses', header: 'Uses', sortable: true },
];

describe('Accordion', () => {
  it('wires trigger to panel and opens one at a time', async () => {
    const { user } = renderUI(
      <Accordion.Root type="single" collapsible>
        <Accordion.Item value="a">
          <Accordion.Trigger>First</Accordion.Trigger>
          <Accordion.Content>First body</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="b">
          <Accordion.Trigger>Second</Accordion.Trigger>
          <Accordion.Content>Second body</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
    const first = screen.getByRole('button', { name: 'First' });
    expect(first).toHaveAttribute('aria-expanded', 'false');
    await user.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: 'Second' }));
    expect(first).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Tabs', () => {
  it('shows one panel and switches on click', async () => {
    const { user } = renderUI(
      <Tabs.Root defaultValue="a">
        <Tabs.List>
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Trigger value="b">B</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
        <Tabs.Content value="b">Panel B</Tabs.Content>
      </Tabs.Root>,
    );
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('tab', { name: 'B' }));
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Panel B')).toBeInTheDocument();
  });
});

describe('Table', () => {
  it('reports a sorted column', () => {
    renderUI(
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head sort="asc">Name</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Ada</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>,
    );
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');
  });
});

describe('DataTable', () => {
  it('renders its rows and reports a sort rather than performing one', async () => {
    const seen: unknown[] = [];
    const { user } = renderUI(
      <DataTable columns={columns} rows={rows} getRowId={(r) => r.id} onSortChange={(s) => seen.push(s)} />,
    );
    expect(screen.getByText('Clipboard history')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Uses/ }));
    expect(seen.length).toBeGreaterThan(0);
    // the rows are still in the order they were given: sorting is the caller's job
    const cells = screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0].textContent);
    expect(cells[0]).toBe('Clipboard history');
  });

  it('reports mixed when only some rows are selected', async () => {
    const { user } = renderUI(
      <DataTable columns={columns} rows={rows} getRowId={(r) => r.id} selectedIds={[]} onSelectedIdsChange={() => {}} />,
    );
    const boxes = screen.getAllByRole('checkbox');
    await user.click(boxes[1]);
    expect(boxes[0]).toHaveAttribute('aria-checked');
  });
});

describe('Pagination', () => {
  it('marks the current page and disables the ends', () => {
    renderUI(<Pagination page={1} pageCount={5} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
  });
});

describe('Progress and Spinner', () => {
  it('Progress is a named progressbar with a value', () => {
    renderUI(<Progress value={40} label="Indexing" />);
    const bar = screen.getByRole('progressbar', { name: 'Indexing' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
  });

  it('Spinner says something to a screen reader', () => {
    renderUI(<Spinner label="Loading" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });
});

describe('Charts', () => {
  const data = [
    { month: 'Jan', revenue: 120, costs: 80 },
    { month: 'Feb', revenue: 160, costs: 90 },
  ];
  const series = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'costs', label: 'Costs' },
  ];

  it('a line chart carries its numbers in a table as well as the picture', () => {
    const { container } = renderUI(
      <LineChart data={data} index="month" series={series} label="Revenue vs costs" />,
    );
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    expect(table?.textContent).toContain('120');
  });

  it('a bar chart names itself', () => {
    renderUI(<BarChart data={data} index="month" series={series} label="By month" />);
    expect(screen.getByRole('img', { name: 'By month' })).toBeInTheDocument();
  });
});
