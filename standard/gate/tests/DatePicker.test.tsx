import { describe, expect, it, vi } from 'vitest';
import { DatePicker, Field } from '@system';
import { renderUI, screen } from './utils';

describe('DatePicker', () => {
  it('is a labelled field showing the placeholder, opening a calendar dialog', async () => {
    const { user } = renderUI(<Field label="Due date"><DatePicker placeholder="Pick a date" /></Field>);
    const trigger = screen.getByRole('button', { name: /Due date/ });
    expect(trigger).toHaveTextContent('Pick a date');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // focus moves into the grid
    expect(document.activeElement?.closest('[role="grid"]')).not.toBeNull();
  });

  it('selects a day with the keyboard, closes, shows the date and returns focus', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<DatePicker aria-label="Start" defaultValue={new Date(2026, 9, 21)} onValueChange={onValueChange} />);
    const trigger = screen.getByRole('button', { name: /Start/ });
    expect(trigger).toHaveTextContent('Oct 21, 2026');
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: /October 21, 2026/ })).toHaveFocus();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 22));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent('Oct 22, 2026');
    expect(trigger).toHaveFocus();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const { user } = renderUI(<DatePicker aria-label="Start" />);
    const trigger = screen.getByRole('button', { name: /Start/ });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('clears the value', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<DatePicker aria-label="Start" defaultValue={new Date(2026, 9, 21)} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole('button', { name: /Start/ })).toHaveTextContent('Pick a date');
  });

  it('respects min / max, disabled and invalid', async () => {
    const { user } = renderUI(
      <>
        <DatePicker aria-label="Ranged" defaultValue={new Date(2026, 9, 10)} min={new Date(2026, 9, 5)} />
        <DatePicker aria-label="Off" disabled />
        <Field label="Bad" error="Pick a date."><DatePicker /></Field>
      </>,
    );
    expect(screen.getByRole('button', { name: /Off/ })).toBeDisabled();
    // Buttons can't carry aria-invalid; the error reaches the trigger through its description.
    expect(screen.getByRole('button', { name: /Bad/ })).toHaveAccessibleDescription('Pick a date.');
    await user.click(screen.getByRole('button', { name: /Ranged/ }));
    expect(screen.getByRole('button', { name: /October 4, 2026/ })).toHaveAttribute('aria-disabled', 'true');
  });
});
