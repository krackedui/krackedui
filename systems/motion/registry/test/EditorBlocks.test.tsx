import { describe, expect, it, vi } from 'vitest';
import {
  BlockActionMenu, BlockRenderer, Bookmark, Callout, Code, DragHandle, Equation, Heading, ImageBlock, MentionToken, PageLink,
  RichTextView, SlashMenu, TableOfContents, TextToolbar, ToDo, Toggle, TurnIntoMenu, rt, slashItems, turnIntoItems,
  type Block, type SlashItem,
} from '@system';
import { renderUI, screen, waitFor, within } from '../../../../standard/gate/tests/utils';

const textBlock: Block = { id: 'a', type: 'text', text: rt('A paragraph with six words here') };

describe('BlockActionMenu', () => {
  it('opens from the handle with the search focused; actions call back', async () => {
    const onDuplicate = vi.fn();
    const { user } = renderUI(<BlockActionMenu block={textBlock} onDuplicate={onDuplicate}><DragHandle /></BlockActionMenu>);
    await user.click(screen.getByRole('button', { name: /drag|block|menu/i }));
    const menu = await screen.findByRole('menu');
    await waitFor(() => expect(within(menu).getByRole('searchbox', { name: /Search actions/ })).toHaveFocus());
    await user.click(within(menu).getByRole('menuitem', { name: /Duplicate/ }));
    expect(onDuplicate).toHaveBeenCalledOnce();
  });

  it('search filters actions and turn-into targets', async () => {
    const onTurnInto = vi.fn();
    const { user } = renderUI(<BlockActionMenu block={textBlock} onTurnInto={onTurnInto}><DragHandle /></BlockActionMenu>);
    await user.click(screen.getByRole('button', { name: /drag|block|menu/i }));
    const menu = await screen.findByRole('menu');
    await user.type(within(menu).getByRole('searchbox'), 'heading 2');
    await user.click(within(menu).getByRole('menuitem', { name: /Heading 2/ }));
    expect(onTurnInto).toHaveBeenCalledWith(expect.objectContaining({ type: 'heading_2' }));
  });

  it('the Color submenu is keyboard reachable', async () => {
    const onColor = vi.fn();
    const { user } = renderUI(<BlockActionMenu block={textBlock} onColor={onColor}><DragHandle /></BlockActionMenu>);
    await user.click(screen.getByRole('button', { name: /drag|block|menu/i }));
    const menu = await screen.findByRole('menu');
    const color = within(menu).getByRole('menuitem', { name: /Color/ });
    color.focus();
    await user.keyboard('{ArrowRight}');
    const list = await screen.findByRole('listbox', { name: /color/i });
    await waitFor(() => expect(list).toHaveFocus());
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onColor).toHaveBeenCalledOnce();
  });
});

