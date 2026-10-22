import {
  useCallback, useEffect, useId, useRef, useState,
  type HTMLAttributes, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode,
} from 'react';
import { ThemePortal } from '../foundations/ThemePortal';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { IconButton } from '../atoms/IconButton';
import { StatusPill, type MotionColor } from '../atoms/Tag';
import { TextInput } from '../atoms/TextInput';
import { Field } from '../forms/Field';
import { ContextMenu, Menu } from '../components/Menu';

/**
 * KanbanBoard: items in status columns that people move by dragging (mouse, pen, touch) or with the
 * keyboard ("Move to…", "Move up", "Move down" in each card's menu, also on right-click). Columns are 272px,
 * bg-secondary, radius 8, 8px padding and gap; the header is the column's StatusPill + a count Badge; the
 * board scrolls sideways inside its own region. The dragged card floats under the pointer (`.motion-lift`)
 * and a 2px blue line (`.motion-drop`) shows where it lands. Inferred from Motion's database board and Card;
 * no reference capture.
 */
export const kanbanBoardVariants = tv({
  slots: {
    root: 'relative min-w-0',
    // relative: the containing block of absolutely positioned descendants (sr-only counts, drop lines), so they
    // scroll and clip with the columns instead of widening the page.
    scroller: 'relative overflow-x-auto pb-2 outline-none focus-visible:shadow-n-focus-shadow',
    track: 'flex w-max items-start gap-3',
    column: 'flex shrink-0 flex-col gap-2 rounded-n-lg bg-n-bg-secondary p-2 transition-shadow duration-100',
    header: 'm-0 flex h-7 min-w-0 items-center gap-2 px-1 text-n-ui font-normal',
    actions: 'ml-auto flex items-center gap-0.5',
    list: 'm-0 flex min-h-10 list-none flex-col gap-2 p-0',
    item: 'relative touch-manipulation select-none',
    empty: 'flex min-h-16 items-center justify-center rounded-n-md border border-dashed border-n-border-primary px-3 text-center text-n-ui-sm text-n-text-secondary',
    drop: 'motion-drop pointer-events-none absolute inset-x-1 h-0.5 rounded-full bg-n-blue-icon-accent-primary',
    ghost: 'motion-lift pointer-events-none fixed z-[200] opacity-95 shadow-n-shadow-outline-lg',
  },
  variants: {
    over: { true: { column: 'shadow-[inset_0_0_0_2px_var(--n-blue-icon-accent-primary)]' } },
    dragging: { true: { item: 'opacity-40' } },
  },
});

export interface KanbanColumn {
  id: string;
  /** Header content; a string is shown in a StatusPill. */
  title: ReactNode;
  /** Plain-text name for announcements and menus (defaults to `title` when it is a string, else the id). */
  label?: string;
  /** Pill color of the header (Motion's named palette). */
  color?: MotionColor;
}

export interface KanbanMove {
  itemId: string;
  fromColumnId: string;
  toColumnId: string;
  /** Position in the target column, counted without the moved item (0 = top). */
  toIndex: number;
}

export interface KanbanCardState {
  /** This card is being dragged (its placeholder is dimmed). */
  dragging: boolean;
  /** The card's actions button ("…": Move to…, Move up, Move down + `itemActions`). Place it in your card. */
  actions: ReactNode;
}

export interface KanbanBoardProps<Item> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  columns: KanbanColumn[];
  /** Every item, in board order (each column shows its items in this order). */
  items: Item[];
  getItemId(this: void, item: Item): string;
  getColumnId(this: void, item: Item): string;
  /** Plain-text name of an item for announcements and the actions button (default: its id). */
  getItemLabel?(this: void, item: Item): string;
  /** The card. Put `state.actions` somewhere in it (usually the top-right corner). */
  renderCard(this: void, item: Item, state: KanbanCardState): ReactNode;
  /** Called when an item is dropped or moved with the keyboard. Update `items` to apply it. */
  onMove?(this: void, move: KanbanMove): void;
  /** Shows "+ Add" at the bottom of every column; called with the typed title. */
  onQuickAdd?(this: void, columnId: string, title: string): void;
  /** Label of the quick-add button (default "Add item"). */
  quickAddLabel?: string;
  /** Column whose quick-add field starts open. */
  defaultQuickAddColumnId?: string;
  /** Extra header controls per column (right side). */
  columnActions?(this: void, column: KanbanColumn): ReactNode;
  /** Extra menu items after the move items, e.g. `<Menu.Item>Delete</Menu.Item>`. Rendered in both the menu and the context menu. */
  itemActions?(this: void, item: Item, parts: typeof Menu | typeof ContextMenu): ReactNode;
  /** Shown in an empty column (default "No items"). */
  emptyColumnText?: ReactNode;
  /** Column width in px (default 272). */
  columnWidth?: number;
  /** Accessible name of the board region (default "Board"). */
  label?: string;
}

