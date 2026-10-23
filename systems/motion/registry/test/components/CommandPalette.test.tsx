import { describe, expect, it, vi } from 'vitest';
import { CommandPalette } from '@system';
import { renderUI, screen } from '../utils';

const groups = [
  { label: 'Pages', items: [{ id: 'roadmap', title: 'Roadmap', icon: 'file' as const }, { id: 'notes', title: 'Meeting notes', keywords: 'sync' }] },
  { label: 'Actions', items: [{ id: 'new', title: 'New page', icon: 'plus' as const, shortcut: '⌘N' }] },
];

describe('CommandPalette', () => {
  it('input is a labelled combobox controlling a listbox of grouped options', () => {
    renderUI(<CommandPalette groups={groups} placeholder="Search commands" />);
    const input = screen.getByRole('combobox', { name: 'Search commands' });
    const listbox = screen.getByRole('listbox');
    expect(input).toHaveAttribute('aria-controls', listbox.id);
    expect(screen.getByRole('group', { name: 'Pages' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('typing filters by title and keywords; empty text when nothing matches', async () => {
    const { user } = renderUI(<CommandPalette groups={groups} placeholder="Search" emptyText="Nothing found" />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'sync');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Meeting notes']);
    await user.clear(input);
    await user.type(input, 'zzz');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('Nothing found')).toBeInTheDocument();
  });

  it('arrow keys move the active option (aria-activedescendant) and Enter selects it', async () => {
    const onSelect = vi.fn();
    const { user } = renderUI(<CommandPalette groups={groups} placeholder="Search" onSelect={onSelect} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    const active = () => document.getElementById(input.getAttribute('aria-activedescendant') ?? '');
    expect(active()).toHaveTextContent('Roadmap');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(active()).toHaveTextContent('New page');
    expect(active()).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowUp}');
    expect(active()).toHaveTextContent('Meeting notes');
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'notes' }));
    expect(input).toHaveFocus();
  });

  it('clicking an option selects it', async () => {
    const onSelect = vi.fn();
    const { user } = renderUI(<CommandPalette groups={groups} placeholder="Search" onSelect={onSelect} />);
    await user.click(screen.getByRole('option', { name: /New page/ }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'new' }));
  });
});
