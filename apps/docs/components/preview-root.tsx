'use client';
import { createContext, useContext, type ReactNode } from 'react';
import { useTheme } from './theme';

const Ctx = createContext('');

/** Class list that scopes the active design system's tokens (e.g. "motion-root dark"). */
export function PreviewRootProvider({ className, children }: { className?: string; children: ReactNode }) {
  const { theme } = useTheme();
  return <Ctx.Provider value={[className, theme === 'dark' && 'dark'].filter(Boolean).join(' ')}>{children}</Ctx.Provider>;
}
export const usePreviewRoot = () => useContext(Ctx);
