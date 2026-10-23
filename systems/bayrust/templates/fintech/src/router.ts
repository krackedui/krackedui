import { useEffect, useState } from 'react';

/** Hash routing, so the build works from any base path without a server rewrite. */
export function useRoute(): string {
  const read = () => window.location.hash.replace(/^#/, '') || '/';
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const sync = () => setRoute(read());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  return route;
}

export const go = (path: string) => {
  window.location.hash = path;
};
