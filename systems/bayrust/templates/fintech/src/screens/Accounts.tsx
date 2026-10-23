import { useState } from 'react';
import {
  CardContent, CardHeader, CardRoot, CardTitle, Grid, LineChart, PageHeader, Sparkline, Stack,
  Stat, Table, Tabs,
} from '@krackedui/bayrust';
import { accounts, balanceSeries, transactions } from '../data';
import { day, money, signed } from '../format';

const sparkFor = (id: string) =>
  balanceSeries.filter((_, i) => i % 6 === 0).map((p, i) => Math.round(p.balance * (id === 'rs' ? 1.6 : id === 'pr' ? 0.3 : 1) + i));

export function Accounts() {
  const [active, setActive] = useState(accounts[0].id);
  const account = accounts.find((a) => a.id === active) ?? accounts[0];
  const rows = transactions.filter((t) => t.accountId === account.id).slice(0, 10);

  return (
    <>
      <PageHeader title="Accounts" description="Three accounts, one balance." />
      <Stack gap={12}>
        <Grid columns={{ base: 1, md: 3 }} gap={10}>
          {accounts.map((a) => (
            <CardRoot key={a.id}>
              <CardContent>
                <Stat label={`${a.name} · ${a.institution} •• ${a.last4}`} value={money(a.balance)} description={a.kind} />
                <Sparkline data={sparkFor(a.id)} label={`${a.name} balance over 90 days`} />
              </CardContent>
            </CardRoot>
          ))}
        </Grid>

        <CardRoot>
          <CardHeader>
            <CardTitle>Account detail</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs.Root value={active} onValueChange={setActive}>
              <Tabs.List>
                {accounts.map((a) => (
                  <Tabs.Trigger key={a.id} value={a.id}>
                    {a.name}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              {accounts.map((a) => (
                <Tabs.Content key={a.id} value={a.id}>
                  <Stack gap={10}>
                    <LineChart
                      data={balanceSeries.filter((_, i) => i % 3 === 0)}
                      index="day"
                      series={[{ key: 'balance', label: `${a.name} balance` }]}
                      label={`${a.name} balance over 90 days`}
                      valueFormat={money}
                      area
                    />
                    <Table.Root>
                      <Table.Header>
                        <Table.Row>
                          <Table.Head>Date</Table.Head>
                          <Table.Head>Merchant</Table.Head>
                          <Table.Head align="end">Amount</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {rows.map((t) => (
                          <Table.Row key={t.id}>
                            <Table.Cell>{day(t.date)}</Table.Cell>
                            <Table.Cell>{t.merchant}</Table.Cell>
                            <Table.Cell align="end">{signed(t.amount)}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Stack>
                </Tabs.Content>
              ))}
            </Tabs.Root>
          </CardContent>
        </CardRoot>
      </Stack>
    </>
  );
}
