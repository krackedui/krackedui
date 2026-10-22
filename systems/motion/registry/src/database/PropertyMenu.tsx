import { forwardRef, useEffect, useState, type HTMLAttributes } from 'react';
import { Icon } from '../icons/Icon';
import { MenuList, MenuSurface } from '../components/Menu';
import { DbMenuItem, DbMenuRule, SubmenuRow, useMenuKeys } from './menuParts';
import { PropertyTypeIcon, propertyTypeLabels } from './PropertyTypeIcon';
import type { Property, PropertyType } from './types';

export interface PropertyMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'property'> {
  property: Property;
  onRename?: (name: string) => void;
  onChangeType?: (type: PropertyType) => void;
  onFilter?: () => void;
  onSort?: (direction: 'ascending' | 'descending') => void;
  onGroup?: () => void;
  onHide?: () => void;
  onInsert?: (side: 'left' | 'right') => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  /** Wrap content toggle state. */
  wrap?: boolean;
  onToggleWrap?: () => void;
  autoFocus?: boolean;
}

const CHANGEABLE: PropertyType[] = ['text', 'number', 'select', 'multi_select', 'status', 'date', 'person', 'checkbox', 'url', 'email', 'phone', 'created_time'];

/**
 * Table header property menu (capture: db-property-menu). Measured: 244 wide, radius 10; header row 36px
 * (padding 4 8, gap 8): 28px bordered icon button + name input (bg-secondary-translucent-a, radius 6, blue focus ring,
 * info icon); rows 28px; inset 12px rules; "Now with agents" badge 11/500 blue on blue-bg-secondary-translucent-a.
 */
export const PropertyMenu = forwardRef<HTMLDivElement, PropertyMenuProps>(function PropertyMenu(
  { property: p, onRename, onChangeType, onFilter, onSort, onGroup, onHide, onInsert, onDuplicate, onDelete, wrap, onToggleWrap, autoFocus = true, onKeyDown, ...props }, ref,
) {
  const [name, setName] = useState(p.name);
  useEffect(() => setName(p.name), [p.name]);
  const keys = useMenuKeys();
  const isTitle = p.type === 'title';
  return (
    <MenuSurface ref={ref} width={244} role="dialog" aria-label={`${p.name} property`} onKeyDown={(e) => { keys(e); onKeyDown?.(e); }} {...props}>
      <div className="flex items-center gap-2 px-2 pb-1 pt-2">
        <button type="button" aria-label="Change icon"
          className="flex size-7 shrink-0 cursor-pointer focus-visible:shadow-n-focus-shadow items-center justify-center rounded-n-md text-n-icon-primary shadow-[inset_0_0_0_1px_var(--n-border-primary-translucent-a)] hover:bg-n-button-hover-bg-a">
          <PropertyTypeIcon type={p.type} size={16} />
        </button>
        <div className="flex h-7 min-w-0 flex-1 items-center rounded-n-md bg-n-bg-secondary-translucent-a px-1.5 shadow-[0_0_0_1px_var(--n-border-primary-translucent-a)] focus-within:shadow-n-input-blue-focus-ring">
          <input
            aria-label="Property name"
            autoFocus={autoFocus}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name.trim() && name !== p.name && onRename?.(name.trim())}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); e.stopPropagation(); }}
            className="h-5 min-w-0 flex-1 bg-transparent text-[14px] leading-5 text-n-text-primary outline-none"
          />
          <button type="button" aria-label="Add property description" className="ml-1 flex shrink-0 cursor-pointer items-center justify-center rounded-n-sm text-n-icon-secondary pointer-coarse:size-6">
            <Icon name="infoCircleFill" size={15} />
          </button>
        </div>
      </div>
      <MenuList role="group">
        <SubmenuRow icon="sliders" content={<MenuList role="group"><DbMenuItem icon={<PropertyTypeIcon type={p.type} />}>{propertyTypeLabels[p.type]}</DbMenuItem></MenuList>}>Edit property</SubmenuRow>
        <DbMenuItem icon="lock">Property access</DbMenuItem>
        {!isTitle && (
          <SubmenuRow icon="arrowSquarePathUpDown" content={(close) => (
            <MenuList role="group">
              {CHANGEABLE.map((t) => (
                <DbMenuItem key={t} checked={t === p.type} icon={<PropertyTypeIcon type={t} />} onClick={() => { onChangeType?.(t); close(); }}>
                  {propertyTypeLabels[t]}
                </DbMenuItem>
              ))}
            </MenuList>
          )}>Change type</SubmenuRow>
        )}
        <SubmenuRow icon="magicWand" content={<MenuList role="group"><DbMenuItem icon="magicWand">Summary</DbMenuItem><DbMenuItem icon="magicWand">Translation</DbMenuItem></MenuList>}>
          <span className="flex items-center">            AI Autofill
            <span className="ml-1.5 rounded-n-sm bg-n-blue-bg-secondary-translucent-a px-1 py-0.5 text-[11px] font-medium leading-[14.3px] text-n-blue-text-primary">Now with agents</span>
          </span>
        </SubmenuRow>
      </MenuList>
      <DbMenuRule />
      <MenuList role="group">
        <DbMenuItem icon="filter" onClick={onFilter}>Filter</DbMenuItem>
        <SubmenuRow icon="arrowUpDown" width={200} content={(close) => (
          <MenuList role="group">
            <DbMenuItem icon="arrowUpDown" onClick={() => { onSort?.('ascending'); close(); }}>Sort ascending</DbMenuItem>
            <DbMenuItem icon="arrowUpDown" onClick={() => { onSort?.('descending'); close(); }}>Sort descending</DbMenuItem>
          </MenuList>
        )}>Sort</SubmenuRow>
        {(p.type === 'select' || p.type === 'status' || p.type === 'multi_select') && <DbMenuItem icon="squareGridBelowLines" onClick={onGroup}>Group</DbMenuItem>}
        <SubmenuRow icon="sum" width={200} content={<MenuList role="group">{['None', 'Count all', 'Count values', 'Count empty', 'Percent empty'].map((c) => <DbMenuItem key={c}>{c}</DbMenuItem>)}</MenuList>}>Calculate</SubmenuRow>
        <DbMenuItem icon="pin">Freeze</DbMenuItem>
        {!isTitle && <DbMenuItem icon="eyeSlash" onClick={onHide}>Hide</DbMenuItem>}
        <DbMenuItem icon="arrowUTurnDownLeft" checked={wrap} onClick={onToggleWrap}>Wrap content</DbMenuItem>
      </MenuList>
      <DbMenuRule />
      <MenuList role="group">
        <DbMenuItem icon="arrowRectangleLeft" onClick={() => onInsert?.('left')}>Insert left</DbMenuItem>
        <DbMenuItem icon="arrowRectangleRight" onClick={() => onInsert?.('right')}>Insert right</DbMenuItem>
        {!isTitle && <DbMenuItem icon="duplicate" onClick={onDuplicate}>Duplicate property</DbMenuItem>}
        {!isTitle && <DbMenuItem icon="trash" tone="danger" onClick={onDelete}>Delete property</DbMenuItem>}
      </MenuList>
    </MenuSurface>
  );
});
