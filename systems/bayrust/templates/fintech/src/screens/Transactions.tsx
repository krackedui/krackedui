import { useMemo, useState } from 'react';
import {
  Badge, Button, CardContent, CardRoot, Combobox, DataTable, DateRangePicker, EmptyState, Field,
  FileUpload, NumberInput, PageHeader, Pagination, SearchInput, Select, Sheet, Stack, Tag, Textarea,
  useToast,
  type DateRange,
} from '@krackedui/bayrust';
import { CATEGORIES, accounts, parseDay, today, transactions as seed, type Category, type Transaction } from '../data';
import { day, moneyExact, signed } from '../format';

const PAGE_SIZE = 25;
const TONE = { Posted: 'success', Pending: 'warning', Failed: 'danger' } as const;

const dayBefore = (n: number) => {
  const t = today();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate() - n);
};

const presets = [
  { label: 'Last 7 days', range: { from: dayBefore(7), to: today() } },
  { label: 'Last 30 days', range: { from: dayBefore(30), to: today() } },
  { label: 'Last 90 days', range: { from: dayBefore(90), to: today() } },
  { label: 'This month', range: { from: new Date(today().getFullYear(), today().getMonth(), 1), to: today() } },
];

/** Quoted so a merchant with a comma survives the round trip. */
function toCsv(rows: Transaction[]): string {
  const head = ['id', 'date', 'merchant', 'category', 'account', 'status', 'amount'];
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const body = rows.map((t) => [t.id, t.date, t.merchant, t.category, t.accountId, t.status, t.amount].map(cell).join(','));
  return [head.join(','), ...body].join('\n');
}

