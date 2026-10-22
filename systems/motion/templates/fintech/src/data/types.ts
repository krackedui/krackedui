// Domain types for the finance dashboard. Amounts are in US dollars (positive = money in).

export type AccountId = 'operating' | 'reserve' | 'payroll';

export interface Account {
  id: AccountId;
  name: string;
  kind: 'Checking' | 'Savings';
  institution: string;
  last4: string;
  balance: number;
}

export type Category =
  | 'Revenue'
  | 'Payroll'
  | 'Rent'
  | 'Supplies'
  | 'Software'
  | 'Marketing'
  | 'Travel'
  | 'Utilities'
  | 'Taxes';

export type TransactionStatus = 'Posted' | 'Pending' | 'Failed';
export type PaymentMethod = 'Card •• 4242' | 'ACH' | 'Wire';

export interface Transaction {
  id: string;
  /** ISO date, yyyy-mm-dd. */
  date: string;
  merchant: string;
  category: Category;
  amount: number;
  account: AccountId;
  status: TransactionStatus;
  method: PaymentMethod;
  note: string;
  /** File name of the attached receipt, or null. */
  receipt: string | null;
}

export interface MonthFlow {
  /** Short month label, e.g. "Oct". */
  month: string;
  moneyIn: number;
  moneyOut: number;
}

export interface CompanyCard {
  id: string;
  holder: string;
  last4: string;
  limit: number;
  spent: number;
  status: 'Active' | 'Frozen';
}

export interface Budget {
  category: Category;
  limit: number;
  spent: number;
}

export interface Payee {
  id: string;
  name: string;
  category: Category;
  method: PaymentMethod;
  /** Masked destination, e.g. "ACH •• 3391". */
  destination: string;
}

export interface ScheduledPayment {
  id: string;
  payeeId: string;
  amount: number;
  account: AccountId;
  /** ISO date, yyyy-mm-dd. */
  date: string;
  memo: string;
}

export type Role = 'Owner' | 'Admin' | 'Bookkeeper' | 'Viewer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  lastActive: string;
}
