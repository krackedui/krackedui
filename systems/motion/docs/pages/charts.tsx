// Docs pages for the charts group (LineChart, BarChart, DonutChart, Sparkline). Hand-drawn SVG, no chart
// library. Every `code` string is the complete, copy-paste version of its preview.
import { BarChart, Card, DonutChart, LineChart, Sparkline, Stat } from '@krackedui/motion';
import type { DocPage, InstallStep, NavGroup, PropDef, Section } from '../../../../apps/docs/lib/types';

const eyebrow = 'Charts';

const install = (names: string, usage: string): InstallStep[] => [
  { title: 'Install the design system package (charts need no extra dependency):', packages: ['@krackedui/motion'] },
  {
    title: 'Import the styles once, in your app entry or root layout:',
    file: { filename: '/app/layout.tsx', lang: 'tsx', code: `import '@krackedui/motion/styles.css';` },
  },
  {
    title: 'Import the chart and render it inside `<Theme>`:',
    file: { filename: '/app/page.tsx', lang: 'tsx', code: `import { Theme, ${names} } from '@krackedui/motion';\n\nexport default function Page() {\n  return (\n    <Theme>\n      ${usage}\n    </Theme>\n  );\n}` },
  },
];

const common: PropDef[] = [
  { name: 'label', type: 'string', description: 'Accessible name of the chart and caption of its hidden data table. Required.' },
  { name: 'valueFormat', type: '(value: number) => string', default: 'grouped digits', description: 'Formats axis ticks, tooltip, readout and table values (e.g. currency).' },
  { name: 'className', type: 'string', description: 'Classes for the outer wrapper.' },
  { name: 'style', type: 'CSSProperties', description: 'Styles for the outer wrapper.' },
  { name: 'id', type: 'string', description: 'Id of the outer wrapper.' },
];
const cartesian: PropDef[] = [
  { name: 'data', type: 'Datum[]', description: 'One object per x value / category.' },
  { name: 'index', type: 'keyof Datum', description: 'Field holding the x value / category label.' },
  { name: 'series', type: '{ key: string; label: string; color?: Color }[]', description: 'Numeric fields to draw. Colors default to blue, orange, green, purple, pink, teal… in order.' },
  { name: 'height', type: 'number', default: '240', description: 'Height in px; the width follows the container.' },
  { name: 'legend', type: 'boolean', default: 'series.length > 1', description: 'Show the color legend.' },
  { name: 'indexLabel', type: 'string', description: 'Header of the first data-table column. Defaults to `index`, capitalized.' },
];

const chartA11y: Section = {
  title: 'Accessibility',
  blocks: [
    'Keyboard:',
    {
      list: [
        'Tab: focuses the chart (focus ring).',
        '→ / ↓ and ← / ↑: move to the next / previous data point and show its tooltip.',
        'Home / End: first / last point. Escape: hide the tooltip.',
      ],
    },
    'ARIA and semantics:',
    {
      list: [
        'The SVG is `role="img"` named by `label`, with a description of the keys.',
        'A visually hidden `<table>` (caption = `label`) holds every value, formatted with `valueFormat`, for screen readers.',
        'Keyboard moves are read by a polite live region ("Mar: Revenue $5,150, Spending $1,808").',
        'Series are named in the legend, tooltip and table, so color is never the only key.',
        'The entrance animation does not play under reduced motion; the chart renders in its final state on the server.',
      ],
    },
  ],
};

const usage = (use: string[], avoid: string[]): Section => ({
  title: 'Usage',
  blocks: ['Use it for:', { list: use }, 'Avoid it when:', { list: avoid }],
});

const usd = (v: number) => `$${v.toLocaleString('en-US')}`;
const usdCode = `const usd = (v: number) => \`$\${v.toLocaleString('en-US')}\`;`;

/* ---------------------------------------------------------------- data */

const cashflow = [
  { month: 'May', income: 4800, spending: 3900 },
  { month: 'Jun', income: 5100, spending: 4200 },
  { month: 'Jul', income: 4950, spending: 4600 },
  { month: 'Aug', income: 5300, spending: 3800 },
  { month: 'Sep', income: 4940, spending: 4100 },
  { month: 'Oct', income: 5150, spending: 3650 },
];
const cashflowCode = `const cashflow = [
  { month: 'May', income: 4800, spending: 3900 },
  { month: 'Jun', income: 5100, spending: 4200 },
  { month: 'Jul', income: 4950, spending: 4600 },
  { month: 'Aug', income: 5300, spending: 3800 },
  { month: 'Sep', income: 4940, spending: 4100 },
  { month: 'Oct', income: 5150, spending: 3650 },
];`;

