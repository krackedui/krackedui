import { describe, expect, it, vi } from 'vitest';
import { Editor, rt, type Block } from '@system';
import { renderUI, screen, waitFor } from '../../../../standard/gate/tests/utils';

// jsdom has no layout: Range rects (used to place the slash menu) need a stub.
if (!('getBoundingClientRect' in Range.prototype)) {
  Object.defineProperty(Range.prototype, 'getBoundingClientRect', { configurable: true, value: () => new DOMRect(0, 0, 0, 0) });
}
if (!('getClientRects' in Range.prototype)) {
  Object.defineProperty(Range.prototype, 'getClientRects', { configurable: true, value: () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] }) as unknown as DOMRectList });
}

const doc = (): Block[] => [{ id: 'a', type: 'text', text: rt('Hello') }];
const last = (fn: ReturnType<typeof vi.fn>) => fn.mock.calls[fn.mock.calls.length - 1]?.[0] as Block[];

/** Put the caret at the end of an editable leaf. */
function caretToEnd(el: HTMLElement) {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection()!;
  sel.removeAllRanges();
  sel.addRange(range);
}

describe('Editor', () => {
  it('renders each block as a named, multi-line textbox', () => {
    renderUI(<Editor defaultValue={doc()} />);
    const box = screen.getByRole('textbox', { name: 'Text' });
    expect(box).toHaveAttribute('aria-multiline', 'true');
    expect(box).toHaveTextContent('Hello');
  });

  it('typing updates the document', async () => {
    const onChange = vi.fn();
    const { user } = renderUI(<Editor defaultValue={doc()} onChange={onChange} />);
    const box = screen.getByRole('textbox', { name: 'Text' });
    caretToEnd(box);
    await user.keyboard(' world');
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(last(onChange)[0].text?.map((s) => s.text).join('')).toBe('Hello world');
  });

  it('Enter at the end creates a new block', async () => {
    const onChange = vi.fn();
    const { user } = renderUI(<Editor defaultValue={doc()} onChange={onChange} />);
    caretToEnd(screen.getByRole('textbox', { name: 'Text' }));
    await user.keyboard('{Enter}');
    await waitFor(() => expect(last(onChange)).toHaveLength(2));
    expect(screen.getAllByRole('textbox', { name: 'Text' })).toHaveLength(2);
  });

  it('"/" opens the slash menu; Escape closes it', async () => {
    const { user } = renderUI(<Editor defaultValue={doc()} />);
    caretToEnd(screen.getByRole('textbox', { name: 'Text' }));
    await user.keyboard(' /');
    expect(await screen.findByRole('dialog', { name: 'Slash commands' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Slash commands' })).not.toBeInTheDocument());
  });

  it('markdown shortcut "# " turns a text block into a heading', async () => {
    const onChange = vi.fn();
    const { user } = renderUI(<Editor defaultValue={[{ id: 'a', type: 'text', text: [] }]} onChange={onChange} />);
    caretToEnd(screen.getByRole('textbox', { name: 'Text' }));
    await user.keyboard('# ');
    await waitFor(() => expect(last(onChange)?.[0].type).toBe('heading_1'));
    expect(screen.getByRole('textbox', { name: 'Heading 1' })).toBeInTheDocument();
  });

  it('⌘/ opens the block menu from the keyboard; Escape closes it', async () => {
    const { user } = renderUI(<Editor defaultValue={doc()} />);
    caretToEnd(screen.getByRole('textbox', { name: 'Text' }));
    await user.keyboard('{Control>}/{/Control}');
    const menu = await screen.findByRole('menu');
    expect(menu).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });
});
