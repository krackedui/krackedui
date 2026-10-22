import { useState, type ReactNode } from 'react';
import { Editor, type Block } from '@krackedui/motion';
import type { PageNode } from './data/workspace';

interface PageBodyProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  childPages: PageNode[];
  openPage: (id: string) => void;
  /** Renders an inline database child page. */
  databaseFor: (id: string) => ReactNode;
}

/** Page body: the live block editor, followed by inline child databases. */
export function PageBody({ blocks, onChange, childPages, databaseFor }: PageBodyProps) {
  const [emptyDoc] = useState<Block[]>(() => [{ id: `empty-${Date.now().toString(36)}`, type: 'text', text: [] }]);
  const seeded = blocks.length ? blocks : emptyDoc;
  return (
    <div className="pb-[30vh]">
      <Editor value={seeded} onChange={onChange} lastEditedBy="You" />
      {childPages.filter((c) => c.kind === 'database').map((c) => (
        <div key={c.id} className="mt-6">{databaseFor(c.id)}</div>
      ))}
    </div>
  );
}