const revenue = [
  { week: 'W1', revenue: 12400 }, { week: 'W2', revenue: 13100 }, { week: 'W3', revenue: 12800 }, { week: 'W4', revenue: 14900 },
  { week: 'W5', revenue: 15600 }, { week: 'W6', revenue: 15200 }, { week: 'W7', revenue: 17300 }, { week: 'W8', revenue: 18100 },
  { week: 'W9', revenue: 17600 }, { week: 'W10', revenue: 19400 }, { week: 'W11', revenue: 20800 }, { week: 'W12', revenue: 22100 },
];
const revenueCode = `const revenue = [
  { week: 'W1', revenue: 12400 }, { week: 'W2', revenue: 13100 }, { week: 'W3', revenue: 12800 }, { week: 'W4', revenue: 14900 },
  { week: 'W5', revenue: 15600 }, { week: 'W6', revenue: 15200 }, { week: 'W7', revenue: 17300 }, { week: 'W8', revenue: 18100 },
  { week: 'W9', revenue: 17600 }, { week: 'W10', revenue: 19400 }, { week: 'W11', revenue: 20800 }, { week: 'W12', revenue: 22100 },
];`;

const hours = [
  { team: 'Design', planned: 120, actual: 104 },
  { team: 'Engineering', planned: 320, actual: 356 },
  { team: 'Marketing', planned: 90, actual: 72 },
  { team: 'Support', planned: 150, actual: 161 },
];
const hoursCode = `const hours = [
  { team: 'Design', planned: 120, actual: 104 },
  { team: 'Engineering', planned: 320, actual: 356 },
  { team: 'Marketing', planned: 90, actual: 72 },
  { team: 'Support', planned: 150, actual: 161 },
];`;

const tasks = [
  { status: 'Backlog', bugs: 14, features: 22 },
  { status: 'In progress', bugs: 6, features: 11 },
  { status: 'In review', bugs: 3, features: 7 },
  { status: 'Done this sprint', bugs: 18, features: 25 },
];
const tasksCode = `const tasks = [
  { status: 'Backlog', bugs: 14, features: 22 },
  { status: 'In progress', bugs: 6, features: 11 },
  { status: 'In review', bugs: 3, features: 7 },
  { status: 'Done this sprint', bugs: 18, features: 25 },
];`;

const spend = [
  { label: 'Housing', value: 1450 },
  { label: 'Food', value: 412 },
  { label: 'Transport', value: 164 },
  { label: 'Shopping', value: 238 },
  { label: 'Utilities', value: 96 },
];
const spendCode = `const spend = [
  { label: 'Housing', value: 1450 },
  { label: 'Food', value: 412 },
  { label: 'Transport', value: 164 },
  { label: 'Shopping', value: 238 },
  { label: 'Utilities', value: 96 },
];`;

/* ================================================================== LINE */

const balances = [
  { week: 'Sep 7', balance: 402_300 }, { week: 'Sep 14', balance: 411_900 }, { week: 'Sep 21', balance: 408_200 },
  { week: 'Sep 28', balance: 423_700 }, { week: 'Oct 5', balance: 431_500 }, { week: 'Oct 12', balance: 445_800 },
];
const balancesCode = `const balances = [
  { week: 'Sep 7', balance: 402_300 }, { week: 'Sep 14', balance: 411_900 }, { week: 'Sep 21', balance: 408_200 },
  { week: 'Sep 28', balance: 423_700 }, { week: 'Oct 5', balance: 431_500 }, { week: 'Oct 12', balance: 445_800 },
];`;

