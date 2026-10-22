import { useState, type ReactNode } from 'react';
import {
  AppFrame, Sidebar, Topbar, BreadcrumbTrail, PageLayout, PageCover, PageHeader,
  SidePeek, PeekBody, PeekProperties, PeekProperty, PeekComments, CenterPeek,
  SettingsModal, SettingsNav, SettingsNavGroup, SettingsNavItem, SettingsBadge, SettingsPage, SettingsSection, SettingsRow, SettingsSelect, SettingsSwitch,
  WorkspaceMenu, HelpMenu, AppsMenu, Icon, Menu,
} from '@krackedui/motion';

/*
 * Shell lab. `#/lab/shell` = full-window app (diff against the private reference
 * mirror/states/app.light.png at 1710x1037). Flags after `?` (combine with `dark`):
 *   collapsed  sidebar collapsed (hover » or the left edge for the floating peek)
 *   peek       side peek open        center   center peek open
 *   settings   settings modal open   topbar   topbar visible (it is faded/idle in the capture)
 *   full       full-width page       nocover  page without cover (with icon)
 */
const flags = () => new Set((location.hash.split('?')[1] ?? '').split(/[&,]/));

// Lab-only cover: the captured cover image is not in the repo, so crop it out of the mirror screenshot.
const mirror = new URL('../../../../mirror/states/app.light.png', import.meta.url).href;
const CoverCrop = () => <div className="size-full" style={{ background: `url(${mirror}) -270px -44px / 1710px 1037px no-repeat` }} />;

const pages = [
  'Project review @September 24, 2026',
  'Design crit @September 25, 2026',
  'Greeting and wellbeing check',
];

function SidebarReplica({ onSettings }: { onSettings: () => void }) {
  return (
    <Sidebar.Root
      header={<><Sidebar.Search /><Sidebar.Tabs /></>}
      footer={<Sidebar.InviteCard />}
      bottomBar={
        <Sidebar.BottomBar>
          <WorkspaceMenu
            email="ada@example.com"
            workspaces={[{ id: 'a', name: "Design Team" }]}
            currentId="a"
            onSettings={onSettings}
          >
            <Sidebar.WorkspaceSwitcher name="Design Team" />
          </WorkspaceMenu>
          <HelpMenu releases={[{ id: '38', title: 'Motion 3.8', isNew: true }, { id: '37', title: 'Motion 3.7', isNew: true }, { id: 'mc', title: 'Model controls', isNew: true }]}>
            <Sidebar.BarButton icon="questionMarkCircle" label="Help, contact, more…" />
          </HelpMenu>
          <AppsMenu trash={[{ id: 't1', title: 'Old meeting notes', path: 'Private' }, { id: 't2', title: 'Draft', path: 'DS Sandbox' }]}>
            <Sidebar.BarButton icon="circleGrid2X2" label="Library, Trash, more…" />
          </AppsMenu>
        </Sidebar.BottomBar>
      }
    >
      <Sidebar.Group>
        <Sidebar.Item icon="chatBubblePlus" actions={<Sidebar.Action icon="ellipsisSmall" label="Open shortcut menu" />}>New chat</Sidebar.Item>
        <Sidebar.Item icon="bookshelf" actions={<Sidebar.Action icon="ellipsisSmall" label="Open shortcut menu" />}>Library</Sidebar.Item>
      </Sidebar.Group>
      <Sidebar.Sections>
        <Sidebar.Section title="Upcoming events">
          <Sidebar.Item tone="muted" icon={<Icon name="calendarAltEmpty" size={20} />}>No upcoming events</Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section title="Shared" actions={<Sidebar.Action icon="plusSmall" label="Add a page" />}>
          <Sidebar.Item tone="secondary" icon={<Icon name="plus" size={16} />}>Start collaborating</Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section
          title="Private"
          actions={<><Sidebar.Action icon="ellipsisSmall" label="Private section options" /><Sidebar.Action icon="plusSmall" label="Add a page" /></>}
        >
          <Sidebar.Tree label="Private pages">
            <Sidebar.TreeItem label="DS Sandbox" active defaultExpanded>
              <Sidebar.TreeItem label="Tasks" icon={<Icon name="viewTable" size={20} />} />
            </Sidebar.TreeItem>
            {pages.map((p) => <Sidebar.TreeItem key={p} label={p} />)}
            <Sidebar.TreeItem label="DAILY PLAN" defaultExpanded />
            {['@April 4, 2026 1:08 PM', '@March 4, 2026 5:09 PM', '@January 29, 2026 4:58 PM', 'Roadmap', 'Future ideas'].map((p) => <Sidebar.TreeItem key={p} label={p} />)}
          </Sidebar.Tree>
          <Sidebar.Item tone="muted" icon={<Icon name="ellipsis" size={20} />}>View all</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Sections>
      <Sidebar.ScrollFooter>
        <Sidebar.Item tone="muted" icon="sliders" aria-label="Customize sidebar">Customize sidebar</Sidebar.Item>
      </Sidebar.ScrollFooter>
    </Sidebar.Root>
  );
}

