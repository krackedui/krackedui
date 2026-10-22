/** Character-offset caret helpers for contenteditable leaves. */

function textLength(node: Node): number {
  return (node.textContent ?? '').replace(/\u200B/g, '').length;
}

/** Offset of (node, offset) inside root, counted in characters. */
export function offsetOf(root: HTMLElement, node: Node, offset: number): number {
  const r = document.createRange();
  r.selectNodeContents(root);
  try { r.setEnd(node, offset); } catch { return 0; }
  return r.toString().replace(/\u200B/g, '').length;
}

/** [start, end] of the current selection inside root, or null when it isn't inside. */
export function getSelectionOffsets(root: HTMLElement): [number, number] | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  return [offsetOf(root, range.startContainer, range.startOffset), offsetOf(root, range.endContainer, range.endOffset)];
}

export function getCaret(root: HTMLElement): number {
  return getSelectionOffsets(root)?.[1] ?? 0;
}

function pointAt(root: HTMLElement, offset: number): [Node, number] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let pos = 0;
  let last: Text | null = null;
  for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
    // skip text inside non-editable tokens (mentions) by jumping over them
    const ce = n.parentElement?.closest('[contenteditable="false"]');
    const len = textLength(n);
    if (ce && root.contains(ce) && ce !== root) {
      if (pos + len >= offset && offset > pos) {
        const parent = ce.parentNode!;
        const idx = Array.prototype.indexOf.call(parent.childNodes, ce) + 1;
        return [parent, idx];
      }
      pos += len;
      continue;
    }
    if (pos + len >= offset) return [n, Math.max(0, offset - pos)];
    pos += len;
    last = n;
  }
  if (last) return [last, textLength(last)];
  return [root, root.childNodes.length];
}

/** Place the caret (or a selection) at character offsets. */
export function setSelectionOffsets(root: HTMLElement, start: number, end = start) {
  const sel = window.getSelection();
  if (!sel) return;
  const r = document.createRange();
  const [sn, so] = pointAt(root, start);
  const [en, eo] = pointAt(root, end);
  r.setStart(sn, so);
  r.setEnd(en, eo);
  sel.removeAllRanges();
  sel.addRange(r);
}

/** Is the caret on the first / last visual line of root? */
export function caretLine(root: HTMLElement): { first: boolean; last: boolean } {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return { first: true, last: true };
  const r = sel.getRangeAt(0).cloneRange();
  r.collapse(true);
  const rect = r.getClientRects().item(0);
  const box = root.getBoundingClientRect();
  if (!rect) {
    // empty line: fall back to the root box
    return { first: true, last: true };
  }
  const lh = parseFloat(getComputedStyle(root).lineHeight) || 24;
  return { first: rect.top - box.top < lh * 0.8, last: box.bottom - rect.bottom < lh * 0.8 };
}

/** Bounding rect of the current selection (or caret). */
export function selectionRect(): DOMRect | null {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  const r = sel.getRangeAt(0);
  const rect = r.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    const rects = r.getClientRects();
    if (rects.length) return rects[0];
    const el = (r.startContainer instanceof HTMLElement ? r.startContainer : r.startContainer.parentElement);
    return el?.getBoundingClientRect() ?? null;
  }
  return rect;
}
