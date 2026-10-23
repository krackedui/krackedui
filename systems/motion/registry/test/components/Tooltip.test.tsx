import { describe, expect, it } from 'vitest';
import { Button, Tooltip } from '@system';
import { renderUI, screen, waitFor } from '../utils';

describe('Tooltip', () => {
  it('shows on keyboard focus, describes the trigger, hides on Escape', async () => {
    const { user } = renderUI(<Tooltip content="Share this page" side="top" delayDuration={0}><Button>Share</Button></Tooltip>);
    await user.tab();
    const trigger = screen.getByRole('button', { name: 'Share' });
    expect(trigger).toHaveFocus();
    const tip = await screen.findByRole('tooltip');
    expect(tip).toHaveTextContent('Share this page');
    expect(trigger).toHaveAccessibleDescription('Share this page');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('shows on hover', async () => {
    const { user } = renderUI(<Tooltip content="Settings" delayDuration={0}><Button>Gear</Button></Tooltip>);
    await user.hover(screen.getByRole('button', { name: 'Gear' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Settings');
  });
});
