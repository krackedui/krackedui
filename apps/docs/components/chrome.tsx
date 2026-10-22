'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { DocsChrome } from '@/lib/types';

const ChromeCtx = createContext<DocsChrome>({});
/** Provides the documented system's chrome atoms (see DocsChrome) to the docs shell. */
export function ChromeProvider({ chrome, children }: { chrome?: DocsChrome; children: ReactNode }) {
  return <ChromeCtx.Provider value={chrome ?? {}}>{children}</ChromeCtx.Provider>;
}
export const useChrome = () => useContext(ChromeCtx);

/** Section separator in the system's style (AlignUI dashed rule by default). */
export function Separator({ className }: { className?: string }) {
  const { separator = 'dashed' } = useChrome();
  if (separator === 'none') return null;
  return separator === 'solid'
    ? <div role="separator" className={`h-px w-full bg-ln-gray-100 ${className ?? ''}`} />
    : <div role="separator" className={`docs-dashed ${className ?? ''}`} />;
}
