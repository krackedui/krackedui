import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from '@system';
import { renderUI, screen } from '../utils';

describe('Switch', () => {
  it('is a switch that toggles with click, Space and Enter', async () => {
    const onCheckedChange = vi.fn();
    const { user } = renderUI(<Switch label="Dark mode" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole('switch', { name: 'Dark mode' });
    expect(sw).not.toBeChecked();
    await user.click(sw);
    expect(sw).toBeChecked();
    await user.keyboard(' ');
    expect(sw).not.toBeChecked();
    await user.keyboard('{Enter}');
    expect(sw).toBeChecked();
    expect(onCheckedChange.mock.calls).toEqual([[true], [false], [true]]);
  });

  it('toggles from its label text', async () => {
    const { user } = renderUI(<Switch label="Notifications" defaultChecked />);
    await user.click(screen.getByText('Notifications'));
    expect(screen.getByRole('switch', { name: 'Notifications' })).not.toBeChecked();
  });

  it('is controlled with checked + onCheckedChange', async () => {
    function Controlled() {
      const [on, setOn] = useState(true);
      return <Switch label="Sync" checked={on} onCheckedChange={setOn} size="sm" />;
    }
    const { user } = renderUI(<Controlled />);
    await user.click(screen.getByRole('switch', { name: 'Sync' }));
    expect(screen.getByRole('switch', { name: 'Sync' })).not.toBeChecked();
  });

  it('exposes invalid and disabled, and ignores input when disabled', async () => {
    const onCheckedChange = vi.fn();
    const { user } = renderUI(<Switch label="Beta" invalid disabled required name="beta" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole('switch', { name: 'Beta' });
    expect(sw).toHaveAttribute('aria-invalid', 'true');
    expect(sw).toBeDisabled();
    await user.click(sw);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
