import type { SVGProps } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import type { PropertyType, ViewType } from './types';

/** Icon per property type (all drawn from the Lucide-based icon set). */
const propertyIcons: Record<PropertyType, IconName> = {
  title: 'letterCase', text: 'textLines', number: 'hash', select: 'arrowInCircleDown', multi_select: 'bulletedList',
  status: 'circleDashed', date: 'calendarAltEmpty', person: 'person', checkbox: 'checkmarkSquare', url: 'link',
  email: 'at', phone: 'phone', created_time: 'clock',
};

export interface PropertyTypeIconProps extends Omit<SVGProps<SVGSVGElement>, 'type' | 'name'> { type: PropertyType; size?: number }

/** Property-type icon (table header, property menus, filter/sort lists, side-peek rows). Default 16px. */
export function PropertyTypeIcon({ type, size = 16, ...props }: PropertyTypeIconProps) {
  return <Icon name={propertyIcons[type]} size={size} {...props} />;
}

/** Icon per view type (view tabs, view menus, "Add a new view" grid). */
export const viewTypeIcons: Record<ViewType, IconName> = {
  table: 'viewTable', board: 'viewBoard', gallery: 'squareGrid2X2', list: 'bulletedList',
  calendar: 'viewCalendar', timeline: 'viewTimeline', chart: 'viewChart',
};

export const propertyTypeLabels: Record<PropertyType, string> = {
  title: 'Title', text: 'Text', number: 'Number', select: 'Select', multi_select: 'Multi-select', status: 'Status',
  date: 'Date', person: 'Person', checkbox: 'Checkbox', url: 'URL', email: 'Email', phone: 'Phone', created_time: 'Created time',
};
