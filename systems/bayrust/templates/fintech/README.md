# Bayrust · Fintech dashboard

A small business's finance dashboard — balances, cash flow, transactions, cards, payments and
budgets — built only from `@krackedui/bayrust`.

```bash
npm install
npm run dev      # http://localhost:3101
npm run build
npm run preview
```

## What is here

Seven screens, hash-routed so the build works from any base path: Overview, Transactions, Accounts,
Cards, Payments, Budgets and Settings. Every route is listed in `routes.json`, which is what the
gate loads.

All the data is in `src/data/index.ts` and is generated deterministically from a fixed seed and a
fixed "today" (23 October 2026). The same numbers appear on every machine and every run, so a
screenshot taken today still matches next week, and "last 30 days" never drifts. There are no
network calls.

## Adapting it

- Replace `src/data/index.ts` with your own source. The screens only read the types in that file.
- `src/format.ts` holds the money and date formatting, so currency and locale change in one place.
- `src/router.ts` is twenty lines of hash routing. Swap it for your router; the screens are plain
  components and do not know about it beyond the `go()` helper.
- The theme follows the operating system (`<Theme appearance="system">` in `src/App.tsx`).

## Rules this template follows

Everything is imported from `@krackedui/bayrust` — no deep imports, no second UI library, no
component code copied out of the system. Where a screen needed something Bayrust did not have, the
component was added to Bayrust and used from there; the list is in `../../REPORT.md` under "Gaps
found by templates".
