import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Tabs as T } from 'radix-ui';
import { cn } from '../lib/cn';
import { Icon, type IconName } from '../icons/Icon';
import { Avatar } from '../atoms/Avatar';
import { Button } from '../atoms/Button';
import { Tabs } from './Tabs';

/**
 * Share panel: 456px (never wider than the viewport minus 16px), radius 12 popover.
 * - header: underline tabs "Share | Publish" (500, text-tertiary inactive, full underline; list padding 0 8 0 12) +
 *   "Learn about sharing" (32px, padding 4 12 4 8, questionMarkCircleSmall, text-secondary); 1px bottom line, 16px gap below
 * - invite: padding 0 16 8; 32px email field (blue focus ring) + 32px primary "Share" (padding 0 12, ml 8)
 * - people: 32px user avatar, gap 10, name 14/20 (+ "(You)" text-tertiary), email 12/16 text-secondary; "Full access ⌄" right
 * - general access: padding 12 8 8; label 12/16 500 text-secondary (padding 0 8 4); row padding 8:
 *   32px square (radius 6, bg-tertiary-translucent) with lockFill 18, "Only people invited ⌄"
 * - footer: 1px top line; "Advanced" (gear) left, outlined "Copy link" (link icon) right
 * - optional blue banner: blue-bg-secondary, radius 8, blue text, × close
 */
export interface SharePerson { name: string; email?: string; you?: boolean; access?: string; avatar?: string }

export interface SharePopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'dir'> {
  people?: SharePerson[];
  generalAccess?: { label: ReactNode; icon?: IconName };
  /** Blue info banner at the bottom (e.g. "Control agent access in Advanced"). */
  banner?: ReactNode;
  onInvite?: (emails: string) => void;
  onCopyLink?: () => void;
  publishContent?: ReactNode;
  /** Target of the "Learn about sharing" link (hidden when not set). */
  helpHref?: string;
  /** Called from a person's access button ("Full access ⌄"). */
  onPersonAccess?: (person: SharePerson) => void;
  /** Called from the general access button ("Only people invited ⌄"). */
  onGeneralAccess?: () => void;
  /** Called from the "Advanced" button (hidden when not set). */
  onAdvanced?: () => void;
  /** Focus the invite field on mount (shows the blue ring). */
  autoFocus?: boolean;
}

