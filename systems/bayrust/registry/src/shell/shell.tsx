'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon, type IconName } from '../foundations/icon';
import { IconButton } from '../actions/actions';
import { useControllable } from '../lib/use-controllable';

export interface AppFrameProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  sidebar?: ReactNode;
  topbar?: ReactNode;
  sidebarOpen?: boolean;
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
}

/**
 * Sidebar, top bar and content.
 *
 * On a wide screen the sidebar is docked and `sidebarOpen` collapses it. Below `md` there is no
 * room to dock anything, so the same state opens it as a drawer over the content, closed by
 * default — one prop, two behaviours, which is what stops an app needing its own breakpoint logic.
 */
export function AppFrame({
  children, sidebar, topbar, sidebarOpen, defaultSidebarOpen = true, onSidebarOpenChange, className, ...rest
}: AppFrameProps) {
  const [open, setOpen] = useControllable<boolean>(sidebarOpen, defaultSidebarOpen, onSidebarOpenChange);
  return (
    <div className={cn('bay-frame', className)} data-sidebar-open={open ? '' : undefined} {...rest}>
      {sidebar && (
        <>
          <div className="bay-frame__sidebar">{sidebar}</div>
          {/* only reachable on small screens, where the sidebar covers the content */}
          <button type="button" className="bay-frame__scrim" aria-label="Close navigation" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} />
        </>
      )}
      <div className="bay-frame__main">
        {topbar && (
          <div className="bay-frame__topbarSlot">
            {sidebar && (
              <span className="bay-frame__toggle">
                <IconButton icon="sidebar" label={open ? 'Hide navigation' : 'Show navigation'} onClick={() => setOpen(!open)} />
              </span>
            )}
            {topbar}
          </div>
        )}
        <main className="bay-frame__content">{children}</main>
      </div>
    </div>
  );
}

type PartProps = HTMLAttributes<HTMLDivElement> & { children?: ReactNode };

/** The sidebar itself. A `nav`, so it is one of the page's landmarks. */
export function SidebarRoot({ children, className, ...rest }: PartProps) {
  return (
    <nav className={cn('bay-sidebar', className)} aria-label="Main" {...rest}>
      {children}
    </nav>
  );
}

/** The top of the sidebar: the product, the workspace switcher. */
export function SidebarHeader({ children, className, ...rest }: PartProps) {
  return (
    <div className={cn('bay-sidebar__header', className)} {...rest}>
      {children}
    </div>
  );
}

// same clash as EmptyState: the DOM's `title` is a string tooltip, the contract's is the heading
export interface SidebarSectionProps extends Omit<PartProps, 'title'> {
  title?: ReactNode;
}

/** A group of items, optionally titled. The title names the group for assistive tech too. */
export function SidebarSection({ title, children, className, ...rest }: SidebarSectionProps) {
  return (
    <div className={cn('bay-sidebar__section', className)} {...rest}>
      {title && <div className="bay-sidebar__sectionTitle">{title}</div>}
      <ul className="bay-sidebar__items">{children}</ul>
    </div>
  );
}

export interface SidebarItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'onClick'> {
  children?: ReactNode;
  icon?: IconName;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  trailing?: ReactNode;
}

/** One destination. Renders a link when given `href`, a button otherwise. */
export function SidebarItem({ children, icon, active, href, onClick, trailing, className, ...rest }: SidebarItemProps) {
  const inner = (
    <>
      {icon && <Icon name={icon} size={14} className="bay-sidebar__icon" />}
      <span className="bay-sidebar__label">{children}</span>
      {trailing && <span className="bay-sidebar__trailing">{trailing}</span>}
    </>
  );
  return (
    <li className={cn('bay-sidebar__item', className)} {...rest}>
      {href ? (
        <a className="bay-sidebar__link" href={href} aria-current={active ? 'page' : undefined} data-active={active ? '' : undefined} onClick={onClick}>
          {inner}
        </a>
      ) : (
        <button type="button" className="bay-sidebar__link" aria-current={active ? 'page' : undefined} data-active={active ? '' : undefined} onClick={onClick}>
          {inner}
        </button>
      )}
    </li>
  );
}

/**
 * The bottom of the sidebar: the account, settings.
 *
 * The children are wrapped in a list, because a `SidebarItem` is an `<li>` and an `<li>` outside a
 * list is not a list item to anything reading the page.
 */
export function SidebarFooter({ children, className, ...rest }: PartProps) {
  return (
    <div className={cn('bay-sidebar__footer', className)} {...rest}>
      <ul className="bay-sidebar__items">{children}</ul>
    </div>
  );
}

export const Sidebar = { Root: SidebarRoot, Header: SidebarHeader, Section: SidebarSection, Item: SidebarItem, Footer: SidebarFooter };

export interface TopbarProps extends HTMLAttributes<HTMLDivElement> {
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
}

/** The bar across the top: where you are on the left, what you can do on the right. */
export function Topbar({ breadcrumbs, actions, className, ...rest }: TopbarProps) {
  return (
    <header className={cn('bay-topbar', className)} {...rest}>
      <div className="bay-topbar__where">{breadcrumbs}</div>
      {actions && <div className="bay-topbar__actions">{actions}</div>}
    </header>
  );
}

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

/** The page's own title block. Renders an h1, so each page has exactly one. */
export function PageHeader({ title, description, actions, className, ...rest }: PageHeaderProps) {
  return (
    <div className={cn('bay-pageheader', className)} {...rest}>
      <div className="bay-pageheader__text">
        <h1 className="bay-pageheader__title">{title}</h1>
        {description && <p className="bay-pageheader__description">{description}</p>}
      </div>
      {actions && <div className="bay-pageheader__actions">{actions}</div>}
    </div>
  );
}
