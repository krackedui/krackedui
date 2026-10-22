import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Checkbox, StatusPill, Tag } from '../atoms';
import { findOption, formatDate } from './query';
import type { Property, PropertyValue } from './types';

export interface PropertyValueViewProps {
  property: Property;
  value: PropertyValue | undefined;
  /** `sm` = compact tags used in list/board/gallery cards. */
  size?: 'md' | 'sm';
  /** Wrap multi tags (table cells wrap only when "Wrap content" is on; default no-wrap). */
  wrap?: boolean;
  onToggle?: (checked: boolean) => void;
  className?: string;
  /** Placeholder for empty values (side peek shows "Empty"). */
  empty?: ReactNode;
}

/**
 * Read-only renderer for one property value, per type. Gaps measured in db-table cells:
 * tags gap 6px 8px; text 14/21; title 500 weight.
 */
export function PropertyValueView({ property: p, value: v, size = 'md', wrap, onToggle, className, empty = null }: PropertyValueViewProps) {
  const gap = cn('flex min-w-0 items-center gap-x-1.5 gap-y-1.5', wrap ? 'flex-wrap' : 'overflow-hidden');
  switch (p.type) {
    case 'select': {
      const o = findOption(p, v);
      return o ? <span className={cn(gap, className)}><Tag color={o.color} size={size}>{o.name}</Tag></span> : <>{empty}</>;
    }
    case 'status': {
      const o = findOption(p, v);
      return o ? <span className={cn(gap, className)}><StatusPill color={o.color} size={size}>{o.name}</StatusPill></span> : <>{empty}</>;
    }
    case 'multi_select': {
      const ids = (v as string[] | undefined) ?? [];
      if (!ids.length) return <>{empty}</>;
      return (
        <span className={cn(gap, className)}>
          {ids.map((id) => { const o = findOption(p, id); return o ? <Tag key={id} color={o.color} size={size}>{o.name}</Tag> : null; })}
        </span>
      );
    }
    case 'person': {
      const ids = (v as string[] | undefined) ?? [];
      if (!ids.length) return <>{empty}</>;
      return (
        <span className={cn(gap, className)}>
          {ids.map((id) => {
            const person = p.people.find((x) => x.id === id);
            if (!person) return null;
            return (
              <span key={id} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="flex size-5 items-center justify-center rounded-full bg-n-bg-tertiary text-[11px] text-n-text-secondary">{person.name[0]}</span>
                {person.name}
              </span>
            );
          })}
        </span>
      );
    }
    case 'checkbox':
      return <Checkbox aria-label={p.name} checked={!!v} onCheckedChange={(c) => onToggle?.(c)} onClick={(e) => e.stopPropagation()} className={className} />;
    case 'date':
    case 'created_time':
      return v ? <span className={cn('whitespace-nowrap', className)}>{formatDate(String(v), p.type === 'date' && p.dateFormat === 'short' ? 'short' : 'full')}</span> : <>{empty}</>;
    case 'number':
      return v === null || v === undefined || v === '' ? <>{empty}</> : (
        <span className={cn('block text-right tabular-nums', className)}>
          {p.format === 'percent' ? `${String(v)}%` : p.format === 'dollar' ? `$${Number(v).toLocaleString()}` : String(v)}
        </span>
      );
    case 'url':
    case 'email':
    case 'phone':
      return v ? (
        <a
          href={p.type === 'url' ? String(v) : p.type === 'email' ? `mailto:${String(v)}` : `tel:${String(v)}`}
          onClick={(e) => e.stopPropagation()}
          className={cn('truncate text-n-text-primary underline decoration-n-link-decoration-color underline-offset-2', className)}
        >
          {String(v)}
        </a>
      ) : <>{empty}</>;
    case 'title':
      return <span className={cn('truncate font-medium', className)}>{String(v ?? '')}</span>;
    default:
      return v ? <span className={cn(wrap ? 'whitespace-pre-wrap' : 'truncate', className)}>{String(v)}</span> : <>{empty}</>;
  }
}