/** Share panel (invite by email, people with access, general access, copy link) to put inside a Popover. */
export const SharePopover = forwardRef<HTMLDivElement, SharePopoverProps>(function SharePopover(
  { people = [], generalAccess = { label: 'Only people invited', icon: 'lockFill' }, banner, onInvite, onCopyLink, publishContent, helpHref, onPersonAccess, onGeneralAccess, onAdvanced, autoFocus, className, ...props }, ref,
) {
  const [emails, setEmails] = useState('');
  const [showBanner, setShowBanner] = useState(true);
  return (
    <T.Root ref={ref} defaultValue="share" className={cn('flex w-[456px] max-w-[calc(100vw-16px)] flex-col', className)} {...props}>
      <div className="mb-4 flex items-center justify-between shadow-[inset_0_-1px_0_var(--n-bg-tertiary-translucent-a)]">
        <Tabs.List className="pl-3 shadow-none">
          <Tabs.Trigger value="share">Share</Tabs.Trigger>
          <Tabs.Trigger value="publish">Publish</Tabs.Trigger>
        </Tabs.List>
        {helpHref && (
          <a href={helpHref} target="_blank" rel="noreferrer"
            className="mr-1 flex h-8 shrink-0 items-center rounded-n-md py-1 pl-2 pr-3 text-[14px] leading-5 text-n-text-secondary outline-none hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow">
            <Icon name="questionMarkCircleSmall" size={16} className="mr-1.5 text-n-icon-secondary" />
            <span className="max-sm:sr-only">Learn about sharing</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>

      <T.Content value="share" className="flex flex-col outline-none">
        <form className="flex px-4 pb-2" onSubmit={(e) => { e.preventDefault(); onInvite?.(emails); }}>
          <input
            type="text"
            aria-label="Invite people by email"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            autoFocus={autoFocus}
            placeholder="Email or group, separated by commas"
            className="h-8 min-w-0 flex-1 rounded-n-md bg-n-bg-secondary-translucent-a px-2.5 text-[14px] text-n-text-primary outline-none shadow-[inset_0_0_0_1px_var(--n-border-primary-translucent-a)] placeholder:text-n-text-tertiary focus:shadow-n-input-blue-focus-ring"
          />
          <Button type="submit" variant="primary" size="lg" className="ml-2 px-3">Share</Button>
        </form>
        <div className="flex flex-col px-2">
          {people.map((p) => (
            <div key={p.email ?? p.name} className="flex items-center rounded-n-md p-2">
              <Avatar name={p.name} src={p.avatar} size={32} shape="user" className="mr-2.5" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="truncate text-[14px] leading-5 text-n-text-primary">{p.name}{p.you && <span className="text-n-text-secondary"> (You)</span>}</div>
                {p.email && <div className="truncate text-[12px] leading-4 text-n-text-secondary">{p.email}</div>}
              </div>
              <button type="button" aria-label={`${p.access ?? 'Full access'}, change access for ${p.name}`} onClick={() => onPersonAccess?.(p)}
                className="flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-n-md px-2 text-[14px] text-n-text-secondary outline-none hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow">
                {p.access ?? 'Full access'}<Icon name="arrowChevronSingleDownSmall" size={16} className="text-n-icon-tertiary" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-col px-2 pb-2 pt-3">
          <div className="px-2 pb-1 text-[12px] font-medium leading-4 text-n-text-secondary">General access</div>
          <div className="flex items-center p-2">
            <span className="mr-2.5 flex size-8 items-center justify-center rounded-n-md bg-n-bg-tertiary-translucent-a text-n-icon-secondary">
              <Icon name={generalAccess.icon ?? 'lockFill'} size={18} />
            </span>
            <button type="button" onClick={onGeneralAccess}
              className="-ml-1.5 flex h-7 min-w-0 cursor-pointer items-center gap-1 rounded-n-md px-1.5 text-[14px] text-n-text-primary outline-none hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow">
              {generalAccess.label}<Icon name="arrowChevronSingleDownSmall" size={16} className="text-n-icon-tertiary" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3 shadow-[inset_0_1px_0_var(--n-bg-tertiary-translucent-a)]">
          {onAdvanced ? (
            <button type="button" onClick={onAdvanced} className="-ml-2 flex h-8 cursor-pointer items-center gap-2 rounded-n-md px-2 text-[14px] text-n-text-primary outline-none hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow">
              <Icon name="gear" size={20} className="text-n-icon-secondary" />Advanced
            </button>
          ) : <span />}
          <Button variant="secondary" size="lg" icon="link" className="font-medium" onClick={onCopyLink}>Copy link</Button>
        </div>
        {banner && showBanner && (
          <div className="mx-3 mb-3 flex items-center justify-between rounded-n-lg bg-n-blue-bg-secondary px-3 py-3 text-[14px] leading-5 text-n-blue-text-secondary">
            <span>{banner}</span>
            <button type="button" aria-label="Dismiss" className="flex size-6 cursor-pointer items-center justify-center rounded-n-sm text-n-blue-icon-secondary hover:bg-n-button-hover-bg-a" onClick={() => setShowBanner(false)}>
              <Icon name="xMarkSmall" size={16} />
            </button>
          </div>
        )}
      </T.Content>
      <T.Content value="publish" className="flex flex-col items-center gap-3 px-4 pb-4 text-center outline-none">
        {publishContent ?? (
          <>
            <Icon name="globe" size={32} className="text-n-icon-secondary" />
            <div className="text-[14px] font-medium text-n-text-primary">Publish to web</div>
            <div className="text-[12px] leading-4 text-n-text-secondary">Create a website from this page.</div>
            <Button variant="primary" size="lg" full>Publish</Button>
          </>
        )}
      </T.Content>
    </T.Root>
  );
});
