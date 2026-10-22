import { describe, expect, it } from 'vitest';
import { Avatar, AvatarGroup } from '@system';
import { renderUI, screen } from './utils';

describe('AvatarGroup', () => {
  it('shows up to max avatars and a count of the rest', () => {
    renderUI(
      <AvatarGroup max={2} size="sm">
        <Avatar name="Ada" />
        <Avatar name="Grace" />
        <Avatar name="Linus" />
        <Avatar name="Margaret" />
      </AvatarGroup>,
    );
    expect(screen.getByRole('img', { name: 'Ada' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Grace' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Linus' })).not.toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('shows everyone when under max', () => {
    renderUI(<AvatarGroup><Avatar name="Ada" /><Avatar name="Grace" /></AvatarGroup>);
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });
});
