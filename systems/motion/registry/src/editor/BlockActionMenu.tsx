import { useState, type ReactNode } from 'react';
import { Menu, MenuFooter, MenuSearch } from '../components/Menu';
import { ColorMenuList, type ColorValue } from '../components/ColorMenu';
import { blockTypeNames, plainText, type Block, type BlockColor, type ColorName } from '../blocks/types';
import { isKind, turnIntoItems, type BlockKind } from './commands';

/** BlockColor → ColorMenu value. */
export function toColorValue(c?: BlockColor): ColorValue {
  if (!c || c === 'default') return { kind: 'text', color: 'default' };
  if (c.endsWith('_background')) return { kind: 'background', color: c.replace('_background', '') as ColorName };
  return { kind: 'text', color: c as ColorName };
}
/** ColorMenu value → BlockColor. */
export function fromColorValue(v: ColorValue): BlockColor {
  if (v.color === 'default') return 'default';
  return v.kind === 'background' ? `${v.color}_background` : v.color;
}

/** Display name for the block menu label ("Text", "Toggle list", "Toggle heading 2"…). */
export function blockLabel(b: Pick<Block, 'type' | 'props'>): string {
  if (b.type.startsWith('heading_') && b.props?.toggleable) return `Toggle heading ${b.type.slice(-1)}`;
  return blockTypeNames[b.type];
}

export interface BlockActionMenuProps {
  block: Block;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The trigger (the ⋮⋮ handle), rendered with `asChild`. */
  children: ReactNode;
  onTurnInto?: (kind: BlockKind) => void;
  onColor?: (color: BlockColor) => void;
  onCopyLink?: () => void;
  onDuplicate?: () => void;
  onMoveTo?: () => void;
  onDelete?: () => void;
  onComment?: () => void;
  onSuggestEdits?: () => void;
  onAskAI?: () => void;
  /** Footer lines. */
  lastEditedBy?: string;
  lastEditedAt?: string;
  lastUsedColor?: BlockColor;
  modal?: boolean;
  side?: 'left' | 'right' | 'bottom' | 'top';
}

/**
 * Block action menu (block-menu): opened from the ⋮⋮ handle. 265 wide; search "Search actions…"
 * (padding 8 4 4); label = block type; Turn into ▸ / Color ▸; Copy link to block ⌘^L, Duplicate ⌘D,
 * Move to ⌘⇧P, Delete Del; Comment ⌘⇧M, Suggest edits ⌘⇧⌥X; Ask AI ⌘J; footer "Last edited by …",
 * time, word/character count (12/16 text-tertiary).
 */
export function BlockActionMenu({
  block, open, onOpenChange, children, onTurnInto, onColor, onCopyLink, onDuplicate, onMoveTo, onDelete,
  onComment, onSuggestEdits, onAskAI, lastEditedBy = 'You', lastEditedAt = 'Just now', lastUsedColor, modal = false, side = 'left',
}: BlockActionMenuProps) {
  const [q, setQ] = useState('');
  const text = plainText(block.text);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const close = () => onOpenChange?.(false);

  const actions = [
    { id: 'copy', label: 'Copy link to block', icon: 'link', shortcut: '⌘^L', run: onCopyLink, group: 1 },
    { id: 'dup', label: 'Duplicate', icon: 'duplicate', shortcut: '⌘D', run: onDuplicate, group: 1 },
    { id: 'move', label: 'Move to', icon: 'arrowTurnUpRight', shortcut: '⌘⇧P', run: onMoveTo, group: 1 },
    { id: 'del', label: 'Delete', icon: 'trash', shortcut: 'Del', run: onDelete, group: 1 },
    { id: 'comment', label: 'Comment', icon: 'commentPencil', shortcut: '⌘⇧M', run: onComment, group: 2 },
    { id: 'suggest', label: 'Suggest edits', icon: 'commentPencil', shortcut: '⌘⇧⌥X', run: onSuggestEdits, group: 2 },
    { id: 'ai', label: 'Ask AI', icon: 'aiFace', shortcut: '⌘J', run: onAskAI, group: 3 },
  ] as const;
  const query = q.trim().toLowerCase();

  const item = (a: (typeof actions)[number]) => (
    <Menu.Item key={a.id} icon={a.icon} shortcut={a.shortcut} onSelect={() => a.run?.()}>{a.label}</Menu.Item>
  );

  return (
    <Menu.Root open={open} onOpenChange={(o) => { onOpenChange?.(o); if (!o) setQ(''); }} modal={modal}>
      <Menu.Trigger asChild>{children}</Menu.Trigger>
      <Menu.Content
        width={265}
        side={side}
        align="start"
        sideOffset={6}
        className="flex max-h-[70vh] flex-col"
        onCloseAutoFocus={(e) => e.preventDefault()}
        header={
          <MenuSearch
            noIcon
            autoFocus
            wrapperClassName="px-3 pb-1 pt-2"
            placeholder="Search actions…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (!['ArrowDown', 'ArrowUp', 'Escape', 'Enter', 'Tab'].includes(e.key)) e.stopPropagation(); }}
          />
        }
        footer={!query ? <MenuFooter lines={[`Last edited by ${lastEditedBy}`, lastEditedAt, `${words} words, ${text.length} characters`]} /> : undefined}
      >
        {query ? (
          <>
            {turnIntoItems.filter((t) => t.kind && t.label.toLowerCase().includes(query)).map((t) => (
              <Menu.Item key={'t' + t.id} icon={t.icon} onSelect={() => t.kind && onTurnInto?.(t.kind)} description="Turn into">{t.label}</Menu.Item>
            ))}
            {actions.filter((a) => a.label.toLowerCase().includes(query)).map(item)}
          </>
        ) : (
          <>
            <Menu.Label>{blockLabel(block)}</Menu.Label>
            <Menu.Sub>
              <Menu.SubTrigger icon="arrowSquarePathUpDown">Turn into</Menu.SubTrigger>
              <Menu.SubContent width={220} className="max-h-[70vh] overflow-y-auto">
                {turnIntoItems.map((t) => (
                  <Menu.Item key={t.id} icon={t.icon} checked={isKind(block, t.kind)} disabled={!t.kind} onSelect={() => t.kind && onTurnInto?.(t.kind)}>
                    {t.label}
                  </Menu.Item>
                ))}
              </Menu.SubContent>
            </Menu.Sub>
            <Menu.Sub>
              <Menu.SubTrigger icon="blockColor">Color</Menu.SubTrigger>
              <Menu.SubContent width={220} className="max-h-[70vh] overflow-y-auto p-0 [&>[data-slot=menu-list]]:p-0">
                <ColorMenuList
                  autoFocus
                  value={toColorValue(block.color)}
                  lastUsed={lastUsedColor ? [{ value: toColorValue(lastUsedColor), shortcut: '⌘⇧H' }] : undefined}
                  onSelect={(v) => { onColor?.(fromColorValue(v)); close(); }}
                />
              </Menu.SubContent>
            </Menu.Sub>
            <Menu.Separator />
            {actions.filter((a) => a.group === 1).map(item)}
            <Menu.Separator />
            {actions.filter((a) => a.group === 2).map(item)}
            <Menu.Separator />
            {actions.filter((a) => a.group === 3).map(item)}
          </>
        )}
      </Menu.Content>
    </Menu.Root>
  );
}
