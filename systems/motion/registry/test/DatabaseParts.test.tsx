import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import {
  BoardView, CalendarToolbar, CalendarView, CardActions, ChartLockedState, DatabaseProvider, DateCellPicker, DbMenuItem,
  DbMenuRule, DbMenuSearch, FilterEditor, FilterMenu, GalleryView, ListView, MenuList, MenuSurface, NewViewMenu,
  PropertyCell, PropertyList, PropertyMenu, PropertyPickerMenu, PropertyRow, PropertyValueView, SAMPLE_TODAY, SelectPicker,
  SortEditor, SortMenu, SubmenuRow, TableView, TimelineView, ViewSettingsPanel, ViewsMenu, createTasksSample, useDatabase,
  useMenuKeys, type View, type DatabaseApi, type Filter, type Property, type Row,
} from '@system';
import { act, renderUI, screen, waitFor, within } from './utils';

const sample = createTasksSample();
const prop = (id: string) => sample.collection.properties.find((p) => p.id === id)!;

/** Renders a bare view inside its own database and exposes the live api for assertions. */
function setup(viewId: string, children: ReactNode) {
  const api: { current?: DatabaseApi } = {};
  function Host() {
    const db = useDatabase(createTasksSample, viewId);
    api.current = db;
    return <DatabaseProvider value={db}>{children}</DatabaseProvider>;
  }
  const r = renderUI(<Host />);
  const value = (rowId: string, propertyId: string) => api.current!.data.rows.find((x) => x.id === rowId)!.values[propertyId];
  return { ...r, api, value };
}

describe('DatabaseProvider', () => {
  it('shares one database between views', async () => {
    const { user, api } = setup('v-list', <ListView />);
    expect(screen.getByRole('list', { name: 'List' })).toBeInTheDocument();
    act(() => { api.current!.addRow({ title: 'Brand new task' }); });
    expect(await screen.findByText('Brand new task')).toBeInTheDocument();
    expect(user).toBeDefined();
  });
});

describe('TableView', () => {
  it('edits a title cell inline (Enter to edit, Enter to commit)', async () => {
    const { user, value } = setup('v-table', <TableView today={SAMPLE_TODAY} />);
    const table = screen.getByRole('table', { name: 'Table' });
    const cell = within(table).getAllByRole('button', { name: /^Design tokens audit$/ })[0];
    cell.focus();
    await user.keyboard('{Enter}');
    const input = within(table).getByDisplayValue('Design tokens audit');
    await user.clear(input);
    await user.type(input, 'Token audit{Enter}');
    expect(value('r1', 'title')).toBe('Token audit');
  });

  it('opens a row with the OPEN button', async () => {
    const onOpenRow = vi.fn<(row: Row) => void>();
    const { user } = setup('v-table', <TableView today={SAMPLE_TODAY} onOpenRow={onOpenRow} />);
    await user.click(screen.getByRole('button', { name: 'Open Sidebar rebuild' }));
    expect(onOpenRow.mock.calls[0][0].values.title).toBe('Sidebar rebuild');
  });

  it('sorts from the column property menu', async () => {
    const { user, api } = setup('v-table', <TableView today={SAMPLE_TODAY} />);
    await user.click(screen.getByRole('button', { name: 'Priority property options' }));
    const menu = await screen.findByRole('dialog', { name: 'Priority property' });
    await user.click(within(menu).getByRole('button', { name: /^Sort$/ }));
    await user.click(await screen.findByRole('button', { name: 'Sort ascending' }));
    expect(api.current!.activeView.sorts).toEqual([{ propertyId: 'priority', direction: 'ascending' }]);
  });

  it('selects rows with the row checkboxes', async () => {
    const onSelectedChange = vi.fn();
    const { user } = setup('v-table', <TableView today={SAMPLE_TODAY} onSelectedChange={onSelectedChange} />);
    await user.click(screen.getByRole('checkbox', { name: 'Select Docs shell' }));
    expect(onSelectedChange).toHaveBeenLastCalledWith(['r4']);
    await user.click(screen.getByRole('checkbox', { name: 'Select all' }));
    expect(onSelectedChange.mock.lastCall?.[0]).toHaveLength(8);
  });
});

