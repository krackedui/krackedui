import { useEffect, useMemo, useState } from 'react';
import {
  AppFrame, Avatar, Breadcrumbs, CommandPaletteDialog, IconButton, Menu, Popover, Sidebar, Stack,
  Theme, ToastProvider, Topbar,
  type CommandPaletteItem,
} from '@krackedui/bayrust';
import { go, useRoute } from './router';
import { me, projects, workspace } from './data';
import { useTasks } from './store';
import { MyWork } from './screens/MyWork';
import { Projects } from './screens/Projects';
import { Board } from './screens/Board';
import { Timeline } from './screens/Timeline';
import { Team } from './screens/Team';
import { Settings } from './screens/Settings';

/** ⌘K belongs to the application: only it knows what else is bound on this screen. */
function useCommandKey(open: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
}

export function App() {
  const route = useRoute();
  const store = useTasks();
  const [paletteOpen, setPaletteOpen] = useState(false);
  useCommandKey(() => setPaletteOpen(true));

  const taskRoute = route.match(/^\/tasks\/([A-Z]+-\d+)/)?.[1];
  const projectRoute = route.match(/^\/projects\/([a-z]+)/)?.[1];
  const openTask = taskRoute ? store.tasks.find((t) => t.id === taskRoute) : undefined;
  const project = projects.find((p) => p.id === (projectRoute ?? openTask?.projectId ?? 'website'));

  const groups: { label: string; items: CommandPaletteItem[] }[] = useMemo(
    () => [
      {
        label: 'Go to',
        items: [
          { id: 'go:/', label: 'My work', icon: 'home' },
          { id: 'go:/projects', label: 'Projects', icon: 'folder' },
          { id: 'go:/timeline', label: 'Timeline', icon: 'timeline' },
          { id: 'go:/team', label: 'Team', icon: 'users' },
          { id: 'go:/settings', label: 'Settings', icon: 'settings' },
        ],
      },
      { label: 'Projects', items: projects.map((p) => ({ id: `go:/projects/${p.id}`, label: p.name, icon: 'board' })) },
      {
        label: 'Tasks',
        items: store.tasks.slice(0, 20).map((t) => ({
          id: `go:/tasks/${t.id}`,
          label: t.title,
          keywords: `${t.id} ${t.assignee} ${t.labels.join(' ')}`,
          icon: 'list',
          description: t.id,
        })),
      },
    ],
    [store.tasks],
  );

  const crumbs = () => {
    if (route === '/') return [{ label: 'My work' }];
    if (route.startsWith('/projects/') || taskRoute) {
      return [
        { label: 'Projects', href: '#/projects' },
        { label: project?.name ?? 'Project', href: `#/projects/${project?.id ?? ''}` },
        ...(openTask ? [{ label: openTask.id }] : []),
      ];
    }
    if (route.startsWith('/projects')) return [{ label: 'Projects' }];
    if (route.startsWith('/timeline')) return [{ label: 'Timeline' }];
    if (route.startsWith('/team')) return [{ label: 'Team' }];
    if (route.startsWith('/settings')) return [{ label: 'Settings' }];
    return [{ label: workspace.name }];
  };

  const screen = () => {
    if (taskRoute || route.startsWith('/projects/')) {
      return <Board store={store} project={project ?? projects[0]} openTaskId={taskRoute} />;
    }
    if (route.startsWith('/projects')) return <Projects />;
    if (route.startsWith('/timeline')) return <Timeline />;
    if (route.startsWith('/team')) return <Team tasks={store.tasks} />;
    if (route.startsWith('/settings')) return <Settings />;
    return <MyWork tasks={store.tasks} />;
  };

  return (
    <Theme appearance="system">
      <ToastProvider>
        <AppFrame
          sidebar={
            <Sidebar.Root>
              <Sidebar.Header>{workspace.name}</Sidebar.Header>
              <Sidebar.Section title="Work">
                <Sidebar.Item icon="home" active={route === '/'} href="#/">
                  My work
                </Sidebar.Item>
                <Sidebar.Item icon="folder" active={route === '/projects'} href="#/projects">
                  Projects
                </Sidebar.Item>
              </Sidebar.Section>
              <Sidebar.Section title="Projects">
                {projects.map((p) => (
                  <Sidebar.Item key={p.id} icon="board" active={project?.id === p.id && route !== '/projects'} href={`#/projects/${p.id}`}>
                    {p.name}
                  </Sidebar.Item>
                ))}
              </Sidebar.Section>
              <Sidebar.Section title="Workspace">
                <Sidebar.Item icon="timeline" active={route.startsWith('/timeline')} href="#/timeline">
                  Timeline
                </Sidebar.Item>
                <Sidebar.Item icon="users" active={route.startsWith('/team')} href="#/team">
                  Team
                </Sidebar.Item>
                <Sidebar.Item icon="settings" active={route.startsWith('/settings')} href="#/settings">
                  Settings
                </Sidebar.Item>
              </Sidebar.Section>
            </Sidebar.Root>
          }
          topbar={
            <Topbar
              breadcrumbs={<Breadcrumbs items={crumbs()} />}
              actions={
                <Stack direction="row" gap={2} align="center">
                  <IconButton icon="search" label="Search (⌘K)" onClick={() => setPaletteOpen(true)} />
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <IconButton icon="bell" label="Notifications" />
                    </Popover.Trigger>
                    <Popover.Content>
                      <Stack gap={4}>
                        <strong>Three tasks are overdue</strong>
                        <span>All on Website relaunch.</span>
                      </Stack>
                    </Popover.Content>
                  </Popover.Root>
                  <Menu.Root>
                    <Menu.Trigger asChild>
                      <IconButton icon="user" label="Account" />
                    </Menu.Trigger>
                    <Menu.Content align="end">
                      <Menu.Label>{me.name}</Menu.Label>
                      <Menu.Item icon="settings" onClick={() => go('/settings')}>
                        Settings
                      </Menu.Item>
                      <Menu.Separator />
                      <Menu.Item icon="logout">Sign out</Menu.Item>
                    </Menu.Content>
                  </Menu.Root>
                  <Avatar name={me.name} size="sm" />
                </Stack>
              }
            />
          }
        >
          {screen()}
        </AppFrame>
        <CommandPaletteDialog
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          groups={groups}
          placeholder="Jump to a project or task…"
          onSelect={(item) => go(item.id.replace(/^go:/, ''))}
        />
      </ToastProvider>
    </Theme>
  );
}
