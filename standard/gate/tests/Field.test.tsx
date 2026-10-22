import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { Field, NumberInput, Select, TextInput } from '@system';
import { renderUI, screen } from './utils';

describe('Field', () => {
  it('labels the control and describes it with the description', () => {
    renderUI(
      <Field label="Email" description="We never share it.">
        <TextInput />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAccessibleDescription('We never share it.');
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('marks the control invalid and adds the error to its description', () => {
    renderUI(
      <Field label="Email" description="Work address." error="Enter a valid email.">
        <TextInput defaultValue="ada@" />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Work address\..*Enter a valid email\./);
    expect(screen.getByText('Enter a valid email.')).toBeVisible();
  });

  it('announces the error politely when it appears', async () => {
    function Demo() {
      const [error, setError] = useState<string | undefined>();
      return (
        <>
          <Field label="Name" error={error}><TextInput /></Field>
          <button type="button" onClick={() => setError('Name is required.')}>Validate</button>
        </>
      );
    }
    const { user } = renderUI(<Demo />);
    await user.click(screen.getByRole('button', { name: 'Validate' }));
    const message = screen.getByText('Name is required.');
    expect(message.closest('[aria-live]')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAccessibleDescription('Name is required.');
  });

  it('sets aria-required when required', () => {
    renderUI(<Field label="Company" required><TextInput /></Field>);
    const input = screen.getByRole('textbox', { name: /Company/ });
    expect(input.getAttribute('aria-required') === 'true' || input.hasAttribute('required')).toBe(true);
  });

  it('keeps the label as the accessible name when visually hidden', () => {
    renderUI(<Field label="Search" hideLabel><TextInput /></Field>);
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
  });

  it('wires any plain element by cloning the props in', () => {
    renderUI(
      <Field label="Notes" description="Optional." error="Too long.">
        <input type="text" />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: 'Notes' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Optional\..*Too long\./);
  });

  it('wires composite controls (select trigger, number input)', () => {
    renderUI(
      <>
        <Field label="Country" error="Pick a country."><Select options={[{ value: 'fr', label: 'France' }]} /></Field>
        <Field label="Amount" description="In euros."><NumberInput /></Field>
      </>,
    );
    const select = screen.getByRole('combobox', { name: 'Country' });
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Pick a country.');
    expect(screen.getByRole('spinbutton', { name: 'Amount' })).toHaveAccessibleDescription('In euros.');
  });
});
