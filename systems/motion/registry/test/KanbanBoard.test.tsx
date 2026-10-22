import { describe, expect, it, vi } from 'vitest';
import { KanbanBoard, type KanbanMove } from '@system';
import { act, fireEvent, renderUI, screen, waitFor, within } from '../../../../standard/gate/tests/utils';

// jsdom has no PointerEvent: a MouseEvent with pointer fields is enough for the board.
if (typeof window.PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number; pointerType: string;
    constructor(type: string, init: PointerEventInit = {}) { super(type, init); this.pointerId = init.pointerId ?? 1; this.pointerType = init.pointerType ?? 'mouse'; }
  }
  Object.assign(window, { PointerEvent: PointerEventPolyfill });
}

interface Task { id: string; title: string; status: string }
const columns = [
  { id: 'todo', title: 'To do', color: 'brown' as const },
  { id: 'doing', title: 'In progress', color: 'blue' as const },
  { id: 'done', title: 'Done', color: 'green' as const },
];
const tasks: Task[] = [
  { id: 'T-1', title: 'Write brief', status: 'todo' },
  { id: 'T-2', title: 'Sketch layouts', status: 'todo' },
  { id: 'T-3', title: 'Build page', status: 'doing' },
];

function Board(props: { onMove?: (m: KanbanMove) => void; onQuickAdd?: (c: string, t: string) => void; onDelete?: (id: string) => void }) {
  return (
    <KanbanBoard
      label="Sprint board"
      columns={columns}
      items={tasks}
      getItemId={(t) => t.id}
      getColumnId={(t) => t.status}
      getItemLabel={(t) => t.title}
      renderCard={(t, { actions }) => <div><span>{t.title}</span>{actions}</div>}
      onMove={props.onMove}
      onQuickAdd={props.onQuickAdd}
      quickAddLabel="Add task"
      itemActions={props.onDelete ? (t, M) => <M.Item onSelect={() => props.onDelete?.(t.id)}>Delete</M.Item> : undefined}
      emptyColumnText="Nothing here"
    />
  );
}

describe('KanbanBoard', () => {
  it('renders labelled columns with counts inside a named scroll region, and empty-column text', () => {
    renderUI(<Board onMove={() => {}} />);
    const region = screen.getByRole('region', { name: 'Sprint board' });
    expect(within(region).getByRole('heading', { name: /To do\s*2 items/ })).toBeInTheDocument();
    expect(within(region).getByRole('list', { name: 'In progress' })).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Done' })).getByText('Nothing here')).toBeInTheDocument();
  });

  it('keyboard: "Move to…" in the card menu calls onMove and announces the move', async () => {
    const onMove = vi.fn();
    const { user } = renderUI(<Board onMove={onMove} />);
    screen.getByRole('button', { name: 'Actions for Write brief' }).focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{ArrowRight}'); // first item is the "Move to…" submenu
    const done = await screen.findByRole('menuitem', { name: 'Done' });
    await user.click(done);
    expect(onMove).toHaveBeenCalledWith({ itemId: 'T-1', fromColumnId: 'todo', toColumnId: 'done', toIndex: 0 });
    expect(screen.getByRole('status')).toHaveTextContent('Moved Write brief to Done, position 1 of 1.');
  });

  it('keyboard: Move down / Move up reorder inside the column; edges are disabled', async () => {
    const onMove = vi.fn();
    const { user } = renderUI(<Board onMove={onMove} />);
    await user.click(screen.getByRole('button', { name: 'Actions for Write brief' }));
    expect(await screen.findByRole('menuitem', { name: 'Move up' })).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByRole('menuitem', { name: 'Move down' }));
    expect(onMove).toHaveBeenLastCalledWith({ itemId: 'T-1', fromColumnId: 'todo', toColumnId: 'todo', toIndex: 1 });
  });

  it('adds extra item actions to the menu', async () => {
    const onDelete = vi.fn();
    const { user } = renderUI(<Board onMove={() => {}} onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: 'Actions for Build page' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith('T-3');
  });

  it('quick add: type a title and press Enter; Escape closes', async () => {
    const onQuickAdd = vi.fn();
    const { user } = renderUI(<Board onQuickAdd={onQuickAdd} />);
    await user.click(screen.getByRole('button', { name: 'Add task to Done' }));
    const input = screen.getByRole('textbox', { name: 'New item in Done' });
    await user.type(input, 'Ship it{Enter}');
    expect(onQuickAdd).toHaveBeenCalledWith('done', 'Ship it');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('textbox', { name: 'New item in Done' })).not.toBeInTheDocument();
  });

  it('pointer: dragging a card over another column and releasing calls onMove', async () => {
    const onMove = vi.fn();
    renderUI(<Board onMove={onMove} />);
    const card = screen.getByText('Build page').closest('li') as HTMLElement;
    const doneColumn = document.querySelector('[data-kanban-column="done"]') as HTMLElement;
    // jsdom has no layout: the column under the pointer is always "Done".
    Object.defineProperty(document, 'elementFromPoint', { value: () => doneColumn, configurable: true });
    try {
      fireEvent.pointerDown(card, { button: 0, pointerType: 'mouse', clientX: 10, clientY: 10, pointerId: 1 });
      fireEvent.pointerMove(card, { pointerType: 'mouse', clientX: 40, clientY: 12, pointerId: 1 });
      await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Picked up Build page'));
      act(() => { window.dispatchEvent(new MouseEvent('pointermove', { clientX: 300, clientY: 20 })); });
      act(() => { window.dispatchEvent(new MouseEvent('pointerup', { clientX: 300, clientY: 20 })); });
      expect(onMove).toHaveBeenCalledWith({ itemId: 'T-3', fromColumnId: 'doing', toColumnId: 'done', toIndex: 0 });
    } finally {
      Reflect.deleteProperty(document, 'elementFromPoint');
    }
  });

  it('without onMove or itemActions there is no actions menu and cards do not drag', () => {
    renderUI(<Board />);
    expect(screen.queryByRole('button', { name: /Actions for/ })).not.toBeInTheDocument();
  });
});
