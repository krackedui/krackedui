import { describe, expect, it, vi } from 'vitest';
import { Tabs } from '@system';
import { renderUI, screen } from '../utils';

function Project(props: { value?: string; defaultValue?: string; onValueChange?: (v: string) => void }) {
  return (
    <Tabs.Root defaultValue={props.value === undefined ? (props.defaultValue ?? 'overview') : undefined} value={props.value} onValueChange={props.onValueChange}>
      <Tabs.List aria-label="Project">
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="archived" disabled>Archived</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview">Overview panel</Tabs.Content>
      <Tabs.Content value="activity">Activity panel</Tabs.Content>
      <Tabs.Content value="archived">Archived panel</Tabs.Content>
      <Tabs.Content value="settings">Settings panel</Tabs.Content>
    </Tabs.Root>
  );
}

describe('Tabs', () => {
  it('tablist, tabs and a labelled tabpanel', () => {
    renderUI(<Project />);
    expect(screen.getByRole('tablist', { name: 'Project' })).toBeInTheDocument();
    const overview = screen.getByRole('tab', { name: 'Overview' });
    expect(overview).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'false');
    const panel = screen.getByRole('tabpanel', { name: 'Overview' });
    expect(panel).toHaveTextContent('Overview panel');
    expect(overview).toHaveAttribute('aria-controls', panel.id);
  });

  it('arrow keys move and activate (automatic), skipping disabled tabs and wrapping; Home/End', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<Project onValueChange={onValueChange} />);
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith('activity');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Activity panel');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveFocus();
  });

  it('Tab moves from the active tab into the panel', async () => {
    const { user } = renderUI(<Project />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole('tabpanel')).toHaveFocus();
  });

  it('controlled value', async () => {
    const onValueChange = vi.fn();
    const { user, rerender } = renderUI(<Project value="overview" onValueChange={onValueChange} />);
    await user.click(screen.getByRole('tab', { name: 'Activity' }));
    expect(onValueChange).toHaveBeenCalledWith('activity');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    rerender(<Project value="activity" onValueChange={onValueChange} />);
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true');
  });
});
