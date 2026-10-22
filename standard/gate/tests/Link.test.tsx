import { describe, expect, it } from 'vitest';
import { Link } from '@system';
import { renderUI, screen } from './utils';

describe('Link', () => {
  it('is a link to its href', async () => {
    const { user } = renderUI(<Link href="/docs">Docs</Link>);
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).not.toHaveAttribute('target');
    await user.tab();
    expect(link).toHaveFocus();
  });

  it('external links open in a new tab safely and say so', () => {
    renderUI(<Link href="https://example.com" external>Example</Link>);
    const link = screen.getByRole('link', { name: /Example/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toMatch(/noreferrer/);
    expect(link).toHaveAccessibleName(/new tab/i);
  });
});
