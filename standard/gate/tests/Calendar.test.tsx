import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { Calendar } from '@system';
import { renderUI, screen } from './utils';

const day = (re: RegExp | string) => screen.getByRole('button', { name: re });

describe('Calendar', () => {
  it('renders a labelled month grid with the selected day', () => {
    renderUI(<Calendar defaultValue={new Date(2026, 9, 21)} />);
    const grid = screen.getByRole('grid', { name: 'October 2026' });
    expect(grid).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
    const selected = day(/October 21, 2026/);
    expect(selected.closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true');
    expect(selected).toHaveAttribute('tabindex', '0');
  });

  it('marks today with aria-current', () => {
    renderUI(<Calendar today={new Date(2026, 9, 5)} defaultMonth={new Date(2026, 9, 1)} />);
    expect(day(/October 5, 2026/)).toHaveAttribute('aria-current', 'date');
  });

  it('moves focus with arrows, Home/End and PageUp/PageDown', async () => {
    const { user } = renderUI(<Calendar defaultValue={new Date(2026, 9, 21)} />);
    day(/October 21, 2026/).focus();
    await user.keyboard('{ArrowRight}');
    expect(day(/October 22, 2026/)).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(day(/October 29, 2026/)).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(day(/October 28, 2026/)).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(day(/October 21, 2026/)).toHaveFocus();
    await user.keyboard('{Home}');
    expect(day(/October 18, 2026/)).toHaveFocus(); // Sunday
    await user.keyboard('{End}');
    expect(day(/October 24, 2026/)).toHaveFocus(); // Saturday
    await user.keyboard('{PageDown}');
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    expect(day(/November 24, 2026/)).toHaveFocus();
    await user.keyboard('{PageUp}{PageUp}');
    expect(day(/September 24, 2026/)).toHaveFocus();
  });

  it('selects with Enter and click; controlled + uncontrolled', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<Calendar defaultValue={new Date(2026, 9, 21)} onValueChange={onValueChange} />);
    day(/October 21, 2026/).focus();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 22));
    expect(day(/October 22, 2026/).closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true');
    await user.click(day(/October 2, 2026/));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 2));

    function Controlled() {
      const [v, setV] = useState<Date | null>(new Date(2026, 0, 10));
      return <><Calendar aria-label="Controlled" value={v} onValueChange={setV} /><button type="button" onClick={() => setV(new Date(2026, 2, 3))}>Jump</button></>;
    }
    renderUI(<Controlled />);
    await user.click(screen.getByRole('button', { name: 'Jump' }));
    expect(screen.getByRole('grid', { name: 'March 2026' })).toBeInTheDocument();
  });

  it('changes month with the previous / next buttons', async () => {
    const { user } = renderUI(<Calendar defaultValue={new Date(2026, 9, 21)} />);
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByRole('grid', { name: 'September 2026' })).toBeInTheDocument();
  });

  it('does not select days outside min / max and keeps focus inside the range', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(
      <Calendar defaultValue={new Date(2026, 9, 10)} min={new Date(2026, 9, 5)} max={new Date(2026, 9, 25)} onValueChange={onValueChange} />,
    );
    expect(day(/October 4, 2026/)).toHaveAttribute('aria-disabled', 'true');
    await user.click(day(/October 4, 2026/));
    expect(onValueChange).not.toHaveBeenCalled();
    day(/October 10, 2026/).focus();
    await user.keyboard('{ArrowUp}');
    expect(day(/October 5, 2026/)).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
  });
});
