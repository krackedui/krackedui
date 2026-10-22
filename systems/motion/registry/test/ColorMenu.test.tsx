import { describe, expect, it, vi } from 'vitest';
import { ColorGrid, ColorMenuList, ColorSwatch } from '@system';
import { renderUI, screen } from '../../../../standard/gate/tests/utils';

describe('ColorMenuList', () => {
  it('is one labelled listbox of text then background colors', () => {
    renderUI(<ColorMenuList value={{ kind: 'text', color: 'red' }} />);
    const list = screen.getByRole('listbox', { name: 'Color' });
    expect(screen.getByRole('group', { name: 'Text color' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Background color' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(20);
    expect(screen.getByRole('option', { name: 'Red text' })).toHaveAttribute('aria-selected', 'true');
    expect(list).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Default text' }).id);
  });

  it('moves the active row with arrows / Home / End and picks with Enter or Space', async () => {
    const onSelect = vi.fn();
    const { user } = renderUI(<ColorMenuList onSelect={onSelect} />);
    const list = screen.getByRole('listbox', { name: 'Color' });
    await user.tab();
    expect(list).toHaveFocus();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(list).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Brown text' }).id);
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith({ kind: 'text', color: 'brown' });
    await user.keyboard('{End}');
    expect(list).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Red background' }).id);
    await user.keyboard(' ');
    expect(onSelect).toHaveBeenLastCalledWith({ kind: 'background', color: 'red' });
    await user.keyboard('{Home}{ArrowUp}');
    expect(list).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Default text' }).id);
  });

  it('picks a row on click without moving focus out of the list, and shows last used first', async () => {
    const onSelect = vi.fn();
    const { user } = renderUI(<ColorMenuList onSelect={onSelect} autoFocus lastUsed={[{ value: { kind: 'background', color: 'yellow' }, shortcut: '⌘⇧H' }]} />);
    const list = screen.getByRole('listbox', { name: 'Color' });
    expect(list).toHaveFocus();
    expect(screen.getByRole('group', { name: 'Last used' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(21);
    await user.click(screen.getByRole('option', { name: 'Blue text' }));
    expect(onSelect).toHaveBeenCalledWith({ kind: 'text', color: 'blue' });
    expect(list).toHaveFocus();
  });
});

describe('ColorGrid', () => {
  it('is groups of named toggle buttons; the current color is pressed and a click selects', async () => {
    const onSelect = vi.fn();
    const { user } = renderUI(<ColorGrid value={{ kind: 'background', color: 'green' }} recent={[{ kind: 'text', color: 'purple' }]} onSelect={onSelect} />);
    expect(screen.getByRole('group', { name: 'Recently used' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Green background' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('button', { name: 'Purple text' })[0]).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByRole('button', { name: 'Orange text' }));
    expect(onSelect).toHaveBeenCalledWith({ kind: 'text', color: 'orange' });
    screen.getAllByRole('button', { name: 'Purple text' })[0].focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith({ kind: 'text', color: 'purple' });
  });
});

describe('ColorSwatch', () => {
  it('is decorative: an "A" for text colors, an empty chip for backgrounds', () => {
    renderUI(
      <>
        <ColorSwatch value={{ kind: 'text', color: 'red' }} data-testid="t" />
        <ColorSwatch value={{ kind: 'background', color: 'red' }} selected data-testid="b" />
      </>,
    );
    expect(screen.getByTestId('t')).toHaveTextContent('A');
    expect(screen.getByTestId('t')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('b')).toBeEmptyDOMElement();
    for (const id of ['t', 'b']) expect(screen.getByTestId(id)).not.toHaveAttribute('role');
  });
});
