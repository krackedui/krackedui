import { BarChart, DonutChart, LineChart, Sparkline } from '@krackedui/motion';

const cashflow = [
  { month: 'May', income: 4800, spending: 3900 }, { month: 'Jun', income: 5100, spending: 4200 },
  { month: 'Jul', income: 4950, spending: 4600 }, { month: 'Aug', income: 5300, spending: 3800 },
  { month: 'Sep', income: 4940, spending: 4100 }, { month: 'Oct', income: 5150, spending: 3650 },
];
const tasks = [
  { status: 'Backlog', bugs: 14, features: 22 }, { status: 'In progress', bugs: 6, features: 11 },
  { status: 'In review', bugs: 3, features: 7 }, { status: 'Done this sprint', bugs: 18, features: 25 },
];
const usd = (v: number) => `$${v.toLocaleString('en-US')}`;

/** Lab: charts group. */
export default function Charts() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-6 sm:px-8">
      <LineChart label="Income and spending" data={cashflow} index="month" series={[{ key: 'income', label: 'Income', color: 'green' }, { key: 'spending', label: 'Spending', color: 'red' }]} valueFormat={usd} area curved />
      <BarChart label="Income and spending (bars)" data={cashflow} index="month" series={[{ key: 'income', label: 'Income' }, { key: 'spending', label: 'Spending' }]} valueFormat={usd} />
      <BarChart label="Tasks by status" data={tasks} index="status" series={[{ key: 'features', label: 'Features', color: 'purple' }, { key: 'bugs', label: 'Bugs', color: 'orange' }]} stacked layout="horizontal" />
      <DonutChart label="Spend" data={[{ label: 'Housing', value: 1450 }, { label: 'Food', value: 412 }, { label: 'Transport', value: 164 }, { label: 'Shopping', value: 238 }]} valueFormat={usd} center={<span className="text-[18px] font-semibold">$2,264</span>} />
      <div className="flex items-center gap-4"><Sparkline label="Rising" data={[3, 5, 4, 8, 7, 9, 12]} tone="success" width={96} /><Sparkline label="Falling" data={[9, 8, 8, 6, 5, 4, 2]} tone="danger" width={96} /></div>
    </div>
  );
}
