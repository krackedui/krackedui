// krackedui.com: the landing page.
import Link from 'next/link';
import { catalog, gateCheckCount, systemHref, templateHref } from '@/catalog';
import { CopyCommand } from '@/components/site/CopyCommand';
import { Preview, SystemCard } from '@/components/site/SystemCard';

const pillars = [
  {
    title: 'Their own character',
    body: 'Each system keeps the components, APIs and tokens it was designed with. KrackedUI never flattens them into one look.',
    points: ['Specialties kept, not removed', 'Added exactly as designed', 'Differences flagged, not rewritten'],
  },
  {
    title: 'One quality bar',
    body: `Nothing ships until ${gateCheckCount} automated checks pass on the exact code being published. No overrides.`,
    points: ['WCAG 2.2 AA, focus, touch targets', 'Responsive from 320 to 1440 px', 'Typed, linted, tested, visually stable'],
  },
  {
    title: 'Real templates',
    body: 'Each system proves itself by building two full sector apps. Anything missing is added to the system as a new component.',
    points: ['Project management, fintech, more coming', 'Start one with a single command', 'Live previews on every system site'],
  },
];

const checks = [
  ['Typecheck', 'strict TypeScript, 0 errors'],
  ['Lint', 'ESLint with accessibility rules'],
  ['Tests', 'every behaviour test passes'],
  ['Build', 'within the bundle budget'],
  ['Install', 'fresh Vite and Next.js apps'],
  ['Copy-paste', 'each component installs alone'],
  ['Accessibility', 'axe: zero violations, light and dark'],
  ['Responsive', '320, 375, 768, 1024, 1440 px'],
  ['Visual', 'screenshots match approved baselines'],
  ['Templates', 'two sector apps build and pass'],
  ['Clean', 'nothing third-party ships'],
  ['Tokens', 'reported, never forced'],
];

