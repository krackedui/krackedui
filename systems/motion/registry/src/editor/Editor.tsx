import {
  useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactElement,
} from 'react';
import { ThemePortal } from '../foundations/ThemePortal';
import { cn } from '../lib/cn';
import { IconButton } from '../atoms/IconButton';
import { DragHandle } from '../atoms/DragHandle';
import { BlockRenderer, type BlockRenderContext } from '../blocks/BlockRenderer';
import { PageTitle } from '../blocks/PageTitle';
import {
  applyMarks, deleteRange, hasMark, normalizeRichText, parseRichTextDom, richTextToHtml, splitRichText,
} from '../blocks/RichText';
import { listPadding } from '../blocks/parts';
import {
  blockId, blockTypeNames, isListLike, plainText, rt, type Block, type BlockColor, type BlockProps, type BlockType, type RichText, type TextMarks,
} from '../blocks/types';
import { getCaret, getSelectionOffsets, caretLine, selectionRect, setSelectionOffsets } from './caret';
import { newBlock, type BlockKind, type SlashItem } from './commands';
import { SlashMenu, slashItems } from './SlashMenu';
import { BlockActionMenu } from './BlockActionMenu';
import { TextToolbar, type ToolbarMark } from './TextToolbar';
import {
  allBlocks, findBlock, findLoc, indentIn, insertIn, outdentIn, produce, removeIn, visibleLeaves, withNewIds,
} from './tree';

/** Placeholder for a focused empty text block (mirror: block-hover / text-toolbar). */
export const EDITOR_PLACEHOLDER = 'Press ‘space’ for AI or ‘/’ for commands';
const TITLE_ID = '__title';
const VOID_TYPES: BlockType[] = ['divider', 'image', 'bookmark', 'table', 'equation', 'table_of_contents', 'column_list'];

export interface EditorProps {
  /** Controlled document. */
  value?: Block[];
  /** Uncontrolled initial document. */
  defaultValue?: Block[];
  onChange?: (blocks: Block[]) => void;
  /** Page title (shows the 40px title above the blocks when provided). */
  title?: RichText;
  onTitleChange?: (title: RichText) => void;
  /** Placeholder of the focused empty text block. */
  placeholder?: string;
  /** Footer of the block menu. */
  lastEditedBy?: string;
  className?: string;
  style?: CSSProperties;
}

type Focus = { id: string; start: number; end?: number } | { id: string; at: 'end' | 'start' };
interface SlashState { id: string; start: number; query: string; index: number; rect: DOMRect }
interface ToolbarState { id: string; start: number; end: number; rect: DOMRect }
type Drop = { id: string; where: 'before' | 'after' } | null;

/* ---------- handle vertical position: first text line of each block type (block-hover) ---------- */
const HEADING_PT: Record<string, number> = { heading_1: 30, heading_2: 26, heading_3: 22, heading_4: 18 };
const HEADING_LH: Record<string, number> = { heading_1: 39, heading_2: 31.2, heading_3: 26, heading_4: 23.4 };
function handleTop(b: Block, ctx: BlockRenderContext): number {
  if (b.type in HEADING_PT) return HEADING_PT[b.type] + 2 + (HEADING_LH[b.type] - 24) / 2;
  if (isListLike(b.type)) {
    const prev = ctx.siblings[ctx.index - 1];
    const next = ctx.siblings[ctx.index + 1];
    const sp = ctx.parent && isListLike(ctx.parent.type)
      ? { nested: true } : { top: !(prev && isListLike(prev.type)), bottom: !(next && isListLike(next.type)) };
    return Number(listPadding(sp).paddingTop) + 2;
  }
  switch (b.type) {
    case 'quote': return 8;
    case 'callout': return 29;
    case 'divider': return -5.5;
    case 'code': return 8;
    case 'table': return 16;
    case 'table_of_contents': return 11;
    case 'column_list': return 12;
    case 'image': case 'bookmark': case 'page': return 4;
    case 'equation': return 12;
    default: return 8;
  }
}

/* ---------- editable leaf ---------- */

interface LeafProps {
  id: string;
  text?: RichText;
  className: string;
  style?: CSSProperties;
  placeholder?: string;
  plain?: boolean;
  role?: string;
  /** Accessible name of the editable leaf (block type, "Page title"). */
  label: string;
  register: (id: string, el: HTMLElement | null, prev?: HTMLElement | null) => void;
  onInput: (id: string, el: HTMLElement) => void;
  onKeyDown: (id: string, e: ReactKeyboardEvent<HTMLElement>) => void;
  onFocus: (id: string) => void;
  onBlur: (id: string) => void;
}

