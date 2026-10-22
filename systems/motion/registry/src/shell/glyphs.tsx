import type { SVGProps } from 'react';
import { Icon, type IconName } from '../icons/Icon';

/** Sidebar tab glyphs (Home / Chat / Meetings), drawn from the Lucide-based icon set. */
export type ShellGlyphName = 'home' | 'chat' | 'calendar';

const icons: Record<ShellGlyphName, IconName> = { home: 'home', chat: 'bubbleRight', calendar: 'calendarAltEmpty' };

export function ShellGlyph({ name, size = 20, ...props }: { name: ShellGlyphName; size?: number } & Omit<SVGProps<SVGSVGElement>, 'name'>) {
  return <Icon name={icons[name]} size={size} {...props} />;
}
