import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes, type ReactNode } from 'react';
import { ContextMenu as CM, DropdownMenu } from 'radix-ui';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';
import { Icon, type IconName } from '../icons/Icon';
import { switchVariants } from '../atoms/Switch';
import { Badge } from '../atoms/Badge';

/**
 * Menu: the surface used by dropdown menus, context menus, block menus, property menus, view menus,
 * the slash menu and pickers.
 * - surface: radius 10, popover background, outline-lg shadow, overflow hidden
 * - section: padding 4, gap 1; sections after the first get margin-top 1 and a 1px
 *   translucent line inset 12px from the surface edges (that is the separator)
 * - row:     28px tall, radius 6, padding 0 8, gap 8, icon 20 (icon-primary), 14/16.8 text-primary
 * - value:   right side text-tertiary; chevron 16 icon-secondary
 * - toggle:  the atoms Switch look (30x18 track)
 * - shortcut: 12px text-tertiary, right aligned; section label: 12/14.4 500 text-secondary
 * - search:  28px field, padding 3 6, translucent background, radius 6, 1px ring, blue focus ring
 * - footer:  12/16 text-tertiary lines, 4px vertical margins, padding 4 12
 */
export const menuStyles = tv({
  slots: {
    surface: 'relative min-w-[180px] max-w-[calc(100vw-16px)] overflow-hidden rounded-n-xl bg-n-popover-bg shadow-n-shadow-outline-lg outline-none',
    list: 'relative flex flex-col gap-px p-1',
    row: [
      'group/row relative flex h-7 w-full shrink-0 cursor-pointer select-none items-center gap-2 rounded-n-md px-2 text-left',
      'text-[14px] leading-[16.8px] text-n-text-primary outline-none',
      'data-[highlighted]:bg-n-button-hover-bg-a hover:bg-n-button-hover-bg-a data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
      'focus-visible:shadow-n-focus-shadow',
    ],
    rowIcon: 'flex size-5 shrink-0 items-center justify-center text-n-icon-primary',
    rowLabel: 'min-w-0 flex-1 truncate',
    rowValue: 'mr-[5px] shrink-0 truncate text-n-text-secondary', // secondary, not tertiary: tertiary misses 4.5:1 on the dark popover background
    rowShortcut: 'ml-auto shrink-0 pl-2 text-[12px] leading-[16.8px] text-n-text-secondary',
    rowTrailing: 'ml-auto flex shrink-0 items-center text-n-icon-secondary',
    label: 'mx-0 mb-2 mt-1.5 flex px-2 text-[12px] font-medium leading-[14.4px] text-n-text-secondary',
    // Inside a list: inset 12 from surface (4 list padding + 8) and 3px margins (+1px gaps) = the 9px gap.
    // Between lists (top level): full 12px inset, no margin (lists bring their 4px padding).
    separator: 'mx-3 h-px shrink-0 bg-n-bg-tertiary-translucent-a in-data-[slot=menu-list]:mx-2 in-data-[slot=menu-list]:my-[3px]',
    sectionLine: 'mt-px before:pointer-events-none before:absolute before:inset-x-3 before:-top-px before:h-px before:bg-n-bg-tertiary-translucent-a',
    footer: 'relative px-3 py-1 text-[12px] leading-4 text-n-text-secondary [&>div]:my-1',
  },
  variants: {
    tone: {
      default: {},
      danger: { row: 'hover:text-n-red-text-secondary data-[highlighted]:text-n-red-text-secondary', rowIcon: 'group-hover/row:text-n-red-icon-secondary group-data-[highlighted]/row:text-n-red-icon-secondary' },
      accent: { row: 'text-n-blue-icon-accent-primary', rowIcon: 'text-n-blue-icon-accent-primary' },
      muted: { row: 'text-n-text-secondary', rowIcon: 'text-n-icon-secondary' },
    },
  },
});

