import { describe, expect, it, vi } from 'vitest';
import { Steps } from '@system';
import { renderUI, screen } from '../../../../standard/gate/tests/utils';

const steps = [{ label: 'Payee' }, { label: 'Details', description: 'Amount, account, date' }, { label: 'Review' }];

describe('Steps', () => {
  it('is a labelled list with the current step marked and every state spelled out', () => {
    renderUI(<Steps steps={steps} current={1} label="Payment steps" />);
    const nav = screen.getByRole('navigation', { name: 'Payment steps' });
    const items = nav.querySelectorAll('li');
    expect(items).toHaveLength(3);
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0]).not.toHaveAttribute('aria-current');
    expect(items[0]).toHaveTextContent('Payee, step 1 of 3, completed');
    expect(items[1]).toHaveTextContent('Details, step 2 of 3, current step');
    expect(items[2]).toHaveTextContent('Review, step 3 of 3, not started');
  });

  it('has no buttons unless onStepChange is given; then completed steps jump back', () => {
    const { rerender } = renderUI(<Steps steps={steps} current={2} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    const onStepChange = vi.fn();
    rerender(<Steps steps={steps} current={2} onStepChange={onStepChange} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2); // the two completed steps, not the current one
    buttons[0]?.click();
    expect(onStepChange).toHaveBeenCalledWith(0);
  });

  it('marks every step complete when current is past the end', () => {
    renderUI(<Steps steps={steps} current={3} />);
    expect(screen.getByRole('navigation', { name: 'Progress' })).not.toHaveTextContent('current step');
  });
});