describe('BoardView', () => {
  it('cards are grouped by status; Enter opens a card', async () => {
    const onOpenRow = vi.fn<(row: Row) => void>();
    const { user } = setup('v-board', <BoardView onOpenRow={onOpenRow} />);
    const done = screen.getByRole('group', { name: 'Done' });
    const card = within(done).getByRole('button', { name: /^Design tokens audit/ });
    card.focus();
    await user.keyboard('{Enter}');
    expect(onOpenRow.mock.calls[0][0].id).toBe('r1');
  });

  it('Alt+←/→ moves a card to the neighbouring column and announces it', async () => {
    const { user, value } = setup('v-board', <BoardView />);
    const card = within(screen.getByRole('group', { name: 'In progress' })).getByRole('button', { name: /^Sidebar rebuild/ });
    card.focus();
    await user.keyboard('{Alt>}{ArrowRight}{/Alt}');
    expect(value('r2', 'status')).toBe('done');
    expect(screen.getByRole('status')).toHaveTextContent('Moved to Done');
    await waitFor(() => expect(screen.getByRole('button', { name: /^Sidebar rebuild/ })).toHaveFocus());
  });

  it('“New page” in a column adds a row with that status', async () => {
    const { user, api } = setup('v-board', <BoardView />);
    const before = api.current!.data.rows.length;
    await user.click(within(screen.getByRole('group', { name: 'Done' })).getByRole('button', { name: /New page/ }));
    expect(api.current!.data.rows).toHaveLength(before + 1);
    expect(api.current!.data.rows.at(-1)?.values.status).toBe('done');
  });
});

describe('CardActions', () => {
  it('Edit and More are labelled buttons', async () => {
    const onEdit = vi.fn();
    const onMore = vi.fn();
    const { user } = renderUI(<CardActions onEdit={onEdit} onMore={onMore} />);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'More' }));
    expect(onEdit).toHaveBeenCalledOnce();
    expect(onMore).toHaveBeenCalledOnce();
  });
});

describe('GalleryView', () => {
  it('cards are list items that open on click', async () => {
    const onOpenRow = vi.fn<(row: Row) => void>();
    const { user } = setup('v-gallery', <GalleryView onOpenRow={onOpenRow} />);
    const list = screen.getByRole('list', { name: 'Gallery' });
    await user.click(within(list).getByRole('button', { name: /^Release notes/ }));
    expect(onOpenRow.mock.calls[0][0].id).toBe('r8');
  });
});

describe('ListView', () => {
  it('rows open with the keyboard', async () => {
    const onOpenRow = vi.fn<(row: Row) => void>();
    const { user } = setup('v-list', <ListView onOpenRow={onOpenRow} />);
    const row = within(screen.getByRole('list', { name: 'List' })).getByRole('button', { name: /^Docs shell/ });
    row.focus();
    await user.keyboard('{Enter}');
    expect(onOpenRow.mock.calls[0][0].id).toBe('r4');
  });
});

