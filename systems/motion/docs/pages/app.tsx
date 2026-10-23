// Database and app-shell pages ("Blocks"): live previews import straight from @krackedui/motion.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  // database
  DatabaseView, DatabaseProvider, useDatabase, createTasksSample, SAMPLE_TODAY,
  TableView, GalleryView, TimelineView, ChartLockedState,
  CalendarToolbar, CardActions,
  PropertyMenu, SelectPicker, DateCellPicker, FilterMenu, SortMenu, FilterEditor, SortEditor,
  ViewSettingsPanel, ViewsMenu, NewViewMenu, PropertyList, PropertyRow, PropertyTypeIcon, PropertyValueView,
  DbMenuSearch, DbMenuItem, DbMenuRule, useMenuKeys, MenuSurface, MenuList,
  propertyTypeLabels,
  type DatabaseData, type PropertyValue, type Filter, type Sort, type SelectOption, type PropertyType,
  // shell
  AppFrame, Sidebar, Topbar, BreadcrumbTrail, TopbarButton, PageLayout, PageCover, PageHeader, PageTocRail,
  SidePeek, CenterPeek, PeekTopBar, PeekBody, PeekProperties, PeekProperty, PeekComments,
  SettingsModal, SettingsLayout, SettingsNav, SettingsNavGroup, SettingsNavItem, SettingsBadge, SettingsPage,
  SettingsSection, SettingsRow, SettingsSelect, SettingsSwitch,
  WorkspaceMenu, HelpMenu, AppsMenu, TrashMenu,
  Avatar, Button, Icon,
} from '@krackedui/motion';
import type { DocPage, InstallStep, NavGroup, NavSection, PropDef, Section } from '../../../../apps/docs/lib/types';

/* ================================================================================================
 * Shared helpers
 * ==============================================================================================*/

/** Width that fits the docs content column inside the preview padding. */
const DB_W = 640;

function install(names: string, snippet: string): InstallStep[] {
  return [
    { title: 'Install the design system package:', packages: ['@krackedui/motion'] },
    {
      title: `Import ${names} and render it inside \`.motion-root\`:`,
      file: { filename: '/app/page.tsx', lang: 'tsx', code: snippet },
    },
  ];
}

/** Composition / Accessibility / Usage sections. */
function docSections(o: { composition?: string; compositionNote?: string; a11y: string[]; usage: string[] }): Section[] {
  const out: Section[] = [];
  if (o.composition) {
    out.push({
      title: 'Composition',
      blocks: [...(o.compositionNote ? [o.compositionNote] : []), { code: { filename: 'anatomy', lang: 'tsx', code: o.composition } }],
    });
  }
  out.push({ title: 'Accessibility', blocks: [{ list: o.a11y }] });
  out.push({ title: 'Usage', blocks: [{ list: o.usage }] });
  return out;
}

const divProps: PropDef = { name: '...props', type: 'HTMLAttributes<HTMLDivElement>', description: 'Spread onto the root element.' };
const classNameProp: PropDef = { name: 'className', type: 'string', description: 'Merged onto the root with `cn`.' };

