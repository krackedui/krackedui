# Fintech dashboard: a Motion template

A finance dashboard for a small business ("Lumen Coffee Co."): balances, cash flow, transactions,
company cards, vendor payments, budgets and settings. Built only with
[`@krackedui/motion`](https://motion.krackedui.com), React and Tailwind layout utilities.

Live: https://motion.krackedui.com/fintech

## Run it

```bash
npm create krackedui@latest my-finance-app -- --system motion --template fintech
cd my-finance-app
npm install
npm run dev        # http://localhost:5173
npm run build      # static files in dist/, servable from any sub-path
npm run typecheck
```

## What's inside

| Route | Screen |
|---|---|
| `#/` | Overview: KPIs with sparklines, cash-flow bars (6/12 months), balance line, spend donut, recent transactions, alerts |
| `#/transactions` | Filters (date range presets, category, status, amount, search), sortable/selectable table, 25 per page, CSV export, bulk categorize, detail sheet (category, note, receipt upload) |
| `#/accounts`, `#/accounts/:id` | Account cards with sparklines; account detail with balance chart and its transactions |
| `#/cards` | Spend vs limit, freeze/unfreeze with confirmation, "Issue card" dialog form |
| `#/payments` | Three-step "New payment" form with validation, scheduled payments with cancel |
| `#/budgets` | Spent vs limit per category (warning from 80%, danger over 100%), inline limit editing, spend vs budget chart |
| `#/settings` | Company profile, team roles, notification switches, integrations |

Global: sidebar with company switcher, breadcrumbs, ⌘K search (pages, payees, transactions), date-range
context, notifications, theme menu (System / Light / Dark, remembered in `localStorage`), user menu.

## Folder structure

```
src/
  main.tsx, index.css     entry; Tailwind + @krackedui/motion/tailwind.css
  App.tsx                 Theme, providers, AppFrame shell, route → page
  pages/                  one file per screen
  components/             compositions of Motion components (KpiCard, Panel, TransactionSheet, NewPaymentForm…)
  data/                   typed, deterministic sample data (accounts, transactions, cards, budgets, payees, team)
  state/                  app state (one reducer in store.tsx) and UI preferences (theme, date range)
  lib/                    router (hash routes), formatting, filters, CSV export, alerts
routes.json               every route the KrackedUI gate audits (a11y + responsive, light and dark)
```

## Adapt it

- **Your data.** Replace the files in `src/data/` (keep the types in `data/types.ts`) or load from your API
  in `state/store.tsx`. "Today" is fixed in `data/company.ts` so the sample is deterministic; use `new Date()`
  with real data.
- **Your currency.** Formatting lives in `lib/format.ts` (`Intl.NumberFormat`); the `NumberInput`s take the
  same `format` options.
- **A new page.** Add a variant to `Route` and `parseRoute` in `lib/router.ts`, an entry in
  `lib/navigation.ts` (sidebar + ⌘K), a file in `src/pages/` that renders `<Page title=…>`, a case in
  `App.tsx`, and the route in `routes.json`.
- **Look and feel.** Colors, type and spacing come from Motion tokens (`bg-n-*`, `text-n-*`,
  `border-n-*`); don't hard-code colors. Light and dark follow the OS until the user picks one.

Docs for every component used here: https://motion.krackedui.com
