'use client';
import { ListIcon } from './icons';

export interface TocEntry { id: string; title: string; children?: TocEntry[] }

export function Toc({ entries }: { entries: TocEntry[] }) {
  return (
    <div className="mt-8 hidden border-l border-ln-gray-100 xl:block">
      <div className="sticky top-8 px-6">
        <div className="flex items-center gap-1.5 text-[11px]/[12px] font-[550] text-ln-gray-450">
          <ListIcon className="size-3" />
          ON THIS PAGE
        </div>
        <nav className="relative mt-4">
          <ul className="space-y-4">
            {entries.map((e) => (
              <li key={e.id} className="flex flex-col space-y-4">
                <a href={`#${e.id}`} className="block text-balance text-ln-label-sm text-ln-gray-700 transition ease-linear hover:text-ln-gray-900">{e.title}</a>
                {e.children && e.children.length > 0 && (
                  <ul className="space-y-4">
                    {e.children.map((c) => (
                      <li key={c.id} className="flex flex-col space-y-4">
                        <a href={`#${c.id}`} className="block text-balance text-ln-label-sm text-ln-gray-500 transition ease-linear hover:text-ln-gray-700">{c.title}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
