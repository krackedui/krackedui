# Project management template (Motion)

A small team's project tool built with [`@krackedui/motion`](https://motion.krackedui.com): plan work,
track it on a board, see who is doing what. It is a complete starter: every screen works with local
sample data, at 320–1440 px, in light and dark, with the keyboard only.

Live: https://motion.krackedui.com/project-management

## Run it

```bash
npm create @krackedui my-app -- --system motion --template project-management
cd my-app
npm install
npm run dev        # http://localhost:5173
npm run build      # static build in dist/ (works from any sub-path)
npm run typecheck
```

## Screens

| Route | Screen |
|---|---|
| `#/` | My work: greeting, stats, my tasks by status, upcoming deadlines, recent activity |
| `#/projects` | Projects: cards with lead, status, progress and target date; status filter; "New project" dialog |
| `#/projects/<slug>` | Board: columns by status, drag and drop (or the card's "…" → "Move to…" with the keyboard), quick add, filters and search, list view with sorting, selection and bulk actions |
| `#/tasks/<id>` | Task detail: side sheet over the board on desktop, full page on phones |
| `#/timeline` | Timeline: projects and tasks on a week or month scale with a today marker |
| `#/team` | Team: members with their workload, invite dialog |
| `#/settings` | Settings: general, notifications, members (roles), danger zone |

Press <kbd>⌘K</kbd> (<kbd>Ctrl K</kbd>) anywhere to jump to a task or project or to create one.
The theme follows the system setting; the sun/moon menu in the top bar overrides it (remembered locally).

## Folder structure

```
src/
  main.tsx, index.css   entry; Tailwind + Motion's tailwind.css (tokens as utilities)
  App.tsx               Theme, ToastProvider, AppFrame (sidebar + top bar), routes, global dialogs
  lib/router.ts         tiny typed hash router (no dependency)
  lib/dates.ts          date helpers; "today" is fixed in data/workspace.ts
  lib/selectors.ts      filtering and progress helpers
  data/                 typed, deterministic sample data (workspace, members, projects, tasks, activity)
  state/store.tsx       app state and actions (React context, no state library)
  state/useTaskActions  moves, bulk edits and deletes that confirm with an undoable toast
  components/           compositions of Motion components (TaskCard, KanbanBoard, TaskDetail, …)
  pages/                one file per screen
```

## Adapt it

- **Your data:** replace the arrays in `src/data/` (the types are in `src/data/types.ts`). To load from an
  API, fetch in `StoreProvider` (`src/state/store.tsx`) and keep the same actions.
- **"Today":** `TODAY` in `src/data/workspace.ts` keeps the sample dates stable. Use the real date with your data.
- **A new page:** add a route to `Route`/`parseRoute` in `src/lib/router.ts`, a file in `src/pages/`, a case
  in `Screen` and `crumbsFor` (`src/App.tsx`), a sidebar item in `components/AppSidebar.tsx`, and the hash to
  `routes.json`.
- **Statuses, priorities, labels:** `src/data/types.ts` (values) and `src/data/meta.ts` (colors and icons).
- **Look:** use Motion components and tokens (`bg-n-*`, `text-n-*`, `border-n-*`); never raw colors.

Docs for every component: https://motion.krackedui.com
