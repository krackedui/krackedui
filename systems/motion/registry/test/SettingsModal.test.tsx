import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { SettingsModal, SettingsNav, SettingsNavGroup, SettingsNavItem, SettingsPage, SettingsRow, SettingsSection, SettingsSwitch } from '@system';
import { renderUI, screen, waitFor } from '../../../../standard/gate/tests/utils';

function Demo() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('prefs');
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Settings</button>
      <SettingsModal
        open={open}
        onOpenChange={setOpen}
        nav={
          <SettingsNav>
            <SettingsNavGroup label="Account">
              <SettingsNavItem selected={tab === 'prefs'} onClick={() => setTab('prefs')}>Preferences</SettingsNavItem>
              <SettingsNavItem selected={tab === 'notifs'} onClick={() => setTab('notifs')}>Notifications</SettingsNavItem>
            </SettingsNavGroup>
          </SettingsNav>
        }
      >
        <SettingsPage title="Preferences">
          <SettingsSection title="Input">
            <SettingsRow label="Use Enter to add a new line" description="Press Cmd+Enter to send" control={<SettingsSwitch />} />
          </SettingsSection>
        </SettingsPage>
      </SettingsModal>
    </>
  );
}

describe('SettingsModal', () => {
  it('opens a named dialog; row controls are named by their row', async () => {
    const { user } = renderUI(<Demo />);
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByRole('dialog', { name: 'Settings & members' })).toBeInTheDocument();
    const sw = screen.getByRole('switch', { name: 'Use Enter to add a new line' });
    expect(sw).toHaveAccessibleDescription('Press Cmd+Enter to send');
    await user.click(sw);
    expect(sw).toBeChecked();
    expect(screen.getByRole('searchbox', { name: 'Search settings' })).toBeInTheDocument();
  });

  it('nav tabs: arrow keys move focus, click selects', async () => {
    const { user } = renderUI(<Demo />);
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    const prefs = await screen.findByRole('tab', { name: 'Preferences' });
    expect(prefs).toHaveAttribute('aria-selected', 'true');
    prefs.focus();
    await user.keyboard('{ArrowDown}');
    const notifs = screen.getByRole('tab', { name: 'Notifications' });
    expect(notifs).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(notifs).toHaveAttribute('aria-selected', 'true');
  });

  it('Escape closes and returns focus to the opener', async () => {
    const { user } = renderUI(<Demo />);
    const opener = screen.getByRole('button', { name: 'Settings' });
    await user.click(opener);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });
});