const s = menuStyles();
const sw = switchVariants();

/* ---------- switch (toggle rows) ---------- */

export interface MenuSwitchProps { checked?: boolean; className?: string }
/**
 * The switch drawn at the right of toggle rows ("Available offline", "Lock page"). Purely visual: the whole
 * row is the control (role menuitemcheckbox, or option with aria-checked), so this has no role and is hidden from assistive tech.
 */
export function MenuSwitch({ checked, className }: MenuSwitchProps) {
  const state = checked ? 'checked' : 'unchecked';
  return (
    <span aria-hidden="true" data-state={state} className={sw.root({ className: cn('pointer-events-none', className) })}>
      <span data-state={state} className={sw.thumb()} />
    </span>
  );
}

/* ---------- row content (shared by static rows and Radix items) ---------- */

export interface MenuRowContentProps {
  /** Leading icon: an icon name, or any node (emoji, avatar, swatch). */
  icon?: ReactNode;
  children?: ReactNode;
  /** Right-side secondary value before the chevron (e.g. "Comments" on "Notify me", "Full date"). */
  description?: ReactNode;
  /** Small secondary line under the label (two-line rows). */
  caption?: ReactNode;
  /** Keyboard shortcut hint at the right ("⌘D"). */
  shortcut?: ReactNode;
  /** Show a submenu chevron. */
  submenu?: boolean;
  /** Checkmark at the end (selected option). */
  checked?: boolean;
  /** Render a switch on the right (toggle rows); value = on/off. */
  toggle?: boolean;
  /** Any node at the far right (badge, count). */
  trailing?: ReactNode;
}

function RowContent({ icon, children, description, caption, shortcut, submenu, checked, toggle, trailing }: MenuRowContentProps) {
  return (
    <>
      {icon !== undefined && icon !== null && icon !== false && (
        <span className={s.rowIcon()}>{typeof icon === 'string' ? <Icon name={icon as IconName} size={20} /> : icon}</span>
      )}
      {caption ? (
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate">{children}</span>
          <span className="truncate text-[12px] leading-4 text-n-text-secondary">{caption}</span>
        </span>
      ) : (
        <span className={s.rowLabel()}>{children}</span>
      )}
      {description && <span className={s.rowValue()}>{description}</span>}
      {shortcut && <span className={s.rowShortcut()}>{shortcut}</span>}
      {checked && <span className={s.rowTrailing()}><Icon name="checkmarkSmall" size={16} className="text-n-icon-primary" /></span>}
      {submenu && <span className={s.rowTrailing()}><Icon name="arrowChevronSingleRightSmall" size={16} /></span>}
      {toggle !== undefined && <MenuSwitch checked={toggle} />}
      {trailing && <span className={s.rowTrailing()}>{trailing}</span>}
    </>
  );
}

/* ---------- static parts (usable inside any popover, command palette, or docs) ---------- */

export interface MenuSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  /** Fixed width in px (the surface never exceeds the viewport minus 16px). */
  width?: number;
}
/** The floating menu card on its own (no positioning or behavior): for custom pickers and static renders. */
export const MenuSurface = forwardRef<HTMLDivElement, MenuSurfaceProps>(function MenuSurface({ className, width, style, ...props }, ref) {
  return <div ref={ref} className={cn(s.surface(), className)} style={{ width, ...style }} {...props} />;
});

export interface MenuRowProps extends MenuRowContentProps, Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onToggle'> {
  tone?: 'default' | 'danger' | 'accent' | 'muted';
  /** Force the highlighted look (keyboard-selected row in static menus). */
  highlighted?: boolean;
  /** Called with the new value when a `toggle` row is clicked. */
  onToggle?: (next: boolean) => void;
}
/**
 * A menu row outside Radix (static lists, pickers built on MenuList): role `option`. A `toggle` row is an
 * option with `aria-checked` (on/off), so it stays a valid child of the MenuList listbox. Pass `tabIndex={0}`
 * to make an actionable row reachable with Tab; Enter and Space then activate it.
 */
