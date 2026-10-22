import { cloneElement, forwardRef, isValidElement, useId, type ButtonHTMLAttributes, type KeyboardEvent, type HTMLAttributes, type InputHTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { Dialog } from 'radix-ui';
import { cn } from '../lib/cn';
import { Icon, type IconName } from '../icons/Icon';
import { Badge } from '../atoms/Badge';
import { useDialogReturnFocus } from './hooks';

/* -------------------------------------------------------------------------------------------------
 * "Settings & members" modal. Measured (capture/states/settings-modal, 1710x1037):
 *  dialog     1512x937 = viewport - 99px sides / 50px top+bottom, radius 12, bg-primary, shadow-outline-scroll
 *  underlay   overlay-smoke-a (rgba(15,15,15,.6))
 *  nav        240 wide, bg-secondary; search row pad 8 8 4 (28px field, pad 4 6, radius 6, bg-secondary-translucent);
 *             list pad 8, groups gap 12; group label 28px pad 6 8 12/16 500 text-tertiary;
 *             tab 28px pad 4 6 gap 6 radius 6, 24px icon box (20 icon-secondary), label 14/20 500 text-accent-primary;
 *             selected: bg-interactive-translucent, text-primary, icon-primary
 *  content    pad 36 60 44, 800 column, gap 44; title 26/32 600, description 16/24;
 *             section heading 16/24 500, pad-bottom 12, margin-bottom 16, border-bottom bg-tertiary-translucent;
 *             rows gap 24: label 14/20 500 + description 13/18 text-secondary, control right (28px outline select / 30x18 switch)
 * -----------------------------------------------------------------------------------------------*/

export interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Left column: `<SettingsNav>` with groups and items. */
  nav: ReactNode;
  /** Right column: `<SettingsPage>`. */
  children: ReactNode;
  title?: string;
}
/**
 * Settings dialog: a left navigation and a scrolling content panel; full-screen on phones with the
 * navigation stacked above the content. Radix Dialog (focus trap, Escape, focus return).
 */
