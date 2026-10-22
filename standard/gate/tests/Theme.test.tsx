import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Theme, Button, useTheme } from '@system';

function Probe() {
  const { appearance, resolvedAppearance } = useTheme();
  return <output>{`${appearance}:${resolvedAppearance}`}</output>;
}

function mockScheme(dark: boolean) {
  const listeners = new Set<() => void>();
  const mql = {
    matches: dark,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  };
  vi.spyOn(window, 'matchMedia').mockImplementation(() => mql as unknown as MediaQueryList);
  return {
    set(next: boolean) {
      mql.matches = next;
      listeners.forEach((cb) => cb());
    },
  };
}

afterEach(() => vi.restoreAllMocks());

describe('Theme', () => {
  it('renders its children inside one root element', () => {
    const { container } = render(<Theme><Button>Save</Button></Theme>);
    expect(container.childElementCount).toBe(1);
    expect(container.firstElementChild).toContainElement(screen.getByRole('button', { name: 'Save' }));
  });

  it('sets color-scheme from the appearance', () => {
    const { container, rerender } = render(<Theme appearance="light">x</Theme>);
    expect(container.firstElementChild).toHaveStyle({ colorScheme: 'light' });
    rerender(<Theme appearance="dark">x</Theme>);
    expect(container.firstElementChild).toHaveStyle({ colorScheme: 'dark' });
  });

  it('exposes the appearance through useTheme()', () => {
    render(<Theme appearance="dark"><Probe /></Theme>);
    expect(screen.getByRole('status')).toHaveTextContent('dark:dark');
  });

  it('follows the OS setting with appearance="system" and updates when it changes', () => {
    const scheme = mockScheme(true);
    const { container } = render(<Theme appearance="system"><Probe /></Theme>);
    expect(screen.getByRole('status')).toHaveTextContent('system:dark');
    expect(container.firstElementChild).toHaveStyle({ colorScheme: 'dark' });
    act(() => scheme.set(false));
    expect(screen.getByRole('status')).toHaveTextContent('system:light');
  });

  it('passes className, style and other props through, and supports asChild', () => {
    const { container, rerender } = render(<Theme className="app" id="root" data-x="1">x</Theme>);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass('app');
    expect(root).toHaveAttribute('id', 'root');
    rerender(<Theme asChild appearance="dark"><main>content</main></Theme>);
    expect(screen.getByRole('main')).toHaveStyle({ colorScheme: 'dark' });
  });

  it('throws a helpful error when useTheme() is used outside a Theme', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/Theme/);
  });
});