export const MenuRow = forwardRef<HTMLDivElement, MenuRowProps>(function MenuRow(
  { icon, children, description, caption, shortcut, submenu, checked, toggle, onToggle, trailing, tone, highlighted, className, onClick, onKeyDown, onMouseDown, tabIndex, ...props }, ref,
) {
  return (
    <div
      ref={ref}
      role="option"
      // Without a tabIndex the row is focusable by script only (listbox / aria-activedescendant pattern) and a
      // click keeps focus where it is (e.g. in the search field that drives the list). Pass tabIndex={0} to put
      // an actionable row in the Tab order, or tabIndex={-1} to manage row focus yourself.
      tabIndex={tabIndex ?? -1}
      onMouseDown={(e) => { onMouseDown?.(e); if (tabIndex === undefined && !e.defaultPrevented) e.preventDefault(); }}
      aria-checked={toggle}
      aria-selected={toggle === undefined ? (highlighted ?? checked ?? false) : undefined}
      data-highlighted={highlighted ? '' : undefined}
      className={cn(menuStyles({ tone }).row(), caption ? 'h-auto min-h-7 py-1' : undefined, className)}
      onClick={(e) => { if (toggle !== undefined) onToggle?.(!toggle); onClick?.(e); }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        // When a row is made focusable (tabIndex), Enter / Space activate it like a click.
        if (!e.defaultPrevented && e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.currentTarget.click(); }
      }}
      {...props}
    >
      <RowContent {...{ icon, children, description, caption, shortcut, submenu, checked, toggle, trailing }} />
    </div>
  );
});

export interface MenuListProps extends HTMLAttributes<HTMLDivElement> {
  /** Draw the inset section divider above this list (every section after the first). */
  separator?: boolean;
}
/** A menu section of static rows (role listbox; give it an `aria-label`): padding 4, gap 1. Stack several with `separator`. */
export function MenuList({ className, separator, ...props }: MenuListProps) {
  return <div role="listbox" data-slot="menu-list" className={cn(s.list(), separator && s.sectionLine(), className)} {...props} />;
}
/** Small grey section label for static menus. */
export function MenuLabel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(s.label(), className)} {...props} />;
}
/** Hairline separator for static menus. */
export function MenuSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className={cn(s.separator(), className)} {...props} />;
}

export interface MenuFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Metadata lines ("130 words", "Last edited by …", "Today at 4:55 PM"), each 12/16 with 4px margins. */
  lines?: ReactNode[];
  /** Draw the inset divider above (default true). */
  separator?: boolean;
}
/** Grey metadata footer at the bottom of page/block action menus. */
export function MenuFooter({ className, lines, separator = true, children, ...props }: MenuFooterProps) {
  return (
    <div className={cn(s.footer(), separator && s.sectionLine(), className)} {...props}>
      {lines?.map((l, i) => <div key={i} className="truncate">{l}</div>)}
      {children}
    </div>
  );
}

/** "New" pill used in menu rows: the atoms Badge in the accent tone. */
export function MenuBadge(props: HTMLAttributes<HTMLSpanElement>) {
  return <Badge tone="accent" {...props} />;
}

export interface MenuSearchProps extends ComponentPropsWithoutRef<'input'> {
  /** Hide the leading magnifier. */
  noIcon?: boolean;
  /** Class for the wrapper (padding). */
  wrapperClassName?: string;
}
/** Search field at the top of menus ("Search actions…", "Filter…"). Its accessible name defaults to the placeholder. */
export const MenuSearch = forwardRef<HTMLInputElement, MenuSearchProps>(function MenuSearch({ className, noIcon, wrapperClassName, ...props }, ref) {
  return (
    <div className={cn('px-3 pb-2 pt-3', wrapperClassName)}>
      <SearchField ref={ref} noIcon={noIcon} className={className} {...props} />
    </div>
  );
});

