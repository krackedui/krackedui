import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AppFrame, Sidebar, Topbar, BreadcrumbTrail, PageLayout, PageCover, PageHeader, Icon,
  CommandPaletteDialog, DatabaseView, type CommandGroup, Theme,
} from '@krackedui/motion';
import { useWorkspace, findPage, pathTo } from './store';
import type { PageNode } from './data/workspace';
import { PageBody } from './PageBody';
import { useMeasuredWidth } from './useMeasuredWidth';

const routeId = () => location.hash.match(/^#\/p\/(.+)$/)?.[1];

function TreeNodes({ pages, activeId, open, onAdd }: { pages: PageNode[]; activeId?: string; open: (id: string) => void; onAdd: (parent: string) => void }): ReactNode {
  return pages.map((p) => (
    <Sidebar.TreeItem
      key={p.id}
      label={p.title || 'New page'}
      emoji={p.icon}
      icon={p.kind === 'database' && !p.icon ? <Icon name="viewTable" size={20} /> : undefined}
      active={p.id === activeId}
      defaultExpanded={p.children.some((c) => c.id === activeId)}
      onSelect={() => open(p.id)}
      onAdd={() => onAdd(p.id)}
    >
      {p.children.length ? <TreeNodes pages={p.children} activeId={activeId} open={open} onAdd={onAdd} /> : undefined}
    </Sidebar.TreeItem>
  ));
}

/** Full-page database: fills the page column (measured) and hides its own title. */
function FullDatabase({ data }: { data: ReturnType<ReturnType<typeof useWorkspace>['database']> }) {
  const [ref, width] = useMeasuredWidth<HTMLDivElement>();
  return <div ref={ref}>{width > 0 && <DatabaseView data={data} width={width} hideTitle bleed={{ left: 0, right: 0 }} />}</div>;
}

/** The Motion demo app, assembled only from @krackedui/motion. Route: `#/p/<pageId>`. */
export function MotionApp() {
  const ws = useWorkspace();
  const [id, setId] = useState(() => routeId() ?? ws.pages[0]?.id);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const on = () => setId(routeId() ?? ws.pages[0]?.id);
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, [ws.pages]);
  useEffect(() => { document.documentElement.classList.toggle('dark', ws.theme === 'dark'); }, [ws.theme]);
  useEffect(() => {
    // ⌘⇧L toggles dark mode
    const on = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') { e.preventDefault(); ws.toggleTheme(); } };
    addEventListener('keydown', on);
    return () => removeEventListener('keydown', on);
  }, [ws.toggleTheme]);

  const open = (pageId: string) => { location.hash = `#/p/${pageId}`; };
  const page = (id && findPage(ws.pages, id)) || ws.pages[0];
  const trail = pathTo(ws.pages, page.id) ?? [page];
  useEffect(() => { document.title = page.title || 'New page'; }, [page.title]);

  const searchGroups = useMemo<CommandGroup[]>(() => {
    const flat: { p: PageNode; path: string[] }[] = [];
    const walk = (list: PageNode[], path: string[]) => list.forEach((p) => { flat.push({ p, path }); walk(p.children, [...path, p.title]); });
    walk(ws.pages, []);
    return [{ label: 'Pages', items: flat.map(({ p, path }) => ({ id: p.id, title: p.title || 'New page', icon: p.icon ?? (p.kind === 'database' ? 'viewTable' : 'page'), path, keywords: p.title })) }];
  }, [ws.pages]);

  const sidebar = (
    <Sidebar.Root
      header={<><Sidebar.Search onClick={() => setSearchOpen(true)} /><Sidebar.Tabs /></>}
      footer={<Sidebar.InviteCard />}
      bottomBar={
        <Sidebar.BottomBar>
          <Sidebar.WorkspaceSwitcher name="Design Team" />
          <Sidebar.BarButton icon="questionMarkCircle" label="Help, contact, more…" />
          <Sidebar.BarButton icon="circleGrid2X2" label="Library, Trash, more…" />
        </Sidebar.BottomBar>
      }
    >
      <Sidebar.Group>
        <Sidebar.Item icon="chatBubblePlus">New chat</Sidebar.Item>
        <Sidebar.Item icon="bookshelf">Library</Sidebar.Item>
      </Sidebar.Group>
      <Sidebar.Sections>
        <Sidebar.Section title="Private" actions={<Sidebar.Action icon="plusSmall" label="Add a page" onClick={() => open(ws.addPage())} />}>
          <Sidebar.Tree label="Private pages">
            <TreeNodes pages={ws.pages} activeId={page.id} open={open} onAdd={(parent) => open(ws.addPage(parent))} />
          </Sidebar.Tree>
        </Sidebar.Section>
      </Sidebar.Sections>
      <Sidebar.ScrollFooter>
        <Sidebar.Item tone="muted" icon={ws.theme === 'dark' ? 'lightBulbBright' : 'eye'} onClick={ws.toggleTheme} aria-keyshortcuts="Meta+Shift+L" trailing="⌘⇧L">
          {ws.theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </Sidebar.Item>
        <Sidebar.Item tone="muted" icon="trash" onClick={ws.reset}>Reset sample workspace</Sidebar.Item>
      </Sidebar.ScrollFooter>
    </Sidebar.Root>
  );

  const isDb = page.kind === 'database';
  return (
    <Theme appearance={ws.theme === 'dark' ? 'dark' : 'light'} className="h-full">
      <AppFrame
        sidebar={sidebar}
        topbar={
          <Topbar
            breadcrumbs={<BreadcrumbTrail items={trail.map((p) => ({ title: p.title || 'New page', icon: p.icon, onClick: () => open(p.id) }))} />}
            edited="Edited just now"
          />
        }
      >
        <PageLayout
          key={page.id}
          fullWidth={page.fullWidth || isDb}
          hasIcon={!!page.icon}
          cover={page.cover ? (page.cover.startsWith('gradient:') ? <PageCover><div className="size-full" style={{ background: page.cover.slice(9) }} /></PageCover> : <PageCover src={page.cover} />) : undefined}
          header={
            <PageHeader
              icon={page.icon}
              title={page.title}
              onTitleChange={(title) => ws.updatePage(page.id, { title })}
            />
          }
        >
          {isDb ? (
            <FullDatabase data={ws.database(page.id)} />
          ) : (
            <PageBody
              blocks={page.blocks}
              onChange={(blocks) => ws.setBlocks(page.id, blocks)}
              childPages={page.children}
              openPage={open}
              databaseFor={(dbId) => <DatabaseView data={ws.database(dbId)} />}
            />
          )}
        </PageLayout>
      </AppFrame>
      <CommandPaletteDialog open={searchOpen} onOpenChange={setSearchOpen} groups={searchGroups} placeholder="Search or ask a question in Design Team…" onSelect={(item) => { open(item.id); setSearchOpen(false); }} />
    </Theme>
  );
}


