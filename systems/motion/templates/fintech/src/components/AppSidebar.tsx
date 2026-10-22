import { Avatar, Menu, Sidebar } from '@krackedui/motion';
import { company, otherCompanies } from '../data/company';
import { href, useRoute } from '../lib/router';
import { navItems, sectionOf } from '../lib/navigation';
import { useCommandMenu } from './CommandMenu';

/** Company switcher: the workspace button opens a menu of the companies this user can see. */
function CompanySwitcher() {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Sidebar.WorkspaceSwitcher name={company.name} aria-label={`Company: ${company.name}. Switch company`} />
      </Menu.Trigger>
      <Menu.Content width={240} align="start">
        <Menu.Label>Companies</Menu.Label>
        <Menu.Item icon={<Avatar name={company.name} size="xs" shape="workspace" />} checked>
          {company.name}
        </Menu.Item>
        {otherCompanies.map((name) => (
          <Menu.Item key={name} icon={<Avatar name={name} size="xs" shape="workspace" />}>{name}</Menu.Item>
        ))}
        <Menu.Separator />
        <Menu.Item icon="plus">Add a company</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}

export function AppSidebar() {
  const route = useRoute();
  const current = sectionOf(route);
  const { setOpen } = useCommandMenu();
  return (
    <Sidebar.Root label="Main navigation">
      <Sidebar.Header>
        <div className="flex px-1 pt-1">
          <CompanySwitcher />
        </div>
        <Sidebar.Search label="Search" onClick={() => setOpen(true)} />
      </Sidebar.Header>
      <Sidebar.Group>
        {navItems.map((item) => (
          <Sidebar.Item key={item.label} icon={item.icon} href={href(item.route)} active={current === item}>
            {item.label}
          </Sidebar.Item>
        ))}
      </Sidebar.Group>
    </Sidebar.Root>
  );
}