/** The bare menu search input (no wrapper padding): 28px, radius 6, translucent background, blue focus ring. */
export const SearchField = forwardRef<HTMLInputElement, Omit<MenuSearchProps, 'wrapperClassName'>>(function SearchField(
  { className, noIcon, type = 'search', 'aria-label': ariaLabel, ...props }, ref,
) {
  return (
    <label
      className={cn(
        'flex h-7 w-full cursor-text items-center rounded-n-md bg-n-bg-secondary-translucent-a px-1.5 py-[3px] text-[14px] leading-5',
        'shadow-[inset_0_0_0_1px_var(--n-border-primary-translucent-a)] focus-within:shadow-n-input-blue-focus-ring',
        className,
      )}
    >
      {!noIcon && <Icon name="magnifyingGlassSmall" size={16} className="mr-1.5 text-n-icon-secondary" />}
      <input
        ref={ref}
        type={type}
        aria-label={ariaLabel ?? (props['aria-labelledby'] ? undefined : props.placeholder ?? 'Search')}
        className="min-w-0 flex-1 appearance-none bg-transparent text-n-text-primary outline-none placeholder:text-n-text-tertiary focus-visible:shadow-none [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
    </label>
  );
});

/* ---------- interactive parts shared by Menu (DropdownMenu) and ContextMenu ---------- */

type Width = {
  /** Fixed width in px (never wider than the viewport minus 16px). */
  width?: number;
};
type Tone = MenuRowProps['tone'];

/** Radix item primitives; DropdownMenu and ContextMenu expose structurally identical parts. */
type MenuPrimitives = Pick<
  typeof DropdownMenu,
  'Item' | 'CheckboxItem' | 'RadioGroup' | 'RadioItem' | 'ItemIndicator' | 'Label' | 'Separator' | 'Group' | 'SubTrigger' | 'SubContent' | 'Portal'
>;

export type MenuItemProps = Omit<ComponentPropsWithoutRef<typeof DropdownMenu.Item>, 'children'> & MenuRowContentProps & {
  /** Row color: `danger` turns the row red on hover/highlight (destructive actions). */
  tone?: Tone;
  /** Destructive action (delete, remove): same as `tone="danger"`. */
  destructive?: boolean;
};
type IndicatorRowProps = Pick<MenuRowContentProps, 'icon' | 'children' | 'description' | 'caption' | 'shortcut'>;
export type MenuCheckboxItemProps = Omit<ComponentPropsWithoutRef<typeof DropdownMenu.CheckboxItem>, 'children'> & IndicatorRowProps;
export type MenuRadioItemProps = Omit<ComponentPropsWithoutRef<typeof DropdownMenu.RadioItem>, 'children'> & IndicatorRowProps;
export type MenuToggleItemProps = Omit<ComponentPropsWithoutRef<typeof DropdownMenu.CheckboxItem>, 'children'> & Pick<MenuRowContentProps, 'icon' | 'children' | 'description' | 'caption'>;
export type MenuSubTriggerProps = Omit<ComponentPropsWithoutRef<typeof DropdownMenu.SubTrigger>, 'children'> & Pick<MenuRowContentProps, 'icon' | 'children' | 'description' | 'caption'>;
export type MenuSubContentProps = ComponentPropsWithoutRef<typeof DropdownMenu.SubContent> & Width;

function CheckIndicator({ P }: { P: MenuPrimitives }) {
  return (
    <P.ItemIndicator className={s.rowTrailing()}>
      <Icon name="checkmarkSmall" size={16} className="text-n-icon-primary" />
    </P.ItemIndicator>
  );
}

