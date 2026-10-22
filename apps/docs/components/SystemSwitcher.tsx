'use client';
import { useRouter } from 'next/navigation';
import { DropdownMenu } from 'radix-ui';
import type { DocsRegistry } from '@/lib/types';
import { homeSlug, pageHref } from '@/lib/nav';
import { ChevronDown, ChevronRight } from './icons';
import { cx } from '@/lib/cx';

/** Sits where AlignUI shows its version label; lists every registered design system. */
export function SystemSwitcher({ current, systems }: { current: DocsRegistry; systems: DocsRegistry[] }) {
  const router = useRouter();
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        className={cx(
          'group flex cursor-pointer items-center gap-0.5 rounded-docs-md bg-ln-gray-50 py-1 pl-2 pr-1.5 text-ln-label-xs text-ln-gray-600 shadow-ln-badge',
          'transition-colors duration-200 hover:bg-ln-hover hover:text-ln-gray-700 focus:outline-none',
          'data-[state=open]:bg-ln-orange/12 data-[state=open]:text-ln-gray-700 data-[state=open]:shadow-ln-badge-orange',
        )}
      >
        {current.name}
        <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-ln-orange" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-50 min-w-[256px] overflow-hidden rounded-docs-xl bg-ln-gray-0 p-1.5 shadow-ln-xs ring-1 ring-ln-gray-200 ring-inset data-[state=open]:animate-fade-in"
        >
          <div className="space-y-1">
            {systems.map((s) => {
              const active = s.id === current.id;
              return (
                <DropdownMenu.Item
                  key={s.id}
                  onSelect={() => router.push(pageHref(s.id, homeSlug(s)))}
                  className={cx(
                    'relative flex cursor-pointer select-none items-start justify-between rounded-docs-xl px-[14px] py-[10px] outline-none transition-colors duration-150 hover:bg-ln-hover focus:bg-ln-gray-25',
                    active && 'bg-ln-gray-25',
                  )}
                >
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-ln-label-sm font-semibold text-ln-gray-900">{s.name}</span>
                      {s.badge && (
                        <span
                          className={cx(
                            'flex h-4 items-center justify-center rounded-docs-sm px-[5px] text-[11px] font-[550]',
                            active ? 'bg-ln-orange/12 text-ln-orange shadow-ln-badge-orange' : 'bg-ln-gray-50 text-ln-gray-500 shadow-ln-badge',
                          )}
                        >
                          {s.badge}
                        </span>
                      )}
                    </div>
                    {s.tagline && (
                      <div className="mt-1 flex">
                        <span className="text-ln-paragraph-xs text-ln-gray-600">{s.tagline}</span>
                      </div>
                    )}
                  </div>
                  {active && <ChevronRight className="absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-ln-gray-400" />}
                </DropdownMenu.Item>
              );
            })}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