export function SettingsModal({ open, onOpenChange, nav, children, title = 'Settings & members' }: SettingsModalProps) {
  const returnFocus = useDialogReturnFocus();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="motion-overlay fixed inset-0 z-[200] bg-n-overlay-smoke-a" />
        <Dialog.Content
          aria-describedby={undefined}
          aria-modal="true"
          {...returnFocus}
          className={cn(
            'motion-dialog motion-portal fixed inset-0 z-[201] flex overflow-hidden bg-n-bg-primary text-n-text-primary outline-none',
            'md:inset-auto md:left-0 md:right-0 md:top-[50px] md:mx-auto md:h-[calc(100vh-100px)] md:w-[calc(100vw-198px)] md:rounded-n-2xl md:shadow-n-shadow-outline-scroll',
          )}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <SettingsLayout nav={nav}>{children}</SettingsLayout>
          <Dialog.Close aria-label="Close" className="absolute right-3 top-3 z-[2] flex size-6 cursor-pointer items-center justify-center rounded-n-md text-n-icon-secondary hover:bg-n-button-hover-bg-a">
            <Icon name="xMarkSmall" size={16} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** The modal's inner two-column layout on its own (for docs / embedding without a dialog). */
export function SettingsLayout({ nav, children, className, ...props }: { nav: ReactNode; children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex size-full max-md:flex-col', className)} {...props}>
      <div className="w-[240px] shrink-0 overflow-auto bg-n-bg-secondary max-md:max-h-[38%] max-md:w-full max-md:border-b max-md:border-n-border-secondary max-md:pr-10">{nav}</div>
      <div className="z-[1] min-h-0 min-w-0 flex-1 overflow-hidden bg-n-bg-primary">
        <div className="motion-scroller flex size-full items-start justify-center overflow-auto px-4 pb-11 pt-6 sm:px-[60px] sm:pt-9">{children}</div>
      </div>
    </div>
  );
}

export interface SettingsNavProps extends HTMLAttributes<HTMLDivElement> {
  search?: boolean;
  searchProps?: InputHTMLAttributes<HTMLInputElement>;
  /** Pinned at the bottom of the nav (e.g. "Upgrade plan"). */
  footer?: ReactNode;
}
/** Left navigation: search field + tablist of `SettingsNavGroup`s. */
export function SettingsNav({ search = true, searchProps, footer, className, children, ...props }: SettingsNavProps) {
  return (
    <div className={cn('flex h-full flex-col overflow-hidden', className)} {...props}>
      {search && (
        <div className="px-2 pb-1 pt-2">
          <label className="flex h-7 items-center rounded-n-md bg-n-bg-secondary-translucent-a px-1.5 py-1 text-[14px] leading-5 shadow-[inset_0_0_0_1px_var(--n-border-primary-translucent-a)] focus-within:shadow-n-focus-shadow">
            <span aria-hidden className="mr-1.5 flex size-6 items-center justify-center text-n-icon-tertiary"><Icon name="magnifyingGlassSmall" size={16} /></span>
            <input type="search" aria-label="Search settings" placeholder="Search settings" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-n-text-tertiary" {...searchProps} />
          </label>
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col justify-between gap-0.5 overflow-auto p-2">
        <div role="tablist" aria-orientation="vertical" aria-label="Settings" className="flex flex-col gap-3">{children}</div>
        {footer}
      </div>
    </div>
  );
}

/** Nav group with a 28px tertiary label ("Account", "Workspace", "Features", "Admin", …). */
export function SettingsNavGroup({ label, className, children, ...props }: { label: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)} {...props}>
      <div className="truncate whitespace-nowrap px-2 py-1.5 text-[12px] font-medium leading-4 text-n-text-tertiary">{label}</div>
      {children}
    </div>
  );
}

export interface SettingsNavItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Leading 20px icon name, or an element (avatar, custom icon). */
  icon?: IconName | ReactElement;
  selected?: boolean;
  /** Right side, e.g. a "New" badge. */
  badge?: ReactNode;
  tone?: 'default' | 'accent';
}
/** ↑/↓/Home/End move focus between the tabs of the item's vertical tablist. */
function moveTabFocus(e: KeyboardEvent<HTMLButtonElement>) {
  const list = e.currentTarget.closest('[role="tablist"]');
  if (!list) return;
  const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])')];
  const i = tabs.indexOf(e.currentTarget);
  const next = e.key === 'ArrowDown' ? tabs[(i + 1) % tabs.length] : e.key === 'ArrowUp' ? tabs[(i - 1 + tabs.length) % tabs.length]
    : e.key === 'Home' ? tabs[0] : e.key === 'End' ? tabs[tabs.length - 1] : undefined;
  if (next) { e.preventDefault(); next.focus(); }
}