const lineChartPage: DocPage = {
  eyebrow,
  title: 'LineChart',
  description: 'Trends over time for one or more series: nice y ticks, a hairline grid, optional area fill and monotone curves. Fills its container and thins x labels on narrow screens.',
  install: install('LineChart', `<LineChart label="Revenue" data={data} index="month" series={[{ key: 'revenue', label: 'Revenue' }]} />`),
  examples: [
    {
      title: 'Revenue (area, curved)',
      align: 'start',
      render: () => (
        <LineChart label="Weekly revenue, last 12 weeks" data={revenue} index="week" series={[{ key: 'revenue', label: 'Revenue' }]} valueFormat={usd} area curved />
      ),
      code: `import { LineChart } from '@krackedui/motion';

${revenueCode}
${usdCode}

export function RevenueChart() {
  return (
    <LineChart label="Weekly revenue, last 12 weeks" data={revenue} index="week" series={[{ key: 'revenue', label: 'Revenue' }]} valueFormat={usd} area curved />
  );
}`,
    },
    {
      title: 'Income vs spending',
      description: 'Two series with explicit colors and a legend.',
      align: 'start',
      render: () => (
        <LineChart
          label="Income and spending, May to October"
          data={cashflow}
          index="month"
          series={[{ key: 'income', label: 'Income', color: 'green' }, { key: 'spending', label: 'Spending', color: 'red' }]}
          valueFormat={usd}
          height={220}
        />
      ),
      code: `import { LineChart } from '@krackedui/motion';

${cashflowCode}
${usdCode}

export function CashflowChart() {
  return (
    <LineChart
      label="Income and spending, May to October"
      data={cashflow}
      index="month"
      series={[{ key: 'income', label: 'Income', color: 'green' }, { key: 'spending', label: 'Spending', color: 'red' }]}
      valueFormat={usd}
      height={220}
    />
  );
}`,
    },
    {
      title: 'Account balance (axis hugs the data)',
      description: '`zeroBaseline={false}`: a balance near $400K that moves a few percent would be a flat line on a zero-based axis.',
      align: 'start',
      render: () => (
        <LineChart label="Operating balance, last 6 weeks" data={balances} index="week" series={[{ key: 'balance', label: 'Balance' }]} valueFormat={usd} area zeroBaseline={false} height={200} />
      ),
      code: `import { LineChart } from '@krackedui/motion';

${balancesCode}
${usdCode}

export function BalanceChart() {
  return (
    <LineChart label="Operating balance, last 6 weeks" data={balances} index="week" series={[{ key: 'balance', label: 'Balance' }]} valueFormat={usd} area zeroBaseline={false} height={200} />
  );
}`,
    },
  ],
  api: [
    {
      name: 'LineChart',
      description: 'Generic over the datum type.',
      props: [
        ...cartesian,
        { name: 'area', type: 'boolean', default: 'false', description: 'Fill the area under each line.' },
        { name: 'curved', type: 'boolean', default: 'false', description: 'Monotone curves (never overshoot the data).' },
        { name: 'zeroBaseline', type: 'boolean', default: 'true', description: 'Start the value axis at zero. Set `false` for series far from zero (balances, prices) so the axis hugs the data; areas then fill down to the lowest tick.' },
        ...common,
      ],
    },
  ],
  sections: [
    chartA11y,
    usage(['Continuous change over time (revenue, balance, burn-down).', 'Comparing 2–4 series over the same period.'], ['Comparing categories: use BarChart.', 'Parts of a whole: use DonutChart.', 'A trend inside a table cell: use Sparkline.']),
  ],
};

/* ================================================================== BAR */

const barChartPage: DocPage = {
  eyebrow,
  title: 'BarChart',
  description: 'Compares categories with grouped or stacked bars, vertical or horizontal. Bars grow in once; category labels thin or truncate on narrow screens.',
  install: install('BarChart', `<BarChart label="Hours by team" data={data} index="team" series={[{ key: 'hours', label: 'Hours' }]} />`),
  examples: [
    {
      title: 'Grouped: planned vs actual hours',
      align: 'start',
      render: () => (
        <BarChart label="Planned and actual hours by team" data={hours} index="team" series={[{ key: 'planned', label: 'Planned', color: 'gray' }, { key: 'actual', label: 'Actual' }]} valueFormat={(v) => `${v} h`} />
      ),
      code: `import { BarChart } from '@krackedui/motion';

${hoursCode}

export function HoursChart() {
  return (
    <BarChart label="Planned and actual hours by team" data={hours} index="team" series={[{ key: 'planned', label: 'Planned', color: 'gray' }, { key: 'actual', label: 'Actual' }]} valueFormat={(v) => \`\${v} h\`} />
  );
}`,
    },
    {
      title: 'Stacked, horizontal: tasks by status',
      description: 'Horizontal bars suit long category names; the tooltip adds a total for stacks.',
      align: 'start',
      render: () => (
        <BarChart label="Tasks by status" data={tasks} index="status" series={[{ key: 'features', label: 'Features', color: 'purple' }, { key: 'bugs', label: 'Bugs', color: 'orange' }]} stacked layout="horizontal" />
      ),
      code: `import { BarChart } from '@krackedui/motion';

${tasksCode}

export function TasksChart() {
  return (
    <BarChart label="Tasks by status" data={tasks} index="status" series={[{ key: 'features', label: 'Features', color: 'purple' }, { key: 'bugs', label: 'Bugs', color: 'orange' }]} stacked layout="horizontal" />
  );
}`,
    },
  ],
  api: [
    {
      name: 'BarChart',
      description: 'Generic over the datum type. Horizontal charts default to 32px per category.',
      props: [
        ...cartesian,
        { name: 'stacked', type: 'boolean', default: 'false', description: 'Stack series instead of grouping them.' },
        { name: 'layout', type: ['"vertical"', '"horizontal"'], default: '"vertical"', description: 'Columns or bars.' },
        ...common,
      ],
    },
  ],
  sections: [
    chartA11y,
    usage(['Comparing amounts across categories (teams, months, accounts).', 'Composition per category (stacked).'], ['Many points over time: use LineChart.', 'A single whole split into parts: use DonutChart.', 'More than ~4 series: split into several charts.']),
  ],
};

