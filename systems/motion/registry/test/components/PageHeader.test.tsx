import { describe, expect, it, vi } from 'vitest';
import { PageHeader } from '@system';
import { renderUI, screen } from '../utils';

describe('PageHeader', () => {
  it('renders the title as the page heading, the description and actions', async () => {
    const onNew = vi.fn();
    const { user } = renderUI(
      <PageHeader title="Projects" description="Everything your team is working on." actions={<button type="button" onClick={onNew}>New project</button>} />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByText('Everything your team is working on.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'New project' }));
    expect(onNew).toHaveBeenCalledOnce();
  });

  it('accepts a node as title', () => {
    renderUI(<PageHeader title={<span>Q4 <em>roadmap</em></span>} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Q4 roadmap' })).toBeInTheDocument();
  });

  it('accepts className, style and id', () => {
    const { container } = renderUI(<PageHeader id="hdr" className="custom" title="Settings" />);
    const el = container.querySelector('#hdr');
    expect(el).toHaveClass('custom');
    expect(el).toContainElement(screen.getByRole('heading', { name: 'Settings' }));
  });
});
