import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from '@system';
import { renderUI, screen, waitFor } from '../../../../standard/gate/tests/utils';

function PageTree({ onSelect }: { onSelect?: (id: string) => void }) {
  return (
    <Sidebar.Tree label="Pages">
      <Sidebar.TreeItem label="Team wiki" defaultExpanded onSelect={() => onSelect?.('wiki')}>
        <Sidebar.TreeItem label="Roadmap" active onSelect={() => onSelect?.('roadmap')} />
        <Sidebar.TreeItem label="Notes" onSelect={() => onSelect?.('notes')} />
      </Sidebar.TreeItem>
      <Sidebar.TreeItem label="Specs" onSelect={() => onSelect?.('specs')}>
        <Sidebar.TreeItem label="Billing" />
      </Sidebar.TreeItem>
    </Sidebar.Tree>
  );
}
const item = (name: string) => screen.getByRole('treeitem', { name });

describe('Sidebar tree (Motion)', () => {
  it('has one tab stop: the selected item', () => {
    renderUI(<PageTree />);
    expect(item('Roadmap')).toHaveAttribute('tabindex', '0');
    expect(item('Team wiki')).toHaveAttribute('tabindex', '-1');
    expect(item('Roadmap')).toHaveAttribute('aria-level', '2');
    expect(item('Team wiki')).toHaveAttribute('aria-expanded', 'true');
  });

  it('arrow keys move, expand and collapse; Enter selects', async () => {
    const onSelect = vi.fn();
    const { user } = renderUI(<PageTree onSelect={onSelect} />);
    item('Roadmap').focus();
    await user.keyboard('{ArrowDown}');
    expect(item('Notes')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(item('Specs')).toHaveFocus();
    expect(item('Specs')).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{ArrowRight}');
    expect(item('Specs')).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowRight}');
    expect(await screen.findByRole('treeitem', { name: 'Billing' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(item('Specs')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(item('Specs')).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(screen.queryByRole('treeitem', { name: 'Billing' })).not.toBeInTheDocument());
    await user.keyboard('{Home}');
    expect(item('Team wiki')).toHaveFocus();
    await user.keyboard('{End}');
    expect(item('Specs')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('specs');
    expect(item('Specs')).toHaveAttribute('tabindex', '0');
  });

  it('sections collapse from their heading button', async () => {
    const { user } = renderUI(
      <Sidebar.Root>
        <Sidebar.Section title="Private"><Sidebar.Item href="#a">Alpha</Sidebar.Item></Sidebar.Section>
      </Sidebar.Root>,
    );
    const heading = screen.getByRole('button', { name: 'Private' });
    expect(heading).toHaveAttribute('aria-expanded', 'true');
    await user.click(heading);
    expect(heading).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Alpha' })).not.toBeInTheDocument());
    await user.click(heading);
    expect(await screen.findByRole('link', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('the resize handle is a keyboard width slider, clamped to min/max', async () => {
    const onWidthChange = vi.fn();
    const { user } = renderUI(<Sidebar.Root width={270} minWidth={200} maxWidth={480} onWidthChange={onWidthChange}><Sidebar.Item>One</Sidebar.Item></Sidebar.Root>);
    const handle = screen.getByRole('slider', { name: 'Sidebar width' });
    expect(handle).toHaveValue('270');
    await user.tab(); // the item
    await user.tab(); // the resize slider
    expect(handle).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(onWidthChange).toHaveBeenLastCalledWith(280);
    await user.keyboard('{ArrowLeft}');
    expect(onWidthChange).toHaveBeenLastCalledWith(260);
    await user.keyboard('{PageDown}');
    expect(onWidthChange).toHaveBeenLastCalledWith(220);
    await user.keyboard('{End}');
    expect(onWidthChange).toHaveBeenLastCalledWith(480);
    await user.keyboard('{Home}');
    expect(onWidthChange).toHaveBeenLastCalledWith(200);
  });
});
