/**
 * Data model for databases (collections). A `Collection` is a typed schema of
 * `Property`s; `Row`s hold values keyed by property id; `View`s are saved layouts
 * (table, board…) with their own filter/sort/group/visible properties.
 */

import type { MotionColor } from '../atoms';

/** Option colors (shared with the atoms' Tag / StatusPill). */
export type OptionColor = MotionColor;

export type PropertyType =
  | 'title' | 'text' | 'number' | 'select' | 'multi_select' | 'status' | 'date'
  | 'person' | 'checkbox' | 'url' | 'email' | 'phone' | 'created_time';

export interface SelectOption { id: string; name: string; color: OptionColor }

/** Status options are grouped (To-do / In progress / Complete). */
export interface StatusOption extends SelectOption { group: 'todo' | 'in_progress' | 'complete' }

export interface Person { id: string; name: string; avatarUrl?: string }

interface PropertyBase<T extends PropertyType> { id: string; name: string; type: T; description?: string }
export type TitleProperty = PropertyBase<'title'>;
export type TextProperty = PropertyBase<'text'>;
export interface NumberProperty extends PropertyBase<'number'> { format?: 'number' | 'percent' | 'dollar' }
export interface SelectProperty extends PropertyBase<'select'> { options: SelectOption[] }
export interface MultiSelectProperty extends PropertyBase<'multi_select'> { options: SelectOption[] }
export interface StatusProperty extends PropertyBase<'status'> { options: StatusOption[] }
export interface DateProperty extends PropertyBase<'date'> { dateFormat?: 'full' | 'short' | 'relative' }
export interface PersonProperty extends PropertyBase<'person'> { people: Person[] }
export type CheckboxProperty = PropertyBase<'checkbox'>;
export type UrlProperty = PropertyBase<'url'>;
export type EmailProperty = PropertyBase<'email'>;
export type PhoneProperty = PropertyBase<'phone'>;
export type CreatedTimeProperty = PropertyBase<'created_time'>;

export type Property =
  | TitleProperty | TextProperty | NumberProperty | SelectProperty | MultiSelectProperty | StatusProperty
  | DateProperty | PersonProperty | CheckboxProperty | UrlProperty | EmailProperty | PhoneProperty | CreatedTimeProperty;

/** Value stored per property type. Dates are ISO `YYYY-MM-DD`; select/status store option ids. */
export interface PropertyValueMap {
  title: string; text: string; number: number | null; select: string | null; multi_select: string[];
  status: string | null; date: string | null; person: string[]; checkbox: boolean; url: string;
  email: string; phone: string; created_time: string;
}
export type PropertyValue = PropertyValueMap[PropertyType];

export interface Row {
  id: string;
  /** Values keyed by property id. Missing = empty. */
  values: Record<string, PropertyValue | undefined>;
  icon?: string;
}

export interface Collection {
  id: string;
  name: string;
  properties: Property[];
}

export type ViewType = 'table' | 'board' | 'gallery' | 'list' | 'calendar' | 'timeline' | 'chart';

export type FilterOperator =
  | 'is' | 'is_not' | 'contains' | 'does_not_contain' | 'is_empty' | 'is_not_empty'
  | 'before' | 'after' | 'checked' | 'unchecked' | 'gt' | 'lt';

export interface Filter { id: string; propertyId: string; operator: FilterOperator; value?: string | string[] | number }
export interface Sort { propertyId: string; direction: 'ascending' | 'descending' }

export interface View {
  id: string;
  name: string;
  type: ViewType;
  filters: Filter[];
  sorts: Sort[];
  /** Property used to group (board columns; also grouping in table/list). */
  groupBy?: string;
  /** Property ids shown, in order. Title is always shown. Default: all. */
  visible?: string[];
  /** Table column widths by property id (px). Default: title 280, others 200. */
  widths?: Record<string, number>;
  /** Date property for calendar/timeline. Default: first date property. */
  dateProperty?: string;
  /** Manual row order for this view (one per view). Rows not listed go last. */
  order?: string[];
  /** Chart view: locked empty state (as captured) or a bar chart. */
  chart?: { locked?: boolean; groupBy?: string };
}

export interface DatabaseData { collection: Collection; rows: Row[]; views: View[] }
