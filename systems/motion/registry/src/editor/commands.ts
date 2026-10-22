import type { IconName } from '../icons/Icon';
import { blockId, rt, type Block, type BlockType, type BlockProps } from '../blocks/types';

/** What a slash/turn-into command produces. `null` kind = shown but not implemented (closes the menu). */
export interface BlockKind {
  type: BlockType;
  props?: BlockProps;
  /** For "N columns". */
  columns?: number;
}

export interface SlashItem {
  id: string;
  label: string;
  icon: IconName;
  /** Markdown shortcut hint on the right ("#", "##", "- ", "```"…). */
  shortcut?: string;
  /** Muted text after the label (" · Embeds"). */
  description?: string;
  badge?: string;
  /** Extra search terms. */
  keywords?: string;
  kind: BlockKind | null;
}
export interface SlashGroup {
  label: string;
  items: SlashItem[];
}

/** Slash menu content, captured from slash-menu (order, icons and shortcut hints). */
export const slashGroups: SlashGroup[] = [
  {
    label: 'Suggested',
    items: [
      { id: 'ai-meeting-notes', label: 'AI Meeting Notes', icon: 'paperMicrophone', keywords: 'transcription', kind: null },
      { id: 'html', label: 'HTML', icon: 'aiBlock', description: 'Embeds', badge: 'New', kind: null },
      { id: 'callout-s', label: 'Callout', icon: 'calloutBlock', kind: { type: 'callout', props: { icon: '💡' } } },
      { id: 'toggle-h2-s', label: 'Toggle heading 2', icon: 'textH2Toggle', shortcut: '## >', kind: { type: 'heading_2', props: { toggleable: true, open: true } } },
    ],
  },
  {
    label: 'Basic blocks',
    items: [
      { id: 'text', label: 'Text', icon: 'textNormal', keywords: 'paragraph plain', kind: { type: 'text' } },
      { id: 'h1', label: 'Heading 1', icon: 'textH1', shortcut: '#', keywords: 'title h1', kind: { type: 'heading_1' } },
      { id: 'h2', label: 'Heading 2', icon: 'textH2', shortcut: '##', keywords: 'subtitle h2', kind: { type: 'heading_2' } },
      { id: 'h3', label: 'Heading 3', icon: 'textH3', shortcut: '###', keywords: 'h3', kind: { type: 'heading_3' } },
      { id: 'h4', label: 'Heading 4', icon: 'textH4', shortcut: '####', keywords: 'h4', kind: { type: 'heading_4' } },
      { id: 'bullet', label: 'Bulleted list', icon: 'listBullet', shortcut: '-', keywords: 'unordered ul', kind: { type: 'bulleted_list' } },
      { id: 'number', label: 'Numbered list', icon: 'listNumber', shortcut: '1.', keywords: 'ordered ol', kind: { type: 'numbered_list' } },
      { id: 'todo', label: 'To-do list', icon: 'checklist', shortcut: '[]', keywords: 'checkbox task', kind: { type: 'to_do' } },
      { id: 'toggle', label: 'Toggle list', icon: 'listToggle', shortcut: '>', keywords: 'collapse', kind: { type: 'toggle', props: { open: true } } },
      { id: 'page', label: 'Page', icon: 'page', keywords: 'subpage', kind: { type: 'page' } },
      { id: 'callout', label: 'Callout', icon: 'calloutBlock', kind: { type: 'callout', props: { icon: '💡' } } },
      { id: 'quote', label: 'Quote', icon: 'quote', shortcut: '"', keywords: 'blockquote', kind: { type: 'quote' } },
      { id: 'table', label: 'Table', icon: 'viewTable', keywords: 'simple table grid', kind: { type: 'table' } },
      { id: 'divider', label: 'Divider', icon: 'dashLong', shortcut: '---', keywords: 'separator hr line', kind: { type: 'divider' } },
      { id: 'link-to-page', label: 'Link to page', icon: 'docSend', kind: { type: 'page' } },
    ],
  },
  {
    label: 'Media',
    items: [
      { id: 'image', label: 'Image', icon: 'photo', keywords: 'picture photo', kind: { type: 'image' } },
      { id: 'video', label: 'Video', icon: 'playButton', kind: null },
      { id: 'audio', label: 'Audio', icon: 'volumeOn', kind: null },
      { id: 'code', label: 'Code', icon: 'code', shortcut: '```', keywords: 'snippet', kind: { type: 'code', props: { language: 'JavaScript' } } },
      { id: 'file', label: 'File', icon: 'paperClip', kind: null },
      { id: 'bookmark', label: 'Web bookmark', icon: 'bookmark', keywords: 'link url', kind: { type: 'bookmark' } },
    ],
  },
  {
    label: 'Advanced blocks',
    items: [
      { id: 'toc', label: 'Table of contents', icon: 'listBullet', keywords: 'toc', kind: { type: 'table_of_contents' } },
      { id: 'equation', label: 'Block equation', icon: 'sumSquare', keywords: 'math tex latex', kind: { type: 'equation' } },
      { id: 'toggle-h1', label: 'Toggle heading 1', icon: 'textH1Toggle', shortcut: '# >', kind: { type: 'heading_1', props: { toggleable: true, open: true } } },
      { id: 'toggle-h2', label: 'Toggle heading 2', icon: 'textH2Toggle', shortcut: '## >', kind: { type: 'heading_2', props: { toggleable: true, open: true } } },
      { id: 'toggle-h3', label: 'Toggle heading 3', icon: 'textH3Toggle', shortcut: '### >', kind: { type: 'heading_3', props: { toggleable: true, open: true } } },
      { id: 'cols-2', label: '2 columns', icon: 'rectangleSplit2', kind: { type: 'column_list', columns: 2 } },
      { id: 'cols-3', label: '3 columns', icon: 'rectangleSplit3', kind: { type: 'column_list', columns: 3 } },
      { id: 'cols-4', label: '4 columns', icon: 'rectangleSplit4', kind: { type: 'column_list', columns: 4 } },
      { id: 'cols-5', label: '5 columns', icon: 'rectangleSplit5', kind: { type: 'column_list', columns: 5 } },
    ],
  },
];