type Drag = {
  id: string;
  from: string;
  /** Pointer offset inside the card and its size, for the floating copy. */
  dx: number; dy: number; w: number;
  x: number; y: number;
  over?: { column: string; index: number };
};

const DRAG_THRESHOLD = 5; // px of movement before a mouse/pen press becomes a drag
const TOUCH_HOLD = 250; // ms a finger rests on a card before it lifts (so swipes still scroll)
const EDGE = 48; // px from the board's edge where dragging scrolls it

const textOf = (node: ReactNode, fallback: string) => (typeof node === 'string' || typeof node === 'number' ? String(node) : fallback);

/**
 * Board of columns (statuses, stages) with cards that move between and within them. Pointer drag works with
 * mouse, pen and touch (press and hold on touch); the keyboard path is each card's actions menu. Every move
 * is announced in a polite live region. Controlled: it calls `onMove` and shows whatever `items` you pass.
 */
export function KanbanBoard<Item>({
  columns, items, getItemId, getColumnId, getItemLabel, renderCard, onMove, onQuickAdd, quickAddLabel = 'Add item',
  defaultQuickAddColumnId, columnActions, itemActions, emptyColumnText = 'No items', columnWidth = 272, label = 'Board',
  className, ...props
}: KanbanBoardProps<Item>) {
  const s = kanbanBoardVariants();
  const scroller = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const suppressClick = useRef(false);

  const nameOf = useCallback((item: Item) => getItemLabel?.(item) ?? getItemId(item), [getItemId, getItemLabel]);
  const columnName = useCallback((id: string) => {
    const c = columns.find((x) => x.id === id);
    return c ? c.label ?? textOf(c.title, c.id) : id;
  }, [columns]);
  const columnItems = useCallback((columnId: string) => items.filter((it) => getColumnId(it) === columnId), [items, getColumnId]);

  const commit = useCallback((itemId: string, toColumnId: string, toIndex: number) => {
    const item = items.find((it) => getItemId(it) === itemId);
    if (!item) return;
    const fromColumnId = getColumnId(item);
    const target = columnItems(toColumnId).filter((it) => getItemId(it) !== itemId);
    const index = Math.max(0, Math.min(toIndex, target.length));
    const current = columnItems(fromColumnId).findIndex((it) => getItemId(it) === itemId);
    if (fromColumnId === toColumnId && current === index) { setAnnouncement(`${nameOf(item)} stays in ${columnName(toColumnId)}.`); return; }
    onMove?.({ itemId, fromColumnId, toColumnId, toIndex: index });
    setAnnouncement(`Moved ${nameOf(item)} to ${columnName(toColumnId)}, position ${index + 1} of ${target.length + 1}.`);
  }, [items, getItemId, getColumnId, columnItems, onMove, nameOf, columnName]);

  /* ---------- pointer drag ---------- */

  const targetAt = useCallback((x: number, y: number, dragId: string): Drag['over'] => {
    const el = document.elementFromPoint?.(x, y);
    const col = el?.closest<HTMLElement>('[data-kanban-column]');
    if (!col) return undefined;
    const column = col.dataset.kanbanColumn ?? '';
    const cards = [...col.querySelectorAll<HTMLElement>('[data-kanban-item]')].filter((c) => c.dataset.kanbanItem !== dragId);
    let index = cards.length;
    for (let i = 0; i < cards.length; i++) {
      const r = cards[i].getBoundingClientRect();
      if (y < r.top + r.height / 2) { index = i; break; }
    }
    return { column, index };
  }, []);

  // Listeners live on window from pointerdown to pointerup, so the drag follows the pointer anywhere.
  const cleanupRef = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanupRef.current?.(), []);

  const onPointerDown = (e: ReactPointerEvent<HTMLLIElement>, id: string, from: string) => {
    if (!onMove || e.button > 0) return;
    // Interactive parts of the card (menus, buttons, inputs) keep their own behaviour; links still drag.
    if ((e.target as HTMLElement).closest('button, input, textarea, select, [role="menuitem"], [contenteditable="true"]')) return;
    cleanupRef.current?.();
    const el = e.currentTarget;
    const touch = e.pointerType === 'touch';
    const x0 = e.clientX;
    const y0 = e.clientY;
    let started = false;

    const begin = (x: number, y: number) => {
      started = true;
      const r = el.getBoundingClientRect();
      const d: Drag = { id, from, dx: x0 - r.left, dy: y0 - r.top, w: r.width, x, y, over: targetAt(x, y, id) };
      dragRef.current = d;
      setDrag(d);
      const item = items.find((it) => getItemId(it) === id);
      if (item) setAnnouncement(`Picked up ${nameOf(item)}. Release over a column to move it, or press Escape to cancel.`);
    };
    const timer = touch ? window.setTimeout(() => begin(x0, y0), TOUCH_HOLD) : undefined;
    const update = (x: number, y: number) => {
      const d = dragRef.current;
      if (!d) return;
      const sc = scroller.current;
      if (sc) {
        const r = sc.getBoundingClientRect();
        if (x < r.left + EDGE) sc.scrollLeft -= 12;
        else if (x > r.right - EDGE) sc.scrollLeft += 12;
      }
      const next = { ...d, x, y, over: targetAt(x, y, d.id) };
      dragRef.current = next;
      setDrag(next);
    };
    const finish = (x: number, y: number, cancelled: boolean) => {
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!d) return;
      suppressClick.current = true;
      window.setTimeout(() => { suppressClick.current = false; }, 0);
      const over = cancelled ? undefined : targetAt(x, y, d.id) ?? d.over;
      if (over) commit(d.id, over.column, over.index);
      else setAnnouncement('Move cancelled.');
    };
    const move = (ev: PointerEvent) => {
      if (!started) {
        const moved = Math.hypot(ev.clientX - x0, ev.clientY - y0);
        if (touch) { if (moved > 8) cleanup(); } // a swipe before the hold: let it scroll
        else if (moved > DRAG_THRESHOLD) begin(ev.clientX, ev.clientY);
        if (!started) return;
      }
      ev.preventDefault();
      update(ev.clientX, ev.clientY);
    };
    const up = (ev: PointerEvent) => { cleanup(); if (started) finish(ev.clientX, ev.clientY, ev.type === 'pointercancel'); };
    const key = (ev: globalThis.KeyboardEvent) => {
      if (ev.key !== 'Escape' || !started) return;
      ev.preventDefault();
      cleanup();
      dragRef.current = null;
      setDrag(null);
      setAnnouncement('Move cancelled.');
    };
    const touchMove = (ev: TouchEvent) => { if (started) ev.preventDefault(); };
    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('keydown', key);
      window.removeEventListener('touchmove', touchMove);
      cleanupRef.current = null;
    }
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('keydown', key);
    window.addEventListener('touchmove', touchMove, { passive: false });
    cleanupRef.current = cleanup;
  };

  /* ---------- render ---------- */

  const dragged = drag ? items.find((it) => getItemId(it) === drag.id) : undefined;

  return (
    <div className={s.root({ className })} {...props}>
      <div ref={scroller} role="region" aria-label={label} className={s.scroller()}>
        <div className={s.track()}>
          {columns.map((column) => {
            const list = columnItems(column.id);
            const over = drag?.over?.column === column.id;
            const visible = list.filter((it) => getItemId(it) !== drag?.id);
            return (
              <KanbanColumnView
                key={column.id}
                column={column}
                name={columnName(column.id)}
                count={list.length}
                width={columnWidth}
                over={over}
                actions={columnActions?.(column)}
                quickAdd={onQuickAdd ? { label: quickAddLabel, defaultOpen: defaultQuickAddColumnId === column.id, onAdd: (title) => onQuickAdd(column.id, title) } : undefined}
              >
                {list.length === 0 && !over && <li className={s.empty()}>{emptyColumnText}</li>}
                {list.map((item, i) => {
                  const id = getItemId(item);
                  const isDragged = drag?.id === id;
                  const dropHere = over && !isDragged && visible.indexOf(item) === drag?.over?.index;
                  const menuProps = {
                    item, columns, columnId: column.id, name: nameOf(item), index: i, count: list.length, columnName,
                    onMoveTo: (to: string) => commit(id, to, to === column.id ? i : columnItems(to).length),
                    onNudge: (dir: -1 | 1) => commit(id, column.id, i + dir),
                    extra: itemActions,
                  };
                  return (
                    <li
                      key={id}
                      data-kanban-item={id}
                      className={kanbanBoardVariants({ dragging: isDragged }).item()}
                      onPointerDown={(e) => onPointerDown(e, id, column.id)}
                      onClickCapture={(e) => { if (suppressClick.current) { e.preventDefault(); e.stopPropagation(); } }}
                      onDragStart={(e) => e.preventDefault()}
                    >
                      {dropHere && <span aria-hidden className={cn(s.drop(), '-top-[5px]')} />}
                      <ContextMenu.Root>
                        <ContextMenu.Trigger asChild>
                          <div>{renderCard(item, { dragging: isDragged, actions: onMove || itemActions ? <ItemMenu {...menuProps} /> : null })}</div>
                        </ContextMenu.Trigger>
                        {(onMove || itemActions) && (
                          <ContextMenu.Content width={220}>
                            <MoveItems parts={ContextMenu} {...menuProps} />
                          </ContextMenu.Content>
                        )}
                      </ContextMenu.Root>
                    </li>
                  );
                })}
                {over && drag?.over?.index === visible.length && (
                  <li aria-hidden className="relative h-0 list-none"><span className={cn(s.drop(), '-top-[5px]')} /></li>
                )}
              </KanbanColumnView>
            );
          })}
        </div>
      </div>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</div>
      {drag && dragged !== undefined && (
        // The Theme's portal layer: the copy keeps the board's tokens (light/dark) and escapes clipping.
        <ThemePortal>
          <div
            aria-hidden
            inert
            className={cn('motion-portal', s.ghost(), 'rounded-n-lg')}
            style={{ left: drag.x - drag.dx, top: drag.y - drag.dy, width: drag.w }}
          >
            {renderCard(dragged, { dragging: false, actions: null })}
          </div>
        </ThemePortal>
      )}
    </div>
  );
}