function createItemParts(P: MenuPrimitives) {
  const Item = forwardRef<HTMLDivElement, MenuItemProps>(function Item(
    { icon, children, description, caption, shortcut, submenu, checked, toggle, trailing, tone, destructive, className, ...props }, ref,
  ) {
    return (
      <P.Item ref={ref} className={cn(menuStyles({ tone: destructive ? 'danger' : tone }).row(), caption ? 'h-auto min-h-7 py-1' : undefined, className)} {...props}>
        <RowContent {...{ icon, children, description, caption, shortcut, submenu, checked, toggle, trailing }} />
      </P.Item>
    );
  });

  const CheckboxItem = forwardRef<HTMLDivElement, MenuCheckboxItemProps>(function CheckboxItem(
    { icon, children, description, caption, shortcut, className, ...props }, ref,
  ) {
    return (
      <P.CheckboxItem ref={ref} className={cn(s.row(), caption ? 'h-auto min-h-7 py-1' : undefined, className)} {...props}>
        <RowContent {...{ icon, children, description, caption, shortcut }} />
        <CheckIndicator P={P} />
      </P.CheckboxItem>
    );
  });

  const RadioGroup = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof DropdownMenu.RadioGroup>>(function RadioGroup({ className, ...props }, ref) {
    return <P.RadioGroup ref={ref} className={cn('flex flex-col gap-px', className)} {...props} />;
  });

  const RadioItem = forwardRef<HTMLDivElement, MenuRadioItemProps>(function RadioItem(
    { icon, children, description, caption, shortcut, className, ...props }, ref,
  ) {
    return (
      <P.RadioItem ref={ref} className={cn(s.row(), caption ? 'h-auto min-h-7 py-1' : undefined, className)} {...props}>
        <RowContent {...{ icon, children, description, caption, shortcut }} />
        <CheckIndicator P={P} />
      </P.RadioItem>
    );
  });

  /** Row with a switch on the right ("Available offline", "Lock page"). Keeps the menu open when toggled. */
  const ToggleItem = forwardRef<HTMLDivElement, MenuToggleItemProps>(function ToggleItem(
    { icon, children, description, caption, checked, className, onSelect, ...props }, ref,
  ) {
    return (
      <P.CheckboxItem ref={ref} checked={checked} onSelect={(e) => { e.preventDefault(); onSelect?.(e); }} className={cn(s.row(), caption ? 'h-auto min-h-7 py-1' : undefined, className)} {...props}>
        <RowContent {...{ icon, children, description, caption }} toggle={checked === true} />
      </P.CheckboxItem>
    );
  });

  const Label = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof DropdownMenu.Label>>(function Label({ className, ...p }, ref) {
    return <P.Label ref={ref} className={cn(s.label(), className)} {...p} />;
  });
  const Separator = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof DropdownMenu.Separator>>(function Separator({ className, ...p }, ref) {
    return <P.Separator ref={ref} className={cn(s.separator(), className)} {...p} />;
  });

  const SubTrigger = forwardRef<HTMLDivElement, MenuSubTriggerProps>(function SubTrigger({ icon, children, description, caption, className, ...props }, ref) {
    return (
      <P.SubTrigger ref={ref} className={cn(s.row(), 'data-[state=open]:bg-n-button-hover-bg-a', caption ? 'h-auto min-h-7 py-1' : undefined, className)} {...props}>
        <RowContent icon={icon} description={description} caption={caption} submenu>{children}</RowContent>
      </P.SubTrigger>
    );
  });

  const SubContent = forwardRef<HTMLDivElement, MenuSubContentProps>(function SubContent(
    { className, children, width, style, sideOffset = 2, collisionPadding = 8, ...props }, ref,
  ) {
    return (
      <P.Portal>
        <P.SubContent
          ref={ref}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          className={cn('motion-floating', s.surface(), 'z-50 max-h-[var(--radix-dropdown-menu-content-available-height,var(--radix-context-menu-content-available-height))] overflow-y-auto', className)}
          style={{ width, ...style }}
          {...props}
        >
          <div data-slot="menu-list" className={s.list()}>{children}</div>
        </P.SubContent>
      </P.Portal>
    );
  });

  return { Item, CheckboxItem, RadioGroup, RadioItem, ToggleItem, Label, Separator, Group: P.Group, SubTrigger, SubContent };
}

