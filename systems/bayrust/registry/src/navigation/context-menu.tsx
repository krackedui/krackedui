'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import {
  MenuContext, MenuContent, MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuLabel,
  MenuSeparator, MenuGroup, MenuSub, MenuSubTrigger, MenuSubContent,
} from './menu';
import { useControllable } from '../lib/use-controllable';

/** Where the menu was asked for. Per instance, so two context menus on a page cannot collide. */
const PointContext = createContext<((p: { x: number; y: number }) => void) | null>(null);

export interface ContextMenuRootProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * The actions for the thing you right-clicked.
 *
 * It is `Menu` with a different way in: instead of a button, the anchor is a one-pixel element
 * placed where the pointer was, so every `Menu` part — items, checkboxes, radios, submenus —
 * behaves identically inside it and there is no second implementation to keep in step.
 */
export function ContextMenuRoot({ children, open, defaultOpen = false, onOpenChange }: ContextMenuRootProps) {
  const [isOpen, setOpen] = useControllable<boolean>(open, defaultOpen, onOpenChange);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const menu = useMemo(
    () => ({ open: isOpen, setOpen, triggerRef: anchorRef, contentRef }),
    [isOpen, setOpen],
  );
  const openAt = useCallback(
    (p: { x: number; y: number }) => {
      setPoint(p);
      setOpen(true);
    },
    [setOpen],
  );

  return (
    <MenuContext.Provider value={menu}>
      <PointContext.Provider value={openAt}>
        {point && (
          <span
            ref={anchorRef}
            aria-hidden="true"
            style={{ position: 'fixed', top: point.y, left: point.x, width: 1, height: 1 }}
          />
        )}
        {children}
      </PointContext.Provider>
    </MenuContext.Provider>
  );
}

export interface ContextMenuTriggerProps {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * The region a right-click opens the menu over.
 *
 * Reachable without a pointer too: the Menu key and Shift+F10 are what a keyboard user presses for
 * a context menu, and both open it at the region instead of at a cursor that is not there.
 */
export function ContextMenuTrigger({ children, className, disabled }: ContextMenuTriggerProps) {
  const openAt = useContext(PointContext);
  if (!openAt) throw new Error('<ContextMenu.Trigger> must be inside <ContextMenu.Root>.');
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={ref}
      role="presentation"
      className={cn('bay-contextmenu__trigger', className)}
      onContextMenu={(e) => {
        if (disabled) return;
        e.preventDefault();
        openAt({ x: e.clientX, y: e.clientY });
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
          e.preventDefault();
          const r = ref.current?.getBoundingClientRect();
          openAt({ x: r ? r.left + 8 : 0, y: r ? r.bottom - 8 : 0 });
        }
      }}
    >
      {children}
    </div>
  );
}

export const ContextMenu = {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
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

/* Flat aliases, for React Server Components (SPEC §2). The parts are Menu's own. */
export {
  MenuContent as ContextMenuContent,
  MenuItem as ContextMenuItem,
  MenuCheckboxItem as ContextMenuCheckboxItem,
  MenuRadioGroup as ContextMenuRadioGroup,
  MenuRadioItem as ContextMenuRadioItem,
  MenuLabel as ContextMenuLabel,
  MenuSeparator as ContextMenuSeparator,
  MenuGroup as ContextMenuGroup,
  MenuSub as ContextMenuSub,
  MenuSubTrigger as ContextMenuSubTrigger,
  MenuSubContent as ContextMenuSubContent,
};