describe('SlashMenu', () => {
  it('is a listbox of labelled groups; the highlighted row is the active descendant', async () => {
    const onSelect = vi.fn<(item: SlashItem) => void>();
    const { user } = renderUI(<SlashMenu query="head" activeIndex={1} onSelect={onSelect} />);
    const list = screen.getByRole('listbox', { name: 'Commands' });
    const options = within(list).getAllByRole('option');
    expect(options.length).toBe(slashItems('head').length);
    expect(list).toHaveAttribute('aria-activedescendant', options[1].id);
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    await user.click(options[0]);
    expect(onSelect.mock.calls[0][0].id).toBe(slashItems('head')[0].id);
  });

  it('shows a status when nothing matches; Close menu calls onClose', async () => {
    const onClose = vi.fn();
    const { user } = renderUI(<SlashMenu query="zzzz" onClose={onClose} />);
    expect(screen.getByRole('status')).toHaveTextContent('No results');
    await user.click(screen.getByRole('button', { name: /Close menu/ }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('TurnIntoMenu', () => {
  it('one tab stop; arrows move the highlight, Enter picks', async () => {
    const onSelect = vi.fn();
    const { user } = renderUI(<TurnIntoMenu block={{ type: 'text' }} onSelect={onSelect} />);
    const list = screen.getByRole('listbox', { name: 'Turn into' });
    await user.tab();
    expect(list).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(list).toHaveAttribute('aria-activedescendant', within(list).getAllByRole('option')[1].id);
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(turnIntoItems[1]);
    await user.keyboard('{End}{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith(turnIntoItems[turnIntoItems.length - 1]);
  });
});

describe('TextToolbar', () => {
  it('is a labelled toolbar; marks are toggle buttons; arrow keys move', async () => {
    const onMark = vi.fn();
    const { user } = renderUI(<TextToolbar active={{ bold: true }} onMark={onMark} hideAI />);
    const bar = screen.getByRole('toolbar', { name: 'Text formatting' });
    const bold = within(bar).getByRole('button', { name: 'Bold' });
    expect(bold).toHaveAttribute('aria-pressed', 'true');
    await user.click(within(bar).getByRole('button', { name: 'Italic' }));
    expect(onMark).toHaveBeenCalledWith('italic');
    bold.focus();
    await user.keyboard('{ArrowRight}');
    expect(within(bar).getByRole('button', { name: 'Italic' })).toHaveFocus();
  });

  it('“Normal Text” opens Turn into from the keyboard; Escape returns focus', async () => {
    const onTurnInto = vi.fn();
    const { user } = renderUI(<TextToolbar onTurnInto={onTurnInto} hideAI />);
    const trigger = screen.getByRole('button', { name: /Normal Text/ });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const list = screen.getByRole('listbox', { name: 'Turn into' });
    await waitFor(() => expect(list).toHaveFocus());
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox', { name: 'Turn into' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('listbox', { name: 'Turn into' })).toHaveFocus());
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onTurnInto).toHaveBeenCalledWith(turnIntoItems[1].kind);
    expect(trigger).toHaveFocus();
  });
});

describe('BlockRenderer', () => {
  it('renders blocks; to-dos and toggles work uncontrolled and report changes', async () => {
    const onBlockChange = vi.fn();
    const blocks: Block[] = [
      { id: 'h', type: 'heading_1', text: rt('Plan') },
      { id: 't', type: 'to_do', text: rt('Write docs'), props: { checked: false } },
      { id: 'g', type: 'toggle', text: rt('Details'), children: [{ id: 'c', type: 'text', text: rt('Hidden body') }] },
    ];
    const { user } = renderUI(<BlockRenderer blocks={blocks} onBlockChange={onBlockChange} />);
    expect(screen.getByRole('heading', { name: 'Plan', level: 2 })).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox'));
    expect(onBlockChange).toHaveBeenCalledWith('t', { checked: true });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(onBlockChange).toHaveBeenCalledWith('g', { open: true });
  });

  it('equation blocks become edit buttons with onEquationEdit', async () => {
    const onEquationEdit = vi.fn();
    const { user } = renderUI(<BlockRenderer blocks={[{ id: 'e', type: 'equation', props: { expression: 'E = mc^2' } }]} onEquationEdit={onEquationEdit} />);
    await user.click(screen.getByRole('button', { name: 'Edit equation E = mc^2' }));
    expect(onEquationEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'e' }));
  });
});

describe('Equation', () => {
  it('is static without onEdit and a button with it', async () => {
    const onEdit = vi.fn();
    const { user, rerender } = renderUI(<Equation expression="a^2" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(<Equation onEdit={onEdit} />);
    await user.click(screen.getByRole('button', { name: 'Add a TeX equation' }));
    expect(onEdit).toHaveBeenCalledOnce();
  });
});

describe('ToDo', () => {
  it('the checkbox reflects and changes the state', async () => {
    const onCheckedChange = vi.fn();
    const { user } = renderUI(<ToDo text={rt('Ship')} checked onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole('checkbox');
    expect(box).toBeChecked();
    await user.click(box);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });
});

describe('Toggle', () => {
  it('the disclosure button exposes and changes the open state', async () => {
    const onOpenChange = vi.fn();
    const { user } = renderUI(<Toggle text={rt('More')} open={false} onOpenChange={onOpenChange}><p>Inside</p></Toggle>);
    const button = screen.getByRole('button', { name: 'Open' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.click(button);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

describe('Heading', () => {
  it('toggle headings are disclosures', async () => {
    const onOpenChange = vi.fn();
    const { user } = renderUI(<Heading level={2} text={rt('Section')} toggleable open onOpenChange={onOpenChange}><p>Body</p></Heading>);
    expect(screen.getByRole('heading', { name: 'Section' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Callout', () => {
  it('is a note; the icon button calls back', async () => {
    const onIconClick = vi.fn();
    const { user } = renderUI(<Callout icon="💡" text={rt('Tip')} onIconClick={onIconClick} />);
    expect(screen.getByRole('note')).toHaveTextContent('Tip');
    await user.click(screen.getByRole('button', { name: 'Change callout icon' }));
    expect(onIconClick).toHaveBeenCalledOnce();
  });
});

describe('Code', () => {
  it('the language button calls back', async () => {
    const onLanguageClick = vi.fn();
    const { user } = renderUI(<Code text={rt('const a = 1;')} language="TypeScript" onLanguageClick={onLanguageClick} />);
    await user.click(screen.getByRole('button', { name: /TypeScript/ }));
    expect(onLanguageClick).toHaveBeenCalledOnce();
  });
});

describe('ImageBlock', () => {
  it('the empty state is a button; an image has its alt text', async () => {
    const onPlaceholderClick = vi.fn();
    const { user, rerender } = renderUI(<ImageBlock onPlaceholderClick={onPlaceholderClick} />);
    await user.click(screen.getByRole('button', { name: 'Add an image' }));
    expect(onPlaceholderClick).toHaveBeenCalledOnce();
    rerender(<ImageBlock src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Roadmap chart" />);
    expect(screen.getByRole('img', { name: 'Roadmap chart' })).toBeInTheDocument();
  });
});

describe('Bookmark', () => {
  it('the empty state is a button; a bookmark is a link', async () => {
    const onPlaceholderClick = vi.fn();
    const { user, rerender } = renderUI(<Bookmark onPlaceholderClick={onPlaceholderClick} />);
    screen.getByRole('button', { name: 'Add a web bookmark' }).focus();
    await user.keyboard('{Enter}');
    expect(onPlaceholderClick).toHaveBeenCalledOnce();
    rerender(<Bookmark url="https://example.com/post" title="A post" />);
    expect(screen.getByRole('link', { name: /A post/ })).toHaveAttribute('href', 'https://example.com/post');
  });
});

describe('PageLink', () => {
  it('is a link to the page', () => {
    renderUI(<PageLink href="/roadmap" icon="🗺️" text={rt('Roadmap')} />);
    expect(screen.getByRole('link', { name: /Roadmap/ })).toHaveAttribute('href', '/roadmap');
  });
});

describe('TableOfContents', () => {
  it('lists headings as links; onItemClick receives the id', async () => {
    const onItemClick = vi.fn();
    const { user } = renderUI(<TableOfContents items={[{ id: 'h1', level: 1, text: 'Goals' }, { id: 'h2', level: 2, text: 'Risks' }]} onItemClick={onItemClick} />);
    await user.click(screen.getByRole('link', { name: 'Risks' }));
    expect(onItemClick).toHaveBeenCalledWith('h2');
  });
});

describe('RichTextView', () => {
  it('renders marks, links and mentions', () => {
    renderUI(
      <p>
        <RichTextView value={[{ text: 'bold', marks: { bold: true } }, { text: ' and ' }, { text: 'site', marks: { link: 'https://example.com' } }, { text: '', mention: { kind: 'user', label: 'Ada' } }]} />
      </p>,
    );
    expect(screen.getByText('bold').closest('[data-m]') ?? screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'site' })).toHaveAttribute('href', 'https://example.com');
    expect(screen.getByText('Ada')).toBeInTheDocument();
  });

  it('MentionToken carries its data for the editor', () => {
    const { container } = renderUI(<MentionToken mention={{ kind: 'page', label: 'Roadmap', icon: '🗺️' }} />);
    expect(screen.getByText('Roadmap')).toBeInTheDocument();
    expect(container.querySelector('[data-mention]')?.getAttribute('data-mention')).toContain('"kind":"page"');
  });
});
