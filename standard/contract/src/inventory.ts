// The inventory: every export a system must provide, with what the gate requires of it.
// The gate reads this list to generate the contract type checks, find each component's behaviour
// test, docs page, responsive sweep and SYSTEM.md entry. Adding an entry here raises the bar for
// every system at once; removing one needs a written reason in standard/CHANGELOG.md.

export type Category =
  | 'foundations' | 'layout' | 'actions' | 'forms' | 'data-display' | 'charts'
  | 'navigation' | 'overlays' | 'feedback' | 'app-shell';

export interface InventoryEntry {
  /** Export name in the system's package. */
  name: string;
  category: Category;
  kind: 'component' | 'compound' | 'hook' | 'function' | 'provider';
  /** Contract type in ./components (props interface, or `XContract` with one key per part). */
  contract: string;
  /** For compounds: parts every system exports (as `Name.Part` and flat `NamePart`). */
  parts?: string[];
  /** WAI-ARIA Authoring Practices pattern the behaviour test verifies, if any. */
  pattern?: string;
  /** Interactive: needs keyboard + focus-visible + target-size checks. */
  interactive: boolean;
  summary: string;
}

const c = (e: InventoryEntry) => e;

export const inventory: InventoryEntry[] = [
  // foundations
  c({ name: 'Theme', category: 'foundations', kind: 'provider', contract: 'ThemeProps', interactive: false, summary: 'Root that applies the system’s fonts, tokens and light/dark appearance.' }),
  c({ name: 'Icon', category: 'foundations', kind: 'component', contract: 'IconProps', interactive: false, summary: 'Named icon; decorative unless given a label.' }),

  // layout
  c({ name: 'Stack', category: 'layout', kind: 'component', contract: 'StackProps', interactive: false, summary: 'Flex row/column with token gaps; responsive direction.' }),
  c({ name: 'Grid', category: 'layout', kind: 'component', contract: 'GridProps', interactive: false, summary: 'Responsive column grid with token gaps.' }),
  c({ name: 'Divider', category: 'layout', kind: 'component', contract: 'DividerProps', interactive: false, summary: 'Horizontal or vertical separator.' }),

  // actions
  c({ name: 'Button', category: 'actions', kind: 'component', contract: 'ButtonProps', pattern: 'button', interactive: true, summary: 'Primary, secondary, ghost and danger actions, with icons and loading.' }),
  c({ name: 'IconButton', category: 'actions', kind: 'component', contract: 'IconButtonProps', pattern: 'button', interactive: true, summary: 'Icon-only action with a required accessible label.' }),
  c({ name: 'Link', category: 'actions', kind: 'component', contract: 'LinkProps', pattern: 'link', interactive: true, summary: 'Inline link; external links open safely in a new tab.' }),

  // forms
  c({ name: 'Field', category: 'forms', kind: 'component', contract: 'FieldProps', interactive: false, summary: 'Label, description and error around one control, wired for assistive tech.' }),
  c({ name: 'TextInput', category: 'forms', kind: 'component', contract: 'TextInputProps', interactive: true, summary: 'Single-line text input with optional icon and trailing content.' }),
  c({ name: 'Textarea', category: 'forms', kind: 'component', contract: 'TextareaProps', interactive: true, summary: 'Multi-line text input.' }),
  c({ name: 'SearchInput', category: 'forms', kind: 'component', contract: 'SearchInputProps', interactive: true, summary: 'Search field with a clear button.' }),
  c({ name: 'NumberInput', category: 'forms', kind: 'component', contract: 'NumberInputProps', pattern: 'spinbutton', interactive: true, summary: 'Numeric input with min/max/step and Intl formatting (currency, percent).' }),
  c({ name: 'Select', category: 'forms', kind: 'component', contract: 'SelectProps', pattern: 'listbox', interactive: true, summary: 'Pick one option from a short list.' }),
  c({ name: 'Combobox', category: 'forms', kind: 'component', contract: 'ComboboxProps', pattern: 'combobox', interactive: true, summary: 'Searchable select for long lists.' }),
  c({ name: 'Checkbox', category: 'forms', kind: 'component', contract: 'CheckboxProps', pattern: 'checkbox', interactive: true, summary: 'Checkbox with label and indeterminate state.' }),
  c({ name: 'RadioGroup', category: 'forms', kind: 'component', contract: 'RadioGroupProps', pattern: 'radio', interactive: true, summary: 'Group of mutually exclusive options.' }),
  c({ name: 'Radio', category: 'forms', kind: 'component', contract: 'RadioProps', pattern: 'radio', interactive: true, summary: 'One option inside a RadioGroup.' }),
  c({ name: 'Switch', category: 'forms', kind: 'component', contract: 'SwitchProps', pattern: 'switch', interactive: true, summary: 'On/off toggle that applies immediately.' }),
  c({ name: 'Slider', category: 'forms', kind: 'component', contract: 'SliderProps', pattern: 'slider', interactive: true, summary: 'Pick a number or range by dragging or arrow keys.' }),
  c({ name: 'SegmentedControl', category: 'forms', kind: 'component', contract: 'SegmentedControlProps', pattern: 'radio', interactive: true, summary: 'Small set of exclusive options shown inline.' }),
  c({ name: 'Calendar', category: 'forms', kind: 'component', contract: 'CalendarProps', pattern: 'grid', interactive: true, summary: 'Inline month grid for picking a date.' }),
  c({ name: 'DatePicker', category: 'forms', kind: 'component', contract: 'DatePickerProps', pattern: 'dialog', interactive: true, summary: 'Date field that opens a calendar.' }),
  c({ name: 'DateRangePicker', category: 'forms', kind: 'component', contract: 'DateRangePickerProps', pattern: 'dialog', interactive: true, summary: 'Start/end date field with presets.' }),
  c({ name: 'FileUpload', category: 'forms', kind: 'component', contract: 'FileUploadProps', interactive: true, summary: 'Drop zone + file button with type/size validation.' }),

  // data display
  c({ name: 'Badge', category: 'data-display', kind: 'component', contract: 'BadgeProps', interactive: false, summary: 'Short status or count label by tone.' }),
  c({ name: 'Tag', category: 'data-display', kind: 'component', contract: 'TagProps', interactive: false, summary: 'Categorical label by color, optionally removable.' }),
  c({ name: 'Avatar', category: 'data-display', kind: 'component', contract: 'AvatarProps', interactive: false, summary: 'Person or workspace image with initials fallback.' }),
  c({ name: 'AvatarGroup', category: 'data-display', kind: 'component', contract: 'AvatarGroupProps', interactive: false, summary: 'Overlapping avatars with +N overflow.' }),
  c({ name: 'Kbd', category: 'data-display', kind: 'component', contract: 'KbdProps', interactive: false, summary: 'Keyboard key or shortcut.' }),
  c({ name: 'Card', category: 'data-display', kind: 'compound', contract: 'CardContract', parts: ['Root', 'Header', 'Title', 'Description', 'Content', 'Footer'], interactive: false, summary: 'Grouped content surface.' }),
  c({ name: 'Stat', category: 'data-display', kind: 'component', contract: 'StatProps', interactive: false, summary: 'Key metric with delta and trend.' }),
  c({ name: 'Table', category: 'data-display', kind: 'compound', contract: 'TableContract', parts: ['Root', 'Header', 'Body', 'Footer', 'Row', 'Head', 'Cell'], pattern: 'table', interactive: false, summary: 'Styled table primitives; scrolls horizontally on small screens.' }),
  c({ name: 'DataTable', category: 'data-display', kind: 'component', contract: 'DataTableProps', pattern: 'table', interactive: true, summary: 'Columns + rows with sorting, selection, loading and empty states.' }),
  c({ name: 'Pagination', category: 'navigation', kind: 'component', contract: 'PaginationProps', pattern: 'navigation', interactive: true, summary: 'Page navigation for lists and tables.' }),
  c({ name: 'EmptyState', category: 'data-display', kind: 'component', contract: 'EmptyStateProps', interactive: false, summary: 'What to show when there is nothing yet, with a next action.' }),
  c({ name: 'Skeleton', category: 'feedback', kind: 'component', contract: 'SkeletonProps', interactive: false, summary: 'Loading placeholder shaped like the content.' }),
  c({ name: 'Progress', category: 'feedback', kind: 'component', contract: 'ProgressProps', pattern: 'progressbar', interactive: false, summary: 'Determinate progress bar.' }),
  c({ name: 'Spinner', category: 'feedback', kind: 'component', contract: 'SpinnerProps', interactive: false, summary: 'Indeterminate loading indicator.' }),
  c({ name: 'Tooltip', category: 'overlays', kind: 'component', contract: 'TooltipProps', pattern: 'tooltip', interactive: true, summary: 'Short hint on hover and focus.' }),
  c({ name: 'Accordion', category: 'data-display', kind: 'compound', contract: 'AccordionContract', parts: ['Root', 'Item', 'Trigger', 'Content'], pattern: 'accordion', interactive: true, summary: 'Expandable sections.' }),

  // charts
  c({ name: 'LineChart', category: 'charts', kind: 'component', contract: 'LineChartProps', interactive: false, summary: 'Trends over time; optional area fill.' }),
  c({ name: 'BarChart', category: 'charts', kind: 'component', contract: 'BarChartProps', interactive: false, summary: 'Compare categories; grouped or stacked.' }),
  c({ name: 'DonutChart', category: 'charts', kind: 'component', contract: 'DonutChartProps', interactive: false, summary: 'Parts of a whole.' }),
  c({ name: 'Sparkline', category: 'charts', kind: 'component', contract: 'SparklineProps', interactive: false, summary: 'Tiny inline trend.' }),

  // navigation
  c({ name: 'Tabs', category: 'navigation', kind: 'compound', contract: 'TabsContract', parts: ['Root', 'List', 'Trigger', 'Content'], pattern: 'tabs', interactive: true, summary: 'Switch between views of the same context.' }),
  c({ name: 'Breadcrumbs', category: 'navigation', kind: 'component', contract: 'BreadcrumbsProps', pattern: 'breadcrumb', interactive: true, summary: 'Location in a hierarchy; collapses on small screens.' }),
  c({ name: 'Menu', category: 'navigation', kind: 'compound', contract: 'MenuContract', parts: ['Root', 'Trigger', 'Content', 'Item', 'CheckboxItem', 'RadioGroup', 'RadioItem', 'Label', 'Separator', 'Group', 'Sub', 'SubTrigger', 'SubContent'], pattern: 'menu-button', interactive: true, summary: 'Dropdown menu of actions.' }),
  c({ name: 'ContextMenu', category: 'navigation', kind: 'compound', contract: 'ContextMenuContract', parts: ['Root', 'Trigger', 'Content', 'Item', 'CheckboxItem', 'RadioGroup', 'RadioItem', 'Label', 'Separator', 'Group', 'Sub', 'SubTrigger', 'SubContent'], pattern: 'menu', interactive: true, summary: 'Right-click menu.' }),
  c({ name: 'CommandPalette', category: 'navigation', kind: 'component', contract: 'CommandPaletteProps', pattern: 'combobox', interactive: true, summary: 'Searchable list of commands (inline).' }),
  c({ name: 'CommandPaletteDialog', category: 'navigation', kind: 'component', contract: 'CommandPaletteDialogProps', pattern: 'dialog', interactive: true, summary: 'Command palette in a modal, usually on ⌘K.' }),

  // overlays
  c({ name: 'Dialog', category: 'overlays', kind: 'compound', contract: 'DialogContract', parts: ['Root', 'Trigger', 'Content', 'Title', 'Description', 'Footer', 'Close'], pattern: 'dialog-modal', interactive: true, summary: 'Modal dialog.' }),
  c({ name: 'ConfirmDialog', category: 'overlays', kind: 'component', contract: 'ConfirmDialogProps', pattern: 'alertdialog', interactive: true, summary: 'Confirm or cancel a consequential action.' }),
  c({ name: 'Sheet', category: 'overlays', kind: 'compound', contract: 'SheetContract', parts: ['Root', 'Trigger', 'Content', 'Title', 'Description', 'Footer', 'Close'], pattern: 'dialog-modal', interactive: true, summary: 'Panel that slides in from an edge; full-width on phones.' }),
  c({ name: 'Popover', category: 'overlays', kind: 'compound', contract: 'PopoverContract', parts: ['Root', 'Trigger', 'Anchor', 'Content', 'Close'], pattern: 'dialog', interactive: true, summary: 'Floating panel anchored to a trigger.' }),

  // feedback
  c({ name: 'Alert', category: 'feedback', kind: 'component', contract: 'AlertProps', pattern: 'alert', interactive: false, summary: 'Inline message by tone, with optional action and dismiss.' }),
  c({ name: 'ToastProvider', category: 'feedback', kind: 'provider', contract: 'ToastProviderProps', interactive: false, summary: 'Hosts toasts; put once near the root.' }),
  c({ name: 'useToast', category: 'feedback', kind: 'hook', contract: 'ToastApi', pattern: 'alert', interactive: true, summary: 'Show and dismiss toasts.' }),

  // app shell
  c({ name: 'AppFrame', category: 'app-shell', kind: 'component', contract: 'AppFrameProps', interactive: true, summary: 'Sidebar + top bar + content; sidebar becomes a drawer on phones.' }),
  c({ name: 'Sidebar', category: 'app-shell', kind: 'compound', contract: 'SidebarContract', parts: ['Root', 'Header', 'Section', 'Item', 'Footer'], pattern: 'navigation', interactive: true, summary: 'App navigation.' }),
  c({ name: 'Topbar', category: 'app-shell', kind: 'component', contract: 'TopbarProps', interactive: false, summary: 'Top bar with breadcrumbs and actions.' }),
  c({ name: 'PageHeader', category: 'app-shell', kind: 'component', contract: 'PageHeaderProps', interactive: false, summary: 'Page title, description and actions.' }),
];

/** Viewport widths every example and template must render at without horizontal overflow. */
export const breakpoints = { base: 0, sm: 640, md: 768, lg: 1024, xl: 1280 } as const;
export const responsiveWidths = [320, 375, 768, 1024, 1440] as const;

/** Minimum interactive target on touch devices (WCAG 2.5.8 AA is 24; we require 24 everywhere, 44 recommended). */
export const minTouchTarget = 24;

/** Optional modules: a system may ship them; if it does, their exports follow the same gate. */
export const modules = {
  editor: 'Block editor (blocks, slash menu, toolbar)',
  database: 'Database views (table, board, gallery, list, calendar, timeline, chart)',
} as const;
