import { forwardRef, useCallback, useState, type ComponentPropsWithoutRef, type KeyboardEvent, type ReactNode } from 'react';
import { Popover } from 'radix-ui';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';
import { MenuRow, MenuSeparator, MenuSurface, type MenuRowProps } from '../components/Menu';

/**
 * Database menu search field. Measured (db-filter-menu, db-new-view-menu): 28px, padding 3 6, radius 6,
 * bg-secondary-translucent-a, 1px border-primary-translucent-a ring (blue focus ring when focused),
 * placed 12px from the surface edges.
 */
export const DbMenuSearch = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'> & { wrapperClassName?: string }>(function DbMenuSearch({ className, wrapperClassName, ...props }, ref) {
  return (
    <div className={cn('px-3 pb-2 pt-3', wrapperClassName)}>
      <input
        ref={ref}
        type="search"
        aria-label={props['aria-label'] ?? (typeof props.placeholder === 'string' ? props.placeholder.replace(/…$/, '') : 'Search')}
        className={cn(
          'h-7 w-full rounded-n-md bg-n-bg-secondary-translucent-a px-1.5 text-[14px] leading-5 text-n-text-primary outline-none',
          'shadow-[0_0_0_1px_var(--n-border-primary-translucent-a)] placeholder:text-n-text-tertiary focus:shadow-n-input-blue-focus-ring',
          className,
        )}
        {...props}
      />
    </div>
  );
});

/** Inset rule between menu sections (db menus: 12px inset, border-secondary/bg-tertiary translucent). */
export function DbMenuRule({ className }: { className?: string }) {
  return <MenuSeparator className={cn('mx-3 my-0 bg-n-border-secondary-translucent-a', className)} />;
}

/**
 * Arrow-key navigation for static menu surfaces: ArrowUp/Down move focus across `[data-menu-item]`
 * descendants, Enter/Space click. Attach the returned handler to the surface's onKeyDown.
 */
export function useMenuKeys() {
  return useCallback((e: KeyboardEvent<HTMLElement>) => {
    // A focused row (MenuRow with tabIndex) already activates itself on Enter / Space and marks the event handled.
    if (e.defaultPrevented) return;
    if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) return;
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[data-menu-item]'));
    if (!items.length) return;
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Enter' || e.key === ' ') {
      if (i >= 0) { e.preventDefault(); items[i].click(); }
      return;
    }
    e.preventDefault();
    const next = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
    items[next].focus();
  }, []);
}

/** MenuRow made focusable for `useMenuKeys` (focus = highlighted look). */
export const DbMenuItem = forwardRef<HTMLDivElement, MenuRowProps>(function DbMenuItem({ className, ...props }, ref) {
  // Database menus mix search fields, lists and actions, so rows are buttons (toggles: switches) inside `group` lists,
  // reachable with ↑/↓ (useMenuKeys) and activated with Enter / Space.
  return (
    <MenuRow
      ref={ref}
      data-menu-item=""
      tabIndex={-1}
      role={props.toggle !== undefined ? 'switch' : 'button'}
      aria-selected={undefined}
      className={cn('focus:bg-n-button-hover-bg-a focus-visible:shadow-none', className)}
      {...props}
    />
  );
});

export interface SubmenuRowProps extends Omit<MenuRowProps, 'submenu' | 'content'> {
  content: ReactNode | ((close: () => void) => ReactNode);
  /** Value shown before the chevron (view settings: "Table", "5"). */
  value?: ReactNode;
  width?: number;
}

/** A menu row that opens a flyout to its right (submenus: "Sort ›", "Layout  Table ›"). */
export function SubmenuRow({ content, value, width = 240, children, ...rowProps }: SubmenuRowProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <DbMenuItem
          {...rowProps}
          data-state={open ? 'open' : 'closed'}
          className={cn('data-[state=open]:bg-n-button-hover-bg-a', rowProps.className)}
          trailing={
            <span className="flex items-center text-n-text-secondary">
              {value !== undefined && <span className="text-[14px]">{value}</span>}
              <Icon name="arrowChevronSingleRightSmall" size={16} className="ml-1.5 text-n-icon-tertiary" />
            </span>
          }
        >
          {children}
        </DbMenuItem>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content aria-label={typeof children === 'string' ? children : undefined} side="right" align="start" sideOffset={6} alignOffset={-4} collisionPadding={8} className="motion-floating z-50 outline-none">
          <MenuSurface width={width}>{typeof content === 'function' ? content(() => setOpen(false)) : content}</MenuSurface>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
