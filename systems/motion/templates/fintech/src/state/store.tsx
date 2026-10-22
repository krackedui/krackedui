// App state: one reducer for everything the user can change, shared through context.
import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { Budget, Category, CompanyCard, Role, ScheduledPayment, TeamMember, Transaction } from '../data/types';
import { initialTransactions } from '../data/transactions';
import { initialCards } from '../data/cards';
import { initialBudgets } from '../data/budgets';
import { initialScheduled } from '../data/payees';
import { initialTeam } from '../data/team';

export interface AppState {
  transactions: Transaction[];
  cards: CompanyCard[];
  budgets: Budget[];
  scheduled: ScheduledPayment[];
  team: TeamMember[];
}

export type Action =
  | { type: 'transaction/update'; id: string; patch: Partial<Pick<Transaction, 'category' | 'note' | 'receipt'>> }
  | { type: 'transaction/categorize'; ids: string[]; category: Category }
  | { type: 'card/status'; id: string; status: CompanyCard['status'] }
  | { type: 'card/issue'; card: CompanyCard }
  | { type: 'budget/limit'; category: Category; limit: number }
  | { type: 'payment/schedule'; payment: ScheduledPayment }
  | { type: 'payment/cancel'; id: string }
  | { type: 'team/role'; id: string; role: Role };

const initialState: AppState = {
  transactions: initialTransactions,
  cards: initialCards,
  budgets: initialBudgets,
  scheduled: initialScheduled,
  team: initialTeam,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'transaction/update':
      return { ...state, transactions: state.transactions.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)) };
    case 'transaction/categorize':
      return { ...state, transactions: state.transactions.map((t) => (action.ids.includes(t.id) ? { ...t, category: action.category } : t)) };
    case 'card/status':
      return { ...state, cards: state.cards.map((c) => (c.id === action.id ? { ...c, status: action.status } : c)) };
    case 'card/issue':
      return { ...state, cards: [...state.cards, action.card] };
    case 'budget/limit':
      return { ...state, budgets: state.budgets.map((b) => (b.category === action.category ? { ...b, limit: action.limit } : b)) };
    case 'payment/schedule':
      return { ...state, scheduled: [...state.scheduled, action.payment] };
    case 'payment/cancel':
      return { ...state, scheduled: state.scheduled.filter((p) => p.id !== action.id) };
    case 'team/role':
      return { ...state, team: state.team.map((m) => (m.id === action.id ? { ...m, role: action.role } : m)) };
  }
}

const StoreContext = createContext<{ state: AppState; dispatch: (action: Action) => void } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore() must be used inside <StoreProvider>.');
  return ctx;
}
