'use client';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';
const KEY = 'docs-theme';

/** Runs before paint (in <head>) so the first frame already has the right theme class. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${KEY}');var q=new URLSearchParams(location.search).get('theme');if(q==='dark'||q==='light')t=q;var d=document.documentElement;d.classList.remove('light','dark');d.classList.add(t==='dark'?'dark':'light');}catch(e){}})();`;

const Ctx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);
  const toggle = useCallback(() => {
    setTheme((t) => {
      const next: Theme = t === 'dark' ? 'light' : 'dark';
      const d = document.documentElement;
      d.classList.remove('light', 'dark');
      d.classList.add(next);
      try { localStorage.setItem(KEY, next); } catch {}
      return next;
    });
  }, []);
  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
