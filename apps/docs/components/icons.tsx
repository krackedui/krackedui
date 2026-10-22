// Chrome glyphs drawn for this shell (simple geometric strokes). Page icons in the sidebar use Remix Icon (Apache-2.0).
import type { SVGProps } from 'react';
import {
  RiFlashlightLine, RiToolsLine, RiPaletteLine, RiFontSize, RiShapesLine, RiStackLine, RiLayoutLeftLine,
  RiFigmaLine, RiLayoutGridLine, RiShadowLine, RiTimerFlashLine, RiCheckboxBlankLine, RiRulerLine,
} from '@remixicon/react';
import type { NavIcon } from '@/lib/types';

type P = SVGProps<SVGSVGElement>;
const stroke = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const ChevronDown = (p: P) => (
  <svg viewBox="0 0 20 20" {...p}><path {...stroke} strokeWidth={1.5} d="M6 8l4 4 4-4" /></svg>
);
export const ChevronRight = (p: P) => (
  <svg viewBox="0 0 20 20" {...p}><path {...stroke} strokeWidth={1.5} d="M8 6l4 4-4 4" /></svg>
);
export const SearchIcon = (p: P) => (
  <svg viewBox="0 0 18 18" {...p}><circle {...stroke} strokeWidth={1.25} cx="8.25" cy="8.25" r="5.44" /><path {...stroke} strokeWidth={1.25} d="M15.19 15.19l-3.1-3.1" /></svg>
);
export const ListIcon = (p: P) => (
  <svg viewBox="0 0 12 12" {...p}><path {...stroke} d="M1.375 6h9.25M1.375 2.875h9.25M1.375 9.125H5.75" /></svg>
);
export const EyeIcon = (p: P) => (
  <svg viewBox="0 0 18 18" {...p}>
    <path {...stroke} strokeWidth={1.25} d="M1.9 9.4a.9.9 0 0 1 0-.8C3.3 5.8 6 4 9 4s5.7 1.8 7.1 4.6a.9.9 0 0 1 0 .8C14.7 12.2 12 14 9 14s-5.7-1.8-7.1-4.6Z" />
    <circle {...stroke} strokeWidth={1.25} cx="9" cy="9" r="2.25" />
  </svg>
);
export const CodeIcon = (p: P) => (
  <svg viewBox="0 0 18 18" {...p}><path {...stroke} strokeWidth={1.25} d="M5.25 5.5L2 9l3.25 3.5M12.75 5.5L16 9l-3.25 3.5M10.25 4.5l-2.5 9" /></svg>
);
export const CopyIcon = (p: P) => (
  <svg viewBox="0 0 20 20" {...p}>
    <rect {...stroke} strokeWidth={1.25} x="3.6" y="7.1" width="9.3" height="9.3" rx="1.6" />
    <path {...stroke} strokeWidth={1.25} d="M7.1 7.1V5.2c0-.9.7-1.6 1.6-1.6h6.1c.9 0 1.6.7 1.6 1.6v6.1c0 .9-.7 1.6-1.6 1.6h-1.9" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg viewBox="0 0 20 20" {...p}><path {...stroke} strokeWidth={1.5} d="M5 10.5l3.2 3L15 6.5" /></svg>
);
export const ArrowUpRight = (p: P) => (
  <svg viewBox="0 0 12 12" {...p}><path {...stroke} d="M4 8l4-4M4.75 4H8v3.25" /></svg>
);
export const InfoIcon = (p: P) => (
  <svg viewBox="0 0 20 20" {...p}><circle cx="10" cy="10" r="6.5" fill="currentColor" /><path stroke="white" strokeWidth={1.5} strokeLinecap="round" d="M10 9.25v3.5" /><circle cx="10" cy="7" r=".9" fill="white" /></svg>
);
export const CloseIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}><path {...stroke} strokeWidth={1.5} d="M8 8l8 8M16 8l-8 8" /></svg>
);
export const CornerDownRight = (p: P) => (
  <svg viewBox="0 0 22 22" {...p}><path {...stroke} strokeWidth={1.3} d="M3.5 6.5v2.25a3.5 3.5 0 0 0 3.5 3.5h11M14.5 8.75l3.5 3.5-3.5 3.5" /></svg>
);
export const ArrowUp = (p: P) => (
  <svg viewBox="0 0 18 18" {...p}><path {...stroke} strokeWidth={1.25} d="M9 14V4M5 8l4-4 4 4" /></svg>
);
export const ArrowDown = (p: P) => (
  <svg viewBox="0 0 18 18" {...p}><path {...stroke} strokeWidth={1.25} d="M9 4v10M5 10l4 4 4-4" /></svg>
);
export const EnterIcon = (p: P) => (
  <svg viewBox="0 0 18 18" {...p}><path {...stroke} strokeWidth={1.25} d="M14 4.5v3a2 2 0 0 1-2 2H4M6.5 7l-2.5 2.5L6.5 12" /></svg>
);
export const SunIcon = (p: P) => (
  <svg viewBox="0 0 18 18" {...p}>
    <circle {...stroke} strokeWidth={1.25} cx="9" cy="9" r="3.25" />
    <path {...stroke} strokeWidth={1.25} d="M9 1.75v1.5M9 14.75v1.5M1.75 9h1.5M14.75 9h1.5M3.87 3.87l1.06 1.06M13.07 13.07l1.06 1.06M3.87 14.13l1.06-1.06M13.07 4.93l1.06-1.06" />
  </svg>
);
export const MoonIcon = (p: P) => (
  <svg viewBox="0 0 18 18" {...p}><path {...stroke} strokeWidth={1.25} d="M15.25 10.6A6.5 6.5 0 0 1 7.4 2.75a6.5 6.5 0 1 0 7.85 7.85Z" /></svg>
);
export const AppIcon = (p: P) => (
  <svg viewBox="0 0 18 18" {...p}>
    <rect {...stroke} strokeWidth={1.25} x="2.25" y="3" width="13.5" height="12" rx="2" />
    <path {...stroke} strokeWidth={1.25} d="M2.25 6.5h13.5M6.5 6.5V15" />
  </svg>
);
export const LinkIcon = (p: P) => (
  <svg viewBox="0 0 18 18" {...p}>
    <path {...stroke} strokeWidth={1.25} d="M7.6 10.4a2.75 2.75 0 0 0 3.9 0l2.4-2.4a2.75 2.75 0 0 0-3.9-3.9l-.75.75M10.4 7.6a2.75 2.75 0 0 0-3.9 0L4.1 10a2.75 2.75 0 0 0 3.9 3.9l.75-.75" />
  </svg>
);

const NAV_ICONS: Record<NavIcon, typeof RiFlashlightLine> = {
  introduction: RiFlashlightLine,
  installation: RiToolsLine,
  color: RiPaletteLine,
  typography: RiFontSize,
  icons: RiShapesLine,
  components: RiLayoutGridLine,
  blocks: RiStackLine,
  templates: RiLayoutLeftLine,
  figma: RiFigmaLine,
  spacing: RiRulerLine,
  shadow: RiShadowLine,
  motion: RiTimerFlashLine,
  radius: RiCheckboxBlankLine,
};

export function NavGlyph({ name, className }: { name: NavIcon; className?: string }) {
  const C = NAV_ICONS[name] ?? RiShapesLine;
  return <C className={className} size={20} />;
}
