import { forwardRef, useEffect, useMemo, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { tv } from '../lib/tv';
import { Icon } from '../icons/Icon';
import { MenuList, MenuRow } from './Menu';

/**
 * Date menu (db-date-picker): the 248px date property popover content (typed date, month grid, End date /
 * Include time / Remind options). For a date form field use DatePicker (forms).
 * - date input: wrapper padding 8; field 28px, padding 0 8, radius 6, bg-secondary-translucent, 1px border-primary-translucent ring
 * - caption: 224px wide (inset 12), "Oct 2026" 14/500; right group gap 8: "Today" 12/500 icon-secondary (h20, px 8, radius 3),
 *   prev/next 20x20 chevrons icon-tertiary
 * - weekday row and days: 7 x 32px cells; weekday labels 12/18 and outside-month days in a gray with no token (text-secondary used);
 *   day button 28x28 radius 6, 14/16.8; selected = blue-icon-accent-primary bg + white; today = red filled circle + white
 * - options: "End date" ⊙ switch, "Date format  Full date ›", "Include time" switch, "Remind  None ›"; then "Clear";
 *   then "Learn about reminders" (questionMarkCircle, text-secondary). Sections divided by the inset line.
 */
export const dateMenuVariants = tv({
  slots: {
    field: 'flex h-7 items-center rounded-n-md bg-n-bg-secondary-translucent-a px-2 text-[14px] leading-[16.8px] shadow-[0_0_0_1px_var(--n-border-primary-translucent-a)] focus-within:shadow-n-input-blue-focus-ring',
    caption: 'mx-2 flex h-[25px] items-center justify-between',
    title: 'px-[3.5px] text-[14px] font-medium leading-[21px] text-n-text-primary',
    // text-secondary, not icon-secondary: the captured grey misses 4.5:1 for 12px text.
    today: 'flex h-5 cursor-pointer items-center rounded-n-xs px-2 text-[12px] font-medium leading-[14.4px] text-n-text-secondary hover:bg-n-button-hover-bg-a',
    nav: 'flex size-5 cursor-pointer items-center justify-center rounded-n-xs text-n-icon-tertiary hover:bg-n-button-hover-bg-a',
    grid: 'mx-2 grid grid-cols-[repeat(7,32px)]',
    // The capture's weekday / outside-day gray has no token; text-secondary is the nearest AA-passing one.
    head: 'flex size-8 items-center justify-center text-[12px] leading-[18px] text-n-text-secondary',
    cell: 'flex size-8 items-center justify-center',
    day: [
      'relative flex size-7 cursor-pointer items-center justify-center rounded-n-md text-[14px] leading-[16.8px] text-n-text-primary outline-none',
      'hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow',
    ],
  },
  variants: {
    state: {
      default: {},
      outside: { day: 'text-n-text-secondary' },
      selected: { day: 'bg-n-blue-bg-solid text-n-text-on-solid hover:bg-n-blue-bg-solid-hover' },
      today: { day: 'text-n-text-on-solid before:absolute before:inset-0.5 before:-z-0 before:rounded-full before:bg-n-red-bg-solid hover:bg-transparent [&>span]:relative' },
    },
  },
});
const s = dateMenuVariants();

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const sameDay = (a?: Date | null, b?: Date | null) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
/** "Oct 12, 2026" ("Full date" format). */
export const formatDisplayDate = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

export interface DateMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: Date | null;
  onChange?: (d: Date | null) => void;
  /** Defaults to now; pass a fixed date for static renders. */
  today?: Date;
  /** Initially displayed month (defaults to value or today). */
  defaultMonth?: Date;
  /** Show the options rows (End date, Date format, Include time, Remind) and Clear/Learn footer. Default true. */
  showOptions?: boolean;
  dateFormatLabel?: ReactNode;
  remindLabel?: ReactNode;
  endDate?: boolean;
  onEndDateChange?: (v: boolean) => void;
  includeTime?: boolean;
  onIncludeTimeChange?: (v: boolean) => void;
  /** Called when "Date format" is chosen (open your format submenu). Without it the row is informational. */
  onDateFormatClick?: () => void;
  /** Called when "Remind" is chosen (open your reminder submenu). Without it the row is informational. */
  onRemindClick?: () => void;
  /** Called when "Learn about reminders" is chosen. Without it the row is informational. */
  onLearnClick?: () => void;
  /** Highlight a footer row (static renders), e.g. "learn". */
  highlightedRow?: 'learn' | 'clear';
}

/**
 * DateMenu: the date property menu content (date field, month grid, options). Wrap it in
 * <Popover.Content width={248}> or <PopoverSurface width={248}>. For a form field use DatePicker.
 */