/* ---------- Menu (Radix DropdownMenu) ---------- */

export type MenuContentProps = ComponentPropsWithoutRef<typeof DropdownMenu.Content> & Width & {
  /** Content above the item list (e.g. `<Menu.Search />`). */
  header?: ReactNode;
  /** Content below the item list (e.g. `<Menu.Footer lines={…} />`). */
  footer?: ReactNode;
};

const Content = forwardRef<ElementRef<typeof DropdownMenu.Content>, MenuContentProps>(function Content(
  { className, children, sideOffset = 4, align = 'start', collisionPadding = 8, width, style, header, footer, ...props }, ref,
) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        collisionPadding={collisionPadding}
        className={cn('motion-floating', s.surface(), 'z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto', className)}
        style={{ width, ...style }}
        {...props}
      >
        {header}
        <div data-slot="menu-list" className={s.list()}>{children}</div>
        {footer}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
});

const dropdownParts = createItemParts(DropdownMenu);

/**
 * Dropdown menu of actions opened from a button (WAI-ARIA menu button). Use for page/row actions, view
 * options and small pickers; use Select for form values and CommandPalette for searching many commands.
 *
 * <Menu.Root><Menu.Trigger asChild><IconButton icon="more" label="Page actions" /></Menu.Trigger>
 *   <Menu.Content><Menu.Item icon="link" shortcut="⌘L">Copy link</Menu.Item></Menu.Content></Menu.Root>
 */
export const Menu = {
  Root: DropdownMenu.Root,
  Trigger: DropdownMenu.Trigger,
  Content,
  ...dropdownParts,
  Sub: DropdownMenu.Sub,
  Search: MenuSearch,
  Footer: MenuFooter,
  Badge: MenuBadge,
};

/* ---------- ContextMenu (Radix ContextMenu, same styles) ---------- */

export type ContextMenuContentProps = ComponentPropsWithoutRef<typeof CM.Content> & Width & {
  /** Content above the item list. */
  header?: ReactNode;
  /** Content below the item list. */
  footer?: ReactNode;
  /** Accepted for API parity with Menu; a context menu always opens at the pointer. */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Accepted for API parity with Menu; a context menu always opens at the pointer. */
  align?: 'start' | 'center' | 'end';
};

const CMContent = forwardRef<ElementRef<typeof CM.Content>, ContextMenuContentProps>(function CMContent(
  { className, children, width, style, header, footer, side: _side, align: _align, collisionPadding = 8, ...props }, ref,
) {
  return (
    <CM.Portal>
      <CM.Content
        ref={ref}
        collisionPadding={collisionPadding}
        className={cn('motion-floating', s.surface(), 'z-50 max-h-[var(--radix-context-menu-content-available-height)] overflow-y-auto', className)}
        style={{ width, ...style }}
        {...props}
      >
        {header}
        <div data-slot="menu-list" className={s.list()}>{children}</div>
        {footer}
      </CM.Content>
    </CM.Portal>
  );
});

const contextParts = createItemParts(CM);

/**
 * Right-click (or long-press, or Shift+F10) menu with the same parts and look as `Menu`. Always offer the
 * same actions somewhere visible too: context menus are hard to discover.
 *
 * <ContextMenu.Root><ContextMenu.Trigger>…</ContextMenu.Trigger><ContextMenu.Content>…</ContextMenu.Content></ContextMenu.Root>
 */
export const ContextMenu = {
  Root: CM.Root,
  Trigger: CM.Trigger,
  Content: CMContent,
  ...contextParts,
  Sub: CM.Sub,
  Search: MenuSearch,
  Footer: MenuFooter,
};
