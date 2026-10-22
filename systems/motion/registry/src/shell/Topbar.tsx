import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon, type IconName } from '../icons/Icon';
import { Tooltip } from '../atoms/Tooltip';
import { useOptionalAppFrame } from './AppFrame';

/* -------------------------------------------------------------------------------------------------
 * Page topbar (`header > .motion-topbar`). Measured (capture/states/topbar, app):
 *  bar        44 tall, bg-primary, pad 0 10 0 12, z 100; while typing it fades to opacity 0
 *  crumb      24 tall, pad 2 6, radius 6, 14/16.8, margin-right 8 after the trail
 *  privacy    "🔒 Private ▾": pad 0 6, lockFill 16 icon-tertiary, label margin 0 5 0 4 text-tertiary, chevron 11
 *  actions    pad-left 10, gap 2: "Edited …" 28 (pad 0 8, text-tertiary), Share 28 (pad 0 8, gap 6,
 *             lock 12x20 icon-primary), Copy link / Favorite 28 (20px icon-secondary), Actions 28 (22px ellipsis icon-primary)
 * -----------------------------------------------------------------------------------------------*/

export interface TopbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  iconSize?: number;
  tone?: 'primary' | 'secondary';
  tooltip?: ReactNode;
}
/** 28x28 topbar icon button (radius 6). */
export const TopbarButton = forwardRef<HTMLButtonElement, TopbarButtonProps>(function TopbarButton(
  { icon, label, iconSize = 20, tone = 'secondary', tooltip, className, ...props }, ref,
) {
  const btn = (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-n-md transition-[background] duration-[20ms]',
        'hover:bg-n-button-hover-bg-a active:bg-n-button-pressed-bg-a data-[state=open]:bg-n-button-hover-bg-a',
        tone === 'primary' ? 'text-n-icon-primary' : 'text-n-icon-secondary',
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  );
  return tooltip ? <Tooltip content={tooltip}>{btn}</Tooltip> : btn;
});

export interface Crumb {
  title: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
}
export interface BreadcrumbTrailProps extends HTMLAttributes<HTMLDivElement> {
  items: Crumb[];
  /** Privacy badge after the trail, e.g. "Private" (lock) or "Shared". Pass null to hide. */
  privacy?: ReactNode | null;
  onPrivacyClick?: () => void;
  /** Accessible name of the breadcrumb `nav` (default "Breadcrumb"); make it unique when several trails share a page. */
  label?: string;
}
/**
 * Topbar breadcrumb trail (local; the components group owns the generic Breadcrumbs). Crumbs are
 * 24px buttons with an optional 20px page icon, separated by a tertiary "/"; then the privacy badge.
 */
