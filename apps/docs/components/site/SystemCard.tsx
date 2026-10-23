import Link from 'next/link';
import { componentCount, systemHref, templateHref, type CatalogSystem } from '@/catalog';

/** Light/dark screenshot pair; the page theme decides which one shows. */
export function Preview({ light, dark, alt, className }: { light: string; dark: string; alt: string; className?: string }) {
  return (
    <>
      <img src={light} alt={alt} loading="lazy" decoding="async" width={1440} height={900} className={`kui-img-light ${className ?? ''}`} />
      <img src={dark} alt={alt} loading="lazy" decoding="async" width={1440} height={900} className={`kui-img-dark ${className ?? ''}`} />
    </>
  );
}

/** `headingLevel` keeps the document outline valid: 2 under a page h1, 3 under a section h2. */
export function SystemCard({ system, headingLevel = 3 }: { system: CatalogSystem; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const live = system.status === 'live';
  const cover = system.templates[0]?.preview;
  return (
    <article
      aria-labelledby={`sys-${system.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--kui-border)] bg-[var(--kui-surface)] shadow-[var(--kui-shadow)] ${live ? 'kui-lift' : ''}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-[var(--kui-border)] bg-[var(--kui-surface-2)]">
        {cover ? (
          <Preview light={cover.light} dark={cover.dark} alt={`${system.name}: ${system.templates[0].name} template`} className="size-full object-cover object-left-top" />
        ) : (
          <div className="grid size-full place-items-center bg-[repeating-linear-gradient(135deg,transparent_0_10px,var(--kui-border)_10px_11px)]">
            <span className="rounded-full border border-[var(--kui-border-strong)] bg-[var(--kui-surface)] px-3 py-1 text-[12px] font-medium text-[var(--kui-muted)]">In progress</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <Heading id={`sys-${system.id}`} className="text-[17px] font-semibold tracking-[-0.01em]">
            {live ? (
              <Link href={systemHref(system.id, '/introduction')} className="after:absolute after:inset-0 after:content-['']">
                {system.name}
              </Link>
            ) : (
              system.name
            )}
          </Heading>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${live ? 'bg-[var(--kui-ink)] text-[var(--kui-ink-text)]' : 'border border-[var(--kui-border-strong)] text-[var(--kui-muted)]'}`}>
            {live ? `v${system.version}` : 'Soon'}
          </span>
        </div>
        <p className="text-[14px] leading-6 text-[var(--kui-muted)]">
          <span className="font-medium text-[var(--kui-text)]">{system.tagline}</span> {system.description}
        </p>
        <ul aria-label="Tags" className="flex flex-wrap gap-1.5">
          {system.tags.map((t) => (
            <li key={t} className="rounded-md bg-[var(--kui-surface-2)] px-2 py-0.5 text-[12px] text-[var(--kui-muted)]">{t}</li>
          ))}
        </ul>
        {live && (
          <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-[var(--kui-border)] pt-4 text-[12px]">
            <div><dt className="text-[var(--kui-faint)]">Components</dt><dd className="mt-0.5 font-medium">{componentCount(system.id)}</dd></div>
            <div><dt className="text-[var(--kui-faint)]">Templates</dt><dd className="mt-0.5 font-medium">{system.templates.length}</dd></div>
            <div><dt className="text-[var(--kui-faint)]">Modules</dt><dd className="mt-0.5 font-medium">{system.modules?.length ?? 0}</dd></div>
          </dl>
        )}
        {live && system.templates.length > 0 && (
          <div className="relative z-10 flex flex-wrap gap-2">
            {system.templates.map((t) => (
              <a key={t.id} href={templateHref(system.id, t.id)} className="rounded-lg border border-[var(--kui-border)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--kui-text)] transition-colors hover:border-[var(--kui-border-strong)] hover:bg-[var(--kui-surface-2)]">
                {t.name} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
