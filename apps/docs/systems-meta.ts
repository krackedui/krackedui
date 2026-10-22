// Server-safe metadata (no React components): used by middleware and redirects. Keep in sync with systems.ts.
export const defaultSystem = 'motion';
export const homeSlugs: Record<string, string> = { motion: 'introduction' };
/** Sector templates per system, served at <system>.krackedui.com/<template>/ (static builds in public/<system>/<template>/). */
export const systemTemplates: Record<string, string[]> = { motion: ['project-management', 'fintech'] };
/** Root domain for subdomain routing (<system>.<rootDomain>). `<system>.localhost` works locally. */
export const rootDomain = process.env.NEXT_PUBLIC_DOCS_ROOT_DOMAIN ?? 'krackedui.com';
/** On a subdomain deployment links drop the /<system> prefix. Set NEXT_PUBLIC_SUBDOMAIN_ROUTING=1 there. */
export const subdomainRouting = process.env.NEXT_PUBLIC_SUBDOMAIN_ROUTING === '1';
