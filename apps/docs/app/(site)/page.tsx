// krackedui.com: the landing page.
import Link from 'next/link';
import { catalog, contractSize, systemHref, templateHref } from '@/catalog';
import { CopyCommand } from '@/components/site/CopyCommand';
import { Preview, SystemCard } from '@/components/site/SystemCard';

const pillars = [
  {
    title: 'One contract',
    body: `Every system ships the same ${contractSize} components with the same props. Learn Button once; it works the same in every look.`,
    points: ['Same names and props', 'Same install steps', 'Swap systems by changing an import'],
  },
  {
    title: 'The gate',
    body: 'Nothing ships until 14 automated checks pass on the exact code being published. No overrides.',
    points: ['WCAG 2.2 AA, keyboard, focus, touch targets', 'Responsive from 320 to 1440 px', 'Tests, types, docs, visual baselines'],
  },
  {
    title: 'Real templates',
    body: 'Each system proves itself by building two full sector apps. Gaps found get fixed in the system, not around it.',
    points: ['Project management, fintech, more coming', 'Start one with a single command', 'Live previews on every system site'],
  },
];

const swap = [
  { file: 'motion', note: 'calm, dense' },
  { file: 'next-system', note: 'same code, new look' },
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
            Design systems that speak the same language
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-center text-[17px] leading-7 text-[var(--kui-muted)] sm:text-[18px]">
            A marketplace of production-ready React design systems built to one shared contract. Pick a look, keep your code:
            every system has the same components, the same props and the same quality bar.
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
            Built for people and AI to use without mistakes
          </h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-7 text-[var(--kui-muted)]">
            Consistency is engineered, not hoped for. The standard is code, and the gate enforces it on every release.
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

      {/* Swap the look */}
      <section aria-labelledby="swap-title" className="border-t border-[var(--kui-border)]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
          <div>
            <h2 id="swap-title" className="text-[30px] font-semibold leading-tight tracking-[-0.025em] sm:text-[36px]">Change the look, not the code</h2>
            <p className="mt-3 text-[16px] leading-7 text-[var(--kui-muted)]">
              Because every KrackedUI system implements the same contract, moving a product to a new look is a one-line change.
              Your screens, your logic and your prompts keep working.
            </p>
            <Link href="/marketplace" className="mt-6 inline-flex text-[15px] font-medium text-[var(--kui-accent-text)] hover:underline">
              See the systems →
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[var(--kui-border)] bg-[var(--kui-code-bg)] text-[var(--kui-code-text)] shadow-[var(--kui-shadow)]">
            <div tabIndex={0} role="region" aria-label="Code example: switching systems" className="kui-code space-y-1 overflow-x-auto whitespace-nowrap p-5 text-[13px] leading-6">
              {swap.map((s, i) =>
                i === 0 ? (
                  <div key={s.file} className="text-[var(--kui-syn-comment)] line-through decoration-[var(--kui-accent)]">
                    {`import { Theme, Button, DataTable } from '@krackedui/${s.file}';`}
                    <span className="ml-2 no-underline">{`// ${s.note}`}</span>
                  </div>
                ) : (
                  <div key={s.file}>
                    <span className="text-[var(--kui-syn-keyword)]">import</span> {'{ Theme, Button, DataTable }'} <span className="text-[var(--kui-syn-keyword)]">from</span>{' '}
                    <span className="text-[var(--kui-syn-string)]">&apos;@krackedui/{s.file}&apos;</span>;
                    <span className="ml-2 text-[var(--kui-syn-comment)]">{`// ${s.note}`}</span>
                  </div>
                ),
              )}
              <div className="pt-3 text-[var(--kui-syn-comment)]">{'// everything below stays the same'}</div>
              <div>{'<Theme appearance="system">'}</div>
              <div className="pl-4">{'<Button variant="primary" icon="plus">New invoice</Button>'}</div>
              <div className="pl-4">{'<DataTable columns={columns} rows={rows} pageSize={25} />'}</div>
              <div>{'</Theme>'}</div>
            </div>
          </div>
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
