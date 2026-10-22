import type { Collection, Filter, FilterOperator, Property, PropertyType, PropertyValue, Row, SelectOption, Sort, View } from './types';

/* ---------- property helpers ---------- */

export function getProperty(collection: Collection, id: string | undefined): Property | undefined {
  return id ? collection.properties.find((p) => p.id === id) : undefined;
}
export function titleProperty(collection: Collection): Property {
  return collection.properties.find((p) => p.type === 'title') ?? collection.properties[0];
}
export function optionsOf(p: Property | undefined): SelectOption[] {
  return p && (p.type === 'select' || p.type === 'multi_select' || p.type === 'status') ? p.options : [];
}
export function findOption(p: Property | undefined, id: unknown): SelectOption | undefined {
  return optionsOf(p).find((o) => o.id === id);
}
/** Visible properties of a view, title first. */
export function visibleProperties(collection: Collection, view: View): Property[] {
  const title = titleProperty(collection);
  const ids = view.visible ?? collection.properties.map((p) => p.id);
  return [title, ...ids.filter((id) => id !== title.id).map((id) => getProperty(collection, id)).filter((p): p is Property => !!p)];
}
export function rowTitle(collection: Collection, row: Row): string {
  return String(row.values[titleProperty(collection).id] ?? '');
}

/* ---------- dates ---------- */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

