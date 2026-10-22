// A tiny typed hash router: "#/accounts/operating?tab=x" → { page: 'account', params: { id }, query }.
// Hash routes keep the build working from any base path without server rewrites.
import { useSyncExternalStore } from 'react';

export type Route =
  | { page: 'overview' }
  | { page: 'transactions'; txn?: string }
  | { page: 'accounts' }
  | { page: 'account'; id: string }
  | { page: 'cards' }
  | { page: 'payments' }
  | { page: 'budgets' }
  | { page: 'settings'; tab?: string }
  | { page: 'not-found'; path: string };

export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#/, '') || '/';
  const [path, search = ''] = raw.split('?');
  const query = new URLSearchParams(search);
  const parts = path.split('/').filter(Boolean);
  switch (parts[0]) {
    case undefined: return { page: 'overview' };
    case 'transactions': return { page: 'transactions', txn: query.get('txn') ?? undefined };
    case 'accounts': return parts[1] ? { page: 'account', id: parts[1] } : { page: 'accounts' };
    case 'cards': return { page: 'cards' };
    case 'payments': return { page: 'payments' };
    case 'budgets': return { page: 'budgets' };
    case 'settings': return { page: 'settings', tab: query.get('tab') ?? undefined };
    default: return { page: 'not-found', path };
  }
}

/** The href of a route ("#/accounts/reserve"). */
export function href(route: Route): string {
  switch (route.page) {
    case 'overview': return '#/';
    case 'transactions': return route.txn ? `#/transactions?txn=${encodeURIComponent(route.txn)}` : '#/transactions';
    case 'account': return `#/accounts/${encodeURIComponent(route.id)}`;
    case 'settings': return route.tab ? `#/settings?tab=${encodeURIComponent(route.tab)}` : '#/settings';
    case 'not-found': return `#${route.path}`;
    default: return `#/${route.page}`;
  }
}

export function navigate(route: Route): void {
  window.location.hash = href(route).slice(1);
}

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};
const getHash = () => window.location.hash;

/** The current route; re-renders on hash changes. */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash, () => '');
  return parseRoute(hash);
}
