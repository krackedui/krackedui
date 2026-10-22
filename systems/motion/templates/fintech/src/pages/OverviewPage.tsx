import { useEffect, useMemo, useState } from 'react';
import {
  Alert, BarChart, Button, Card, DataTable, DonutChart, Grid, LineChart, SegmentedControl, Skeleton,
  type DataTableColumn,
} from '@krackedui/motion';
import { Page } from '../components/Page';
import { Panel } from '../components/Panel';
import { KpiCard } from '../components/KpiCard';
import { Money } from '../components/Money';
import { categoryColor } from '../components/TransactionBits';
import { monthlyFlows, netOf } from '../data/cashflow';
import { totalBalance, totalBalanceHistory } from '../data/accounts';
import { TODAY } from '../data/company';
import type { Transaction } from '../data/types';
import { useStore } from '../state/store';
import { periodOptions, periodRange, usePreferences } from '../state/preferences';
import { deriveAlerts } from '../lib/alerts';
import { spendByCategory, topWithOther } from '../lib/analytics';
import { formatMoney, formatMoneyCompact, formatShortDate } from '../lib/format';
import { href, navigate } from '../lib/router';
import { startOfMonth, toIsoDate } from '../lib/dates';

/** Overview shows skeletons the first time it loads (as if fetching), not on every visit. */
let loadedOnce = false;
function useFirstLoad(ms: number) {
  const [loading, setLoading] = useState(!loadedOnce);
  useEffect(() => {
    if (!loading) return;
    const id = window.setTimeout(() => { loadedOnce = true; setLoading(false); }, ms);
    return () => window.clearTimeout(id);
  }, [loading, ms]);
  return loading;
}

const recentColumns: DataTableColumn<Transaction>[] = [
  {
    key: 'merchant',
    header: 'Merchant',
    cell: (t) => (
      <span className="flex min-w-0 flex-col py-0.5">
        <span className="truncate">{t.merchant}</span>
        <span className="text-n-ui-sm text-n-text-secondary">{formatShortDate(t.date)} · {t.category}</span>
      </span>
    ),
  },
  { key: 'amount', header: 'Amount', align: 'end', cell: (t) => <Money amount={t.amount} signed /> },
];

function KpiSkeleton() {
  return (
    <Card.Root aria-hidden>
      <Card.Content className="flex flex-col gap-3">
        <Skeleton width="45%" />
        <Skeleton width="70%" height={28} />
        <Skeleton width="55%" />
        <Skeleton height={32} />
      </Card.Content>
    </Card.Root>
  );
}

