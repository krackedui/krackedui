import { forwardRef, useEffect, useState, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../icons/Icon';
import { MenuList, MenuRow, MenuSeparator } from '../components/Menu';
import { Switch } from '../atoms';
import { formatDate, MONTHS_SHORT, parseDate, sameDay, toISODate } from './query';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** 6x7 grid of dates starting on the Sunday on/before the 1st. */
export function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

export interface DateCellPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** ISO date (YYYY-MM-DD) or null. */
  value: string | null;
  onChange?: (iso: string | null) => void;
  /** "Today" (defaults to the real date; lab passes the capture's 2026-10-15). */
  today?: string;
  width?: number;
}

/**
 * Date property picker (capture: db-date-picker). Measured: 248 wide, radius 6, shadow outline-lg; date input
 * 224x28 (bg-secondary-translucent-a, 1px border-primary-translucent-a ring, radius 6); caption "Oct 2026" 14/500;
 * "Today" 12/500 text-secondary (AA; capture: icon-secondary); 32px day cells with 28px buttons radius 6; selected = blue-bg-solid (AA; the capture's blue-icon-accent-primary is 3.9:1 with white),
 * today = red-bg-solid circle (AA; capture: red-icon-accent-primary, 3.3:1); switches 30x18; rows 28px.
 */
export const DateCellPicker = forwardRef<HTMLDivElement, DateCellPickerProps>(function DateCellPicker(
  { value, onChange, today: todayIso, width = 248, className, style, ...props }, ref,
) {
  const today = parseDate(todayIso) ?? new Date();
  const selected = parseDate(value);
  const [month, setMonth] = useState(() => selected ?? today);
  const [text, setText] = useState(value ? formatDate(value, 'short') : '');
  const [endDate, setEndDate] = useState(false);
  const [includeTime, setIncludeTime] = useState(false);
  useEffect(() => { setText(value ? formatDate(value, 'short') : ''); }, [value]);

  const commitText = () => {
    const d = new Date(text);
    if (!text.trim()) onChange?.(null);
    else if (!isNaN(d.getTime())) { onChange?.(toISODate(d)); setMonth(d); }
  };
  const shift = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));

  return (
    <div ref={ref} className={cn('overflow-hidden rounded-n-md bg-n-bg-elevated shadow-n-shadow-outline-lg', className)} style={{ width, ...style }} {...props}>
      <div className="flex flex-col gap-px p-1">
        <div className="flex p-2">
          <input
            aria-label="Date"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commitText}
            onKeyDown={(e) => e.key === 'Enter' && commitText()}
            className="h-7 w-full rounded-n-md bg-n-bg-secondary-translucent-a px-2 text-[14px] leading-[16.8px] text-n-text-primary shadow-[0_0_0_1px_var(--n-border-primary-translucent-a)] outline-none focus:shadow-n-input-blue-focus-ring"
          />
        </div>
        <div className="px-2 text-[14px] leading-[21px]">
          <div className="flex h-[25px] items-center justify-between">
            <h2 className="px-[5.5px] font-medium">{MONTHS_SHORT[month.getMonth()]} {month.getFullYear()}</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setMonth(today)} className="h-5 cursor-pointer rounded-n-xs px-2 text-[12px] font-medium leading-[14.4px] text-n-text-secondary hover:bg-n-button-hover-bg-a">Today</button>
              <button type="button" aria-label="Go to previous month" onClick={() => shift(-1)} className="flex size-5 cursor-pointer items-center justify-center rounded-n-xs text-n-icon-tertiary hover:bg-n-button-hover-bg-a">
                <Icon name="arrowChevronSingleLeftSmall" size={16} />
              </button>
              <button type="button" aria-label="Go to next month" onClick={() => shift(1)} className="flex size-5 cursor-pointer items-center justify-center rounded-n-xs text-n-icon-tertiary hover:bg-n-button-hover-bg-a">
                <Icon name="arrowChevronSingleRightSmall" size={16} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7">
            {WEEKDAYS.map((d) => (
              <div key={d} aria-hidden className="flex h-8 items-center justify-center text-[12px] leading-[18px] text-n-text-tertiary">{d}</div>
            ))}
            {monthGrid(month).map((d) => {
              const outside = d.getMonth() !== month.getMonth();
              const isSel = selected && sameDay(d, selected);
              const isToday = sameDay(d, today);
              return (
                <div key={d.toISOString()} className="flex size-8 items-center justify-center">
                  <button
                    type="button"
                    aria-label={d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    aria-pressed={!!isSel}
                    onClick={() => { onChange?.(toISODate(d)); }}
                    className={cn(
                      'relative flex size-7 cursor-pointer items-center justify-center rounded-n-md leading-[16.8px]',
                      isSel ? 'bg-n-blue-bg-solid text-n-text-on-solid' : 'hover:bg-n-button-hover-bg-a',
                      !isSel && outside && 'text-n-text-tertiary',
                      !isSel && isToday && 'z-[1] text-n-text-on-solid before:absolute before:inset-0 before:-z-[1] before:rounded-full before:bg-n-red-bg-solid',
                    )}
                  >
                    {d.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MenuSeparator className="mx-3 my-0" />
      <MenuList role="group">
        <MenuRow role="none" aria-selected={undefined} trailing={<Switch aria-label="End date" checked={endDate} onCheckedChange={setEndDate} onClick={(e) => e.stopPropagation()} />} onClick={() => setEndDate(!endDate)}>End date</MenuRow>
        <MenuRow role="button" tabIndex={0} aria-selected={undefined} trailing={<span className="flex items-center gap-1 text-[14px] text-n-text-secondary">Full date<Icon name="arrowChevronSingleRightSmall" size={14} className="text-n-icon-tertiary" /></span>}>Date format</MenuRow>
        <MenuRow role="none" aria-selected={undefined} trailing={<Switch aria-label="Include time" checked={includeTime} onCheckedChange={setIncludeTime} onClick={(e) => e.stopPropagation()} />} onClick={() => setIncludeTime(!includeTime)}>Include time</MenuRow>
        <MenuRow role="button" tabIndex={0} aria-selected={undefined} trailing={<span className="flex items-center gap-1 text-[14px] text-n-text-secondary">None<Icon name="arrowChevronSingleRightSmall" size={14} className="text-n-icon-tertiary" /></span>}>Remind</MenuRow>
      </MenuList>
      <MenuSeparator className="mx-3 my-0" />
      <MenuList role="group">
        <MenuRow role="button" tabIndex={0} aria-selected={undefined} onClick={() => onChange?.(null)}>Clear</MenuRow>
      </MenuList>
      <MenuSeparator className="mx-3 my-0" />
      <MenuList role="group">
        <MenuRow role="button" tabIndex={0} aria-selected={undefined} icon="questionMarkCircle" className="text-n-text-secondary [&>span:first-child]:text-n-icon-secondary">Learn about reminders</MenuRow>
      </MenuList>
    </div>
  );
});
