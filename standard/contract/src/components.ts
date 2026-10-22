// The component API contract. Every system exports these names, and each component accepts at
// least these props with these value sets. Systems may accept more props or values (extras), never fewer.
// The gate checks it at type level: an object typed with the contract props must be assignable to the
// system component's props (standard/gate/checks/check-contract.mjs).
//
// Conventions every contract follows:
// - Controlled + uncontrolled: `value` / `defaultValue` / `onValueChange` (open: `open` / `defaultOpen` / `onOpenChange`).
// - Booleans are adjectives: `disabled`, `invalid`, `loading`, `required`, `active`.
// - Icons are names (`icon="plus"`), never elements, so swapping systems swaps the drawing.
// - Compound components are objects of parts: `Menu.Root`, `Menu.Item`. Each system also exports
//   flat aliases (`MenuRoot`, `MenuItem`) so they work from React Server Components.
import type { ChangeEvent, CSSProperties, MouseEvent, ReactNode } from 'react';
import type { Align, Appearance, Color, CoreIconName, Side, Size, Tone } from './vocab';

/** Props every visual component accepts. */
export interface Base {
  className?: string;
  style?: CSSProperties;
  id?: string;
}
type WithChildren = Base & { children?: ReactNode };
type Open = { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void };
type Value<T> = { value?: T; defaultValue?: T; onValueChange?: (value: T) => void };
export interface Option<V extends string = string> {
  value: V;
  label: ReactNode;
  icon?: CoreIconName;
  description?: ReactNode;
  disabled?: boolean;
}

/* ---------- foundations ---------- */

export interface ThemeProps extends WithChildren {
  /** `system` follows the OS setting. */
  appearance?: Appearance | 'system';
}
export interface IconProps extends Base {
  name: CoreIconName;
  size?: number;
  /** Accessible name. Without it the icon is decorative (aria-hidden). */
  label?: string;
}

/* ---------- layout ---------- */

type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
type Responsive<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T };
export interface StackProps extends WithChildren {
  direction?: Responsive<'row' | 'column'>;
  gap?: Responsive<Space>;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between';
  wrap?: boolean;
  asChild?: boolean;
}
export interface GridProps extends WithChildren {
  columns?: Responsive<1 | 2 | 3 | 4 | 5 | 6 | 12>;
  gap?: Responsive<Space>;
  asChild?: boolean;
}
export interface DividerProps extends Base {
  orientation?: 'horizontal' | 'vertical';
}

/* ---------- actions ---------- */

export interface ButtonProps extends WithChildren {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: Size;
  icon?: CoreIconName;
  trailingIcon?: CoreIconName;
  /** Shows a spinner, keeps the width, sets aria-busy and blocks clicks. */
  loading?: boolean;
  full?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  asChild?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}
export interface IconButtonProps extends Base {
  icon: CoreIconName;
  /** Required: icon-only controls need an accessible name (also shown as the tooltip where systems do that). */
  label: string;
  size?: Size;
  variant?: 'ghost' | 'secondary';
  active?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}
export interface LinkProps extends WithChildren {
  href?: string;
  /** Opens in a new tab with rel="noreferrer" and an external indicator. */
  external?: boolean;
}

/* ---------- forms ---------- */

/** Wraps one control: renders the label, description and error, and wires id / aria-describedby / aria-invalid. */
export interface FieldProps extends WithChildren {
  label: ReactNode;
  description?: ReactNode;
  /** Error message. Presence marks the control invalid. */
  error?: ReactNode;
  required?: boolean;
  /** Visually hide the label (it stays the accessible name). */
  hideLabel?: boolean;
}
type ControlBase = Base & { disabled?: boolean; invalid?: boolean; required?: boolean; name?: string };
export interface TextInputProps extends ControlBase {
  value?: string;
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'number' | 'search';
  size?: Size;
  icon?: CoreIconName;
  trailing?: ReactNode;
}
export interface TextareaProps extends ControlBase {
  value?: string;
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}
export interface SearchInputProps extends ControlBase {
  value?: string;
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  placeholder?: string;
  size?: Size;
}
export interface NumberInputProps extends ControlBase, Value<number | null> {
  min?: number;
  max?: number;
  step?: number;
  /** Intl.NumberFormat options: currency, percent, decimals. */
  format?: Intl.NumberFormatOptions;
  placeholder?: string;
  size?: Size;
}
export interface SelectProps extends ControlBase, Value<string> {
  options: Option[];
  placeholder?: string;
  size?: Size;
}
export interface ComboboxProps extends ControlBase, Value<string> {
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: ReactNode;
  size?: Size;
}
export interface CheckboxProps extends ControlBase {
  checked?: boolean | 'indeterminate';
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
}
export interface RadioGroupProps extends WithChildren, Value<string> {
  disabled?: boolean;
  name?: string;
  orientation?: 'horizontal' | 'vertical';
}
export interface RadioProps extends Base {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
}
export interface SwitchProps extends ControlBase {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  size?: 'sm' | 'md';
}
export interface SliderProps extends Base, Value<number[]> {
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Accessible name when there is no Field around it. */
  label?: string;
}
export interface SegmentedControlProps extends Base, Value<string> {
  options: Option[];
  size?: Size;
}
export interface CalendarProps extends Base, Value<Date | null> {
  min?: Date;
  max?: Date;
}
export interface DatePickerProps extends ControlBase, Value<Date | null> {
  placeholder?: string;
  min?: Date;
  max?: Date;
  size?: Size;
}
export interface DateRange { from: Date | null; to: Date | null }
export interface DateRangePickerProps extends ControlBase, Value<DateRange> {
  placeholder?: string;
  min?: Date;
  max?: Date;
  /** Quick ranges shown beside the calendar. */
  presets?: { label: string; range: DateRange }[];
  size?: Size;
}
export interface FileUploadProps extends ControlBase {
  accept?: string;
  multiple?: boolean;
  /** Bytes. Larger files are rejected with an error message. */
  maxSize?: number;
  onFilesChange?: (files: File[]) => void;
  label?: ReactNode;
  description?: ReactNode;
}

