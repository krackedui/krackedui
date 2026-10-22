// Portalled layers follow the <Theme> they were opened from, not the page (a dark Theme elsewhere on
// the page must not turn a light Theme's menus dark). Plus a source scan so no component portals
// around the shared ThemePortal helper.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { useState, type ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { Button, Dialog, Menu, Popover, Select, Theme, ThemePortal, Tooltip } from '@system';

/** The appearance carried by the portal container around an overlay element. */
function appearanceOf(el: Element): string | null {
  const root = el.closest('.motion-portal-root');
  if (!root) return null;
  expect(root.classList.contains(root.getAttribute('data-appearance') ?? '')).toBe(true);
  expect(el.closest('.motion-root')).toBeNull(); // portalled out of the Theme's own subtree
  return root.getAttribute('data-appearance');
}

const fruits = [{ value: 'apple', label: 'Apple' }, { value: 'pear', label: 'Pear' }];

function Overlays({ name }: { name: string }) {
  return (
    <>
      <Menu.Root>
        <Menu.Trigger asChild><Button>{`${name} menu`}</Button></Menu.Trigger>
        <Menu.Content aria-label={`${name} actions`}><Menu.Item>Rename</Menu.Item></Menu.Content>
      </Menu.Root>
      <Popover.Root>
        <Popover.Trigger asChild><Button>{`${name} popover`}</Button></Popover.Trigger>
        <Popover.Content aria-label={`${name} panel`}>Panel</Popover.Content>
      </Popover.Root>
      <Dialog.Root>
        <Dialog.Trigger asChild><Button>{`${name} dialog`}</Button></Dialog.Trigger>
        <Dialog.Content aria-describedby={undefined}>
          <Dialog.Title>{`${name} dialog title`}</Dialog.Title>
          <Dialog.Close asChild><Button>Close</Button></Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
      <Tooltip content={`${name} tip`} delayDuration={0}><Button>{`${name} hint`}</Button></Tooltip>
      <Select aria-label={`${name} fruit`} options={fruits} />
    </>
  );
}

function MixedPage() {
  return (
    <>
      <Theme appearance="light"><Overlays name="Light" /></Theme>
      <Theme appearance="dark"><Overlays name="Dark" /></Theme>
    </>
  );
}

