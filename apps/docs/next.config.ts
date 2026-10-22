import type { NextConfig } from 'next';
import path from 'node:path';

const config: NextConfig = {
  // Design-system packages ship TypeScript source.
  transpilePackages: ['@krackedui/motion'],
  // Per-system docs content lives outside this app, in systems/<name>/docs.
  experimental: { externalDir: true },
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  devIndicators: false,
  // Template builds use relative asset URLs, so /<template>/ must keep its trailing slash (middleware.ts).
  skipTrailingSlashRedirect: true,
  // In the monorepo, use @krackedui/motion source (hot reload); published consumers get the built dist.
  webpack(cfg) {
    cfg.resolve.alias = { ...cfg.resolve.alias, '@krackedui/motion$': path.join(import.meta.dirname, '../../systems/motion/registry/src/index.ts') };
    return cfg;
  },
  turbopack: { resolveAlias: { '@krackedui/motion': '../../systems/motion/registry/src/index.ts' } },
};

export default config;