/* ---------- data display ---------- */

export interface BadgeProps extends WithChildren {
  tone?: Tone;
  variant?: 'soft' | 'solid' | 'outline';
}
export interface TagProps extends WithChildren {
  color?: Color;
  size?: 'sm' | 'md';
  onRemove?: () => void;
}
export interface AvatarProps extends Base {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}
export interface AvatarGroupProps extends WithChildren {
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}
export interface KbdProps extends WithChildren {}
export interface CardContract {
  Root: WithChildren & { interactive?: boolean; asChild?: boolean };
  Header: WithChildren;
  Title: WithChildren;
  Description: WithChildren;
  Content: WithChildren;
  Footer: WithChildren;
}
export interface StatProps extends Base {
  label: ReactNode;
  value: ReactNode;
  /** Change vs previous period, e.g. "+4.2%". Tone defaults from `trend`. */
  delta?: ReactNode;
  trend?: 'up' | 'down' | 'flat';
  /** Whether "up" is good (revenue) or bad (costs). Defaults to true. */
  upIsGood?: boolean;
  description?: ReactNode;
  icon?: CoreIconName;
}
export interface TableContract {
  Root: WithChildren & { density?: 'compact' | 'comfortable' };
  Header: WithChildren;
  Body: WithChildren;
  Footer: WithChildren;
  Row: WithChildren & { selected?: boolean; onClick?: () => void };
  Head: WithChildren & { align?: Align; sort?: 'asc' | 'desc' | false; onSort?: () => void };
  Cell: WithChildren & { align?: Align };
}
export interface DataTableColumn<Row> {
  key: string;
  header: ReactNode;
  cell?: (row: Row) => ReactNode;
  align?: Align;
  sortable?: boolean;
  width?: number | string;
  /** Hide below this breakpoint (responsive tables keep the important columns). */
  hideBelow?: 'sm' | 'md' | 'lg';
}
export interface DataTableProps<Row = Record<string, unknown>> extends Base {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  getRowId?: (row: Row) => string;
  sort?: { key: string; direction: 'asc' | 'desc' } | null;
  onSortChange?: (sort: { key: string; direction: 'asc' | 'desc' } | null) => void;
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  onRowClick?: (row: Row) => void;
  loading?: boolean;
  empty?: ReactNode;
  density?: 'compact' | 'comfortable';
}
export interface PaginationProps extends Base {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}
export interface EmptyStateProps extends WithChildren {
  icon?: CoreIconName;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}
export interface SkeletonProps extends Base {
  width?: number | string;
  height?: number | string;
  radius?: 'sm' | 'md' | 'lg' | 'full';
  /** Render N text lines instead of one block. */
  lines?: number;
}
export interface ProgressProps extends Base {
  value: number;
  max?: number;
  tone?: Tone;
  label?: string;
  size?: 'sm' | 'md';
}
export interface SpinnerProps extends Base {
  size?: Size;
  label?: string;
}
export interface TooltipProps extends Base {
  content: ReactNode;
  side?: Side;
  children: ReactNode;
  delayDuration?: number;
}
export interface AccordionContract {
  Root: WithChildren & ({ type: 'single'; collapsible?: boolean } & Value<string> | { type: 'multiple' } & Value<string[]>);
  Item: WithChildren & { value: string; disabled?: boolean };
  Trigger: WithChildren;
  Content: WithChildren;
}

/* ---------- charts ---------- */

export interface ChartSeries {
  key: string;
  label: string;
  color?: Color;
}
interface ChartBase<Datum> extends Base {
  data: Datum[];
  /** Field of each datum used for the x axis / categories. */
  index: keyof Datum & string;
  series: ChartSeries[];
  height?: number;
  /** Format axis + tooltip values (e.g. currency). */
  valueFormat?: (value: number) => string;
  /** Accessible summary; charts also render a visually hidden data table. */
  label: string;
}
export interface LineChartProps<Datum = Record<string, unknown>> extends ChartBase<Datum> { area?: boolean; curved?: boolean }
export interface BarChartProps<Datum = Record<string, unknown>> extends ChartBase<Datum> { stacked?: boolean; layout?: 'vertical' | 'horizontal' }
export interface DonutChartProps extends Base {
  data: { label: string; value: number; color?: Color }[];
  label: string;
  valueFormat?: (value: number) => string;
  /** Text in the middle, e.g. the total. */
  center?: ReactNode;
  size?: number;
}
export interface SparklineProps extends Base {
  data: number[];
  tone?: Tone;
  width?: number;
  height?: number;
  label: string;
}

