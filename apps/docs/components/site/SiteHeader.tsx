'use client';
import Link from 'next/link';
import { useState } from 'react';
import { githubUrl, systemHref } from '@/catalog';
import { useTheme } from '@/components/theme';
import { Logo } from './Logo';

const links = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Docs', href: systemHref('motion', '/introduction') },
  { label: 'GitHub', href: githubUrl },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      className="grid size-9 place-items-center rounded-lg text-[var(--kui-muted)] transition-colors hover:bg-[var(--kui-surface-2)] hover:text-[var(--kui-text)]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        {theme === 'dark' ? (
          <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        )}
      </svg>
    </button>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--kui-border)] bg-[var(--kui-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="KrackedUI home" className="text-[15px]">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="rounded-lg px-3 py-2 text-[14px] text-[var(--kui-muted)] transition-colors hover:text-[var(--kui-text)]">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/marketplace"
            className="hidden rounded-lg bg-[var(--kui-ink)] px-3.5 py-2 text-[14px] font-medium text-[var(--kui-ink-text)] transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Browse systems
          </Link>
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
            className="grid size-9 place-items-center rounded-lg text-[var(--kui-muted)] hover:bg-[var(--kui-surface-2)] md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav id="site-menu" aria-label="Main" className="border-t border-[var(--kui-border)] px-4 py-2 md:hidden">
          {links.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-[15px] text-[var(--kui-text)] hover:bg-[var(--kui-surface-2)]">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
