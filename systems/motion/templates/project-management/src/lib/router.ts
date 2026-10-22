import { useSyncExternalStore } from 'react';

/** Every screen of the app. Hash routes (#/…) keep the build working from any base path. */
export type Route =
  | { name: 'home' }
  | { name: 'projects' }
  | { name: 'project'; slug: string }
  | { name: 'task'; id: string }
  | { name: 'timeline' }
  | { name: 'team' }
  | { name: 'settings' }
  | { name: 'not-found'; path: string };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/';
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  if (parts.length === 0) return { name: 'home' };
  const [head, id] = parts;
  if (head === 'projects' && !id) return { name: 'projects' };
  if (head === 'projects' && id && parts.length === 2) return { name: 'project', slug: id };
  if (head === 'tasks' && id && parts.length === 2) return { name: 'task', id };
  if (parts.length === 1 && (head === 'timeline' || head === 'team' || head === 'settings')) return { name: head };
  return { name: 'not-found', path };
}

/** The href of a route ("#/projects/website"). */
export function href(route: Route): string {
  switch (route.name) {
    case 'home': return '#/';
    case 'project': return `#/projects/${route.slug}`;
    case 'task': return `#/tasks/${route.id}`;
    case 'not-found': return `#${route.path}`;
    default: return `#/${route.name}`;
  }
}

export function navigate(route: Route): void {
  window.location.hash = href(route).slice(1);
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/** The current route; re-renders on hash changes. */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => '');
  return parseRoute(hash);
}