function leafHtml(text: RichText | undefined, plain?: boolean): string {
  const html = plain ? richTextToHtml(text?.map((s) => ({ text: s.text }))) : richTextToHtml(text);
  return plainText(text).endsWith('\n') ? html + '\u200B' : html;
}

function EditableLeaf({ id, text, className, style, placeholder, plain, label, register, onInput, onKeyDown, onFocus, onBlur }: LeafProps) {
  const ref = useRef<HTMLDivElement>(null);
  const json = JSON.stringify(text ?? []);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.dataset.json !== json) {
      el.innerHTML = leafHtml(text, plain);
      el.dataset.json = json;
    }
  });
  useLayoutEffect(() => {
    // layout effect: children register before the editor's focus layout effect runs
    const el = ref.current;
    register(id, el);
    return () => register(id, null, el);
  }, [id, register]);
  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      aria-multiline="true"
      aria-label={label}
      spellCheck={!plain}
      data-leaf-id={id}
      data-placeholder={placeholder || undefined}
      className={cn(
        className,
        'cursor-text focus-visible:shadow-none empty:before:pointer-events-none empty:before:text-n-text-tertiary empty:before:content-[attr(data-placeholder)]',
      )}
      style={style}
      onInput={(e) => onInput(id, e.currentTarget)}
      onKeyDown={(e) => onKeyDown(id, e)}
      onFocus={() => onFocus(id)}
      onBlur={() => onBlur(id)}
      onPaste={(e) => {
        e.preventDefault();
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
      }}
    />
  );
}

/* ---------- table cell ---------- */
function CellEditor({ value, className, label, onCommit }: { value: RichText; className: string; label: string; onCommit: (v: RichText) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const json = JSON.stringify(value);
  useLayoutEffect(() => {
    if (ref.current && ref.current.dataset.json !== json && document.activeElement !== ref.current) {
      ref.current.innerHTML = richTextToHtml(value);
      ref.current.dataset.json = json;
    }
  });
  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      aria-label={label}
      className={cn(className, 'cursor-text focus-visible:shadow-none')}
      onBlur={(e) => {
        const v = parseRichTextDom(e.currentTarget);
        e.currentTarget.dataset.json = JSON.stringify(v);
        onCommit(v);
      }}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (e.currentTarget as HTMLElement).blur(); } }}
    />
  );
}

