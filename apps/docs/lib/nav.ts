import type { DocsRegistry, NavItem } from './types';
import { homeSlugs, subdomainRouting } from '../systems-meta';

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[`'"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Link to a docs page: `/<system>/<slug>` locally, `/<slug>` on <system>.krackedui.com. */
export const pageHref = (system: string, slug: string) => (subdomainRouting ? `/${slug}` : `/${system}/${slug}`);

/** Content links are written as `/<system>/<slug>`; on a subdomain deployment drop the prefix. */
export function docHref(href: string): string {
  if (!subdomainRouting) return href;
  const m = href.match(/^\/([a-z0-9-]+)(\/.*)?$/);
  return m && m[1] in homeSlugs ? m[2] || '/' : href;
}

export interface FlatNavItem extends NavItem {
  title: string;
  section: string;
  group?: string;
}

/** Every nav entry in sidebar order, with its section/group label (used by search). */
export function flattenNav(reg: DocsRegistry): FlatNavItem[] {
  const out: FlatNavItem[] = [];
  const add = (it: NavItem, section: string, group?: string) =>
    out.push({ ...it, title: it.title ?? reg.pages[it.slug]?.title ?? it.slug, section, group });
  for (const s of reg.nav) {
    s.items?.forEach((it) => add(it, s.title));
    s.groups?.forEach((g) => g.items.forEach((it) => add(it, s.title, g.title)));
  }
  return out;
}

export function homeSlug(reg: DocsRegistry) {
  return reg.home ?? flattenNav(reg)[0]?.slug ?? Object.keys(reg.pages)[0];
}
