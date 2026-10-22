import { useMemo } from 'react';
import { Badge, Button, Card, DataTable, Grid, LineChart, Stat, type DataTableColumn } from '@krackedui/motion';
import { Page } from '../components/Page';
import { Panel } from '../components/Panel';
import { Money } from '../components/Money';
import { CategoryTag, StatusBadge } from '../components/TransactionBits';
import { accountById, balanceHistoryByAccount } from '../data/accounts';
import type { AccountId, Transaction } from '../data/types';
import { useStore } from '../state/store';
import { formatChange, formatMoney, formatMoneyCompact, formatShortDate, trendOf } from '../lib/format';
import { href, navigate } from '../lib/router';
import { NotFoundPage } from './NotFoundPage';

const columns: DataTableColumn<Transaction>[] = [
  { key: 'date', header: 'Date', sortable: true, width: 96, cell: (t) => <span className="whitespace-nowrap tabular-nums">{formatShortDate(t.date)}</span> },
  { key: 'merchant', header: 'Merchant', sortable: true },
  { key: 'category', header: 'Category', hideBelow: 'md', cell: (t) => <CategoryTag category={t.category} /> },
  { key: 'status', header: 'Status', hideBelow: 'sm', cell: (t) => <StatusBadge status={t.status} /> },
  { key: 'amount', header: 'Amount', sortable: true, align: 'end', cell: (t) => <Money amount={t.amount} signed /> },
];

const isAccountId = (id: string): id is AccountId => id in accountById;

export function AccountDetailPage({ id }: { id: string }) {
  const { state } = useStore();
  const rows = useMemo(() => state.transactions.filter((t) => t.account === id), [state.transactions, id]);
  if (!isAccountId(id)) return <NotFoundPage path={`/accounts/${id}`} />;
  const account = accountById[id];
  const history = balanceHistoryByAccount[id];
  const monthAgo = history[history.length - 31].balance;
  const moneyIn = rows.filter((t) => t.amount > 0 && t.status !== 'Failed').reduce((s, t) => s + t.amount, 0);
  const moneyOut = rows.filter((t) => t.amount < 0 && t.status !== 'Failed').reduce((s, t) => s - t.amount, 0);

  return (
    <Page
      title={`${account.name} account`}
      description={`${account.kind} · ${account.institution} •• ${account.last4}`}
      actions={<Button variant="secondary" icon="arrowLeft" asChild><a href={href({ page: 'accounts' })}>All accounts</a></Button>}
    >
      <div className="flex flex-col gap-4">
        <Grid columns={{ base: 1, sm: 3 }} gap={4}>
          <Card.Root><Card.Content>
            <Stat label="Balance" value={formatMoney(account.balance)} delta={formatChange(account.balance, monthAgo)} trend={trendOf(account.balance, monthAgo)} description="vs 30 days ago" />
          </Card.Content></Card.Root>
          <Card.Root><Card.Content>
            <Stat label="Money in, 90 days" value={formatMoney(moneyIn)} icon="arrowDown" />
          </Card.Content></Card.Root>
          <Card.Root><Card.Content>
            <Stat label="Money out, 90 days" value={formatMoney(moneyOut)} icon="arrowUp" />
          </Card.Content></Card.Root>
        </Grid>
        <Panel title="Balance" description="End of day, last 90 days" action={<Badge tone="neutral">{account.kind}</Badge>}>
          <LineChart
            data={history}
            index="day"
            indexLabel="Day"
            series={[{ key: 'balance', label: `${account.name} balance`, color: 'blue' }]}
            valueFormat={formatMoneyCompact}
            area
            zeroBaseline={false}
            label={`${account.name} balance, last 90 days`}
          />
        </Panel>
        <Panel title="Transactions" description={`${rows.length} in the last 90 days`}>
          <DataTable
            label={`${account.name} transactions`}
            columns={columns}
            rows={rows}
            defaultSort={{ key: 'date', direction: 'desc' }}
            maxHeight={480}
            onRowClick={(t) => navigate({ page: 'transactions', txn: t.id })}
            empty="No transactions on this account yet"
          />
        </Panel>
      </div>
    </Page>
  );
}
