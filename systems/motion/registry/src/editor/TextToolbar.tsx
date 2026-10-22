import { forwardRef, useRef, useState, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon, type IconName } from '../icons/Icon';
import { MenuSurface } from '../components/Menu';
import { ColorGrid } from '../components/ColorMenu';
import type { Block, BlockColor, TextMarks } from '../blocks/types';
import { TurnIntoMenu } from './TurnIntoMenu';
import { fromColorValue, toColorValue } from './BlockActionMenu';
import type { BlockKind } from './commands';

export type ToolbarMark = 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'equation';

export interface TextToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Block holding the selection (drives the "Normal Text" label and the turn-into check). */
  block?: Pick<Block, 'type' | 'props'>;
  /** Marks fully applied on the selection (buttons show pressed). */
  active?: Partial<Record<ToolbarMark | 'link', boolean>>;
  /** Current text/background color of the selection. */
  color?: TextMarks['color'];
  recentColors?: BlockColor[];
  onMark?: (mark: ToolbarMark) => void;
  onClearFormat?: () => void;
  /** URL to set, or null to remove the link. */
  onLink?: (url: string | null) => void;
  onColor?: (color: BlockColor) => void;
  onTurnInto?: (kind: BlockKind) => void;
  onComment?: () => void;
  /** Open a panel initially (static renders): 'color' | 'turn' | 'link'. */
  defaultPanel?: Panel;
  /** Hide the AI section (skills + "Edit with AI"). */
  hideAI?: boolean;
}
type Panel = 'none' | 'color' | 'turn' | 'link';

const toolbarLabel = (b?: Pick<Block, 'type' | 'props'>) => {
  if (!b || b.type === 'text') return 'Normal Text';
  const names: Partial<Record<Block['type'], string>> = {
    heading_1: 'Heading 1', heading_2: 'Heading 2', heading_3: 'Heading 3', heading_4: 'Heading 4', bulleted_list: 'Bulleted list',
    numbered_list: 'Numbered list', to_do: 'To-do list', toggle: 'Toggle list', quote: 'Quote', callout: 'Callout', code: 'Code', page: 'Page',
  };
  return (b.props?.toggleable ? 'Toggle ' : '') + (names[b.type] ?? 'Text');
};

const Btn = ({ icon, label, active, onClick, className, children }: { icon?: IconName; label: string; active?: boolean; onClick?: () => void; className?: string; children?: ReactNode }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      'flex h-7 w-8 shrink-0 cursor-pointer items-center justify-center rounded-n-md p-1.5 text-n-icon-primary transition-[background] duration-[20ms] ease-in hover:bg-n-button-hover-bg-a',
      active && 'bg-n-button-hover-bg-a',
      className,
    )}
  >
    {children ?? (icon && <Icon name={icon} size={20} />)}
  </button>
);

/** Toolbar arrow keys: ←/→/↑/↓ move between the card's buttons, Home/End jump to the ends. */
function onToolbarKey(e: KeyboardEvent<HTMLDivElement>) {
  const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
  if (!step && e.key !== 'Home' && e.key !== 'End') return;
  if (!(e.target instanceof HTMLButtonElement)) return;
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[data-toolbar-card] button:not(:disabled)'));
  const i = items.indexOf(e.target);
  if (i < 0) return;
  e.preventDefault();
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + step + items.length) % items.length;
  items[next]?.focus();
}

const Sep = ({ className }: { className?: string }) => <div className={cn('mx-2 my-1 h-px shrink-0 bg-n-bg-tertiary-translucent-a', className)} />;

/**
 * Text selection toolbar (text-toolbar, the 2025 vertical card). Measured: 192 wide (+16 outer padding),
 * padding 8, radius 14, bg elevated, shadow outline-lg; "Normal Text ▸" row 28 (padding 0 8 0 6, gap 8);
 * two icon rows (gap 4): [A] B I U Tx / link S code √x …, buttons 32×28 radius 6 icon-primary;
 * Comment row; Skills list (12px text-secondary header, 28px rows); "Edit with AI ⌘^E" box (border-primary,
 * radius 6, padding 6 6 6 8). The "A" opens the color grid (color-menu); "Normal Text" opens Turn into.
 */
