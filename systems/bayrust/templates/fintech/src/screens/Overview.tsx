import { useEffect, useState } from 'react';
import {
  Alert, BarChart, Button, CardContent, CardHeader, CardRoot, CardTitle, DonutChart, Grid,
  LineChart, PageHeader, SegmentedControl, Skeleton, Sparkline, Stack, Stat, Table,
} from '@krackedui/bayrust';
import { accounts, balanceSeries, months, transactions, CATEGORIES } from '../data';
import { money, signed, day } from '../format';
import { go } from '../router';

const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
const thisMonth = months[months.length - 1];
const lastMonth = months[months.length - 2];
const delta = (now: number, before: number) => `${now >= before ? '+' : '−'}${Math.abs(Math.round(((now - before) / before) * 100))}%`;

const spendByCategory = CATEGORIES.filter((c) => c !== 'Revenue').map((category) => ({
  label: category,
  value: Math.round(transactions.filter((t) => t.category === category).reduce((s, t) => s + Math.abs(t.amount), 0)),
}));

const balanceSpark = balanceSeries.filter((_, i) => i % 6 === 0).map((p) => p.balance);
const recent = transactions.slice(0, 5);

export function Overview() {
  const [range, setRange] = useState('6');
  // The spec asks for a first-paint loading state; 400 ms, once, then never again.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const shown = months.slice(range === '6' ? -6 : -12);

  if (loading) {
    return (
      <>
        <PageHeader title="Overview" description="Every account, this month." />
        <Stack gap={12}>
          <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={10}>
            {[0, 1, 2, 3].map((i) => (
              <CardRoot key={i}>
                <CardContent>
                  <Skeleton lines={2} />
                </CardContent>
              </CardRoot>
            ))}
          </Grid>
          <Skeleton height={200} />
        </Stack>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Overview"
        description="Every account, this month."
        actions={<Button variant="primary" icon="plus" onClick={() => go('/payments')}>New payment</Button>}
      />
      <Stack gap={12}>
        <Alert tone="warning" title="Payroll is below one month of runway" action={<Button size="sm" onClick={() => go('/accounts')}>Review</Button>}>
          The Payroll account holds {money(accounts[2].balance)}, under the {money(60_000)} you usually run.
        </Alert>

        <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={10}>
          <CardRoot>
            <CardContent>
              <Stat label="Total balance" value={money(totalBalance)} delta={delta(thisMonth.net, lastMonth.net)} trend={thisMonth.net >= lastMonth.net ? 'up' : 'down'} />
              <Sparkline data={balanceSpark} label="Balance over 90 days" />
            </CardContent>
          </CardRoot>
          <CardRoot>
            <CardContent>
              <Stat label="Money in" value={money(thisMonth.in)} delta={delta(thisMonth.in, lastMonth.in)} trend={thisMonth.in >= lastMonth.in ? 'up' : 'down'} />
              <Sparkline data={months.map((m) => m.in)} label="Money in by month" />
            </CardContent>
          </CardRoot>
          <CardRoot>
            <CardContent>
              {/* up is bad here: spending more is not an improvement */}
              <Stat label="Money out" value={money(thisMonth.out)} delta={delta(thisMonth.out, lastMonth.out)} trend={thisMonth.out >= lastMonth.out ? 'up' : 'down'} upIsGood={false} />
              <Sparkline data={months.map((m) => m.out)} label="Money out by month" tone="warning" />
            </CardContent>
          </CardRoot>
          <CardRoot>
            <CardContent>
              <Stat label="Net" value={money(thisMonth.net)} delta={delta(thisMonth.net, lastMonth.net)} trend={thisMonth.net >= lastMonth.net ? 'up' : 'down'} />
              <Sparkline data={months.map((m) => m.net)} label="Net by month" tone="success" />
            </CardContent>
          </CardRoot>
        </Grid>

        <Grid columns={{ base: 1, lg: 2 }} gap={10}>
          <CardRoot>
            <CardHeader>
              <CardTitle>Cash flow</CardTitle>
              <SegmentedControl
                aria-label="Months shown"
                value={range}
                onValueChange={setRange}
                size="sm"
                options={[
                  { value: '6', label: '6 months' },
                  { value: '12', label: '12 months' },
                ]}
              />
            </CardHeader>
            <CardContent>
              <BarChart
                data={shown}
                index="month"
                series={[{ key: 'in', label: 'In' }, { key: 'out', label: 'Out' }]}
                label="Money in and out by month"
                valueFormat={money}
              />
            </CardContent>
          </CardRoot>

          <CardRoot>
            <CardHeader>
              <CardTitle>Spend by category</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart data={spendByCategory} label="Spend by category" center={money(spendByCategory.reduce((s, d) => s + d.value, 0))} valueFormat={money} />
            </CardContent>
          </CardRoot>
        </Grid>

        <CardRoot>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={balanceSeries.filter((_, i) => i % 3 === 0)}
              index="day"
              series={[{ key: 'balance', label: 'Balance' }]}
              label="Balance over 90 days"
              valueFormat={money}
              area
            />
          </CardContent>
        </CardRoot>

        <CardRoot>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <Button size="sm" onClick={() => go('/transactions')}>View all</Button>
          </CardHeader>
          <CardContent>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Date</Table.Head>
                  <Table.Head>Merchant</Table.Head>
                  <Table.Head align="end">Amount</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {recent.map((t) => (
                  <Table.Row key={t.id}>
                    <Table.Cell>{day(t.date)}</Table.Cell>
                    <Table.Cell>{t.merchant}</Table.Cell>
                    <Table.Cell align="end">{signed(t.amount)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </CardContent>
        </CardRoot>
      </Stack>
    </>
  );
}