/* ================================================================== DONUT */

const donutChartPage: DocPage = {
  eyebrow,
  title: 'DonutChart',
  description: 'Parts of a whole as a ring, with content in the middle and a legend of values and shares. Slices draw in once and lift on hover.',
  install: install('DonutChart', `<DonutChart label="Spend by category" data={data} />`),
  examples: [
    {
      title: 'Spend by category',
      render: () => (
        <DonutChart
          label="October spend by category"
          data={spend}
          valueFormat={usd}
          center={
            <>
              <span className="text-n-ui-sm text-n-text-secondary">Spent</span>
              <span className="text-[18px] font-semibold leading-6">$2,360</span>
            </>
          }
        />
      ),
      code: `import { DonutChart } from '@krackedui/motion';

${spendCode}
${usdCode}

export function SpendChart() {
  return (
    <DonutChart
      label="October spend by category"
      data={spend}
      valueFormat={usd}
      center={
        <>
          <span className="text-n-ui-sm text-n-text-secondary">Spent</span>
          <span className="text-[18px] font-semibold leading-6">$2,360</span>
        </>
      }
    />
  );
}`,
    },
    {
      title: 'Small, without legend',
      render: () => (
        <DonutChart label="Sprint: 18 of 24 tasks done" data={[{ label: 'Done', value: 18, color: 'green' }, { label: 'Open', value: 6, color: 'gray' }]} size={96} legend={false} center={<span className="text-n-ui-medium">75%</span>} />
      ),
      code: `import { DonutChart } from '@krackedui/motion';

export function SprintDonut() {
  return (
    <DonutChart label="Sprint: 18 of 24 tasks done" data={[{ label: 'Done', value: 18, color: 'green' }, { label: 'Open', value: 6, color: 'gray' }]} size={96} legend={false} center={<span className="text-n-ui-medium">75%</span>} />
  );
}`,
    },
  ],
  api: [
    {
      name: 'DonutChart',
      props: [
        { name: 'data', type: '{ label: string; value: number; color?: Color }[]', description: 'Slices, clockwise from 12 o’clock.' },
        { name: 'center', type: 'ReactNode', description: 'Content in the middle, e.g. the total.' },
        { name: 'size', type: 'number', default: '176', description: 'Diameter in px (shrinks to fit).' },
        { name: 'thickness', type: 'number', default: '14% of size', description: 'Ring thickness in px.' },
        { name: 'legend', type: 'boolean', default: 'true', description: 'Legend with values and shares.' },
        ...common,
      ],
    },
  ],
  sections: [
    chartA11y,
    usage(['One whole split into 2–6 parts (spend by category, task status).'], ['Comparing parts across several wholes: use a stacked BarChart.', 'More than ~6 slices: group the small ones into "Other" or use a BarChart.', 'Precise comparison of similar values: bars read better.']),
  ],
};

/* ================================================================== SPARKLINE */