/* ---------- column ---------- */

function KanbanColumnView({ column, name, count, width, over, actions, quickAdd, children }: {
  column: KanbanColumn; name: string; count: number; width: number; over: boolean; actions?: ReactNode;
  quickAdd?: { label: string; defaultOpen: boolean; onAdd: (title: string) => void };
  children: ReactNode;
}) {
  const s = kanbanBoardVariants({ over });
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} data-kanban-column={column.id} className={s.column()} style={{ width }}>
      <h2 id={headingId} className={s.header()}>
        {typeof column.title === 'string' ? <StatusPill color={column.color ?? 'gray'}>{column.title}</StatusPill> : column.title}
        <Badge variant="soft" tone="neutral"><span aria-hidden>{count}</span><span className="sr-only">{`${count} ${count === 1 ? 'item' : 'items'}`}</span></Badge>
        {actions && <span className={s.actions()}>{actions}</span>}
      </h2>
      <ul aria-label={name} className={s.list()}>{children}</ul>
      {quickAdd && <QuickAdd column={name} {...quickAdd} />}
    </section>
  );
}

function QuickAdd({ column, label, defaultOpen, onAdd }: { column: string; label: string; defaultOpen: boolean; onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(defaultOpen);
  const [title, setTitle] = useState('');
  if (!open) {
    return (
      <Button icon="plus" full className="justify-start text-n-text-secondary" onClick={() => setOpen(true)} aria-label={`${label} to ${column}`}>
        {label}
      </Button>
    );
  }
  const close = () => { setTitle(''); setOpen(false); };
  const submit = () => {
    if (!title.trim()) { close(); return; }
    onAdd(title.trim());
    setTitle('');
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
  };
  return (
    <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <Field label={`New item in ${column}`} hideLabel>
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={onKeyDown} placeholder="Title, then Enter" autoFocus />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="primary">Add</Button>
        <Button size="sm" onClick={close}>Cancel</Button>
      </div>
    </form>
  );
}

/* ---------- keyboard path: the actions menu ---------- */

interface MoveMenuProps<Item> {
  item: Item;
  columns: KanbanColumn[];
  columnId: string;
  name: string;
  index: number;
  count: number;
  columnName: (id: string) => string;
  onMoveTo: (columnId: string) => void;
  onNudge: (direction: -1 | 1) => void;
  extra?: KanbanBoardProps<Item>['itemActions'];
}

function ItemMenu<Item>(props: MoveMenuProps<Item>) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton icon="ellipsisSmall" size="sm" label={`Actions for ${props.name}`} className="relative z-[1]" />
      </Menu.Trigger>
      <Menu.Content width={220} align="end">
        <MoveItems parts={Menu} {...props} />
      </Menu.Content>
    </Menu.Root>
  );
}

function MoveItems<Item>({ parts, item, columns, columnId, index, count, columnName, onMoveTo, onNudge, extra }: MoveMenuProps<Item> & { parts: typeof Menu | typeof ContextMenu }) {
  // Menu and ContextMenu expose the same parts; render through the dropdown types.
  const M = parts as typeof Menu;
  return (
    <>
      <M.Sub>
        <M.SubTrigger icon="arrowRight">Move to…</M.SubTrigger>
        <M.SubContent width={200}>
          {columns.map((c) => (
            <M.Item key={c.id} checked={c.id === columnId} disabled={c.id === columnId} onSelect={() => onMoveTo(c.id)}>
              {columnName(c.id)}
            </M.Item>
          ))}
        </M.SubContent>
      </M.Sub>
      <M.Item icon="arrowUp" disabled={index === 0} onSelect={() => onNudge(-1)}>Move up</M.Item>
      <M.Item icon="arrowDown" disabled={index === count - 1} onSelect={() => onNudge(1)}>Move down</M.Item>
      {extra && (
        <>
          <M.Separator />
          {extra(item, parts)}
        </>
      )}
    </>
  );
}