/* Placeholder page body approximating the captured blocks (editor group owns real blocks). */
const H = ({ size, lh, pt, children }: { size: number; lh: number; pt: number; children: ReactNode }) => (
  <div style={{ padding: `${pt}px 6px 6px` }}><div className="p-0.5 font-semibold" style={{ fontSize: size, lineHeight: `${lh}px` }}>{children}</div></div>
);
const Li = ({ marker, children, depth = 0 }: { marker: ReactNode; children: ReactNode; depth?: number }) => (
  <div className="flex px-1.5 py-px pl-2" style={{ marginLeft: depth * 32 }}>
    <div className="flex h-7 w-6 shrink-0 items-center justify-center">{marker}</div>
    <div className="py-0.5 pl-1.5 leading-6">{children}</div>
  </div>
);
const dot = <span className="text-[24px] leading-none">•</span>;
function PlaceholderBody() {
  return (
    <div className="text-[16px] leading-6">
      <H size={30} lh={39} pt={30}>Heading 1</H>
      <H size={24} lh={31.2} pt={26}>Heading 2</H>
      <H size={20} lh={26} pt={22}>Heading 3</H>
      <div className="p-1.5"><div className="p-0.5">
        Plain paragraph with <b className="font-semibold">bold</b>, <i>italic</i>, <s>strikethrough</s>, <u>underline</u>,{' '}
        <code className="rounded-n-sm bg-n-bg-interactive-translucent-a px-[5.44px] py-[2.72px] font-mono text-[13.6px] text-n-red-text-secondary">inline code</code> and a{' '}
        <a className="underline opacity-70">link</a>. This sentence is long enough to wrap onto a second line so we can measure line height and paragraph rhythm in the editor.
      </div></div>
      <div className="pt-1.5">
        <Li marker={dot}>Bulleted item one</Li>
        <Li marker={dot}>Bulleted item two</Li>
        <Li marker={<span className="text-[18px]">◦</span>} depth={1}>Nested bullet</Li>
        <Li marker={<span className="text-[13px]">▪</span>} depth={2}>Deeper nested bullet</Li>
        <Li marker="1.">Numbered item one</Li>
        <Li marker="2.">Numbered item two</Li>
        <Li marker="a." depth={1}>Nested numbered</Li>
        <Li marker={dot}>Unchecked to-do</Li>
        <Li marker={dot}>Checked to-do</Li>
        <Li marker={<span className="text-[12px]">▼</span>}>Toggle list item</Li>
      </div>
      <div className="h-[1200px]" />
    </div>
  );
}

const toc = [
  { id: 'h1', label: 'Heading 1', level: 1 as const },
  { id: 'h2', label: 'Heading 2', level: 2 as const },
  { id: 'h3', label: 'Heading 3', level: 3 as const },
  { id: 'h4', label: 'Heading 2', level: 2 as const },
];

function Settings({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <SettingsModal
      open={open}
      onOpenChange={onOpenChange}
      nav={
        <SettingsNav footer={null}>
          <SettingsNavGroup label="Account">
            <SettingsNavItem icon={<span className="flex size-[22px] items-center justify-center rounded-full bg-n-bg-primary text-[11px] text-n-icon-secondary shadow-n-shadow-outline-sm">A</span>}>Ada Lovelace</SettingsNavItem>
            <SettingsNavItem icon="sliders" selected>Preferences</SettingsNavItem>
            <SettingsNavItem icon="bell">Notifications</SettingsNavItem>
            <SettingsNavItem icon="envelope">Mail &amp; Calendar</SettingsNavItem>
          </SettingsNavGroup>
          <SettingsNavGroup label="Workspace">
            <SettingsNavItem icon="gear">General</SettingsNavItem>
            <SettingsNavItem icon="people">People</SettingsNavItem>
            <SettingsNavItem icon="sidebarLeft">Sidebar</SettingsNavItem>
            <SettingsNavItem icon="arrowLineDown">Import</SettingsNavItem>
          </SettingsNavGroup>
          <SettingsNavGroup label="Features">
            <SettingsNavItem icon="aiFace">Motion AI</SettingsNavItem>
            <SettingsNavItem icon="paperMicrophone" badge={<SettingsBadge tone="blue">New</SettingsBadge>}>Meeting notes</SettingsNavItem>
            <SettingsNavItem icon="squareGrid2X2">Connections</SettingsNavItem>
            <SettingsNavItem icon="globe">Public pages</SettingsNavItem>
          </SettingsNavGroup>
          <SettingsNavGroup label="Access & billing">
            <SettingsNavItem icon={<Icon name="arrowInCircleUpFill" size={18} />} tone="accent">Upgrade plan</SettingsNavItem>
          </SettingsNavGroup>
        </SettingsNav>
      }
    >
      <SettingsPage title="Preferences" description="Choose how you want Motion to look and behave.">
        <SettingsSection title="Appearance">
          <SettingsRow label="Theme" description="Choose a theme for Motion on this device" control={<SettingsSelect>Light</SettingsSelect>} />
          <SettingsRow label="High contrast" badge={<SettingsBadge>Beta</SettingsBadge>} description="Increase contrast for improved visibility" control={<SettingsSelect>Use system setting</SettingsSelect>} />
        </SettingsSection>
        <SettingsSection title="Input options">
          <SettingsRow label="Use Enter to add a new line" description="Press Cmd+Enter to send messages" control={<SettingsSwitch />} />
        </SettingsSection>
      </SettingsPage>
    </SettingsModal>
  );
}

