/**
 * Block document model. A page is a `Block[]` tree: every block has an `id`, a `type`,
 * optional rich `text`, optional nested `children`, an optional `color`, and type-specific `props`.
 */

export type ColorName = 'gray' | 'brown' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'red';
/** Block/text color: `default`, a text color (`blue`) or a background color (`blue_background`). */
export type BlockColor = 'default' | ColorName | `${ColorName}_background`;
export const colorNames: ColorName[] = ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'];

/** Inline formatting of one run of text. */
export interface TextMarks {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  /** Inline code: red mono on a translucent chip. */
  code?: boolean;
  /** Inline equation (rendered as TeX-ish serif italic). */
  equation?: boolean;
  link?: string;
  color?: BlockColor;
}

/** Inline mention (rendered as a non-editable token). */
export interface Mention {
  kind: 'page' | 'user' | 'date';
  /** Display label: page title, person name or formatted date. */
  label: string;
  /** Emoji for page mentions (falls back to the page icon). */
  icon?: string;
}

export interface TextSpan {
  text: string;
  marks?: TextMarks;
  mention?: Mention;
}
/** Rich text: a list of runs. Plain text is `[{ text: 'hello' }]`. */
export type RichText = TextSpan[];

export type BlockType =
  | 'text'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'heading_4'
  | 'bulleted_list'
  | 'numbered_list'
  | 'to_do'
  | 'toggle'
  | 'quote'
  | 'callout'
  | 'divider'
  | 'code'
  | 'equation'
  | 'image'
  | 'bookmark'
  | 'table'
  | 'column_list'
  | 'column'
  | 'table_of_contents'
  | 'page';

/**
 * Type-specific fields (all optional; which ones apply depends on `type`):
 * - heading_*: `toggleable`, `open`        - toggle: `open`          - to_do: `checked`
 * - callout: `icon` (emoji)                 - code: `language` (text holds the code)
 * - equation: `expression` (TeX)            - image: `src`, `caption`, `width`
 * - bookmark: `url`, `title`, `description`, `thumbnail`, `favicon`
 * - table: `rows` (RichText cells), `hasHeaderRow`, `hasHeaderColumn`, `columnWidths`
 * - column: `ratio` (0..1 width share)     - page: `icon` (emoji); title is `text`
 */
export interface BlockProps {
  toggleable?: boolean;
  open?: boolean;
  checked?: boolean;
  icon?: string;
  language?: string;
  expression?: string;
  src?: string;
  caption?: RichText;
  width?: number;
  url?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  favicon?: string;
  rows?: RichText[][];
  hasHeaderRow?: boolean;
  hasHeaderColumn?: boolean;
  columnWidths?: number[];
  ratio?: number;
}

export interface Block {
  id: string;
  type: BlockType;
  text?: RichText;
  children?: Block[];
  color?: BlockColor;
  props?: BlockProps;
}

/* ---------- helpers ---------- */

let seq = 0;
/** Short unique id for new blocks. */
export function blockId(): string {
  seq += 1;
  return `b${Date.now().toString(36)}${seq.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Plain string of a rich text value. */
export function plainText(rt?: RichText): string {
  return (rt ?? []).map((s) => s.text).join('');
}

/** Rich text from a plain string. */
export function rt(text: string, marks?: TextMarks): RichText {
  return text ? [{ text, ...(marks ? { marks } : {}) }] : [];
}

/** Block types whose text is edited inline. */
export const textBlockTypes: BlockType[] = [
  'text', 'heading_1', 'heading_2', 'heading_3', 'heading_4', 'bulleted_list', 'numbered_list', 'to_do', 'toggle', 'quote', 'callout', 'code', 'page',
];
/** List-like blocks share the tight 1px vertical rhythm inside a run (6px at the run's ends). */
export const listLikeTypes: BlockType[] = ['bulleted_list', 'numbered_list', 'to_do', 'toggle'];
export const isListLike = (t: BlockType) => listLikeTypes.includes(t);
export const isHeading = (t: BlockType) => t.startsWith('heading_');

/** Human name of a block type (block menu label, turn-into, text toolbar). */
export const blockTypeNames: Record<BlockType, string> = {
  text: 'Text',
  heading_1: 'Heading 1',
  heading_2: 'Heading 2',
  heading_3: 'Heading 3',
  heading_4: 'Heading 4',
  bulleted_list: 'Bulleted list',
  numbered_list: 'Numbered list',
  to_do: 'To-do list',
  toggle: 'Toggle list',
  quote: 'Quote',
  callout: 'Callout',
  divider: 'Divider',
  code: 'Code',
  equation: 'Block equation',
  image: 'Image',
  bookmark: 'Web bookmark',
  table: 'Table',
  column_list: 'Columns',
  column: 'Column',
  table_of_contents: 'Table of contents',
  page: 'Page',
};
