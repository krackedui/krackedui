import { useState } from 'react';
import { AppFrame, Theme, ToastProvider, type BreadcrumbItem } from '@krackedui/motion';
import { AppSidebar } from './components/AppSidebar';
import { AppTopbar } from './components/AppTopbar';
import { CommandMenu } from './components/CommandMenu';
import { InviteMemberDialog } from './components/InviteMemberDialog';
import { NewProjectDialog } from './components/NewProjectDialog';
import { NewTaskDialog } from './components/NewTaskDialog';
import { href, useRoute, type Route } from './lib/router';
import { BoardPage } from './pages/BoardPage';
import { MyWorkPage } from './pages/MyWorkPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TaskPage } from './pages/TaskPage';
import { TeamPage } from './pages/TeamPage';
import { TimelinePage } from './pages/TimelinePage';
import { StoreProvider, useStore, type Store } from './state/store';
import { useThemePreference } from './state/theme';

export function App() {
  const [theme, setTheme] = useThemePreference();
  return (
    <Theme appearance={theme} className="h-dvh">
      <ToastProvider>
        <StoreProvider>
          <Shell theme={theme} onThemeChange={setTheme} />
        </StoreProvider>
      </ToastProvider>
    </Theme>
  );
}

type DialogName = 'search' | 'task' | 'project' | 'invite' | null;

function Shell({ theme, onThemeChange }: { theme: ReturnType<typeof useThemePreference>[0]; onThemeChange: (t: typeof theme) => void }) {
  const route = useRoute();
  const store = useStore();
  const [dialog, setDialog] = useState<DialogName>(null);
  const openDialog = (name: DialogName) => () => setDialog(name);
  const setOpen = (name: Exclude<DialogName, null>) => (open: boolean) => setDialog(open ? name : null);
  const projectSlug = route.name === 'project' ? route.slug : route.name === 'task' ? store.taskById(route.id)?.projectSlug : undefined;

  return (
    <>
      <AppFrame
        sidebar={(
          <AppSidebar
            route={route}
            activeProject={projectSlug}
            onSearch={openDialog('search')}
            onNewProject={openDialog('project')}
            onInvite={openDialog('invite')}
          />
        )}
        topbar={(
          <AppTopbar
            crumbs={crumbsFor(route, store)}
            theme={theme}
            onThemeChange={onThemeChange}
            onSearch={openDialog('search')}
            onCreateTask={openDialog('task')}
          />
        )}
      >
        {({ mobile }) => (
          <main id="main" className="min-h-0 flex-1 overflow-y-auto">
            <Screen route={route} mobile={mobile} onNewProject={openDialog('project')} onInvite={openDialog('invite')} />
          </main>
        )}
      </AppFrame>
      <CommandMenu open={dialog === 'search'} onOpenChange={setOpen('search')} onCreateTask={openDialog('task')} onNewProject={openDialog('project')} />
      <NewTaskDialog open={dialog === 'task'} onOpenChange={setOpen('task')} projectSlug={projectSlug} />
      <NewProjectDialog open={dialog === 'project'} onOpenChange={setOpen('project')} />
      <InviteMemberDialog open={dialog === 'invite'} onOpenChange={setOpen('invite')} />
    </>
  );
}

function Screen({ route, mobile, onNewProject, onInvite }: { route: Route; mobile: boolean; onNewProject: () => void; onInvite: () => void }) {
  const { taskById } = useStore();
  switch (route.name) {
    case 'home': return <MyWorkPage />;
    case 'projects': return <ProjectsPage onNewProject={onNewProject} />;
    case 'project': return <BoardPage key={route.slug} slug={route.slug} />;
    case 'task': {
      const task = taskById(route.id);
      if (!task) return <NotFoundPage what={`Task ${route.id}`} />;
      // Desktop: the board stays behind the task sheet. Phones: the task is a full page.
      return mobile ? <TaskPage task={task} /> : <BoardPage key={task.projectSlug} slug={task.projectSlug} openTaskId={task.id} />;
    }
    case 'timeline': return <TimelinePage />;
    case 'team': return <TeamPage onInvite={onInvite} />;
    case 'settings': return <SettingsPage />;
    default: return <NotFoundPage what="This page" />;
  }
}

function crumbsFor(route: Route, store: Store): BreadcrumbItem[] {
  const root: BreadcrumbItem = { label: store.workspace.name, icon: store.workspace.emoji, href: href({ name: 'home' }) };
  const projects: BreadcrumbItem = { label: 'Projects', href: href({ name: 'projects' }) };
  const projectCrumb = (slug: string): BreadcrumbItem => {
    const p = store.projectBySlug(slug);
    return { label: p?.name ?? 'Project', icon: p?.emoji, href: href({ name: 'project', slug }) };
  };
  switch (route.name) {
    case 'home': return [root, { label: 'My work' }];
    case 'projects': return [root, { label: 'Projects' }];
    case 'project': return [root, projects, { ...projectCrumb(route.slug), href: undefined }];
    case 'task': {
      const task = store.taskById(route.id);
      return task ? [root, projects, projectCrumb(task.projectSlug), { label: task.id }] : [root, { label: 'Not found' }];
    }
    case 'timeline': return [root, { label: 'Timeline' }];
    case 'team': return [root, { label: 'Team' }];
    case 'settings': return [root, { label: 'Settings' }];
    default: return [root, { label: 'Not found' }];
  }
}