describe('ThemePortal: overlays follow their own Theme', () => {
  for (const name of ['Light', 'Dark'] as const) {
    const expected = name.toLowerCase();

    it(`${name} Theme: menu, popover and dialog carry the ${expected} appearance`, async () => {
      const user = userEvent.setup();
      render(<MixedPage />);

      await user.click(screen.getByRole('button', { name: `${name} menu` }));
      expect(appearanceOf(await screen.findByRole('menu', { name: `${name} menu` }))).toBe(expected);
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: `${name} popover` }));
      expect(appearanceOf(await screen.findByRole('dialog', { name: `${name} panel` }))).toBe(expected);
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: `${name} dialog` }));
      const dialog = await screen.findByRole('dialog', { name: `${name} dialog title` });
      expect(appearanceOf(dialog)).toBe(expected);
      await user.click(screen.getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(screen.getByRole('button', { name: `${name} dialog` })).toHaveFocus();
    });

    it(`${name} Theme: tooltip and select listbox carry the ${expected} appearance`, async () => {
      const user = userEvent.setup();
      render(<MixedPage />);

      await user.hover(screen.getByRole('button', { name: `${name} hint` }));
      const tip = await screen.findByRole('tooltip');
      expect(tip).toHaveTextContent(`${name} tip`);
      // Radix renders a visually hidden copy inside the content; the visible surface is its parent.
      expect(appearanceOf(tip)).toBe(expected);
      await user.unhover(screen.getByRole('button', { name: `${name} hint` }));

      const trigger = screen.getByRole('combobox', { name: `${name} fruit` });
      trigger.focus();
      await user.keyboard('{Enter}');
      expect(appearanceOf(await screen.findByRole('listbox'))).toBe(expected);
    });
  }

  it('nested Theme: the inner Theme wins, and its container sits after the outer one', async () => {
    const user = userEvent.setup();
    render(
      <Theme appearance="light">
        <Theme appearance="dark"><Overlays name="Inner" /></Theme>
        <Overlays name="Outer" />
      </Theme>,
    );
    const roots = Array.from(document.querySelectorAll('.motion-portal-root'));
    expect(roots.map((r) => r.getAttribute('data-appearance'))).toEqual(['light', 'dark']);
    await user.click(screen.getByRole('button', { name: 'Inner menu' }));
    expect(appearanceOf(await screen.findByRole('menu'))).toBe('dark');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Outer menu' }));
    expect(appearanceOf(await screen.findByRole('menu', { name: 'Outer menu' }))).toBe('light');
  });

  it('follows appearance changes of an open overlay, and carries the Theme custom properties', async () => {
    function Toggle() {
      const [dark, setDark] = useState(false);
      return (
        <Theme appearance={dark ? 'dark' : 'light'} style={{ ['--n-accent-test' as string]: '1px' }}>
          <Popover.Root defaultOpen>
            <Popover.Trigger asChild><Button>Open</Button></Popover.Trigger>
            <Popover.Content aria-label="Panel">
              <Button onClick={() => setDark((d) => !d)}>Toggle</Button>
            </Popover.Content>
          </Popover.Root>
        </Theme>
      );
    }
    const user = userEvent.setup();
    render(<Toggle />);
    const panel = await screen.findByRole('dialog', { name: 'Panel' });
    expect(appearanceOf(panel)).toBe('light');
    const root = panel.closest<HTMLElement>('.motion-portal-root')!;
    expect(root.style.getPropertyValue('--n-accent-test')).toBe('1px');
    expect(root.style.colorScheme).toBe('light');
    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(appearanceOf(screen.getByRole('dialog', { name: 'Panel' }))).toBe('dark');
    expect(root.style.colorScheme).toBe('dark');
  });

  it('removes the container when the Theme unmounts', () => {
    const { unmount } = render(<Theme><span>App</span></Theme>);
    expect(document.querySelectorAll('.motion-portal-root')).toHaveLength(1);
    unmount();
    expect(document.querySelectorAll('.motion-portal-root')).toHaveLength(0);
  });

  it('without a Theme, overlays still portal to <body> (fallback)', async () => {
    const user = userEvent.setup();
    render(
      <Menu.Root>
        <Menu.Trigger asChild><Button>Bare</Button></Menu.Trigger>
        <Menu.Content aria-label="Bare actions"><Menu.Item>Rename</Menu.Item></Menu.Content>
      </Menu.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Bare' }));
    const menu = await screen.findByRole('menu', { name: 'Bare' });
    expect(menu.closest('.motion-portal-root')).toBeNull();
    expect(document.body.contains(menu)).toBe(true);
  });

  it('plain ThemePortal renders custom floating UI into the Theme container', async () => {
    function Floating({ children }: { children: ReactNode }) {
      return <ThemePortal><div role="note">{children}</div></ThemePortal>;
    }
    render(<Theme appearance="dark"><Floating>Hello</Floating></Theme>);
    expect(appearanceOf(await screen.findByRole('note'))).toBe('dark');
  });

  it('server render: no container markup and no document access', () => {
    const html = renderToString(
      <Theme appearance="dark">
        <Menu.Root defaultOpen>
          <Menu.Trigger>Open</Menu.Trigger>
          <Menu.Content aria-label="Actions"><Menu.Item>Rename</Menu.Item></Menu.Content>
        </Menu.Root>
        <ThemePortal><div>Floating</div></ThemePortal>
      </Theme>,
    );
    expect(html).toContain('motion-root dark');
    expect(html).not.toContain('motion-portal-root');
    expect(html).not.toContain('Floating');
  });
});

describe('ThemePortal: every portal goes through the helper', () => {
  const src = path.resolve(import.meta.dirname, '../src');
  const files = (function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((f) => {
      const p = path.join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : [];
    });
  })(src);
  const allowed = new Set([path.join(src, 'foundations', 'ThemePortal.tsx')]);

  it('no raw createPortal or Radix *.Portal outside foundations/ThemePortal.tsx', () => {
    const offenders: string[] = [];
    for (const file of files) {
      if (allowed.has(file)) continue;
      readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        if (/^\s*(\/\*|\*)/.test(line)) return; // JSDoc / block comment lines
        const code = line.replace(/\/\/.*$/, '');
        // Allowed: passing a primitive's Portal part to the helper (`primitive={X.Portal}`).
        const stripped = code.replace(/primitive=\{\w+\.Portal\}/g, '');
        if (/\bcreatePortal\b/.test(stripped) || /\b\w+\.Portal\b/.test(stripped)) {
          offenders.push(`${path.relative(src, file)}:${i + 1}: ${line.trim()}`);
        }
      });
    }
    expect(offenders, 'Route portals through <ThemePortal> (foundations/ThemePortal.tsx)').toEqual([]);
  });
});