export default function ShellLab() {
  const f = flags();
  const [settings, setSettings] = useState(f.has('settings'));
  const [peek, setPeek] = useState(f.has('peek'));
  const [center, setCenter] = useState(f.has('center'));
  const cover = !f.has('nocover');

  return (
    <div className="h-screen w-screen">
      <AppFrame
        defaultSidebarOpen={!f.has('collapsed')}
        sidebar={<SidebarReplica onSettings={() => setSettings(true)} />}
        topbar={
          <Topbar
            idle={!f.has('topbar')}
            breadcrumbs={<BreadcrumbTrail items={[{ title: 'DS Sandbox' }]} />}
            edited="Edited 2m ago"
            onShare={() => setPeek(true)}
            moreSlot={
              <Menu.Root>
                <Menu.Trigger asChild>
                  <button type="button" aria-label="Actions" className="flex size-7 items-center justify-center rounded-n-md text-n-icon-primary hover:bg-n-button-hover-bg-a">
                    <Icon name="ellipsis" size={22} />
                  </button>
                </Menu.Trigger>
                <Menu.Content align="end" width={240}>
                  <Menu.Item icon="peekSide" onSelect={() => setPeek(true)}>Open side peek</Menu.Item>
                  <Menu.Item icon="arrowExpandDiagonalSmall" onSelect={() => setCenter(true)}>Open center peek</Menu.Item>
                  <Menu.Item icon="gear" onSelect={() => setSettings(true)}>Settings</Menu.Item>
                </Menu.Content>
              </Menu.Root>
            }
          />
        }
        peek={
          <SidePeek open={peek} onClose={() => setPeek(false)} onSwitchMode={() => { setPeek(false); setCenter(true); }}>
            <PeekBody
              header={<PageHeader size="peek" title="Sidebar rebuild" extraControls={null} />}
              properties={
                <PeekProperties>
                  <PeekProperty icon="calendarDate15" label="Due">October 9, 2026</PeekProperty>
                  <PeekProperty icon="arrowInCircleDown" label="Priority"><span className="rounded-n-sm bg-n-bg-tertiary-translucent-a px-1.5 leading-5">High</span></PeekProperty>
                  <PeekProperty icon="checkmarkCircle" label="Status" />
                  <PeekProperty icon="listBullet" label="Team" />
                </PeekProperties>
              }
              comments={<PeekComments />}
            >
              <div className="pb-6 pl-2 pt-2 text-n-text-tertiary">Press ‘enter’ to continue with an empty page, or <u>create a template</u></div>
            </PeekBody>
          </SidePeek>
        }
      >
        <PageLayout
          fullWidth={f.has('full')}
          toc={toc}
          cover={cover ? <PageCover><CoverCrop /></PageCover> : undefined}
          header={<PageHeader title="DS Sandbox" icon={cover ? undefined : '🧪'} onAddIcon={() => undefined} onAddCover={() => undefined} onAddComment={() => undefined} />}
        >
          <PlaceholderBody />
        </PageLayout>
      </AppFrame>
      <Settings open={settings} onOpenChange={setSettings} />
      <CenterPeek open={center} onOpenChange={setCenter} onSwitchMode={() => { setCenter(false); setPeek(true); }}>
        <PeekBody gutter={96} header={<PageHeader size="peek" title="Sidebar rebuild" />} comments={<PeekComments />} />
      </CenterPeek>
    </div>
  );
}
