'use client';

import {
  createContext,
  useContext,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn';
import { Icon, type IconName } from '../foundations/icon';
import { mergeIntoChild } from '../lib/slot';
import { useControllable } from '../lib/use-controllable';
import { Portal, useAnchored, useDismiss, type Align, type Side } from '../lib/overlay';

interface MenuCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}
const MenuContext = createContext<MenuCtx | null>(null);
const RadioCtx = createContext<{ value?: string; onValueChange?: (v: string) => void } | null>(null);

function useMenu(part: string): MenuCtx {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error(`<Menu.${part}> must be inside <Menu.Root>.`);
  return ctx;
}

export interface MenuRootProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** A dropdown menu of actions. */
export function MenuRoot({ children, open, defaultOpen, onOpenChange }: MenuRootProps) {
  const [isOpen, setOpen] = useControllable<boolean>(open, defaultOpen ?? false, onOpenChange);
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  return <MenuContext.Provider value={{ open: isOpen, setOpen, triggerRef, contentRef }}>{children}</MenuContext.Provider>;
}

export interface MenuTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  asChild?: boolean;
}

/** What opens the menu. Down-arrow opens it too, as the menu-button pattern expects. */
export function MenuTrigger({ children, asChild, className, ...rest }: MenuTriggerProps) {
  const ctx = useMenu('Trigger');
  const props = {
    ref: ctx.triggerRef as React.Ref<HTMLButtonElement>,
    'aria-haspopup': 'menu' as const,
    'aria-expanded': ctx.open,
    onClick: () => ctx.setOpen(!ctx.open),
    onKeyDown: (e: ReactKeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ctx.setOpen(true);
      }
    },
    className: cn('bay-menu__trigger', className),
    ...rest,
  };
  if (asChild) return mergeIntoChild(children, props as Record<string, unknown>);
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

export interface MenuContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  align?: Align;
  side?: Side;
}

/**
 * The panel. Arrow keys move between items, Home/End jump, Escape closes and returns focus to the
 * trigger. Focus moves item to item rather than by tab stop, which is what a menu does.
 */
export function MenuContent({ children, align = 'start', side = 'bottom', className, ...rest }: MenuContentProps) {
  const ctx = useMenu('Content');
  const pos = useAnchored(ctx.open, ctx.triggerRef, ctx.contentRef, side, align);
  useDismiss(ctx.open, () => {
    ctx.setOpen(false);
    ctx.triggerRef.current?.focus();
  }, [ctx.contentRef, ctx.triggerRef]);

  if (!ctx.open) return null;

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = [...(ctx.contentRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([data-disabled])') ?? [])];
    if (!items.length) return;
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
    if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
  };

  return (
    <Portal>
      <div
        ref={ctx.contentRef}
        role="menu"
        tabIndex={-1}
        className={cn('bay-menu', className)}
        style={pos ? { top: pos.top, left: pos.left } : { opacity: 0 }}
        onKeyDown={onKeyDown}
        {...rest}
      >
        {children}
      </div>
    </Portal>
  );
}

// the DOM's own `onSelect` is a React event handler for text selection; a menu item's is the
// native event it was chosen with, so the DOM one is dropped rather than the contract narrowed
type ItemProps = Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
  children?: ReactNode;
  disabled?: boolean;
  onSelect?: (event: Event) => void;
};

function useSelect(disabled: boolean | undefined, onSelect: ((e: Event) => void) | undefined, close = true) {
  const ctx = useMenu('Item');
  return (e: React.SyntheticEvent) => {
    if (disabled) return;
    onSelect?.(e.nativeEvent);
    if (close) {
      ctx.setOpen(false);
      ctx.triggerRef.current?.focus();
    }
  };
}

export interface MenuItemProps extends ItemProps {
  icon?: IconName;
  shortcut?: ReactNode;
  destructive?: boolean;
}

/** One action. */
export function MenuItem({ children, icon, shortcut, destructive, disabled, onSelect, className, ...rest }: MenuItemProps) {
  const select = useSelect(disabled, onSelect);
  return (
    <div
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled}
      data-disabled={disabled ? '' : undefined}
      data-destructive={destructive ? '' : undefined}
      className={cn('bay-menu__item', className)}
      onClick={select}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(e); } }}
      {...rest}
    >
      {icon && <Icon name={icon} size={14} className="bay-menu__icon" />}
      <span className="bay-menu__label">{children}</span>
      {shortcut && <span className="bay-menu__shortcut">{shortcut}</span>}
    </div>
  );
}

