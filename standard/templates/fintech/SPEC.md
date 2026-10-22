# Template: Fintech dashboard

A small business's finance dashboard: balances, cash flow, transactions, cards, payments and budgets.

## Data (src/data/)
- Company "Lumen Coffee Co.", currency USD (format with Intl.NumberFormat; negative amounts with a minus
  sign and danger tone; tabular numbers everywhere).
- 3 accounts: Operating (checking), Reserve (savings), Payroll — balance, last 4 digits, institution.
- 12 months of monthly revenue/expenses/net (deterministic), 90 days of daily balance.
- ~150 transactions over 90 days: id, date, merchant, category (Payroll, Rent, Supplies, Software,
  Marketing, Travel, Revenue, Taxes…), amount (+/-), account, status (Posted, Pending, Failed),
  method (Card •• 4242, ACH, Wire), note, receipt (yes/no).
- 4 cards: holder, last 4, limit, spent this month, status (Active, Frozen).
- 5 budgets by category: limit, spent.
- 6 payees (vendors) for payments.

## Screens (routes)
| Route | Screen | Must include |
|---|---|---|
| `#/` | **Overview** | KPI stats (total balance, money in, money out, net — each with delta vs last month and a sparkline), cash-flow chart (bar: in vs out by month; toggle 6/12 months with a SegmentedControl), balance line chart, spend-by-category donut with legend, recent transactions (5) with "View all", alerts (e.g. low balance warning) |
| `#/transactions` | **Transactions** | filter bar: DateRangePicker with presets (7/30/90 days, this month), category Combobox, status Select, amount range (NumberInput min/max), search; DataTable (date, merchant, category tag, account, status badge, amount right-aligned) with sorting, selection, pagination (25/page), row click opens a detail **Sheet** (all fields, receipt upload with FileUpload, note editing, category change); bulk "Export CSV" (generate and download a CSV client-side) and "Categorize"; columns hide on small screens (hideBelow); empty state for no results |
| `#/accounts` | **Accounts** | account cards with balance and sparkline; account detail with balance chart and its transactions |
| `#/cards` | **Cards** | card list with spend vs limit Progress, freeze/unfreeze Switch with ConfirmDialog, "Issue card" Dialog form (holder Combobox, limit NumberInput currency, validation) |
| `#/payments` | **Payments** | "New payment" multi-step form (payee → amount + account + date → review → confirm) with validation and a success state; scheduled payments table; ConfirmDialog for cancel |
| `#/budgets` | **Budgets** | budget per category: spent/limit Progress with tone (warning ≥ 80%, danger > 100%), BarChart of spend vs budget, edit limit inline |
| `#/settings` | **Settings** | tabs: Company profile (Field forms), Team access (DataTable + roles Select), Notifications (Switches), Integrations (Cards with connect buttons) |

App frame: sidebar (company switcher, Overview, Transactions, Accounts, Cards, Payments, Budgets,
Settings), top bar with breadcrumbs, global search (⌘K: jump to transaction/payee/page), date range
context, theme toggle, notifications popover, user menu.

## Flows the template must support
1. Filter transactions to "last 30 days, Software, Posted", sort by amount, open one, change its
   category, upload a receipt, see the row update and a success toast.
2. Select 5 transactions and export CSV.
3. Make a payment through all steps with validation errors shown on the way (empty amount, amount over
   balance) and a final confirmation.
4. Freeze a card (confirm), unfreeze it.
5. Edit a budget limit; Progress and chart update; tone changes when over budget.
6. Keyboard-only: complete flow 1 without a mouse.
7. Loading (skeletons on first load of Overview, 400 ms) and empty states (no transactions for a filter).

## Components exercised (minimum)
AppFrame, Sidebar, Topbar, Breadcrumbs, CommandPaletteDialog, PageHeader, Stat, Card, Grid, Stack,
Badge, Tag, Alert, LineChart, BarChart, DonutChart, Sparkline, Progress, DataTable, Pagination,
SegmentedControl, Tabs, Menu, Popover, Dialog, ConfirmDialog, Sheet, Field, TextInput, NumberInput,
Select, Combobox, DatePicker, DateRangePicker, FileUpload, Switch, Checkbox, Toast, EmptyState,
Skeleton, Tooltip.