/** Filter slash groups by a query (label + keywords, case-insensitive, word-prefix friendly). */
export function filterSlash(query: string, groups: SlashGroup[] = slashGroups): SlashGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  const seen = new Set<string>();
  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => {
        const hay = `${it.label} ${it.keywords ?? ''} ${it.description ?? ''}`.toLowerCase();
        const ok = hay.includes(q) || q.split(/\s+/).every((w) => hay.includes(w));
        if (!ok || seen.has(it.label)) return false;
        seen.add(it.label);
        return true;
      }),
    }))
    .filter((g) => g.items.length);
}

export interface TurnIntoItem {
  id: string;
  label: string;
  icon: IconName;
  kind: BlockKind | null;
  submenu?: boolean;
}
/** Turn-into submenu, captured from turn-into-menu (order and icons). */
export const turnIntoItems: TurnIntoItem[] = [
  { id: 'text', label: 'Text', icon: 'textNormal', kind: { type: 'text' } },
  { id: 'h1', label: 'Heading 1', icon: 'textH1', kind: { type: 'heading_1' } },
  { id: 'h2', label: 'Heading 2', icon: 'textH2', kind: { type: 'heading_2' } },
  { id: 'h3', label: 'Heading 3', icon: 'textH3', kind: { type: 'heading_3' } },
  { id: 'h4', label: 'Heading 4', icon: 'textH4', kind: { type: 'heading_4' } },
  { id: 'page', label: 'Page', icon: 'page', kind: { type: 'page' } },
  { id: 'page-in', label: 'Page in', icon: 'docSend', kind: null, submenu: true },
  { id: 'bullet', label: 'Bulleted list', icon: 'listBullet', kind: { type: 'bulleted_list' } },
  { id: 'number', label: 'Numbered list', icon: 'listNumber', kind: { type: 'numbered_list' } },
  { id: 'todo', label: 'To-do list', icon: 'checklist', kind: { type: 'to_do' } },
  { id: 'toggle', label: 'Toggle list', icon: 'listToggle', kind: { type: 'toggle' } },
  { id: 'code', label: 'Code', icon: 'code', kind: { type: 'code', props: { language: 'JavaScript' } } },
  { id: 'quote', label: 'Quote', icon: 'quote', kind: { type: 'quote' } },
  { id: 'callout', label: 'Callout', icon: 'calloutBlock', kind: { type: 'callout', props: { icon: '💡' } } },
  { id: 'equation', label: 'Block equation', icon: 'sumSquare', kind: { type: 'equation' } },
  { id: 'synced', label: 'Synced block', icon: 'blockSync', kind: null },
  { id: 'toggle-h1', label: 'Toggle heading 1', icon: 'textH1Toggle', kind: { type: 'heading_1', props: { toggleable: true } } },
  { id: 'toggle-h2', label: 'Toggle heading 2', icon: 'textH2Toggle', kind: { type: 'heading_2', props: { toggleable: true } } },
  { id: 'toggle-h3', label: 'Toggle heading 3', icon: 'textH3Toggle', kind: { type: 'heading_3', props: { toggleable: true } } },
  { id: 'toggle-h4', label: 'Toggle heading 4', icon: 'textH4Toggle', kind: { type: 'heading_4', props: { toggleable: true } } },
  { id: 'cols-2', label: '2 columns', icon: 'rectangleSplit2', kind: { type: 'column_list', columns: 2 } },
  { id: 'cols-3', label: '3 columns', icon: 'rectangleSplit3', kind: { type: 'column_list', columns: 3 } },
  { id: 'cols-4', label: '4 columns', icon: 'rectangleSplit4', kind: { type: 'column_list', columns: 4 } },
  { id: 'cols-5', label: '5 columns', icon: 'rectangleSplit5', kind: { type: 'column_list', columns: 5 } },
];

/** Is `block` currently of this kind (for the turn-into checkmark)? */
export function isKind(block: Pick<Block, 'type' | 'props'>, kind: BlockKind | null): boolean {
  if (!kind) return false;
  if (kind.type !== block.type) return false;
  if (block.type.startsWith('heading_')) return !!kind.props?.toggleable === !!block.props?.toggleable;
  return true;
}

/** A fresh block of a kind (void kinds get sensible defaults). */
export function newBlock(kind: BlockKind, text = rt('')): Block {
  const b: Block = { id: blockId(), type: kind.type, props: kind.props ? { ...kind.props } : undefined };
  if (kind.type === 'table') {
    b.props = { hasHeaderRow: true, rows: [[rt(''), rt(''), rt('')], [rt(''), rt(''), rt('')]] };
  } else if (kind.type === 'column_list') {
    const n = kind.columns ?? 2;
    b.children = Array.from({ length: n }, () => ({ id: blockId(), type: 'column' as const, children: [{ id: blockId(), type: 'text' as const, text: [] }] }));
  } else if (!['divider', 'image', 'bookmark', 'equation', 'table_of_contents'].includes(kind.type)) {
    b.text = text;
  }
  return b;
}
