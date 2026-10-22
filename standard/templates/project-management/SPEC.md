# Template: Project management

A small team's project tool: plan work, track it on a board, see who is doing what.

## Data (src/data/)
- 1 workspace "Northwind Studio", 8 members (name, role, avatar initials, email).
- 3 projects: "Website relaunch", "Mobile app v2", "Brand refresh" — each with status, lead, start/target
  dates, progress %.
- ~40 tasks across projects: id (e.g. WEB-12), title, description (a few paragraphs), status
  (Backlog, To do, In progress, In review, Done), priority (Urgent, High, Medium, Low, None),
  assignee, labels (Design, Frontend, Backend, Bug, Research…), due date, estimate (points),
  created/updated dates, comments (author, date, text), subtasks (title, done).
- Activity feed: ~20 events (created, moved, commented, assigned) with timestamps.

## Screens (routes)
| Route | Screen | Must include |
|---|---|---|
| `#/` | **My work** | greeting, stat row (assigned, due this week, overdue, done this week), list of my tasks grouped by status with priority + due date, upcoming deadlines, recent activity |
| `#/projects` | **Projects** | project cards or table: lead avatar, status badge, progress bar, target date; filter by status; "New project" dialog (form with validation) |
| `#/projects/website` | **Board** | Kanban columns by status with task cards (id, title, labels, assignee, priority icon, due date); drag a card between columns and reorder (keyboard alternative: a "Move to…" menu); column counts; quick add in a column; filter bar (assignee, label, priority) + search; toggle to **list view** (DataTable with sorting, selection, bulk actions: change status/assignee, delete with confirm) |
| `#/tasks/WEB-12` | **Task detail** | opens as a side sheet over the board on desktop, full page on phones: editable title, status/priority/assignee/labels/due-date pickers, description, subtasks with checkboxes and progress, comments thread with a composer, activity |
| `#/timeline` | **Timeline** | tasks or projects on a horizontal time scale by week/month (scrolls horizontally inside its container), today marker |
| `#/team` | **Team** | members table with workload (task counts, Progress), role, invite member dialog |
| `#/settings` | **Settings** | tabs: General (workspace name, icon), Notifications (switches), Members (roles via Select), Danger zone (delete with ConfirmDialog) |

App frame: sidebar (workspace switcher, My work, Projects with each project nested, Timeline, Team,
Settings), top bar with breadcrumbs, search (⌘K command palette: jump to task/project, create task),
theme toggle, notifications popover.

## Flows the template must support
1. Create a task from the board (quick add) and from ⌘K; it appears in the right column.
2. Move a task to "Done" by drag and by keyboard; a toast confirms with Undo.
3. Edit a task's assignee and due date in the detail sheet; the board card updates.
4. Bulk select tasks in list view, change their status, see a toast.
5. Filter the board to one assignee and label; clear filters.
6. Empty states: a project with no tasks; search with no results.
7. Loading state: skeletons on first render of the board (simulated 400 ms).

## Components exercised (minimum)
AppFrame, Sidebar, Topbar, Breadcrumbs, CommandPaletteDialog, PageHeader, Stat, Card, Badge, Tag,
Avatar, AvatarGroup, Progress, DataTable, Pagination, Tabs, SegmentedControl, Menu, ContextMenu,
Popover, Dialog, ConfirmDialog, Sheet, Field, TextInput, Textarea, Select, Combobox, DatePicker,
Checkbox, Switch, Toast, EmptyState, Skeleton, Tooltip, Kbd. Systems with a database module may use
their own board/timeline views if they meet the same flows.
