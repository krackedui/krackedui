import { useState, type ReactNode } from 'react';
import {
  Accordion, Alert, Button, Card, DataTable, EmptyState, Pagination, Progress, Skeleton, Stat, Table,
  type DataTableColumn,
} from '@krackedui/motion';

interface Tx { id: string; date: string; merchant: string; category: string; amount: number }
const rows: Tx[] = [
  { id: '1', date: '2026-10-18', merchant: 'Northwind Coffee', category: 'Food', amount: -4.8 },
  { id: '2', date: '2026-10-17', merchant: 'Acme Payroll', category: 'Income', amount: 4250 },
  { id: '3', date: '2026-10-16', merchant: 'Metro Transit', category: 'Transport', amount: -32 },
  { id: '4', date: '2026-10-12', merchant: 'City Apartments', category: 'Housing', amount: -1450 },
];
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const columns: DataTableColumn<Tx>[] = [
  { key: 'date', header: 'Date', sortable: true },
  { key: 'merchant', header: 'Merchant', sortable: true },
  { key: 'category', header: 'Category', hideBelow: 'sm' },
  { key: 'amount', header: 'Amount', sortable: true, align: 'end', cell: (r) => usd.format(r.amount) },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 pb-8">
      <h2 className="text-[12px] font-medium text-n-text-secondary">{title}</h2>
      {children}
    </section>
  );
}

/** Lab: data group (cards, stats, tables, pagination, feedback). */
export default function Data() {
  const [selected, setSelected] = useState<string[]>(['2']);
  const [page, setPage] = useState(4);
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 text-n-ui sm:px-8">
      <Section title="Card + Stat">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card.Root><Card.Content><Stat icon="wallet" label="Balance" value="$12,480" delta="+$1,120" trend="up" description="this month" /></Card.Content></Card.Root>
          <Card.Root><Card.Content><Stat label="Spending" value="$1,808" delta="+12%" trend="up" upIsGood={false} /></Card.Content></Card.Root>
          <Card.Root interactive asChild><a href="#/lab/data"><Card.Header><Card.Title>Link card</Card.Title><Card.Description>Hover and focus</Card.Description></Card.Header></a></Card.Root>
        </div>
      </Section>
      <Section title="Table">
        <Table.Root aria-label="Wide table">
          <Table.Header><Table.Row>{['Invoice', 'Client', 'Status', 'Issued', 'Due', 'Amount'].map((h) => <Table.Head key={h} align={h === 'Amount' ? 'end' : 'start'}>{h}</Table.Head>)}</Table.Row></Table.Header>
          <Table.Body>
            <Table.Row><Table.Cell>INV-208</Table.Cell><Table.Cell>Acme Corporation International</Table.Cell><Table.Cell>Paid</Table.Cell><Table.Cell>Oct 1</Table.Cell><Table.Cell>Oct 31</Table.Cell><Table.Cell align="end">$4,200.00</Table.Cell></Table.Row>
            <Table.Row selected><Table.Cell>INV-209</Table.Cell><Table.Cell>Globex</Table.Cell><Table.Cell>Due</Table.Cell><Table.Cell>Oct 3</Table.Cell><Table.Cell>Nov 2</Table.Cell><Table.Cell align="end">$1,850.00</Table.Cell></Table.Row>
          </Table.Body>
        </Table.Root>
      </Section>
      <Section title="DataTable (selection, sort, row click) + Pagination">
        <DataTable label="Transactions" columns={columns} rows={rows} selectedIds={selected} onSelectedIdsChange={setSelected} onRowClick={() => undefined} />
        <Pagination page={page} pageCount={12} onPageChange={setPage} />
      </Section>
      <Section title="DataTable loading / empty">
        <DataTable label="Loading" columns={columns} rows={[]} loading loadingRows={2} selectable />
        <DataTable label="Empty" columns={columns} rows={[]} empty="No transactions match" />
      </Section>
      <Section title="EmptyState / Skeleton">
        <EmptyState icon="bank" title="No accounts connected" description="Connect a bank account to import transactions." action={<Button variant="primary">Connect</Button>} />
        <div className="flex max-w-sm items-center gap-3"><Skeleton width={40} height={40} radius="full" /><Skeleton lines={2} className="flex-1" /></div>
      </Section>
      <Section title="Progress">
        <div className="flex max-w-sm flex-col gap-4">
          <Progress label="Groceries" value={412} max={500} tone="success" valueText="$412 of $500" />
          <Progress label="Dining out" value={238} max={200} tone="danger" valueText="$238 of $200" />
          <Progress aria-label="Small" value={40} size="sm" tone="warning" />
        </div>
      </Section>
      <Section title="Alert">
        {(['neutral', 'info', 'success', 'warning', 'danger'] as const).map((t) => (
          <Alert key={t} tone={t} title={`${t} alert`} action={<Button size="sm" variant="secondary">Review</Button>} onDismiss={() => undefined}>A longer message that wraps on small screens without overflowing the page.</Alert>
        ))}
      </Section>
      <Section title="Accordion">
        <Accordion.Root type="single" collapsible defaultValue="a" className="max-w-lg">
          <Accordion.Item value="a"><Accordion.Trigger>Are there monthly fees?</Accordion.Trigger><Accordion.Content>No monthly fees.</Accordion.Content></Accordion.Item>
          <Accordion.Item value="b"><Accordion.Trigger>How long do transfers take?</Accordion.Trigger><Accordion.Content>1–2 business days.</Accordion.Content></Accordion.Item>
          <Accordion.Item value="c" disabled><Accordion.Trigger>Disabled</Accordion.Trigger><Accordion.Content>Hidden.</Accordion.Content></Accordion.Item>
        </Accordion.Root>
      </Section>
    </div>
  );
}
