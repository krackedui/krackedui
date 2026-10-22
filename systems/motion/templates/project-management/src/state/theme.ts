import { useCallback, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
const KEY = 'northwind-theme';

function read(): ThemePreference {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

/** The theme choice (system by default), remembered in localStorage when it is available. */
export function useThemePreference(): [ThemePreference, (next: ThemePreference) => void] {
  const [pref, setPref] = useState<ThemePreference>(read);
  const update = useCallback((next: ThemePreference) => {
    setPref(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // storage unavailable (private mode): the choice lasts for this visit
    }
  }, []);
  return [pref, update];
}
