import { Avatar, Icon, Menu, Sidebar } from '@krackedui/motion';
import { href, navigate, type Route } from '../lib/router';
import { useStore } from '../state/store';

interface AppSidebarProps {
  route: Route;
  /** Slug of the project in view (a board, or the project of an open task). */
  activeProject?: string;
  onSearch: () => void;
  onNewProject: () => void;
  onInvite: () => void;
}

/** Workspace switcher, main navigation and the project list. */
export function AppSidebar({ route, activeProject, onSearch, onNewProject, onInvite }: AppSidebarProps) {
  const { workspace, projects, me } = useStore();
  const is = (name: Route['name']) => route.name === name;
  return (
    <Sidebar.Root
      label="Main navigation"
      header={(
        <>
          <div className="flex px-2 pt-2">
          <Menu.Root>
            <Menu.Trigger asChild>
              <Sidebar.WorkspaceSwitcher name={workspace.name} avatar={<Avatar name={workspace.name} size="sm" />} />
            </Menu.Trigger>
            <Menu.Content width={240}>
              <Menu.Label>{me.email}</Menu.Label>
              <Menu.Item icon="checkmarkSmall">{workspace.name}</Menu.Item>
              <Menu.Separator />
              <Menu.Item icon="settings" onSelect={() => navigate({ name: 'settings' })}>Workspace settings</Menu.Item>
              <Menu.Item icon="inviteMember" onSelect={onInvite}>Invite members</Menu.Item>
            </Menu.Content>
          </Menu.Root>
          </div>
          <Sidebar.Search label="Search" onClick={onSearch} />
        </>
      )}
    >
      <Sidebar.Group>
        <Sidebar.Item icon="home" href={href({ name: 'home' })} active={is('home')}>My work</Sidebar.Item>
        <Sidebar.Item icon="viewTimeline" href={href({ name: 'timeline' })} active={is('timeline')}>Timeline</Sidebar.Item>
        <Sidebar.Item icon="people" href={href({ name: 'team' })} active={is('team')}>Team</Sidebar.Item>
        <Sidebar.Item icon="settings" href={href({ name: 'settings' })} active={is('settings')}>Settings</Sidebar.Item>
      </Sidebar.Group>
      <Sidebar.Section
        title="Projects"
        actions={<Sidebar.Action icon="plusSmall" label="New project" onClick={onNewProject} />}
      >
        <Sidebar.Item icon="folder" href={href({ name: 'projects' })} active={is('projects')}>All projects</Sidebar.Item>
        {projects.map((p) => (
          <Sidebar.Item
            key={p.slug}
            icon={<span className="text-[16px]">{p.emoji}</span>}
            href={href({ name: 'project', slug: p.slug })}
            active={activeProject === p.slug}
            rowClassName="pl-4"
          >
            {p.name}
          </Sidebar.Item>
        ))}
      </Sidebar.Section>
      <Sidebar.ScrollFooter>
        <Sidebar.Item icon={<Icon name="inviteMember" size={20} />} tone="muted" onClick={onInvite}>Invite members</Sidebar.Item>
      </Sidebar.ScrollFooter>
    </Sidebar.Root>
  );
}