/** Nav tab (28px). `tone="accent"` = blue "Upgrade plan". ↑/↓/Home/End move between the nav's tabs. */
export const SettingsNavItem = forwardRef<HTMLButtonElement, SettingsNavItemProps>(function SettingsNavItem(
  { icon, selected, badge, tone = 'default', className, children, onKeyDown, ...props }, ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={!!selected}
      onKeyDown={(e) => { onKeyDown?.(e); if (!e.defaultPrevented) moveTabFocus(e); }}
      className={cn(
        'flex h-7 w-full cursor-pointer items-center justify-between gap-1.5 rounded-n-md px-1.5 py-1 text-left text-[14px] leading-[16.8px]',
        'transition-[background] duration-[20ms] hover:bg-n-button-hover-bg-a',
        selected && 'bg-n-bg-interactive-translucent-a hover:bg-n-bg-interactive-translucent-a',
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap">
        {icon !== undefined && (
          <span className={cn('flex size-6 shrink-0 items-center justify-center', tone === 'accent' ? 'text-n-blue-icon-accent-primary' : selected ? 'text-n-icon-primary' : 'text-n-icon-secondary')}>
            {typeof icon === 'string' ? <Icon name={icon} size={20} /> : icon}
          </span>
        )}
        <span className={cn('truncate font-medium leading-5', tone === 'accent' ? 'text-n-blue-text-primary' : selected ? 'text-n-text-primary' : 'text-n-text-accent-primary')}>{children}</span>
      </span>
      {badge}
    </button>
  );
});

/** Small 18px pill ("New" blue / "Beta" gray): pad 2 4, radius 4, 11/14.3 500. */
export function SettingsBadge({ tone = 'gray', children }: { tone?: 'gray' | 'blue'; children: ReactNode }) {
  return (
    <Badge tone={tone === 'blue' ? 'accent' : 'neutral'}>{children}</Badge>
  );
}

export interface SettingsPageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
}
/** Content column (800 max, gap 44): header with 26/32 600 title + description, then sections. */
export function SettingsPage({ title, description, className, children, ...props }: SettingsPageProps) {
  return (
    <div className={cn('flex w-full max-w-[800px] flex-col gap-11', className)} {...props}>
      <header className="flex flex-col gap-2">
        <h2 className="m-0 text-[22px] font-semibold leading-7 sm:text-[26px] sm:leading-8">{title}</h2>
        {description && <div className="text-[16px] leading-6">{description}</div>}
      </header>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

/** Section: heading row with hairline (pb 12, mb 16), rows gap 24; following sections get 48 top padding. */
export function SettingsSection({ title, className, children, ...props }: { title: ReactNode } & Omit<HTMLAttributes<HTMLElement>, 'title'>) {
  return (
    <section className={cn('[&+&]:pt-12', className)} {...props}>
      <div className="mb-4 border-b border-n-bg-tertiary-translucent-a pb-3 text-[16px] font-medium leading-6">{title}</div>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

export interface SettingsRowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  label: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  /** Right-aligned control. */
  control?: ReactNode;
}
/**
 * Row: label 14/20 500 (+badge) over a 13/18 secondary description; control right-aligned. The control
 * is named by the label and described by the description (unless it already has its own label).
 */
export function SettingsRow({ label, description, badge, control, className, ...props }: SettingsRowProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const descId = `${id}-desc`;
  let ctl = control;
  if (isValidElement<{ 'aria-label'?: string; 'aria-labelledby'?: string; 'aria-describedby'?: string }>(control)
    && !control.props['aria-label'] && !control.props['aria-labelledby']) {
    ctl = cloneElement(control, { 'aria-labelledby': labelId, 'aria-describedby': description ? descId : undefined });
  }
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)} {...props}>
      <div className="flex min-w-0 flex-1 basis-[200px] flex-col items-start gap-1 sm:max-w-[75%]">
        <div className="flex items-center gap-1.5 text-[14px] font-medium leading-5"><span id={labelId}>{label}</span>{badge}</div>
        {description && <div id={descId} className="text-[13px] leading-[18px] text-n-text-secondary">{description}</div>}
      </div>
      {ctl && <div className="flex flex-col items-end">{ctl}</div>}
    </div>
  );
}

/** Outline select button used as a row control (28px, pad 0 8, 1px border-primary-translucent, radius 6, chevron). */
export const SettingsSelect = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function SettingsSelect({ className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex h-7 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-n-md border border-n-border-primary-translucent-a px-2',
        'text-[14px] leading-[16.8px] hover:bg-n-button-hover-bg-a data-[state=open]:bg-n-button-hover-bg-a',
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      <Icon name="arrowChevronSingleDownSmall" size={14} className="text-n-icon-secondary" />
    </button>
  );
});

/** Settings row toggle = the atoms Switch (30x18). */
export { Switch as SettingsSwitch } from '../atoms/Switch';
