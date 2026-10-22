'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export type Appearance = 'light' | 'dark';

export interface ThemeProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  children?: ReactNode;
  /** `system` follows the OS setting. Bayrust is dark by default. */
  appearance?: Appearance | 'system';
}

interface ThemeValue {
  /** The appearance actually in effect — never `system`. */
  appearance: Appearance;
}

const ThemeContext = createContext<ThemeValue | null>(null);

/** The appearance in effect. Throws outside a `<Theme>`, per SPEC §3.8. */
export function useAppearance(): Appearance {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppearance must be used inside <Theme> — wrap your app in <Theme> from @krackedui/bayrust.');
  return ctx.appearance;
}

const QUERY = '(prefers-color-scheme: light)';

/**
 * Root that applies Bayrust's fonts, tokens and appearance.
 *
 * Put one near the top of the app. Styles only apply inside it, so the host app is never restyled.
 * Nested roots are allowed: a panel can set its own appearance.
 */
export function Theme({ appearance = 'dark', className, style, id, children }: ThemeProps) {
  // `system` is resolved after mount: reading matchMedia during render would differ between the
  // server and the first client paint. Until then it renders dark, the system's default.
  const [systemAppearance, setSystemAppearance] = useState<Appearance>('dark');
  useEffect(() => {
    if (appearance !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(QUERY);
    const sync = () => setSystemAppearance(mq.matches ? 'light' : 'dark');
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [appearance]);

  const resolved: Appearance = appearance === 'system' ? systemAppearance : appearance;
  const value = useMemo(() => ({ appearance: resolved }), [resolved]);

  return (
    <ThemeContext.Provider value={value}>
      <div id={id} className={cn('bay', className)} style={style} data-theme={`bayrust-${resolved}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
