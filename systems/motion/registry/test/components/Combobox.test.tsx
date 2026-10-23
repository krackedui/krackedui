import { describe, expect, it, vi } from 'vitest';
import { Combobox, Field } from '@system';
import { renderUI, screen } from '../utils';

const countries = [
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'gh', label: 'Ghana' },
  { value: 'gr', label: 'Greece' },
  { value: 'rw', label: 'Rwanda', disabled: true },
];

async function open(label = 'Country') {
  const r = renderUI(<Field label={label}><Combobox options={countries} placeholder="Choose a country" searchPlaceholder="Search countries" emptyText="No country found" /></Field>);
  const trigger = screen.getByRole('button', { name: label });
  await r.user.click(trigger);
  return { ...r, trigger };
}

describe('Combobox', () => {
  it('opens a search box with focus and a listbox of options', async () => {
    const { trigger } = await open();
    const input = screen.getByRole('combobox', { name: 'Search countries' });
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', screen.getByRole('listbox').id);
    expect(screen.getAllByRole('option')).toHaveLength(5);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('filters as you type and shows the empty text', async () => {
    const { user } = await open();
    await user.keyboard('gr');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Greece']);
    await user.keyboard('zz');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(screen.getByText('No country found')).toBeInTheDocument();
  });

  it('moves the active option with arrows (aria-activedescendant) and selects with Enter', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<Combobox aria-label="Country" options={countries} onValueChange={onValueChange} searchPlaceholder="Search countries" />);
    const trigger = screen.getByRole('button', { name: 'Country' });
    await user.click(trigger);
    const input = screen.getByRole('combobox', { name: 'Search countries' });
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'France' }).id);
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Ghana' }).id);
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('gh');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent('Ghana');
    expect(trigger).toHaveFocus();
  });

  it('skips disabled options and marks the selected one', async () => {
    const { user } = renderUI(<Combobox aria-label="Country" defaultValue="gr" options={countries} searchPlaceholder="Search" />);
    await user.click(screen.getByRole('button', { name: 'Country' }));
    expect(screen.getByRole('option', { name: 'Greece' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Rwanda' })).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{ArrowDown}');
    // Greece → (Rwanda disabled) → wraps to France
    expect(screen.getByRole('combobox', { name: 'Search' }).getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'France' }).id);
  });

  it('closes on Escape, keeps the value and returns focus to the trigger', async () => {
    const { user, trigger } = await open();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveTextContent('Choose a country');
  });

  it('selects with the pointer', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<Combobox aria-label="Country" options={countries} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: 'Country' }));
    await user.click(screen.getByRole('option', { name: 'Germany' }));
    expect(onValueChange).toHaveBeenCalledWith('de');
  });
});
