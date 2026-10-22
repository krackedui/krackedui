import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MenuList, MenuRow, MenuSearch, MenuSurface, MenuSwitch } from '@system';
import { fireEvent, renderUI, screen } from '../../../../standard/gate/tests/utils';

function ToggleMenu({ onToggle }: { onToggle?: (v: boolean) => void }) {
  const [locked, setLocked] = useState(false);
  return (
    <MenuSurface>
      <MenuSearch placeholder="Search actions…" />
      <MenuList aria-label="Page settings">
        <MenuRow tabIndex={0} toggle={locked} onToggle={(v) => { setLocked(v); onToggle?.(v); }}>Lock page</MenuRow>
        <MenuRow highlighted>Copy link</MenuRow>
      </MenuList>
    </MenuSurface>
  );
}

describe('MenuRow', () => {
  it('is an option of a labelled listbox; a toggle row reports aria-checked', () => {
    renderUI(<ToggleMenu />);
    const list = screen.getByRole('listbox', { name: 'Page settings' });
    const lock = screen.getByRole('option', { name: 'Lock page' });
    expect(list).toContainElement(lock);
    expect(lock).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('option', { name: 'Copy link' })).toHaveAttribute('aria-selected', 'true');
  });

  it('toggles on click and with Enter / Space when it is a Tab stop', async () => {
    const onToggle = vi.fn();
    const { user } = renderUI(<ToggleMenu onToggle={onToggle} />);
    const lock = screen.getByRole('option', { name: 'Lock page' });
    await user.tab(); // search field
    await user.tab(); // the tabbable row
    expect(lock).toHaveFocus();
    await user.click(lock);
    expect(lock).toHaveAttribute('aria-checked', 'true');
    expect(lock).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(lock).toHaveAttribute('aria-checked', 'false');
    await user.keyboard(' ');
    expect(lock).toHaveAttribute('aria-checked', 'true');
    expect(onToggle.mock.calls.map((c) => c[0] as boolean)).toEqual([true, false, true]);
  });

  it('keeps focus in the field that drives the list when a non-tabbable row is clicked', async () => {
    const onClick = vi.fn();
    const { user } = renderUI(
      <MenuSurface>
        <MenuSearch placeholder="Filter…" />
        <MenuList aria-label="Results"><MenuRow onClick={onClick}>Duplicate</MenuRow></MenuList>
      </MenuSurface>,
    );
    const field = screen.getByRole('searchbox', { name: 'Filter…' });
    await user.click(field);
    const row = screen.getByRole('option', { name: 'Duplicate' });
    expect(fireEvent.mouseDown(row)).toBe(false); // default prevented: focus does not move
    await user.click(row);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(field).toHaveFocus();
    expect(row).not.toHaveAttribute('tabindex', '0');
  });
});

describe('MenuSwitch', () => {
  it('is purely visual: hidden from assistive tech and mirrors the checked state', () => {
    const { container, rerender } = renderUI(<MenuSwitch checked={false} />);
    const sw = container.querySelector('[data-state]');
    expect(sw).toHaveAttribute('aria-hidden', 'true');
    expect(sw).toHaveAttribute('data-state', 'unchecked');
    expect(screen.queryByRole('switch')).toBeNull();
    rerender(<MenuSwitch checked />);
    expect(container.querySelector('[data-state]')).toHaveAttribute('data-state', 'checked');
  });
});
