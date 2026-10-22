import Link from 'next/link';
import { githubUrl, npmOrgUrl, systemHref } from '@/catalog';
import { Logo } from './Logo';

const columns = [
  { title: 'Product', links: [{ label: 'Marketplace', href: '/marketplace' }, { label: 'Motion docs', href: systemHref('motion', '/introduction') }, { label: 'Templates', href: systemHref('motion', '/templates') }] },
  { title: 'Build', links: [{ label: 'Using with AI', href: systemHref('motion', '/ai') }, { label: 'npm', href: npmOrgUrl }, { label: 'GitHub', href: githubUrl }] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--kui-border)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-[14px] leading-6 text-[var(--kui-muted)]">Design systems that speak the same language.</p>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-[13px] font-medium text-[var(--kui-text)]">{c.title}</h2>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[14px] text-[var(--kui-muted)] transition-colors hover:text-[var(--kui-text)]">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-10 text-[13px] text-[var(--kui-faint)] sm:px-6">© {new Date().getFullYear()} KrackedUI</div>
    </footer>
  );
}
