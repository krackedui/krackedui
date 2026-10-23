// Bayrust's public API. Groups own their exports; this file only re-exports groups (AGENTS.md).
export { Theme, useAppearance, type ThemeProps, type Appearance } from './foundations/theme';
export { Icon, iconPaths, type IconProps, type IconName } from './foundations/icon';
export { Stack, Grid, Divider, type StackProps, type GridProps, type DividerProps } from './layout/layout';
export {
  Button,
  buttonVariants,
  IconButton,
  iconButtonVariants,
  Link,
  type ButtonProps,
  type IconButtonProps,
  type LinkProps,
} from './actions/actions';
export { Field, useFieldControl, type FieldProps } from './forms/field';
export {
  TextInput,
  Textarea,
  SearchInput,
  NumberInput,
  inputVariants,
  type TextInputProps,
  type TextareaProps,
  type SearchInputProps,
  type NumberInputProps,
} from './forms/text-inputs';
export {
  Checkbox,
  RadioGroup,
  Radio,
  Switch,
  SegmentedControl,
  Select,
  segmentedVariants,
  selectVariants,
  type CheckboxProps,
  type RadioGroupProps,
  type RadioProps,
  type SwitchProps,
  type SegmentedControlProps,
  type SelectProps,
  type Option,
} from './forms/choice';
export { Slider, type SliderProps } from './forms/slider';
export { Badge, Tag, Kbd, badgeVariants, type BadgeProps, type TagProps, type KbdProps, type Tone, type Color } from './display/badge';
export { Avatar, AvatarGroup, type AvatarProps, type AvatarGroupProps, type AvatarSize } from './display/avatar';
export {
  Card, CardRoot, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  type CardRootProps, type CardTitleProps,
} from './display/card';
export {
  Table, TableRoot, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell,
  type TableRootProps, type TableRowProps, type TableHeadProps, type TableCellProps,
} from './display/table';
export {
  Accordion, AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent,
  type AccordionRootProps, type AccordionItemProps,
} from './display/accordion';
export { Stat, EmptyState, type StatProps, type EmptyStateProps } from './display/stat';
export { Skeleton, Progress, Spinner, type SkeletonProps, type ProgressProps, type SpinnerProps } from './feedback/status';
export { Tabs, TabsRoot, TabsList, TabsTrigger, TabsContent, type TabsRootProps, type TabsTriggerProps, type TabsContentProps } from './navigation/tabs';
export { Breadcrumbs, type BreadcrumbsProps, type BreadcrumbItem } from './navigation/breadcrumbs';
export {
  Menu, MenuRoot, MenuTrigger, MenuContent, MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem,
  MenuLabel, MenuSeparator, MenuGroup, MenuSub, MenuSubTrigger, MenuSubContent,
  type MenuRootProps, type MenuTriggerProps, type MenuContentProps, type MenuItemProps,
  type MenuCheckboxItemProps, type MenuRadioItemProps,
} from './navigation/menu';
export {
  Dialog, DialogRoot, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogClose,
  Sheet, SheetRoot, SheetTrigger, SheetContent, SheetTitle, SheetDescription, SheetFooter, SheetClose,
  type DialogRootProps, type DialogTriggerProps, type DialogContentProps, type DialogCloseProps, type SheetContentProps,
} from './overlays/dialog';
export {
  Popover, PopoverRoot, PopoverTrigger, PopoverAnchor, PopoverContent, PopoverClose, Tooltip,
  type PopoverRootProps, type PopoverTriggerProps, type PopoverContentProps, type TooltipProps,
} from './overlays/popover';
export {
  LineChart, BarChart, DonutChart, Sparkline, seriesColor, chartSlots,
  type LineChartProps, type BarChartProps, type DonutChartProps, type SparklineProps, type ChartSeries,
} from './charts/charts';
export { DataTable, Pagination, type DataTableProps, type DataTableColumn, type PaginationProps } from './display/data-table';
export {
  Alert, ToastProvider, useToast,
  type AlertProps, type ToastOptions, type ToastApi, type ToastProviderProps,
} from './feedback/alert';
export {
  AppFrame, Sidebar, SidebarRoot, SidebarHeader, SidebarSection, SidebarItem, SidebarFooter, Topbar, PageHeader,
  type AppFrameProps, type SidebarSectionProps, type SidebarItemProps, type TopbarProps, type PageHeaderProps,
} from './shell/shell';
export { Calendar, isSameDay, startOfDay, type CalendarProps } from './forms/calendar';
export {
  DatePicker, DateRangePicker,
  type DatePickerProps, type DateRangePickerProps, type DateRange,
} from './forms/date-picker';
export { Combobox, type ComboboxProps } from './forms/combobox';
export { FileUpload, type FileUploadProps } from './forms/file-upload';
export { ConfirmDialog, type ConfirmDialogProps } from './overlays/confirm-dialog';
export {
  ContextMenu, ContextMenuRoot, ContextMenuTrigger, ContextMenuContent, ContextMenuItem,
  ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuLabel,
  ContextMenuSeparator, ContextMenuGroup, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent,
  type ContextMenuRootProps, type ContextMenuTriggerProps,
} from './navigation/context-menu';
export {
  CommandPalette, CommandPaletteDialog,
  type CommandPaletteProps, type CommandPaletteDialogProps, type CommandPaletteItem,
} from './overlays/command-palette';
export { useTheme } from './foundations/theme';
export { cn } from './lib/cn';
