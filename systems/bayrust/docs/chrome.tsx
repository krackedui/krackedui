// Bayrust's docs chrome. Only the parts that have to be Bayrust's are overridden; the rest falls back
// to the neutral defaults, which is what the registry type intends.
import type { DocsChrome } from '../../../apps/docs/lib/types';
import { Theme } from '@krackedui/bayrust';

export const bayrustChrome: DocsChrome = {
  // Every live example renders inside a real Theme, so a menu or dialog opened from a preview
  // portals into that preview's appearance rather than the page's.
  PreviewRoot: ({ appearance, className, children }) => (
    <Theme appearance={appearance} className={className}>
      {children}
    </Theme>
  ),
};
