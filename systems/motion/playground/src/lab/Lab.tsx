import { useEffect, useState, type ComponentType } from 'react';
import { Button } from '@krackedui/motion';

// Each group owns one lab page: src/lab/pages/<group>.tsx (default export).
const pages = import.meta.glob<{ default: ComponentType }>('./pages/*.tsx', { eager: true });
const groups = Object.fromEntries(Object.entries(pages).map(([p, m]) => [p.replace('./pages/', '').replace('.tsx', ''), m.default]));

function parse() {
  const [route, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  return { group: route.split('/')[1] ?? '', dark: query.includes('dark') };
}

/** Component lab. `#/lab/<group>` renders one group; `?dark` switches theme. Used for pixel checks. */
export function Lab() {
  const [state, setState] = useState(parse);
  useEffect(() => {
    const on = () => setState(parse());
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  useEffect(() => { document.documentElement.classList.toggle('dark', state.dark); }, [state.dark]);
  const Page = groups[state.group];
  if (Page) return <div className="motion-root min-h-full"><Page /></div>;
  return (
    <div className="motion-root min-h-full p-8">
      <h1 className="mb-4 text-n-h2 font-semibold">Lab</h1>
      <div className="flex flex-col items-start gap-1">
        {Object.keys(groups).sort().map((g) => (
          <Button key={g} asChild><a href={`#/lab/${g}`}>{g}</a></Button>
        ))}
      </div>
    </div>
  );
}
