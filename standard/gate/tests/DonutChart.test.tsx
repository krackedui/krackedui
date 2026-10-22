import { describe, expect, it } from 'vitest';
import { DonutChart } from '@system';
import { renderUI, screen } from './utils';
import { expectAccessibleChart } from './chartTestUtils';

const data = [
  { label: 'Housing', value: 1500 },
  { label: 'Food', value: 500, color: 'green' as const },
];
const usd = (v: number) => `$${v.toLocaleString('en-US')}`;

describe('DonutChart', () => {
  it('named image, hidden table with value and share, and center content', () => {
    renderUI(<DonutChart label="Spend by category" data={data} valueFormat={usd} center={<span>$2,000 total</span>} />);
    expectAccessibleChart('Spend by category', ['Category', 'Value', 'Share'], ['Housing', '$1,500', '75%']);
    expect(screen.getByText('$2,000 total')).toBeInTheDocument();
  });

  it('arrow keys read each slice', async () => {
    const { user } = renderUI(<DonutChart label="Spend" data={data} valueFormat={usd} />);
    await user.tab();
    expect(screen.getByRole('img', { name: 'Spend' })).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent('Food: $500, 25%');
  });
});
