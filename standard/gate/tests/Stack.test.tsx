import { describe, expect, it } from 'vitest';
import { Stack } from '@system';
import { renderUI, screen } from './utils';

describe('Stack', () => {
  it('renders its children in order and passes props through', () => {
    renderUI(<Stack direction={{ base: 'column', md: 'row' }} gap={{ base: 2, lg: 4 }} align="center" justify="between" wrap data-testid="s" aria-label="Actions" role="group"><span>One</span><span>Two</span></Stack>);
    const group = screen.getByRole('group', { name: 'Actions' });
    expect([...group.children].map((c) => c.textContent)).toEqual(['One', 'Two']);
  });

  it('renders as the child element with asChild', () => {
    renderUI(<Stack asChild gap={2}><nav aria-label="Main"><a href="#a">A</a></nav></Stack>);
    expect(screen.getByRole('navigation', { name: 'Main' })).toContainElement(screen.getByRole('link', { name: 'A' }));
  });
});