const sparklinePage: DocPage = {
  eyebrow,
  title: 'Sparkline',
  description: 'A tiny inline trend line with no axes, for stat cards and table cells. Fills its container unless you give it a width.',
  install: install('Sparkline', `<Sparkline label="Balance, last 8 weeks" data={[4, 6, 5, 8, 7, 9, 11, 12]} width={96} />`),
  examples: [
    {
      title: 'In a stat card',
      render: () => (
        <Card.Root className="w-full max-w-xs">
          <Card.Content className="flex items-end justify-between gap-4">
            <Stat label="Savings" value="$8,240" delta="+3.1%" trend="up" />
            <Sparkline label="Savings, last 12 weeks, rising" data={[6900, 7010, 7080, 7200, 7150, 7400, 7520, 7610, 7800, 7900, 8100, 8240]} tone="success" width={96} height={32} />
          </Card.Content>
        </Card.Root>
      ),
      code: `import { Card, Sparkline, Stat } from '@krackedui/motion';

export function SavingsCard() {
  return (
    <Card.Root className="w-full max-w-xs">
      <Card.Content className="flex items-end justify-between gap-4">
        <Stat label="Savings" value="$8,240" delta="+3.1%" trend="up" />
        <Sparkline label="Savings, last 12 weeks, rising" data={[6900, 7010, 7080, 7200, 7150, 7400, 7520, 7610, 7800, 7900, 8100, 8240]} tone="success" width={96} height={32} />
      </Card.Content>
    </Card.Root>
  );
}`,
    },
    {
      title: 'Tones and full width',
      render: () => (
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Sparkline label="Spending, last 10 days, falling" data={[90, 84, 88, 70, 64, 66, 52, 48, 50, 41]} tone="danger" area={false} />
          <Sparkline label="Open tasks, last 10 days" data={[12, 14, 13, 15, 15, 14, 16, 15, 15, 16]} tone="neutral" />
        </div>
      ),
      code: `import { Sparkline } from '@krackedui/motion';

export function Trends() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Sparkline label="Spending, last 10 days, falling" data={[90, 84, 88, 70, 64, 66, 52, 48, 50, 41]} tone="danger" area={false} />
      <Sparkline label="Open tasks, last 10 days" data={[12, 14, 13, 15, 15, 14, 16, 15, 15, 16]} tone="neutral" />
    </div>
  );
}`,
    },
  ],
  api: [
    {
      name: 'Sparkline',
      props: [
        { name: 'data', type: 'number[]', description: 'Values, oldest first.' },
        { name: 'tone', type: ['"neutral"', '"accent"', '"success"', '"warning"', '"danger"', '"info"'], default: '"accent"', description: 'Line color by meaning.' },
        { name: 'width', type: 'number', description: 'Width in px. Omit to fill the container.' },
        { name: 'height', type: 'number', default: '28', description: 'Height in px.' },
        { name: 'label', type: 'string', description: 'Accessible summary, e.g. "Balance, last 8 weeks, rising". Required.' },
        { name: 'area', type: 'boolean', default: 'true', description: 'Soft fill under the line.' },
        { name: 'valueFormat', type: '(value: number) => string', default: 'String', description: 'Format of the values in the hidden description.' },
        { name: 'className', type: 'string', description: 'Classes for the wrapper.' },
        { name: 'style', type: 'CSSProperties', description: 'Styles for the wrapper.' },
        { name: 'id', type: 'string', description: 'Id of the wrapper.' },
      ],
    },
  ],
  sections: [
    {
      title: 'Accessibility',
      blocks: [
        'No keyboard interaction: a sparkline is an inline image, not a tab stop (so it does not add a tab stop to every table row).',
        'ARIA and semantics:',
        {
          list: [
            '`role="img"` named by `label`; say the trend in the label ("rising", "falling").',
            'Its values are a hidden description (`aria-describedby`).',
            'Put the current number next to it (e.g. in a Stat); color only reinforces the tone.',
            'The draw-in animation is off under reduced motion.',
          ],
        },
      ],
    },
    usage(['A trend next to a number in a stat card or a table cell.'], ['People need exact values or axes: use LineChart.']),
  ],
};

export const chartsNav: NavGroup[] = [
  { title: 'Charts', items: [{ slug: 'ui/line-chart' }, { slug: 'ui/bar-chart' }, { slug: 'ui/donut-chart' }, { slug: 'ui/sparkline' }] },
];

export const chartsPages: Record<string, DocPage> = {
  'ui/line-chart': lineChartPage,
  'ui/bar-chart': barChartPage,
  'ui/donut-chart': donutChartPage,
  'ui/sparkline': sparklinePage,
};
