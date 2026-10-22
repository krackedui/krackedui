import { Theme } from '@krackedui/motion';
import type { ComponentType } from 'react';
import { Lab } from './lab/Lab';
import { MotionApp } from './MotionApp';

const prototypes = import.meta.glob<{ default: ComponentType }>('./prototypes/*.tsx', { eager: true });

/** `#/lab/...` = component lab, `#/proto/<slug>` = AI prototypes, everything else = the Motion demo app. */
export function App() {
  const hash = location.hash;
  if (hash.startsWith('#/lab')) return <Lab />;
  const proto = hash.match(/^#\/proto\/([\w-]+)/)?.[1];
  const Proto = proto && prototypes[`./prototypes/${proto}.tsx`]?.default;
  if (Proto) {
    document.documentElement.classList.toggle('dark', hash.includes('dark'));
    return <Theme appearance={hash.includes('dark') ? 'dark' : 'light'} className="h-full overflow-auto"><Proto /></Theme>;
  }
  return <MotionApp />;
}
