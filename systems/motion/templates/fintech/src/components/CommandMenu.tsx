// Global search (⌘K): jump to a page, a payee or a transaction.
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { CommandPaletteDialog, type CommandGroup } from '@krackedui/motion';
import { navigate, type Route } from '../lib/router';
import { navItems } from '../lib/navigation';
import { formatMoney, formatShortDate } from '../lib/format';
import { payees } from '../data/payees';
import { useStore } from '../state/store';

const CommandMenuContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

export function useCommandMenu() {
  const ctx = useContext(CommandMenuContext);
  if (!ctx) throw new Error('useCommandMenu() must be used inside <CommandMenuProvider>.');
  return ctx;
}

/** Holds the palette's open state and renders the palette once for the whole app. */
export function CommandMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { state } = useStore();
  const value = useMemo(() => ({ open, setOpen }), [open]);

  const { groups, targets } = useMemo(() => {
    const routes = new Map<string, Route>();
    const pages: CommandGroup = {
      label: 'Pages',
      items: navItems.map((n) => {
        routes.set(`page:${n.label}`, n.route);
        return { id: `page:${n.label}`, title: n.label, icon: n.icon, keywords: n.keywords };
      }),
    };
    const payeeGroup: CommandGroup = {
      label: 'Payees',
      items: payees.map((p) => {
        routes.set(`payee:${p.id}`, { page: 'payments' });
        return { id: `payee:${p.id}`, title: p.name, icon: 'person', keywords: `${p.category} ${p.destination} pay`, path: ['Payments'] };
      }),
    };
    const txGroup: CommandGroup = {
      label: 'Transactions',
      items: state.transactions.map((t) => {
        routes.set(`txn:${t.id}`, { page: 'transactions', txn: t.id });
        return {
          id: `txn:${t.id}`,
          title: `${t.merchant} · ${formatMoney(t.amount)}`,
          icon: 'receipt',
          keywords: `${t.category} ${t.status} ${t.date} ${t.id}`,
          path: [formatShortDate(t.date)],
        };
      }),
    };
    return { groups: [pages, payeeGroup, txGroup], targets: routes };
  }, [state.transactions]);

  return (
    <CommandMenuContext.Provider value={value}>
      {children}
      <CommandPaletteDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        placeholder="Search pages, payees and transactions…"
        groups={groups}
        onSelect={(item) => {
          const route = targets.get(item.id);
          if (route) navigate(route);
        }}
      />
    </CommandMenuContext.Provider>
  );
}