/* ---------- navigation ---------- */

export interface TabsContract {
  Root: WithChildren & Value<string>;
  List: WithChildren;
  Trigger: WithChildren & { value: string; disabled?: boolean };
  Content: WithChildren & { value: string };
}
export interface BreadcrumbsProps extends Base {
  items: { label: ReactNode; href?: string; icon?: CoreIconName; onClick?: () => void }[];
}
type MenuItemBase = WithChildren & { disabled?: boolean; onSelect?: (event: Event) => void };
export interface MenuContract {
  Root: { children?: ReactNode } & Open;
  Trigger: WithChildren & { asChild?: boolean };
  Content: WithChildren & { align?: Align; side?: Side };
  Item: MenuItemBase & { icon?: CoreIconName; shortcut?: ReactNode; destructive?: boolean };
  CheckboxItem: MenuItemBase & { checked?: boolean; onCheckedChange?: (checked: boolean) => void };
  RadioGroup: WithChildren & { value?: string; onValueChange?: (value: string) => void };
  RadioItem: MenuItemBase & { value: string };
  Label: WithChildren;
  Separator: Base;
  Group: WithChildren;
  Sub: { children?: ReactNode } & Open;
  SubTrigger: WithChildren & { icon?: CoreIconName };
  SubContent: WithChildren;
}
export type ContextMenuContract = Omit<MenuContract, 'Root' | 'Trigger'> & {
  Root: { children?: ReactNode; onOpenChange?: (open: boolean) => void };
  Trigger: WithChildren & { asChild?: boolean };
};
export interface CommandPaletteItem {
  id: string;
  title: ReactNode;
  icon?: CoreIconName;
  keywords?: string;
  shortcut?: ReactNode;
}
export interface CommandPaletteProps extends Base {
  groups: { label: string; items: CommandPaletteItem[] }[];
  onSelect?: (item: CommandPaletteItem) => void;
  placeholder?: string;
  emptyText?: ReactNode;
}
export interface CommandPaletteDialogProps extends CommandPaletteProps, Open {}

/* ---------- overlays ---------- */

export interface DialogContract {
  Root: { children?: ReactNode; modal?: boolean } & Open;
  Trigger: WithChildren & { asChild?: boolean };
  Content: WithChildren & { size?: 'sm' | 'md' | 'lg' };
  Title: WithChildren;
  Description: WithChildren;
  Footer: WithChildren;
  Close: WithChildren & { asChild?: boolean };
}
export interface ConfirmDialogProps extends Open {
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  trigger?: ReactNode;
}
export interface SheetContract {
  Root: { children?: ReactNode } & Open;
  Trigger: WithChildren & { asChild?: boolean };
  Content: WithChildren & { side?: 'left' | 'right' | 'bottom'; size?: 'sm' | 'md' | 'lg' };
  Title: WithChildren;
  Description: WithChildren;
  Footer: WithChildren;
  Close: WithChildren & { asChild?: boolean };
}
export interface PopoverContract {
  Root: { children?: ReactNode } & Open;
  Trigger: WithChildren & { asChild?: boolean };
  Anchor: WithChildren;
  Content: WithChildren & { align?: Align; side?: Side };
  Close: WithChildren & { asChild?: boolean };
}

/* ---------- feedback ---------- */

export interface AlertProps extends WithChildren {
  tone?: Tone;
  title?: ReactNode;
  icon?: CoreIconName;
  action?: ReactNode;
  onDismiss?: () => void;
}
export interface ToastOptions {
  message: ReactNode;
  description?: ReactNode;
  tone?: 'neutral' | 'success' | 'danger';
  action?: { label: string; onClick: () => void };
  /** ms; 0 keeps it until dismissed. */
  duration?: number;
}
export interface ToastApi {
  toast: (options: ToastOptions) => string | number;
  dismiss: (id: string | number) => void;
}
export interface ToastProviderProps { children?: ReactNode }

/* ---------- app shell ---------- */

export interface AppFrameProps extends WithChildren {
  sidebar?: ReactNode;
  topbar?: ReactNode;
  /** Desktop: docked/collapsed. Mobile (< md): the sidebar becomes a drawer, closed by default. */
  sidebarOpen?: boolean;
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
}
export interface SidebarContract {
  Root: WithChildren;
  Header: WithChildren;
  Section: WithChildren & { title?: ReactNode };
  Item: WithChildren & { icon?: CoreIconName; active?: boolean; href?: string; onClick?: () => void; trailing?: ReactNode };
  Footer: WithChildren;
}
export interface TopbarProps extends Base {
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
}
export interface PageHeaderProps extends Base {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}
