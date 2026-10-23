// Bayrust docs registry: nav sections → pages. Rendered by apps/docs at /bayrust/<slug>.
import type { DocsRegistry } from '../../../apps/docs/lib/types';
import { bayrustChrome } from './chrome';
import { gettingStartedNav, gettingStartedPages } from './pages/getting-started';
import { foundationNav, foundationPages } from './pages/foundations';
import { actionNav, actionPages } from './pages/actions';
import { formNav, formPages } from './pages/forms';
import { displayNav, displayPages } from './pages/display';
import { overlayNav, overlayPages } from './pages/overlays';
import { chartShellNav, chartShellPages } from './pages/charts-shell';
import packageExports from './generated/exports.json';

const registry: DocsRegistry = {
  id: 'bayrust',
  name: 'Bayrust',
  tagline: 'A dark-first, keyboard-driven React design system',
  badge: 'v0.2',
  packageName: '@krackedui/bayrust',
  // Examples render inside a real <Theme> (see chrome.tsx); this class is the fallback the docs
  // shell uses for anything outside one.
  previewRootClassName: 'bay',
  home: 'introduction',
  chrome: bayrustChrome,
  exports: packageExports,
  nav: [
    gettingStartedNav,
    foundationNav,
    {
      title: 'Components',
      groups: [actionNav, formNav, displayNav, overlayNav, ...chartShellNav],
    },
  ],
  pages: {
    ...gettingStartedPages,
    ...foundationPages,
    ...actionPages,
    ...formPages,
    ...displayPages,
    ...overlayPages,
    ...chartShellPages,
  },
};

export default registry;
