import { describe, expect, it } from 'vitest';
import { LineChart } from '@system';
import { renderUI } from '../utils';
import { expectAccessibleChart, readWithKeyboard } from './chartTestUtils';

const data = [
  { month: 'Jan', revenue: 1200, costs: 800 },
  { month: 'Feb', revenue: 1800, costs: 950 },
  { month: 'Mar', revenue: 1500, costs: 1100 },
];
const series = [{ key: 'revenue', label: 'Revenue' }, { key: 'costs', label: 'Costs', color: 'red' as const }];
const usd = (v: number) => `$${v.toLocaleString('en-US')}`;

describe('LineChart', () => {
  it('is a named image with a hidden data table of the same values', () => {
    renderUI(<LineChart label="Revenue and costs" data={data} index="month" series={series} valueFormat={usd} area curved />);
    expectAccessibleChart('Revenue and costs', ['Month', 'Revenue', 'Costs'], ['Jan', '$1,200', '$800']);
  });

  it('is focusable and the arrow keys read each point aloud', async () => {
    const { user } = renderUI(<LineChart label="Revenue" data={data} index="month" series={series} valueFormat={usd} />);
    expect(await readWithKeyboard(user, 'Revenue', '{ArrowRight}')).toMatch(/Jan.*Revenue \$1,200.*Costs \$800/);
    await user.keyboard('{ArrowRight}');
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent(/Feb.*Revenue \$1,800/);
  });

  it('supports Home / End / Escape', async () => {
    const { user } = renderUI(
      <><button type="button">before</button><LineChart label="Revenue" data={data} index="month" series={series} valueFormat={usd} /></>,
    );
    await user.tab();
    await user.tab();
    await user.keyboard('{End}');
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent(/^Mar/);
    await user.keyboard('{Home}');
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent(/^Jan/);
    await user.keyboard('{ArrowRight}');
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent(/^Feb/);
    await user.keyboard('{Escape}');
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent('');
  });
});