export function Transactions() {
  const { toast } = useToast();
  const [rows, setRows] = useState(seed);
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = rows.filter((t) => {
      if (range.from && parseDay(t.date) < range.from) return false;
      if (range.to && parseDay(t.date) > range.to) return false;
      if (category && t.category !== category) return false;
      if (status && t.status !== status) return false;
      if (min !== null && Math.abs(t.amount) < min) return false;
      if (max !== null && Math.abs(t.amount) > max) return false;
      if (q && !`${t.merchant} ${t.category} ${t.id}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort) {
      const dir = sort.direction === 'asc' ? 1 : -1;
      out.sort((a, b) => {
        if (sort.key === 'amount') return (a.amount - b.amount) * dir;
        const av = String(a[sort.key as keyof Transaction] ?? '');
        const bv = String(b[sort.key as keyof Transaction] ?? '');
        return av.localeCompare(bv) * dir;
      });
    }
    return out;
  }, [rows, range, category, status, min, max, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const reset = () => {
    setRange({ from: null, to: null });
    setCategory('');
    setStatus('');
    setMin(null);
    setMax(null);
    setQuery('');
    setPage(1);
  };

  const exportCsv = () => {
    const picked = rows.filter((t) => selected.includes(t.id));
    const blob = new Blob([toCsv(picked)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ message: `Exported ${picked.length} transactions`, tone: 'success' });
  };

  const recategorise = (id: string, next: Category) => {
    setRows((list) => list.map((t) => (t.id === id ? { ...t, category: next } : t)));
    setOpen((o) => (o && o.id === id ? { ...o, category: next } : o));
    toast({ message: 'Category updated', description: next, tone: 'success' });
  };

  return (
    <>
      <PageHeader
        title="Transactions"
        description={`${filtered.length} of ${rows.length} over the last 90 days.`}
        actions={
          selected.length > 0 ? (
            <Stack direction="row" gap={6}>
              <Button size="sm" icon="download" onClick={exportCsv}>
                Export CSV ({selected.length})
              </Button>
              <Button
                size="sm"
                icon="tag"
                onClick={() => {
                  setRows((list) => list.map((t) => (selected.includes(t.id) ? { ...t, category: 'Supplies' } : t)));
                  toast({ message: `Categorised ${selected.length} as Supplies`, tone: 'success' });
                  setSelected([]);
                }}
              >
                Categorise
              </Button>
            </Stack>
          ) : undefined
        }
      />

      <Stack gap={10}>
        <CardRoot>
          <CardContent>
            <Stack direction={{ base: 'column', lg: 'row' }} gap={8} align="start" wrap>
              <Field label="Period" hideLabel>
                <DateRangePicker label="Period" value={range} onValueChange={(r) => { setRange(r); setPage(1); }} presets={presets} placeholder="Any date" />
              </Field>
              <Field label="Category" hideLabel>
                <Combobox
                  label="Category"
                  placeholder="Any category"
                  value={category}
                  onValueChange={(v) => { setCategory(v); setPage(1); }}
                  options={[{ value: '', label: 'Any category' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]}
                />
              </Field>
              <Field label="Status" hideLabel>
                <Select
                  aria-label="Status"
                  value={status}
                  onValueChange={(v) => { setStatus(v); setPage(1); }}
                  options={[
                    { value: '', label: 'Any status' },
                    { value: 'Posted', label: 'Posted' },
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Failed', label: 'Failed' },
                  ]}
                />
              </Field>
              <Field label="Min amount" hideLabel>
                <NumberInput aria-label="Minimum amount" placeholder="Min" min={0} value={min} onValueChange={setMin} />
              </Field>
              <Field label="Max amount" hideLabel>
                <NumberInput aria-label="Maximum amount" placeholder="Max" min={0} value={max} onValueChange={setMax} />
              </Field>
              <Field label="Search" hideLabel>
                <SearchInput aria-label="Search transactions" placeholder="Search…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} onClear={() => setQuery('')} />
              </Field>
              <Button size="sm" onClick={reset}>
                Clear
              </Button>
            </Stack>
          </CardContent>
        </CardRoot>

        {filtered.length === 0 ? (
          <EmptyState icon="search" title="No transactions match" description="Widen the period or clear a filter." action={<Button onClick={reset}>Clear filters</Button>} />
        ) : (
          <>
            <DataTable
              rows={shown}
              getRowId={(t) => t.id}
              sort={sort}
              onSortChange={(s) => { setSort(s); setPage(1); }}
              selectedIds={selected}
              onSelectedIdsChange={setSelected}
              onRowClick={(t) => setOpen(t)}
              columns={[
                { key: 'date', header: 'Date', sortable: true, cell: (t) => day(t.date) },
                { key: 'merchant', header: 'Merchant', sortable: true },
                { key: 'category', header: 'Category', hideBelow: 'sm', cell: (t) => <Tag color="blue">{t.category}</Tag> },
                { key: 'accountId', header: 'Account', hideBelow: 'md', cell: (t) => accounts.find((a) => a.id === t.accountId)?.name ?? '' },
                { key: 'status', header: 'Status', hideBelow: 'sm', cell: (t) => <Badge tone={TONE[t.status]}>{t.status}</Badge> },
                { key: 'amount', header: 'Amount', align: 'end', sortable: true, cell: (t) => signed(t.amount) },
              ]}
            />
            <Stack direction="row" justify="between" align="center">
              <span>
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
            </Stack>
          </>
        )}
      </Stack>

      <Sheet.Root open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <Sheet.Content side="right">
          <Sheet.Title>{open?.merchant ?? 'Transaction'}</Sheet.Title>
          <Sheet.Description>
            {open ? `${open.id} · ${day(open.date)} · ${moneyExact(open.amount)}` : ''}
          </Sheet.Description>
          {open && (
            <Stack gap={12}>
              <Field label="Category">
                <Combobox
                  label="Category"
                  value={open.category}
                  onValueChange={(v) => recategorise(open.id, v as Category)}
                  options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                />
              </Field>
              <Field label="Note">
                <Textarea
                  aria-label="Note"
                  rows={3}
                  defaultValue={open.note}
                  placeholder="Why this happened…"
                  onBlur={(e) => {
                    const note = e.target.value;
                    setRows((list) => list.map((t) => (t.id === open.id ? { ...t, note } : t)));
                  }}
                />
              </Field>
              <Field label="Receipt" description="PDF or an image, up to 5 MB.">
                <FileUpload
                  label="Add a receipt"
                  accept="application/pdf,image/*"
                  maxSize={5 * 1024 * 1024}
                  onFilesChange={(files) => {
                    if (!files.length) return;
                    setRows((list) => list.map((t) => (t.id === open.id ? { ...t, receipt: true } : t)));
                    toast({ message: 'Receipt attached', description: files[0].name, tone: 'success' });
                  }}
                />
              </Field>
              <Stack direction="row" gap={8}>
                <span>Status</span>
                <Badge tone={TONE[open.status]}>{open.status}</Badge>
                <span>{open.method}</span>
              </Stack>
            </Stack>
          )}
          <Sheet.Footer>
            <Sheet.Close asChild>
              <Button>Close</Button>
            </Sheet.Close>
          </Sheet.Footer>
        </Sheet.Content>
      </Sheet.Root>
    </>
  );
}
