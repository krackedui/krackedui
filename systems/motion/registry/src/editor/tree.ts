import { blockId, textBlockTypes, type Block } from '../blocks/types';

/** Immutable helpers over a `Block[]` tree. */

export interface Loc {
  /** Sibling array containing the block. */
  list: Block[];
  index: number;
  parent: Block | null;
}

export function findLoc(blocks: Block[], id: string, parent: Block | null = null): Loc | null {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].id === id) return { list: blocks, index: i, parent };
    const kids = blocks[i].children;
    if (kids) {
      const r = findLoc(kids, id, blocks[i]);
      if (r) return r;
    }
  }
  return null;
}

export function findBlock(blocks: Block[], id: string): Block | null {
  const l = findLoc(blocks, id);
  return l ? l.list[l.index] : null;
}

/** Deep clone (structuredClone is fine for plain JSON). */
export const clone = <T,>(v: T): T => structuredClone(v);

/** Apply `fn` to a mutable deep copy and return it. */
export function produce(blocks: Block[], fn: (draft: Block[]) => void): Block[] {
  const draft = clone(blocks);
  fn(draft);
  return draft;
}

/** Text-editable blocks in visual (depth-first) order, skipping collapsed toggle content. */
export function visibleLeaves(blocks: Block[]): Block[] {
  const out: Block[] = [];
  const walk = (bs: Block[]) => bs.forEach((b) => {
    if (textBlockTypes.includes(b.type)) out.push(b);
    const collapsed = (b.type === 'toggle' || b.props?.toggleable) && !b.props?.open;
    if (b.children && !collapsed) walk(b.children);
  });
  walk(blocks);
  return out;
}

/** All blocks in depth-first order. */
export function allBlocks(blocks: Block[]): Block[] {
  const out: Block[] = [];
  const walk = (bs: Block[]) => bs.forEach((b) => { out.push(b); if (b.children) walk(b.children); });
  walk(blocks);
  return out;
}

/** Duplicate a block (new ids throughout). */
export function withNewIds(b: Block): Block {
  return { ...clone(b), id: blockId(), children: b.children?.map(withNewIds) };
}

/** Remove a block from the draft; returns it. */
export function removeIn(draft: Block[], id: string): Block | null {
  const l = findLoc(draft, id);
  if (!l) return null;
  const [b] = l.list.splice(l.index, 1);
  if (l.parent && l.parent.children && l.parent.children.length === 0 && l.parent.type !== 'column') delete l.parent.children;
  return b;
}

/** Insert next to `targetId` (before/after) or as its first child ("inside"). */
export function insertIn(draft: Block[], targetId: string, block: Block, where: 'before' | 'after' | 'inside' = 'after') {
  const l = findLoc(draft, targetId);
  if (!l) { draft.push(block); return; }
  if (where === 'inside') {
    const t = l.list[l.index];
    t.children = [block, ...(t.children ?? [])];
    return;
  }
  l.list.splice(where === 'after' ? l.index + 1 : l.index, 0, block);
}

/** Tab: make the block the last child of its previous sibling. */
export function indentIn(draft: Block[], id: string): boolean {
  const l = findLoc(draft, id);
  if (!l || l.index === 0) return false;
  const prev = l.list[l.index - 1];
  if (['divider', 'image', 'bookmark', 'table', 'code', 'equation', 'table_of_contents', 'column_list'].includes(prev.type)) return false;
  const [b] = l.list.splice(l.index, 1);
  prev.children = [...(prev.children ?? []), b];
  if (prev.type === 'toggle' || prev.props?.toggleable) prev.props = { ...prev.props, open: true };
  return true;
}

/** Shift+Tab: move the block after its parent; following siblings become its children. */
export function outdentIn(draft: Block[], id: string): boolean {
  const l = findLoc(draft, id);
  if (!l || !l.parent || l.parent.type === 'column') return false;
  const parentLoc = findLoc(draft, l.parent.id);
  if (!parentLoc) return false;
  const [b] = l.list.splice(l.index, 1);
  const rest = l.list.splice(l.index);
  if (rest.length) b.children = [...(b.children ?? []), ...rest];
  if (l.parent.children && l.parent.children.length === 0) delete l.parent.children;
  parentLoc.list.splice(parentLoc.index + 1, 0, b);
  return true;
}