export const TextToolbar = forwardRef<HTMLDivElement, TextToolbarProps>(function TextToolbar(
  { block, active = {}, color, recentColors, onMark, onClearFormat, onLink, onColor, onTurnInto, onComment, defaultPanel = 'none', hideAI, className, ...props }, ref,
) {
  const [panel, setPanel] = useState<Panel>(defaultPanel);
  const [url, setUrl] = useState('');
  // Panels opened from the keyboard (click detail 0) take focus; Escape closes them and returns it.
  const [keyboardOpened, setKeyboardOpened] = useState(false);
  const turnTrigger = useRef<HTMLButtonElement>(null);
  const toggle = (p: Panel, e?: MouseEvent) => {
    setKeyboardOpened(e?.detail === 0);
    setPanel((cur) => (cur === p ? 'none' : p));
  };
  const closeTurn = () => { setPanel('none'); turnTrigger.current?.focus(); };
  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label="Text formatting"
      aria-orientation="vertical"
      className={cn('relative w-[192px] text-[14px] leading-[16.8px] text-n-text-primary', className)}
      // Keep the editor's text selection while the toolbar is used (inputs still take focus).
      onMouseDown={(e) => { if (!(e.target instanceof HTMLInputElement)) e.preventDefault(); }}
      onKeyDown={onToolbarKey}
      {...props}
    >
      <div data-toolbar-card className="flex flex-col items-stretch overflow-hidden rounded-n-3xl bg-n-bg-elevated p-2 shadow-n-shadow-outline-lg">
        <button
          ref={turnTrigger}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={panel === 'turn'}
          onClick={(e) => toggle('turn', e)}
          className={cn('flex h-7 cursor-pointer items-center gap-2 rounded-n-md pe-2 ps-1.5 text-start hover:bg-n-button-hover-bg-a', panel === 'turn' && 'bg-n-button-hover-bg-a')}
        >
          <Icon name="textNormal" size={20} className="text-n-icon-primary" />
          <span className="min-w-0 flex-1 truncate">{toolbarLabel(block)}</span>
          <Icon name="arrowChevronSingleRightSmall" size={16} className="text-n-icon-secondary" />
        </button>
        <Sep />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Btn label="Text color" active={panel === 'color'} onClick={() => toggle('color')}>
              <span className="flex size-5 items-center justify-center rounded-n-md p-2 text-[12px] font-medium leading-[14.4px] shadow-[inset_0_0_0_1px_var(--n-border-primary-translucent-a)]">A</span>
            </Btn>
            <Btn icon="textBold" label="Bold" active={active.bold} onClick={() => onMark?.('bold')} />
            <Btn icon="textItalic" label="Italic" active={active.italic} onClick={() => onMark?.('italic')} />
            <Btn icon="textUnderline" label="Underline" active={active.underline} onClick={() => onMark?.('underline')} />
            <Btn icon="textX" label="Clear format" className="w-7" onClick={onClearFormat} />
          </div>
          <div className="flex items-center gap-1">
            <Btn icon="link" label="Link" active={active.link || panel === 'link'} onClick={() => (active.link ? onLink?.(null) : toggle('link'))} />
            <Btn icon="textStrikethrough" label="Strikethrough" active={active.strike} onClick={() => onMark?.('strike')} />
            <Btn icon="code" label="Inline code" active={active.code} onClick={() => onMark?.('code')} />
            <Btn icon="squareRoot" label="Equation" active={active.equation} onClick={() => onMark?.('equation')} />
            <Btn icon="ellipsisSmall" label="More" className="w-7" />
          </div>
        </div>
        <Sep />
        <div className="flex h-7 items-center">
          <button type="button" onClick={onComment} className="flex h-7 cursor-pointer items-center gap-2 rounded-n-md px-2 hover:bg-n-button-hover-bg-a">
            <Icon name="commentFilled" size={20} className="text-n-icon-primary" />
            Comment
          </button>
          <span className="flex-1" />
          <Btn icon="emojiFacePlus" label="Add reaction" />
          <Btn icon="commentPencil" label="Suggest edits" className="w-7" />
        </div>
        {!hideAI && (
          <>
            <Sep className="mb-0" />
            <div className="relative max-h-[134px] overflow-auto py-1 [mask-image:linear-gradient(to_bottom,black_calc(100%-36px),transparent)]">
              <div className="flex h-7 items-center justify-between gap-1.5 rounded-n-md pe-1 ps-2 text-[12px] leading-[14.4px] text-n-text-secondary">
                Skills
                <button type="button" aria-label="Skills" className="flex size-6 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a">
                  <Icon name="sliders" size={16} />
                </button>
              </div>
              {['Improve writing', 'Proofread', 'Explain', 'Reformat'].map((s) => (
                <button key={s} type="button" className="flex h-7 w-full cursor-pointer items-center rounded-n-md px-2 text-start hover:bg-n-button-hover-bg-a">{s}</button>
              ))}
            </div>
            <div className="flex gap-1.5 rounded-n-md border border-n-border-primary py-1.5 pe-1.5 ps-2 leading-[19.6px]">
              <span className="flex-1 text-n-text-tertiary">Edit with AI</span>
              <span className="text-[12px] text-n-text-tertiary">⌘^E</span>
            </div>
          </>
        )}
      </div>

      {panel === 'color' && (
        <MenuSurface width={190} className="absolute start-2 top-[77px] z-10">
          <ColorGrid
            value={color?.endsWith('_background')
              ? [{ kind: 'text', color: 'default' }, toColorValue(color)]
              : [toColorValue(color), { kind: 'background', color: 'default' }]}
            recent={recentColors?.map(toColorValue)}
            onSelect={(v) => { onColor?.(fromColorValue(v)); setPanel('none'); }}
          />
        </MenuSurface>
      )}
      {panel === 'turn' && (
        <TurnIntoMenu
          block={block}
          autoFocus={keyboardOpened}
          className="absolute start-[calc(100%+4px)] top-0 z-10 max-h-[420px] max-sm:start-2 max-sm:top-9"
          onSelect={(it) => { if (it.kind) onTurnInto?.(it.kind); closeTurn(); }}
          onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeTurn(); } }}
        />
      )}
      {panel === 'link' && (
        <MenuSurface width={260} className="absolute start-2 top-[118px] z-10 p-2">
          <input
            autoFocus
            placeholder="Paste link or search pages"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && url.trim()) { onLink?.(url.trim()); setUrl(''); setPanel('none'); }
              if (e.key === 'Escape') setPanel('none');
            }}
            className="h-7 w-full rounded-n-md bg-n-bg-interactive-translucent-a px-2 text-[14px] leading-5 text-n-text-primary shadow-[inset_0_0_0_1px_var(--n-border-primary-translucent-a)] outline-none placeholder:text-n-text-tertiary focus:shadow-n-input-blue-focus-ring"
          />
        </MenuSurface>
      )}
    </div>
  );
});
