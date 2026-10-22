import { describe, expect, it, vi } from 'vitest';
import { SharePopover } from '@system';
import { renderUI, screen } from '../../../../standard/gate/tests/utils';

const people = [
  { name: 'Ada Lovelace', email: 'ada@example.com', you: true },
  { name: 'Grace Hopper', email: 'grace@example.com', access: 'Can edit' },
];

describe('SharePopover', () => {
  it('invites the typed emails with the Share button or Enter', async () => {
    const onInvite = vi.fn();
    const { user } = renderUI(<SharePopover people={people} onInvite={onInvite} />);
    const field = screen.getByRole('textbox', { name: 'Invite people by email' });
    await user.type(field, 'a@example.com, b@example.com');
    await user.click(screen.getByRole('button', { name: 'Share' }));
    expect(onInvite).toHaveBeenCalledWith('a@example.com, b@example.com');
    await user.type(field, '{Enter}');
    expect(onInvite).toHaveBeenCalledTimes(2);
  });

  it('lists people with a named access button each, and general access', async () => {
    const onPersonAccess = vi.fn();
    const onGeneralAccess = vi.fn();
    const { user } = renderUI(<SharePopover people={people} onPersonAccess={onPersonAccess} onGeneralAccess={onGeneralAccess} />);
    expect(screen.getByText('(You)', { exact: false })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Can edit, change access for Grace Hopper' }));
    expect(onPersonAccess).toHaveBeenCalledWith(people[1]);
    await user.click(screen.getByRole('button', { name: 'Full access, change access for Ada Lovelace' }));
    expect(onPersonAccess).toHaveBeenLastCalledWith(people[0]);
    await user.click(screen.getByRole('button', { name: 'Only people invited' }));
    expect(onGeneralAccess).toHaveBeenCalledTimes(1);
  });

  it('copies the link, opens advanced settings and dismisses the banner', async () => {
    const onCopyLink = vi.fn();
    const onAdvanced = vi.fn();
    const { user } = renderUI(<SharePopover onCopyLink={onCopyLink} onAdvanced={onAdvanced} banner="Invite your team" />);
    await user.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(onCopyLink).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Advanced' }));
    expect(onAdvanced).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Invite your team')).toBeNull();
  });

  it('switches to the Publish tab with the arrow keys', async () => {
    const { user } = renderUI(<SharePopover />);
    await user.click(screen.getByRole('tab', { name: 'Share' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Publish' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument();
  });

  it('marks the help link as opening a new tab', () => {
    renderUI(<SharePopover helpHref="https://example.com/help" />);
    const link = screen.getByRole('link', { name: /Learn about sharing.*opens in a new tab/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
  });
});
