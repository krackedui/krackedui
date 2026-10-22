import { describe, expect, it } from 'vitest';
import { Stat } from '@system';
import { renderUI, screen } from './utils';

describe('Stat', () => {
  it('shows label, value, delta and description', () => {
    renderUI(<Stat data-testid="stat" label="Revenue" value="$48,200" delta="+4.2%" trend="up" description="vs last month" icon="currency" />);
    const stat = screen.getByTestId('stat');
    expect(stat).toHaveTextContent('Revenue');
    expect(stat).toHaveTextContent('$48,200');
    expect(stat).toHaveTextContent('+4.2%');
    expect(stat).toHaveTextContent('vs last month');
  });

  it('announces the trend direction in words, not only with an arrow or color', () => {
    renderUI(<Stat data-testid="up" label="Costs" value="$9,100" delta="+8%" trend="up" upIsGood={false} />);
    expect(screen.getByTestId('up')).toHaveTextContent(/up/i);
    renderUI(<Stat data-testid="down" label="Churn" value="2.1%" delta="-0.4 pts" trend="down" />);
    expect(screen.getByTestId('down')).toHaveTextContent(/down/i);
  });

  it('renders without optional parts', () => {
    renderUI(<Stat data-testid="plain" label="Open tasks" value={12} />);
    expect(screen.getByTestId('plain')).toHaveTextContent('Open tasks12');
  });
});
