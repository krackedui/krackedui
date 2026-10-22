import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { valuesFromFilters } from './query';
import type { DatabaseData, OptionColor, Property, PropertyValue, Row, SelectOption, View, ViewType } from './types';
import { optionColorNames } from './colors';

let uid = 0;
export const newId = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${(uid++).toString(36)}`;

export const viewTypeLabels: Record<ViewType, string> = {
  table: 'Table', board: 'Board', gallery: 'Gallery', list: 'List', calendar: 'Calendar', timeline: 'Timeline', chart: 'Chart',
};

export interface DatabaseApi {
  data: DatabaseData;
  activeViewId: string;
  activeView: View;
  setActiveView: (id: string) => void;
  updateView: (id: string, patch: Partial<View> | ((v: View) => Partial<View>)) => void;
  addView: (type: ViewType) => View;
  updateRow: (rowId: string, propertyId: string, value: PropertyValue) => void;
  /** Add a page; `values` pre-fill (e.g. the board column's status). Returns the new row. */
  addRow: (values?: Row['values'], opts?: { viewId?: string; position?: 'start' | 'end' }) => Row;
  updateProperty: (id: string, patch: Partial<Property>) => void;
  /** Create a new select/multi-select/status option (random color). */
  addOption: (propertyId: string, name: string) => SelectOption;
  /** Move a row inside a view's manual order (board/list drag), optionally before another row. */
  moveRow: (viewId: string, rowId: string, beforeRowId?: string) => void;
}

/** State for one database: rows, views, schema edits. Pure React state (no persistence). */
export function useDatabase(initial: DatabaseData | (() => DatabaseData), initialViewId?: string): DatabaseApi {
  const [data, setData] = useState(initial);
  const [activeViewId, setActiveView] = useState(initialViewId ?? (typeof initial === 'function' ? '' : initial.views[0]?.id) ?? '');
  const activeView = data.views.find((v) => v.id === activeViewId) ?? data.views[0];
  const current = useRef({ data, activeView });
  current.current = { data, activeView };

  const updateView = useCallback<DatabaseApi['updateView']>((id, patch) => {
    setData((d) => ({ ...d, views: d.views.map((v) => (v.id === id ? { ...v, ...(typeof patch === 'function' ? patch(v) : patch) } : v)) }));
  }, []);

  const addView = useCallback((type: ViewType) => {
    const view: View = { id: newId('view'), name: viewTypeLabels[type], type, filters: [], sorts: [] };
    if (type === 'board') view.groupBy = data.collection.properties.find((p) => p.type === 'status' || p.type === 'select')?.id;
    if (type === 'calendar' || type === 'timeline') view.dateProperty = data.collection.properties.find((p) => p.type === 'date')?.id;
    setData((d) => ({ ...d, views: [...d.views, view] }));
    setActiveView(view.id);
    return view;
  }, [data.collection.properties]);

  const updateRow = useCallback<DatabaseApi['updateRow']>((rowId, propertyId, value) => {
    setData((d) => ({ ...d, rows: d.rows.map((r) => (r.id === rowId ? { ...r, values: { ...r.values, [propertyId]: value } } : r)) }));
  }, []);

  const addRow = useCallback<DatabaseApi['addRow']>((values = {}, opts = {}) => {
    const { data: d0, activeView: av } = current.current;
    const view = d0.views.find((v) => v.id === opts.viewId) ?? av;
    const row: Row = { id: newId('row'), values: { ...(view ? valuesFromFilters(d0.collection, view) : {}), ...values } };
    setData((d) => ({
      ...d,
      rows: [...d.rows, row],
      views: d.views.map((v) => {
        if (!v.order) return v;
        return { ...v, order: opts.position === 'start' && v.id === opts.viewId ? [row.id, ...v.order] : [...v.order, row.id] };
      }),
    }));
    return row;
  }, []);

  const updateProperty = useCallback<DatabaseApi['updateProperty']>((id, patch) => {
    setData((d) => ({ ...d, collection: { ...d.collection, properties: d.collection.properties.map((p) => (p.id === id ? ({ ...p, ...patch } as Property) : p)) } }));
  }, []);

  const addOption = useCallback((propertyId: string, name: string) => {
    const color: OptionColor = optionColorNames[Math.floor(Math.random() * optionColorNames.length)];
    const option: SelectOption = { id: newId('opt'), name, color };
    setData((d) => ({
      ...d,
      collection: {
        ...d.collection,
        properties: d.collection.properties.map((p) =>
          p.id === propertyId && (p.type === 'select' || p.type === 'multi_select')
            ? { ...p, options: [...p.options, option] }
            : p.id === propertyId && p.type === 'status'
              ? { ...p, options: [...p.options, { ...option, group: 'todo' as const }] }
              : p),
      },
    }));
    return option;
  }, []);

  const moveRow = useCallback<DatabaseApi['moveRow']>((viewId, rowId, beforeRowId) => {
    setData((d) => ({
      ...d,
      views: d.views.map((v) => {
        if (v.id !== viewId) return v;
        const order = (v.order ?? d.rows.map((r) => r.id)).filter((id) => id !== rowId);
        const i = beforeRowId ? order.indexOf(beforeRowId) : -1;
        order.splice(i < 0 ? order.length : i, 0, rowId);
        return { ...v, order };
      }),
    }));
  }, []);

  return useMemo(
    () => ({ data, activeViewId: activeView?.id ?? '', activeView, setActiveView, updateView, addView, updateRow, addRow, updateProperty, addOption, moveRow }),
    [data, activeView, updateView, addView, updateRow, addRow, updateProperty, addOption, moveRow],
  );
}

const Ctx = createContext<DatabaseApi | null>(null);
export function DatabaseProvider({ value, children }: { value: DatabaseApi; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
/** Access the database state from inside `<DatabaseView>` (views, cells, menus). */
export function useDatabaseContext(): DatabaseApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDatabaseContext must be used inside <DatabaseView>');
  return v;
}
/** Same, but returns null outside a database (menus can render statically in docs). */
export function useOptionalDatabase() {
  return useContext(Ctx);
}
