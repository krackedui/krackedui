// Development-only helpers. Bundlers replace `process.env.NODE_ENV` at build time, so production builds drop
// the warnings; without a bundler (no `process`) the checks stay on.
declare const process: { env: { NODE_ENV?: string } } | undefined;

/** True unless the app is built for production. */
export function isDev(): boolean {
  try {
    return typeof process === 'undefined' || process.env.NODE_ENV !== 'production';
  } catch {
    return true;
  }
}

const warned = new Set<string>();

/** `console.warn` once per message, in development only. */
export function devWarn(message: string): void {
  if (!isDev() || warned.has(message)) return;
  warned.add(message);
  console.warn(`[@krackedui/motion] ${message}`);
}
