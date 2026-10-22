import { forwardRef, useEffect, useState, type HTMLAttributes } from 'react';
import { Icon } from '../icons/Icon';
import { MenuLabel, MenuList, MenuSurface } from '../components/Menu';
import { DbMenuItem, DbMenuRule, SubmenuRow, useMenuKeys } from './menuParts';
import { PropertyTypeIcon, viewTypeIcons } from './PropertyTypeIcon';
import { FilterMenu, SortMenu } from './FilterSortMenus';
import { viewTypeLabels } from './useDatabase';
import { optionsOf, titleProperty } from './query';
import type { Collection, View, ViewType } from './types';

export interface ViewSettingsPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  collection: Collection;
  view: View;
  onChange?: (patch: Partial<View>) => void;
  onClose?: () => void;
  /** Panel height (captured: extends to the window bottom, 627px). */
  height?: number;
}

const LAYOUTS: ViewType[] = ['table', 'board', 'gallery', 'list', 'calendar', 'timeline', 'chart'];

/**
 * "View settings" panel (capture: db-view-settings). Measured: 290 wide, radius 10, shadow outline-lg;
 * header padding 14 16 6 with 12/500 text-secondary title and a 20px round close (bg-tertiary-translucent-a, xMarkSmall 14);
 * icon button + view-name input row 36px; rows 28px in a 0 8 8 padded list, trailing values text-tertiary + chevron icon-tertiary;
 * "Data source settings" section label; rules inset 16px.
 */
