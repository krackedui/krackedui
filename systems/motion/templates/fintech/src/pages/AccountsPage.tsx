import { Badge, Card, Grid, Sparkline } from '@krackedui/motion';
import { Page } from '../components/Page';
import { accounts, balanceHistoryByAccount, totalBalance } from '../data/accounts';
import { LOW_BALANCE_THRESHOLD } from '../data/company';
import { formatChange, formatMoney } from '../lib/format';
import { href } from '../lib/router';

export function AccountsPage() {
  return (
    <Page title="Accounts" description={`${accounts.length} accounts · ${formatMoney(totalBalance)} total`}>
      <Grid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
        {accounts.map((a) => {
          const history = balanceHistoryByAccount[a.id];
          const monthAgo = history[history.length - 31].balance;
          const low = a.balance < LOW_BALANCE_THRESHOLD;
          return (
            <Card.Root key={a.id} interactive asChild>
              <a href={href({ page: 'account', id: a.id })} aria-label={`${a.name} account, ${formatMoney(a.balance)}`}>
                <Card.Header>
                  <div className="flex items-center justify-between gap-2">
                    <Card.Title>{a.name}</Card.Title>
                    {low ? <Badge tone="warning">Low balance</Badge> : <Badge tone="neutral">{a.kind}</Badge>}
                  </div>
                  <Card.Description>{a.institution} •• {a.last4}</Card.Description>
                </Card.Header>
                <Card.Content className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="text-[24px] font-semibold leading-8 tabular-nums">{formatMoney(a.balance)}</span>
                    <span className="text-n-ui-sm text-n-text-secondary tabular-nums">{formatChange(a.balance, monthAgo)} in 30 days</span>
                  </div>
                  <Sparkline
                    data={history.map((p) => p.balance)}
                    height={40}
                    tone={low ? 'warning' : 'accent'}
                    label={`${a.name} balance, last 90 days`}
                    valueFormat={(v) => formatMoney(v, { whole: true })}
                  />
                </Card.Content>
              </a>
            </Card.Root>
          );
        })}
      </Grid>
    </Page>
  );
}
