'use client';
import { useMemo, useState } from 'react';
import type { CatalogSystem } from '@/catalog';
import { SystemCard } from './SystemCard';

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function matches(system: CatalogSystem, query: string) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = normalize(
    [system.name, system.tagline, system.description, system.style, ...system.tags, ...(system.modules ?? []), ...system.templates.map((t) => `${t.name} ${t.description}`)].join(' '),
  );
  return words.every((w) => haystack.includes(w));
}

/** Search + tag filters over the catalog. Filtering is client-side; the catalog is small and static. */
export function MarketplaceGrid({ systems }: { systems: CatalogSystem[] }) {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [liveOnly, setLiveOnly] = useState(false);

  const tags = useMemo(() => [...new Set(systems.flatMap((s) => s.tags))].sort(), [systems]);
  const results = systems.filter((s) => matches(s, query) && (!tag || s.tags.includes(tag)) && (!liveOnly || s.status === 'live'));

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search design systems</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--kui-faint)]">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, style, sector or component…"
              className="h-12 w-full rounded-xl border border-[var(--kui-border-strong)] bg-[var(--kui-surface)] pl-11 pr-4 text-[15px] text-[var(--kui-text)] shadow-[var(--kui-shadow)] outline-none placeholder:text-[var(--kui-faint)] focus-visible:border-[var(--kui-accent-text)]"
            />
          </label>
          <label className="flex h-12 shrink-0 cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--kui-border)] bg-[var(--kui-surface)] px-4 text-[14px]">
            <input type="checkbox" checked={liveOnly} onChange={(e) => setLiveOnly(e.target.checked)} className="size-4 accent-[var(--kui-ink)]" />
            Live only
          </label>
        </div>
        <div role="group" aria-label="Filter by tag" className="flex flex-wrap gap-2">
          {[null, ...tags].map((t) => {
            const active = tag === t;
            return (
              <button
                key={t ?? 'all'}
                type="button"
                aria-pressed={active}
                onClick={() => setTag(t)}
                className={`h-8 rounded-full px-3.5 text-[13px] transition-colors ${active ? 'bg-[var(--kui-ink)] text-[var(--kui-ink-text)]' : 'border border-[var(--kui-border)] bg-[var(--kui-surface)] text-[var(--kui-muted)] hover:text-[var(--kui-text)]'}`}
              >
                {t ?? 'All'}
              </button>
            );
          })}
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-8 text-[13px] text-[var(--kui-faint)]">
        {results.length} {results.length === 1 ? 'system' : 'systems'}
      </p>

      {results.length ? (
        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((s) => <SystemCard key={s.id} system={s} headingLevel={2} />)}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-[var(--kui-border-strong)] px-6 py-16 text-center">
          <p className="text-[16px] font-medium">No systems match that search</p>
          <p className="mt-1 text-[14px] text-[var(--kui-muted)]">Try another word, or clear the filters.</p>
          <button
            type="button"
            onClick={() => { setQuery(''); setTag(null); setLiveOnly(false); }}
            className="mt-5 rounded-lg border border-[var(--kui-border-strong)] px-3.5 py-2 text-[14px] font-medium hover:bg-[var(--kui-surface-2)]"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
