// Server-safe metadata (no React components): used by middleware and redirects. Keep in sync with systems.ts.
export const defaultSystem = 'motion';
export const homeSlugs: Record<string, string> = { motion: 'introduction' };
/** Sector templates per system, served at <system>.krackedui.com/<template>/ (static builds in public/<system>/<template>/). */
export const systemTemplates: Record<string, string[]> = { motion: ['project-management', 'fintech'] };
/** Root domain for subdomain routing (<system>.<rootDomain>). `<system>.localhost` works locally. */
export const rootDomain = process.env.NEXT_PUBLIC_DOCS_ROOT_DOMAIN ?? 'krackedui.com';
/**
 * Production (krackedui.com) serves each system on its own subdomain and links drop the /<system> prefix.
 * On by default in Vercel production; previews (*.vercel.app) and local dev keep /<system>/... paths.
 * Force with NEXT_PUBLIC_SUBDOMAIN_ROUTING=1 / 0.
 */
export const subdomainRouting =
  process.env.NEXT_PUBLIC_SUBDOMAIN_ROUTING !== undefined
    ? process.env.NEXT_PUBLIC_SUBDOMAIN_ROUTING === '1'
    : process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