export function BreadcrumbTrail({ items, privacy = 'Private', onPrivacyClick, label = 'Breadcrumb', className, ...props }: BreadcrumbTrailProps) {
  return (
    <div className={cn('notranslate mr-2 flex h-full min-w-0 items-center overflow-hidden text-[14px] leading-[16.8px]', className)} {...props}>
      <nav aria-label={label} className="flex min-w-0 items-center">
        <ol className="m-0 flex min-w-0 list-none items-center p-0">
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              // On phones only the current page is shown.
              <li key={i} className={cn('flex min-w-0 items-center', !last && 'max-sm:hidden')}>
                {i > 0 && <span aria-hidden className="mx-0.5 text-n-text-tertiary">/</span>}
                <button
                  type="button"
                  onClick={c.onClick}
                  aria-current={last ? 'page' : undefined}
                  className="flex h-6 min-w-0 shrink cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-n-md px-1.5 py-0.5 hover:bg-n-button-hover-bg-a"
                >
                  {c.icon && <span aria-hidden className="flex size-5 shrink-0 items-center justify-center text-[16px] leading-none">{c.icon}</span>}
                  <span className="notranslate truncate">{c.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      {privacy !== null && (
        <button
          type="button"
          onClick={onPrivacyClick}
          className="flex h-6 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-n-md px-1.5 hover:bg-n-button-hover-bg-a max-sm:hidden"
        >
          <Icon name="lockFill" size={16} className="text-n-icon-tertiary" />
          <span className="ml-1 mr-[5px] text-n-text-tertiary">{privacy}</span>
          <Icon name="arrowChevronSingleDownFill" size={11} className="text-n-icon-tertiary" />
        </button>
      )}
    </div>
  );
}

export interface TopbarProps extends HTMLAttributes<HTMLElement> {
  /** Breadcrumb region content; usually `<BreadcrumbTrail/>`. */
  breadcrumbs?: ReactNode;
  /** Right side of the bar (your buttons). Overrides the document actions below. */
  actions?: ReactNode;
  /*
   * Document actions (opt-in): each control appears only when its prop is set, so an app topbar is clean by
   * default. They render as <TopbarActions/>.
   */
  /** "Edited 2m ago" text (hidden on tablets and phones). */
  edited?: ReactNode | null;
  /** Show the "»" open-sidebar button (desktop, sidebar collapsed). Inside an AppFrame this follows the frame. */
  sidebarCollapsed?: boolean;
  /** Inside an AppFrame, show the menu button that opens the sidebar drawer on phones (< 768px). Default true. */
  menuButton?: boolean;
  onOpenSidebar?: () => void;
  onSidebarPeek?: (peeking: boolean) => void;
  /** Fades the topbar out while you type; it comes back on hover. */
  idle?: boolean;
  /** Favorite state (pressed star). Shows the Favorite button. */
  favorite?: boolean;
  /** Shows the Share button. */
  onShare?: () => void;
  /** Shows the Copy link button. */
  onCopyLink?: () => void;
  /** Shows the Favorite button. */
  onFavorite?: () => void;
  /** Shows the "…" Actions button, e.g. a `Menu.Trigger` wrapping `<TopbarButton icon="ellipsis"/>`. */
  moreSlot?: ReactNode;
}

type DocumentActionProps = Pick<TopbarProps, 'edited' | 'favorite' | 'onShare' | 'onCopyLink' | 'onFavorite' | 'moreSlot'>;
const hasDocumentActions = (p: DocumentActionProps) =>
  (p.edited !== undefined && p.edited !== null) || p.favorite !== undefined || !!p.onShare || !!p.onCopyLink || !!p.onFavorite || p.moreSlot !== undefined;

/**
 * Document action cluster: Edited · Share · Copy link · Favorite · Actions. Each control is opt-in: it renders
 * only when its prop is set (`edited` text, `onShare`, `onCopyLink`, `onFavorite`/`favorite`, `moreSlot`).
 */
export function TopbarActions({ edited, favorite, onShare, onCopyLink, onFavorite, moreSlot }: DocumentActionProps) {
  if (!hasDocumentActions({ edited, favorite, onShare, onCopyLink, onFavorite, moreSlot })) return null;
  return (
    <div className="flex h-7 items-center gap-0.5">
      {edited !== undefined && edited !== null && (
        <span className="flex h-7 items-center whitespace-nowrap px-2 text-[14px] leading-[16.8px] text-n-text-tertiary max-md:hidden">
          {edited}
        </span>
      )}
      {onShare && <button
        type="button"
        aria-label="Share"
        onClick={onShare}
        className="motion-topbar-share-menu flex h-7 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-n-md px-2 text-[14px] leading-[16.8px] text-n-text-primary hover:bg-n-button-hover-bg-a"
      >
        {/* Share lock is a 12x20 drawing; ours is 20x20, so trim 4px each side */}
        <Icon name="lock" size={20} className="mx-[-4px] text-n-icon-primary" />
        Share
      </button>}
      {onCopyLink && <TopbarButton icon="link" label="Copy link" onClick={onCopyLink} tooltip="Copy link" className="max-sm:hidden" />}
      {(onFavorite || favorite !== undefined) && (
        <TopbarButton
          icon="star"
          label="Favorite"
          onClick={onFavorite}
          tooltip={favorite ? 'Remove from your favorites' : 'Add to your favorites'}
          aria-pressed={!!favorite}
          className={cn('motion-topbar-favorite-button max-sm:hidden', favorite && 'text-n-yellow-icon-accent-primary')}
        />
      )}
      {moreSlot}
    </div>
  );
}

/**
 * Top bar of an app page: breadcrumbs on the left, actions on the right. Inside an `AppFrame` it shows the
 * phone menu button (opens the sidebar drawer) and, on desktop, the "»" button while the sidebar is collapsed.
 */
export const Topbar = forwardRef<HTMLElement, TopbarProps>(function Topbar(
  { breadcrumbs, edited, actions, sidebarCollapsed, onOpenSidebar, onSidebarPeek, idle, favorite, onShare, onCopyLink, onFavorite, moreSlot, menuButton = true, className, ...props },
  ref,
) {
  const frame = useOptionalAppFrame();
  const collapsed = sidebarCollapsed ?? (frame ? frame.collapsed : false);
  const openSidebar = onOpenSidebar ?? (frame ? () => frame.setSidebarOpen(true) : undefined);
  const peek = onSidebarPeek ?? frame?.setPeeking;
  return (
    <header ref={ref} className={cn('group/topbar relative z-[100] h-11 w-full shrink-0 bg-n-bg-primary', className)} {...props}>
      <div className={cn('motion-topbar flex h-full items-center justify-between overflow-hidden pl-3 pr-2.5 transition-opacity duration-300', idle && 'opacity-0 hover:opacity-100 focus-within:opacity-100')}>
        <div className="motion-topbar-breadcrumb-region flex h-full min-w-0 flex-1 items-center">
          {/* Phone menu button (the drawer only exists on phones, so it renders once the viewport is known). */}
          {frame?.mobile && menuButton && (
            <button
              type="button"
              aria-label="Open sidebar"
              aria-expanded={frame.sidebarOpen}
              onClick={() => frame.setSidebarOpen(true)}
              className="-ml-1 mr-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a md:hidden pointer-coarse:size-9"
            >
              <Icon name="sidebarLeft" size={20} />
            </button>
          )}
          {collapsed && (
            <Tooltip content="Open sidebar" shortcut="⌘\">
              <button
                type="button"
                aria-label="Open sidebar"
                onClick={openSidebar}
                onPointerEnter={() => peek?.(true)}
                onPointerLeave={() => peek?.(false)}
                className="mr-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a max-md:hidden"
              >
                <Icon name="arrowChevronDoubleForward" size={20} />
              </button>
            </Tooltip>
          )}
          {breadcrumbs}
        </div>
        {(actions !== undefined || hasDocumentActions({ edited, favorite, onShare, onCopyLink, onFavorite, moreSlot })) && (
          <div className="motion-topbar-action-buttons z-[101] flex shrink-0 items-center justify-between pl-1.5 sm:pl-2.5">
            {actions ?? <TopbarActions {...{ edited, favorite, onShare, onCopyLink, onFavorite, moreSlot }} />}
          </div>
        )}
      </div>
    </header>
  );
});
