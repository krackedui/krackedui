import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DateMenu, formatDisplayDate } from '@system';
import { renderUI, screen } from './utils';

const TODAY = new Date(2026, 9, 21);

function Controlled({ onChange }: { onChange?: (d: Date | null) => void }) {
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 12));
  return <DateMenu value={date} onChange={(d) => { setDate(d); onChange?.(d); }} today={TODAY} />;
}

describe('DateMenu', () => {
  it('shows the value in the date field and marks the selected day', () => {
    renderUI(<Controlled />);
    expect(screen.getByRole('textbox', { name: 'Date' })).toHaveValue('Oct 12, 2026');
    expect(screen.getByRole('group', { name: 'Oct 2026' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new Date(2026, 9, 12).toDateString() })).toHaveAttribute('aria-pressed', 'true');
  });

  it('picks a day on click and commits a typed date on Enter', async () => {
    const onChange = vi.fn();
    const { user } = renderUI(<Controlled onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: new Date(2026, 9, 20).toDateString() }));
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 9, 20));
    expect(screen.getByRole('textbox', { name: 'Date' })).toHaveValue('Oct 20, 2026');
    const field = screen.getByRole('textbox', { name: 'Date' });
    await user.clear(field);
    await user.type(field, 'Dec 3, 2026{Enter}');
    expect(formatDisplayDate(onChange.mock.lastCall?.[0] as Date)).toBe('Dec 3, 2026');
    expect(screen.getByRole('group', { name: 'Dec 2026' })).toBeInTheDocument();
  });

  it('moves between months and back to today', async () => {
    const { user } = renderUI(<Controlled />);
    await user.click(screen.getByRole('button', { name: 'Go to next month' }));
    expect(screen.getByRole('group', { name: 'Nov 2026' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Go to previous month' }));
    await user.click(screen.getByRole('button', { name: 'Go to previous month' }));
    expect(screen.getByRole('group', { name: 'Sep 2026' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Today' }));
    expect(screen.getByRole('group', { name: 'Oct 2026' })).toBeInTheDocument();
  });

  it('toggles End date / Include time from the keyboard and clears the date', async () => {
    const onEnd = vi.fn();
    const onTime = vi.fn();
    const onChange = vi.fn();
    const { user } = renderUI(<DateMenu value={new Date(2026, 9, 12)} onChange={onChange} today={TODAY} onEndDateChange={onEnd} onIncludeTimeChange={onTime} />);
    expect(screen.getByRole('listbox', { name: 'Date options' })).toBeInTheDocument();
    const end = screen.getByRole('option', { name: 'End date' });
    expect(end).toHaveAttribute('aria-checked', 'false');
    end.focus();
    await user.keyboard('{Enter}');
    expect(end).toHaveAttribute('aria-checked', 'true');
    expect(onEnd).toHaveBeenCalledWith(true);
    await user.tab();
    const time = screen.getByRole('option', { name: 'Include time' });
    expect(time).toHaveFocus(); // Date format is not a Tab stop without its handler
    await user.keyboard(' ');
    expect(onTime).toHaveBeenCalledWith(true);
    await user.tab();
    expect(screen.getByRole('option', { name: 'Clear' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('makes Date format, Remind and Learn actionable when their handlers are given', async () => {
    const onDateFormatClick = vi.fn();
    const onRemindClick = vi.fn();
    const onLearnClick = vi.fn();
    const { user } = renderUI(<DateMenu today={TODAY} dateFormatLabel="Relative" remindLabel="1 day before" onDateFormatClick={onDateFormatClick} onRemindClick={onRemindClick} onLearnClick={onLearnClick} />);
    const format = screen.getByRole('option', { name: /Date format/ });
    expect(format).toHaveTextContent('Relative');
    expect(format).toHaveAttribute('tabindex', '0');
    format.focus();
    await user.keyboard('{Enter}');
    expect(onDateFormatClick).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('option', { name: /Remind/ }));
    expect(onRemindClick).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('option', { name: 'Learn about reminders' }));
    expect(onLearnClick).toHaveBeenCalledTimes(1);
  });

  it('hides the option rows with showOptions={false}', () => {
    renderUI(<DateMenu today={TODAY} showOptions={false} />);
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.queryByRole('option')).toBeNull();
  });
});