export const ViewSettingsPanel = forwardRef<HTMLDivElement, ViewSettingsPanelProps>(function ViewSettingsPanel(
  { collection, view, onChange, onClose, height, style, onKeyDown, ...props }, ref,
) {
  const [name, setName] = useState(view.name);
  useEffect(() => setName(view.name), [view.name]);
  const keys = useMenuKeys();
  const title = titleProperty(collection);
  const visible = view.visible ?? collection.properties.map((p) => p.id);
  const visibleCount = collection.properties.filter((p) => p.id === title.id || visible.includes(p.id)).length;
  const groupable = collection.properties.filter((p) => optionsOf(p).length);
  const groupBy = collection.properties.find((p) => p.id === view.groupBy);

  return (
    <MenuSurface ref={ref} width={290} role="dialog" aria-label="View settings" className="flex flex-col"
      style={{ height, ...style }} onKeyDown={(e) => { keys(e); onKeyDown?.(e); }} {...props}>
      <div className="flex items-center px-4 pb-1.5 pt-3.5">
        <div className="flex-1 text-[12px] font-medium leading-4 text-n-text-secondary">View settings</div>
        <button type="button" aria-label="Close" onClick={onClose}
          className="flex size-5 cursor-pointer items-center justify-center rounded-full bg-n-bg-tertiary-translucent-a text-n-icon-secondary hover:bg-n-button-pressed-bg-a">
          <Icon name="xMarkSmall" size={14} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex items-center gap-2 p-1 px-3 py-2">
          <button type="button" aria-label="Change icon"
            className="flex size-7 shrink-0 cursor-pointer focus-visible:shadow-n-focus-shadow items-center justify-center rounded-n-md shadow-[inset_0_0_0_1px_var(--n-border-primary-translucent-a)] hover:bg-n-button-hover-bg-a">
            <Icon name={viewTypeIcons[view.type]} size={20} />
          </button>
          <div className="flex h-7 min-w-0 flex-1 items-center rounded-n-md bg-n-bg-secondary-translucent-a px-1.5 shadow-[0_0_0_1px_var(--n-border-primary-translucent-a)] focus-within:shadow-n-input-blue-focus-ring">
            <input aria-label="View name" placeholder="View name" value={name} onChange={(e) => setName(e.target.value)}
              onBlur={() => name.trim() && name !== view.name && onChange?.({ name: name.trim() })}
              onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
              className="h-5 min-w-0 flex-1 bg-transparent text-[14px] leading-5 text-n-text-primary outline-none placeholder:text-n-text-tertiary" />
            <span className="ml-1 text-n-icon-secondary"><Icon name="infoCircleFill" size={15} /></span>
          </div>
        </div>
        <MenuList role="group" className="px-2 pb-2 pt-0">
          <SubmenuRow icon={viewTypeIcons[view.type]} value={viewTypeLabels[view.type]} width={220} content={(close) => (
            <MenuList role="group">
              {LAYOUTS.map((t) => (
                <DbMenuItem key={t} icon={viewTypeIcons[t]} checked={t === view.type}
                  onClick={() => {
                    const patch: Partial<View> = { type: t };
                    if (t === 'board' && !view.groupBy) patch.groupBy = groupable[0]?.id;
                    if ((t === 'calendar' || t === 'timeline') && !view.dateProperty) patch.dateProperty = collection.properties.find((p) => p.type === 'date')?.id;
                    onChange?.(patch); close();
                  }}>
                  {viewTypeLabels[t]}
                </DbMenuItem>
              ))}
            </MenuList>
          )}>Layout</SubmenuRow>
          <SubmenuRow icon="eye" value={visibleCount} width={260} content={
            <MenuList role="group">
              <MenuLabel>Shown in {view.type}</MenuLabel>
              {collection.properties.map((p) => {
                const on = p.id === title.id || visible.includes(p.id);
                return (
                  <DbMenuItem key={p.id} icon={<PropertyTypeIcon type={p.type} />}
                    trailing={p.id === title.id ? undefined : <Icon name={on ? 'eye' : 'eyeSlash'} size={20} className={on ? 'text-n-icon-secondary' : 'text-n-icon-tertiary'} />}
                    onClick={() => { if (p.id !== title.id) onChange?.({ visible: on ? visible.filter((x) => x !== p.id) : [...visible, p.id] }); }}>
                    {p.name}
                  </DbMenuItem>
                );
              })}
            </MenuList>
          }>Property visibility</SubmenuRow>
          <SubmenuRow icon="filter" value={view.filters.length ? view.filters.length : undefined} width={290} content={(close) => (
            <FilterMenu className="!shadow-none" properties={collection.properties} onSelect={(p) => {
              onChange?.({ filters: [...view.filters, { id: `f-${Date.now()}`, propertyId: p.id, operator: p.type === 'checkbox' ? 'checked' : p.type === 'multi_select' || p.type === 'title' || p.type === 'text' ? 'contains' : 'is', value: undefined }] });
              close();
            }} />
          )}>Filter</SubmenuRow>
          <SubmenuRow icon="arrowUpDown" value={view.sorts.length ? view.sorts.length : undefined} width={290} content={(close) => (
            <SortMenu className="!shadow-none" properties={collection.properties} onSelect={(p) => {
              onChange?.({ sorts: [...view.sorts.filter((s) => s.propertyId !== p.id), { propertyId: p.id, direction: 'ascending' }] });
              close();
            }} />
          )}>Sort</SubmenuRow>
          <SubmenuRow icon="squareGridBelowLines" value={groupBy?.name} width={220} content={(close) => (
            <MenuList role="group">
              <DbMenuItem checked={!view.groupBy} onClick={() => { onChange?.({ groupBy: undefined }); close(); }}>None</DbMenuItem>
              {groupable.map((p) => (
                <DbMenuItem key={p.id} icon={<PropertyTypeIcon type={p.type} />} checked={p.id === view.groupBy} onClick={() => { onChange?.({ groupBy: p.id }); close(); }}>{p.name}</DbMenuItem>
              ))}
            </MenuList>
          )}>Group</SubmenuRow>
          <SubmenuRow icon="blockColor" content={<MenuList role="group"><DbMenuItem>Add a color rule</DbMenuItem></MenuList>}>Conditional color</SubmenuRow>
          <DbMenuItem icon="link">Copy link to view</DbMenuItem>
        </MenuList>
        <DbMenuRule className="mx-4" />
        <MenuList role="group" className="px-2 pb-2 pt-0">
          <MenuLabel className="mb-2 mt-1.5 px-2 pt-1">Data source settings</MenuLabel>
          <SubmenuRow icon="pathRoundEnds" value={collection.name} content={<MenuList role="group"><DbMenuItem icon={viewTypeIcons.table}>{collection.name}</DbMenuItem></MenuList>}>Source</SubmenuRow>
          <SubmenuRow icon="bulletedList" content={<MenuList role="group">{collection.properties.map((p) => <DbMenuItem key={p.id} icon={<PropertyTypeIcon type={p.type} />}>{p.name}</DbMenuItem>)}</MenuList>}>Edit properties</SubmenuRow>
          <SubmenuRow icon="lightning" content={<MenuList role="group"><DbMenuItem icon="plus">New automation</DbMenuItem></MenuList>}>Automations</SubmenuRow>
          <SubmenuRow icon="magicWand" content={<MenuList role="group"><DbMenuItem icon="magicWand">Summary</DbMenuItem></MenuList>}>AI Autofill</SubmenuRow>
          <SubmenuRow icon="arrowSquarePathUpDown" content={<MenuList role="group"><DbMenuItem>Page</DbMenuItem><DbMenuItem>Inline</DbMenuItem></MenuList>}>Turn into</SubmenuRow>
          <SubmenuRow icon="ellipsis" content={<MenuList role="group"><DbMenuItem>Load limit</DbMenuItem></MenuList>}>More settings</SubmenuRow>
        </MenuList>
        <DbMenuRule className="mx-4" />
        <MenuList role="group" className="px-2 pb-2 pt-1">
          <SubmenuRow icon="collection" content={<MenuList role="group"><DbMenuItem icon="plus">Add data source</DbMenuItem></MenuList>}>Manage data sources</SubmenuRow>
          <DbMenuItem icon="lock">Lock database</DbMenuItem>
          <DbMenuItem icon="calendarDate15" trailing={<Icon name="arrowDiagonalUpRightSmall" size={16} className="text-n-icon-tertiary" />}>Manage in Calendar</DbMenuItem>
        </MenuList>
      </div>
    </MenuSurface>
  );
});
