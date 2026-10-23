import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Menu } from '@system';
import { renderUI, screen, waitFor } from '../utils';

function PageMenu(props: { onDelete?: () => void; onOpenChange?: (open: boolean) => void; open?: boolean }) {
  const [wrap, setWrap] = useState(false);
  const [sort, setSort] = useState('name');
  return (
    <Menu.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Content>
        <Menu.Label>Page</Menu.Label>
        <Menu.Item icon="copy" shortcut="⌘D">Duplicate</Menu.Item>
        <Menu.Item disabled>Archive</Menu.Item>
        <Menu.CheckboxItem checked={wrap} onCheckedChange={setWrap}>Wrap text</Menu.CheckboxItem>
        <Menu.Separator />
        <Menu.RadioGroup value={sort} onValueChange={setSort}>
          <Menu.RadioItem value="name">Name</Menu.RadioItem>
          <Menu.RadioItem value="date">Date</Menu.RadioItem>
        </Menu.RadioGroup>
        <Menu.Sub>
          <Menu.SubTrigger icon="share">Share to</Menu.SubTrigger>
          <Menu.SubContent><Menu.Item>Email</Menu.Item></Menu.SubContent>
        </Menu.Sub>
        <Menu.Group><Menu.Item destructive onSelect={props.onDelete}>Delete</Menu.Item></Menu.Group>
      </Menu.Content>
    </Menu.Root>
  );
}

describe('Menu', () => {
  it('trigger is a menu button that opens a menu with its items', async () => {
    const { user } = renderUI(<PageMenu />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Duplicate/ })).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('keyboard: Enter opens on the first item, arrows move and skip disabled, Escape closes and returns focus', async () => {
    const { user } = renderUI(<PageMenu />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /Duplicate/ })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Wrap text' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('menuitem', { name: /Duplicate/ })).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('selecting an item calls onSelect and closes the menu', async () => {
    const onDelete = vi.fn();
    const { user } = renderUI(<PageMenu onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('checkbox and radio items expose aria-checked and update', async () => {
    const { user } = renderUI(<PageMenu />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByRole('menuitemcheckbox', { name: 'Wrap text' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('menuitemradio', { name: 'Name' })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Wrap text' }));
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByRole('menuitemcheckbox', { name: 'Wrap text' })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('menuitemradio', { name: 'Date' }));
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByRole('menuitemradio', { name: 'Date' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Name' })).toHaveAttribute('aria-checked', 'false');
  });

  it('ArrowRight opens a submenu and ArrowLeft closes it', async () => {
    const { user } = renderUI(<PageMenu />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    const sub = screen.getByRole('menuitem', { name: 'Share to' });
    expect(sub).toHaveAttribute('aria-haspopup', 'menu');
    sub.focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Email' })).toHaveFocus());
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.queryByRole('menuitem', { name: 'Email' })).not.toBeInTheDocument());
    expect(sub).toHaveFocus();
  });

  it('is controllable with open / onOpenChange', async () => {
    const onOpenChange = vi.fn();
    const { user, rerender } = renderUI(<PageMenu open={false} onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    rerender(<PageMenu open onOpenChange={onOpenChange} />);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});
