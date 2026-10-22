import { AppFrame, Theme, ToastProvider } from '@krackedui/motion';
import { useRoute } from './lib/router';
import { StoreProvider } from './state/store';
import { PreferencesProvider, usePreferences } from './state/preferences';
import { AppSidebar } from './components/AppSidebar';
import { AppTopbar } from './components/AppTopbar';
import { CommandMenuProvider } from './components/CommandMenu';
import { OverviewPage } from './pages/OverviewPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AccountsPage } from './pages/AccountsPage';
import { AccountDetailPage } from './pages/AccountDetailPage';
import { CardsPage } from './pages/CardsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

function CurrentPage() {
  const route = useRoute();
  switch (route.page) {
    case 'overview': return <OverviewPage />;
    case 'transactions': return <TransactionsPage openId={route.txn} />;
    case 'accounts': return <AccountsPage />;
    case 'account': return <AccountDetailPage id={route.id} />;
    case 'cards': return <CardsPage />;
    case 'payments': return <PaymentsPage />;
    case 'budgets': return <BudgetsPage />;
    case 'settings': return <SettingsPage tab={route.tab} />;
    case 'not-found': return <NotFoundPage path={route.path} />;
  }
}

function Shell() {
  const { theme } = usePreferences();
  return (
    <Theme appearance={theme} className="h-full">
      <ToastProvider>
        <CommandMenuProvider>
          <AppFrame sidebar={<AppSidebar />} topbar={<AppTopbar />}>
            <CurrentPage />
          </AppFrame>
        </CommandMenuProvider>
      </ToastProvider>
    </Theme>
  );
}

export function App() {
  return (
    <PreferencesProvider>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </PreferencesProvider>
  );
}
