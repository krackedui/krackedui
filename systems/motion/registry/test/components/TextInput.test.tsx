import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TextInput } from '@system';
import { renderUI, screen } from '../utils';

describe('TextInput', () => {
  it('is a textbox that types (uncontrolled) and reports changes', async () => {
    const onChange = vi.fn();
    const { user } = renderUI(<TextInput aria-label="Name" defaultValue="Ad" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    await user.type(input, 'a');
    expect(input).toHaveValue('Ada');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('is controlled with value + onChange', async () => {
    function Controlled() {
      const [v, setV] = useState('');
      return <><TextInput aria-label="Email" type="email" value={v} onChange={(e) => setV(e.target.value.toUpperCase())} /><output>{v}</output></>;
    }
    const { user } = renderUI(<Controlled />);
    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'ab');
    expect(screen.getByRole('status')).toHaveTextContent('AB');
  });

  it('exposes invalid, required, disabled and name', () => {
    renderUI(<form aria-label="f"><TextInput aria-label="Email" invalid required disabled name="email" placeholder="you@example.com" /></form>);
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toBeInvalid();
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
  });

  it('keeps its accessible name clean when it has an icon and trailing content', () => {
    renderUI(<TextInput aria-label="Amount" icon="currency" trailing="USD" />);
    expect(screen.getByRole('textbox', { name: 'Amount' })).toBeInTheDocument();
  });
});
