import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { Field, Select } from '@system';
import { renderUI, screen } from '../utils';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
];

describe('Select', () => {
  it('shows the placeholder and opens a listbox from the keyboard', async () => {
    const { user } = renderUI(<Field label="Fruit"><Select options={fruits} placeholder="Choose a fruit" /></Field>);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    expect(trigger).toHaveTextContent('Choose a fruit');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('option')).toHaveLength(4);
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('selects with arrows + Enter, calls onValueChange and returns focus', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<Select aria-label="Fruit" options={fruits} onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent('Banana');
    expect(trigger).toHaveFocus();
  });

  it('closes on Escape without changing the value', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<Select aria-label="Fruit" defaultValue="apple" options={fruits} onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger).toHaveTextContent('Apple');
    expect(trigger).toHaveFocus();
  });

  it('is controlled by value', async () => {
    function Demo() {
      const [v, setV] = useState('date');
      return (
        <>
          <Select aria-label="Fruit" value={v} onValueChange={setV} options={fruits} />
          <output>{v}</output>
          <button type="button" onClick={() => setV('apple')}>Reset</button>
        </>
      );
    }
    const { user } = renderUI(<Demo />);
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveTextContent('Date');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveTextContent('Apple');
  });

  it('can be disabled and marked invalid', () => {
    renderUI(
      <>
        <Select aria-label="A" disabled options={fruits} />
        <Select aria-label="B" invalid options={fruits} />
      </>,
    );
    expect(screen.getByRole('combobox', { name: 'A' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'B' })).toHaveAttribute('aria-invalid', 'true');
  });
});