/* ---------- formatting helpers ---------- */
function formatTime(d: Date) {
  return `Today at ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

/**
 * Block editor. Edits a `Block[]` document with one contenteditable leaf per block:
 * Enter splits/creates, Backspace at start converts/outdents/merges, Tab / Shift+Tab nest,
 * markdown shortcuts (`# `, `## `, `### `, `- `, `* `, `1. `, `[] `, `> `, `" `, `---`, ```` ``` ````),
 * "/" slash menu, hover `+` and ⋮⋮ handle (click: block action menu, drag: reorder),
 * selection text toolbar (marks, colors, links, turn into), ⌘B/⌘I/⌘U/⌘E/⌘⇧S shortcuts, ⌘/ block menu.
 */
export function Editor({
  value, defaultValue, onChange, title, onTitleChange, placeholder = EDITOR_PLACEHOLDER, lastEditedBy = 'You', className, style,
}: EditorProps) {
  // SSR-safe: the auto-created first block gets a useId-based id (same on server and client)
  const firstId = 'b' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [doc, setDocState] = useState<Block[]>(() => value ?? defaultValue ?? [{ id: firstId, type: 'text', text: [] }]);
  const docRef = useRef(doc);
  docRef.current = doc;
  const lastEmitted = useRef<Block[] | null>(null);
  useEffect(() => {
    if (value && value !== lastEmitted.current) setDocState(value);
  }, [value]);
  const setDoc = useCallback((next: Block[]) => {
    docRef.current = next;
    lastEmitted.current = next;
    setDocState(next);
    onChange?.(next);
  }, [onChange]);
  const update = useCallback((fn: (draft: Block[]) => void) => setDoc(produce(docRef.current, fn)), [setDoc]);

  const [titleText, setTitleText] = useState<RichText | undefined>(title);
  useEffect(() => setTitleText(title), [title]);

  const leaves = useRef(new Map<string, HTMLElement>());
  const register = useCallback((id: string, el: HTMLElement | null, prev?: HTMLElement | null) => {
    if (el) leaves.current.set(id, el);
    else if (!prev || leaves.current.get(id) === prev) leaves.current.delete(id);
  }, []);
  const pendingFocus = useRef<Focus | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [slash, setSlash] = useState<SlashState | null>(null);
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null);
  const [drop, setDrop] = useState<Drop>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [editingEq, setEditingEq] = useState<string | null>(null);
  const [recentColors, setRecentColors] = useState<BlockColor[]>([]);
  const [lastColor, setLastColor] = useState<BlockColor | undefined>();
  const [editedAt, setEditedAt] = useState(() => new Date());
  const rootRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const slashRef = useRef(slash);
  slashRef.current = slash;

  const [, setTick] = useState(0);
  const force = () => setTick((t) => t + 1);
  const focus = (f: Focus) => { pendingFocus.current = f; };
  useLayoutEffect(() => {
    const f = pendingFocus.current;
    if (!f) return;
    const el = leaves.current.get(f.id);
    if (!el) return;
    pendingFocus.current = null;
    el.focus();
    const len = (el.textContent ?? '').replace(/\u200B/g, '').length;
    if ('at' in f) setSelectionOffsets(el, f.at === 'end' ? len : 0);
    else setSelectionOffsets(el, Math.min(f.start, len), Math.min(f.end ?? f.start, len));
  });

  const touch = () => setEditedAt(new Date());

  /* ---------- block mutations ---------- */
  const setText = (id: string, text: RichText) => {
    if (id === TITLE_ID) { setTitleText(text); onTitleChange?.(text); return; }
    update((d) => { const b = findBlock(d, id); if (b) b.text = text; });
  };
  const patchProps = (id: string, p: Partial<BlockProps>) => update((d) => { const b = findBlock(d, id); if (b) b.props = { ...b.props, ...p }; });

  const convert = useCallback((id: string, kind: BlockKind, focusAfter = true) => {
    let focusId = id;
    update((d) => {
      const loc = findLoc(d, id);
      if (!loc) return;
      const b = loc.list[loc.index];
      if (kind.type === 'column_list') {
        const cols = newBlock(kind);
        cols.children![0].children = [b];
        loc.list[loc.index] = cols;
        return;
      }
      if (VOID_TYPES.includes(kind.type)) {
        const nb = newBlock(kind);
        loc.list[loc.index] = nb;
        if (!plainText(b.text) && !b.children?.length) {
          const after: Block = { id: blockId(), type: 'text', text: [] };
          loc.list.splice(loc.index + 1, 0, after);
          focusId = after.id;
        } else {
          loc.list.splice(loc.index + 1, 0, { ...b, type: 'text' });
        }
        return;
      }
      const keep = kind.type === 'code' ? b.text?.map((s) => ({ text: s.text })) : b.text;
      b.type = kind.type;
      b.text = keep ?? [];
      b.props = { ...(kind.props ?? {}) , ...(kind.type === 'to_do' ? { checked: false } : {}) };
      if (kind.type === 'callout') b.color = b.color ?? undefined;
    });
    if (focusAfter) focus({ id: focusId, at: 'end' });
    touch();
  }, [update]);

  /* ---------- leaf events ---------- */
  const onFocusLeaf = useCallback((id: string) => setFocusedId(id), []);
  const onBlurLeaf = useCallback((id: string) => {
    setFocusedId((f) => (f === id ? null : f));
    setTimeout(() => {
      if (slashRef.current?.id === id && !leaves.current.get(id)?.contains(document.activeElement)) setSlash(null);
    }, 0);
  }, []);

  const handleInput = (id: string, el: HTMLElement) => {
    const block = id === TITLE_ID ? null : findBlock(docRef.current, id);
    const plain = block?.type === 'code';
    let parsed = parseRichTextDom(el);
    if (plain) parsed = normalizeRichText(parsed.map((s) => ({ text: s.text })));
    if (!parsed.length && el.innerHTML !== '') el.innerHTML = '';
    el.dataset.json = JSON.stringify(parsed);
    const caret = getCaret(el);
    const s = plainText(parsed);
    touch();

    // markdown shortcuts at the start of a text block
    if (block && block.type === 'text') {
      const rules: [RegExp, BlockKind][] = [
        [/^#### $/, { type: 'heading_4' }], [/^### $/, { type: 'heading_3' }], [/^## $/, { type: 'heading_2' }], [/^# $/, { type: 'heading_1' }],
        [/^[-*+] $/, { type: 'bulleted_list' }], [/^\d+\. $/, { type: 'numbered_list' }], [/^\[ ?\] $/, { type: 'to_do' }],
        [/^\[x\] $/, { type: 'to_do', props: { checked: true } }], [/^> $/, { type: 'toggle', props: { open: true } }],
        [/^" $/, { type: 'quote' }], [/^```$/, { type: 'code', props: { language: 'JavaScript' } }],
      ];
      const head = s.slice(0, caret);
      for (const [re, kind] of rules) {
        const m = re.exec(head);
        if (m) {
          const rest = deleteRange(parsed, 0, m[0].length);
          update((d) => {
            const b = findBlock(d, id);
            if (!b) return;
            b.type = kind.type; b.text = kind.type === 'code' ? rest.map((x) => ({ text: x.text })) : rest; b.props = kind.props ? { ...kind.props } : undefined;
          });
          focus({ id, start: 0 });
          return;
        }
      }
      if (s === '---' && caret === 3) {
        const next: Block = { id: blockId(), type: 'text', text: [] };
        update((d) => {
          const loc = findLoc(d, id);
          if (!loc) return;
          loc.list[loc.index] = { id, type: 'divider' };
          loc.list.splice(loc.index + 1, 0, next);
        });
        focus({ id: next.id, start: 0 });
        return;
      }
    }

    setText(id, parsed);

    // slash menu
    if (id !== TITLE_ID && !plain) {
      const cur = slashRef.current;
      if (cur && cur.id === id) {
        if (caret <= cur.start || s[cur.start] !== '/' || /\s\s$/.test(s.slice(cur.start + 1, caret))) setSlash(null);
        else {
          const query = s.slice(cur.start + 1, caret);
          setSlash({ ...cur, query, index: 0 });
        }
      } else if (s[caret - 1] === '/' && (caret === 1 || /\s/.test(s[caret - 2]))) {
        const rect = selectionRect() ?? el.getBoundingClientRect();
        setSlash({ id, start: caret - 1, query: '', index: 0, rect });
      }
    }
  };

  const runSlash = (item: SlashItem) => {
    const st = slashRef.current;
    if (!st) return;
    setSlash(null);
    const block = findBlock(docRef.current, st.id);
    if (!block) return;
    const el = leaves.current.get(st.id);
    const caret = el ? getCaret(el) : st.start + 1 + st.query.length;
    const text = deleteRange(block.text ?? [], st.start, Math.max(caret, st.start + 1));
    if (!item.kind) {
      setText(st.id, text);
      focus({ id: st.id, start: st.start });
      return;
    }
    const kind = item.kind;
    if (!plainText(text).trim()) {
      setText(st.id, []);
      convert(st.id, kind);
      if (kind.type === 'column_list') focus({ id: st.id, at: 'end' });
    } else {
      const nb = newBlock(kind);
      update((d) => {
        const b = findBlock(d, st.id);
        if (b) b.text = text;
        insertIn(d, st.id, nb, 'after');
      });
      const target = nb.type === 'column_list' ? nb.children![0].children![0].id : nb.id;
      focus({ id: target, at: 'end' });
    }
  };

  /* ---------- keyboard ---------- */
  const leafOrder = () => visibleLeaves(docRef.current).map((b) => b.id);

  const moveFocus = (id: string, dir: -1 | 1, at: 'start' | 'end') => {
    const order = leafOrder();
    if (titleText !== undefined) order.unshift(TITLE_ID);
    const i = order.indexOf(id);
    const t = order[i + dir];
    if (t) { focus({ id: t, at }); force(); return true; }
    return false;
  };

  const applyMark = (id: string, start: number, end: number, patch: Partial<TextMarks> | 'clear', toggleKey?: keyof TextMarks) => {
    const b = id === TITLE_ID ? null : findBlock(docRef.current, id);
    if (!b || start === end) return;
    let next: RichText;
    if (patch === 'clear') {
      next = applyMarks(b.text ?? [], start, end, { bold: undefined, italic: undefined, underline: undefined, strike: undefined, code: undefined, equation: undefined, link: undefined, color: undefined });
    } else if (toggleKey) {
      const on = hasMark(b.text ?? [], start, end, toggleKey);
      next = applyMarks(b.text ?? [], start, end, { [toggleKey]: on ? undefined : true });
    } else next = applyMarks(b.text ?? [], start, end, patch);
    setText(id, next);
    focus({ id, start, end });
    touch();
  };

  const handleKeyDown = (id: string, e: ReactKeyboardEvent<HTMLElement>) => {
    const el = e.currentTarget;
    if (e.nativeEvent.isComposing) return;
    // ⌘/ (Ctrl+/) opens the block action menu for keyboard users (the ⋮⋮ handle is hover-only).
    if (e.key === '/' && (e.metaKey || e.ctrlKey) && id !== TITLE_ID) {
      e.preventDefault();
      setHoverId(id);
      setMenuId(id);
      return;
    }
    const st = slashRef.current;
    if (st && st.id === id) {
      const items = slashItems(st.query);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const n = Math.max(1, items.length);
        setSlash({ ...st, index: (st.index + (e.key === 'ArrowDown' ? 1 : -1) + n) % n });
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (items[st.index]) runSlash(items[st.index]); else setSlash(null);
        return;
      }
      if (e.key === 'Escape') { e.preventDefault(); setSlash(null); return; }
    }

    const mod = e.metaKey || e.ctrlKey;
    const sel = getSelectionOffsets(el) ?? [0, 0];
    const [start, end] = sel;

    if (id === TITLE_ID) {
      if (e.key === 'Enter' || (e.key === 'ArrowDown' && caretLine(el).last)) {
        e.preventDefault();
        const first = visibleLeaves(docRef.current)[0];
        if (first) focus({ id: first.id, start: 0 });
        else { const nb: Block = { id: blockId(), type: 'text', text: [] }; setDoc([nb, ...docRef.current]); focus({ id: nb.id, start: 0 }); }
        force();
      }
      return;
    }

    const block = findBlock(docRef.current, id);
    if (!block) return;
    const text = block.text ?? [];
    const len = plainText(text).length;

    if (mod) {
      const k = e.key.toLowerCase();
      const map: Record<string, keyof TextMarks> = { b: 'bold', i: 'italic', u: 'underline', e: 'code' };
      if (map[k] && !e.shiftKey) { e.preventDefault(); applyMark(id, start, end, {}, map[k]); return; }
      if (e.shiftKey && (k === 's' || k === 'x')) { e.preventDefault(); applyMark(id, start, end, {}, 'strike'); return; }
      if (k === 'd' && !e.shiftKey) { e.preventDefault(); duplicate(id); return; }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (block.type === 'code' || e.shiftKey) {
        const [a, b] = splitRichText(deleteRange(text, start, end), start);
        setText(id, normalizeRichText([...a, { text: '\n' }, ...b]));
        focus({ id, start: start + 1 });
        return;
      }
      // empty list item: outdent (nested) or turn into text
      if (isListLike(block.type) && len === 0) {
        const loc = findLoc(docRef.current, id);
        if (loc?.parent && isListLike(loc.parent.type)) { update((d) => outdentIn(d, id)); focus({ id, start: 0 }); }
        else convert(id, { type: 'text' });
        return;
      }
      const [a, b] = splitRichText(deleteRange(text, start, end), start);
      const sameType = isListLike(block.type) ? block.type : 'text';
      const nb: Block = {
        id: blockId(), type: sameType, text: b,
        props: block.type === 'to_do' ? { checked: false } : block.type === 'toggle' ? { open: false } : undefined,
      };
      update((d) => {
        const cur = findBlock(d, id);
        if (!cur) return;
        if (start === 0 && len > 0) {
          // Enter at the very start: push the content down, keep an empty block above
          insertIn(d, id, { id: nb.id, type: sameType, text: [], props: nb.props }, 'before');
          return;
        }
        cur.text = a;
        const open = (cur.type === 'toggle' || cur.props?.toggleable) && cur.props?.open;
        if (open && cur.children?.length) insertIn(d, id, nb, 'inside');
        else insertIn(d, id, nb, 'after');
      });
      if (start === 0 && len > 0) focus({ id, start: 0 }); else focus({ id: nb.id, start: 0 });
      touch();
      return;
    }

    if (e.key === 'Backspace' && start === 0 && end === 0) {
      e.preventDefault();
      if (block.type !== 'text' && block.type !== 'page') { convert(id, { type: 'text' }); focus({ id, start: 0 }); return; }
      const loc = findLoc(docRef.current, id);
      if (loc?.parent && loc.parent.type !== 'column') { update((d) => outdentIn(d, id)); focus({ id, start: 0 }); return; }
      // previous sibling is a void block → remove it
      if (loc && loc.index > 0 && VOID_TYPES.includes(loc.list[loc.index - 1].type)) {
        const voidId = loc.list[loc.index - 1].id;
        update((d) => { removeIn(d, voidId); });
        focus({ id, start: 0 });
        return;
      }
      const order = leafOrder();
      const prevId = order[order.indexOf(id) - 1];
      if (!prevId) return;
      const prev = findBlock(docRef.current, prevId)!;
      const prevLen = plainText(prev.text).length;
      update((d) => {
        const p = findBlock(d, prevId)!;
        const loc2 = findLoc(d, id)!;
        const cur = loc2.list[loc2.index];
        p.text = normalizeRichText([...(p.text ?? []), ...(p.type === 'code' ? (cur.text ?? []).map((s) => ({ text: s.text })) : cur.text ?? [])]);
        loc2.list.splice(loc2.index, 1, ...(cur.children ?? []));
      });
      focus({ id: prevId, start: prevLen });
      touch();
      return;
    }

    if (e.key === 'Delete' && start === len && end === len) {
      const order = leafOrder();
      const nextId = order[order.indexOf(id) + 1];
      if (!nextId) return;
      e.preventDefault();
      update((d) => {
        const cur = findBlock(d, id)!;
        const loc2 = findLoc(d, nextId)!;
        const nx = loc2.list[loc2.index];
        cur.text = normalizeRichText([...(cur.text ?? []), ...(nx.text ?? [])]);
        loc2.list.splice(loc2.index, 1, ...(nx.children ?? []));
      });
      focus({ id, start: len });
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      update((d) => { if (e.shiftKey) outdentIn(d, id); else indentIn(d, id); });
      focus({ id, start, end });
      return;
    }

    if (mod || e.altKey) return;
    if (e.key === 'ArrowUp' && !e.shiftKey && caretLine(el).first) { if (moveFocus(id, -1, 'end')) e.preventDefault(); return; }
    if (e.key === 'ArrowDown' && !e.shiftKey && caretLine(el).last) { if (moveFocus(id, 1, 'start')) e.preventDefault(); return; }
    if (e.key === 'ArrowLeft' && !e.shiftKey && start === 0 && end === 0) { if (moveFocus(id, -1, 'end')) e.preventDefault(); return; }
    if (e.key === 'ArrowRight' && !e.shiftKey && start === len && end === len) { if (moveFocus(id, 1, 'start')) e.preventDefault(); }
  };

  /* ---------- block actions ---------- */
  const duplicate = (id: string) => {
    const b = findBlock(docRef.current, id);
    if (!b) return;
    const copy = withNewIds(b);
    update((d) => insertIn(d, id, copy, 'after'));
    focus({ id: copy.id, at: 'end' });
  };
  const remove = (id: string) => {
    const order = leafOrder();
    const prev = order[order.indexOf(id) - 1];
    update((d) => {
      removeIn(d, id);
      if (d.length === 0) d.push({ id: blockId(), type: 'text', text: [] });
    });
    if (prev) focus({ id: prev, at: 'end' });
  };
  const addBelow = (id: string, above = false) => {
    const nb: Block = { id: blockId(), type: 'text', text: rt('/') };
    update((d) => insertIn(d, id, nb, above ? 'before' : 'after'));
    focus({ id: nb.id, start: 1 });
    requestAnimationFrame(() => {
      const el = leaves.current.get(nb.id);
      const rect = el ? (selectionRect() ?? el.getBoundingClientRect()) : null;
      if (rect) setSlash({ id: nb.id, start: 0, query: '', index: 0, rect });
    });
  };
  const setColor = (id: string, color: BlockColor) => {
    update((d) => { const b = findBlock(d, id); if (b) b.color = color === 'default' ? undefined : color; });
    if (color !== 'default') setLastColor(color);
  };

  /* ---------- hover + drag ---------- */
  const onMouseMove = (e: ReactMouseEvent) => {
    if (dragId || menuId) return;
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-editor-block]');
    const id = t?.dataset.editorBlock ?? null;
    if (id !== hoverId) setHoverId(id);
  };

  const startDrag = (id: string, e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const sx = e.clientX; const sy = e.clientY;
    let dragging = false;
    let target: Drop = null;
    const move = (ev: PointerEvent) => {
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 4) { dragging = true; setDragId(id); }
      if (!dragging) return;
      const els = document.elementsFromPoint(rootRef.current!.getBoundingClientRect().left + 60, ev.clientY);
      const over = els.map((x) => x.closest<HTMLElement>('[data-editor-block]'))
        .find((x) => x && x.dataset.editorBlock !== id && !x.closest(`[data-editor-block="${id}"]`));
      if (over) {
        const r = over.getBoundingClientRect();
        target = { id: over.dataset.editorBlock!, where: ev.clientY < r.top + r.height / 2 ? 'before' : 'after' };
        setDrop(target);
      }
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      if (dragging) {
        const t = target;
        if (t) update((d) => { const b = removeIn(d, id); if (b) insertIn(d, t.id, b, t.where); });
        setDragId(null);
        setDrop(null);
      } else {
        setMenuId((m) => (m === id ? null : id));
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  /* ---------- selection toolbar ---------- */
  useEffect(() => {
    const onSel = () => {
      if (toolbarRef.current?.contains(document.activeElement)) return;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) { setToolbar(null); return; }
      const leaf = (sel.anchorNode instanceof HTMLElement ? sel.anchorNode : sel.anchorNode?.parentElement)?.closest<HTMLElement>('[data-leaf-id]');
      if (!leaf || !rootRef.current?.contains(leaf) || !leaf.contains(sel.focusNode)) { setToolbar(null); return; }
      const id = leaf.dataset.leafId!;
      if (id === TITLE_ID) { setToolbar(null); return; }
      const b = findBlock(docRef.current, id);
      if (!b || b.type === 'code') { setToolbar(null); return; }
      const offs = getSelectionOffsets(leaf);
      const rect = selectionRect();
      if (!offs || !rect || offs[0] === offs[1]) { setToolbar(null); return; }
      setToolbar({ id, start: Math.min(...offs), end: Math.max(...offs), rect });
    };
    document.addEventListener('selectionchange', onSel);
    return () => document.removeEventListener('selectionchange', onSel);
  }, []);

  const toolbarBlock = toolbar ? findBlock(doc, toolbar.id) : null;
  const toolbarActive = useMemo(() => {
    if (!toolbar || !toolbarBlock) return {};
    const t = toolbarBlock.text ?? [];
    const k = (m: keyof TextMarks) => hasMark(t, toolbar.start, toolbar.end, m);
    return { bold: k('bold'), italic: k('italic'), underline: k('underline'), strike: k('strike'), code: k('code'), equation: k('equation'), link: k('link') };
  }, [toolbar, toolbarBlock]);

  /* ---------- render ---------- */
  const renderLeaf = (b: Block, p: { className: string; placeholder: string; style?: CSSProperties }) => {
    const ph = b.type === 'text'
      ? (focusedId === b.id && !slash ? placeholder : '')
      : b.type === 'code' ? '' : p.placeholder;
    return (
      <EditableLeaf
        id={b.id}
        text={b.text}
        className={p.className}
        style={p.style}
        placeholder={ph}
        plain={b.type === 'code'}
        label={blockTypeNames[b.type]}
        register={register}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocusLeaf}
        onBlur={onBlurLeaf}
      />
    );
  };

  const wrapBlock = (b: Block, node: ReactElement, ctx: BlockRenderContext) => {
    const showHandle = (hoverId === b.id || menuId === b.id) && !dragId;
    const top = handleTop(b, ctx);
    return (
      <div key={b.id} data-editor-block={b.id} className={cn('relative w-full', dragId === b.id && 'opacity-40')}>
        {drop?.id === b.id && (
          // drop indicator: 4px accent bar at 45% opacity
          <div className={cn('pointer-events-none absolute inset-x-0 z-[3] h-1 bg-n-blue-icon-accent-primary/45', drop.where === 'before' ? '-top-0.5' : '-bottom-0.5')} />
        )}
        {showHandle && (
          <div className="absolute z-[2] flex items-center" style={{ left: -52, top }} contentEditable={false}>
            <IconButton
              icon="plus"
              size="sm"
              iconSize={20}
              tone="tertiary"
              label="Click to add below. Option-click to add a block above"
              className="rounded-n-sm"
              onClick={(e) => addBelow(b.id, e.altKey)}
            />
            <BlockActionMenu
              block={b}
              open={menuId === b.id}
              onOpenChange={(o) => { if (!o) { setMenuId(null); setHoverId(null); } }}
              lastEditedBy={lastEditedBy}
              lastEditedAt={formatTime(editedAt)}
              lastUsedColor={lastColor}
              onTurnInto={(k) => { setMenuId(null); convert(b.id, k); }}
              onColor={(c) => setColor(b.id, c)}
              onCopyLink={() => navigator.clipboard?.writeText(`${location.href.split('#')[0]}#${b.id}`).catch(() => {})}
              onDuplicate={() => duplicate(b.id)}
              onDelete={() => remove(b.id)}
            >
              <DragHandle
                onPointerDown={(e) => startDrag(b.id, e)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMenuId(b.id); } }}
              />
            </BlockActionMenu>
          </div>
        )}
        {menuId === b.id && (
          // selection halo: accent at 14%, inset 1 2 2, radius 4
          <div className="pointer-events-none absolute inset-[1px_2px_2px] z-[1] rounded-n-sm bg-n-blue-icon-accent-primary/15" />
        )}
        {node}
      </div>
    );
  };

  const slashPos = slash ? (() => {
    const below = slash.rect.bottom + 6;
    const h = 420;
    const top = below + h > window.innerHeight && slash.rect.top - h - 6 > 0 ? slash.rect.top - h - 6 : below;
    // keep the 324px menu inside the viewport (phones)
    return { top, left: Math.max(8, Math.min(slash.rect.left - 2, window.innerWidth - 324 - 8)) };
  })() : null;

  const toolbarPos = toolbar ? (() => {
    const h = 340;
    const above = toolbar.rect.top - h - 4;
    return { top: above > 8 ? above : toolbar.rect.bottom + 4, left: Math.max(8, Math.min(toolbar.rect.left - 16, window.innerWidth - 270 - 8)) };
  })() : null;

  const tb = toolbar;
  return (
    <div
      ref={rootRef}
      className={cn('relative w-full text-[16px] leading-[1.5] text-n-text-primary', className)}
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={() => !menuId && setHoverId(null)}
    >
      {titleText !== undefined && (
        <PageTitle
          renderLeaf={(p) => (
            <EditableLeaf
              id={TITLE_ID}
              text={titleText}
              className={cn(p.className, 'empty:before:!text-n-page-title-placeholder-text-color')}
              placeholder={p.placeholder}
              label="Page title"
              register={register}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={onFocusLeaf}
              onBlur={onBlurLeaf}
            />
          )}
        />
      )}
      <div className={cn(titleText !== undefined && 'pt-2')}>
        <BlockRenderer
          blocks={doc}
          renderLeaf={renderLeaf}
          wrapBlock={wrapBlock}
          onBlockChange={(id, p) => { patchProps(id, p); touch(); }}
          onEmptyToggleClick={(b) => {
            const nb: Block = { id: blockId(), type: 'text', text: [] };
            update((d) => { const t = findBlock(d, b.id); if (t) t.children = [nb]; });
            focus({ id: nb.id, start: 0 });
          }}
          renderCell={(b, r, c, cls) => (
            <CellEditor
              value={b.props?.rows?.[r]?.[c] ?? []}
              className={cls}
              label={`Row ${r + 1}, column ${c + 1}`}
              onCommit={(v) => update((d) => {
                const t = findBlock(d, b.id);
                if (t?.props?.rows?.[r]) t.props.rows[r][c] = v;
              })}
            />
          )}
          onEquationEdit={(b) => setEditingEq(b.id)}
          renderEquationEditor={(b) => editingEq === b.id ? (
            <input
              autoFocus
              defaultValue={b.props?.expression ?? ''}
              placeholder="E = mc^2"
              aria-label="TeX expression"
              className="mx-2 mt-1 block h-8 w-[calc(100%-16px)] rounded-n-md bg-n-bg-interactive-translucent-a px-2 font-mono text-[13.6px] text-n-text-primary shadow-[inset_0_0_0_1px_var(--n-border-primary-translucent-a)] outline-none focus:shadow-n-input-blue-focus-ring"
              onChange={(e) => patchProps(b.id, { expression: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); setEditingEq(null); } }}
              onBlur={() => setEditingEq(null)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : null}
        />
        {/* Click below the last block: focus or create a trailing text block. Pointer-only shortcut (keyboard: Enter at
            the end of the last block), so it is hidden from assistive tech. */}
        <div
          aria-hidden
          className="h-24 w-full cursor-text"
          onClick={() => {
            const last = doc[doc.length - 1];
            if (last && last.type === 'text' && !plainText(last.text)) focus({ id: last.id, start: 0 });
            else { const nb: Block = { id: blockId(), type: 'text', text: [] }; setDoc([...docRef.current, nb]); focus({ id: nb.id, start: 0 }); }
            force();
          }}
        />
      </div>

      {slash && slashPos && (
        <ThemePortal>
          <div className="motion-portal motion-floating fixed z-50 font-sans" data-state="open" data-side="bottom" style={slashPos}>
            <SlashMenu
              query={slash.query}
              activeIndex={slash.index}
              onActiveIndexChange={(i) => setSlash((s) => (s ? { ...s, index: i } : s))}
              onSelect={runSlash}
              onClose={() => setSlash(null)}
            />
          </div>
        </ThemePortal>
      )}

      {tb && toolbarPos && toolbarBlock && (
        <ThemePortal>
          <div className="motion-portal motion-floating fixed z-50 font-sans" data-state="open" data-side="top" style={toolbarPos}>
            <TextToolbar
              ref={toolbarRef}
              block={toolbarBlock}
              active={toolbarActive}
              recentColors={recentColors}
              onMark={(m: ToolbarMark) => applyMark(tb.id, tb.start, tb.end, {}, m)}
              onClearFormat={() => applyMark(tb.id, tb.start, tb.end, 'clear')}
              onLink={(url) => applyMark(tb.id, tb.start, tb.end, { link: url ?? undefined })}
              onColor={(c) => {
                applyMark(tb.id, tb.start, tb.end, { color: c === 'default' ? undefined : c });
                if (c !== 'default') setRecentColors((r) => [c, ...r.filter((x) => x !== c)].slice(0, 5));
              }}
              onTurnInto={(k) => { setToolbar(null); convert(tb.id, k); }}
            />
          </div>
        </ThemePortal>
      )}
    </div>
  );
}

/** All block ids of a document (handy for tests / docs). */
export const blockIds = (blocks: Block[]) => allBlocks(blocks).map((b) => b.id);