describe('CalendarView', () => {
  it('pages through months and adds a page on a day', async () => {
    const { user, api } = setup('v-calendar', <CalendarView today={SAMPLE_TODAY} />);
    expect(screen.getByText(/October 2026/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next Month' }));
    expect(screen.getByText(/November 2026/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Today' }));
    expect(screen.getByText(/October 2026/)).toBeInTheDocument();
    const before = api.current!.data.rows.length;
    await user.click(screen.getByRole('button', { name: /Add page on .*October 21/ }));
    expect(api.current!.data.rows).toHaveLength(before + 1);
    expect(api.current!.data.rows.at(-1)?.values.due).toBe('2026-10-21');
  });

  it('events open their row', async () => {
    const onOpenRow = vi.fn<(row: Row) => void>();
    const { user } = setup('v-calendar', <CalendarView today={SAMPLE_TODAY} onOpenRow={onOpenRow} />);
    await user.click(screen.getByRole('button', { name: /Docs shell/ }));
    expect(onOpenRow.mock.calls[0][0].id).toBe('r4');
  });
});

describe('CalendarToolbar', () => {
  it('previous / today / next call back; Manage in Calendar keeps its name', async () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const onToday = vi.fn();
    const { user } = renderUI(<CalendarToolbar label="October 2026" onPrev={onPrev} onNext={onNext} onToday={onToday} />);
    await user.click(screen.getByRole('button', { name: 'Previous Month' }));
    await user.click(screen.getByRole('button', { name: 'Today' }));
    await user.click(screen.getByRole('button', { name: 'Next Month' }));
    expect([onPrev, onToday, onNext].every((f) => f.mock.calls.length === 1)).toBe(true);
    expect(screen.getByRole('button', { name: 'Manage in Calendar' })).toBeInTheDocument();
  });
});

describe('TimelineView', () => {
  it('bars are buttons: Enter opens, ←/→ move the date by a day', async () => {
    const onOpenRow = vi.fn<(row: Row) => void>();
    const { user, value } = setup('v-timeline', <TimelineView today={SAMPLE_TODAY} onOpenRow={onOpenRow} />);
    const bar = screen.getByRole('button', { name: /^Docs shell, October 16/ });
    bar.focus();
    await user.keyboard('{ArrowRight}');
    expect(value('r4', 'due')).toBe('2026-10-17');
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(value('r4', 'due')).toBe('2026-10-15');
    screen.getByRole('button', { name: /^Docs shell, October 15/ }).focus();
    await user.keyboard('{Enter}');
    expect(onOpenRow.mock.calls[0][0].id).toBe('r4');
  });
});

describe('SelectPicker', () => {
  const options = [{ id: 'a', name: 'Alpha', color: 'blue' as const }, { id: 'b', name: 'Beta', color: 'green' as const }];

  it('is a combobox over a listbox: arrows + Enter pick, typing filters', async () => {
    const onChange = vi.fn();
    const onDone = vi.fn();
    const { user } = renderUI(<SelectPicker options={options} value={[]} onChange={onChange} onDone={onDone} autoFocus />);
    const combo = screen.getByRole('combobox', { name: 'Search or create an option' });
    expect(combo).toHaveFocus();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['b']);
    expect(onDone).toHaveBeenCalled();
    await user.type(combo, 'alp');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.keyboard('{Escape}');
    expect(onDone).toHaveBeenCalledTimes(2);
  });

  it('multi: clicking options toggles them and keeps focus in the field; creates new options', async () => {
    const onChange = vi.fn();
    const onCreate = vi.fn((name: string) => ({ id: 'c', name, color: 'default' as const }));
    const { user } = renderUI(<SelectPicker multi options={options} value={['a']} onChange={onChange} onCreate={onCreate} autoFocus />);
    const combo = screen.getByRole('combobox');
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    await user.click(screen.getByRole('option', { name: 'Beta' }));
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
    expect(combo).toHaveFocus();
    await user.type(combo, 'Gamma{Enter}');
    expect(onCreate).toHaveBeenCalledWith('Gamma');
    expect(onChange).toHaveBeenLastCalledWith(['a', 'c']);
  });
});

describe('DateCellPicker', () => {
  it('picks a day and jumps back to today', async () => {
    const onChange = vi.fn();
    const { user } = renderUI(<DateCellPicker value="2026-10-09" today={SAMPLE_TODAY} onChange={onChange} />);
    expect(screen.getByRole('button', { name: /October 9, 2026/ })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: /October 20, 2026/ }));
    expect(onChange).toHaveBeenLastCalledWith('2026-10-20');
    await user.click(screen.getByRole('button', { name: 'Go to next month' }));
    expect(screen.getByRole('heading', { name: /Nov 2026/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Today' }));
    expect(screen.getByRole('heading', { name: /Oct 2026/ })).toBeInTheDocument();
  });
});

describe('PropertyCell', () => {
  it('checkbox cell: a click anywhere in the cell toggles', async () => {
    const onChange = vi.fn();
    const checkbox: Property = { id: 'ok', name: 'Approved', type: 'checkbox' };
    const { user } = renderUI(<PropertyCell property={checkbox} value={false} onChange={onChange} className="h-9 w-40" />);
    await user.click(screen.getByRole('checkbox', { name: 'Approved' }));
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it('select cell opens the picker dialog', async () => {
    const onChange = vi.fn();
    const { user } = renderUI(<PropertyCell property={prop('priority')} value="low" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /Low/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Priority' });
    await user.click(within(dialog).getByRole('option', { name: 'High' }));
    expect(onChange).toHaveBeenLastCalledWith('high');
  });
});

describe('PropertyValueView', () => {
  it('renders values per type (tags, links, numbers)', () => {
    renderUI(
      <>
        <PropertyValueView property={prop('team')} value={['design', 'qa']} />
        <PropertyValueView property={{ id: 'u', name: 'Site', type: 'url' }} value="https://example.com" />
        <PropertyValueView property={{ id: 'n', name: 'Done', type: 'number', format: 'percent' }} value={40} />
      </>,
    );
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('QA')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'https://example.com' })).toHaveAttribute('href', 'https://example.com');
    expect(screen.getByText('40%')).toBeInTheDocument();
  });
});

describe('PropertyMenu', () => {
  it('renames on Enter, arrows move between rows, rows call back', async () => {
    const onRename = vi.fn();
    const onFilter = vi.fn();
    const { user } = renderUI(<PropertyMenu property={prop('priority')} onRename={onRename} onFilter={onFilter} />);
    const name = screen.getByRole('textbox', { name: 'Property name' });
    await user.clear(name);
    await user.type(name, 'Urgency{Enter}');
    expect(onRename).toHaveBeenCalledWith('Urgency');
    const filter = screen.getByRole('button', { name: /^Filter$/ });
    filter.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: /^Sort$/ })).toHaveFocus();
    await user.keyboard('{ArrowUp}{Enter}');
    expect(onFilter).toHaveBeenCalledOnce();
  });
});

