import { useMemo, useState } from 'react';
import {
  Button, Combobox, DataTable, DateRangePicker, EmptyState, Field, Menu, NumberInput, SearchInput,
  Select, useToast, type DataTableColumn, type DataTableSort, type DateRange, type DateRangePreset,
} from '@krackedui/motion';
import { Page } from '../components/Page';
import { Money } from '../components/Money';
import { CategoryTag, StatusBadge } from '../components/TransactionBits';
import { TransactionSheet } from '../components/TransactionSheet';
import type { Category, Transaction, TransactionStatus } from '../data/types';
import { categories, statuses } from '../data/transactions';
import { accountById } from '../data/accounts';
import { TODAY, TODAY_ISO } from '../data/company';
import { useStore } from '../state/store';
import { periodRange, usePreferences } from '../state/preferences';
import { addDays, startOfMonth } from '../lib/dates';
import { formatShortDate } from '../lib/format';
import { countActiveFilters, filterTransactions, type TransactionFilters } from '../lib/transactionFilters';
import { downloadFile, transactionsToCsv } from '../lib/exportCsv';
import { navigate } from '../lib/router';

const PAGE_SIZE = 25;

const presets: DateRangePreset[] = [
  { label: 'Last 7 days', range: { from: addDays(TODAY, -6), to: TODAY } },
  { label: 'Last 30 days', range: { from: addDays(TODAY, -29), to: TODAY } },
  { label: 'Last 90 days', range: { from: addDays(TODAY, -89), to: TODAY } },
  { label: 'This month', range: { from: startOfMonth(TODAY), to: TODAY } },
];

const categoryOptions = [{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c, label: c }))];
const statusOptions = [{ value: '', label: 'All statuses' }, ...statuses.map((s) => ({ value: s, label: s }))];

const columns: DataTableColumn<Transaction>[] = [
  { key: 'date', header: 'Date', sortable: true, width: 96, hideBelow: 'sm', cell: (t) => <span className="whitespace-nowrap tabular-nums">{formatShortDate(t.date)}</span> },
  {
    key: 'merchant',
    header: 'Merchant',
    sortable: true,
    cell: (t) => (
      <span className="flex min-w-0 flex-col">
        <span>{t.merchant}</span>
        {/* Narrow tables hide the Date and Status columns (container query): show them under the merchant instead. */}
        <span className="text-n-ui-sm text-n-text-secondary @min-[640px]:hidden">{formatShortDate(t.date)} · {t.status}</span>
      </span>
    ),
  },
  { key: 'category', header: 'Category', sortable: true, hideBelow: 'md', cell: (t) => <CategoryTag category={t.category} /> },
  { key: 'account', header: 'Account', sortable: true, hideBelow: 'lg', sortValue: (t) => accountById[t.account].name, cell: (t) => accountById[t.account].name },
  { key: 'status', header: 'Status', sortable: true, hideBelow: 'sm', cell: (t) => <StatusBadge status={t.status} /> },
  { key: 'amount', header: 'Amount', sortable: true, align: 'end', cell: (t) => <Money amount={t.amount} signed /> },
];

