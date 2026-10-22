import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { NumberInput } from '@system';
import { renderUI, screen } from './utils';

describe('NumberInput', () => {
  it('is a spinbutton with value, min and max', () => {
    renderUI(<NumberInput aria-label="Quantity" defaultValue={3} min={1} max={10} />);
    const input = screen.getByRole('spinbutton', { name: 'Quantity' });
    expect(input).toHaveAttribute('aria-valuenow', '3');
    expect(input).toHaveAttribute('aria-valuemin', '1');
    expect(input).toHaveAttribute('aria-valuemax', '10');
    expect(input).toHaveValue('3');
  });

  it('steps with ArrowUp / ArrowDown and clamps to min / max', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<NumberInput aria-label="Quantity" defaultValue={9} min={1} max={10} step={1} onValueChange={onValueChange} />);
    const input = screen.getByRole('spinbutton', { name: 'Quantity' });
    await user.click(input);
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith(10);
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-valuenow', '10');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(onValueChange).toHaveBeenLastCalledWith(8);
    await user.keyboard('{Home}');
    expect(onValueChange).toHaveBeenLastCalledWith(1);
  });

  it('parses typed text on blur and clamps it', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<NumberInput aria-label="Age" max={120} onValueChange={onValueChange} />);
    const input = screen.getByRole('spinbutton', { name: 'Age' });
    await user.type(input, '150');
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(120);
    expect(input).toHaveAttribute('aria-valuenow', '120');
  });

  it('formats with Intl options when not focused and edits the raw number', async () => {
    const { user } = renderUI(
      <NumberInput aria-label="Amount" locale="en-US" defaultValue={1234.5} format={{ style: 'currency', currency: 'USD' }} />,
    );
    const input = screen.getByRole('spinbutton', { name: 'Amount' });
    expect(input).toHaveValue('$1,234.50');
    expect(input).toHaveAttribute('aria-valuetext', '$1,234.50');
    await user.click(input);
    expect(input).toHaveValue('1234.5');
    await user.clear(input);
    await user.type(input, '$2,000.25');
    await user.tab();
    expect(input).toHaveValue('$2,000.25');
    expect(input).toHaveAttribute('aria-valuenow', '2000.25');
  });

  it('parses localized input (de-DE)', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<NumberInput aria-label="Betrag" locale="de-DE" onValueChange={onValueChange} />);
    await user.type(screen.getByRole('spinbutton', { name: 'Betrag' }), '1.234,5');
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(1234.5);
  });

  it('clears to null and supports controlled use', async () => {
    function Demo() {
      const [v, setV] = useState<number | null>(5);
      return (
        <>
          <NumberInput aria-label="Seats" value={v} onValueChange={setV} />
          <output data-testid="out">{v === null ? 'empty' : v}</output>
        </>
      );
    }
    const { user } = renderUI(<Demo />);
    const input = screen.getByRole('spinbutton', { name: 'Seats' });
    await user.clear(input);
    await user.tab();
    expect(screen.getByTestId('out')).toHaveTextContent('empty');
    await user.click(input);
    await user.keyboard('{ArrowUp}');
    expect(screen.getByTestId('out')).toHaveTextContent('0');
  });

  it('can be disabled and invalid', () => {
    renderUI(<NumberInput aria-label="X" disabled invalid />);
    const input = screen.getByRole('spinbutton', { name: 'X' });
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