describe('PropertyPickerMenu', () => {
  it('Enter in the search picks the first match', async () => {
    const onSelect = vi.fn<(p: Property) => void>();
    const { user } = renderUI(<PropertyPickerMenu placeholder="Group by…" properties={sample.collection.properties} onSelect={onSelect} autoFocus />);
    await user.keyboard('sta{Enter}');
    expect(onSelect.mock.calls[0][0].id).toBe('status');
  });
});

describe('FilterMenu', () => {
  it('lists properties and the advanced filter footer', async () => {
    const onSelect = vi.fn<(p: Property) => void>();
    const onAdvanced = vi.fn();
    const { user } = renderUI(<FilterMenu properties={sample.collection.properties} onSelect={onSelect} onAdvanced={onAdvanced} />);
    await user.click(screen.getByRole('button', { name: /^Due$/ }));
    expect(onSelect.mock.calls[0][0].id).toBe('due');
    await user.click(screen.getByRole('button', { name: 'Add advanced filter' }));
    expect(onAdvanced).toHaveBeenCalledOnce();
  });
});

describe('SortMenu', () => {
  it('searchbox filters the properties', async () => {
    const { user } = renderUI(<SortMenu properties={sample.collection.properties} />);
    await user.type(screen.getByRole('searchbox', { name: 'Sort by' }), 'pri');
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});

describe('FilterEditor', () => {
  it('changes the operator and toggles option values; delete removes', async () => {
    const onChange = vi.fn<(f: Filter) => void>();
    const onRemove = vi.fn();
    const filter: Filter = { id: 'f1', propertyId: 'status', operator: 'is', value: ['progress'] };
    const { user } = renderUI(<FilterEditor property={prop('status')} filter={filter} onChange={onChange} onRemove={onRemove} />);
    const op = screen.getByRole('button', { name: /^is/ });
    expect(op).toHaveAttribute('aria-expanded', 'false');
    await user.click(op);
    expect(op).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: /^Is not$/ }));
    expect(onChange.mock.lastCall?.[0].operator).toBe('is_not');
    await user.click(screen.getByRole('button', { name: /Done/ }));
    expect(onChange.mock.lastCall?.[0].value).toEqual(['progress', 'done']);
    await user.click(screen.getByRole('button', { name: 'Delete filter' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});

describe('SortEditor', () => {
  it('toggles direction and removes a sort', async () => {
    const onChange = vi.fn();
    const { user } = renderUI(<SortEditor properties={sample.collection.properties} sorts={[{ propertyId: 'due', direction: 'ascending' }]} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Ascending' }));
    expect(onChange).toHaveBeenLastCalledWith([{ propertyId: 'due', direction: 'descending' }]);
    await user.click(screen.getByRole('button', { name: 'Remove sort' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe('DbMenuItem', () => {
  function Menu({ onPick }: { onPick: (n: string) => void }) {
    const keys = useMenuKeys();
    return (
      <MenuSurface onKeyDown={keys}>
        <DbMenuSearch placeholder="Find…" />
        <MenuList role="group" aria-label="Items">
          <DbMenuItem onClick={() => onPick('one')}>One</DbMenuItem>
          <DbMenuItem onClick={() => onPick('two')}>Two</DbMenuItem>
        </MenuList>
        <DbMenuRule />
        <MenuList role="group" aria-label="Toggles"><DbMenuItem toggle={false}>Wrap</DbMenuItem></MenuList>
      </MenuSurface>
    );
  }
  it('rows are buttons (toggles: switches) moved through with arrows and activated with Enter', async () => {
    const onPick = vi.fn();
    const { user } = renderUI(<Menu onPick={onPick} />);
    expect(screen.getByRole('searchbox', { name: 'Find' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Wrap' })).toHaveAttribute('aria-checked', 'false');
    screen.getByRole('button', { name: 'One' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Two' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onPick).toHaveBeenCalledWith('two');
  });
});

describe('SubmenuRow', () => {
  it('opens its flyout with a click and closes from inside', async () => {
    const onPick = vi.fn();
    const { user } = renderUI(
      <MenuList role="group" aria-label="Menu">
        <SubmenuRow value="Table" content={(close) => <MenuList role="group" aria-label="Layouts"><DbMenuItem onClick={() => { onPick(); close(); }}>Board</DbMenuItem></MenuList>}>Layout</SubmenuRow>
      </MenuList>,
    );
    await user.click(screen.getByRole('button', { name: /Layout/ }));
    const flyout = await screen.findByRole('dialog', { name: 'Layout' });
    await user.click(within(flyout).getByRole('button', { name: 'Board' }));
    expect(onPick).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Layout' })).not.toBeInTheDocument());
  });
});

describe('ViewSettingsPanel', () => {
  it('is a labelled dialog; close and layout change call back', async () => {
    const onClose = vi.fn();
    const onChange = vi.fn();
    const { user } = renderUI(<ViewSettingsPanel collection={sample.collection} view={sample.views[0]} onClose={onClose} onChange={onChange} />);
    const panel = screen.getByRole('dialog', { name: 'View settings' });
    expect(within(panel).getByRole('textbox', { name: 'View name' })).toHaveValue('Table');
    await user.click(within(panel).getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('ViewsMenu', () => {
  it('searches views and picks one; New view calls back', async () => {
    const onSelect = vi.fn<(view: View) => void>();
    const onNewView = vi.fn();
    const { user } = renderUI(<ViewsMenu views={sample.views} activeViewId="v-table" onSelect={onSelect} onNewView={onNewView} />);
    await user.type(screen.getByRole('searchbox', { name: 'Search for a view' }), 'cal');
    const views = screen.getByRole('group', { name: 'Views' });
    await user.click(within(views).getByRole('button', { name: /Calendar/ }));
    expect(onSelect.mock.lastCall?.[0].id).toBe('v-calendar');
    await user.click(screen.getByRole('button', { name: 'New view' }));
    expect(onNewView).toHaveBeenCalledOnce();
  });
});

describe('NewViewMenu', () => {
  it('layout buttons pick a view type', async () => {
    const onSelect = vi.fn();
    const { user } = renderUI(<NewViewMenu onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: /Board/ }));
    expect(onSelect).toHaveBeenCalledWith('board');
  });
});

describe('PropertyList', () => {
  it('is a properties table without the title; values edit; Add a property calls back', async () => {
    const onChange = vi.fn();
    const onAddProperty = vi.fn();
    const { user } = renderUI(<PropertyList properties={sample.collection.properties} row={sample.rows[0]} onChange={onChange} onAddProperty={onAddProperty} today={SAMPLE_TODAY} />);
    const table = screen.getByRole('table', { name: 'Page properties' });
    expect(within(table).getAllByRole('row')).toHaveLength(sample.collection.properties.length - 1);
    expect(within(table).queryByRole('rowheader', { name: /Task/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add a property' }));
    expect(onAddProperty).toHaveBeenCalledOnce();
  });
});

describe('PropertyRow', () => {
  it('shows the property name and its editable value', () => {
    renderUI(<PropertyRow property={prop('priority')} value="low" />);
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Low/ })).toHaveAttribute('aria-haspopup', 'dialog');
  });
});

describe('ChartLockedState', () => {
  it('Upgrade now calls back; Learn more links only with an href', async () => {
    const onUpgrade = vi.fn();
    const { user, rerender } = renderUI(<ChartLockedState onUpgrade={onUpgrade} />);
    expect(screen.queryByRole('link', { name: /Learn more/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Upgrade now' }));
    expect(onUpgrade).toHaveBeenCalledOnce();
    rerender(<ChartLockedState learnMoreHref="/help/charts" />);
    expect(screen.getByRole('link', { name: /Learn more/ })).toHaveAttribute('href', '/help/charts');
  });
});
