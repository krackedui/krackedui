import { type CSSProperties, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { RichTextView } from './RichText';
import type { BlockColor, RichText as RichTextValue } from './types';
import { colorClass } from './colors';

/* Shared block parts (internal to blocks/ and editor/). */

/** Text leaf base (evidence: `content-editable-leaf`): full width, break-spaces, 2px vertical padding. */
export const leafBase = 'w-full max-w-full whitespace-break-spaces break-words caret-n-text-primary outline-none';

export interface LeafRenderProps {
  className: string;
  /** Placeholder for this block type ("List", "To-do", "Heading 1", "Empty quote", …). */
  placeholder: string;
  style?: CSSProperties;
}
/** Render prop used by the editor to swap the static leaf for a contenteditable one. */
export type LeafRenderer = (p: LeafRenderProps) => ReactNode;

export interface TextContentProps {
  /** Rich text shown by the default (static) leaf. */
  text?: RichTextValue;
  /** Replace the leaf (editor). */
  renderLeaf?: LeafRenderer;
}

/** Render the block's text leaf: the editor's renderer, or static rich text. */
export function renderLeaf({ text, renderLeaf }: TextContentProps, p: LeafRenderProps): ReactNode {
  if (renderLeaf) return renderLeaf(p);
  return (
    <div className={p.className} style={p.style}>
      <RichTextView value={text} />
    </div>
  );
}

/** Block-level color: text color on the content row, or a rounded background. */
export const blockColorClass = (color?: BlockColor) => colorClass(color);

/**
 * Vertical rhythm of list-like blocks (bulleted, numbered, to-do, toggle), measured in page-content:
 * 6px at the outer edges of a run, 1px between items, nested items 2px top / 0 bottom.
 */
export type ListSpacing = { top?: boolean; bottom?: boolean; nested?: boolean };
export function listPadding({ top, bottom, nested }: ListSpacing = {}): CSSProperties {
  if (nested) return { paddingTop: 2, paddingBottom: 0 };
  return { paddingTop: top === false ? 1 : 6, paddingBottom: bottom === false ? 1 : 6 };
}

/** Nested children container: indented 24px (list marker width) + 2px start pad. */
export function Nested({ children, className }: { children?: ReactNode; className?: string }) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null;
  return <div className={cn('flex flex-col', className)}>{children}</div>;
}

/* Checkbox and disclosure triangle come from the atoms group (Checkbox, DisclosureToggle). */
export { Checkbox as BlockCheckbox } from '../atoms/Checkbox';
export { DisclosureToggle as ToggleButton } from '../atoms/DisclosureToggle';

/** "Empty toggle. Click or drop blocks inside." row shown in an open, empty toggle. */
export function EmptyToggleHint({ onClick }: { onClick?: () => void }) {
  return (
    <div className="flex w-full px-1.5 py-[3px]" contentEditable={false}>
      <button type="button" tabIndex={-1} onClick={onClick} className="w-full cursor-pointer text-start rounded-n-sm px-0.5 py-0.5 text-n-text-tertiary hover:bg-n-bg-interactive-translucent-a">
        Empty toggle. Click or drop blocks inside.
      </button>
    </div>
  );
}
