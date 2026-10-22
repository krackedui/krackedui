import { BarChart, Grid, Stat, Card } from '@krackedui/motion';
import { Page } from '../components/Page';
import { Panel } from '../components/Panel';
import { BudgetRow } from '../components/BudgetRow';
import { useStore } from '../state/store';
import { formatMoney, formatMoneyCompact } from '../lib/format';

export function BudgetsPage() {
  const { state } = useStore();
  const limit = state.budgets.reduce((s, b) => s + b.limit, 0);
  const spent = state.budgets.reduce((s, b) => s + b.spent, 0);
  const over = state.budgets.filter((b) => b.spent > b.limit).length;
  const chartData = state.budgets.map((b) => ({ category: b.category, spent: b.spent, limit: b.limit }));

  return (
    <Page title="Budgets" description="October budgets by category. Limits reset on the 1st.">
      <div className="flex flex-col gap-4">
        <Grid columns={{ base: 1, sm: 3 }} gap={4}>
          <Card.Root><Card.Content><Stat label="Budgeted" value={formatMoney(limit, { whole: true })} /></Card.Content></Card.Root>
          <Card.Root><Card.Content><Stat label="Spent" value={formatMoney(spent)} description={`${Math.round((spent / limit) * 100)}% of budget`} /></Card.Content></Card.Root>
          <Card.Root><Card.Content>
            <Stat label="Over budget" value={`${over} ${over === 1 ? 'category' : 'categories'}`} deltaTone={over ? 'danger' : 'success'} delta={over ? 'Needs review' : 'On track'} />
          </Card.Content></Card.Root>
        </Grid>
        <Grid columns={{ base: 1, lg: 2 }} gap={4}>
          <Panel title="By category">
            <ul className="m-0 flex list-none flex-col p-0">
              {state.budgets.map((b) => <BudgetRow key={b.category} budget={b} />)}
            </ul>
          </Panel>
          <Panel title="Spend vs budget" description="This month">
            <BarChart
              data={chartData}
              index="category"
              indexLabel="Category"
              layout="horizontal"
              height={280}
              series={[{ key: 'spent', label: 'Spent', color: 'orange' }, { key: 'limit', label: 'Budget', color: 'gray' }]}
              valueFormat={formatMoneyCompact}
              label="Spend vs budget by category"
            />
          </Panel>
        </Grid>
      </div>
    </Page>
  );
}
