import { describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { ContextMenu } from '@system';
import { renderUI, screen, waitFor } from './utils';

function FileMenu({ onRename, onOpenChange }: { onRename?: () => void; onOpenChange?: (open: boolean) => void }) {
  return (
    <ContextMenu.Root onOpenChange={onOpenChange}>
      <ContextMenu.Trigger>File area</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item onSelect={onRename}>Rename</ContextMenu.Item>
        <ContextMenu.CheckboxItem checked>Pinned</ContextMenu.CheckboxItem>
        <ContextMenu.RadioGroup value="a"><ContextMenu.RadioItem value="a">Option A</ContextMenu.RadioItem></ContextMenu.RadioGroup>
        <ContextMenu.Separator />
        <ContextMenu.Item destructive>Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

describe('ContextMenu', () => {
  it('opens on right-click with menu semantics and focus inside', async () => {
    const onOpenChange = vi.fn();
    renderUI(<FileMenu onOpenChange={onOpenChange} />);
    fireEvent.contextMenu(screen.getByText('File area'));
    const menu = await screen.findByRole('menu');
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(menu).toContainElement(screen.getByRole('menuitem', { name: 'Rename' }));
    expect(screen.getByRole('menuitemcheckbox', { name: 'Pinned' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Option A' })).toHaveAttribute('aria-checked', 'true');
    await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));
  });

  it('arrows move between items, Enter selects and closes', async () => {
    const onRename = vi.fn();
    const { user } = renderUI(<FileMenu onRename={onRename} />);
    fireEvent.contextMenu(screen.getByText('File area'));
    await screen.findByRole('menu');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onRename).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('Escape closes it', async () => {
    const { user } = renderUI(<FileMenu />);
    fireEvent.contextMenu(screen.getByText('File area'));
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });
});
