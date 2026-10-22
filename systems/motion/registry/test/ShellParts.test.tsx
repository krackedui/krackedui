import { describe, expect, it, vi } from 'vitest';
import {
  AppsMenu, BreadcrumbTrail, Button, HelpMenu, PageCover, PageLayout, PageTocRail, PeekComments, PeekProperties,
  PeekProperty, PeekTopBar, Sidebar, Topbar, TopbarActions, TrashMenu, WorkspaceMenu,
} from '@system';
import { renderUI, screen, waitFor, within } from '../../../../standard/gate/tests/utils';

const trash = [
  { id: 'a', title: 'Old roadmap', path: 'Team wiki' },
  { id: 'b', title: 'Draft notes' },
];

describe('Topbar', () => {
  it('has no document actions by default', () => {
    renderUI(<Topbar breadcrumbs={<BreadcrumbTrail items={[{ title: 'Projects' }]} privacy={null} />} />);
    const bar = screen.getByRole('banner');
    expect(within(bar).queryByRole('button', { name: 'Share' })).not.toBeInTheDocument();
    expect(within(bar).queryByRole('button', { name: 'Favorite' })).not.toBeInTheDocument();
    expect(within(bar).queryByText(/Edited/)).not.toBeInTheDocument();
  });

  it('shows each document action only when its prop is set', async () => {
    const onShare = vi.fn();
    const { user } = renderUI(<Topbar breadcrumbs="Doc" edited="Edited 2m ago" onShare={onShare} />);
    expect(screen.getByText('Edited 2m ago')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Share' }));
    expect(onShare).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Copy link' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Favorite' })).not.toBeInTheDocument();
  });

  it('actions override the document actions', () => {
    renderUI(<Topbar breadcrumbs="Doc" onShare={() => {}} actions={<Button>Publish</Button>} />);
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Share' })).not.toBeInTheDocument();
  });
});

describe('TopbarActions', () => {
  it('renders nothing without props', () => {
    const { container } = renderUI(<TopbarActions />);
    expect(container.querySelector('button')).toBeNull();
  });

  it('favorite is a toggle button and copy link calls back', async () => {
    const onFavorite = vi.fn();
    const onCopyLink = vi.fn();
    const { user } = renderUI(<TopbarActions favorite onFavorite={onFavorite} onCopyLink={onCopyLink} />);
    const star = screen.getByRole('button', { name: 'Favorite' });
    expect(star).toHaveAttribute('aria-pressed', 'true');
    await user.click(star);
    expect(onFavorite).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(onCopyLink).toHaveBeenCalledOnce();
  });
});

describe('BreadcrumbTrail', () => {
  it('is a labelled nav list; the last crumb is the current page; crumbs are buttons', async () => {
    const onHome = vi.fn();
    const onPrivacy = vi.fn();
    const { user } = renderUI(
      <BreadcrumbTrail items={[{ title: 'Home', onClick: onHome }, { title: 'Q4 roadmap' }]} onPrivacyClick={onPrivacy} />,
    );
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getAllByRole('listitem')).toHaveLength(2);
    expect(within(nav).getByRole('button', { name: 'Q4 roadmap' })).toHaveAttribute('aria-current', 'page');
    await user.click(within(nav).getByRole('button', { name: 'Home' }));
    expect(onHome).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: /Private/ }));
    expect(onPrivacy).toHaveBeenCalledOnce();
  });

  it('privacy={null} hides the badge', () => {
    renderUI(<BreadcrumbTrail items={[{ title: 'Home' }]} privacy={null} />);
    expect(screen.queryByRole('button', { name: /Private/ })).not.toBeInTheDocument();
  });
});

