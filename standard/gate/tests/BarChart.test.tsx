import { describe, expect, it } from 'vitest';
import { BarChart } from '@system';
import { renderUI, screen } from './utils';
import { expectAccessibleChart } from './chartTestUtils';

const data = [
  { team: 'Design', planned: 40, actual: 32 },
  { team: 'Engineering', planned: 120, actual: 134 },
  { team: 'Marketing', planned: 60, actual: 41 },
];
const series = [{ key: 'planned', label: 'Planned' }, { key: 'actual', label: 'Actual' }];

describe('BarChart', () => {
  it('grouped vertical: named image + hidden data table', () => {
    renderUI(<BarChart label="Hours by team" data={data} index="team" series={series} />);
    expectAccessibleChart('Hours by team', ['Team', 'Planned', 'Actual'], ['Design', '40', '32']);
  });

  it('stacked horizontal: keyboard readout includes each series and the total', async () => {
    const { user } = renderUI(<BarChart label="Hours" data={data} index="team" series={series} stacked layout="horizontal" valueFormat={(v) => `${v} h`} />);
    await user.tab();
    expect(screen.getByRole('img', { name: 'Hours' })).toHaveFocus();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent('Engineering: Planned 120 h, Actual 134 h, Total 254 h');
    await user.keyboard('{ArrowUp}');
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent(/^Design/);
  });
});
