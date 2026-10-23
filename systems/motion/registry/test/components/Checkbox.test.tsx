import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '@system';
import { renderUI, screen } from '../utils';

describe('Checkbox', () => {
  it('toggles with click and Space (uncontrolled) and reports the new state', async () => {
    const onCheckedChange = vi.fn();
    const { user } = renderUI(<Checkbox label="Remember me" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole('checkbox', { name: 'Remember me' });
    expect(box).not.toBeChecked();
    await user.click(box);
    expect(box).toBeChecked();
    await user.keyboard(' ');
    expect(box).not.toBeChecked();
    expect(onCheckedChange.mock.calls).toEqual([[true], [false]]);
  });

  it('toggles when its label text is clicked', async () => {
    const { user } = renderUI(<Checkbox label="Subscribe" defaultChecked />);
    await user.click(screen.getByText('Subscribe'));
    expect(screen.getByRole('checkbox', { name: 'Subscribe' })).not.toBeChecked();
  });

  it('is controlled with checked + onCheckedChange', async () => {
    function Controlled() {
      const [on, setOn] = useState(false);
      return <Checkbox label="Done" checked={on} onCheckedChange={setOn} />;
    }
    const { user } = renderUI(<Controlled />);
    await user.click(screen.getByRole('checkbox', { name: 'Done' }));
    expect(screen.getByRole('checkbox', { name: 'Done' })).toBeChecked();
  });

  it('shows the indeterminate state as mixed', () => {
    renderUI(<Checkbox label="Select all" checked="indeterminate" />);
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toBePartiallyChecked();
  });

  it('exposes invalid, required, disabled and name', async () => {
    const onCheckedChange = vi.fn();
    const { user } = renderUI(<Checkbox label="Terms" invalid required disabled name="terms" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole('checkbox', { name: 'Terms' });
    expect(box).toBeInvalid();
    expect(box).toBeRequired();
    expect(box).toBeDisabled();
    expect(box).toHaveAttribute('name', 'terms');
    await user.click(box);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
