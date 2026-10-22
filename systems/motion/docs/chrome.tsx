// Motion's versions of the docs chrome atoms: the docs keep AlignUI's structure, but every control
// the reader touches (sidebar rows, section labels, search, icon buttons, tabs) is Motion's own UI.
'use client';
import Link from 'next/link';
import { Icon, IconButton, Kbd, cn, sidebarStyles, type IconName } from '@krackedui/motion';
import type { ChromeIcon, DocsChrome, NavIcon } from '../../../apps/docs/lib/types';

const NAV_ICONS: Record<NavIcon, IconName> = {
  introduction: 'book', installation: 'arrowLineDown', color: 'paintBrush', typography: 'textFormat',
  icons: 'emojiFace', components: 'squareGrid2X2', blocks: 'squareGridBelowLines', templates: 'templates',
  figma: 'pencilLine', spacing: 'sliders', shadow: 'stack', motion: 'lightning', radius: 'rectangleSplit2',
};
const CHROME_ICONS: Record<ChromeIcon, IconName> = {
  'theme-dark': 'lightBulbBright', 'theme-light': 'lightBulbBright', link: 'link', check: 'checkmark', app: 'arrowDiagonalUpRight',
  preview: 'eye', code: 'code', copy: 'duplicate', search: 'magnifyingGlass',
};

const row = sidebarStyles;

export const motionChrome: DocsChrome = {
  sidebarClassName: 'bg-n-bg-secondary border-r-0 shadow-[inset_-1px_0_0_0_var(--n-border-secondary)]',
  separator: 'none',
  groupRail: false,

  NavLink: ({ href, title, icon, active, depth, badge }) => {
    const st = row({ active });
    return (
      <Link href={href} className={cn(st.row(), 'font-normal text-n-text-accent-primary', active && 'text-n-text-primary', depth === 1 && 'pl-[30px]')}>
        {icon && depth === 0 && <span className={cn(st.rowIcon(), 'text-n-icon-secondary')}><Icon name={NAV_ICONS[icon] ?? 'page'} size={20} /></span>}
        <span className={st.rowLabel()}>{title}</span>
        {badge}
      </Link>
    );
  },

  NavSectionLabel: ({ title }) => (
    <span className="flex h-[30px] w-full items-center rounded-n-md px-2 text-[12px] font-medium leading-none text-n-text-tertiary group-hover:bg-n-bg-interactive-translucent-a">
      {title}
    </span>
  ),

  NavGroupLabel: ({ title }) => (
    <div className="flex h-[30px] items-center px-2 text-[14px] leading-[21px] text-n-text-secondary">
      <span className="mr-2 flex size-[22px] items-center justify-center text-n-icon-tertiary"><Icon name="arrowChevronSingleDownSmall" size={16} /></span>
      {title}
    </div>
  ),

  SearchTrigger: ({ onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-full cursor-pointer lg:w-[456px] items-center gap-2 rounded-n-lg border border-n-border-primary-translucent-a pl-2 pr-1.5 text-[14px] leading-[16.8px] text-n-text-tertiary transition-[background] duration-[20ms] hover:bg-n-button-hover-bg-a"
    >
      <Icon name="magnifyingGlass" size={18} className="text-n-icon-tertiary" />
      <span className="flex-1 text-left">Search docs</span>
      <Kbd>/</Kbd>
    </button>
  ),

  IconButton: ({ icon, label, onClick, href }) =>
    href ? (
      <a href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className="flex size-7 items-center justify-center rounded-n-md text-n-icon-primary hover:bg-n-button-hover-bg-a">
        <Icon name={CHROME_ICONS[icon]} size={20} />
      </a>
    ) : (
      <IconButton icon={CHROME_ICONS[icon]} label={label} onClick={onClick} />
    ),

  /* Database view tabs: 28px pill, 14/16.8 500, active = translucent fill */
  tabTriggerClassName:
    'flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[14px] font-medium leading-[16.8px] text-n-text-secondary transition-[background] duration-[20ms] hover:bg-n-button-hover-bg-a data-[state=active]:bg-n-bg-interactive-translucent-a data-[state=active]:text-n-text-primary',
  /* Ghost button */
  copyButtonClassName:
    'flex h-7 cursor-pointer items-center gap-1.5 rounded-n-md px-2 text-[14px] leading-[16.8px] text-n-text-secondary transition-[background] duration-[20ms] hover:bg-n-button-hover-bg-a',

  Icon: ({ name, className }) => <Icon name={CHROME_ICONS[name]} size={18} className={className} />,
};
