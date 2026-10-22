import type { ComponentType, ReactNode } from 'react';

/**
 * Registry format. Each design system exports one `DocsRegistry` from
 * `systems/<name>/docs/registry.tsx`; the shell renders `/<system>/<page-slug>` from it.
 */
export interface DocsRegistry {
  /** URL segment, e.g. "motion". */
  id: string;
  /** Display name in the system switcher, e.g. "Motion". */
  name: string;
  /** One line under the name in the switcher. */
  tagline?: string;
  /** Badge next to the name in the switcher (like AlignUI's NEW / OLD). */
  badge?: string;
  /** npm package name used in install snippets, e.g. "@krackedui/motion". */
  packageName: string;
  /** Where the system's demo app runs (top-bar app button). */
  appUrl?: string;
  /** Class(es) that scope the system's tokens; previews render inside them. */
  previewRootClassName?: string;
  /** Left sidebar: collapsible sections of pages. */
  nav: NavSection[];
  /** Pages keyed by slug ("introduction", "foundation/color", "ui/button"). */
  pages: Record<string, DocPage>;
  /** Slug opened at `/<system>`. Defaults to the first nav item. */
  home?: string;
  /**
   * The system's own versions of the docs chrome atoms. docs-shell keeps AlignUI's structure but renders
   * these so the documentation itself looks and behaves like the documented system. Omitted parts fall
   * back to the neutral defaults.
   */
  chrome?: DocsChrome;
  /** Public export names of the package (pipeline/package-exports.cjs); used to complete example imports. */
  exports?: { values: string[]; types: string[]; files?: Record<string, string> };
}

export type ChromeIcon = 'theme-dark' | 'theme-light' | 'link' | 'check' | 'app' | 'preview' | 'code' | 'copy' | 'search';

export interface DocsChrome {
  /** Class for the sidebar <aside> (background, border). */
  sidebarClassName?: string;
  /** Sidebar link row. `depth` 0 = section item, 1 = item inside a group. */
  NavLink?: ComponentType<{ href: string; title: ReactNode; icon?: NavIcon; active: boolean; depth: 0 | 1; badge?: ReactNode }>;
  /** Collapsible section header ("Getting Started"). */
  NavSectionLabel?: ComponentType<{ title: string }>;
  /** Group label inside a section ("Actions"). */
  NavGroupLabel?: ComponentType<{ title: string }>;
  /** Separator between nav sections and under page headers. */
  separator?: 'dashed' | 'solid' | 'none';
  /** Indentation style of grouped items: AlignUI rail or indent only. */
  groupRail?: boolean;
  SearchTrigger?: ComponentType<{ onClick: () => void }>;
  /** Small icon button in the top bar and code blocks. */
  IconButton?: ComponentType<{ icon: ChromeIcon; label: string; onClick?: () => void; href?: string }>;
  /** Preview / Code tab trigger classes (Radix Tabs.Trigger, uses data-[state=active]). */
  tabTriggerClassName?: string;
  /** "Copy" text button next to the tabs. */
  copyButtonClassName?: string;
  /** Icon renderer for chrome icons (system icon set). */
  Icon?: ComponentType<{ name: ChromeIcon; className?: string }>;
}

export type NavIcon =
  | 'introduction' | 'installation' | 'color' | 'typography' | 'icons' | 'components'
  | 'blocks' | 'templates' | 'figma' | 'spacing' | 'shadow' | 'motion' | 'radius';

export interface NavItem {
  slug: string;
  /** Sidebar label; defaults to the page title. */
  title?: string;
  /** Leading 20px icon (top-level items only, like AlignUI's Getting Started / Foundations). */
  icon?: NavIcon;
  /** Small pill after the label, e.g. "NEW", "PRO". `tone: 'orange'` for accent. */
  badge?: { label: string; tone?: 'gray' | 'orange' };
}

export interface NavGroup {
  /** e.g. "Actions", "Form". Items render indented with the left rail. */
  title: string;
  items: NavItem[];
}

export interface NavSection {
  title: string;
  items?: NavItem[];
  groups?: NavGroup[];
}

/** A live example: a React element factory plus the code shown in the Code tab. */
export interface Example {
  title: string;
  /** Anchor id; defaults to a slug of the title. */
  id?: string;
  description?: ReactNode;
  render: () => ReactNode;
  code: string;
  /** Preview box layout (default: centered). */
  align?: 'center' | 'start';
  /** Extra classes for the preview area (e.g. "min-h-80"). */
  previewClassName?: string;
}

export interface CodeFile {
  /** Shown above the code, e.g. "/app/layout.tsx" or "terminal". */
  filename: string;
  code: string;
  lang?: 'tsx' | 'ts' | 'css' | 'bash' | 'json';
}

export interface InstallStep {
  /** Step title. Use backticks for inline code: "Create a `button.tsx` file". */
  title: string;
  /** Code block under the step. */
  file?: CodeFile;
  /** npm/pnpm/yarn tabs for these packages. */
  packages?: string[];
}

export interface PropDef {
  name: string;
  /** Union members render as separate pills: ['"primary"', '"ghost"']. */
  type: string | string[];
  default?: string;
  description?: string;
}

export interface ApiTable {
  /** Heading, e.g. "Button". */
  name: string;
  /** Text under the heading; backticks render inline code. */
  description?: string;
  props: PropDef[];
}

export interface ColorToken {
  name: string;
  /** CSS custom property, e.g. "--n-bg-primary". */
  cssVar: string;
  light: string;
  /** When set, the swatch splits light | dark. */
  dark?: string;
}

export interface TypeStyle {
  name: string;
  fontFamily?: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: number | string;
  letterSpacing?: string;
  sample?: string;
}

/** Free-form content blocks inside a section. Strings are paragraphs; backticks render inline code. */
export type Block =
  | string
  | { list: string[] }
  | { code: CodeFile }
  | { steps: InstallStep[] }
  | { example: Example }
  | { colors: ColorToken[]; title?: string; columns?: 'auto' | 3 }
  | { type: TypeStyle[] }
  | { icons: { name: string; render: () => ReactNode }[] }
  | { cards: { title: string; description?: string; href?: string; icon?: () => ReactNode }[] }
  | { render: () => ReactNode };

export interface Section {
  /** h2 heading (and TOC entry). Omit for an untitled intro block. */
  title?: string;
  id?: string;
  blocks: Block[];
  /**
   * Where the section renders: 'start' (after the hero), 'beforeApi' (after Examples, like AlignUI's
   * Composition), or 'end' (after API Reference). Default: by title (Composition → beforeApi;
   * Accessibility…/Evidence → end; otherwise start).
   */
  placement?: 'start' | 'beforeApi' | 'end';
}

export interface DocPage {
  title: string;
  /** Orange label above the title, e.g. "Components". */
  eyebrow?: string;
  description?: string;
  /** Small link pills under the description (e.g. a dependency). */
  links?: { label: string; href: string }[];
  /** Wide pages (foundations) drop the right "On this page" column and use full width. */
  wide?: boolean;
  /** Example shown right under the header, before Installation. */
  hero?: Example;
  /** Free-form sections, rendered first (after the hero). */
  sections?: Section[];
  /** "Installation" section with numbered steps. */
  install?: InstallStep[];
  /** "Examples" section: one h3 + preview per example. */
  examples?: Example[];
  /** "API Reference" section: one h3 + props table per entry. */
  api?: ApiTable[];
}