/** A full-window piece rendered at its real size, then scaled down to fit the docs column. */
function Scaled({ w = 1100, h = 640, scale: maxScale = 0.58, children }: { w?: number; h?: number; scale?: number; children: ReactNode }) {
  // responsive: scale to the available width (at most maxScale)
  const ref = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState(w * maxScale);
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setAvail(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = Math.min(maxScale, avail / w);
  return (
    <div ref={ref} className="relative overflow-hidden rounded-n-lg shadow-n-shadow-outline-sm" style={{ width: w * scale, height: h * scale }}>
      <div className="absolute left-0 top-0 origin-top-left bg-n-bg-primary" style={{ width: w, height: h, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

const scaledCode = `// Docs only: render a full-window piece at 1100x640 and scale it to fit.
function Scaled({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: '100%', maxWidth: 638, height: 371, overflow: 'hidden', position: 'relative' }}>
      <div style={{ width: 1100, height: 640, transform: 'scale(0.58)', transformOrigin: '0 0' }}>
        {children}
      </div>
    </div>
  );
}`;

/* ---------------------------------------- database helpers ---------------------------------------- */

const VIEW_ID = {
  table: 'v-table', board: 'v-board', gallery: 'v-gallery', list: 'v-list', calendar: 'v-calendar', timeline: 'v-timeline', chart: 'v-chart',
} as const;
type SampleView = keyof typeof VIEW_ID;

/** The sample database in one view, sized for the docs column. */
function Tasks({ view, data, viewProps }: { view: SampleView; data?: DatabaseData; viewProps?: Record<string, unknown> }) {
  return (
    <div className="w-full min-w-0">
      <DatabaseView data={data ?? createTasksSample()} initialViewId={VIEW_ID[view]} today={SAMPLE_TODAY} viewProps={viewProps} />
    </div>
  );
}

/** A bare view (no title / tabs / toolbar) inside its own database context. */
function ViewHost({ view, width = DB_W, children }: { view: SampleView; width?: number; children: ReactNode }) {
  const db = useDatabase(createTasksSample, VIEW_ID[view]);
  return (
    <DatabaseProvider value={db}>
      <div className="max-w-full overflow-x-auto" style={{ width }}>{children}</div>
    </DatabaseProvider>
  );
}

const sample = createTasksSample();
const prop = (id: string) => sample.collection.properties.find((p) => p.id === id)!;
const optionsOf = (id: string): SelectOption[] => {
  const p = prop(id);
  return p.type === 'select' || p.type === 'multi_select' || p.type === 'status' ? p.options : [];
};
/** Property order used by the filter/sort menu demos. */
const menuOrder = ['title', 'due', 'priority', 'status', 'team'];
const menuProperties = [...sample.collection.properties].sort((a, b) => menuOrder.indexOf(a.id) - menuOrder.indexOf(b.id));

const onOpenRowProp: PropDef = { name: 'onOpenRow', type: '(row: Row) => void', description: 'Open a page (DatabaseView passes its side peek).' };
const hoveredProp: PropDef = { name: 'hoveredRowId', type: 'string', description: 'Force the hover state on one row/card (docs, lab).' };
const todayProp: PropDef = { name: 'today', type: 'string', description: 'ISO "today" (`YYYY-MM-DD`). Defaults to the real date; the sample uses `SAMPLE_TODAY` (2026-10-15).' };

const viewHostNote =
  'Views read the database from context, so render them inside `<DatabaseView>` (which picks the active view for you) or inside your own `<DatabaseProvider value={useDatabase(...)}>`.';

/* ---------------------------------------- shell helpers ---------------------------------------- */

const placeholderPages = ['Q4 roadmap', 'Meeting notes', 'Product specs'];

function DemoSidebar({ onSettings, label }: { onSettings?: () => void; label?: string }) {
  return (
    <Sidebar.Root
      label={label}
      header={<><Sidebar.Search /><Sidebar.Tabs /></>}
      footer={<Sidebar.InviteCard />}
      bottomBar={
        <Sidebar.BottomBar>
          <WorkspaceMenu email="ada@example.com" workspaces={[{ id: 'w1', name: 'Design Team' }]} currentId="w1" onSettings={onSettings}>
            <Sidebar.WorkspaceSwitcher name="Design Team" />
          </WorkspaceMenu>
          <HelpMenu releases={[{ id: 'r1', title: 'Release 3.8', isNew: true }, { id: 'r2', title: 'Release 3.7' }]}>
            <Sidebar.BarButton icon="questionMarkCircle" label="Help, contact, more…" dot />
          </HelpMenu>
          <AppsMenu trash={[{ id: 't1', title: 'Old meeting notes', path: 'Team wiki' }]}>
            <Sidebar.BarButton icon="circleGrid2X2" label="Library, Trash, more…" />
          </AppsMenu>
        </Sidebar.BottomBar>
      }
    >
      <Sidebar.Group>
        <Sidebar.Item icon="chatBubblePlus" actions={<Sidebar.Action icon="ellipsisSmall" label="Open shortcut menu" />}>New chat</Sidebar.Item>
        <Sidebar.Item icon="bookshelf">Library</Sidebar.Item>
      </Sidebar.Group>
      <Sidebar.Sections>
        <Sidebar.Section title="Shared" actions={<Sidebar.Action icon="plusSmall" label="Add a page" />}>
          <Sidebar.Item tone="secondary" icon={<Icon name="plus" size={16} />}>Start collaborating</Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section title="Private" actions={<Sidebar.Action icon="plusSmall" label="Add a page" />}>
          <Sidebar.Tree label="Private pages">
            <Sidebar.TreeItem label="Team wiki" active defaultExpanded>
              <Sidebar.TreeItem label="Tasks" icon={<Icon name="viewTable" size={20} />} />
            </Sidebar.TreeItem>
            {placeholderPages.map((p) => <Sidebar.TreeItem key={p} label={p} />)}
          </Sidebar.Tree>
        </Sidebar.Section>
      </Sidebar.Sections>
      <Sidebar.ScrollFooter>
        <Sidebar.Item tone="muted" icon="sliders">Customize sidebar</Sidebar.Item>
      </Sidebar.ScrollFooter>
    </Sidebar.Root>
  );
}

const demoSidebarCode = `<Sidebar.Root
  header={<><Sidebar.Search /><Sidebar.Tabs /></>}
  footer={<Sidebar.InviteCard />}
  bottomBar={
    <Sidebar.BottomBar>
      <WorkspaceMenu email="ada@example.com" workspaces={[{ id: 'w1', name: 'Design Team' }]} currentId="w1">
        <Sidebar.WorkspaceSwitcher name="Design Team" />
      </WorkspaceMenu>
      <HelpMenu releases={[{ id: 'r1', title: 'Release 3.8', isNew: true }, { id: 'r2', title: 'Release 3.7' }]}>
        <Sidebar.BarButton icon="questionMarkCircle" label="Help, contact, more…" dot />
      </HelpMenu>
      <AppsMenu trash={[{ id: 't1', title: 'Old meeting notes', path: 'Team wiki' }]}>
        <Sidebar.BarButton icon="circleGrid2X2" label="Library, Trash, more…" />
      </AppsMenu>
    </Sidebar.BottomBar>
  }
>
  <Sidebar.Group>
    <Sidebar.Item icon="chatBubblePlus" actions={<Sidebar.Action icon="ellipsisSmall" label="Open shortcut menu" />}>New chat</Sidebar.Item>
    <Sidebar.Item icon="bookshelf">Library</Sidebar.Item>
  </Sidebar.Group>
  <Sidebar.Sections>
    <Sidebar.Section title="Shared" actions={<Sidebar.Action icon="plusSmall" label="Add a page" />}>
      <Sidebar.Item tone="secondary" icon={<Icon name="plus" size={16} />}>Start collaborating</Sidebar.Item>
    </Sidebar.Section>
    <Sidebar.Section title="Private" actions={<Sidebar.Action icon="plusSmall" label="Add a page" />}>
      <Sidebar.Tree label="Private pages">
        <Sidebar.TreeItem label="Team wiki" active defaultExpanded>
          <Sidebar.TreeItem label="Tasks" icon={<Icon name="viewTable" size={20} />} />
        </Sidebar.TreeItem>
        <Sidebar.TreeItem label="Q4 roadmap" />
        <Sidebar.TreeItem label="Meeting notes" />
        <Sidebar.TreeItem label="Product specs" />
      </Sidebar.Tree>
    </Sidebar.Section>
  </Sidebar.Sections>
  <Sidebar.ScrollFooter>
    <Sidebar.Item tone="muted" icon="sliders">Customize sidebar</Sidebar.Item>
  </Sidebar.ScrollFooter>
</Sidebar.Root>`;

const DemoCover = () => (
  <div className="size-full" style={{ background: 'linear-gradient(120deg, var(--n-blue-bg-accent-secondary), var(--n-purple-bg-accent-secondary, var(--n-bg-tertiary)))' }} />
);

function DemoBody() {
  return (
    <div className="flex flex-col gap-2 px-2 text-[16px] leading-6">
      <div className="pt-6 text-[30px] font-semibold leading-[39px]">Goals</div>
      <p>Ship the redesigned onboarding, the new billing page and the Q4 roadmap review.</p>
      <div className="pt-4 text-[24px] font-semibold leading-[31px]">Milestones</div>
      <p>Design review on Oct 20, beta on Nov 3, general availability on Dec 1.</p>
      <div className="h-[600px]" />
    </div>
  );
}

const demoToc = [
  { id: 'goals', label: 'Goals', level: 1 as const },
  { id: 'milestones', label: 'Milestones', level: 2 as const },
  { id: 'risks', label: 'Risks', level: 2 as const },
];

function DemoPeekBody() {
  return (
    <PeekBody
      header={<PageHeader size="peek" title="Sidebar rebuild" extraControls={null} />}
      properties={
        <PeekProperties>
          <PeekProperty icon="calendarDate15" label="Due">October 9, 2026</PeekProperty>
          <PeekProperty icon="arrowInCircleDown" label="Priority">High</PeekProperty>
          <PeekProperty icon="checkmarkCircle" label="Status" />
        </PeekProperties>
      }
      comments={<PeekComments />}
    >
      <div className="pl-2 text-n-text-tertiary">Press ‘enter’ to continue with an empty page.</div>
    </PeekBody>
  );
}

/** Docs demo app. `name` makes its landmarks unique when several demos share a page. */
function DemoApp({ peek: initialPeek = false, collapsed = false, fullWidth = false, name }: { peek?: boolean; collapsed?: boolean; fullWidth?: boolean; name?: string }) {
  const [peek, setPeek] = useState(initialPeek);
  return (
    <AppFrame
      defaultSidebarOpen={!collapsed}
      sidebar={<DemoSidebar label={name ? `Sidebar (${name})` : undefined} />}
      topbar={
        <Topbar
          breadcrumbs={<BreadcrumbTrail label={name ? `Breadcrumb (${name})` : undefined} items={[{ title: 'Team wiki' }, { title: 'Q4 roadmap', icon: '🗺️' }]} />}
          edited="Edited 2m ago"
          onShare={() => setPeek(true)}
        />
      }
      peek={<SidePeek open={peek} autoFocus={false} label={name ? `Page preview (${name})` : undefined} onClose={() => setPeek(false)}><DemoPeekBody /></SidePeek>}
    >
      <PageLayout as="div" fullWidth={fullWidth} toc={demoToc} cover={<PageCover><DemoCover /></PageCover>} header={<PageHeader title="Q4 roadmap" />}>
        <DemoBody />
      </PageLayout>
    </AppFrame>
  );
}

const indentCode = (code: string, n: number) => code.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

const demoAppCode = `import { useState } from 'react';
import {
  AppFrame, Topbar, BreadcrumbTrail, PageLayout, PageCover, PageHeader, SidePeek,
  PeekBody, PeekProperties, PeekProperty, PeekComments,
  Sidebar, WorkspaceMenu, HelpMenu, AppsMenu, Icon,
} from '@krackedui/motion';

function AppSidebar() {
  return (
${indentCode(demoSidebarCode, 4)}
  );
}

function TaskPeek() {
  return (
    <PeekBody
      header={<PageHeader size="peek" title="Sidebar rebuild" extraControls={null} />}
      properties={
        <PeekProperties>
          <PeekProperty icon="calendarDate15" label="Due">October 9, 2026</PeekProperty>
          <PeekProperty icon="arrowInCircleDown" label="Priority">High</PeekProperty>
          <PeekProperty icon="checkmarkCircle" label="Status" />
        </PeekProperties>
      }
      comments={<PeekComments />}
    >
      <div className="pl-2 text-n-text-tertiary">Press ‘enter’ to continue with an empty page.</div>
    </PeekBody>
  );
}

export function App() {
  const [peek, setPeek] = useState(false);
  return (
    <div className="motion-root h-dvh w-full">
      <AppFrame
        sidebar={<AppSidebar />}
        topbar={
          <Topbar
            breadcrumbs={<BreadcrumbTrail items={[{ title: 'Team wiki' }, { title: 'Q4 roadmap', icon: '🗺️' }]} />}
            edited="Edited 2m ago"
            onShare={() => setPeek(true)}
          />
        }
        peek={<SidePeek open={peek} onClose={() => setPeek(false)}><TaskPeek /></SidePeek>}
      >
        <PageLayout
          toc={[
            { id: 'goals', label: 'Goals', level: 1 },
            { id: 'milestones', label: 'Milestones', level: 2 },
            { id: 'risks', label: 'Risks', level: 2 },
          ]}
          cover={
            <PageCover>
              <div className="size-full" style={{ background: 'linear-gradient(120deg, var(--n-blue-bg-accent-secondary), var(--n-bg-tertiary))' }} />
            </PageCover>
          }
          header={<PageHeader title="Q4 roadmap" />}
        >
          <div className="flex flex-col gap-2 px-2 text-[16px] leading-6">
            <div id="goals" className="pt-6 text-[30px] font-semibold leading-[39px]">Goals</div>
            <p>Ship the redesigned onboarding, the new billing page and the Q4 roadmap review.</p>
            <div id="milestones" className="pt-4 text-[24px] font-semibold leading-[31px]">Milestones</div>
            <p>Design review on Oct 20, beta on Nov 3, general availability on Dec 1.</p>
          </div>
        </PageLayout>
      </AppFrame>
    </div>
  );
}`;

/* ================================================================================================
 * Database
 * ==============================================================================================*/

const databaseOverviewPage: DocPage = {
  eyebrow: 'Database',
  title: 'Database',
  description:
    'Databases as plain data plus React views: a typed collection schema, rows, saved views with filters and sorts, a state hook and seven layouts.',
  hero: {
    title: 'Database',
    render: () => <Tasks view="table" />,
    code: `import { DatabaseView, createTasksSample, SAMPLE_TODAY } from '@krackedui/motion';

export function TasksDatabase() {
  return <DatabaseView data={createTasksSample()} today={SAMPLE_TODAY} />;
}`,
  },
  sections: [
    {
      title: 'Data model',
      blocks: [
        'Everything a database renders comes from one `DatabaseData` object: `{ collection, rows, views }`.',
        {
          list: [
            '`Collection`: `{ id, name, properties: Property[] }`, the typed schema.',
            '`Property`: a discriminated union on `type`: `title`, `text`, `number` (`format`), `select` / `multi_select` (`options`), `status` (`options` with a `group`: todo / in_progress / complete), `date` (`dateFormat`), `person` (`people`), `checkbox`, `url`, `email`, `phone`, `created_time`.',
            '`Row`: `{ id, values, icon? }`. `values` is keyed by property id; dates are ISO `YYYY-MM-DD`, select/status store option ids, multi-select and person store id arrays.',
            '`View`: `{ id, name, type, filters, sorts, groupBy?, visible?, widths?, dateProperty?, order?, chart? }`. `type` is one of `table`, `board`, `gallery`, `list`, `calendar`, `timeline`, `chart`.',
            '`Filter`: `{ id, propertyId, operator, value? }` with operators `is`, `is_not`, `contains`, `does_not_contain`, `is_empty`, `is_not_empty`, `before`, `after`, `checked`, `unchecked`, `gt`, `lt`.',
            '`Sort`: `{ propertyId, direction: "ascending" | "descending" }`, applied in order.',
            '`OptionColor`: the option colors (`default`, `gray`, `brown`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `red`), mapped to token classes by `optionColors`.',
          ],
        },
        {
          code: {
            filename: '/lib/projects.ts',
            lang: 'ts',
            code: `import type { DatabaseData } from '@krackedui/motion';

export const projects: DatabaseData = {
  collection: {
    id: 'projects',
    name: 'Projects',
    properties: [
      { id: 'title', name: 'Project', type: 'title' },
      { id: 'owner', name: 'Owner', type: 'person', people: [{ id: 'ada', name: 'Ada Lovelace' }] },
      {
        id: 'stage', name: 'Stage', type: 'status', options: [
          { id: 'idea', name: 'Idea', color: 'gray', group: 'todo' },
          { id: 'build', name: 'Building', color: 'blue', group: 'in_progress' },
          { id: 'live', name: 'Live', color: 'green', group: 'complete' },
        ],
      },
      { id: 'launch', name: 'Launch', type: 'date' },
    ],
  },
  rows: [
    { id: 'p1', values: { title: 'Q4 roadmap', owner: ['ada'], stage: 'build', launch: '2026-11-03' } },
  ],
  views: [
    { id: 'all', name: 'All projects', type: 'table', filters: [], sorts: [] },
    { id: 'board', name: 'By stage', type: 'board', filters: [], sorts: [], groupBy: 'stage' },
  ],
};`,
          },
        },
      ],
    },
    {
      title: 'State: useDatabase',
      blocks: [
        '`useDatabase(initial, initialViewId?)` holds one database in React state (no persistence) and returns a `DatabaseApi`. Pass it to `<DatabaseView db={...}>` to share state between several views, or let `DatabaseView` create its own from `data`.',
        'Views, cells and menus read the API through context: `useDatabaseContext()` (throws outside a database) or `useOptionalDatabase()` (returns null, so menus can also render on their own).',
      ],
    },
    {
      title: 'Query helpers',
      blocks: [
        {
          list: [
            '`queryRows(collection, rows, view)`: filter, then sort, then the view’s manual `order`.',
            '`groupRows(collection, rows, groupBy)`: `RowGroup[]` per option (plus "No …" for empty values).',
            '`matchesFilter`, `compareRows`, `visibleProperties`, `titleProperty`, `rowTitle`, `getProperty`, `findOption`, `optionsOf`.',
            '`operatorsFor[type]` and `operatorLabels[op]` drive the filter editor; `valuesFromFilters` pre-fills new rows so they match the active filters.',
            'Dates: `parseDate`, `toISODate`, `formatDate`, `monthLabel`, `sameDay`, `monthGrid`.',
          ],
        },
      ],
    },
    {
      title: 'Sample data',
      blocks: [
        '`createTasksSample()` returns a fresh copy of the sample database "Tasks": 5 properties (Task, Status, Priority, Team, Due), 8 rows and one view of each type (`v-table`, `v-board`, `v-gallery`, `v-list`, `v-calendar`, `v-timeline`, `v-chart`). `SAMPLE_TODAY` is the sample’s reference date, 2026-10-15; pass it as `today` so calendar and timeline show the sample rows around today.',
      ],
    },
    ...docSections({
      a11y: [
        'Views render real roles: the table is `role="table"` with `row` / `columnheader` / `cell`; board columns are `role="list"` with `listitem` cards; calendar is a `grid`.',
        'View tabs are a `tablist` of `tab` buttons with `aria-selected`; keyboard focus shows a 2px + 4px blue ring.',
        'Menus are focusable surfaces: ArrowUp/ArrowDown move, Enter/Space activate (`useMenuKeys`). Popovers (Radix) close on Escape and return focus to the trigger.',
      ],
      usage: [
        'Use the database module when content is a collection of records that people sort, filter and view in several layouts (tasks, projects, CRM rows).',
        'Start from `DatabaseView` with a `DatabaseData` object; reach for the individual views and menus only when you build your own database chrome.',
        'Share one `useDatabase()` state between several views with `<DatabaseView db={…}>` so edits stay in sync.',
        'Don’t use a database for a short static list or a single record; use a plain `Table`, a list or a property list instead.',
        'Don’t persist through `useDatabase`; it holds state in memory. Save `db.data` to your backend yourself.',
      ],
    }),
  ],
  install: install('the database pieces', `import { DatabaseView, createTasksSample } from '@krackedui/motion';

<DatabaseView data={createTasksSample()} width={720} />`),
  examples: [
    {
      title: 'Shared state across views',
      description: 'One `useDatabase` instance drives two blocks: edit a status in the table and the board follows.',
      render: () => <SharedDemo />,
      code: `import { DatabaseView, useDatabase, createTasksSample, SAMPLE_TODAY } from '@krackedui/motion';

export function SharedDemo() {
  const db = useDatabase(createTasksSample);
  // Same state, but pinned to the board view.
  const boardDb = { ...db, activeViewId: 'v-board', activeView: db.data.views.find((v) => v.id === 'v-board')! };
  return (
    <div className="flex flex-col gap-8">
      <DatabaseView db={db} today={SAMPLE_TODAY} />
      <DatabaseView db={boardDb} today={SAMPLE_TODAY} hideTitle />
    </div>
  );
}`,
    },
  ],
  api: [
    {
      name: 'useDatabase',
      description: '`useDatabase(initial: DatabaseData | (() => DatabaseData), initialViewId?: string): DatabaseApi`. The returned API:',
      props: [
        { name: 'data', type: 'DatabaseData', description: 'Current collection, rows and views.' },
        { name: 'activeViewId', type: 'string', description: 'Id of the active view.' },
        { name: 'activeView', type: 'View', description: 'The active view (first view when the id is unknown).' },
        { name: 'setActiveView', type: '(id: string) => void', description: 'Switch view.' },
        { name: 'updateView', type: '(id: string, patch: Partial<View> | ((v: View) => Partial<View>)) => void', description: 'Patch a view (filters, sorts, widths, name…).' },
        { name: 'addView', type: '(type: ViewType) => View', description: 'Create and activate a view; boards group by the first status/select, calendar/timeline use the first date.' },
        { name: 'updateRow', type: '(rowId: string, propertyId: string, value: PropertyValue) => void', description: 'Set one cell.' },
        { name: 'addRow', type: "(values?: Row['values'], opts?: { viewId?: string; position?: 'start' | 'end' }) => Row", description: 'Add a page, pre-filled from the view’s filters; returns the new row.' },
        { name: 'updateProperty', type: '(id: string, patch: Partial<Property>) => void', description: 'Rename / retype / edit a property.' },
        { name: 'addOption', type: '(propertyId: string, name: string) => SelectOption', description: 'Create a select / multi-select / status option with a random color.' },
        { name: 'moveRow', type: '(viewId: string, rowId: string, beforeRowId?: string) => void', description: 'Reorder a row inside a view’s manual order.' },
      ],
    },
    {
      name: 'DatabaseProvider',
      description: 'Puts a `DatabaseApi` in context for bare views and cells. Read it with `useDatabaseContext()` or `useOptionalDatabase()`.',
      props: [
        { name: 'value', type: 'DatabaseApi', description: 'Usually the result of `useDatabase()` (required).' },
        { name: 'children', type: 'ReactNode', description: 'Views, cells, menus.' },
      ],
    },
    {
      name: 'View',
      description: 'A saved layout of the collection.',
      props: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string', description: 'Tab label.' },
        { name: 'type', type: ['"table"', '"board"', '"gallery"', '"list"', '"calendar"', '"timeline"', '"chart"'] },
        { name: 'filters', type: 'Filter[]', description: 'All must match.' },
        { name: 'sorts', type: 'Sort[]', description: 'Applied in order.' },
        { name: 'groupBy', type: 'string', description: 'Property id for board columns (and grouping in table / list).' },
        { name: 'visible', type: 'string[]', default: 'all', description: 'Property ids shown, in order. Title is always shown.' },
        { name: 'widths', type: 'Record<string, number>', default: 'title 280, others 200', description: 'Table column widths in px.' },
        { name: 'dateProperty', type: 'string', default: 'first date property', description: 'Date used by calendar and timeline.' },
        { name: 'order', type: 'string[]', description: 'Manual row order (board / list drag). Rows not listed go last.' },
        { name: 'chart', type: '{ locked?: boolean; groupBy?: string }', description: 'Chart view: the locked (upgrade) state, or a bar chart grouped by a property.' },
      ],
    },
  ],
};

function SharedDemo() {
  const db = useDatabase(createTasksSample);
  const boardDb = { ...db, activeViewId: 'v-board', activeView: db.data.views.find((v) => v.id === 'v-board')! };
  return (
    <div className="flex max-w-full flex-col gap-8 overflow-x-auto">
      <DatabaseView db={db} today={SAMPLE_TODAY} />
      <DatabaseView db={boardDb} today={SAMPLE_TODAY} hideTitle />
    </div>
  );
}

const databaseViewPage: DocPage = {
  eyebrow: 'Database',
  title: 'Database View',
  description: 'The database block: title, view tabs (with “N more…”), toolbar (filter, sort, search, settings, New) and the active layout.',
  hero: {
    title: 'Database View',
    render: () => <Tasks view="board" />,
    code: `import { DatabaseView, createTasksSample, SAMPLE_TODAY } from '@krackedui/motion';

export function Demo() {
  return <DatabaseView data={createTasksSample()} initialViewId="v-board" today={SAMPLE_TODAY} />;
}`,
  },
  sections: docSections({
    composition: `<DatabaseView>                       // owns menu + peek state, provides DatabaseApi
  title                               // collection.name, 24/31.2 600 (hideTitle to drop)
  tablist  → ViewTab × n, "N more…"   // → ViewsMenu + NewViewMenu
  toolbar  → Filter (FilterMenu) · Sort (SortMenu) · Automations · AI · Search
             · Open as full page · Settings (ViewSettingsPanel) · New ▾
  rule pills → SortEditor / FilterEditor popovers
  body     → TableView | BoardView | GalleryView | ListView | CalendarView | TimelineView | ChartView
  row peek → PropertyList (when onOpenRow is not given)
</DatabaseView>`,
    a11y: [
      'View tabs: `role="tablist"` of `role="tab"` buttons with `aria-selected`; Tab moves between them, Enter/Space switches view.',
      'Toolbar buttons are icon buttons with `aria-label` and `title` (Filter, Sort, Automations, AI Autofill, Search, Open as full page, Settings, More add options).',
      'Menus open in Radix popovers: Escape closes, focus returns to the trigger; inside, ArrowUp/ArrowDown move and Enter selects. Search field: Escape clears and closes.',
      'The row peek is a `role="dialog"` labelled by the page title; Escape closes it.',
    ],
    usage: [
      'Use `DatabaseView` to embed a full database block (title, view tabs, toolbar, layout) in a page.',
      'Pass `db` from `useDatabase()` when other parts of the page read or write the same rows; pass `data` for a self-contained block.',
      'Pass `onOpenRow` and render the shell’s `SidePeek` for the full page chrome; the built-in row peek is a minimal fallback.',
      'Use `hideTitle` when the surrounding page already shows the database name.',
      'Don’t use `DatabaseView` for a read-only grid of figures; use `Table` or `DataTable` instead.',
    ],
  }),
  install: install('`DatabaseView`', `import { DatabaseView, createTasksSample } from '@krackedui/motion';

<DatabaseView data={createTasksSample()} width={720} />`),
  examples: [
    {
      title: 'Filter menu open',
      description: '`defaultOpenMenu` opens one toolbar menu on mount (docs and lab use it to show menu states).',
      render: () => (
        <div className="max-w-full overflow-x-auto">
          <DatabaseView data={createTasksSample()} today={SAMPLE_TODAY} defaultOpenMenu="filter" />
        </div>
      ),
      code: `<DatabaseView data={createTasksSample()} today={SAMPLE_TODAY} defaultOpenMenu="filter" />`,
    },
    {
      title: 'Active filter and sort',
      description: 'A view with rules shows the rule pills under the toolbar; the toolbar icons turn blue.',
      render: () => <Tasks view="table" data={withRules()} />,
      code: `const data = createTasksSample();
data.views[0] = {
  ...data.views[0],
  filters: [{ id: 'f1', propertyId: 'status', operator: 'is_not', value: ['done'] }],
  sorts: [{ propertyId: 'due', direction: 'ascending' }],
};

<DatabaseView data={data} today={SAMPLE_TODAY} />`,
    },
    {
      title: 'Custom row opening',
      description: 'Pass `onOpenRow` to open rows in your own peek or route instead of the built-in one.',
      render: () => <OpenRowDemo />,
      code: `const [opened, setOpened] = useState<string>();

<DatabaseView
  data={createTasksSample()}
  initialViewId="v-list"
  onOpenRow={(row) => setOpened(String(row.values.title))}
/>
<p>Opened: {opened ?? 'nothing yet'}</p>`,
    },
    {
      title: 'Without title',
      description: 'Full-page databases show the page title instead: `hideTitle`.',
      render: () => (
        <div className="max-w-full overflow-x-auto">
          <DatabaseView data={createTasksSample()} initialViewId="v-gallery" hideTitle />
        </div>
      ),
      code: `<DatabaseView data={createTasksSample()} initialViewId="v-gallery" hideTitle />`,
    },
  ],
  api: [
    {
      name: 'DatabaseView',
      description: 'Pass `data` (uncontrolled) or `db` (controlled `useDatabase()` instance).',
      props: [
        { name: 'data', type: 'DatabaseData', description: 'Uncontrolled: initial data.' },
        { name: 'db', type: 'DatabaseApi', description: 'Controlled: a `useDatabase()` instance (share state across several views).' },
        { name: 'initialViewId', type: 'string', default: 'first view', description: 'View shown first (uncontrolled).' },
        { name: 'width', type: 'number', default: '720', description: 'Width of the page column the block lives in; header and tabs use it, tabs that don’t fit go into "N more…".' },
        { name: 'bleed', type: '{ left: number; right: number }', description: 'Horizontal bleed of wide views (table, board) to the page edges (for example 366px each side in a 1710px window).' },
        { ...todayProp, description: 'ISO "today" for date pickers, calendar and timeline.' },
        { name: 'onOpenRow', type: '(row: Row) => void', default: 'built-in peek', description: 'Open a page. Without it, rows open in a minimal side peek with `PropertyList`.' },
        { name: 'defaultOpenMenu', type: ['"filter"', '"sort"', '"settings"', '"views"', '"new-view"', '"new"', '"filter-add"'], description: 'Open one toolbar menu initially.' },
        { name: 'viewProps', type: 'Record<string, unknown>', description: 'Extra props forwarded to the active view (`hoveredRowId`, `selected`, `calculations`…).' },
        { name: 'hideTitle', type: 'boolean', default: 'false', description: 'Hide the database title.' },
        classNameProp,
        { name: 'style', type: 'CSSProperties', description: 'Merged after the computed width.' },
      ],
    },
  ],
};

function withRules(): DatabaseData {
  const data = createTasksSample();
  const rules: { filters: Filter[]; sorts: Sort[] } = {
    filters: [{ id: 'f1', propertyId: 'status', operator: 'is_not', value: ['done'] }],
    sorts: [{ propertyId: 'due', direction: 'ascending' }],
  };
  data.views = data.views.map((v) => (v.id === 'v-table' ? { ...v, ...rules } : v));
  return data;
}

function OpenRowDemo() {
  const [opened, setOpened] = useState<string>();
  return (
    <div className="flex max-w-full flex-col gap-3 overflow-x-auto">
      <DatabaseView data={createTasksSample()} initialViewId="v-list" onOpenRow={(row) => setOpened(String(row.values.title))} />
      <p className="pl-2 text-[14px] text-n-text-secondary">Opened: {opened ?? 'nothing yet'}</p>
    </div>
  );
}

/* ---------------------------------------------- views ---------------------------------------------- */

const tableViewPage: DocPage = {
  eyebrow: 'Database',
  title: 'Table View',
  description: 'Spreadsheet layout: resizable columns, editable cells, row selection, an OPEN button on the title and an optional calculation footer.',
  hero: {
    title: 'Table View',
    render: () => <Tasks view="table" />,
    code: `<DatabaseView data={createTasksSample()} initialViewId="v-table" today={SAMPLE_TODAY} />`,
  },
  sections: docSections({
    compositionNote: viewHostNote,
    composition: `<TableView>                        // role="table"
  header row  → checkbox gutter · columnheader × n (PropertyTypeIcon + name, resize handle) · "+" add property
                 click a header → PropertyMenu
  rows        → checkbox · PropertyCell × n (title: page icon + OPEN on hover)
  "+ New page"
  calculation footer (calculations)
</TableView>`,
    a11y: [
      '`role="table"` labelled by the view name, with `row`, `columnheader` and `cell`; column headers are focusable (`tabIndex=0`) and open the property menu.',
      'Row selection uses the `Checkbox` atom with an `aria-label` per row and a select-all checkbox.',
      'Cells: click (or Enter) to edit; select/status cells open the `SelectPicker` (ArrowUp/Down, Enter, Escape); date cells open the `DateCellPicker`; checkboxes toggle with Space.',
      'Column resize is pointer-only (drag the header edge, min 80px).',
    ],
    usage: [
      'Use the table layout when people compare many properties across rows or edit values in place.',
      'Keep the title column first and hide rarely used properties with view visibility rather than removing them from the schema.',
      'Don’t use a table for visual content such as covers or images; use the gallery layout instead.',
      'Don’t rely on column resizing for essential information; it is pointer-only.',
    ],
  }),
  install: install('`DatabaseView`', `<DatabaseView data={createTasksSample()} initialViewId="v-table" width={720} />`),
  examples: [
    {
      title: 'Hover, selection and calculations',
      render: () => <Tasks view="table" viewProps={{ hoveredRowId: 'r2', selected: ['r3'], calculations: true }} />,
      code: `<DatabaseView
  data={createTasksSample()}
  initialViewId="v-table"
  today={SAMPLE_TODAY}
  viewProps={{ hoveredRowId: 'r2', selected: ['r3'], calculations: true }}
/>`,
    },
    {
      title: 'Property menu open',
      render: () => <Tasks view="table" viewProps={{ openPropertyMenu: 'priority' }} />,
      code: `<DatabaseView data={createTasksSample()} initialViewId="v-table" viewProps={{ openPropertyMenu: 'priority' }} />`,
    },
    {
      title: 'Bare view',
      description: 'Without the block chrome, inside your own provider. The table is as wide as its columns, so give it a horizontal scroll container (`DatabaseView` brings its own); 28px of start padding leaves room for the row checkboxes.',
      render: () => <ViewHost view="table"><div className="pl-7"><TableView today={SAMPLE_TODAY} /></div></ViewHost>,
      code: `function BareTable() {
  const db = useDatabase(createTasksSample, 'v-table');
  return (
    <DatabaseProvider value={db}>
      <div className="max-w-full overflow-x-auto pl-7">
        <TableView today={SAMPLE_TODAY} />
      </div>
    </DatabaseProvider>
  );
}`,
    },
  ],
  api: [
    {
      name: 'TableView',
      description: 'Reads the active view from database context.',
      props: [
        { name: 'selected', type: 'string[]', description: 'Selected row ids (controlled, optional).' },
        { name: 'onSelectedChange', type: '(ids: string[]) => void', description: 'Selection changes.' },
        { ...onOpenRowProp, description: 'Open a page (title cell OPEN button).' },
        { name: 'openPropertyMenu', type: 'string', description: 'Render the property menu open for this property id.' },
        hoveredProp,
        { name: 'calculations', type: 'boolean', default: 'false', description: 'Show the calculation footer ("Count 8").' },
        todayProp,
      ],
    },
  ],
};

const boardViewPage: DocPage = {
  eyebrow: 'Database',
  title: 'Board View',
  description: 'Kanban columns grouped by a status or select property. Cards drag between columns and reorder within one.',
  hero: {
    title: 'Board View',
    render: () => <Tasks view="board" />,
    code: `<DatabaseView data={createTasksSample()} initialViewId="v-board" />`,
  },
  sections: docSections({
    compositionNote: viewHostNote,
    composition: `<BoardView>                    // grouped by view.groupBy (default: first status/select)
  column × n (276 wide, gap 12)
    header   → option pill · count · hover actions
    role="list" → card (role="listitem", draggable) · CardActions on hover
    "+ New page"
</BoardView>`,
    a11y: [
      'Each column body is a `role="list"` labelled by the group name; cards are `listitem`s.',
      'Cards open on click; hover actions are buttons labelled "Edit" and "More".',
      'Drag and drop uses HTML5 DnD (pointer). Keyboard alternative: on a focused card, Alt+← / Alt+→ move it to the previous / next column (`aria-keyshortcuts`); a polite status message announces the new column and focus stays on the card.',
    ],
    usage: [
      'Use the board layout for workflows where rows move through stages (status or select groups).',
      'Group by a status or select property with a small number of options; long option lists make wide, sparse boards.',
      'Don’t use a board when people need to compare many properties at once; use the table layout instead.',
      'Keep a non-drag path for every move: Alt+←/→ on the card, or the status cell in the row peek.',
    ],
  }),
  install: install('`DatabaseView`', `<DatabaseView data={createTasksSample()} initialViewId="v-board" width={720} />`),
  examples: [
    {
      title: 'Card hover actions',
      render: () => <Tasks view="board" viewProps={{ hoveredRowId: 'r8' }} />,
      code: `<DatabaseView data={createTasksSample()} initialViewId="v-board" viewProps={{ hoveredRowId: 'r8' }} />`,
    },
    {
      title: 'Card actions alone',
      render: () => <div className="relative h-10 w-40"><CardActions className="!static" /></div>,
      code: `<CardActions onEdit={() => {}} onMore={() => {}} />`,
    },
  ],
  api: [
    { name: 'BoardView', props: [onOpenRowProp, hoveredProp] },
    {
      name: 'CardActions',
      description: 'Hover actions on board and gallery cards (pencil + ellipsis).',
      props: [
        { name: 'onEdit', type: '() => void', description: 'Pencil button.' },
        { name: 'onMore', type: '() => void', description: 'Ellipsis button.' },
        classNameProp,
      ],
    },
  ],
};

const galleryViewPage: DocPage = {
  eyebrow: 'Database',
  title: 'Gallery View',
  description: 'Cards with a page preview area and the title, in a responsive grid.',
  hero: {
    title: 'Gallery View',
    render: () => <Tasks view="gallery" />,
    code: `<DatabaseView data={createTasksSample()} initialViewId="v-gallery" />`,
  },
  sections: docSections({
    compositionNote: viewHostNote,
    composition: `<GalleryView cardSize="medium">
  card × n (role="link")  → preview (146 tall) · title row · visible properties · CardActions on hover
  "+ New page"
</GalleryView>`,
    a11y: ['Cards are `role="link"` with `tabIndex=0`; Enter opens the page.'],
    usage: [
      'Use the gallery layout when each row has visual content (a cover or page preview) that helps recognition.',
      'Pick `cardSize` by how much of the preview matters: `small` for many rows, `large` for rich previews.',
      'Don’t use a gallery for dense, text-only records; use the list or table layout instead.',
    ],
  }),
  install: install('`DatabaseView`', `<DatabaseView data={createTasksSample()} initialViewId="v-gallery" width={720} />`),
  examples: [
    {
      title: 'Card size',
      render: () => <ViewHost view="gallery"><GalleryView cardSize="small" /></ViewHost>,
      code: `<DatabaseProvider value={useDatabase(createTasksSample, 'v-gallery')}>
  <GalleryView cardSize="small" />
</DatabaseProvider>`,
    },
  ],
  api: [
    {
      name: 'GalleryView',
      props: [
        onOpenRowProp,
        { name: 'cardSize', type: ['"small"', '"medium"', '"large"'], default: '"medium"', description: 'Medium gives 2 columns in a 692px column.' },
        hoveredProp,
      ],
    },
  ],
};

const listViewPage: DocPage = {
  eyebrow: 'Database',
  title: 'List View',
  description: 'Minimal rows: page icon and title on the left, visible properties as small pills on the right.',
  hero: {
    title: 'List View',
    render: () => <Tasks view="list" />,
    code: `<DatabaseView data={createTasksSample()} initialViewId="v-list" />`,
  },
  sections: docSections({
    compositionNote: viewHostNote,
    composition: `<ListView>
  row × n (<a>, 30px)  → page icon · title · edit button on hover · PropertyValueView size="sm" × n
  "+ New page"
</ListView>`,
    a11y: ['Rows are links: Tab focuses them, Enter opens the page.'],
    usage: [
      'Use the list layout for a calm, document-like index of pages with a few key properties.',
      'Show only the properties people scan for (status, date); the list hides the rest.',
      'Don’t use a list when people edit many values in place; use the table layout instead.',
    ],
  }),
  install: install('`DatabaseView`', `<DatabaseView data={createTasksSample()} initialViewId="v-list" width={720} />`),
  examples: [
    {
      title: 'Hovered row',
      render: () => <Tasks view="list" viewProps={{ hoveredRowId: 'r4' }} />,
      code: `<DatabaseView data={createTasksSample()} initialViewId="v-list" viewProps={{ hoveredRowId: 'r4' }} />`,
    },
  ],
  api: [{ name: 'ListView', props: [onOpenRowProp, hoveredProp] }],
};

const calendarViewPage: DocPage = {
  eyebrow: 'Database',
  title: 'Calendar View',
  description: 'Month grid of rows placed on their date property. Drag an event to another day; hover a day to add a page.',
  hero: {
    title: 'Calendar View',
    render: () => <Tasks view="calendar" />,
    code: `<DatabaseView data={createTasksSample()} initialViewId="v-calendar" today={SAMPLE_TODAY} />`,
  },
  sections: docSections({
    compositionNote: viewHostNote,
    composition: `<CalendarView>
  CalendarToolbar  → month label · "Manage in Calendar" · ‹ Today ›
  weekday header (24px)
  role="grid" → row (week, 124px) → gridcell (day number, today circle, "+" add) → event cards
</CalendarView>`,
    a11y: [
      'Month grid is `role="grid"` with `row` / `gridcell`; prev/next buttons are labelled "Previous Month" / "Next Month".',
      'Events are buttons that open the page; the day "+" button is labelled "Add page".',
      'Moving an event to another day is drag-only; change the date from the peek’s date cell with the keyboard.',
    ],
    usage: [
      'Use the calendar layout when a date property is the main way people find rows (events, deadlines, publishing).',
      'Set `view.dateProperty` explicitly when the collection has more than one date property.',
      'Don’t use a calendar for date ranges that span weeks; use the timeline layout instead.',
      'Don’t make drag and drop the only way to reschedule; the date cell in the row peek is the keyboard path.',
    ],
  }),
  install: install('`DatabaseView`', `<DatabaseView data={createTasksSample()} initialViewId="v-calendar" width={720} today={SAMPLE_TODAY} />`),
  examples: [
    {
      title: 'Calendar toolbar',
      description: 'The month header is shared with the timeline.',
      render: () => <div className="w-[600px]"><CalendarToolbar label="October 2026" /></div>,
      code: `const [month, setMonth] = useState(new Date(2026, 9, 1));
const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

<CalendarToolbar
  label={month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
  onPrev={() => shift(-1)}
  onNext={() => shift(1)}
  onToday={() => setMonth(new Date(2026, 9, 1))}
/>`,
    },
  ],
  api: [
    { name: 'CalendarView', props: [onOpenRowProp, todayProp] },
    {
      name: 'CalendarToolbar',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Month label (required).' },
        { name: 'onPrev', type: '() => void' },
        { name: 'onNext', type: '() => void' },
        { name: 'onToday', type: '() => void' },
        { name: 'extra', type: 'ReactNode', description: 'Controls between "Manage in Calendar" and the arrows (timeline: "Month ▾").' },
        { name: 'leading', type: 'ReactNode', description: 'Leading control (timeline: » table toggle).' },
        classNameProp,
      ],
    },
  ],
};

const timelineViewPage: DocPage = {
  eyebrow: 'Database',
  title: 'Timeline View',
  description: 'Gantt-style bars on a day scale with a today line. Drag a bar to move its date; off-screen items show an edge arrow.',
  hero: {
    title: 'Timeline View',
    render: () => <Tasks view="timeline" />,
    code: `<DatabaseView data={createTasksSample()} initialViewId="v-timeline" today={SAMPLE_TODAY} />`,
  },
  sections: docSections({
    compositionNote: viewHostNote,
    composition: `<TimelineView width={…}>
  CalendarToolbar leading={» Open table} extra={Month ▾}
  day header (40px days, today pill)
  body → weekend bands · today line · bar × n (34px) · edge arrow chips
</TimelineView>`,
    a11y: ['Bars are `role="button"` and open the page; edge chips are labelled "Scroll to <title>".', 'Dragging a bar is pointer-only.'],
    usage: [
      'Use the timeline layout to plan work over time and see overlaps between rows.',
      'Give rows a date so they render as bars; rows without one are left out of the timeline.',
      'Don’t use a timeline for single-day events in a month view; use the calendar layout instead.',
      'Don’t rely on dragging bars as the only way to change dates; it is pointer-only.',
    ],
  }),
  install: install('`DatabaseView`', `<DatabaseView data={createTasksSample()} initialViewId="v-timeline" width={720} today={SAMPLE_TODAY} />`),
  examples: [
    {
      title: 'Bare timeline',
      description: 'The timeline is `width` px wide; outside `DatabaseView`, put it in a horizontal scroll container.',
      render: () => <ViewHost view="timeline"><TimelineView today={SAMPLE_TODAY} width={600} /></ViewHost>,
      code: `<DatabaseProvider value={useDatabase(createTasksSample, 'v-timeline')}>
  <div className="max-w-full overflow-x-auto">
    <TimelineView today={SAMPLE_TODAY} width={600} />
  </div>
</DatabaseProvider>`,
    },
  ],
  api: [
    {
      name: 'TimelineView',
      props: [
        onOpenRowProp,
        todayProp,
        { name: 'width', type: 'number', default: '708', description: 'Visible width in px (days = width / 40). DatabaseView passes `width - 12`.' },
      ],
    },
  ],
};

const chartViewPage: DocPage = {
  eyebrow: 'Database',
  title: 'Chart View',
  description: 'The locked (upgrade) state, or a vertical bar chart of row counts grouped by a property.',
  hero: {
    title: 'Chart View',
    render: () => <Tasks view="chart" />,
    code: `<DatabaseView data={createTasksSample()} initialViewId="v-chart" />`,
  },
  sections: docSections({
    compositionNote: viewHostNote,
    composition: `<ChartView height={320}>
  view.chart.locked → <ChartLockedState />   // icon, two lines, "Upgrade now"
  otherwise         → bars per group (option colors) + gridlines
</ChartView>`,
    a11y: ['The locked state’s "Upgrade now" is a button.', 'Bars are decorative; expose the same counts in a table view for screen readers.'],
    usage: [
      'Use the chart layout for a quick count of rows per group (for example tasks per status).',
      'Set `view.chart.locked` to show the upgrade state when charts are a paid feature in your product.',
      'Always pair a chart with a table view of the same data; the bars are decorative for screen readers.',
      'Don’t use the chart view for detailed analytics; use `BarChart` or `LineChart` from the charts group instead.',
    ],
  }),
  install: install('`DatabaseView`', `<DatabaseView data={createTasksSample()} initialViewId="v-chart" width={720} />`),
  examples: [
    {
      title: 'Bar chart',
      render: () => <Tasks view="chart" data={barChartData()} />,
      code: `const data = createTasksSample();
data.views = data.views.map((v) => (v.type === 'chart' ? { ...v, chart: { groupBy: 'status' } } : v));

<DatabaseView data={data} initialViewId="v-chart" />`,
    },
    {
      title: 'Locked state alone',
      render: () => <div className="w-[600px]"><ChartLockedState learnMoreHref="#charts" /></div>,
      code: `<ChartLockedState onUpgrade={() => {}} learnMoreHref="/help/charts" />`,
    },
  ],
  api: [
    { name: 'ChartView', props: [{ name: 'height', type: 'number', default: '320', description: 'Chart height in px (bar variant).' }] },
    { name: 'ChartLockedState', props: [{ name: 'onUpgrade', type: '() => void', description: '"Upgrade now" click.' }, { name: 'learnMoreHref', type: 'string', description: 'Where "Learn more." links to; the link is left out without it.' }, classNameProp] },
  ],
};

function barChartData(): DatabaseData {
  const data = createTasksSample();
  data.views = data.views.map((v) => (v.type === 'chart' ? { ...v, chart: { groupBy: 'status' } } : v));
  return data;
}

/* ---------------------------------------------- menus ---------------------------------------------- */

const propertyMenuPage: DocPage = {
  eyebrow: 'Database',
  title: 'Property Menu',
  description: 'The menu behind a table column header: rename, change type, filter, sort, group, hide, wrap, insert, duplicate, delete.',
  hero: {
    title: 'Property Menu',
    render: () => <PropertyMenu property={prop('priority')} autoFocus={false} />,
    code: `import { PropertyMenu } from '@krackedui/motion';

const { collection } = createTasksSample();
const priorityProperty = collection.properties.find((p) => p.id === 'priority')!;

<PropertyMenu property={priorityProperty} autoFocus={false} />`,
  },
  sections: docSections({
    composition: `<PropertyMenu property={…}>     // MenuSurface 244 wide, role="menu"
  header   → change-icon button · name input · description (i)
  rows     → Edit property · Change type › · Filter · Sort ascending / descending · Group
             · Hide · Wrap content (switch) · Insert left / right · Duplicate · Delete
</PropertyMenu>`,
    a11y: [
      '`role="menu"` surface; ArrowUp/ArrowDown move between rows, Enter/Space activate (`useMenuKeys`).',
      'The name input is labelled "Property name" and focused on open (`autoFocus`); Enter commits, keys typed there do not move the menu.',
    ],
    usage: [
      'Use `PropertyMenu` as the popover behind a column header or a property label to rename, sort, filter, hide or delete a property.',
      'Wire only the actions your product supports; rows without a handler still render, so pass the callbacks you need.',
      'Set `autoFocus={false}` when the menu is shown inline (docs, previews) so it does not steal focus.',
      'Don’t use it as a general-purpose menu; use `Menu` for other actions.',
    ],
  }),
  install: install('`PropertyMenu`', `<PropertyMenu property={property} onSort={(dir) => sortBy(property.id, dir)} />`),
  examples: [
    {
      title: 'Wired to a database',
      description: 'Inside `TableView` the menu is wired for you; on its own, handle the callbacks.',
      render: () => <WiredPropertyMenu />,
      code: `const { collection } = createTasksSample();
const statusProperty = collection.properties.find((p) => p.id === 'status')!;

const [wrap, setWrap] = useState(false);
const [log, setLog] = useState('');

<div className="flex items-start gap-6">
  <PropertyMenu
    property={statusProperty}
    autoFocus={false}
    wrap={wrap}
    onToggleWrap={() => setWrap(!wrap)}
    onSort={(d) => setLog('Sort ' + d)}
    onHide={() => setLog('Hide')}
    onDelete={() => setLog('Delete')}
  />
  <p className="w-32 text-[14px] text-n-text-secondary">{log || 'Pick an action'}</p>
</div>`,
    },
  ],
  api: [
    {
      name: 'PropertyMenu',
      description: 'Based on `<div>` and supports its props (except `onChange`). Adds:',
      props: [
        { name: 'property', type: 'Property', description: 'The column’s property (required).' },
        { name: 'onRename', type: '(name: string) => void' },
        { name: 'onChangeType', type: '(type: PropertyType) => void' },
        { name: 'onFilter', type: '() => void' },
        { name: 'onSort', type: "(direction: 'ascending' | 'descending') => void" },
        { name: 'onGroup', type: '() => void' },
        { name: 'onHide', type: '() => void' },
        { name: 'onInsert', type: "(side: 'left' | 'right') => void" },
        { name: 'onDuplicate', type: '() => void' },
        { name: 'onDelete', type: '() => void' },
        { name: 'wrap', type: 'boolean', description: 'Wrap content switch state.' },
        { name: 'onToggleWrap', type: '() => void' },
        { name: 'autoFocus', type: 'boolean', default: 'true', description: 'Focus the name input on mount.' },
      ],
    },
  ],
};

function WiredPropertyMenu() {
  const [wrap, setWrap] = useState(false);
  const [log, setLog] = useState('');
  return (
    <div className="flex items-start gap-6">
      <PropertyMenu property={prop('status')} autoFocus={false} wrap={wrap} onToggleWrap={() => setWrap(!wrap)}
        onSort={(d) => setLog(`Sort ${d}`)} onHide={() => setLog('Hide')} onDelete={() => setLog('Delete')} />
      <p className="w-32 text-[14px] text-n-text-secondary">{log || 'Pick an action'}</p>
    </div>
  );
}

const selectPickerPage: DocPage = {
  eyebrow: 'Database',
  title: 'Select Picker',
  description: 'Select, multi-select and status picker: selected tokens with search, the option list, and “Create” for new options.',
  hero: {
    title: 'Select Picker',
    render: () => <SelectDemo />,
    code: `import { useState } from 'react';
import { SelectPicker, type SelectOption } from '@krackedui/motion';

const priorityOptions: SelectOption[] = [
  { id: 'low', name: 'Low', color: 'yellow' },
  { id: 'high', name: 'High', color: 'default' },
  { id: 'medium', name: 'Medium', color: 'pink' },
];

export function SelectDemo() {
  const [value, setValue] = useState(['medium']);
  return <SelectPicker options={priorityOptions} value={value} onChange={setValue} />;
}`,
  },
  sections: docSections({
    composition: `<SelectPicker>                  // 300 wide
  token area  → selected Tag × n (removable) · search input (role="combobox")
  label       "Select an option or create one"
  options     → role="option" × n: drag handle · Tag / StatusPill · "…"
  create row  → "Create <query>" (when onCreate and no exact match)
</SelectPicker>`,
    a11y: [
      'The search input is a `combobox`; options are `role="option"` with `aria-selected`.',
      'ArrowUp/ArrowDown move the active option, Enter selects (and closes a single select via `onDone`), Escape calls `onDone`, Backspace in an empty search removes the last token.',
    ],
    usage: [
      'Use `SelectPicker` to edit select, multi-select and status values with search and inline option creation.',
      'Pass `onCreate` only when people may add new options; without it the “Create” row is hidden.',
      'Use `onDone` to close the surrounding popover after a single selection or Escape.',
      'Don’t use it for plain form fields outside a database; use `Select` or `Combobox` instead.',
    ],
  }),
  install: install('`SelectPicker`', `<SelectPicker options={options} value={value} onChange={setValue} />`),
  examples: [
    {
      title: 'Multi-select with create',
      render: () => <MultiSelectDemo />,
      code: `const teamOptions: SelectOption[] = [
  { id: 'design', name: 'Design', color: 'brown' },
  { id: 'frontend', name: 'Frontend', color: 'orange' },
  { id: 'docs', name: 'Docs', color: 'green' },
  { id: 'qa', name: 'QA', color: 'purple' },
];

const [options, setOptions] = useState(teamOptions);
const [value, setValue] = useState(['design']);

<SelectPicker
  multi
  options={options}
  value={value}
  onChange={setValue}
  onCreate={(name) => {
    const option = { id: name.toLowerCase(), name, color: 'blue' as const };
    setOptions([...options, option]);
    return option;
  }}
/>`,
    },
    {
      title: 'Status',
      render: () => <SelectPicker status options={optionsOf('status')} value={['progress']} />,
      code: `const statusOptions: StatusOption[] = [
  { id: 'todo', name: 'Not started', color: 'gray', group: 'todo' },
  { id: 'progress', name: 'In progress', color: 'blue', group: 'in_progress' },
  { id: 'done', name: 'Done', color: 'green', group: 'complete' },
];

<SelectPicker status options={statusOptions} value={['progress']} />`,
    },
  ],
  api: [
    {
      name: 'SelectPicker',
      description: 'Based on `<div>` and supports its props (except `onChange`). Adds:',
      props: [
        { name: 'options', type: '(SelectOption | StatusOption)[]', description: 'Options to list (required).' },
        { name: 'value', type: 'string[]', description: 'Selected option ids (required).' },
        { name: 'multi', type: 'boolean', default: 'false', description: 'Allow several values.' },
        { name: 'status', type: 'boolean', default: 'false', description: 'Render options as status pills.' },
        { name: 'onChange', type: '(ids: string[]) => void' },
        { name: 'onCreate', type: '(name: string) => SelectOption | undefined', description: 'Create an option from the search text; return it so it is selected.' },
        { name: 'onDone', type: '() => void', description: 'Close request (Enter on single select, Escape).' },
        { name: 'width', type: 'number', default: '300' },
        { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Focus the search input on mount.' },
      ],
    },
  ],
};

function SelectDemo() {
  const [value, setValue] = useState(['medium']);
  return <SelectPicker options={optionsOf('priority')} value={value} onChange={setValue} />;
}
function MultiSelectDemo() {
  const [options, setOptions] = useState<SelectOption[]>(optionsOf('team'));
  const [value, setValue] = useState(['design']);
  return (
    <SelectPicker multi options={options} value={value} onChange={setValue}
      onCreate={(name) => {
        const option: SelectOption = { id: name.toLowerCase(), name, color: 'blue' };
        setOptions([...options, option]);
        return option;
      }} />
  );
}

const dateCellPickerPage: DocPage = {
  eyebrow: 'Database',
  title: 'Date Cell Picker',
  description: 'The date property popover: typed date input, month calendar, end date / time switches and Clear.',
  hero: {
    title: 'Date Cell Picker',
    render: () => <DateDemo />,
    code: `import { useState } from 'react';
import { DateCellPicker, SAMPLE_TODAY } from '@krackedui/motion';

export function DateDemo() {
  const [value, setValue] = useState<string | null>('2026-10-12');
  return <DateCellPicker value={value} onChange={setValue} today={SAMPLE_TODAY} />;
}`,
  },
  sections: docSections({
    composition: `<DateCellPicker>                // 248 wide
  date input (Enter commits typed text)
  month caption · Today · ‹ ›
  role="grid" → columnheader × 7 · gridcell → day button (aria-pressed)
  End date (switch) · Date format › · Include time (switch) · Remind ›
  Clear · Learn about reminders
</DateCellPicker>`,
    a11y: [
      'Day buttons have a full date `aria-label` and `aria-pressed` for the selected day; the grid uses `grid` / `columnheader` / `gridcell`.',
      'Month arrows are labelled "Go to previous month" / "Go to next month"; switches are labelled "End date" and "Include time".',
    ],
    usage: [
      'Use `DateCellPicker` as the popover behind a date property cell.',
      'It emits a single ISO date (`YYYY-MM-DD`) or `null` from Clear; the end date, time and reminder switches only change the popover locally.',
      'Pass `today` when you need a fixed reference date (tests, demos).',
      'Don’t use it for date fields in forms; use `DatePicker` or `DateRangePicker` instead.',
    ],
  }),
  install: install('`DateCellPicker`', `<DateCellPicker value={value} onChange={setValue} />`),
  examples: [
    {
      title: 'Empty value',
      render: () => <DateCellPicker value={null} today={SAMPLE_TODAY} />,
      code: `<DateCellPicker value={null} today={SAMPLE_TODAY} />`,
    },
  ],
  api: [
    {
      name: 'DateCellPicker',
      description: 'Based on `<div>` and supports its props (except `onChange`). Adds:',
      props: [
        { name: 'value', type: 'string | null', description: 'ISO date (`YYYY-MM-DD`) or null (required).' },
        { name: 'onChange', type: '(iso: string | null) => void', description: 'Day click, typed date, or Clear (null).' },
        todayProp,
        { name: 'width', type: 'number', default: '248' },
      ],
    },
  ],
};

function DateDemo() {
  const [value, setValue] = useState<string | null>('2026-10-12');
  return <DateCellPicker value={value} onChange={setValue} today={SAMPLE_TODAY} />;
}

const filterSortPage: DocPage = {
  eyebrow: 'Database',
  title: 'Filter & Sort Menus',
  description: '“Filter by…” and “Sort by…” property pickers, plus the editors behind the filter and sort rule pills.',
  hero: {
    title: 'Filter & Sort Menus',
    render: () => (
      <div className="flex flex-wrap items-start justify-center gap-6">
        <FilterMenu properties={menuProperties} highlightFirst />
        <SortMenu properties={menuProperties} />
      </div>
    ),
    code: `import { FilterMenu, SortMenu, createTasksSample } from '@krackedui/motion';

const { collection } = createTasksSample();
const order = ['title', 'due', 'priority', 'status', 'team'];
const properties = [...collection.properties].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

<div className="flex flex-wrap items-start justify-center gap-6">
  <FilterMenu properties={properties} highlightFirst onSelect={(p) => console.log('Filter by', p.name)} />
  <SortMenu properties={properties} onSelect={(p) => console.log('Sort by', p.name)} />
</div>`,
  },
  sections: docSections({
    composition: `<FilterMenu> / <SortMenu>         // = PropertyPickerMenu with a placeholder (+ footer for filter)
  DbMenuSearch "Filter by…" / "Sort by…"
  DbMenuItem × n → PropertyTypeIcon + name
  DbMenuRule · "Add advanced filter" (filter only)

<FilterEditor>   "Status  is ▾"  · value picker (options checklist / text / date) · delete
<SortEditor>     row per sort: property ▾ · direction ▾ · remove · "+ Add sort"

menu parts: DbMenuSearch, DbMenuRule, DbMenuItem, SubmenuRow, useMenuKeys()`,
    a11y: [
      'The search field takes focus with `autoFocus`; Enter picks the first match.',
      'Rows are focusable `DbMenuItem`s: ArrowUp/ArrowDown move, Enter/Space select (`useMenuKeys`).',
      'Editors’ delete buttons are labelled "Delete filter" / "Remove sort".',
    ],
    usage: [
      'Use `FilterMenu` and `SortMenu` as the first step of adding a filter or sort: pick a property, then open `FilterEditor` or `SortEditor`.',
      'Order the properties the way people expect to scan them (title first, then frequently filtered ones).',
      'Use `PropertyPickerMenu` directly for other “pick a property” flows (group by, calculations).',
      'Don’t use these menus outside a database; use `Menu` or `Combobox` for general choices.',
    ],
  }),
  install: install('the menus', `<FilterMenu properties={collection.properties} onSelect={(p) => addFilter(p)} />`),
  examples: [
    {
      title: 'Filter editor',
      render: () => <FilterEditorDemo />,
      code: `const { collection } = createTasksSample();
const statusProperty = collection.properties.find((p) => p.id === 'status')!;
const [filter, setFilter] = useState<Filter>({ id: 'f1', propertyId: 'status', operator: 'is', value: ['progress'] });

<FilterEditor
  property={statusProperty}
  filter={filter}
  onChange={setFilter}
  onRemove={() => setFilter({ ...filter, value: [] })}
/>`,
    },
    {
      title: 'Sort editor',
      render: () => <SortEditorDemo />,
      code: `const { collection } = createTasksSample();
const [sorts, setSorts] = useState<Sort[]>([{ propertyId: 'due', direction: 'ascending' }]);

<SortEditor properties={collection.properties} sorts={sorts} onChange={setSorts} />`,
    },
    {
      title: 'Custom menu from the parts',
      description: 'Build other database pickers ("Group by…") from the same parts: `DbMenuSearch` on top, `DbMenuItem` rows in labelled groups, `DbMenuRule` between sections and `useMenuKeys` for ↑/↓ and Enter/Space.',
      render: () => <GroupByMenuDemo />,
      code: `const { collection } = createTasksSample();
const onKeyDown = useMenuKeys();
const [query, setQuery] = useState('');
const shown = collection.properties.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));

<MenuSurface width={260} onKeyDown={onKeyDown}>
  <DbMenuSearch placeholder="Group by…" value={query} onChange={(e) => setQuery(e.target.value)} />
  <MenuList role="group" aria-label="Properties">
    {shown.map((p) => (
      <DbMenuItem key={p.id} icon={<PropertyTypeIcon type={p.type} />} onClick={() => console.log('Group by', p.name)}>
        {p.name}
      </DbMenuItem>
    ))}
  </MenuList>
  <DbMenuRule />
  <MenuList role="group" aria-label="More">
    <DbMenuItem icon="xMarkSmall" onClick={() => console.log('No grouping')}>No grouping</DbMenuItem>
  </MenuList>
</MenuSurface>`,
    },
  ],
  api: [
    {
      name: 'FilterMenu',
      description: '`PropertyPickerMenu` with the "Filter by…" placeholder and the "Add advanced filter" footer. Based on `<div>` (except `onSelect`).',
      props: [
        { name: 'properties', type: 'Property[]', description: 'Properties to list (required).' },
        { name: 'onSelect', type: '(property: Property) => void', description: 'Called with the picked property (click, or Enter in the search for the first match).' },
        { name: 'onAdvanced', type: '() => void', description: '"Add advanced filter" footer row.' },
        { name: 'highlightFirst', type: 'boolean', default: 'false', description: 'Highlight the first row.' },
        { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Focus the search field on mount.' },
        { name: 'width', type: 'number', default: '290', description: 'Menu width in px.' },
      ],
    },
    {
      name: 'SortMenu',
      description: '`PropertyPickerMenu` with the "Sort by…" placeholder. Based on `<div>` (except `onSelect`).',
      props: [
        { name: 'properties', type: 'Property[]', description: 'Properties to list (required).' },
        { name: 'onSelect', type: '(property: Property) => void', description: 'Called with the picked property (click, or Enter in the search for the first match).' },
        { name: 'highlightFirst', type: 'boolean', default: 'false', description: 'Highlight the first row.' },
        { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Focus the search field on mount.' },
        { name: 'width', type: 'number', default: '290', description: 'Menu width in px.' },
      ],
    },
    {
      name: 'PropertyPickerMenu',
      props: [
        { name: 'properties', type: 'Property[]', description: '(required)' },
        { name: 'placeholder', type: 'string', description: 'Search placeholder (required).' },
        { name: 'onSelect', type: '(property: Property) => void' },
        { name: 'footer', type: '{ label: string; onSelect?: () => void }', description: 'Footer row under an inset rule.' },
        { name: 'highlightFirst', type: 'boolean', default: 'false' },
        { name: 'autoFocus', type: 'boolean', default: 'false' },
        { name: 'width', type: 'number', default: '290' },
      ],
    },
    {
      name: 'FilterEditor',
      props: [
        { name: 'property', type: 'Property', description: '(required)' },
        { name: 'filter', type: 'Filter', description: '(required)' },
        { name: 'onChange', type: '(f: Filter) => void', description: '(required)' },
        { name: 'onRemove', type: '() => void', description: '(required)' },
      ],
    },
    {
      name: 'SortEditor',
      props: [
        { name: 'properties', type: 'Property[]', description: '(required)' },
        { name: 'sorts', type: 'Sort[]', description: '(required)' },
        { name: 'onChange', type: '(s: Sort[]) => void', description: '(required)' },
        { name: 'onAdd', type: '() => void', description: '"+ Add sort" row.' },
      ],
    },
    {
      name: 'DbMenuSearch',
      description: 'The 28px search field at the top of database menus, placed 12px in. An `<input type="search">`: all input props pass through; its accessible name defaults to the placeholder (without "…").',
      props: [{ name: 'wrapperClassName', type: 'string', description: 'Classes for the padded wrapper.' }],
    },
    {
      name: 'DbMenuItem',
      description: 'A `MenuRow` made focusable for `useMenuKeys`: a `button` (or a `switch` when `toggle` is set) with `tabIndex={-1}`; focus draws the highlighted look. Same props as `MenuRow`.',
      props: [
        { name: 'children', type: 'ReactNode', description: 'Row label.' },
        { name: 'icon', type: 'IconName | ReactNode', description: 'Leading icon (a 20px icon name or any node).' },
        { name: 'description', type: 'ReactNode', description: 'Secondary value on the right.' },
        { name: 'caption', type: 'ReactNode', description: 'Small secondary line under the label.' },
        { name: 'shortcut', type: 'ReactNode', description: 'Keyboard shortcut hint on the right.' },
        { name: 'submenu', type: 'boolean', description: 'Show a submenu chevron.' },
        { name: 'trailing', type: 'ReactNode', description: 'Custom content at the end of the row.' },
        { name: 'checked', type: 'boolean', description: 'Checkmark at the end (selected option).' },
        { name: 'toggle', type: 'boolean', description: 'Render a switch on the right; the row becomes a `switch` with `aria-checked`.' },
        { name: 'onToggle', type: '(next: boolean) => void', description: 'Called with the new value when a `toggle` row is clicked.' },
        { name: 'tone', type: "'default' | 'danger' | 'accent' | 'muted'", default: "'default'", description: 'Text color of the row.' },
        { name: 'highlighted', type: 'boolean', description: 'Force the highlighted look.' },
      ],
    },
    {
      name: 'DbMenuRule',
      description: 'Inset hairline between database menu sections (12px from the edges).',
      props: [{ name: 'className', type: 'string' }],
    },
    {
      name: 'useMenuKeys',
      description: '`useMenuKeys(): (e: KeyboardEvent<HTMLElement>) => void`. Attach to a menu surface\'s `onKeyDown`: ↑/↓ move focus across its `DbMenuItem`s (wrapping), Enter/Space click the focused one.',
      props: [],
    },
    {
      name: 'SubmenuRow',
      description: 'Menu row that opens a flyout to its right ("Layout  Table ›"). Extends `MenuRowProps` (without `submenu` / `content`).',
      props: [
        { name: 'content', type: 'ReactNode | ((close: () => void) => ReactNode)', description: 'Flyout content (required).' },
        { name: 'value', type: 'ReactNode', description: 'Value shown before the chevron.' },
        { name: 'width', type: 'number', default: '240', description: 'Flyout width.' },
        { name: 'children', type: 'ReactNode', description: 'Row label (required).' },
        { name: 'icon', type: 'IconName | ReactNode', description: 'Leading icon (a 20px icon name or any node).' },
        { name: 'description', type: 'ReactNode', description: 'Secondary value on the right, before the chevron.' },
        { name: 'caption', type: 'ReactNode', description: 'Small secondary line under the label (two-line row).' },
        { name: 'shortcut', type: 'ReactNode', description: 'Keyboard shortcut hint on the right.' },
        { name: 'trailing', type: 'ReactNode', description: 'Custom content at the end of the row.' },
        { name: 'checked', type: 'boolean', description: 'Show a checkmark at the end (selected option).' },
        { name: 'toggle', type: 'boolean', description: 'Render a switch on the right; the row (an option) gets `aria-checked`.' },
        { name: 'onToggle', type: '(next: boolean) => void', description: 'Called with the new value when a `toggle` row is clicked.' },
        { name: 'tone', type: "'default' | 'danger' | 'accent' | 'muted'", default: "'default'", description: 'Text color of the row.' },
        { name: 'highlighted', type: 'boolean', description: 'Force the highlighted look (keyboard-selected row in static menus).' },
      ],
    },
  ],
};

function GroupByMenuDemo() {
  const onKeyDown = useMenuKeys();
  const [query, setQuery] = useState('');
  const shown = sample.collection.properties.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <MenuSurface width={260} onKeyDown={onKeyDown}>
      <DbMenuSearch placeholder="Group by…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <MenuList role="group" aria-label="Properties">
        {shown.map((p) => (
          <DbMenuItem key={p.id} icon={<PropertyTypeIcon type={p.type} />}>{p.name}</DbMenuItem>
        ))}
      </MenuList>
      <DbMenuRule />
      <MenuList role="group" aria-label="More">
        <DbMenuItem icon="xMarkSmall">No grouping</DbMenuItem>
      </MenuList>
    </MenuSurface>
  );
}

function FilterEditorDemo() {
  const [filter, setFilter] = useState<Filter>({ id: 'f1', propertyId: 'status', operator: 'is', value: ['progress'] });
  return <FilterEditor property={prop('status')} filter={filter} onChange={setFilter} onRemove={() => setFilter({ ...filter, value: [] })} />;
}
function SortEditorDemo() {
  const [sorts, setSorts] = useState<Sort[]>([{ propertyId: 'due', direction: 'ascending' }]);
  return <SortEditor properties={sample.collection.properties} sorts={sorts} onChange={setSorts} />;
}

const viewSettingsPage: DocPage = {
  eyebrow: 'Database',
  title: 'View Settings Panel',
  description: 'The “View settings” panel from the toolbar: view name, layout, property visibility, filter, sort, group and data source settings.',
  hero: {
    title: 'View Settings Panel',
    render: () => <ViewSettingsDemo />,
    code: `import { useState } from 'react';
import { ViewSettingsPanel, createTasksSample } from '@krackedui/motion';

export function ViewSettingsDemo() {
  const [data] = useState(createTasksSample);
  const [view, setView] = useState(data.views[0]);
  return <ViewSettingsPanel collection={data.collection} view={view} onChange={(patch) => setView({ ...view, ...patch })} />;
}`,
  },
  sections: docSections({
    composition: `<ViewSettingsPanel>             // 290 wide, role="dialog" "View settings"
  header      → "View settings" · close
  name row    → icon button · view name input
  rows        → Layout › · Property visibility › · Filter › · Sort › · Group › · …   (SubmenuRow)
  "Data source settings" section
</ViewSettingsPanel>`,
    a11y: [
      '`role="dialog"` labelled "View settings"; Close and Change icon are labelled buttons; the name input is labelled "View name" (Enter commits).',
      'Rows: ArrowUp/ArrowDown and Enter/Space (`useMenuKeys`); submenu rows open their flyout to the right.',
    ],
    usage: [
      'Use `ViewSettingsPanel` for per-view configuration: name, layout, visible properties, filters, sorts and grouping.',
      'Pass `height` when the panel is docked in a layout with a fixed height; otherwise it sizes to its content.',
      'Apply each `onChange` patch to the view immediately; the panel has no Save step.',
      'Don’t use it for settings that apply to the whole database or workspace; use a settings page instead.',
    ],
  }),
  install: install('`ViewSettingsPanel`', `<ViewSettingsPanel collection={collection} view={view} onChange={(patch) => updateView(view.id, patch)} />`),
  examples: [
    {
      title: 'Fixed height',
      description: 'Inside `DatabaseView` the panel is 627px tall; pass `height` to match your layout.',
      render: () => <ViewSettingsPanel collection={sample.collection} view={sample.views[1]} height={420} />,
      code: `const { collection, views } = createTasksSample();
const boardView = views.find((v) => v.type === 'board')!;

<ViewSettingsPanel collection={collection} view={boardView} height={420} />`,
    },
  ],
  api: [
    {
      name: 'ViewSettingsPanel',
      description: 'Based on `<div>` and supports its props (except `onChange`). Adds:',
      props: [
        { name: 'collection', type: 'Collection', description: '(required)' },
        { name: 'view', type: 'View', description: '(required)' },
        { name: 'onChange', type: '(patch: Partial<View>) => void', description: 'Rename, layout, visibility, filters, sorts, group.' },
        { name: 'onClose', type: '() => void', description: 'Close button.' },
        { name: 'height', type: 'number', default: 'auto', description: 'Panel height in px (627 inside `DatabaseView`).' },
      ],
    },
  ],
};

function ViewSettingsDemo() {
  const [view, setView] = useState(sample.views[0]);
  return <ViewSettingsPanel collection={sample.collection} view={view} onChange={(patch) => setView({ ...view, ...patch })} />;
}

const newViewMenuPage: DocPage = {
  eyebrow: 'Database',
  title: 'Views Menu & New View',
  description: 'The “N more…” list of views and the “Add a new view” layout grid that opens beside it.',
  hero: {
    title: 'Views Menu',
    render: () => <ViewsMenu views={sample.views} activeViewId="v-table" />,
    code: `import { useState } from 'react';
import { ViewsMenu, createTasksSample } from '@krackedui/motion';

const { views } = createTasksSample();
const [activeViewId, setActiveViewId] = useState('v-table');

<ViewsMenu
  views={views}
  activeViewId={activeViewId}
  onSelect={(v) => setActiveViewId(v.id)}
  onNewView={() => console.log('Open the new view grid')}
/>`,
  },
  sections: docSections({
    composition: `<ViewsMenu>                     // 290 wide
  DbMenuSearch "Search for a view…"
  view row × n (role="option") → drag handle · view icon · name · "…"
  DbMenuRule · New view · New data source

<NewViewMenu>                   // 390 wide, 4-column grid
  "Add a new view" · gridcell × 11 (Table, Board, Gallery, List, Chart, Dashboard,
                                    Timeline, Feed, Map, Calendar, Form)
</NewViewMenu>`,
    a11y: [
      'View rows are `role="option"` with `aria-selected` for the active view; ArrowUp/ArrowDown and Enter (`useMenuKeys`).',
      'Grid cells are buttons in a `role="grid"`; layouts this package does not render (Dashboard, Feed, Map, Form) are `aria-disabled`.',
    ],
    usage: [
      'Use `ViewsMenu` when a database has more views than fit in the tab row (“N more…”).',
      'Open `NewViewMenu` beside it (or on its own) to add a view; only supported layouts call `onSelect`.',
      'Set `newViewHighlighted` while the grid is open so people see where it came from.',
      'Don’t use the views menu for navigation between pages; use the sidebar or breadcrumbs instead.',
    ],
  }),
  install: install('`ViewsMenu` and `NewViewMenu`', `<NewViewMenu onSelect={(type) => addView(type)} />`),
  examples: [
    {
      title: 'New view grid',
      render: () => <NewViewMenu highlighted="table" />,
      code: `const db = useDatabase(createTasksSample);

<NewViewMenu highlighted="table" onSelect={(type) => db.addView(type)} />`,
    },
    {
      title: 'New view highlighted',
      render: () => <ViewsMenu views={sample.views} activeViewId="v-board" newViewHighlighted />,
      code: `const { views } = createTasksSample();

<ViewsMenu views={views} activeViewId="v-board" newViewHighlighted />`,
    },
  ],
  api: [
    {
      name: 'ViewsMenu',
      description: 'Based on `<div>` (except `onSelect`). Adds:',
      props: [
        { name: 'views', type: 'View[]', description: '(required)' },
        { name: 'activeViewId', type: 'string' },
        { name: 'onSelect', type: '(view: View) => void' },
        { name: 'onNewView', type: '() => void', description: '"New view" row.' },
        { name: 'newViewHighlighted', type: 'boolean', default: 'false', description: 'Force the "New view" row highlighted (while the grid is open).' },
      ],
    },
    {
      name: 'NewViewMenu',
      description: 'Based on `<div>` (except `onSelect`). The cells come from `newViewLayouts`.',
      props: [
        { name: 'onSelect', type: '(type: ViewType) => void', description: 'Only for supported layouts.' },
        { name: 'highlighted', type: 'string', description: 'Highlight a cell by type (for example "table").' },
      ],
    },
  ],
};

const propertyListPage: DocPage = {
  eyebrow: 'Database',
  title: 'Property List',
  description: 'The editable property table under a database page’s title (side peek and full page), plus the per-property cell and value renderers.',
  hero: {
    title: 'Property List',
    render: () => <PropertyListDemo />,
    code: `import { PropertyList, useDatabase, createTasksSample, SAMPLE_TODAY } from '@krackedui/motion';

export function PropertyListDemo() {
  const db = useDatabase(createTasksSample);
  const row = db.data.rows[1];
  return (
    <PropertyList
      properties={db.data.collection.properties}
      row={row}
      today={SAMPLE_TODAY}
      onChange={(pid, v) => db.updateRow(row.id, pid, v)}
      onCreateOption={(pid, name) => db.addOption(pid, name)}
    />
  );
}`,
  },
  sections: docSections({
    composition: `<PropertyList properties row>    // title property omitted
  PropertyRow × n
    label cell (160)  → PropertyTypeIcon + name
    PropertyCell      → PropertyValueView (display) → SelectPicker / DateCellPicker / inline input
  "Add a property"

<PropertyValueView>  read-only renderer per type (tags, status pill, date, checkbox, person…)
<PropertyTypeIcon>   property-type icon (16px)`,
    a11y: [
      'Value cells are buttons: Enter/click edits. Select and status values open the `SelectPicker`, dates the `DateCellPicker` (both close on Escape); checkboxes toggle with Space; text-like types edit inline (Enter commits).',
      'Empty values read "Empty" in text-tertiary.',
    ],
    usage: [
      'Use `PropertyList` to show and edit one row’s properties, typically at the top of a page or in a peek.',
      'Use `PropertyValueView` for read-only values (cards, lists) and `PropertyTypeIcon` wherever a property type is named.',
      'Let empty values show “Empty” so people can click to fill them; don’t hide empty properties by default.',
      'Don’t use it for a general key/value form; use `Field` with form inputs instead.',
    ],
  }),
  install: install('`PropertyList`', `<PropertyList properties={collection.properties} row={row} onChange={(pid, v) => updateRow(row.id, pid, v)} />`),
  examples: [
    {
      title: 'Single row',
      render: () => <PropertyRowDemo />,
      code: `const { collection } = createTasksSample();
const dueProperty = collection.properties.find((p) => p.id === 'due')!;
const [value, setValue] = useState<PropertyValue | undefined>('2026-10-09');

<div className="w-[506px] max-w-full">
  <PropertyRow property={dueProperty} value={value} onChange={setValue} today={SAMPLE_TODAY} />
</div>`,
    },
    {
      title: 'Value renderers and type icons',
      render: () => (
        <div className="flex flex-col gap-2">
          {sample.collection.properties.map((p) => (
            <div key={p.id} className="flex items-center gap-3 text-[14px]">
              <PropertyTypeIcon type={p.type} className="text-n-icon-secondary" />
              <span className="w-24 text-n-text-secondary">{propertyTypeLabels[p.type as PropertyType]}</span>
              <PropertyValueView property={p} value={sample.rows[2].values[p.id]} />
            </div>
          ))}
        </div>
      ),
      code: `const { collection, rows } = createTasksSample();
const row = rows[2];

<div className="flex flex-col gap-2">
  {collection.properties.map((p) => (
    <div key={p.id} className="flex items-center gap-3 text-[14px]">
      <PropertyTypeIcon type={p.type} className="text-n-icon-secondary" />
      <span className="w-24 text-n-text-secondary">{propertyTypeLabels[p.type]}</span>
      <PropertyValueView property={p} value={row.values[p.id]} />
    </div>
  ))}
</div>`,
    },
  ],
  api: [
    {
      name: 'PropertyList',
      description: 'Based on `<div>` (except `onChange`). Adds:',
      props: [
        { name: 'properties', type: 'Property[]', description: 'Properties to show, in order (required).' },
        { name: 'row', type: 'Row', description: '(required)' },
        { name: 'onChange', type: '(propertyId: string, value: PropertyValue) => void' },
        { name: 'onCreateOption', type: '(propertyId: string, name: string) => SelectOption | undefined' },
        { name: 'onAddProperty', type: '() => void', description: '"Add a property" row.' },
        todayProp,
      ],
    },
    {
      name: 'PropertyRow',
      props: [
        { name: 'property', type: 'Property', description: '(required)' },
        { name: 'value', type: 'PropertyValue | undefined', description: '(required)' },
        { name: 'onChange', type: '(value: PropertyValue) => void' },
        { name: 'onCreateOption', type: '(name: string) => SelectOption | undefined' },
        todayProp,
      ],
    },
    {
      name: 'PropertyCell',
      description: 'An editable value: the click target of a table cell or a property row.',
      props: [
        { name: 'property', type: 'Property', description: '(required)' },
        { name: 'value', type: 'PropertyValue | undefined', description: '(required)' },
        { name: 'onChange', type: '(value: PropertyValue) => void', description: '(required)' },
        { name: 'onCreateOption', type: '(name: string) => SelectOption | undefined' },
        { name: 'children', type: 'ReactNode', default: 'PropertyValueView', description: 'Custom display.' },
        classNameProp,
        { name: 'inputClassName', type: 'string', description: 'Class for the inline `<input>` of text-like types.' },
        { name: 'empty', type: 'ReactNode', description: 'Placeholder for empty display.' },
        todayProp,
        { name: 'size', type: ['"md"', '"sm"'], default: '"md"', description: 'Tag size.' },
      ],
    },
    {
      name: 'PropertyValueView',
      props: [
        { name: 'property', type: 'Property', description: '(required)' },
        { name: 'value', type: 'PropertyValue | undefined', description: '(required)' },
        { name: 'size', type: ['"md"', '"sm"'], default: '"md"', description: '`sm` = compact tags in list / board / gallery.' },
        { name: 'wrap', type: 'boolean', default: 'false', description: 'Wrap multi tags.' },
        { name: 'onToggle', type: '(checked: boolean) => void', description: 'Checkbox values.' },
        classNameProp,
        { name: 'empty', type: 'ReactNode', default: 'null', description: 'Placeholder for empty values.' },
      ],
    },
    {
      name: 'PropertyTypeIcon',
      description: 'Based on `<svg>` props (except `type` / `name`).',
      props: [
        { name: 'type', type: 'PropertyType', description: '(required)' },
        { name: 'size', type: 'number', default: '16' },
      ],
    },
  ],
};

function PropertyListDemo() {
  const db = useDatabase(createTasksSample);
  const row = db.data.rows[1];
  return (
    <div className="w-[506px] max-w-full">
      <PropertyList properties={db.data.collection.properties} row={row} today={SAMPLE_TODAY}
        onChange={(pid, v) => db.updateRow(row.id, pid, v)} onCreateOption={(pid, name) => db.addOption(pid, name)} />
    </div>
  );
}
function PropertyRowDemo() {
  const [value, setValue] = useState<PropertyValue | undefined>('2026-10-09');
  return (
    <div className="w-[506px] max-w-full">
      <PropertyRow property={prop('due')} value={value} onChange={setValue} today={SAMPLE_TODAY} />
    </div>
  );
}

/* ================================================================================================
 * App shell
 * ==============================================================================================*/

const appFramePage: DocPage = {
  eyebrow: 'App shell',
  title: 'App Frame',
  description: 'The app window: a sidebar docked on desktop (collapsible, animated) that becomes a modal drawer on phones, a top bar over a scrolling page, and an overlay layer for peeks.',
  hero: {
    title: 'App Frame',
    render: () => <Scaled><DemoApp /></Scaled>,
    code: demoAppCode,
  },
  sections: docSections({
    composition: `<AppFrame sidebar topbar peek sidebarOpen onSidebarOpenChange>
  sidebar   → <Sidebar.Root/>   rendered docked (≥ 768px), floating (collapsed hover-peek) or in the phone drawer
  main      → topbar (<Topbar/>: phone menu button + » when collapsed) · children (<PageLayout/>) · peek (<SidePeek/>)
</AppFrame>

useAppFrame() → { mobile, sidebarOpen, setSidebarOpen, collapsed, toggleSidebar, peeking, setPeeking, placement }`,
    a11y: [
      '⌘\\ (Ctrl+\\) collapses / expands the sidebar on desktop and opens / closes the drawer on phones.',
      'Phones (< 768px): the sidebar is a modal dialog named "Sidebar" (`drawerLabel`). The topbar menu button opens it; focus moves into it and is trapped; Escape, the backdrop or choosing an item closes it and focus returns to the menu button.',
      'Desktop: the collapsed sidebar is `inert` (out of the tab order). Hovering the topbar » button or the left edge floats it for pointer users; the » button (Enter) docks it again.',
      'Landmarks come from the parts: `nav` (sidebar), `header` (topbar), `main` (page frame), non-modal `dialog` (side peek).',
      'Width, drawer and backdrop animations are disabled under `prefers-reduced-motion`.',
    ],
    usage: [
      'Use AppFrame as the outermost layout of an app screen that has navigation: sidebar, top bar and pages.',
      'Control it with `sidebarOpen` / `onSidebarOpenChange` when other UI needs to know whether the sidebar is shown; otherwise leave it uncontrolled.',
      'Don’t nest AppFrames or put one inside a scrolling container: it fills its parent (give the parent a height, e.g. `h-screen`).',
      'Don’t use it for a single document or marketing page; use `PageLayout` on its own.',
    ],
  }),
  install: install('`AppFrame`', `import { AppFrame, Sidebar, Topbar, BreadcrumbTrail, PageLayout, PageHeader } from '@krackedui/motion';

export default function Page() {
  return (
    <div className="motion-root h-screen">
      <AppFrame
        sidebar={<Sidebar.Root><Sidebar.Item icon="page" active>Q4 roadmap</Sidebar.Item></Sidebar.Root>}
        topbar={<Topbar breadcrumbs={<BreadcrumbTrail items={[{ title: 'Q4 roadmap' }]} />} />}
      >
        <PageLayout header={<PageHeader title="Q4 roadmap" />} />
      </AppFrame>
    </div>
  );
}`),
  examples: [
    {
      title: 'Collapsed sidebar',
      description: 'Starts collapsed. Hover the » button in the topbar to see the floating sidebar, click it to dock. On a phone the menu button opens the drawer.',
      render: () => <Scaled><DemoApp collapsed name="collapsed example" /></Scaled>,
      code: `<AppFrame
  defaultSidebarOpen={false}
  sidebar={
    <Sidebar.Root header={<Sidebar.Search />}>
      <Sidebar.Item icon="page">Team wiki</Sidebar.Item>
    </Sidebar.Root>
  }
  topbar={<Topbar breadcrumbs={<BreadcrumbTrail items={[{ title: 'Team wiki' }, { title: 'Q4 roadmap', icon: '🗺️' }]} />} />}
>
  <PageLayout header={<PageHeader title="Q4 roadmap" />} />
</AppFrame>`,
    },
    {
      title: 'Controlled',
      description: '`sidebarOpen` is the docked state on desktop and the drawer state on phones (so it starts closed here).',
      render: () => <ControlledFrameDemo />,
      code: `const [open, setOpen] = useState(false);

<div className="h-[420px]">
  <AppFrame
    sidebarOpen={open}
    onSidebarOpenChange={setOpen}
    sidebar={
      <Sidebar.Root>
        <Sidebar.Section title="Workspace">
          <Sidebar.Item icon="home" href="#" active>Home</Sidebar.Item>
          <Sidebar.Item icon="inbox" href="#" trailing="3">Inbox</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Root>
    }
    topbar={<Topbar breadcrumbs={<BreadcrumbTrail items={[{ title: 'Home' }]} privacy={null} />} actions={<Button size="sm" onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'} sidebar</Button>} />}
  >
    <PageLayout as="div" header={<PageHeader title="Home" description="Everything you follow, in one place." />} />
  </AppFrame>
</div>`,
    },
    {
      title: 'With side peek',
      render: () => <Scaled><DemoApp peek name="peek example" /></Scaled>,
      code: `const [peek, setPeek] = useState(true);

<AppFrame
  sidebar={<Sidebar.Root><Sidebar.Item icon="page">Team wiki</Sidebar.Item></Sidebar.Root>}
  topbar={<Topbar breadcrumbs={<BreadcrumbTrail items={[{ title: 'Q4 roadmap' }]} />} onShare={() => setPeek(true)} />}
  peek={
    <SidePeek open={peek} onClose={() => setPeek(false)}>
      <PeekBody header={<PageHeader size="peek" title="Sidebar rebuild" />} />
    </SidePeek>
  }
>
  <PageLayout header={<PageHeader title="Q4 roadmap" />} />
</AppFrame>`,
    },
    {
      title: 'Preview scaling (docs)',
      description: 'Previews on this page render the app at 1100x640 and scale it to fit:',
      render: () => <Scaled><DemoApp fullWidth name="scaling example" /></Scaled>,
      code: scaledCode,
    },
  ],
  api: [
    {
      name: 'AppFrame',
      description: 'Based on `<div>` (children replaced by the slot). Slots accept a node or `(state: AppFrameState) => ReactNode`.',
      props: [
        { name: 'sidebar', type: 'ReactNode | ((state: AppFrameState) => ReactNode)', description: 'The sidebar, usually `<Sidebar.Root>`. It is rendered docked, floating or in the drawer; `Sidebar.Root` adapts by itself.' },
        { name: 'topbar', type: 'ReactNode | ((state: AppFrameState) => ReactNode)', description: 'Top bar, usually `<Topbar/>` (shows the phone menu button).' },
        { name: 'children', type: 'ReactNode | ((state: AppFrameState) => ReactNode)', description: 'Page frame, usually `<PageLayout/>`.' },
        { name: 'peek', type: 'ReactNode | ((state: AppFrameState) => ReactNode)', description: 'Overlay layer over the main column (`<SidePeek/>`).' },
        { name: 'sidebarOpen', type: 'boolean', description: 'Controlled: docked (desktop) / drawer open (phones).' },
        { name: 'defaultSidebarOpen', type: 'boolean', default: 'true', description: 'Initial desktop state. The phone drawer always starts closed.' },
        { name: 'onSidebarOpenChange', type: '(open: boolean) => void', description: 'Called on collapse / expand and drawer open / close.' },
        { name: 'drawerLabel', type: 'string', default: '"Sidebar"', description: 'Accessible name of the phone drawer dialog.' },
        classNameProp,
      ],
    },
    {
      name: 'AppFrameState',
      description: 'Passed to slot functions and returned by `useAppFrame()` (`useOptionalAppFrame()` returns null outside a frame).',
      props: [
        { name: 'mobile', type: 'boolean', description: 'Viewport under 768px (drawer layout).' },
        { name: 'sidebarOpen', type: 'boolean' },
        { name: 'setSidebarOpen', type: '(open: boolean) => void' },
        { name: 'collapsed', type: 'boolean', description: 'Desktop sidebar collapsed.' },
        { name: 'setCollapsed', type: '(collapsed: boolean) => void' },
        { name: 'toggleSidebar', type: '() => void' },
        { name: 'peeking', type: 'boolean', description: 'Floating hover-peek visible.' },
        { name: 'setPeeking', type: '(peeking: boolean) => void', description: 'Show / hide (hide is delayed 200ms).' },
        { name: 'placement', type: ['"docked"', '"floating"', '"drawer"'], description: 'Where the sidebar instance given this state renders.' },
        { name: 'floating', type: 'boolean', description: '`placement === "floating"`.' },
      ],
    },
  ],
};

function ControlledFrameDemo() {
  // starts closed: on phones an open sidebar is the modal drawer
  const [open, setOpen] = useState(false);
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-n-lg shadow-n-shadow-outline-sm">
      <AppFrame
        sidebarOpen={open}
        onSidebarOpenChange={setOpen}
        sidebar={
          <Sidebar.Root width={220} label="Sidebar (controlled example)">
            <Sidebar.Section title="Workspace">
              <Sidebar.Item icon="home" href="#" active>Home</Sidebar.Item>
              <Sidebar.Item icon="inbox" href="#" trailing="3">Inbox</Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Root>
        }
        topbar={<Topbar breadcrumbs={<BreadcrumbTrail label="Breadcrumb (controlled example)" items={[{ title: 'Home' }]} privacy={null} />} actions={<Button size="sm" onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'} sidebar</Button>} />}
      >
        <PageLayout as="div" header={<PageHeader title="Home" description="Everything you follow, in one place." />} />
      </AppFrame>
    </div>
  );
}

const sidebarPage: DocPage = {
  eyebrow: 'App shell',
  title: 'Sidebar',
  description: 'App navigation: header, sections of links, a keyboard-navigable page tree, footer and bottom bar. Inside an AppFrame it docks, floats when collapsed, and becomes the phone drawer.',
  hero: {
    title: 'Sidebar',
    render: () => <div className="h-[600px]"><DemoSidebar /></div>,
    code: `import { Sidebar, WorkspaceMenu, HelpMenu, AppsMenu, Icon } from '@krackedui/motion';

<div className="h-[600px]">
${indentCode(demoSidebarCode, 2)}
</div>`,
    previewClassName: 'p-6',
  },
  sections: docSections({
    composition: `<Sidebar.Root header footer bottomBar>      // nav "Sidebar", 270 wide, resizable 200–480
  <Sidebar.Header/>  pinned top (or the header prop: <Sidebar.Search/> <Sidebar.Tabs/>)
  scroller   → <Sidebar.Section title actions>
                 <Sidebar.Item icon href active trailing actions/>
               </Sidebar.Section>
               <Sidebar.Tree> <Sidebar.TreeItem> <Sidebar.TreeItem/> </Sidebar.TreeItem> </Sidebar.Tree>
               <Sidebar.ScrollFooter> <Sidebar.Item/> </Sidebar.ScrollFooter>
  <Sidebar.Footer/>  pinned bottom (or footer / bottomBar props)
</Sidebar.Root>`,
    a11y: [
      '`nav` landmark labelled "Sidebar" (`label`). Items are real links (`href`) or buttons; the current page has `aria-current="page"`.',
      'Sections are labelled groups; the heading is a button with `aria-expanded` that collapses the content (animated height).',
      'The page tree follows the WAI-ARIA tree pattern: one tab stop; ↑/↓ move, → expands or moves to the first child, ← collapses or moves to the parent, Home/End jump, Enter opens. Items expose `aria-level`, `aria-expanded`, `aria-selected`.',
      'Hover actions (+, …) of the focused row are reachable with Tab and appear on focus; on touch screens they are always visible and targets grow to 24px+.',
      'The resize handle is a "Sidebar width" slider (a native range input announcing the width): →/↑ widen, ←/↓ narrow by 10px, Page Up/Down by 50px, Home/End jump to `minWidth`/`maxWidth`; clicking the strip collapses the sidebar.',
      'The tabs are a `tablist` (←/→, Home/End move and select).',
    ],
    usage: [
      'Use it as the `sidebar` of an `AppFrame` for app-level navigation between pages and sections.',
      'Use `href` items for navigation and button items (`onClick`) for actions such as “New page”; mark the current page `active`.',
      'Use `Sidebar.Tree` for nested, user-created pages; use `Sidebar.Section` + `Sidebar.Item` for a fixed menu.',
      'Don’t put forms or long content in the sidebar; keep rows to one line (labels truncate).',
      'Don’t use it for in-page navigation (a table of contents); use `PageTocRail` or `Tabs`.',
    ],
  }),
  install: install('`Sidebar`', `import { Sidebar } from '@krackedui/motion';

export default function Nav() {
  return (
    <Sidebar.Root header={<Sidebar.Search />}>
      <Sidebar.Item icon="bookshelf" href="/library">Library</Sidebar.Item>
    </Sidebar.Root>
  );
}`),
  examples: [
    {
      title: 'Sections, links and footer',
      description: 'The basic parts: `Header`, `Section`, `Item` (`href`, `active`, `trailing`) and `Footer`.',
      render: () => (
        <div className="h-[360px]">
          <Sidebar.Root width={240} label="Workspace navigation">
            <Sidebar.Header><Sidebar.WorkspaceSwitcher name="Design Team" /></Sidebar.Header>
            <Sidebar.Section title="Workspace">
              <Sidebar.Item icon="home" href="#home" active>Home</Sidebar.Item>
              <Sidebar.Item icon="inbox" href="#inbox" trailing="3">Inbox</Sidebar.Item>
              <Sidebar.Item icon="calendar" href="#calendar">Calendar</Sidebar.Item>
            </Sidebar.Section>
            <Sidebar.Section title="Favorites">
              <Sidebar.Item icon="star" href="#roadmap">Q4 roadmap</Sidebar.Item>
            </Sidebar.Section>
            <Sidebar.Footer>
              <Sidebar.Item icon="settings" onClick={() => undefined}>Settings</Sidebar.Item>
            </Sidebar.Footer>
          </Sidebar.Root>
        </div>
      ),
      code: `<div className="h-[360px]">
  <Sidebar.Root width={240} label="Workspace navigation">
    <Sidebar.Header><Sidebar.WorkspaceSwitcher name="Design Team" /></Sidebar.Header>
    <Sidebar.Section title="Workspace">
      <Sidebar.Item icon="home" href="#home" active>Home</Sidebar.Item>
      <Sidebar.Item icon="inbox" href="#inbox" trailing="3">Inbox</Sidebar.Item>
      <Sidebar.Item icon="calendar" href="#calendar">Calendar</Sidebar.Item>
    </Sidebar.Section>
    <Sidebar.Section title="Favorites">
      <Sidebar.Item icon="star" href="#roadmap">Q4 roadmap</Sidebar.Item>
    </Sidebar.Section>
    <Sidebar.Footer>
      <Sidebar.Item icon="settings" onClick={() => console.log('Open settings')}>Settings</Sidebar.Item>
    </Sidebar.Footer>
  </Sidebar.Root>
</div>`,
    },
    {
      title: 'Page tree',
      render: () => <TreeDemo />,
      description: 'Hover actions are opt-in: "+" with `onAdd`, "…" with `onMore` (or `moreSlot`); rename them for other content with `addLabel` / `moreLabel`.',
      code: `const add = (page: string) => console.log('Add inside', page);
const more = (page: string) => console.log('More for', page);

<Sidebar.Tree label="Private pages">
  <Sidebar.TreeItem label="Team wiki" defaultExpanded onAdd={() => add('Team wiki')} onMore={() => more('Team wiki')}>
    <Sidebar.TreeItem label="Q4 roadmap" emoji="🗺️" active onAdd={() => add('Q4 roadmap')} onMore={() => more('Q4 roadmap')} />
    <Sidebar.TreeItem label="Meeting notes" onAdd={() => add('Meeting notes')} onMore={() => more('Meeting notes')} />
  </Sidebar.TreeItem>
  <Sidebar.TreeItem label="Product specs" defaultExpanded onAdd={() => add('Product specs')} onMore={() => more('Product specs')} />
</Sidebar.Tree>`,
    },
    {
      title: 'Item tones',
      render: () => (
        <div className="w-[254px] bg-n-bg-secondary p-1 text-n-text-accent-primary">
          <Sidebar.Item icon="bookshelf">Default</Sidebar.Item>
          <Sidebar.Item icon="bookshelf" active>Active</Sidebar.Item>
          <Sidebar.Item tone="secondary" icon={<Icon name="plus" size={16} />}>Secondary</Sidebar.Item>
          <Sidebar.Item tone="muted" icon="ellipsis">Muted</Sidebar.Item>
        </div>
      ),
      code: `<Sidebar.Item icon="bookshelf">Default</Sidebar.Item>
<Sidebar.Item icon="bookshelf" active>Active</Sidebar.Item>
<Sidebar.Item tone="secondary" icon={<Icon name="plus" size={16} />}>Secondary</Sidebar.Item>
<Sidebar.Item tone="muted" icon="ellipsis">Muted</Sidebar.Item>`,
    },
    {
      title: 'Bottom bar',
      render: () => (
        <div className="w-[270px] bg-n-bg-secondary">
          <Sidebar.BottomBar>
            <Sidebar.WorkspaceSwitcher name="Design Team" />
            <Sidebar.BarButton icon="questionMarkCircle" label="Help" dot />
            <Sidebar.BarButton icon="circleGrid2X2" label="Library, Trash, more…" />
          </Sidebar.BottomBar>
        </div>
      ),
      code: `<Sidebar.BottomBar>
  <Sidebar.WorkspaceSwitcher name="Design Team" />
  <Sidebar.BarButton icon="questionMarkCircle" label="Help" dot />
  <Sidebar.BarButton icon="circleGrid2X2" label="Library, Trash, more…" />
</Sidebar.BottomBar>`,
    },
  ],
  api: [
    {
      name: 'Sidebar.Root',
      description: 'Based on `<nav>`. Adds:',
      props: [
        { name: 'width', type: 'number', default: '270', description: 'Width in px; controlled when `onWidthChange` is given.' },
        { name: 'onWidthChange', type: '(width: number) => void' },
        { name: 'minWidth', type: 'number', default: '200' },
        { name: 'maxWidth', type: 'number', default: '480' },
        { name: 'header', type: 'ReactNode', description: '`<Sidebar.Search/>` + `<Sidebar.Tabs/>`.' },
        { name: 'footer', type: 'ReactNode', description: 'Between scroller and bottom bar (`<Sidebar.InviteCard/>`).' },
        { name: 'bottomBar', type: 'ReactNode', description: '`<Sidebar.BottomBar/>`.' },
        { name: 'floating', type: 'boolean', description: 'Floating hover-peek look; hides the resize handle. Set for you inside an AppFrame.' },
        { name: 'onCollapse', type: '() => void', description: 'Click on the resize handle. Inside an AppFrame defaults to collapsing the frame sidebar.' },
        { name: 'label', type: 'string', default: '"Sidebar"', description: 'Accessible name of the `nav`.' },
        { name: 'children', type: 'ReactNode', description: 'Scrolling content; `Sidebar.Header` / `Sidebar.Footer` children are pinned above / below it.' },
      ],
    },
    { name: 'Sidebar.Header', description: 'Based on `<div>`. Pinned top region (does not scroll).', props: [divProps] },
    { name: 'Sidebar.Footer', description: 'Based on `<div>`. Pinned bottom region with a top hairline.', props: [divProps] },
    {
      name: 'Sidebar.Search',
      description: 'Based on `<button>`.',
      props: [
        { name: 'label', type: 'string', default: '"Search or ask"' },
        { name: 'shortcut', type: 'string', default: '"⌘K"', description: 'Kbd pill; empty hides it.' },
      ],
    },
    {
      name: 'Sidebar.Tabs',
      description: 'Based on `<div>` (except `onChange`).',
      props: [
        { name: 'tabs', type: 'SidebarTab[]', default: 'Home, Chat, Meetings', description: '`{ id, label, icon }`.' },
        { name: 'value', type: 'string', description: 'Controlled active tab.' },
        { name: 'defaultValue', type: 'string', default: 'first tab' },
        { name: 'onValueChange', type: '(id: string) => void' },
        { name: 'trailing', type: 'ReactNode', default: '« collapse button', description: 'Right side of the row.' },
        { name: 'onCollapse', type: '() => void', description: 'Shows the « button (revealed on sidebar hover). Defaults to collapsing the AppFrame sidebar.' },
      ],
    },
    {
      name: 'ShellGlyph',
      description: 'The Home / Chat / Meetings glyphs used by `Sidebar.Tabs` (an `Icon`; other SVG props pass through). Use it to draw the same glyph elsewhere, e.g. a custom tab trigger.',
      props: [
        { name: 'name', type: "'home' | 'chat' | 'calendar'", description: 'Glyph (required).' },
        { name: 'size', type: 'number', default: '20', description: 'Width and height in px.' },
      ],
    },
    {
      name: 'Sidebar.Item',
      description: 'A row whose control is `<a>` (with `href`), `<button>`, or your element (`asChild`). Other props go to the control.',
      props: [
        { name: 'children', type: 'ReactNode', description: 'Label (truncates).' },
        { name: 'icon', type: 'IconName | string | ReactElement', description: 'An icon name, an emoji or other short text, or an element.' },
        { name: 'iconSize', type: 'number', default: '22' },
        { name: 'href', type: 'string', description: 'Render a link.' },
        { name: 'asChild', type: 'boolean', default: 'false', description: 'Use the child element (e.g. a router `Link`) as the control.' },
        { name: 'onClick', type: '(e: MouseEvent) => void', description: 'Activation; in the phone drawer the drawer closes afterwards unless you call `preventDefault()`.' },
        { name: 'active', type: 'boolean', default: 'false', description: 'Current page: highlighted, `aria-current="page"`.' },
        { name: 'trailing', type: 'ReactNode', description: 'Always-visible right content (count, shortcut).' },
        { name: 'tone', type: ['"default"', '"muted"', '"secondary"'], default: '"default"' },
        { name: 'actions', type: 'ReactNode', description: 'Hover actions on the right.' },
        { name: 'rowClassName', type: 'string', description: 'Class for the row container (`className` goes there too).' },
      ],
    },
    {
      name: 'Sidebar.Action',
      description: 'Based on `<button>`. 20x20 hover affordance.',
      props: [
        { name: 'icon', type: 'IconName', description: '(required)' },
        { name: 'label', type: 'string', description: 'aria-label and title (required).' },
      ],
    },
    {
      name: 'Sidebar.Section',
      description: 'Based on `<div>` (except `title`).',
      props: [
        { name: 'title', type: 'ReactNode', description: 'Heading; with it the section collapses on click. Without it the section is a plain group.' },
        { name: 'actions', type: 'ReactNode', description: 'Header hover actions.' },
        { name: 'defaultOpen', type: 'boolean', default: 'true' },
        { name: 'open', type: 'boolean' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
      ],
    },
    { name: 'Sidebar.Tree', description: 'Based on `<div role="tree">`.', props: [{ name: 'label', type: 'string', description: 'aria-label.' }] },
    {
      name: 'Sidebar.TreeItem',
      description: 'Based on `<div>` (except `children` / `onSelect`).',
      props: [
        { name: 'label', type: 'ReactNode', description: '(required)' },
        { name: 'icon', type: 'IconName | ReactElement', default: '"page"', description: 'Icon name or an element (use `emoji` for emoji).' },
        { name: 'emoji', type: 'string', description: 'Emoji page icon.' },
        { name: 'active', type: 'boolean', default: 'false' },
        { name: 'defaultExpanded', type: 'boolean', default: 'false' },
        { name: 'expanded', type: 'boolean' },
        { name: 'onExpandedChange', type: '(expanded: boolean) => void' },
        { name: 'children', type: 'ReactNode', description: 'Nested tree items.' },
        { name: 'emptyLabel', type: 'ReactNode', default: '"No pages inside"' },
        { name: 'onSelect', type: '() => void' },
        { name: 'onAdd', type: '() => void', description: 'Shows the hover "+" action (opt-in).' },
        { name: 'addLabel', type: 'string', default: '"Add a page inside"', description: 'Accessible name and tooltip of the "+" action.' },
        { name: 'onMore', type: '(e: MouseEvent<HTMLButtonElement>) => void', description: 'Shows the hover "…" action (opt-in).' },
        { name: 'moreLabel', type: 'string', default: '"Delete, duplicate, and more…"', description: 'Accessible name of the "…" action.' },
        { name: 'moreSlot', type: 'ReactNode', description: 'Your own "…" control (e.g. a Menu trigger); shows the actions area.' },
      ],
    },
    {
      name: 'Sidebar.InviteCard',
      description: 'Based on `<button>` (except `title`), plus a dismiss button.',
      props: [
        { name: 'title', type: 'ReactNode', default: '"Invite members"' },
        { name: 'description', type: 'ReactNode', default: '"Collaborate with your team."' },
        { name: 'icon', type: 'IconName', default: '"inviteMember"' },
        { name: 'onDismiss', type: '() => void' },
      ],
    },
    {
      name: 'Sidebar.WorkspaceSwitcher',
      description: 'Based on `<button>`.',
      props: [
        { name: 'name', type: 'string', description: '(required)' },
        { name: 'avatar', type: 'ReactNode', default: 'letter avatar' },
      ],
    },
    {
      name: 'Sidebar.BarButton',
      description: 'Based on `<button>`. 28x28.',
      props: [
        { name: 'icon', type: 'IconName', description: '(required)' },
        { name: 'label', type: 'string', description: '(required)' },
        { name: 'dot', type: 'boolean', default: 'false', description: 'Blue unread dot.' },
      ],
    },
    {
      name: 'Sidebar.Group / Sections / ScrollFooter / BottomBar',
      description: 'Layout wrappers based on `<div>`: rows with 1px gap, sections with 4px gap, bottom-of-scroller footer, 44px bottom bar.',
      props: [divProps],
    },
  ],
};

const noop = () => {};

function TreeDemo() {
  return (
    <div className="w-[254px] bg-n-bg-secondary p-1 font-medium text-n-text-accent-primary">
      <Sidebar.Tree label="Private pages">
        <Sidebar.TreeItem label="Team wiki" defaultExpanded onAdd={noop} onMore={noop}>
          <Sidebar.TreeItem label="Q4 roadmap" emoji="🗺️" active onAdd={noop} onMore={noop} />
          <Sidebar.TreeItem label="Meeting notes" onAdd={noop} onMore={noop} />
        </Sidebar.TreeItem>
        <Sidebar.TreeItem label="Product specs" defaultExpanded onAdd={noop} onMore={noop} />
      </Sidebar.Tree>
    </div>
  );
}

const topbarPage: DocPage = {
  eyebrow: 'App shell',
  title: 'Topbar',
  description: 'The 44px bar above a page: breadcrumbs on the left, page actions on the right. Inside an AppFrame it adds the phone menu button that opens the sidebar drawer.',
  hero: {
    title: 'Topbar',
    render: () => (
      <div className="w-[620px] max-w-full overflow-hidden rounded-n-md shadow-n-shadow-outline-sm">
        <Topbar
          breadcrumbs={<BreadcrumbTrail items={[{ title: 'Team wiki' }, { title: 'Q4 roadmap', icon: '🗺️' }]} />}
          edited="Edited 2m ago"
          onShare={() => {}}
          onCopyLink={() => {}}
          favorite={false}
          onFavorite={() => {}}
          moreSlot={<TopbarButton icon="ellipsis" label="Actions" iconSize={22} tone="primary" />}
        />
      </div>
    ),
    code: `import { Topbar, TopbarButton, BreadcrumbTrail } from '@krackedui/motion';

// Document actions are opt-in: each one shows when its prop is set.
<Topbar
  breadcrumbs={<BreadcrumbTrail items={[{ title: 'Team wiki' }, { title: 'Q4 roadmap', icon: '🗺️' }]} />}
  edited="Edited 2m ago"
  onShare={() => console.log('Share')}
  onCopyLink={() => console.log('Copy link')}
  favorite={false}
  onFavorite={() => console.log('Favorite')}
  moreSlot={<TopbarButton icon="ellipsis" label="Actions" iconSize={22} tone="primary" />}
/>`,
  },
  sections: docSections({
    composition: `<Topbar breadcrumbs actions>        // header, 44px
  breadcrumb region → [menu button < 768px] · [» when collapsed] · <BreadcrumbTrail items privacy/>
  actions           → your own \`actions\` (built from <TopbarButton/> or Button), or
                      opt-in document actions (<TopbarActions/>): Edited · Share · Copy link · Favorite · Actions (moreSlot),
                      each shown only when its prop is set; nothing by default
</Topbar>`,
    a11y: [
      'Rendered as `header`. `BreadcrumbTrail` is a `nav` "Breadcrumb" with an ordered list; the last crumb has `aria-current="page"`.',
      'Inside an AppFrame on phones, the "Open sidebar" menu button opens the drawer (`aria-expanded`); focus returns to it when the drawer closes.',
      'Every icon button has an `aria-label` and a tooltip; Favorite exposes `aria-pressed`.',
      'With `idle`, the bar fades out but comes back on hover and on keyboard focus (`focus-within`).',
      'Pass a `Menu.Trigger` as `moreSlot` so the Actions button opens a keyboard-navigable menu.',
    ],
    usage: [
      'Use it as the `topbar` of an `AppFrame` to show where the user is and the actions for the current page.',
      'Keep actions few; on phones the “Edited” label, Copy link and Favorite are hidden and only the current crumb is shown.',
      'App screens: pass your own `actions` (or none: the right side stays empty). Document pages: opt into the document actions with `edited`, `onShare`, `onCopyLink`, `onFavorite` and `moreSlot`.',
      'Don’t use it as a site header with primary navigation; put navigation in the `Sidebar`.',
    ],
  }),
  install: install('`Topbar`', `import { Topbar, BreadcrumbTrail } from '@krackedui/motion';

export default function Bar() {
  return <Topbar breadcrumbs={<BreadcrumbTrail items={[{ title: 'Q4 roadmap' }]} />} />;
}`),
  examples: [
    {
      title: 'Collapsed sidebar and favorite',
      render: () => (
        <div className="w-[620px] max-w-full overflow-hidden rounded-n-md shadow-n-shadow-outline-sm">
          <Topbar sidebarCollapsed favorite breadcrumbs={<BreadcrumbTrail label="Breadcrumb (collapsed example)" items={[{ title: 'Q4 roadmap' }]} privacy="Shared" />} edited={null} />
        </div>
      ),
      code: `<Topbar
  sidebarCollapsed
  favorite
  breadcrumbs={<BreadcrumbTrail items={[{ title: 'Q4 roadmap' }]} privacy="Shared" />}
  edited={null}
/>`,
    },
    {
      title: 'Custom actions',
      render: () => (
        <div className="w-[620px] max-w-full overflow-hidden rounded-n-md shadow-n-shadow-outline-sm">
          <Topbar
            breadcrumbs={<BreadcrumbTrail label="Breadcrumb (custom actions example)" items={[{ title: 'Design Team' }, { title: 'Q4 roadmap' }]} privacy={null} />}
            actions={<><Button size="sm" variant="ghost">Publish</Button><TopbarButton icon="ellipsis" label="Actions" tone="primary" iconSize={22} /></>}
          />
        </div>
      ),
      code: `<Topbar
  breadcrumbs={<BreadcrumbTrail items={[{ title: 'Design Team' }, { title: 'Q4 roadmap' }]} privacy={null} />}
  actions={
    <>
      <Button size="sm" variant="ghost">Publish</Button>
      <TopbarButton icon="ellipsis" label="Actions" tone="primary" iconSize={22} />
    </>
  }
/>`,
    },
  ],
  api: [
    {
      name: 'Topbar',
      description: 'Based on `<header>`. Adds:',
      props: [
        { name: 'breadcrumbs', type: 'ReactNode', description: 'Usually `<BreadcrumbTrail/>`.' },
        { name: 'edited', type: 'ReactNode | null', description: 'Document action (opt-in): "Edited 2m ago" text, hidden on tablets and phones.' },
        { name: 'actions', type: 'ReactNode', description: 'Right side of the bar; overrides the document actions. Empty by default.' },
        { name: 'sidebarCollapsed', type: 'boolean', description: 'Show the » open-sidebar button (desktop). Inside an AppFrame it follows the frame.' },
        { name: 'onOpenSidebar', type: '() => void', description: 'Click on ». Defaults to docking the AppFrame sidebar.' },
        { name: 'onSidebarPeek', type: '(peeking: boolean) => void', description: 'Hover on » (floating sidebar). Defaults to the AppFrame hover-peek.' },
        { name: 'menuButton', type: 'boolean', default: 'true', description: 'Inside an AppFrame, show the phone (< 768px) menu button that opens the drawer.' },
        { name: 'idle', type: 'boolean', default: 'false', description: 'Faded while typing; returns on hover / focus.' },
        { name: 'favorite', type: 'boolean', description: 'Document action (opt-in): shows the Favorite star, pressed when true.' },
        { name: 'onShare', type: '() => void', description: 'Document action (opt-in): shows the Share button.' },
        { name: 'onCopyLink', type: '() => void', description: 'Document action (opt-in): shows Copy link.' },
        { name: 'onFavorite', type: '() => void', description: 'Document action (opt-in): shows the Favorite star.' },
        { name: 'moreSlot', type: 'ReactNode', description: 'Document action (opt-in): the "…" button, e.g. a `Menu.Trigger` around `<TopbarButton icon="ellipsis"/>`.' },
      ],
    },
    {
      name: 'BreadcrumbTrail',
      description: 'Based on `<div>`.',
      props: [
        { name: 'items', type: 'Crumb[]', description: '`{ title: ReactNode; icon?: ReactNode; onClick?: () => void }` (required).' },
        { name: 'privacy', type: 'ReactNode | null', default: '"Private"', description: 'Badge after the trail; null hides it.' },
        { name: 'onPrivacyClick', type: '() => void' },
        { name: 'label', type: 'string', default: '"Breadcrumb"', description: 'Accessible name of the breadcrumb `nav`; make it unique when several trails share a page.' },
      ],
    },
    {
      name: 'TopbarButton',
      description: 'Based on `<button>`. 28x28, radius 6.',
      props: [
        { name: 'icon', type: 'IconName', description: '(required)' },
        { name: 'label', type: 'string', description: '(required)' },
        { name: 'iconSize', type: 'number', default: '20' },
        { name: 'tone', type: ['"primary"', '"secondary"'], default: '"secondary"' },
        { name: 'tooltip', type: 'ReactNode' },
      ],
    },
    {
      name: 'TopbarActions',
      description: 'The document action cluster on its own (e.g. as a peek\'s `actions`). Each control renders only when its prop is set; with none it renders nothing.',
      props: [
        { name: 'edited', type: 'ReactNode | null', description: '"Edited 2m ago" text.' },
        { name: 'favorite', type: 'boolean', description: 'Shows the Favorite star, pressed when true.' },
        { name: 'onShare', type: '() => void', description: 'Shows Share.' },
        { name: 'onCopyLink', type: '() => void', description: 'Shows Copy link.' },
        { name: 'onFavorite', type: '() => void', description: 'Shows the Favorite star.' },
        { name: 'moreSlot', type: 'ReactNode', description: 'The "…" button (e.g. a menu trigger).' },
      ],
    },
  ],
};

const pageLayoutPage: DocPage = {
  eyebrow: 'App shell',
  title: 'Page Layout',
  description: 'The scrolling page frame: a 3-column grid with a 720px content column (16px gutters on phones), an optional cover, the page header and a table-of-contents rail.',
  hero: {
    title: 'Page Layout',
    render: () => (
      <Scaled>
        <div className="flex size-full flex-col">
          <PageLayout as="div" toc={demoToc} cover={<PageCover><DemoCover /></PageCover>} header={<PageHeader title="Q4 roadmap" icon="🗺️" />}>
            <DemoBody />
          </PageLayout>
        </div>
      </Scaled>
    ),
    code: `import { PageLayout, PageCover, PageHeader } from '@krackedui/motion';

<PageLayout
  toc={[{ id: 'goals', label: 'Goals', level: 1 }, { id: 'milestones', label: 'Milestones', level: 2 }]}
  cover={<PageCover src="/covers/roadmap.jpg" />}
  header={<PageHeader title="Q4 roadmap" icon="🗺️" />}
>
  {/* page blocks */}
</PageLayout>`,
  },
  sections: docSections({
    composition: `<PageLayout cover header toc fullWidth as>   // main (or div); grid 16 | 1fr | 16 → 48 → minmax(96,1fr) | 720 | minmax(96,1fr)
  <PageCover src | children/>              // full row, 30vh ≤ 280, hover: Change cover | Reposition
  <PageHeader icon title description actions controls/>
  children (page body)
  <PageTocRail/>                            // right edge (≥ 1024px); hover lists headings
</PageLayout>`,
    a11y: [
      'The frame is a `main` landmark; pass `as="div"` when it is not the page’s main content (previews, several pages on screen).',
      'Cover buttons appear on hover and on keyboard focus (`focus-within`).',
      'The TOC rail is a "Table of contents" disclosure button (`aria-expanded`): hover, click, Enter or Space open the heading list, a `nav` with the same name whose current heading has `aria-current="location"`; Escape or moving focus away closes it. The rail is hidden under 1024px.',
    ],
    usage: [
      'Use it for a document-like page: one readable column with an optional cover and outline.',
      'Use `fullWidth` for wide content such as a full-page database.',
      'Don’t put a second scrolling container around it; the layout scrolls itself.',
      'Don’t use it for dashboards with many columns; use `Grid` / `Stack` inside a plain container.',
    ],
  }),
  install: install('`PageLayout`', `import { PageLayout, PageHeader } from '@krackedui/motion';

export default function Page() {
  return (
    <PageLayout header={<PageHeader title="Q4 roadmap" />}>
      <p>Page content</p>
    </PageLayout>
  );
}`),
  examples: [
    {
      title: 'No cover, full width',
      render: () => (
        <Scaled>
          <div className="flex size-full flex-col">
            <PageLayout as="div" fullWidth header={<PageHeader title="Meeting notes" icon="📝" controls="always" />}>
              <DemoBody />
            </PageLayout>
          </div>
        </Scaled>
      ),
      code: `<PageLayout fullWidth header={<PageHeader title="Meeting notes" icon="📝" controls="always" />}>
  <div className="flex flex-col gap-2 px-2 text-[16px] leading-6">
    <div className="pt-6 text-[30px] font-semibold leading-[39px]">Goals</div>
    <p>Ship the redesigned onboarding, the new billing page and the Q4 roadmap review.</p>
    <div className="pt-4 text-[24px] font-semibold leading-[31px]">Milestones</div>
    <p>Design review on Oct 20, beta on Nov 3, general availability on Dec 1.</p>
  </div>
</PageLayout>`,
    },
    {
      title: 'TOC rail',
      render: () => <div className="relative h-32 w-48"><PageTocRail entries={demoToc} activeId="milestones" className="absolute right-0 top-4" /></div>,
      code: `const toc = [
  { id: 'goals', label: 'Goals', level: 1 as const },
  { id: 'milestones', label: 'Milestones', level: 2 as const },
  { id: 'risks', label: 'Risks', level: 2 as const },
];
const [activeId, setActiveId] = useState('milestones');

<PageTocRail
  entries={toc}
  activeId={activeId}
  onSelect={(id) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }}
/>`,
    },
  ],
  api: [
    {
      name: 'PageLayout',
      description: 'Based on `<main>` (or `<div>`). Children = page body.',
      props: [
        { name: 'cover', type: 'ReactNode', description: '`<PageCover/>`.' },
        { name: 'header', type: 'ReactNode', description: '`<PageHeader/>`.' },
        { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Columns `96px | 1fr | 96px`.' },
        { name: 'toc', type: 'TocEntry[]', description: '`{ id, label, level?: 1 | 2 | 3 }`; omit to hide the rail.' },
        { name: 'activeTocId', type: 'string', default: 'first entry' },
        { name: 'onTocSelect', type: '(id: string) => void' },
        { name: 'coverHeight', type: 'number', default: '280', description: 'Used to place the rail.' },
        { name: 'hasIcon', type: 'boolean', default: 'false' },
        { name: 'scrollerRef', type: 'Ref<HTMLDivElement>', description: 'The scrolling element.' },
        { name: 'as', type: ['"main"', '"div"'], default: '"main"', description: 'Root element.' },
        { name: 'variant', type: ['"document"', '"app"'], default: '"document"', description: '`document`: the 720px reading column with wide gutters. `app`: dense screens beside a sidebar (dashboards, tables, settings): 16/24/32px gutters, content up to 1200px, and a compact `PageHeader`.' },
      ],
    },
    {
      name: 'PageCover',
      description: 'Based on `<div>`.',
      props: [
        { name: 'src', type: 'string', description: 'Image URL.' },
        { name: 'position', type: 'string', default: '"center 28%"', description: 'CSS object-position.' },
        { name: 'children', type: 'ReactNode', description: 'Instead of `src` (gradient, custom node).' },
        { name: 'onChangeCover', type: '() => void' },
        { name: 'onReposition', type: '() => void' },
      ],
    },
    {
      name: 'PageTocRail',
      description: 'Based on `<div>` (except `onSelect`).',
      props: [
        { name: 'entries', type: 'TocEntry[]', description: '(required)' },
        { name: 'activeId', type: 'string' },
        { name: 'onSelect', type: '(id: string) => void' },
      ],
    },
  ],
};

const pageHeaderPage: DocPage = {
  eyebrow: 'App shell',
  title: 'Page Header',
  description: 'The top of a page: optional icon, the title (`h1`, editable in place), a description and right-aligned actions, plus the Add icon / cover / comment controls.',
  hero: {
    title: 'Page Header',
    render: () => (
      <div className="w-full max-w-[640px]">
        <PageHeader title="Q4 roadmap" description="Goals, milestones and owners for the quarter." actions={<><Button variant="secondary">Share</Button><Button variant="primary">New task</Button></>} />
      </div>
    ),
    code: `import { PageHeader, Button } from '@krackedui/motion';

<PageHeader
  title="Q4 roadmap"
  description="Goals, milestones and owners for the quarter."
  actions={
    <>
      <Button variant="secondary">Share</Button>
      <Button variant="primary">New task</Button>
    </>
  }
/>`,
  },
  sections: docSections({
    a11y: [
      'The title is the page’s `h1`. When editable it contains a single-line `textbox` named "Page title" with `aria-placeholder`; Enter leaves the field.',
      'The icon is decorative unless `onAddIcon` is given, then it is a button "Change page icon".',
      'Hover controls also appear on keyboard focus (`focus-within`) and are always visible on touch screens.',
      'Actions wrap under the title on narrow screens; the title wraps long words.',
    ],
    usage: [
      'Use one PageHeader per page, as the `header` of `PageLayout` or `PeekBody`.',
      'Use `onTitleChange` for documents whose title the user edits in place; pass a plain `title` for app pages.',
      'Keep `actions` to the one or two most important page actions; put the rest in a `Menu`.',
      'Don’t use it for section headings inside a page; use a heading block or `Card.Title`.',
    ],
  }),
  install: install('`PageHeader`', `import { PageHeader } from '@krackedui/motion';

export default function Header() {
  return <PageHeader title="Q4 roadmap" description="Goals, milestones and owners for the quarter." />;
}`),
  examples: [
    {
      title: 'Editable title with controls',
      description: 'Hover to reveal Add icon / Add cover / Add comment.',
      render: () => <EditableHeaderDemo />,
      code: `const [title, setTitle] = useState('Meeting notes');

<PageHeader
  title={title}
  onTitleChange={setTitle}
  onAddIcon={() => console.log('Pick an icon')}
  onAddCover={() => console.log('Pick a cover')}
  onAddComment={() => console.log('Comment')}
/>`,
    },
    {
      title: 'With icon',
      render: () => <div className="w-full max-w-[640px]"><PageHeader title="Product specs" icon="📐" description="Living specs for every shipped feature." /></div>,
      code: `<PageHeader title="Product specs" icon="📐" description="Living specs for every shipped feature." />`,
    },
    {
      title: 'Empty title',
      render: () => <div className="w-full max-w-[600px]"><PageHeader editable controls="always" onTitleChange={() => undefined} /></div>,
      code: `<PageHeader editable controls="always" onTitleChange={(t) => console.log(t)} />   // "New page" placeholder`,
    },
  ],
  api: [
    {
      name: 'PageHeader',
      description: 'Based on `<div>` (except `title`).',
      props: [
        { name: 'title', type: 'ReactNode', description: 'Page title (`h1`).' },
        { name: 'description', type: 'ReactNode', description: 'Line under the title.' },
        { name: 'actions', type: 'ReactNode', description: 'Right of the title; wraps under it on phones.' },
        { name: 'icon', type: 'ReactNode', description: 'Emoji or node (78px).' },
        { name: 'placeholder', type: 'string', default: '"New page"' },
        { name: 'onTitleChange', type: '(title: string) => void' },
        { name: 'editable', type: 'boolean', default: '!!onTitleChange', description: 'Edit a string title in place.' },
        { name: 'size', type: ['"page"', '"peek"', '"app"'], default: '"page" ("app" inside `PageLayout variant="app"`)', description: 'Title 40/48 (32/38.4 on phones), 32/38.4 (peek), or 24/32 semibold flush with the content (app screens; the description sits under the title).' },
        { name: 'controls', type: ['"hover"', '"always"', '"none"'], default: '"hover" with handlers, else "none"' },
        { name: 'onAddIcon', type: '() => void' },
        { name: 'onAddCover', type: '() => void' },
        { name: 'onAddComment', type: '() => void' },
        { name: 'extraControls', type: 'ReactNode' },
        { name: 'children', type: 'ReactNode', description: 'Under the title (properties, backlinks…).' },
      ],
    },
  ],
};

function EditableHeaderDemo() {
  const [title, setTitle] = useState('Meeting notes');
  return (
    <div className="w-full max-w-[640px]">
      <PageHeader title={title} onTitleChange={setTitle} onAddIcon={() => undefined} onAddCover={() => undefined} onAddComment={() => undefined} />
    </div>
  );
}

const peekPage: DocPage = {
  eyebrow: 'App shell',
  title: 'Peek',
  description: 'Open a page without leaving the current one: the side peek docked at the right edge, or the center peek modal. Both share the top bar and body parts.',
  hero: {
    title: 'Side Peek',
    render: () => (
      <Scaled>
        <div className="relative size-full bg-n-bg-secondary">
          <SidePeek width={660} autoFocus={false}><DemoPeekBody /></SidePeek>
        </div>
      </Scaled>
    ),
    code: `import { SidePeek, PeekBody, PeekProperties, PeekProperty, PeekComments, PageHeader } from '@krackedui/motion';

const [open, setOpen] = useState(true);

<div className="relative h-[640px] bg-n-bg-secondary">
  <Button variant="secondary" onClick={() => setOpen(true)}>Open side peek</Button>
  <SidePeek open={open} width={660} onClose={() => setOpen(false)} onSwitchMode={() => console.log('Switch to center peek')}>
      <PeekBody
        header={<PageHeader size="peek" title="Sidebar rebuild" extraControls={null} />}
        properties={
          <PeekProperties>
            <PeekProperty icon="calendarDate15" label="Due">October 9, 2026</PeekProperty>
            <PeekProperty icon="arrowInCircleDown" label="Priority">High</PeekProperty>
            <PeekProperty icon="checkmarkCircle" label="Status" />
          </PeekProperties>
        }
        comments={<PeekComments />}
      >
        <div className="pl-2 text-n-text-tertiary">Press ‘enter’ to continue with an empty page.</div>
      </PeekBody>
  </SidePeek>
</div>`,
  },
  sections: docSections({
    composition: `<SidePeek>  |  <CenterPeek open onOpenChange>
  <PeekTopBar/>              // built in: Close · Open in full page · (hover) Switch peek mode · Previous / Next · actions
  <PeekBody header properties comments gutter>
    header      → <PageHeader size="peek"/>
    properties  → <PeekProperties> <PeekProperty/> × n </PeekProperties>   (or <PropertyList/> for databases)
    comments    → <PeekComments/>
    children    → page body
  </PeekBody>
</SidePeek>`,
    a11y: [
      'Side peek: a non-modal `dialog` (`aria-modal="false"`, labelled by `label`, default "Page preview"). Focus moves into it on open and returns to the opener on close; Escape inside it closes it (`onClose`). The left-edge resize handle is a "Preview width" slider: ←/↑ widen, →/↓ narrow (20px), Page Up/Down 100px, Home/End jump to `minWidth`/`maxWidth`.',
      'Center peek: Radix Dialog with a visually hidden title; focus is trapped, Escape and the underlay close it, focus returns to the trigger.',
      'Top bar buttons have labels and titles (Close, Open in full page, Switch peek mode, Previous page, Next page); the hover-only group also appears on focus.',
      'Comments: the input is labelled by its placeholder, Enter sends; Attach, Mention and Send are labelled buttons.',
      'Both slide / scale in and out (disabled under reduced motion) and are full-screen on phones.',
    ],
    usage: [
      'Use a side peek to preview a page or record while keeping the list beside it usable.',
      'Use a center peek when the preview should take focus (modal) but the user stays in context.',
      'Offer “Open in full page” for long content; peeks are for quick reads and edits.',
      'Don’t stack peeks; replace the content (Previous / Next) instead.',
      'Don’t use a peek for confirmations or short forms; use `Dialog` / `ConfirmDialog`.',
    ],
  }),
  install: install('`SidePeek`', `import { useState } from 'react';
import { SidePeek, PeekBody, PageHeader } from '@krackedui/motion';

export default function Preview() {
  const [open, setOpen] = useState(true);
  return (
    <div className="relative h-[480px]">
      <SidePeek open={open} onClose={() => setOpen(false)}>
        <PeekBody header={<PageHeader size="peek" title="Sidebar rebuild" />} />
      </SidePeek>
    </div>
  );
}`),
  examples: [
    {
      title: 'Center peek',
      render: () => <CenterPeekDemo />,
      code: `const [open, setOpen] = useState(false);

<Button variant="secondary" onClick={() => setOpen(true)}>Open center peek</Button>
<CenterPeek open={open} onOpenChange={setOpen} title="Sidebar rebuild">
  <PeekBody gutter={96} header={<PageHeader size="peek" title="Sidebar rebuild" />} comments={<PeekComments />} />
</CenterPeek>`,
    },
    {
      title: 'Peek top bar',
      render: () => <div className="w-[620px] max-w-full rounded-n-md shadow-n-shadow-outline-sm"><PeekTopBar /></div>,
      code: `const [log, setLog] = useState('');

<div className="flex flex-col gap-2">
  <div className="w-[620px] max-w-full rounded-n-md shadow-n-shadow-outline-sm">
    <PeekTopBar
      mode="side"
      onClose={() => setLog('Close')}
      onOpenFull={() => setLog('Open in full page')}
      onSwitchMode={() => setLog('Switch to center peek')}
      onPrev={() => setLog('Previous page')}
      onNext={() => setLog('Next page')}
    />
  </div>
  {log && <p className="text-[12px] text-n-text-tertiary">{log}</p>}
</div>`,
    },
    {
      title: 'Database row in a peek',
      description: 'Use `PropertyList` for editable database properties.',
      render: () => <DatabasePeekDemo />,
      code: `const db = useDatabase(createTasksSample);
const row = db.data.rows[1];

<div className="relative h-[560px] overflow-hidden bg-n-bg-secondary">
  <SidePeek autoFocus={false} label="Database row preview">
    <PeekBody
      header={<PageHeader size="peek" title={String(row.values.title)} />}
      properties={<PropertyList properties={db.data.collection.properties} row={row} onChange={(pid, v) => db.updateRow(row.id, pid, v)} />}
      comments={<PeekComments />}
    />
  </SidePeek>
</div>`,
    },
  ],
  api: [
    {
      name: 'SidePeek',
      description: 'Based on a non-modal `<dialog open>` (except `title`). Also takes the `PeekTopBar` callbacks.',
      props: [
        { name: 'open', type: 'boolean', default: 'true', description: 'Closing plays the exit animation, then renders nothing.' },
        { name: 'label', type: 'string', default: '"Page preview"', description: 'Accessible name of the peek (a non-modal dialog).' },
        { name: 'autoFocus', type: 'boolean', default: 'true', description: 'Move focus into the peek on open.' },
        { name: 'width', type: 'number', default: '660', description: 'Initial width (resizable from the left edge).' },
        { name: 'minWidth', type: 'number', default: '400' },
        { name: 'maxWidth', type: 'number', default: '1200', description: 'Widest the resize handle goes (the peek never exceeds its container).' },
        { name: 'onClose', type: '() => void', description: 'Close button and Escape.' },
        { name: 'onOpenFull', type: '() => void' },
        { name: 'onSwitchMode', type: '() => void' },
        { name: 'onPrev', type: '() => void' },
        { name: 'onNext', type: '() => void' },
        { name: 'actions', type: 'ReactNode', description: 'Top bar right side, e.g. `<TopbarActions onShare={…} />`. Empty by default.' },
        { name: 'children', type: 'ReactNode', description: 'Usually `<PeekBody/>`.' },
      ],
    },
    {
      name: 'CenterPeek',
      props: [
        { name: 'open', type: 'boolean', description: '(required)' },
        { name: 'onOpenChange', type: '(open: boolean) => void', description: '(required)' },
        { name: 'title', type: 'string', default: '"Page"', description: 'Dialog title (screen readers).' },
        { name: 'onClose', type: '() => void', description: 'Also called whenever the peek closes.' },
        { name: 'onOpenFull', type: '() => void' },
        { name: 'onSwitchMode', type: '() => void' },
        { name: 'onPrev', type: '() => void' },
        { name: 'onNext', type: '() => void' },
        { name: 'actions', type: 'ReactNode' },
        { name: 'children', type: 'ReactNode' },
        classNameProp,
      ],
    },
    {
      name: 'PeekTopBar',
      props: [
        { name: 'mode', type: ['"side"', '"center"'], default: '"side"', description: 'Close icon: » or ×.' },
        { name: 'onClose', type: '() => void' },
        { name: 'onOpenFull', type: '() => void' },
        { name: 'onSwitchMode', type: '() => void' },
        { name: 'onPrev', type: '() => void' },
        { name: 'onNext', type: '() => void' },
        { name: 'actions', type: 'ReactNode', description: 'Top bar right side. Empty by default.' },
      ],
    },
    {
      name: 'PeekBody',
      description: 'Based on `<div>` (except `title`).',
      props: [
        { name: 'header', type: 'ReactNode', description: '`<PageHeader size="peek"/>`.' },
        { name: 'properties', type: 'ReactNode' },
        { name: 'comments', type: 'ReactNode' },
        { name: 'children', type: 'ReactNode', description: 'Page body.' },
        { name: 'gutter', type: 'number', default: '76', description: 'Side padding (center peek: 96).' },
      ],
    },
    {
      name: 'PeekProperties',
      description: 'Based on `<div>`. Table wrapper + "Add a property".',
      props: [{ name: 'onAddProperty', type: '() => void' }],
    },
    {
      name: 'PeekProperty',
      description: 'Based on `<div>`. Static property row.',
      props: [
        { name: 'icon', type: 'IconName', default: '"textNormal"' },
        { name: 'label', type: 'ReactNode', description: '(required)' },
        { name: 'children', type: 'ReactNode', description: 'Value.' },
        { name: 'empty', type: 'ReactNode', default: '"Empty"' },
      ],
    },
    {
      name: 'PeekComments',
      description: 'Based on `<div>` (except `onSubmit`).',
      props: [
        { name: 'avatar', type: 'ReactNode', default: 'letter avatar' },
        { name: 'placeholder', type: 'string', default: '"Add a comment…"' },
        { name: 'onSubmit', type: '(text: string) => void' },
        { name: 'children', type: 'ReactNode', description: 'Existing discussion above the input.' },
      ],
    },
  ],
};

function CenterPeekDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Open center peek</Button>
      <CenterPeek open={open} onOpenChange={setOpen} title="Sidebar rebuild">
        <PeekBody gutter={96} header={<PageHeader size="peek" title="Sidebar rebuild" />} comments={<PeekComments />} />
      </CenterPeek>
    </>
  );
}
function DatabasePeekDemo() {
  const db = useDatabase(createTasksSample);
  const row = db.data.rows[1];
  return (
    <Scaled>
      <div className="relative size-full bg-n-bg-secondary">
        <SidePeek autoFocus={false} label="Database row preview">
          <PeekBody
            header={<PageHeader size="peek" title={String(row.values.title)} extraControls={null} />}
            properties={<PropertyList properties={db.data.collection.properties} row={row} today={SAMPLE_TODAY}
              onChange={(pid, v) => db.updateRow(row.id, pid, v)} onCreateOption={(pid, n) => db.addOption(pid, n)} />}
            comments={<PeekComments />}
          />
        </SidePeek>
      </div>
    </Scaled>
  );
}

/* ------------------------------------------- settings ------------------------------------------- */

function DemoSettingsNav() {
  return (
    <SettingsNav footer={null}>
      <SettingsNavGroup label="Account">
        <SettingsNavItem icon={<Avatar name="Ada Lovelace" shape="user" />}>Ada Lovelace</SettingsNavItem>
        <SettingsNavItem icon="sliders" selected>Preferences</SettingsNavItem>
        <SettingsNavItem icon="bell">Notifications</SettingsNavItem>
      </SettingsNavGroup>
      <SettingsNavGroup label="Workspace">
        <SettingsNavItem icon="gear">General</SettingsNavItem>
        <SettingsNavItem icon="people">People</SettingsNavItem>
        <SettingsNavItem icon="paperMicrophone" badge={<SettingsBadge tone="blue">New</SettingsBadge>}>Meeting notes</SettingsNavItem>
      </SettingsNavGroup>
      <SettingsNavGroup label="Access & billing">
        <SettingsNavItem icon={<Icon name="arrowInCircleUpFill" size={18} />} tone="accent">Upgrade plan</SettingsNavItem>
      </SettingsNavGroup>
    </SettingsNav>
  );
}
function DemoSettingsPage() {
  return (
    <SettingsPage title="Preferences" description="Choose how you want Motion to look and behave.">
      <SettingsSection title="Appearance">
        <SettingsRow label="Theme" description="Choose a theme for Motion on this device" control={<SettingsSelect>Light</SettingsSelect>} />
        <SettingsRow label="High contrast" badge={<SettingsBadge>Beta</SettingsBadge>} description="Increase contrast for improved visibility" control={<SettingsSelect>Use system setting</SettingsSelect>} />
      </SettingsSection>
      <SettingsSection title="Input options">
        <SettingsRow label="Use Enter to add a new line" description="Press Cmd+Enter to send messages" control={<SettingsSwitch />} />
      </SettingsSection>
    </SettingsPage>
  );
}
const settingsNavCode = `<SettingsNav footer={null}>
  <SettingsNavGroup label="Account">
    <SettingsNavItem icon={<Avatar name="Ada Lovelace" shape="user" />}>Ada Lovelace</SettingsNavItem>
    <SettingsNavItem icon="sliders" selected>Preferences</SettingsNavItem>
    <SettingsNavItem icon="bell">Notifications</SettingsNavItem>
  </SettingsNavGroup>
  <SettingsNavGroup label="Workspace">
    <SettingsNavItem icon="gear">General</SettingsNavItem>
    <SettingsNavItem icon="people">People</SettingsNavItem>
    <SettingsNavItem icon="paperMicrophone" badge={<SettingsBadge tone="blue">New</SettingsBadge>}>Meeting notes</SettingsNavItem>
  </SettingsNavGroup>
  <SettingsNavGroup label="Access & billing">
    <SettingsNavItem icon={<Icon name="arrowInCircleUpFill" size={18} />} tone="accent">Upgrade plan</SettingsNavItem>
  </SettingsNavGroup>
</SettingsNav>`;
const settingsPageCode = `<SettingsPage title="Preferences" description="Choose how you want Motion to look and behave.">
  <SettingsSection title="Appearance">
    <SettingsRow label="Theme" description="Choose a theme for Motion on this device" control={<SettingsSelect>Light</SettingsSelect>} />
    <SettingsRow label="High contrast" badge={<SettingsBadge>Beta</SettingsBadge>} description="Increase contrast for improved visibility" control={<SettingsSelect>Use system setting</SettingsSelect>} />
  </SettingsSection>
  <SettingsSection title="Input options">
    <SettingsRow label="Use Enter to add a new line" description="Press Cmd+Enter to send messages" control={<SettingsSwitch />} />
  </SettingsSection>
</SettingsPage>`;
const settingsCode = `<SettingsModal
  open={open}
  onOpenChange={setOpen}
  nav={
${indentCode(settingsNavCode, 4)}
  }
>
${indentCode(settingsPageCode, 2)}
</SettingsModal>`;

function SettingsDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" icon="gear" onClick={() => setOpen(true)}>Open settings</Button>
      <SettingsModal open={open} onOpenChange={setOpen} nav={<DemoSettingsNav />}><DemoSettingsPage /></SettingsModal>
    </>
  );
}

const settingsModalPage: DocPage = {
  eyebrow: 'App shell',
  title: 'Settings Modal',
  description: 'The “Settings & members” dialog: a 240px searchable nav of groups and tabs, and a scrolling 800px content column of sections and rows.',
  hero: {
    title: 'Settings Modal',
    render: () => (
      <Scaled>
        <SettingsLayout nav={<DemoSettingsNav />}><DemoSettingsPage /></SettingsLayout>
      </Scaled>
    ),
    code: `import { SettingsLayout } from '@krackedui/motion';

// The dialog's two-column layout, embedded without the modal:
<SettingsLayout
  nav={
${indentCode(settingsNavCode, 4)}
  }
>
${indentCode(settingsPageCode, 2)}
</SettingsLayout>`,
  },
  sections: docSections({
    composition: `<SettingsModal open onOpenChange nav>          // Radix Dialog; full-screen on phones (nav stacked above content)
  <SettingsLayout>                               // also usable on its own
    nav      → <SettingsNav search footer>
                 <SettingsNavGroup label> <SettingsNavItem icon selected badge tone/> × n </SettingsNavGroup>
               </SettingsNav>
    content  → <SettingsPage title description>
                 <SettingsSection title>
                   <SettingsRow label description badge control={<SettingsSelect/> | <SettingsSwitch/>}/>
                 </SettingsSection>
               </SettingsPage>
  close (×)
</SettingsModal>`,
    a11y: [
      'Radix Dialog: focus trapped inside, Escape and the underlay close it, focus returns to the trigger; the title ("Settings & members") is visually hidden but announced.',
      'The nav is a vertical `tablist` labelled "Settings" (↑/↓, Home/End move focus); `SettingsNavItem`s are `role="tab"` with `aria-selected`.',
      'The search field is labelled "Search settings". Each `SettingsRow` names its control with the row label and describes it with the description (unless the control has its own label); `SettingsSwitch` toggles with Space.',
      'The page title is an `h2` under the dialog title.',
    ],
    usage: [
      'Use it for app or workspace settings with several categories.',
      'Group related options in `SettingsSection`s; one control per `SettingsRow`, applied immediately (switches) or on choice (selects).',
      'Don’t use it for a single setting or a quick choice; use a `Popover`, `Menu` or `Dialog`.',
      'Don’t put destructive actions next to everyday options; give them their own section and confirm with `ConfirmDialog`.',
    ],
  }),
  install: install('the settings parts', settingsCode),
  examples: [
    {
      title: 'As a modal',
      render: () => <SettingsDemo />,
      code: `const [open, setOpen] = useState(false);

<Button variant="secondary" icon="gear" onClick={() => setOpen(true)}>Open settings</Button>
${settingsCode}`,
    },
    {
      title: 'Rows',
      render: () => (
        <div className="w-[560px] max-w-full">
          <SettingsSection title="Notifications">
            <SettingsRow label="Mobile push notifications" description="Receive push notifications on mentions and comments" control={<SettingsSwitch defaultChecked />} />
            <SettingsRow label="Email digests" description="Updates from pages you follow" control={<SettingsSelect>Daily</SettingsSelect>} />
          </SettingsSection>
        </div>
      ),
      code: `<SettingsSection title="Notifications">
  <SettingsRow label="Mobile push notifications" description="Receive push notifications on mentions and comments" control={<SettingsSwitch defaultChecked />} />
  <SettingsRow label="Email digests" description="Updates from pages you follow" control={<SettingsSelect>Daily</SettingsSelect>} />
</SettingsSection>`,
    },
  ],
  api: [
    {
      name: 'SettingsModal',
      props: [
        { name: 'open', type: 'boolean', description: '(required)' },
        { name: 'onOpenChange', type: '(open: boolean) => void', description: '(required)' },
        { name: 'nav', type: 'ReactNode', description: 'Left column: `<SettingsNav>` (required).' },
        { name: 'children', type: 'ReactNode', description: 'Right column: `<SettingsPage>` (required).' },
        { name: 'title', type: 'string', default: '"Settings & members"', description: 'Dialog title (screen readers).' },
      ],
    },
    {
      name: 'SettingsLayout',
      description: 'Based on `<div>`. The modal’s two columns without the dialog.',
      props: [
        { name: 'nav', type: 'ReactNode', description: '(required)' },
        { name: 'children', type: 'ReactNode', description: '(required)' },
      ],
    },
    {
      name: 'SettingsNav',
      description: 'Based on `<div>`.',
      props: [
        { name: 'search', type: 'boolean', default: 'true', description: 'Show the search field.' },
        { name: 'searchProps', type: 'InputHTMLAttributes<HTMLInputElement>', description: 'Spread onto the search input.' },
        { name: 'footer', type: 'ReactNode', description: 'Pinned at the bottom.' },
      ],
    },
    { name: 'SettingsNavGroup', description: 'Based on `<div>`.', props: [{ name: 'label', type: 'ReactNode', description: '(required)' }] },
    {
      name: 'SettingsNavItem',
      description: 'Based on `<button role="tab">`.',
      props: [
        { name: 'icon', type: 'IconName | ReactElement', description: 'Leading 20px icon name, or an element (avatar).' },
        { name: 'selected', type: 'boolean', default: 'false' },
        { name: 'badge', type: 'ReactNode', description: 'Right side, e.g. a "New" badge.' },
        { name: 'tone', type: ['"default"', '"accent"'], default: '"default"', description: '`accent` = blue "Upgrade plan".' },
      ],
    },
    {
      name: 'SettingsBadge',
      props: [
        { name: 'tone', type: ['"gray"', '"blue"'], default: '"gray"' },
        { name: 'children', type: 'ReactNode', description: '(required)' },
      ],
    },
    {
      name: 'SettingsPage',
      description: 'Based on `<div>` (except `title`).',
      props: [
        { name: 'title', type: 'ReactNode', description: '(required)' },
        { name: 'description', type: 'ReactNode' },
      ],
    },
    { name: 'SettingsSection', description: 'Based on `<section>` (except `title`).', props: [{ name: 'title', type: 'ReactNode', description: '(required)' }] },
    {
      name: 'SettingsRow',
      description: 'Based on `<div>` (except `title`).',
      props: [
        { name: 'label', type: 'ReactNode', description: '(required)' },
        { name: 'description', type: 'ReactNode' },
        { name: 'badge', type: 'ReactNode' },
        { name: 'control', type: 'ReactNode', description: 'Right-aligned control.' },
      ],
    },
    { name: 'SettingsSelect', description: 'Based on `<button>`: 28px outline select button with a chevron.', props: [{ name: '...props', type: 'ButtonHTMLAttributes<HTMLButtonElement>' }] },
    {
      name: 'SettingsSwitch',
      description: 'Alias of the `Switch` atom (30x18). Inside a `SettingsRow` it is named by the row label.',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Visible label next to the switch (usually omitted inside a row).' },
        { name: 'invalid', type: 'boolean', default: 'false' },
        { name: '...props', type: 'SwitchProps', description: 'See Switch.' },
      ],
    },
  ],
};

/* ----------------------------------------- shell menus ----------------------------------------- */

const shellMenusPage: DocPage = {
  eyebrow: 'App shell',
  title: 'Shell Menus',
  description: 'Menus opened from the sidebar bottom bar: workspace switcher, help / what’s new, and Library · Trash.',
  hero: {
    title: 'Shell Menus',
    render: () => (
      <div className="w-[270px] bg-n-bg-secondary">
        <Sidebar.BottomBar>
          <WorkspaceMenu email="ada@example.com" workspaces={[{ id: 'w1', name: 'Design Team' }, { id: 'w2', name: 'Personal' }]} currentId="w1">
            <Sidebar.WorkspaceSwitcher name="Design Team" />
          </WorkspaceMenu>
          <HelpMenu releases={[{ id: 'r1', title: 'Release 3.8', isNew: true }, { id: 'r2', title: 'Release 3.7' }]}>
            <Sidebar.BarButton icon="questionMarkCircle" label="Help, contact, more…" />
          </HelpMenu>
          <AppsMenu trash={[{ id: 't1', title: 'Old meeting notes', path: 'Team wiki' }, { id: 't2', title: 'Draft spec', path: 'Private' }]}>
            <Sidebar.BarButton icon="circleGrid2X2" label="Library, Trash, more…" />
          </AppsMenu>
        </Sidebar.BottomBar>
      </div>
    ),
    code: `import { Sidebar, WorkspaceMenu, HelpMenu, AppsMenu } from '@krackedui/motion';

<Sidebar.BottomBar>
  <WorkspaceMenu email="ada@example.com" workspaces={[{ id: 'w1', name: 'Design Team' }, { id: 'w2', name: 'Personal' }]} currentId="w1">
    <Sidebar.WorkspaceSwitcher name="Design Team" />
  </WorkspaceMenu>
  <HelpMenu releases={[{ id: 'r1', title: 'Release 3.8', isNew: true }, { id: 'r2', title: 'Release 3.7' }]}>
    <Sidebar.BarButton icon="questionMarkCircle" label="Help, contact, more…" />
  </HelpMenu>
  <AppsMenu trash={[{ id: 't1', title: 'Old meeting notes', path: 'Team wiki' }, { id: 't2', title: 'Draft spec', path: 'Private' }]}>
    <Sidebar.BarButton icon="circleGrid2X2" label="Library, Trash, more…" />
  </AppsMenu>
</Sidebar.BottomBar>`,
  },
  sections: docSections({
    composition: `<WorkspaceMenu email workspaces currentId>   // Menu.Root, opens upward, 300 wide
  trigger = children (Sidebar.WorkspaceSwitcher)
  header (email · …) · workspace rows (checked) · New workspace · Settings · Invite members · Upgrade
  · Add account · Log out

<HelpMenu releases more>                      // 260 wide
  Documentation · Get support · More › · "What’s new?" · release rows (blue dot + New) · View all releases

<AppsMenu trash>                              // 240 wide
  Library · Templates · Import · Trash › <TrashMenu items/>

<TrashMenu items>                             // 414 wide, also usable inside your own popover
  search · rows (restore / delete) · 30-day footer`,
    a11y: [
      'Built on the `Menu` component (Radix DropdownMenu): Enter/Space/ArrowDown open from the trigger, arrows move, ArrowRight opens submenus (More, Trash), Escape closes and returns focus.',
      'Trash is a labelled list; each row has an open button plus "Restore <page>" and "Delete <page> from Trash" buttons.',
      'Workspaces are a labelled radio group (`menuitemradio`): the current workspace is announced as checked; choosing one calls `onSelect`.',
    ],
    usage: [
      'Use these ready-made menus in the sidebar bottom bar: workspace switching, help, and the apps / trash launcher.',
      'Pass your data (workspaces, releases, trash entries) and handlers; the menus own their layout and keyboard behaviour.',
      'Don’t rebuild them from `Menu` parts unless you need different items; keep one menu per trigger.',
    ],
  }),
  install: install('the menus', `<WorkspaceMenu email="ada@example.com" workspaces={[{ id: 'w1', name: 'Design Team' }]} currentId="w1">
  <Sidebar.WorkspaceSwitcher name="Design Team" />
</WorkspaceMenu>`),
  examples: [
    {
      title: 'Trash list',
      render: () => <div className="overflow-hidden rounded-n-xl bg-n-bg-elevated shadow-n-shadow-outline-lg"><TrashDemo /></div>,
      code: `const [items, setItems] = useState([
  { id: 't1', title: 'Old meeting notes', path: 'Team wiki' },
  { id: 't2', title: 'Draft spec', path: 'Private' },
  { id: 't3', title: 'Q3 retro', path: 'Design Team' },
]);
const remove = (id: string) => setItems(items.filter((i) => i.id !== id));

<TrashMenu items={items} onRestore={remove} onDelete={remove} />`,
    },
  ],
  api: [
    {
      name: 'WorkspaceMenu',
      props: [
        { name: 'children', type: 'ReactElement', description: 'The trigger (required).' },
        { name: 'email', type: 'string', description: 'Header (required).' },
        { name: 'workspaces', type: 'Workspace[]', description: '`{ id, name, icon? }` (required).' },
        { name: 'currentId', type: 'string', description: 'Checked workspace (required).' },
        { name: 'onSelect', type: '(id: string) => void' },
        { name: 'onNewWorkspace', type: '() => void' },
        { name: 'onSettings', type: '() => void' },
        { name: 'onInvite', type: '() => void' },
        { name: 'onUpgrade', type: '() => void' },
        { name: 'onAddAccount', type: '() => void' },
        { name: 'onLogOut', type: '() => void' },
        { name: 'open', type: 'boolean' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
      ],
    },
    {
      name: 'HelpMenu',
      props: [
        { name: 'children', type: 'ReactElement', description: 'The trigger (required).' },
        { name: 'releases', type: 'ReleaseNote[]', default: '[]', description: '`{ id, title, isNew? }`.' },
        { name: 'onDocs', type: '() => void' },
        { name: 'onSupport', type: '() => void' },
        { name: 'onRelease', type: '(id: string) => void' },
        { name: 'onAllReleases', type: '() => void' },
        { name: 'more', type: 'ReactNode', default: 'Keyboard shortcuts, Send feedback', description: 'Items inside "More ›".' },
      ],
    },
    {
      name: 'AppsMenu',
      props: [
        { name: 'children', type: 'ReactElement', description: 'The trigger (required).' },
        { name: 'trash', type: 'TrashEntry[]', default: '[]' },
        { name: 'onLibrary', type: '() => void' },
        { name: 'onTemplates', type: '() => void' },
        { name: 'onImport', type: '() => void' },
        { name: 'onRestore', type: '(id: string) => void' },
        { name: 'onDelete', type: '(id: string) => void' },
      ],
    },
    {
      name: 'TrashMenu',
      props: [
        { name: 'items', type: 'TrashEntry[]', description: '`{ id, title, path?, icon? }` (required).' },
        { name: 'onOpen', type: '(id: string) => void' },
        { name: 'onRestore', type: '(id: string) => void' },
        { name: 'onDelete', type: '(id: string) => void' },
        classNameProp,
      ],
    },
  ],
};

function TrashDemo() {
  const [items, setItems] = useState([
    { id: 't1', title: 'Old meeting notes', path: 'Team wiki' },
    { id: 't2', title: 'Draft spec', path: 'Private' },
    { id: 't3', title: 'Q3 retro', path: 'Design Team' },
  ]);
  const remove = (id: string) => setItems(items.filter((i) => i.id !== id));
  return <TrashMenu items={items} onRestore={remove} onDelete={remove} />;
}

/* ================================================================================================
 * Exports
 * ==============================================================================================*/

export const appPages: Record<string, DocPage> = {
  'blocks/database': databaseOverviewPage,
  'blocks/database-view': databaseViewPage,
  'blocks/table-view': tableViewPage,
  'blocks/board-view': boardViewPage,
  'blocks/gallery-view': galleryViewPage,
  'blocks/list-view': listViewPage,
  'blocks/calendar-view': calendarViewPage,
  'blocks/timeline-view': timelineViewPage,
  'blocks/chart-view': chartViewPage,
  'blocks/property-menu': propertyMenuPage,
  'blocks/select-picker': selectPickerPage,
  'blocks/date-cell-picker': dateCellPickerPage,
  'blocks/filter-sort-menus': filterSortPage,
  'blocks/view-settings-panel': viewSettingsPage,
  'blocks/new-view-menu': newViewMenuPage,
  'blocks/property-list': propertyListPage,
  'blocks/app-frame': appFramePage,
  'blocks/sidebar': sidebarPage,
  'blocks/topbar': topbarPage,
  'blocks/page-layout': pageLayoutPage,
  'blocks/page-header': pageHeaderPage,
  'blocks/peek': peekPage,
  'blocks/settings-modal': settingsModalPage,
  'blocks/shell-menus': shellMenusPage,
};

/** Nav groups for the "Blocks" section. */
export const appNavGroups: NavGroup[] = [
  {
    title: 'Database',
    items: [
      { slug: 'blocks/database', title: 'Overview' },
      { slug: 'blocks/database-view' },
      { slug: 'blocks/table-view' },
      { slug: 'blocks/board-view' },
      { slug: 'blocks/gallery-view' },
      { slug: 'blocks/list-view' },
      { slug: 'blocks/calendar-view' },
      { slug: 'blocks/timeline-view' },
      { slug: 'blocks/chart-view' },
      { slug: 'blocks/property-menu' },
      { slug: 'blocks/select-picker' },
      { slug: 'blocks/date-cell-picker' },
      { slug: 'blocks/filter-sort-menus' },
      { slug: 'blocks/view-settings-panel' },
      { slug: 'blocks/new-view-menu' },
      { slug: 'blocks/property-list' },
    ],
  },
  {
    title: 'App shell',
    items: [
      { slug: 'blocks/app-frame' },
      { slug: 'blocks/sidebar' },
      { slug: 'blocks/topbar' },
      { slug: 'blocks/page-layout' },
      { slug: 'blocks/page-header' },
      { slug: 'blocks/peek' },
      { slug: 'blocks/settings-modal' },
      { slug: 'blocks/shell-menus' },
    ],
  },
];

/** Ready-made nav section; merge `appNavGroups` into an existing "Blocks" section instead if there is one. */
export const appNav: NavSection = { title: 'Blocks', groups: appNavGroups };

