import type { IconName } from '@krackedui/motion';
import type { Route } from './router';

export interface NavItem {
  route: Route;
  label: string;
  icon: IconName;
  /** Search words for the command palette. */
  keywords: string;
}

export const navItems: NavItem[] = [
  { route: { page: 'overview' }, label: 'Overview', icon: 'home', keywords: 'dashboard home balances cash flow' },
  { route: { page: 'transactions' }, label: 'Transactions', icon: 'receipt', keywords: 'activity payments spend export' },
  { route: { page: 'accounts' }, label: 'Accounts', icon: 'bank', keywords: 'bank checking savings balance' },
  { route: { page: 'cards' }, label: 'Cards', icon: 'creditCard', keywords: 'company cards freeze limit issue' },
  { route: { page: 'payments' }, label: 'Payments', icon: 'send', keywords: 'pay vendor bill transfer schedule' },
  { route: { page: 'budgets' }, label: 'Budgets', icon: 'wallet', keywords: 'limits spend categories' },
  { route: { page: 'settings' }, label: 'Settings', icon: 'gear', keywords: 'company team notifications integrations' },
];

/** The nav section a route belongs to (an account detail page is under Accounts). */
export function sectionOf(route: Route): NavItem | undefined {
  const page = route.page === 'account' ? 'accounts' : route.page;
  return navItems.find((n) => n.route.page === page);
}