describe('Sidebar.TreeItem actions', () => {
  it('hover actions are opt-in, with configurable labels', async () => {
    const onAdd = vi.fn();
    const onMore = vi.fn();
    const { user } = renderUI(
      <Sidebar.Tree label="Projects">
        <Sidebar.TreeItem label="Plain" />
        <Sidebar.TreeItem label="Website" onAdd={onAdd} addLabel="Add a task" onMore={onMore} moreLabel="Project options" />
      </Sidebar.Tree>,
    );
    const plain = screen.getByRole('treeitem', { name: 'Plain' });
    expect(within(plain).queryByRole('button', { name: /Add|options|more/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add a task' }));
    expect(onAdd).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Project options' }));
    expect(onMore).toHaveBeenCalledOnce();
  });

  it('clicking the row selects the item, clicking an action does not', async () => {
    const onSelect = vi.fn();
    const onAdd = vi.fn();
    const { user } = renderUI(
      <Sidebar.Tree label="Pages"><Sidebar.TreeItem label="Docs" onSelect={onSelect} onAdd={onAdd} /></Sidebar.Tree>,
    );
    await user.click(screen.getByText('Docs'));
    expect(onSelect).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Add a page inside' }));
    expect(onAdd).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('tree keys: ↓/↑ move, → expands then enters, ← goes back to the parent, Enter selects', async () => {
    const onSelect = vi.fn();
    const { user } = renderUI(
      <Sidebar.Tree label="Pages">
        <Sidebar.TreeItem label="Wiki"><Sidebar.TreeItem label="Roadmap" onSelect={onSelect} /></Sidebar.TreeItem>
        <Sidebar.TreeItem label="Specs" />
      </Sidebar.Tree>,
    );
    await user.tab();
    const wiki = screen.getByRole('treeitem', { name: 'Wiki' });
    expect(wiki).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('treeitem', { name: 'Specs' })).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowRight}');
    expect(wiki).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowRight}');
    const roadmap = await screen.findByRole('treeitem', { name: 'Roadmap' });
    expect(roadmap).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledOnce();
    await user.keyboard('{ArrowLeft}');
    expect(wiki).toHaveFocus();
  });
});

describe('TrashMenu', () => {
  it('filters by title and restores / deletes / opens entries', async () => {
    const onOpen = vi.fn();
    const onRestore = vi.fn();
    const onDelete = vi.fn();
    const { user } = renderUI(<TrashMenu items={trash} onOpen={onOpen} onRestore={onRestore} onDelete={onDelete} />);
    const list = screen.getByRole('list', { name: 'Pages in Trash' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    await user.type(screen.getByRole('searchbox', { name: /Search pages in Trash/ }), 'draft');
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Restore Draft notes' }));
    expect(onRestore).toHaveBeenCalledWith('b');
    await user.click(screen.getByRole('button', { name: 'Delete Draft notes from Trash' }));
    expect(onDelete).toHaveBeenCalledWith('b');
    await user.click(screen.getByRole('button', { name: 'Draft notes' }));
    expect(onOpen).toHaveBeenCalledWith('b');
  });
});

describe('WorkspaceMenu', () => {
  it('opens from its trigger and selects a workspace', async () => {
    const onSelect = vi.fn();
    const { user } = renderUI(
      <WorkspaceMenu email="ada@example.com" workspaces={[{ id: 'w1', name: 'Acme' }, { id: 'w2', name: 'Side project' }]} currentId="w1" onSelect={onSelect}>
        <button type="button">Workspace</button>
      </WorkspaceMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Workspace' }));
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByText('ada@example.com')).toBeInTheDocument();
    await user.click(within(menu).getByRole('menuitemradio', { name: /Side project/ }));
    expect(onSelect).toHaveBeenCalledWith('w2');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });
});

describe('HelpMenu', () => {
  it('lists release notes and calls back', async () => {
    const onRelease = vi.fn();
    const { user } = renderUI(
      <HelpMenu releases={[{ id: 'r1', title: 'Charts', isNew: true }]} onRelease={onRelease}>
        <button type="button">Help</button>
      </HelpMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Help' }));
    const menu = await screen.findByRole('menu');
    await user.click(within(menu).getByRole('menuitem', { name: /Charts/ }));
    expect(onRelease).toHaveBeenCalledWith('r1');
  });
});

describe('AppsMenu', () => {
  it('opens and runs Library', async () => {
    const onLibrary = vi.fn();
    const { user } = renderUI(<AppsMenu trash={trash} onLibrary={onLibrary}><button type="button">Apps</button></AppsMenu>);
    await user.click(screen.getByRole('button', { name: 'Apps' }));
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: /Trash/ })).toHaveAttribute('aria-haspopup', 'menu');
    await user.click(within(menu).getByRole('menuitem', { name: /Library/ }));
    expect(onLibrary).toHaveBeenCalledOnce();
  });
});

describe('PeekTopBar', () => {
  it('labelled buttons call back', async () => {
    const onClose = vi.fn();
    const onNext = vi.fn();
    const { user } = renderUI(<PeekTopBar onClose={onClose} onNext={onNext} />);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });
});

describe('PeekComments', () => {
  it('Enter or Send submits the comment and clears the field', async () => {
    const onSubmit = vi.fn();
    const { user } = renderUI(<PeekComments onSubmit={onSubmit} />);
    const send = screen.getByRole('button', { name: 'Send comment' });
    expect(send).toBeDisabled();
    const input = screen.getByRole('textbox', { name: 'Add a comment…' });
    await user.type(input, 'Looks good{Enter}');
    expect(onSubmit).toHaveBeenLastCalledWith('Looks good');
    expect(input).toHaveValue('');
    await user.type(input, 'Ship it');
    await user.click(send);
    expect(onSubmit).toHaveBeenLastCalledWith('Ship it');
  });
});

describe('PeekProperties', () => {
  it('is a labelled table of rows with an add button', async () => {
    const onAddProperty = vi.fn();
    const { user } = renderUI(
      <PeekProperties onAddProperty={onAddProperty}>
        <PeekProperty label="Due">October 9</PeekProperty>
        <PeekProperty label="Owner" />
      </PeekProperties>,
    );
    const table = screen.getByRole('table', { name: 'Page properties' });
    expect(within(table).getByText('October 9')).toBeInTheDocument();
    expect(within(table).getByText('Empty')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add a property' }));
    expect(onAddProperty).toHaveBeenCalledOnce();
  });
});

describe('PageCover', () => {
  it('cover buttons are reachable and call back', async () => {
    const onChangeCover = vi.fn();
    const onReposition = vi.fn();
    const { user } = renderUI(<PageCover onChangeCover={onChangeCover} onReposition={onReposition}><div /></PageCover>);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Change cover' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onChangeCover).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Reposition' }));
    expect(onReposition).toHaveBeenCalledOnce();
  });
});