export const DateMenu = forwardRef<HTMLDivElement, DateMenuProps>(function DateMenu(
  { value, onChange, today: todayProp, defaultMonth, showOptions = true, dateFormatLabel = 'Full date', remindLabel = 'None',
    endDate, onEndDateChange, includeTime, onIncludeTimeChange, onDateFormatClick, onRemindClick, onLearnClick, highlightedRow, className, ...props }, ref,
) {
  const today = useMemo(() => todayProp ?? new Date(), [todayProp]);
  const [month, setMonth] = useState(() => { const b = defaultMonth ?? value ?? today; return new Date(b.getFullYear(), b.getMonth(), 1); });
  const [text, setText] = useState(value ? formatDisplayDate(value) : '');
  const [end, setEnd] = useState(!!endDate);
  const [time, setTime] = useState(!!includeTime);
  useEffect(() => { setText(value ? formatDisplayDate(value) : ''); }, [value]);

  const days = useMemo(() => {
    const start = new Date(month); start.setDate(1 - month.getDay());
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [month]);
  const shift = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));
  const commitText = () => {
    const d = new Date(text);
    if (!isNaN(d.getTime())) { onChange?.(d); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)); }
  };

  return (
    <div ref={ref} className={cn('flex w-[248px] flex-col', className)} {...props}>
      <div className="relative flex flex-col gap-px p-1 pb-1">
        <div className="p-2">
          <label className={s.field()}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={commitText}
              onKeyDown={(e) => { if (e.key === 'Enter') commitText(); }}
              aria-label="Date"
              className="min-w-0 flex-1 bg-transparent text-n-text-primary outline-none"
            />
          </label>
        </div>
        <div className={s.caption()}>
          <div aria-live="polite" className={s.title()}>{MONTHS[month.getMonth()]} {month.getFullYear()}</div>
          <div className="flex items-center gap-2">
            <button type="button" className={s.today()} onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>Today</button>
            <button type="button" aria-label="Go to previous month" className={s.nav()} onClick={() => shift(-1)}><Icon name="arrowChevronSingleLeftSmall" size={16} /></button>
            <button type="button" aria-label="Go to next month" className={s.nav()} onClick={() => shift(1)}><Icon name="arrowChevronSingleRightSmall" size={16} /></button>
          </div>
        </div>
        {/* Not an ARIA grid (no arrow-key navigation here): a group of day buttons, each with its full date as name. */}
        <div role="group" aria-label={`${MONTHS[month.getMonth()]} ${month.getFullYear()}`} className={s.grid()}>
          {WEEK.map((w) => <div key={w} aria-hidden="true" className={s.head()}>{w}</div>)}
          {days.map((d) => {
            const state = sameDay(d, value) ? 'selected' : sameDay(d, today) ? 'today' : d.getMonth() !== month.getMonth() ? 'outside' : 'default';
            return (
              <div key={d.toISOString()} className={s.cell()}>
                <button
                  type="button"
                  aria-label={d.toDateString()}
                  aria-pressed={state === 'selected'}
                  className={dateMenuVariants({ state }).day()}
                  onClick={() => { onChange?.(d); if (d.getMonth() !== month.getMonth()) setMonth(new Date(d.getFullYear(), d.getMonth(), 1)); }}
                >
                  <span>{d.getDate()}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {showOptions && (
        <>
          {/* Static rows: each actionable row is a Tab stop; Enter / Space activate it (MenuRow). */}
          <MenuList separator aria-label="Date options">
            <MenuRow tabIndex={0} toggle={end} onToggle={(v) => { setEnd(v); onEndDateChange?.(v); }}>End date</MenuRow>
            <MenuRow tabIndex={onDateFormatClick ? 0 : undefined} onClick={onDateFormatClick} trailing={<Icon name="arrowChevronSingleRightSmall" size={14} />} description={dateFormatLabel}>Date format</MenuRow>
            <MenuRow tabIndex={0} toggle={time} onToggle={(v) => { setTime(v); onIncludeTimeChange?.(v); }}>Include time</MenuRow>
            <MenuRow tabIndex={onRemindClick ? 0 : undefined} onClick={onRemindClick} trailing={<Icon name="arrowChevronSingleRightSmall" size={14} />} description={remindLabel}>Remind</MenuRow>
          </MenuList>
          <MenuList separator aria-label="Clear date">
            <MenuRow tabIndex={0} highlighted={highlightedRow === 'clear'} onClick={() => onChange?.(null)}>Clear</MenuRow>
          </MenuList>
          <MenuList separator aria-label="Help">
            <MenuRow tabIndex={onLearnClick ? 0 : undefined} onClick={onLearnClick} icon={<Icon name="questionMarkCircle" size={20} className="text-n-icon-secondary" />} tone="muted" highlighted={highlightedRow === 'learn'}>Learn about reminders</MenuRow>
          </MenuList>
        </>
      )}
    </div>
  );
});
