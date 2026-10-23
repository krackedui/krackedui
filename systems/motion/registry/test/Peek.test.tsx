import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CenterPeek, PageHeader, PeekBody, SidePeek } from '@system';
import { renderUI, screen, waitFor } from './utils';

function SideDemo({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open task</button>
      <SidePeek open={open} label="Task preview" onClose={() => { setOpen(false); onClose?.(); }}>
        <PeekBody header={<PageHeader size="peek" title="Sidebar rebuild" />} />
      </SidePeek>
    </div>
  );
}
function CenterDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open center</button>
      <CenterPeek open={open} onOpenChange={setOpen} title="Sidebar rebuild">
        <PeekBody header={<PageHeader size="peek" title="Sidebar rebuild" />} />
      </CenterPeek>
    </div>
  );
}

describe('SidePeek', () => {
  it('moves focus in on open; Escape closes and returns focus to the opener', async () => {
    const onClose = vi.fn();
    const { user } = renderUI(<SideDemo onClose={onClose} />);
    const opener = screen.getByRole('button', { name: 'Open task' });
    await user.click(opener);
    const region = screen.getByRole('dialog', { name: 'Task preview' });
    expect(region).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Sidebar rebuild' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Task preview' })).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });

  it('the Close button closes it', async () => {
    const { user } = renderUI(<SideDemo />);
    await user.click(screen.getByRole('button', { name: 'Open task' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Task preview' })).not.toBeInTheDocument());
  });
});

describe('CenterPeek', () => {
  it('is a modal dialog named by its title; Escape closes and focus returns', async () => {
    const { user } = renderUI(<CenterDemo />);
    const opener = screen.getByRole('button', { name: 'Open center' });
    await user.click(opener);
    const dialog = await screen.findByRole('dialog', { name: 'Sidebar rebuild' });
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    for (let i = 0; i < 4; i++) { await user.tab(); expect(dialog.contains(document.activeElement)).toBe(true); }
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });
});
