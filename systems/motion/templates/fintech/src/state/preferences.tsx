// UI preferences: theme (persisted) and the global date-range context shown in the top bar.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { addDays, startOfMonth } from '../lib/dates';
import { TODAY } from '../data/company';

export type ThemePreference = 'light' | 'dark' | 'system';
export type Period = '30d' | '90d' | 'month';

export const periodOptions: { value: Period; label: string }[] = [
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'month', label: 'This month' },
];

/** The dates a period covers, ending today. */
export function periodRange(period: Period): { from: Date; to: Date } {
  if (period === 'month') return { from: startOfMonth(TODAY), to: TODAY };
  return { from: addDays(TODAY, period === '30d' ? -29 : -89), to: TODAY };
}

const THEME_KEY = 'lumen-finance:theme';

function readTheme(): ThemePreference {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  } catch {
    return 'system';
  }
}

interface Preferences {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  period: Period;
  setPeriod: (period: Period) => void;
}

const PreferencesContext = createContext<Preferences | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemePreference>(readTheme);
  const [period, setPeriod] = useState<Period>('30d');
  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* storage unavailable: keep it in memory */ }
  }, [theme]);
  const value = useMemo(() => ({ theme, setTheme, period, setPeriod }), [theme, period]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): Preferences {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences() must be used inside <PreferencesProvider>.');
  return ctx;
}
