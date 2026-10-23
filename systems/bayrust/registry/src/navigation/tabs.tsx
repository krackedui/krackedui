'use client';

import { createContext, useContext, useId, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { useControllable } from '../lib/use-controllable';

interface TabsCtx {
  value: string;
  setValue: (v: string) => void;
  baseId: string;
}
const TabsContext = createContext<TabsCtx | null>(null);

function useTabs(part: string): TabsCtx {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<Tabs.${part}> must be inside <Tabs.Root>.`);
  return ctx;
}

export interface TabsRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  children?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

/** Switch between views of the same thing. The selected tab is the one whose panel is shown. */
export function TabsRoot({ children, value, defaultValue, onValueChange, className, ...rest }: TabsRootProps) {
  const baseId = useId();
  const [current, setCurrent] = useControllable<string>(value, defaultValue ?? '', onValueChange);
  return (
    <TabsContext.Provider value={{ value: current, setValue: setCurrent, baseId }}>
      <div className={cn('bay-tabs', className)} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/**
 * The row of tabs. Arrow keys move between them and Home/End jump to the ends, which is what the
 * tabs pattern expects; only the selected tab is in the tab order.
 */
export function TabsList({ children, className, ...rest }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  const list = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    const tabs = [...(list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') ?? [])];
    if (!tabs.length) return;
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    e.preventDefault();
    const next =
      e.key === 'Home' ? 0
      : e.key === 'End' ? tabs.length - 1
      : e.key === 'ArrowRight' ? (i + 1) % tabs.length
      : (i - 1 + tabs.length) % tabs.length;
    tabs[next].focus();
    tabs[next].click();
  };
  return (
    // The keys are handled here and arrive by bubbling from whichever tab has focus; the list itself
    // is never a tab stop. tabIndex={-1} says that explicitly — it keeps the list out of the tab order
    // while giving the interactive role the focusability the pattern expects.
    <div ref={list} role="tablist" tabIndex={-1} className={cn('bay-tabs__list', className)} onKeyDown={onKeyDown} {...rest}>
      {children}
    </div>
  );
}

export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
}

/** One tab. */
export function TabsTrigger({ value, disabled, children, className, ...rest }: TabsTriggerProps) {
  const ctx = useTabs('Trigger');
  const selected = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${ctx.baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${ctx.baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      className={cn('bay-tabs__trigger', className)}
      data-selected={selected ? '' : undefined}
      onClick={() => ctx.setValue(value)}
      {...rest}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children?: ReactNode;
}

/** The panel for one tab. Only the selected one is rendered. */
export function TabsContent({ value, children, className, ...rest }: TabsContentProps) {
  const ctx = useTabs('Content');
  if (ctx.value !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-tab-${value}`}
      tabIndex={0}
      className={cn('bay-tabs__content', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Tabs as an object of parts. The flat aliases above work from React Server Components. */
export const Tabs = { Root: TabsRoot, List: TabsList, Trigger: TabsTrigger, Content: TabsContent };