export function parseDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return y ? new Date(y, (m || 1) - 1, d || 1) : null;
}
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
/** "Full date": October 2, 2026. */
export function formatDate(iso: string | null | undefined, format: 'full' | 'short' = 'full'): string {
  const d = parseDate(iso);
  if (!d) return '';
  return format === 'short' ? `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
export function monthLabel(d: Date, short = false) {
  return `${(short ? MONTHS_SHORT : MONTHS)[d.getMonth()]} ${d.getFullYear()}`;
}
export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/* ---------- filter ---------- */

export const operatorsFor: Record<PropertyType, FilterOperator[]> = {
  title: ['contains', 'does_not_contain', 'is', 'is_not', 'is_empty', 'is_not_empty'],
  text: ['contains', 'does_not_contain', 'is', 'is_not', 'is_empty', 'is_not_empty'],
  url: ['contains', 'does_not_contain', 'is', 'is_not', 'is_empty', 'is_not_empty'],
  email: ['contains', 'does_not_contain', 'is', 'is_not', 'is_empty', 'is_not_empty'],
  phone: ['contains', 'does_not_contain', 'is', 'is_not', 'is_empty', 'is_not_empty'],
  number: ['is', 'is_not', 'gt', 'lt', 'is_empty', 'is_not_empty'],
  select: ['is', 'is_not', 'is_empty', 'is_not_empty'],
  status: ['is', 'is_not', 'is_empty', 'is_not_empty'],
  multi_select: ['contains', 'does_not_contain', 'is_empty', 'is_not_empty'],
  person: ['contains', 'does_not_contain', 'is_empty', 'is_not_empty'],
  date: ['is', 'before', 'after', 'is_empty', 'is_not_empty'],
  created_time: ['is', 'before', 'after'],
  checkbox: ['checked', 'unchecked'],
};

export const operatorLabels: Record<FilterOperator, string> = {
  is: 'Is', is_not: 'Is not', contains: 'Contains', does_not_contain: 'Does not contain',
  is_empty: 'Is empty', is_not_empty: 'Is not empty', before: 'Is before', after: 'Is after',
  checked: 'Is checked', unchecked: 'Is unchecked', gt: '>', lt: '<',
};

function isEmpty(v: unknown) {
  return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
}

export function matchesFilter(collection: Collection, row: Row, f: Filter): boolean {
  const p = getProperty(collection, f.propertyId);
  if (!p) return true;
  const v = row.values[p.id];
  const want = f.value;
  const wantList = Array.isArray(want) ? want : want === undefined || want === '' ? [] : [String(want)];
  switch (f.operator) {
    case 'is_empty': return isEmpty(v);
    case 'is_not_empty': return !isEmpty(v);
    case 'checked': return v === true;
    case 'unchecked': return v !== true;
  }
  if (wantList.length === 0 && f.operator !== 'gt' && f.operator !== 'lt') return true; // incomplete filter: no-op
  if (p.type === 'select' || p.type === 'status') {
    const hit = wantList.includes(String(v));
    return f.operator === 'is_not' ? !hit : hit;
  }
  if (p.type === 'multi_select' || p.type === 'person') {
    const arr = (v as string[] | undefined) ?? [];
    const hit = wantList.some((w) => arr.includes(w));
    return f.operator === 'does_not_contain' ? !hit : hit;
  }
  if (p.type === 'date' || p.type === 'created_time') {
    const s = String(v ?? '');
    const w = wantList[0];
    if (f.operator === 'before') return !!s && s < w;
    if (f.operator === 'after') return !!s && s > w;
    return s.slice(0, 10) === w;
  }
  if (p.type === 'number') {
    const n = Number(v), w = Number(want);
    if (f.operator === 'gt') return n > w;
    if (f.operator === 'lt') return n < w;
    return f.operator === 'is_not' ? n !== w : n === w;
  }
  const s = String(v ?? '').toLowerCase(), w = String(wantList[0]).toLowerCase();
  switch (f.operator) {
    case 'contains': return s.includes(w);
    case 'does_not_contain': return !s.includes(w);
    case 'is': return s === w;
    case 'is_not': return s !== w;
    default: return true;
  }
}

/* ---------- sort ---------- */

function sortKey(p: Property, v: PropertyValue | undefined): string | number {
  if (v === undefined || v === null) return '';
  if (p.type === 'select' || p.type === 'status') {
    const i = p.options.findIndex((o) => o.id === v);
    return i < 0 ? Number.MAX_SAFE_INTEGER : i; // sort by option order
  }
  if (p.type === 'multi_select' || p.type === 'person') return Array.isArray(v) ? (v[0] ?? '') : '';
  if (p.type === 'checkbox') return v ? 1 : 0;
  if (p.type === 'number') return Number(v);
  return (Array.isArray(v) ? v.join(', ') : String(v)).toLowerCase();
}

export function compareRows(collection: Collection, sorts: Sort[]) {
  return (a: Row, b: Row) => {
    for (const s of sorts) {
      const p = getProperty(collection, s.propertyId);
      if (!p) continue;
      const ka = sortKey(p, a.values[p.id]), kb = sortKey(p, b.values[p.id]);
      // empty values always last
      if (ka === '' && kb !== '') return 1;
      if (kb === '' && ka !== '') return -1;
      const c = ka < kb ? -1 : ka > kb ? 1 : 0;
      if (c) return s.direction === 'ascending' ? c : -c;
    }
    return 0;
  };
}

/** Rows after the view's filters (AND) and sorts. */
export function queryRows(collection: Collection, rows: Row[], view: View): Row[] {
  const filtered = rows.filter((r) => view.filters.every((f) => matchesFilter(collection, r, f)));
  if (view.sorts.length) return [...filtered].sort(compareRows(collection, view.sorts));
  if (view.order) {
    const idx = (r: Row) => { const i = view.order!.indexOf(r.id); return i < 0 ? Number.MAX_SAFE_INTEGER : i; };
    return [...filtered].sort((a, b) => idx(a) - idx(b));
  }
  return filtered;
}

export interface RowGroup { id: string; option?: SelectOption; label: string; rows: Row[] }

/** Group rows by a select/status property (one group per option, plus "No …" when used). */
export function groupRows(collection: Collection, rows: Row[], groupBy: string | undefined): RowGroup[] {
  const p = getProperty(collection, groupBy);
  if (!p) return [{ id: 'all', label: '', rows }];
  const opts = optionsOf(p);
  const groups: RowGroup[] = opts.map((o) => ({ id: o.id, option: o, label: o.name, rows: [] }));
  const none: RowGroup = { id: '__none', label: `No ${p.name}`, rows: [] };
  for (const r of rows) {
    const v = r.values[p.id];
    const key = Array.isArray(v) ? v[0] : v;
    const g = groups.find((x) => x.id === key);
    (g ?? none).rows.push(r);
  }
  return none.rows.length ? [none, ...groups] : groups;
}

/** Values a new row needs to satisfy the view's simple filters (e.g. pre-fill "Status is Done"). */
export function valuesFromFilters(collection: Collection, view: View): Row['values'] {
  const out: Row['values'] = {};
  for (const f of view.filters) {
    const p = getProperty(collection, f.propertyId);
    if (!p || f.id === '__search') continue;
    const vals = Array.isArray(f.value) ? f.value : f.value !== undefined && f.value !== '' ? [String(f.value)] : [];
    if (f.operator === 'checked') out[p.id] = true;
    else if (!vals.length) continue;
    else if ((p.type === 'select' || p.type === 'status') && f.operator === 'is') out[p.id] = vals[0];
    else if (p.type === 'multi_select' && f.operator === 'contains') out[p.id] = [vals[0]];
    else if (p.type === 'date' && f.operator === 'is') out[p.id] = vals[0];
  }
  return out;
}
