import { createContext, Fragment, useContext, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { plainText, isListLike, type Block, type BlockProps } from './types';
import type { LeafRenderProps } from './parts';
import { TextBlock } from './Text';
import { Heading } from './Heading';
import { BulletedListItem, NumberedListItem, ToDo, Toggle } from './List';
import { Quote } from './Quote';
import { Callout } from './Callout';
import { DividerBlock } from './Divider';
import { Code } from './Code';
import { Equation } from './Equation';
import { ImageBlock } from './Image';
import { Bookmark } from './Bookmark';
import { SimpleTable } from './SimpleTable';
import { Columns } from './Columns';
import { TableOfContents, type TocItem } from './TableOfContents';
import { PageLink } from './PageLink';

/** Context passed to `wrapBlock` for each rendered block. */
export interface BlockRenderContext {
  depth: number;
  parent: Block | null;
  index: number;
  siblings: Block[];
}

export interface BlockRendererProps {
  blocks: Block[];
  /** Replace text leaves (the editor passes contenteditable leaves). */
  renderLeaf?: (block: Block, p: LeafRenderProps) => ReactNode;
  /** Wrap each block element (editor: hover handle, drop indicator). */
  wrapBlock?: (block: Block, node: ReactElement, ctx: BlockRenderContext) => ReactNode;
  /** Prop changes from interactive parts (toggle open, to-do checked). Uncontrolled when omitted. */
  onBlockChange?: (id: string, props: Partial<BlockProps>) => void;
  /** Replace simple-table cells (editor). */
  renderCell?: (block: Block, row: number, col: number, className: string) => ReactNode;
  /** Extra content under an equation block (editor: TeX input). */
  renderEquationEditor?: (block: Block) => ReactNode;
  /** Makes equation blocks buttons that call this (editor: open the TeX input). */
  onEquationEdit?: (block: Block) => void;
  /** Called when an empty open toggle's hint is clicked. */
  onEmptyToggleClick?: (block: Block) => void;
  className?: string;
}

/** All headings of a document, in order (for the table of contents). */
export function collectHeadings(blocks: Block[]): TocItem[] {
  const out: TocItem[] = [];
  const walk = (bs: Block[]) => bs.forEach((b) => {
    if (b.type.startsWith('heading_')) out.push({ id: b.id, level: Number(b.type.slice(-1)), text: plainText(b.text) });
    if (b.children) walk(b.children);
  });
  walk(blocks);
  return out;
}

interface Ctx extends Omit<BlockRendererProps, 'blocks' | 'className'> {
  headings: TocItem[];
  local: Record<string, Partial<BlockProps>>;
  setLocal: (id: string, p: Partial<BlockProps>) => void;
}
const RendererCtx = createContext<Ctx | null>(null);

function BlockList({ blocks, parent, depth }: { blocks: Block[]; parent: Block | null; depth: number }) {
  return <>{blocks.map((b, i) => <BlockNode key={b.id} block={b} parent={parent} depth={depth} index={i} siblings={blocks} />)}</>;
}

function BlockNode({ block: b, parent, depth, index, siblings }: { block: Block; parent: Block | null; depth: number; index: number; siblings: Block[] }) {
  const ctx = useContext(RendererCtx)!;
  const props = { ...b.props, ...ctx.local[b.id] };
  const change = (p: Partial<BlockProps>) => (ctx.onBlockChange ? ctx.onBlockChange(b.id, p) : ctx.setLocal(b.id, p));
  const leaf = ctx.renderLeaf ? (p: LeafRenderProps) => ctx.renderLeaf!(b, p) : undefined;
  const kids = b.children?.length ? <BlockList blocks={b.children} parent={b} depth={depth + 1} /> : undefined;
  const common = { 'data-block-id': b.id, text: b.text, renderLeaf: leaf, color: b.color };

  // list rhythm: nested in a list-like parent → 2/0; else 6 at the ends of a run, 1 inside
  const prev = siblings[index - 1];
  const next = siblings[index + 1];
  const spacing = parent && isListLike(parent.type)
    ? { nested: true }
    : { top: !(prev && isListLike(prev.type)), bottom: !(next && isListLike(next.type)) };

  let node: ReactElement;
  switch (b.type) {
    case 'heading_1': case 'heading_2': case 'heading_3': case 'heading_4':
      node = (
        <Heading {...common} level={Number(b.type.slice(-1)) as 1 | 2 | 3 | 4} toggleable={props.toggleable} open={props.open}
          onOpenChange={(open) => change({ open })} onEmptyClick={() => ctx.onEmptyToggleClick?.(b)}>
          {kids}
        </Heading>
      );
      break;
    case 'bulleted_list':
      node = <BulletedListItem {...common} depth={depth} spacing={spacing}>{kids}</BulletedListItem>;
      break;
    case 'numbered_list': {
      let n = 1;
      for (let j = index - 1; j >= 0 && siblings[j].type === 'numbered_list'; j--) n++;
      node = <NumberedListItem {...common} depth={depth} index={n} spacing={spacing}>{kids}</NumberedListItem>;
      break;
    }
    case 'to_do':
      node = <ToDo {...common} spacing={spacing} checked={props.checked} onCheckedChange={(checked) => change({ checked })}>{kids}</ToDo>;
      break;
    case 'toggle':
      node = (
        <Toggle {...common} spacing={spacing} open={props.open} onOpenChange={(open) => change({ open })} onEmptyClick={() => ctx.onEmptyToggleClick?.(b)}>
          {kids}
        </Toggle>
      );
      break;
    case 'quote':
      node = <Quote {...common}>{kids}</Quote>;
      break;
    case 'callout':
      node = <Callout {...common} icon={props.icon} color={b.color ?? 'gray_background'}>{kids}</Callout>;
      break;
    case 'divider':
      node = <DividerBlock data-block-id={b.id} />;
      break;
    case 'code':
      node = <Code data-block-id={b.id} text={b.text} renderLeaf={leaf} language={props.language} caption={props.caption} />;
      break;
    case 'equation':
      node = <Equation data-block-id={b.id} expression={props.expression} editor={ctx.renderEquationEditor?.(b)} onEdit={ctx.onEquationEdit ? () => ctx.onEquationEdit?.(b) : undefined} />;
      break;
    case 'image':
      node = <ImageBlock data-block-id={b.id} src={props.src} caption={props.caption} width={props.width} />;
      break;
    case 'bookmark':
      node = <Bookmark data-block-id={b.id} url={props.url} title={props.title} description={props.description} thumbnail={props.thumbnail} favicon={props.favicon} />;
      break;
    case 'table':
      node = (
        <SimpleTable data-block-id={b.id} rows={props.rows ?? []} hasHeaderRow={props.hasHeaderRow} hasHeaderColumn={props.hasHeaderColumn}
          columnWidths={props.columnWidths} renderCell={ctx.renderCell ? (r, c, cls) => ctx.renderCell!(b, r, c, cls) : undefined} />
      );
      break;
    case 'column_list':
      node = (
        <Columns data-block-id={b.id} ratios={b.children?.map((c) => c.props?.ratio ?? 1 / (b.children?.length || 1))}>
          {(b.children ?? []).map((col) => (
            <div key={col.id} data-block-id={col.id} className="flex flex-col">
              <BlockList blocks={col.children ?? []} parent={col} depth={depth} />
            </div>
          ))}
        </Columns>
      );
      break;
    case 'column':
      node = <div data-block-id={b.id} className="flex flex-col">{kids}</div>;
      break;
    case 'table_of_contents':
      node = <TableOfContents data-block-id={b.id} items={ctx.headings} />;
      break;
    case 'page':
      node = <PageLink {...common} icon={props.icon} href={props.url} />;
      break;
    case 'text':
    default:
      node = <TextBlock {...common}>{kids}</TextBlock>;
  }
  return <Fragment>{ctx.wrapBlock ? ctx.wrapBlock(b, node, { depth, parent, index, siblings }) : node}</Fragment>;
}

/**
 * Renders a `Block[]` tree with the block components and vertical rhythm.
 * Read-only by default (toggles/to-dos still toggle locally); the Editor plugs in editable leaves.
 */
export function BlockRenderer({ blocks, className, ...opts }: BlockRendererProps) {
  const headings = useMemo(() => collectHeadings(blocks), [blocks]);
  const [local, setLocalState] = useState<Record<string, Partial<BlockProps>>>({});
  const setLocal = (id: string, p: Partial<BlockProps>) => setLocalState((s) => ({ ...s, [id]: { ...s[id], ...p } }));
  return (
    <RendererCtx.Provider value={{ ...opts, headings, local, setLocal }}>
      <div className={cn('flex w-full flex-col items-start text-[16px] leading-[1.5]', className)}>
        <BlockList blocks={blocks} parent={null} depth={0} />
      </div>
    </RendererCtx.Provider>
  );
}

/**
 * Content container for blocks used on their own (outside `BlockRenderer`/`Editor`): sets the
 * 16px / 1.5 content type, which block sizes are relative to (headings, code and inline code use em).
 */
export function BlockContent({ className, children }: { className?: string; children?: ReactNode }) {
  return <div className={cn('flex w-full flex-col items-start text-[16px] leading-[1.5]', className)}>{children}</div>;
}
