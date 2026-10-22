import { useEffect, useState } from 'react';
import {
  BlockActionMenu, Editor, SlashMenu, TextToolbar, TurnIntoMenu, plainText, rt, type Block,
} from '@krackedui/motion';
import { sandboxDoc } from './blocks';

const parse = () => /state=([a-z-]+)/.exec(location.hash)?.[1] ?? '';
const textBlock: Block = { id: 'static-text', type: 'text', text: rt('') };

/**
 * Editor lab. `#/lab/editor` hosts the live editor on the sandbox document (same geometry as the reference page
 * column: x=630, w=720). `?state=slash|toolbar|color|turn|block|block-color` renders one menu statically at the
 * captured coordinates (viewport 1710×1037) for pixel diffs against mirror/<state>.png.
 */
export default function EditorLab() {
  const [state, setState] = useState(parse);
  const [doc, setDoc] = useState<Block[]>(sandboxDoc);
  useEffect(() => {
    const on = () => setState(parse());
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);

  if (state === 'slash') {
    return <div className="fixed" style={{ left: 632, top: 269 }}><SlashMenu activeIndex={0} /></div>;
  }
  if (state === 'toolbar' || state === 'color') {
    const color = state === 'color';
    return (
      <div className="fixed" style={{ left: 721, top: color ? 108 : 336 }}>
        <TextToolbar block={{ type: 'text' }} defaultPanel={color ? 'color' : 'none'} recentColors={color ? ['yellow_background'] : undefined} />
      </div>
    );
  }
  if (state === 'turn' || state === 'block' || state === 'block-color') {
    return (
      <>
        <BlockActionMenu block={textBlock} open side="bottom" lastEditedBy="Ada Lovelace" lastEditedAt="Today at 4:55 PM" lastUsedColor="yellow_background">
          <button aria-label="anchor" className="fixed size-px opacity-0" style={{ left: 332, top: 491 }} />
        </BlockActionMenu>
        {state === 'turn' && <div className="fixed" style={{ left: 593, top: 239 }}><TurnIntoMenu block={{ type: 'text' }} highlightedId="text" /></div>}
      </>
    );
  }

  return (
    <div className="flex">
      <div style={{ marginLeft: 630, width: 720, paddingTop: 120 }}>
        <Editor
          title={rt('DS Sandbox')}
          value={doc}
          onChange={setDoc}
          lastEditedBy="Ada Lovelace"
        />
      </div>
      <pre className="fixed bottom-2 right-2 max-h-[40vh] w-[300px] overflow-auto rounded-n-lg bg-n-bg-secondary p-2 text-[11px] leading-4 text-n-text-secondary">
        {doc.length} top-level blocks{'\n'}
        {doc.slice(0, 40).map((b) => `${b.type}${b.props?.checked ? ' ✓' : ''}: ${plainText(b.text).slice(0, 28)}`).join('\n')}
      </pre>
    </div>
  );
}
