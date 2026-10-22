import { describe, expect, it } from 'vitest';
import { Card } from '@system';
import { renderUI, screen } from './utils';

describe('Card', () => {
  it('renders all parts with their content', () => {
    renderUI(
      <Card.Root data-testid="card">
        <Card.Header>
          <Card.Title>Monthly budget</Card.Title>
          <Card.Description>October 2026</Card.Description>
        </Card.Header>
        <Card.Content>Spent $1,240 of $2,000</Card.Content>
        <Card.Footer>Updated today</Card.Footer>
      </Card.Root>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveTextContent('Monthly budget');
    expect(card).toHaveTextContent('October 2026');
    expect(card).toHaveTextContent('Spent $1,240 of $2,000');
    expect(card).toHaveTextContent('Updated today');
  });

  it('renders as its child with asChild, so an interactive card is a single focusable link', async () => {
    const { user } = renderUI(
      <Card.Root interactive asChild>
        <a href="#report">
          <Card.Header><Card.Title>Q3 report</Card.Title></Card.Header>
        </a>
      </Card.Root>,
    );
    const link = screen.getByRole('link', { name: 'Q3 report' });
    await user.tab();
    expect(link).toHaveFocus();
    expect(link.querySelector('a, button')).toBeNull();
  });

  it('Title can render a heading element with asChild', () => {
    renderUI(<Card.Root><Card.Header><Card.Title asChild><h2>Revenue</h2></Card.Title></Card.Header></Card.Root>);
    expect(screen.getByRole('heading', { level: 2, name: 'Revenue' })).toBeInTheDocument();
  });
});
