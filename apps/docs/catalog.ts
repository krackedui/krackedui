// The KrackedUI marketplace catalog (server-safe, no React). One entry per design system, live or
// announced. Live entries must have a systems/<id>/ folder and a passing gate; `soon` entries are
// placeholders shown greyed out.
import { rootDomain, subdomainRouting } from './systems-meta';

export interface CatalogTemplate {
  id: string;
  name: string;
  description: string;
  /** Preview images in public/previews (light and dark). */
  preview: { light: string; dark: string };
}

export interface CatalogSystem {
  id: string;
  name: string;
  status: 'live' | 'soon';
  tagline: string;
  description: string;
  /** Free-form tags used by search and the filter chips. */
  tags: string[];
  /** The look in a few words, shown on the card. */
  style: string;
  packageName?: string;
  version?: string;
  /** Modules beyond the shared contract (editor, database…). */
  modules?: string[];
  templates: CatalogTemplate[];
}

export const catalog: CatalogSystem[] = [
  {
    id: 'motion',
    name: 'Motion',
    status: 'live',
    tagline: 'Calm, content-first, dense.',
    description:
      'Quiet surfaces, hairline borders and one blue accent. Built for productivity tools and dashboards, with a block editor and database views on top of the full KrackedUI contract.',
    tags: ['Productivity', 'Dashboard', 'Finance', 'Editor', 'Light + dark'],
    style: 'Minimal · neutral · dense',
    packageName: '@krackedui/motion',
    version: '1.0.0',
    modules: ['Block editor', 'Database views'],
    templates: [
      {
        id: 'project-management',
        name: 'Project management',
        description: 'Kanban board, task details, timeline, team and settings.',
        preview: { light: '/previews/motion-project-management-light.jpg', dark: '/previews/motion-project-management-dark.jpg' },
      },
      {
        id: 'fintech',
        name: 'Fintech dashboard',
        description: 'Balances, cash-flow charts, transactions, cards, payments and budgets.',
        preview: { light: '/previews/motion-fintech-light.jpg', dark: '/previews/motion-fintech-dark.jpg' },
      },
    ],
  },
  {
    id: 'aurora',
    name: 'Coming soon',
    status: 'soon',
    tagline: 'Bold and expressive.',
    description: 'A colourful, rounded system for consumer apps and marketing surfaces. In progress.',
    tags: ['Consumer', 'Marketing'],
    style: 'Vivid · rounded · airy',
    templates: [],
  },
  {
    id: 'terminal',
    name: 'Coming soon',
    status: 'soon',
    tagline: 'Sharp and technical.',
    description: 'A monospace-forward system for developer tools, consoles and data-heavy admin panels. In progress.',
    tags: ['Developer tools', 'Dashboard'],
    style: 'Mono · high-contrast · compact',
    templates: [],
  },
];

/** Number of components every KrackedUI system implements (the shared contract). */
export const contractSize = 62;

/** Home of a system's docs: motion.krackedui.com in production, /motion locally. */
export function systemHref(id: string, path = ''): string {
  return subdomainRouting ? `https://${id}.${rootDomain}${path || '/'}` : `/${id}${path}`;
}

/** A live template build: motion.krackedui.com/fintech/ in production, /motion/fintech/ locally. */
export function templateHref(systemId: string, templateId: string): string {
  return systemHref(systemId, `/${templateId}/`);
}

export const githubUrl = 'https://github.com/krackedui/krackedui';
export const npmOrgUrl = 'https://www.npmjs.com/org/krackedui';
