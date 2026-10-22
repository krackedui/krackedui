// Every documented design system. Add one line per system: its registry lives in systems/<name>/docs.
import type { DocsRegistry } from '@/lib/types';
import motion from '@systems/motion/docs/registry';

export const systemList: DocsRegistry[] = [motion];
export const systems: Record<string, DocsRegistry> = Object.fromEntries(systemList.map((s) => [s.id, s]));