export function OverviewPage() {
  const { state } = useStore();
  const { period } = usePreferences();
  const loading = useFirstLoad(400);
  const [months, setMonths] = useState('6');

  const current = monthlyFlows[monthlyFlows.length - 1];
  const previous = monthlyFlows[monthlyFlows.length - 2];
  const balanceMonthAgo = totalBalanceHistory[totalBalanceHistory.length - 31].balance;
  const alerts = useMemo(() => deriveAlerts(state), [state]);

  const range = periodRange(period);
  const periodLabel = periodOptions.find((p) => p.value === period)?.label ?? '';
  const fromIso = toIsoDate(range.from);
  const balanceSeries = totalBalanceHistory.filter((p) => p.date >= fromIso);
  const spend = useMemo(() => {
    const rows = spendByCategory(state.transactions, startOfMonth(TODAY), TODAY);
    return topWithOther(rows.map((r) => ({ label: r.category, value: r.amount })), 5).map((d) => ({
      ...d,
      color: d.label in categoryColor ? categoryColor[d.label as keyof typeof categoryColor] : ('gray' as const),
    }));
  }, [state.transactions]);
  const spendTotal = spend.reduce((s, d) => s + d.value, 0);
  const flows = monthlyFlows.slice(-Number(months));

  return (
    <Page title="Overview" description={`${TODAY.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · all accounts`}>
      <div className="flex flex-col gap-4">
        {alerts.length > 0 && (
          <div className="flex flex-col gap-2">
            {alerts.slice(0, 2).map((a) => (
              <Alert key={a.id} tone={a.tone} title={a.title} action={<Button size="sm" variant="secondary" onClick={() => navigate(a.route)}>Review</Button>}>
                {a.description}
              </Alert>
            ))}
          </div>
        )}

        <Grid columns={{ base: 1, sm: 2, xl: 4 }} gap={4}>
          {loading ? (
            Array.from({ length: 4 }, (_, i) => <KpiSkeleton key={i} />)
          ) : (
            <>
              <KpiCard label="Total balance" icon="bank" value={totalBalance} previous={balanceMonthAgo}
                history={totalBalanceHistory.slice(-30).map((p) => p.balance)} historyLabel="Total balance, last 30 days" />
              <KpiCard label="Money in" icon="arrowDown" value={current.moneyIn} previous={previous.moneyIn}
                history={monthlyFlows.map((m) => m.moneyIn)} historyLabel="Money in, last 12 months" />
              <KpiCard label="Money out" icon="arrowUp" value={current.moneyOut} previous={previous.moneyOut} upIsGood={false}
                history={monthlyFlows.map((m) => m.moneyOut)} historyLabel="Money out, last 12 months" />
              <KpiCard label="Net cash flow" icon="trendingUp" value={netOf(current)} previous={netOf(previous)}
                history={monthlyFlows.map(netOf)} historyLabel="Net cash flow, last 12 months" />
            </>
          )}
        </Grid>

        <Grid columns={{ base: 1, lg: 3 }} gap={4}>
          <Panel
            className="lg:col-span-2"
            title="Cash flow"
            description="Money in vs money out by month"
            action={
              <SegmentedControl
                aria-label="Months shown"
                value={months}
                onValueChange={setMonths}
                options={[{ value: '6', label: '6 months' }, { value: '12', label: '12 months' }]}
              />
            }
          >
            {loading ? <Skeleton height={240} /> : (
              <BarChart
                data={flows}
                index="month"
                indexLabel="Month"
                series={[{ key: 'moneyIn', label: 'Money in', color: 'green' }, { key: 'moneyOut', label: 'Money out', color: 'red' }]}
                valueFormat={formatMoneyCompact}
                label={`Cash flow, last ${months} months`}
              />
            )}
          </Panel>
          <Panel title="Spend by category" description="This month">
            {loading ? <Skeleton height={240} /> : (
              <DonutChart
                data={spend}
                label="Spend by category this month"
                valueFormat={(v) => formatMoney(v, { whole: true })}
                center={
                  <span className="flex flex-col items-center">
                    <span className="text-n-ui-sm text-n-text-secondary">Total</span>
                    <span className="text-[16px] font-semibold tabular-nums">{formatMoneyCompact(spendTotal)}</span>
                  </span>
                }
              />
            )}
          </Panel>
        </Grid>

        <Grid columns={{ base: 1, lg: 3 }} gap={4}>
          <Panel className="lg:col-span-2" title="Balance" description={`All accounts · ${periodLabel.toLowerCase()}`}>
            {loading ? <Skeleton height={240} /> : (
              <LineChart
                data={balanceSeries}
                index="day"
                indexLabel="Day"
                series={[{ key: 'balance', label: 'Total balance', color: 'blue' }]}
                valueFormat={formatMoneyCompact}
                area
                zeroBaseline={false}
                label={`Total balance, ${periodLabel.toLowerCase()}`}
              />
            )}
          </Panel>
          <Panel
            title="Recent transactions"
            action={<Button size="sm" variant="ghost" trailingIcon="arrowRight" asChild><a href={href({ page: 'transactions' })}>View all</a></Button>}
          >
            <DataTable
              label="Recent transactions"
              columns={recentColumns}
              rows={state.transactions.slice(0, 5)}
              loading={loading}
              density="compact"
              onRowClick={(t) => navigate({ page: 'transactions', txn: t.id })}
            />
          </Panel>
        </Grid>
      </div>
    </Page>
  );
}