export default function Home() {
  const live = catalog.filter((s) => s.status === 'live');
  const motion = live[0];
  const hero = motion?.templates.find((t) => t.id === 'fintech') ?? motion?.templates[0];

  return (
    <>
      {/* Hero */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 [background:var(--kui-glow)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <Link href="/marketplace" className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[var(--kui-border)] bg-[var(--kui-surface)] py-1 pl-1 pr-3 text-[13px] text-[var(--kui-muted)] shadow-[var(--kui-shadow)] hover:text-[var(--kui-text)]">
            <span className="rounded-full bg-[var(--kui-ink)] px-2 py-0.5 text-[11px] font-medium text-[var(--kui-ink-text)]">New</span>
            Motion 1.0 is live on npm
          </Link>
          <h1 id="hero-title" className="mx-auto mt-6 max-w-3xl text-balance text-center text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[56px] md:text-[64px]">
            Design systems with character, held to one standard
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-center text-[17px] leading-7 text-[var(--kui-muted)] sm:text-[18px]">
            A marketplace of production-ready React design systems. Each one keeps its own look and specialty; every one is
            typed, tested, accessible, responsive and proven by real templates before it ships.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/marketplace" className="inline-flex h-11 items-center rounded-xl bg-[var(--kui-ink)] px-5 text-[15px] font-medium text-[var(--kui-ink-text)] transition-opacity hover:opacity-90">
              Browse the marketplace
            </Link>
            <Link href={systemHref('motion', '/introduction')} className="inline-flex h-11 items-center rounded-xl border border-[var(--kui-border-strong)] bg-[var(--kui-surface)] px-5 text-[15px] font-medium transition-colors hover:bg-[var(--kui-surface-2)]">
              Read the docs
            </Link>
          </div>
          <CopyCommand command="npm create @krackedui my-app -- --system motion --template fintech" className="mx-auto mt-8 max-w-2xl" />

          {hero && (
            <figure className="mx-auto mt-14 max-w-5xl">
              <div className="overflow-hidden rounded-2xl border border-[var(--kui-border)] bg-[var(--kui-surface)] shadow-[var(--kui-shadow-lg)]">
                <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-[var(--kui-border)] px-4 py-3">
                  <span className="size-2.5 rounded-full bg-[var(--kui-border-strong)]" />
                  <span className="size-2.5 rounded-full bg-[var(--kui-border-strong)]" />
                  <span className="size-2.5 rounded-full bg-[var(--kui-border-strong)]" />
                  <span className="kui-code ml-3 truncate text-[12px] text-[var(--kui-faint)]">motion.krackedui.com/{hero.id}</span>
                </div>
                <a href={templateHref('motion', hero.id)} aria-label={`Open the live ${hero.name} template`}>
                  <Preview light={hero.preview.light} dark={hero.preview.dark} alt={`${hero.name} built with Motion`} className="w-full" />
                </a>
              </div>
              <figcaption className="mt-3 text-center text-[13px] text-[var(--kui-faint)]">
                The fintech template, built only from <span className="kui-code">@krackedui/motion</span>. Live and open source.
              </figcaption>
            </figure>
          )}
        </div>
      </section>

      {/* Pillars */}
      <section aria-labelledby="pillars-title" className="border-t border-[var(--kui-border)] bg-[var(--kui-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 id="pillars-title" className="max-w-2xl text-[30px] font-semibold leading-tight tracking-[-0.025em] sm:text-[36px]">
            Different looks. The same reliability.
          </h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-7 text-[var(--kui-muted)]">
            Quality is engineered, not hoped for. The standard is code, and the gate enforces it on every release.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pillars.map((p, i) => (
              <div key={p.title} className="rounded-2xl border border-[var(--kui-border)] bg-[var(--kui-bg)] p-6">
                <span className="kui-code text-[12px] text-[var(--kui-accent-text)]">0{i + 1}</span>
                <h3 className="mt-3 text-[18px] font-semibold tracking-[-0.01em]">{p.title}</h3>
                <p className="mt-2 text-[14px] leading-6 text-[var(--kui-muted)]">{p.body}</p>
                <ul className="mt-4 space-y-2">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex gap-2 text-[14px]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--kui-accent-text)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-1 shrink-0"><path d="M5 12.5 10 17 19 7" /></svg>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The gate */}
      <section aria-labelledby="gate-title" className="border-t border-[var(--kui-border)]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 id="gate-title" className="max-w-2xl text-[30px] font-semibold leading-tight tracking-[-0.025em] sm:text-[36px]">
            {gateCheckCount} checks before anything ships
          </h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-7 text-[var(--kui-muted)]">
            Publishing refuses to run unless the gate passed on the exact code being released. Pull requests run it too.
          </p>
          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {checks.map(([name, what], i) => (
              <li key={name} className="flex gap-3 rounded-xl border border-[var(--kui-border)] bg-[var(--kui-surface)] p-4">
                <span className="kui-code mt-0.5 text-[12px] text-[var(--kui-accent-text)]">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="block text-[15px] font-medium">{name}</span>
                  <span className="block text-[13px] leading-5 text-[var(--kui-muted)]">{what}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Systems */}
      <section aria-labelledby="systems-title" className="border-t border-[var(--kui-border)] bg-[var(--kui-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="systems-title" className="text-[30px] font-semibold leading-tight tracking-[-0.025em] sm:text-[36px]">The systems</h2>
              <p className="mt-3 text-[16px] leading-7 text-[var(--kui-muted)]">One live, more on the way.</p>
            </div>
            <Link href="/marketplace" className="text-[15px] font-medium text-[var(--kui-accent-text)] hover:underline">Open the marketplace →</Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {catalog.map((s) => <SystemCard key={s.id} system={s} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="cta-title" className="border-t border-[var(--kui-border)]">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 id="cta-title" className="text-balance text-[30px] font-semibold leading-tight tracking-[-0.025em] sm:text-[36px]">Start with a working app</h2>
          <p className="mt-3 text-[16px] leading-7 text-[var(--kui-muted)]">Pick a system and a template. You get a typed Vite + React app you own, wired to the design system from npm.</p>
          <CopyCommand command="npm create @krackedui my-app -- --system motion --template project-management" className="mx-auto mt-8 max-w-2xl text-left" />
        </div>
      </section>
    </>
  );
}