export function TransactionsPage({ openId }: { openId?: string }) {
  const { state, dispatch } = useStore();
  const { period } = usePreferences();
  const { toast } = useToast();
  const emptyFilters: TransactionFilters = { range: periodRange('90d'), category: '', status: '', min: null, max: null, query: '' };
  const [filters, setFilters] = useState<TransactionFilters>(() => ({ ...emptyFilters, range: periodRange(period) }));
  const [sort, setSort] = useState<DataTableSort | null>({ key: 'date', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  const update = (patch: Partial<TransactionFilters>) => { setFilters((f) => ({ ...f, ...patch })); setPage(1); };
  const rows = useMemo(() => filterTransactions(state.transactions, filters), [state.transactions, filters]);
  const open = state.transactions.find((t) => t.id === openId);
  const selectedRows = state.transactions.filter((t) => selected.includes(t.id));
  const active = countActiveFilters(filters);

  const exportCsv = () => {
    downloadFile(`transactions-${TODAY_ISO}.csv`, transactionsToCsv(selectedRows));
    toast({ message: `Exported ${selectedRows.length} ${selectedRows.length === 1 ? 'transaction' : 'transactions'}`, description: 'The CSV file is in your downloads.', tone: 'success' });
  };
  const categorize = (category: Category) => {
    dispatch({ type: 'transaction/categorize', ids: selected, category });
    toast({ message: `${selected.length} moved to ${category}`, tone: 'success' });
    setSelected([]);
  };

  return (
    <Page title="Transactions" description="Everything that moved through your accounts in the last 90 days.">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-[minmax(200px,1.4fr)_minmax(220px,1.4fr)_repeat(2,minmax(140px,1fr))_repeat(2,minmax(96px,0.7fr))]">
          <Field label="Search" hideLabel className="max-sm:col-span-2">
            <SearchInput
              placeholder="Search merchant, note or ID"
              value={filters.query}
              onChange={(e) => update({ query: e.target.value })}
              onClear={() => update({ query: '' })}
            />
          </Field>
          <Field label="Date range" hideLabel className="max-sm:col-span-2">
            <DateRangePicker
              value={filters.range}
              onValueChange={(range: DateRange) => update({ range })}
              presets={presets}
              max={TODAY}
              today={TODAY}
              placeholder="Any date"
            />
          </Field>
          <Field label="Category" hideLabel className="max-sm:col-span-2">
            <Combobox
              options={categoryOptions}
              value={filters.category}
              onValueChange={(v) => update({ category: v as Category | '' })}
              placeholder="All categories"
              searchPlaceholder="Find a category"
            />
          </Field>
          <Field label="Status" hideLabel className="max-sm:col-span-2">
            <Select options={statusOptions} value={filters.status} onValueChange={(v) => update({ status: v as TransactionStatus | '' })} placeholder="All statuses" />
          </Field>
          <Field label="Minimum amount" hideLabel>
            <NumberInput value={filters.min} onValueChange={(min) => update({ min })} min={0} placeholder="Min $" format={{ style: 'currency', currency: 'USD' }} />
          </Field>
          <Field label="Maximum amount" hideLabel>
            <NumberInput value={filters.max} onValueChange={(max) => update({ max })} min={0} placeholder="Max $" format={{ style: 'currency', currency: 'USD' }} />
          </Field>
        </div>

        <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
          <p className="m-0 text-n-ui text-n-text-secondary" aria-live="polite">
            {selected.length > 0 ? `${selected.length} selected` : `${rows.length} ${rows.length === 1 ? 'transaction' : 'transactions'}`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {selected.length > 0 && (
              <>
                <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear selection</Button>
                <Menu.Root>
                  <Menu.Trigger asChild><Button size="sm" variant="secondary" icon="tag" trailingIcon="chevronDown">Categorize</Button></Menu.Trigger>
                  <Menu.Content align="end" width={200}>
                    <Menu.Label>Move {selected.length} to</Menu.Label>
                    {categories.map((c) => <Menu.Item key={c} onSelect={() => categorize(c)}>{c}</Menu.Item>)}
                  </Menu.Content>
                </Menu.Root>
                <Button size="sm" variant="primary" icon="download" onClick={exportCsv}>Export CSV</Button>
              </>
            )}
            {selected.length === 0 && active > 0 && (
              <Button size="sm" variant="ghost" icon="close" onClick={() => { setFilters(emptyFilters); setPage(1); }}>Clear filters</Button>
            )}
          </div>
        </div>

        <DataTable
          label="Transactions"
          columns={columns}
          rows={rows}
          sort={sort}
          onSortChange={setSort}
          pageSize={PAGE_SIZE}
          page={page}
          onPageChange={setPage}
          selectedIds={selected}
          onSelectedIdsChange={setSelected}
          getRowLabel={(t) => `${t.merchant}, ${formatShortDate(t.date)}`}
          onRowClick={(t) => navigate({ page: 'transactions', txn: t.id })}
          empty={
            <EmptyState
              icon="magnifyingGlass"
              title="No transactions match these filters"
              description="Try a wider date range or clear the filters."
              action={<Button size="sm" variant="secondary" onClick={() => { setFilters(emptyFilters); setPage(1); }}>Clear filters</Button>}
            />
          }
        />

      </div>

      <TransactionSheet transaction={open} onClose={() => navigate({ page: 'transactions' })} />
    </Page>
  );
}
