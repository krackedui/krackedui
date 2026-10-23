// Fixes found while building the project-management template.
import { describe, expect, it, vi } from 'vitest';
import { Avatar, CommandPaletteDialog } from '@system';
import { renderUI, screen } from './utils';

describe('CommandPaletteDialog', () => {
  it('closes before running the selected command, so the command can open another dialog', async () => {
    const calls: string[] = [];
    const onOpenChange = vi.fn((open: boolean) => calls.push(`open:${open}`));
    const { user } = renderUI(
      <CommandPaletteDialog
        defaultOpen
        onOpenChange={onOpenChange}
        groups={[{ label: 'Actions', items: [{ id: 'new', title: 'Create task' }] }]}
        onSelect={(item) => calls.push(`select:${item.id}`)}
      />,
    );
    await user.click(screen.getByRole('option', { name: /Create task/ }));
    expect(calls).toEqual(['open:false', 'select:new']);
  });
});

describe('Avatar initials', () => {
  it('shows first and last initials from 24px, one letter on small avatars and single names', () => {
    renderUI(<>
      <Avatar name="Priya van der Shah" size="md" />
      <Avatar name="Tomás Alvarez" size="sm" />
      <Avatar name="Cher" size="xl" />
    </>);
    expect(screen.getByRole('img', { name: 'Priya van der Shah' })).toHaveTextContent(/^PS$/);
    expect(screen.getByRole('img', { name: 'Tomás Alvarez' })).toHaveTextContent(/^T$/);
    expect(screen.getByRole('img', { name: 'Cher' })).toHaveTextContent(/^C$/);
  });
});
