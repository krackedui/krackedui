'use client';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from 'radix-ui';
import type { DocsRegistry } from '@/lib/types';
import { flattenNav, pageHref, type FlatNavItem } from '@/lib/nav';
import { ArrowDown, ArrowUp, ChevronRight, CloseIcon, CornerDownRight, EnterIcon, NavGlyph, SearchIcon } from './icons';
import { NavBadge } from './Sidebar';
import { cx } from '@/lib/cx';

const kbd = 'flex h-6 w-7 shrink-0 items-center justify-center rounded-docs-sm bg-ln-gray-100 text-ln-gray-600';

export function SearchDialog({ registry, open, onOpenChange }: { registry: DocsRegistry; open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const all = useMemo(() => flattenNav(registry), [registry]);

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const hits = all.filter((it) => !needle || `${it.title} ${it.group ?? ''} ${it.section}`.toLowerCase().includes(needle));
    const map = new Map<string, FlatNavItem[]>();
    for (const it of hits) {
      const label = it.group ?? it.section;
      map.set(label, [...(map.get(label) ?? []), it]);
    }
    return [...map.entries()];
  }, [all, q]);
  const flat = groups.flatMap(([, items]) => items);

  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { if (!open) setQ(''); }, [open]);
  useEffect(() => {
    listRef.current?.querySelector('[data-selected=true]')?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  const go = (it?: FlatNavItem) => {
    if (!it) return;
    onOpenChange(false);
    router.push(pageHref(registry.id, it.slug));
  };

  let idx = -1;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[var(--ln-overlay)] backdrop-blur-[10px] data-[state=open]:animate-fade-in md:items-center md:justify-center md:p-4">
          <Dialog.Content
            aria-describedby={undefined}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, flat.length - 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
              if (e.key === 'Enter') { e.preventDefault(); go(flat[sel]); }
            }}
            className="relative flex h-full max-h-full w-full flex-col overflow-hidden bg-ln-gray-0 data-[state=open]:animate-dialog-in md:h-auto md:max-w-[540px] md:rounded-20"
          >
            <Dialog.Title className="sr-only">Search documentation</Dialog.Title>
            <div className="flex h-16 w-full items-center gap-3 px-5">
              <SearchIcon className="size-6 shrink-0 text-ln-gray-500" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type a command or search..."
                className="h-6 w-full flex-1 bg-transparent text-ln-paragraph-md text-ln-gray-950 caret-ln-orange outline-none placeholder:text-ln-gray-600"
              />
              <Dialog.Close className="flex cursor-pointer items-center" aria-label="Close">
                <CloseIcon className="size-6 text-ln-gray-450" />
              </Dialog.Close>
            </div>
            <div ref={listRef} className="flex max-h-[496px] min-h-0 flex-1 flex-col overflow-auto">
              {groups.length === 0 && (
                <>
                  <div className="h-px w-full bg-ln-gray-100" />
                  <div className="px-5 py-10 text-center text-ln-paragraph-md text-ln-gray-500">No results for “{q}”</div>
                </>
              )}
              {groups.map(([label, items]) => (
                <Fragment key={label}>
                  <div className="h-px w-full shrink-0 bg-ln-gray-100" />
                  <div className="relative p-3">
                    <div className="mb-1 px-3 py-1.5 text-ln-label-sm text-ln-gray-500">{label}</div>
                    {items.map((it) => {
                      idx += 1;
                      const i = idx;
                      const selected = i === sel;
                      return (
                        <div
                          key={it.slug}
                          role="option"
                          aria-selected={selected}
                          data-selected={selected}
                          onMouseMove={() => setSel(i)}
                          onClick={() => go(it)}
                          className={cx(
                            'group flex h-11 cursor-pointer items-center gap-3 rounded-docs-lg px-3 text-ln-label-md text-ln-gray-800 transition duration-200 ease-out',
                            selected && 'bg-ln-gray-25',
                          )}
                        >
                          {it.icon ? (
                            <NavGlyph name={it.icon} className={cx('size-[22px] shrink-0', selected ? 'text-ln-orange' : 'text-ln-gray-500')} />
                          ) : (
                            <CornerDownRight className={cx('size-[22px] shrink-0', selected ? 'text-ln-orange' : 'text-ln-gray-500')} />
                          )}
                          <span className="flex items-center gap-2.5">
                            {it.title}
                            {it.badge && <NavBadge label={it.badge.label} tone={it.badge.tone} />}
                          </span>
                          <ChevronRight className={cx('ml-auto size-5 text-ln-gray-500 transition ease-out', selected ? 'opacity-100' : 'opacity-0')} />
                        </div>
                      );
                    })}
                  </div>
                </Fragment>
              ))}
            </div>
            <div className="hidden h-16 shrink-0 items-center justify-between gap-3 border-t border-ln-gray-100 bg-ln-gray-25 px-5 md:flex">
              <div className="flex gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1">
                    <div className={kbd}><ArrowUp className="size-[18px]" /></div>
                    <div className={kbd}><ArrowDown className="size-[18px]" /></div>
                  </div>
                  <span className="text-ln-paragraph-md text-ln-gray-600">Navigate</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className={kbd}><EnterIcon className="size-[18px]" /></div>
                  <span className="text-ln-paragraph-md text-ln-gray-600">Select</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-right">
                <span className="text-ln-paragraph-md text-ln-gray-600">Close</span>
                <div className="rounded-docs-sm bg-ln-gray-100 px-1.5 py-0.5 text-ln-label-sm text-ln-gray-600">ESC</div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
