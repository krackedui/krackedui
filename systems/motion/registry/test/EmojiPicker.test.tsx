import { describe, expect, it, vi } from 'vitest';
import { EmojiPicker, emojiCategories } from '@system';
import { renderUI, screen, within } from './utils';

describe('EmojiPicker', () => {
  it('shows emoji grouped by category; clicking one selects it', async () => {
    const onSelect = vi.fn();
    const { user } = renderUI(<EmojiPicker onSelect={onSelect} />);
    expect(screen.getByRole('tab', { name: 'Emoji' })).toHaveAttribute('aria-selected', 'true');
    const first = emojiCategories[0];
    const group = screen.getByRole('group', { name: first.label });
    await user.click(within(group).getByRole('button', { name: first.emoji[0] }));
    expect(onSelect).toHaveBeenCalledWith(first.emoji[0]);
  });

  it('filters by category name and says when nothing matches', async () => {
    const { user } = renderUI(<EmojiPicker />);
    const field = screen.getByRole('searchbox', { name: 'Search emoji' });
    await user.type(field, 'flags');
    expect(screen.getByRole('group', { name: 'Flags' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'People' })).toBeNull();
    await user.clear(field);
    await user.type(field, 'zzzz');
    expect(screen.getByRole('status')).toHaveTextContent('No results');
  });

  it('switches to the Icons tab with the keyboard and selects an icon by name', async () => {
    const onSelectIcon = vi.fn();
    const { user } = renderUI(<EmojiPicker onSelectIcon={onSelectIcon} />);
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Emoji' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    const icons = screen.getByRole('tab', { name: 'Icons' });
    expect(icons).toHaveFocus();
    expect(icons).toHaveAttribute('aria-selected', 'true');
    const grid = screen.getByRole('group', { name: 'Icons' });
    const button = within(grid).getAllByRole('button')[0];
    await user.click(button);
    expect(onSelectIcon).toHaveBeenCalledTimes(1);
    expect(typeof onSelectIcon.mock.calls[0][0]).toBe('string');
  });

  it('offers Remove, Random and Upload actions when handlers are given', async () => {
    const onRemove = vi.fn();
    const onSelect = vi.fn();
    const onUpload = vi.fn();
    const { user } = renderUI(<EmojiPicker onRemove={onRemove} onSelect={onSelect} onUpload={onUpload} />);
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Random emoji' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(emojiCategories.some((c) => c.emoji.includes(onSelect.mock.calls[0][0] as string))).toBe(true);
    await user.click(screen.getByRole('tab', { name: 'Upload' }));
    await user.click(screen.getByRole('button', { name: 'Upload an image' }));
    expect(onUpload).toHaveBeenCalledTimes(1);
  });

  it('has a labelled category navigation', () => {
    renderUI(<EmojiPicker />);
    const nav = screen.getByRole('navigation', { name: 'Emoji categories' });
    expect(within(nav).getAllByRole('button')).toHaveLength(emojiCategories.length);
  });
});