describe('PageTocRail', () => {
  const entries = [{ id: 'goals', label: 'Goals', level: 1 as const }, { id: 'risks', label: 'Risks', level: 2 as const }];
  it('is a disclosure: Enter opens the heading list, a heading calls onSelect, Escape closes', async () => {
    const onSelect = vi.fn();
    const { user } = renderUI(<PageTocRail entries={entries} activeId="goals" onSelect={onSelect} />);
    const toggle = screen.getByRole('button', { name: 'Table of contents' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.tab();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const nav = screen.getByRole('navigation', { name: 'Table of contents' });
    expect(within(nav).getByRole('button', { name: 'Goals' })).toHaveAttribute('aria-current', 'location');
    await user.click(within(nav).getByRole('button', { name: 'Risks' }));
    expect(onSelect).toHaveBeenCalledWith('risks');
    toggle.focus();
    await user.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('navigation', { name: 'Table of contents' })).not.toBeInTheDocument();
  });
});

describe('PageLayout', () => {
  it('renders a main landmark (or a div) with header and body', () => {
    const { rerender } = renderUI(<PageLayout header={<h1>Roadmap</h1>}><p>Body</p></PageLayout>);
    const main = screen.getByRole('main');
    expect(within(main).getByRole('heading', { name: 'Roadmap' })).toBeInTheDocument();
    expect(within(main).getByText('Body')).toBeInTheDocument();
    rerender(<PageLayout as="div"><p>Body</p></PageLayout>);
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});