export interface MenuCheckboxItemProps extends ItemProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/** An item that toggles. Stays open, since toggling several in a row is the point. */
export function MenuCheckboxItem({ children, checked, onCheckedChange, disabled, onSelect, className, ...rest }: MenuCheckboxItemProps) {
  const select = useSelect(disabled, (e) => { onSelect?.(e); onCheckedChange?.(!checked); }, false);
  return (
    <div
      role="menuitemcheckbox"
      tabIndex={-1}
      aria-checked={Boolean(checked)}
      aria-disabled={disabled}
      data-disabled={disabled ? '' : undefined}
      className={cn('bay-menu__item', className)}
      onClick={select}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(e); } }}
      {...rest}
    >
      <span className="bay-menu__icon">{checked && <Icon name="check" size={14} />}</span>
      <span className="bay-menu__label">{children}</span>
    </div>
  );
}

/** Groups radio items so exactly one of them is chosen. */
export function MenuRadioGroup({ children, value, onValueChange }: { children?: ReactNode; value?: string; onValueChange?: (v: string) => void }) {
  return <RadioCtx.Provider value={{ value, onValueChange }}>{children}</RadioCtx.Provider>;
}

export interface MenuRadioItemProps extends ItemProps {
  value: string;
}

/** One of a set of exclusive options. */
export function MenuRadioItem({ children, value, disabled, onSelect, className, ...rest }: MenuRadioItemProps) {
  const group = useContext(RadioCtx);
  const checked = group?.value === value;
  const select = useSelect(disabled, (e) => { onSelect?.(e); group?.onValueChange?.(value); });
  return (
    <div
      role="menuitemradio"
      tabIndex={-1}
      aria-checked={checked}
      aria-disabled={disabled}
      data-disabled={disabled ? '' : undefined}
      className={cn('bay-menu__item', className)}
      onClick={select}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(e); } }}
      {...rest}
    >
      <span className="bay-menu__icon">{checked && <Icon name="check" size={14} />}</span>
      <span className="bay-menu__label">{children}</span>
    </div>
  );
}

/** A heading over a group of items. */
export function MenuLabel({ children, className, ...rest }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div className={cn('bay-menu__sectionLabel', className)} {...rest}>
      {children}
    </div>
  );
}

/** A rule between groups. */
export function MenuSeparator({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className={cn('bay-menu__separator', className)} {...rest} />;
}

/** A group of related items, named by a `Menu.Label`. */
export function MenuGroup({ children, className, ...rest }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div role="group" className={cn('bay-menu__group', className)} {...rest}>
      {children}
    </div>
  );
}

/* Submenus reuse the same machinery: a Root with its own open state, nested inside the parent. */
export function MenuSub({ children, open, defaultOpen, onOpenChange }: MenuRootProps) {
  return <MenuRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>{children}</MenuRoot>;
}

/** The item that opens a submenu. Right-arrow opens it, as the pattern expects. */
export function MenuSubTrigger({ children, icon, className, ...rest }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode; icon?: IconName }) {
  const ctx = useMenu('SubTrigger');
  return (
    <div
      ref={ctx.triggerRef as React.Ref<HTMLDivElement>}
      role="menuitem"
      tabIndex={-1}
      aria-haspopup="menu"
      aria-expanded={ctx.open}
      className={cn('bay-menu__item', className)}
      onClick={() => ctx.setOpen(!ctx.open)}
      onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); ctx.setOpen(true); } }}
      {...rest}
    >
      {icon && <Icon name={icon} size={14} className="bay-menu__icon" />}
      <span className="bay-menu__label">{children}</span>
      <Icon name="chevronRight" size={12} className="bay-menu__shortcut" />
    </div>
  );
}

/** A submenu's panel, opening to the side of its trigger. */
export function MenuSubContent({ children, className, ...rest }: MenuContentProps) {
  return (
    <MenuContent side="right" align="start" className={cn('bay-menu--sub', className)} {...rest}>
      {children}
    </MenuContent>
  );
}

/** Menu as an object of parts. The flat aliases above work from React Server Components. */
export const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Label: MenuLabel,
  Separator: MenuSeparator,
  Group: MenuGroup,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
};
