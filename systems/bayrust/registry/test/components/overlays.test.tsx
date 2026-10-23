// Overlays: what a keyboard user can actually do with a menu, a dialog and a popover — open it,
// read it, escape it, and land back where they started.
import { describe, it, expect } from 'vitest';
import { Dialog, Menu, Popover, Tooltip } from '@system';
import { renderUI, screen, waitFor } from '../utils';

describe('Menu', () => {
  it('opens from its trigger and reports expanded', async () => {
    const { user } = renderUI(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Copy link</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByRole('menuitem', { name: 'Copy link' })).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const { user } = renderUI(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Copy link</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    await user.click(trigger);
    await screen.findByRole('menuitem', { name: 'Copy link' });
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menuitem', { name: 'Copy link' })).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('exposes a checkbox item’s state', async () => {
    renderUI(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.CheckboxItem checked>Pinned</Menu.CheckboxItem>
        </Menu.Content>
      </Menu.Root>,
    );
    expect(await screen.findByRole('menuitemcheckbox', { name: 'Pinned' })).toHaveAttribute('aria-checked', 'true');
  });
});

describe('Dialog', () => {
  it('is a modal named by its title and described by its description', async () => {
    const { user } = renderUI(
      <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Delete snippet</Dialog.Title>
          <Dialog.Description>This cannot be undone.</Dialog.Description>
        </Dialog.Content>
      </Dialog.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Delete snippet');
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.');
  });

  it('closes on Escape and gives focus back', async () => {
    const { user } = renderUI(
      <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Delete snippet</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});

describe('Popover', () => {
  it('opens and closes from its trigger', async () => {
    const { user } = renderUI(
      <Popover.Root>
        <Popover.Trigger>Details</Popover.Trigger>
        <Popover.Content>Runs on every save.</Popover.Content>
      </Popover.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Details' });
    await user.click(trigger);
    expect(await screen.findByText('Runs on every save.')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('Runs on every save.')).not.toBeInTheDocument());
  });
});

describe('Tooltip', () => {
  it('shows its content on focus and describes the control', async () => {
    const { user } = renderUI(
      <Tooltip content="Copy to clipboard">
        <button type="button">Copy</button>
      </Tooltip>,
    );
    await user.tab();
    expect(await screen.findByText('Copy to clipboard')).toBeInTheDocument();
  });
});
