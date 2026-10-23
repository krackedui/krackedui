import { describe, expect, it, vi } from 'vitest';
import { DateRangePicker } from '@system';
import { renderUI, screen } from '../utils';

const day = (re: RegExp) => screen.getByRole('button', { name: re });

describe('DateRangePicker', () => {
  it('opens a dialog and picks a start then an end day', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(
      <DateRangePicker aria-label="Period" defaultValue={{ from: new Date(2026, 9, 1), to: new Date(2026, 9, 3) }} onValueChange={onValueChange} />,
    );
    const trigger = screen.getByRole('button', { name: /Period/ });
    expect(trigger).toHaveTextContent('Oct 1, 2026 – Oct 3, 2026');
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(day(/October 10, 2026/));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(day(/October 14, 2026/));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 10), to: new Date(2026, 9, 14) });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent('Oct 10, 2026 – Oct 14, 2026');
    expect(trigger).toHaveFocus();
  });

  it('orders the ends when the end is before the start, and works from the keyboard', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<DateRangePicker aria-label="Period" defaultValue={{ from: new Date(2026, 9, 15), to: null }} onValueChange={onValueChange} />);
    screen.getByRole('button', { name: /Period/ }).focus();
    await user.keyboard('{Enter}');
    expect(day(/October 15, 2026/)).toHaveFocus();
    await user.keyboard('{ArrowLeft}{ArrowLeft}{Enter}'); // start already set: this picks the end
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 13), to: new Date(2026, 9, 15) });
  });

  it('shows presets and applies one', async () => {
    const onValueChange = vi.fn();
    const presets = [
      { label: 'First week', range: { from: new Date(2026, 9, 1), to: new Date(2026, 9, 7) } },
      { label: 'Second week', range: { from: new Date(2026, 9, 8), to: new Date(2026, 9, 14) } },
    ];
    const { user } = renderUI(<DateRangePicker aria-label="Period" presets={presets} defaultValue={presets[0].range} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: /Period/ }));
    expect(screen.getByRole('button', { name: 'First week' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Second week' }));
    expect(onValueChange).toHaveBeenLastCalledWith(presets[1].range);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape, clears, and respects min', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(
      <DateRangePicker aria-label="Period" min={new Date(2026, 9, 5)} defaultValue={{ from: new Date(2026, 9, 10), to: new Date(2026, 9, 12) }} onValueChange={onValueChange} />,
    );
    const trigger = screen.getByRole('button', { name: /Period/ });
    await user.click(trigger);
    expect(day(/October 4, 2026/)).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Clear dates' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: null, to: null });
  });
});
