'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { DocsRegistry } from '@/lib/types';

const RegistryCtx = createContext<DocsRegistry | null>(null);
export function RegistryProvider({ registry, children }: { registry: DocsRegistry; children: ReactNode }) {
  return <RegistryCtx.Provider value={registry}>{children}</RegistryCtx.Provider>;
}
/** The registry of the system being documented (package name, exports, chrome). */
export const useRegistry = () => useContext(RegistryCtx);
