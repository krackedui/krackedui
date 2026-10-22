'use client';
import Link from 'next/link';
import { Accordion, ScrollArea } from 'radix-ui';
import type { DocsRegistry, NavItem } from '@/lib/types';
import { pageHref } from '@/lib/nav';
import { ChevronDown, NavGlyph } from './icons';
import { SystemSwitcher } from './SystemSwitcher';
import { cx } from '@/lib/cx';
import { Separator, useChrome } from './chrome';

export function Wordmark() {
  return (
    <span className="flex h-9 items-center whitespace-nowrap text-[15px]/5 font-semibold tracking-[-0.02em] text-ln-gray-900">
      Motion
    </span>
  );
}

export function NavBadge({ label, tone = 'gray' }: { label: string; tone?: 'gray' | 'orange' }) {
  return (
    <span
      className={cx(
        'flex h-4 items-center rounded-docs-sm px-[5px] text-ln-subheading-xs',
        tone === 'orange' ? 'bg-ln-orange/8 text-ln-orange' : 'bg-ln-gray-50 text-ln-gray-500',
      )}
    >
      {label}
    </span>
  );
}

function ItemLink({ system, item, title, active, nested }: { system: string; item: NavItem; title: string; active: boolean; nested?: boolean }) {
  const { NavLink } = useChrome();
  if (NavLink) {
    const badge = item.badge ? <NavBadge label={item.badge.label} tone={item.badge.tone} /> : undefined;
    return <NavLink href={pageHref(system, item.slug)} title={title} icon={item.icon} active={active} depth={nested ? 1 : 0} badge={badge} />;
  }
  return (
    <Link
      href={pageHref(system, item.slug)}
      className={cx(
        'group relative flex items-center gap-2.5 text-ln-label-sm transition ease-linear',
        active ? (nested ? 'text-ln-orange' : 'text-ln-gray-900') : 'text-ln-gray-600 hover:text-ln-gray-900',
        nested && active && 'before:absolute before:-left-[21px] before:top-0 before:h-5 before:w-px before:bg-ln-orange',
      )}
    >
      {item.icon && !nested && (
        <NavGlyph name={item.icon} className={cx('size-5 shrink-0 transition ease-linear', active ? 'text-ln-orange' : 'text-ln-gray-400')} />
      )}
      <span className="flex items-center gap-1.5">
        {title}
        {item.badge && <NavBadge label={item.badge.label} tone={item.badge.tone} />}
      </span>
    </Link>
  );
}

export function Sidebar({ registry, systems, slug, mobile }: { registry: DocsRegistry; systems: DocsRegistry[]; slug: string; mobile?: boolean }) {
  const titleOf = (it: NavItem) => it.title ?? registry.pages[it.slug]?.title ?? it.slug;
  const chrome = useChrome();
  const custom = !!chrome.NavLink;
  return (
    <aside className={cx(mobile ? 'h-full w-full overflow-hidden' : 'sticky top-0 z-30 hidden h-screen w-full shrink-0 overflow-hidden border-r border-ln-gray-100 lg:block', chrome.sidebarClassName)}>
      <ScrollArea.Root type="scroll" className="h-full w-full">
        <ScrollArea.Viewport className="h-full w-full">
          <div className={cx('flex w-full flex-col', custom ? 'gap-3 px-2 py-3' : 'gap-6 px-6 py-6')}>
            <div className={cx('flex items-center justify-between', custom ? 'px-2 pb-2' : 'px-px')}>
              <div className="flex items-center gap-2.5">
                <Link href={pageHref(registry.id, registry.home ?? 'introduction')} aria-label="Home">
                  <Wordmark />
                </Link>
                <SystemSwitcher current={registry} systems={systems} />
              </div>
            </div>
            <Accordion.Root type="multiple" defaultValue={registry.nav.map((s) => s.title)} className="contents">
              {registry.nav.map((section) => (
                <div key={section.title} className="contents">
                  <Separator />
                  <Accordion.Item value={section.title}>
                    <Accordion.Trigger className="group block w-full cursor-pointer text-left">
                      {chrome.NavSectionLabel ? (
                        <chrome.NavSectionLabel title={section.title} />
                      ) : (
                        <h4 className="flex justify-between gap-2 text-ln-label-sm text-ln-gray-900">
                          {section.title}
                          <ChevronDown className="size-5 shrink-0 text-ln-gray-500 transition ease-linear group-data-[state=closed]:-rotate-180" />
                        </h4>
                      )}
                    </Accordion.Trigger>
                    <Accordion.Content className="overflow-hidden">
                      {section.items && (
                        <div className={custom ? 'pt-0.5' : 'pt-4'}>
                          <div className={cx('flex w-full flex-col', custom ? 'gap-px' : 'gap-4')}>
                            {section.items.map((it) => (
                              <ItemLink key={it.slug} system={registry.id} item={it} title={titleOf(it)} active={it.slug === slug} />
                            ))}
                          </div>
                        </div>
                      )}
                      {section.groups && (
                        <div className={custom ? 'pt-0.5' : 'pt-6'}>
                          <div className={cx('relative flex flex-col', custom ? 'gap-1' : 'gap-6')}>
                            {section.groups.map((g) => (
                              <div key={g.title} className={cx('flex w-full flex-col', custom ? 'gap-px' : 'gap-4')}>
                                {chrome.NavGroupLabel ? <chrome.NavGroupLabel title={g.title} /> : <div className="text-ln-label-sm text-ln-gray-900">{g.title}</div>}
                                <div className={cx('flex flex-col', custom ? 'gap-px' : 'gap-4', chrome.groupRail === false ? '' : 'border-l border-ln-gray-100 pl-5')}>
                                  {g.items.map((it) => (
                                    <ItemLink key={it.slug} nested system={registry.id} item={it} title={titleOf(it)} active={it.slug === slug} />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Accordion.Content>
                  </Accordion.Item>
                </div>
              ))}
            </Accordion.Root>
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" className="flex w-[3px] touch-none select-none">
          <ScrollArea.Thumb className="relative flex-1 bg-[var(--ln-scroll-thumb)]" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </aside>
  );
}
