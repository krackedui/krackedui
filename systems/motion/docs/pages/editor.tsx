// Content blocks + block editor pages (ds/src/blocks, ds/src/editor).
// Live previews import straight from @krackedui/motion. Merged into the registry by the main session.
import { useState, type ReactNode } from 'react';
import {
  BlockActionMenu,
  BlockContent,
  BlockRenderer,
  Bookmark,
  BulletedListItem,
  Callout,
  Code,
  ColorMenuList,
  Columns,
  DividerBlock,
  DragHandle,
  Editor,
  Equation,
  Heading,
  ImageBlock,
  MenuFooter,
  MenuLabel,
  MenuList,
  MenuRow,
  MenuSearch,
  MenuSurface,
  NumberedListItem,
  PageLink,
  PageTitle,
  Quote,
  RichTextView,
  SimpleTable,
  SlashMenu,
  TableOfContents,
  TextBlock,
  TextToolbar,
  ToDo,
  Toggle,
  TurnIntoMenu,
  rt,
  slashItems,
  type Block,
  type BlockColor,
  type RichText,
} from '@krackedui/motion';
import type { DocPage, InstallStep, NavGroup, Section } from '../../../../apps/docs/lib/types';

/* ------------------------------------------------------------------ helpers */

const eyebrowBlocks = 'Content blocks';
const eyebrowEditor = 'Editor';
const content = 'w-full max-w-[640px]';

/** Standard two-step install: package, then import + usage inside `.motion-root`. */
function install(names: string, usage: string): InstallStep[] {
  return [
    { title: 'Install the design system package:', packages: ['@krackedui/motion'] },
    {
      title: 'Import it and render inside `.motion-root` (add `.dark` for the dark theme):',
      file: { filename: '/app/page.tsx', lang: 'tsx', code: `import { ${names} } from '@krackedui/motion';\n\n${usage}` },
    },
  ];
}

/** Standalone blocks are sized relative to the 16px content type that `BlockContent` sets. */
function C({ children, className }: { children: ReactNode; className?: string }) {
  return <BlockContent className={className ?? content}>{children}</BlockContent>;
}

function a11y(items: string[]): Section {
  return { title: 'Accessibility', blocks: [{ list: items }] };
}

function usage(items: string[]): Section {
  return { title: 'Usage', blocks: [{ list: items }] };
}

/** Two-column reference table styled like the docs props tables. */
function KeyTable({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  const th = 'border border-ln-gray-100 px-4 py-2 text-left text-ln-label-sm font-medium text-ln-gray-600';
  const td = 'border border-ln-gray-100 px-4 py-3 align-top text-ln-paragraph-sm text-ln-gray-600';
  return (
    <div className="mt-6 w-full overflow-hidden rounded-lg border border-ln-gray-100">
      <div className="-m-px overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-ln-gray-25">
            <tr><th className={th}>{head[0]}</th><th className={th}>{head[1]}</th></tr>
          </thead>
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td className={td}><code className="whitespace-nowrap font-code text-ln-label-sm text-ln-gray-800">{k}</code></td>
                <td className={td}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const textContentProps = [
  { name: 'text', type: 'RichText', description: 'Rich text shown by the static leaf.' },
  { name: 'renderLeaf', type: 'LeafRenderer', description: 'Replace the text leaf (the Editor passes a contenteditable leaf). Receives `{ className, placeholder, style }`.' },
];
const colorProp = {
  name: 'color',
  type: 'BlockColor',
  default: '"default"',
  description: '`"blue"` colors the text, `"blue_background"` tints a rounded background.',
};

const sampleImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d3e5ef"/><stop offset="1" stop-color="#f5e0e9"/></linearGradient></defs><rect width="1200" height="600" fill="url(#g)"/><circle cx="880" cy="220" r="90" fill="#fdecc8"/><path d="M0 470 L320 260 L560 430 L760 300 L1200 520 L1200 600 L0 600 Z" fill="#dbeddb"/></svg>',
  );

/* ------------------------------------------------------------------ sample document */

const sampleDoc: Block[] = [
  { id: 'h1', type: 'heading_1', text: rt('Project plan') },
  {
    id: 'p1',
    type: 'text',
    text: [
      { text: 'A short page with ' },
      { text: 'bold', marks: { bold: true } },
      { text: ', ' },
      { text: 'italic', marks: { italic: true } },
      { text: ' and ' },
      { text: 'inline code', marks: { code: true } },
      { text: '.' },
    ],
  },
  { id: 'toc', type: 'table_of_contents' },
  { id: 'h2', type: 'heading_2', text: rt('Goals') },
  {
    id: 'l1',
    type: 'bulleted_list',
    text: rt('Ship the first draft'),
    children: [{ id: 'l1a', type: 'bulleted_list', text: rt('Outline sections') }],
  },
  { id: 'l2', type: 'bulleted_list', text: rt('Collect feedback') },
  { id: 't1', type: 'to_do', text: rt('Review the outline'), props: { checked: true } },
  { id: 't2', type: 'to_do', text: rt('Share with the team') },
  { id: 'h3', type: 'heading_3', text: rt('Notes') },
  { id: 'c1', type: 'callout', text: rt('Callouts highlight a key point.'), props: { icon: '💡' }, color: 'gray_background' },
  { id: 'q1', type: 'quote', text: rt('Simple things should be simple.') },
  { id: 'd1', type: 'divider' },
  { id: 'tg', type: 'toggle', text: rt('More details'), props: { open: false }, children: [{ id: 'tgc', type: 'text', text: rt('Hidden until the toggle opens.') }] },
];

const sampleDocCode = `const doc: Block[] = [
  { id: 'h1', type: 'heading_1', text: rt('Project plan') },
  {
    id: 'p1',
    type: 'text',
    text: [
      { text: 'A short page with ' },
      { text: 'bold', marks: { bold: true } },
      { text: ', ' },
      { text: 'italic', marks: { italic: true } },
      { text: ' and ' },
      { text: 'inline code', marks: { code: true } },
      { text: '.' },
    ],
  },
  { id: 'toc', type: 'table_of_contents' },
  { id: 'h2', type: 'heading_2', text: rt('Goals') },
  {
    id: 'l1',
    type: 'bulleted_list',
    text: rt('Ship the first draft'),
    children: [{ id: 'l1a', type: 'bulleted_list', text: rt('Outline sections') }],
  },
  { id: 'l2', type: 'bulleted_list', text: rt('Collect feedback') },
  { id: 't1', type: 'to_do', text: rt('Review the outline'), props: { checked: true } },
  { id: 't2', type: 'to_do', text: rt('Share with the team') },
  { id: 'h3', type: 'heading_3', text: rt('Notes') },
  { id: 'c1', type: 'callout', text: rt('Callouts highlight a key point.'), props: { icon: '💡' }, color: 'gray_background' },
  { id: 'q1', type: 'quote', text: rt('Simple things should be simple.') },
  { id: 'd1', type: 'divider' },
  { id: 'tg', type: 'toggle', text: rt('More details'), props: { open: false }, children: [{ id: 'tgc', type: 'text', text: rt('Hidden until the toggle opens.') }] },
];`;

/* ================================================================== OVERVIEW */

const overviewPage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Block model',
  description:
    'Every piece of a page is a block. `@krackedui/motion` models a page as a `Block[]` tree and renders it with consistent block spacing; the same tree drives the read-only renderer and the editor.',
  hero: {
    title: 'BlockRenderer',
    align: 'start',
    render: () => <BlockRenderer className={content} blocks={sampleDoc} />,
    code: `import { BlockRenderer, rt, type Block } from '@krackedui/motion';\n\n${sampleDocCode}\n\nexport function Page() {\n  return <BlockRenderer blocks={doc} />;\n}`,
  },
  install: install('BlockRenderer, rt, type Block', `<BlockRenderer blocks={[{ id: 'a', type: 'text', text: rt('Hello') }]} />`),
  sections: [
    {
      title: 'The Block type',
      blocks: [
        'A block has an `id`, a `type`, optional rich `text`, optional nested `children`, an optional `color` and type-specific `props`. Nesting is real nesting: list items, toggles, quotes and callouts hold their sub-blocks in `children`; columns are a `column_list` whose children are `column` blocks.',
        {
          code: {
            filename: 'types.ts',
            lang: 'ts',
            code: `interface Block {
  id: string;
  type: BlockType;
  text?: RichText;
  children?: Block[];
  color?: BlockColor;
  props?: BlockProps;
}

type BlockType =
  | 'text' | 'heading_1' | 'heading_2' | 'heading_3' | 'heading_4'
  | 'bulleted_list' | 'numbered_list' | 'to_do' | 'toggle'
  | 'quote' | 'callout' | 'divider' | 'code' | 'equation'
  | 'image' | 'bookmark' | 'table' | 'column_list' | 'column'
  | 'table_of_contents' | 'page';`,
          },
        },
        'Which `props` apply depends on the type:',
        {
          list: [
            '`heading_*`: `toggleable`, `open`',
            '`toggle`: `open` · `to_do`: `checked`',
            '`callout`: `icon` (emoji)',
            '`code`: `language` (the code itself is `text`)',
            '`equation`: `expression` (TeX)',
            '`image`: `src`, `caption`, `width`',
            '`bookmark`: `url`, `title`, `description`, `thumbnail`, `favicon`',
            '`table`: `rows` (RichText cells), `hasHeaderRow`, `hasHeaderColumn`, `columnWidths`',
            '`column`: `ratio` (0..1 width share) · `page`: `icon` (the title is `text`)',
          ],
        },
      ],
    },
    {
      title: 'Rich text',
      blocks: [
        '`RichText` is a list of runs. Each run has `text`, optional `marks` (`bold`, `italic`, `underline`, `strike`, `code`, `equation`, `link`, `color`) and optionally a `mention` (`{ kind: "page" | "user" | "date", label, icon? }`) that renders as a non-editable token.',
        {
          code: {
            filename: 'rich-text.ts',
            lang: 'ts',
            code: `const text: RichText = [
  { text: 'Read the ' },
  { text: 'brief', marks: { bold: true, link: 'https://example.com' } },
  { text: ' with ' },
  { text: 'Alex', mention: { kind: 'user', label: 'Alex' } },
  { text: ' before ' },
  { text: 'Friday', mention: { kind: 'date', label: 'Friday' } },
];`,
          },
        },
      ],
    },
    {
      title: 'Colors',
      blocks: [
        '`BlockColor` is `"default"`, one of nine color names (`gray`, `brown`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `red`) for colored text, or `<name>_background` for a tinted background. The same values work on a block (`block.color`) and on a run of text (`marks.color`). Text colors use `<c>-text-secondary`, backgrounds `<c>-bg-secondary` (callouts use the lighter `<c>-bg-primary`).',
        {
          example: {
            title: 'Block and text colors',
            align: 'start',
            render: () => (
              <C>
                <TextBlock text={rt('Blue text block')} color="blue" />
                <TextBlock text={rt('Yellow background block')} color="yellow_background" />
                <TextBlock
                  text={[
                    { text: 'Runs can be ' },
                    { text: 'red', marks: { color: 'red' } },
                    { text: ' or ' },
                    { text: 'highlighted', marks: { color: 'purple_background' } },
                    { text: '.' },
                  ]}
                />
              </C>
            ),
            code: `<TextBlock text={rt('Blue text block')} color="blue" />
<TextBlock text={rt('Yellow background block')} color="yellow_background" />
<TextBlock
  text={[
    { text: 'Runs can be ' },
    { text: 'red', marks: { color: 'red' } },
    { text: ' or ' },
    { text: 'highlighted', marks: { color: 'purple_background' } },
    { text: '.' },
  ]}
/>`,
          },
        },
      ],
    },
    {
      title: 'Helpers',
      blocks: [
        {
          list: [
            '`rt(text, marks?)` builds rich text from a string (`rt("")` is `[]`).',
            '`plainText(richText)` joins the runs back into a string.',
            '`blockId()` returns a short unique id for new blocks.',
            '`blockTypeNames` maps each type to its display label ("To-do list", "Toggle list"…); `isListLike`, `isHeading`, `textBlockTypes` classify types.',
            '`collectHeadings(blocks)` returns the headings used by the table of contents.',
            '`newBlock(kind)` and the `blockTree` helpers (`findBlock`, `insertIn`, `removeIn`, `indentIn`…) come from the editor entry.',
          ],
        },
      ],
    },
    {
      title: 'BlockContent',
      blocks: [
        'Block sizes are relative to the 16px / 1.5 content type (headings, code and inline code use `em`). `BlockRenderer` and `Editor` set it for you; when you render individual blocks on their own, wrap them in `BlockContent`, otherwise they inherit whatever font size surrounds them.',
        {
          code: {
            filename: '/app/page.tsx',
            lang: 'tsx',
            code: `import { BlockContent, Heading, TextBlock, rt } from '@krackedui/motion';\n\n<BlockContent>\n  <Heading level={2} text={rt('Section')} />\n  <TextBlock text={rt('Body copy at 16px.')} />\n</BlockContent>`,
          },
        },
      ],
    },
    a11y([
      'The renderer outputs plain flowing content: headings are visual (styled `div`s); give the page a real `h1` (see Page title) if you need a document outline.',
      'Toggles and to-dos stay interactive in read-only mode: they toggle locally unless you handle `onBlockChange`.',
      'Each rendered block carries `data-block-id`, which the table of contents uses to scroll to headings.',
    ]),
    usage([
      'Use `BlockRenderer` to show stored `Block[]` content read-only (published pages, previews, help articles).',
      'Use `Editor` when people write or rearrange the content; both share the same `Block[]` model.',
      'Wrap individual blocks in `BlockContent` when you render them outside `BlockRenderer` or `Editor`, so they get the 16px content type.',
      'Don’t use blocks for app chrome (forms, toolbars, settings); use the UI components instead.',
    ]),
  ],
  api: [
    {
      name: 'BlockRenderer',
      description: 'Renders a `Block[]` tree read-only with the block rhythm, list markers and numbering.',
      props: [
        { name: 'blocks', type: 'Block[]', description: 'The document (required).' },
        { name: 'renderLeaf', type: '(block: Block, p: LeafRenderProps) => ReactNode', description: 'Replace text leaves (the editor passes contenteditable leaves).' },
        { name: 'wrapBlock', type: '(block: Block, node: ReactElement, ctx: BlockRenderContext) => ReactNode', description: 'Wrap each block (the editor adds the hover handle and drop indicator). `ctx` = `{ depth, parent, index, siblings }`.' },
        { name: 'onBlockChange', type: '(id: string, props: Partial<BlockProps>) => void', description: 'Toggle open / to-do checked changes. Uncontrolled (local state) when omitted.' },
        { name: 'renderCell', type: '(block: Block, row: number, col: number, className: string) => ReactNode', description: 'Replace simple-table cells.' },
        { name: 'renderEquationEditor', type: '(block: Block) => ReactNode', description: 'Extra content under an equation block (the editor’s TeX input).' },
        { name: 'onEquationEdit', type: '(block: Block) => void', description: 'Makes equation blocks buttons that call this (the editor opens its TeX input).' },
        { name: 'onEmptyToggleClick', type: '(block: Block) => void', description: 'Click on the “Empty toggle” hint of an open toggle without children.' },
        { name: 'className', type: 'string' },
      ],
    },
    {
      name: 'BlockContent',
      description: 'Content container for standalone blocks: `flex flex-col`, 16px / 1.5.',
      props: [
        { name: 'children', type: 'ReactNode' },
        { name: 'className', type: 'string' },
      ],
    },
    {
      name: 'TextMarks',
      description: 'Inline formatting of one run.',
      props: [
        { name: 'bold', type: 'boolean', description: 'Weight 600.' },
        { name: 'italic', type: 'boolean' },
        { name: 'underline', type: 'boolean', description: '0.05em line, 10% offset.' },
        { name: 'strike', type: 'boolean' },
        { name: 'code', type: 'boolean', description: 'Inline code: red mono at 85% on a translucent chip.' },
        { name: 'equation', type: 'boolean', description: 'Inline equation (serif italic).' },
        { name: 'link', type: 'string', description: 'URL; rendered with a faded underline.' },
        { name: 'color', type: 'BlockColor', description: 'Text color or background highlight.' },
      ],
    },
    {
      name: 'Mention',
      props: [
        { name: 'kind', type: ['"page"', '"user"', '"date"'], description: 'Page: icon + underlined title. User / date: muted “@” + label.' },
        { name: 'label', type: 'string', description: 'Page title, person name or formatted date.' },
        { name: 'icon', type: 'string', default: '"📄"', description: 'Emoji for page mentions.' },
      ],
    },
  ],
};

/* ================================================================== TEXT */

const textPage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Text',
  description: 'The paragraph block: 16/24 rich text with inline marks, colors, links and mentions. Child blocks indent under it.',
  hero: {
    title: 'Text',
    align: 'start',
    render: () => (
      <C>
        <TextBlock
          text={[
            { text: 'Plain text with ' },
            { text: 'bold', marks: { bold: true } },
            { text: ', ' },
            { text: 'italic', marks: { italic: true } },
            { text: ', ' },
            { text: 'underline', marks: { underline: true } },
            { text: ', ' },
            { text: 'strikethrough', marks: { strike: true } },
            { text: ' and ' },
            { text: 'inline code', marks: { code: true } },
            { text: '.' },
          ]}
        />
      </C>
    ),
    code: `import { BlockContent, TextBlock } from '@krackedui/motion';

<BlockContent>
  <TextBlock
    text={[
      { text: 'Plain text with ' },
      { text: 'bold', marks: { bold: true } },
      { text: ', ' },
      { text: 'italic', marks: { italic: true } },
      { text: ', ' },
      { text: 'underline', marks: { underline: true } },
      { text: ', ' },
      { text: 'strikethrough', marks: { strike: true } },
      { text: ' and ' },
      { text: 'inline code', marks: { code: true } },
      { text: '.' },
    ]}
  />
</BlockContent>`,
  },
  install: install('BlockContent, TextBlock, rt', `<BlockContent>\n  <TextBlock text={rt('Hello world')} />\n</BlockContent>`),
  examples: [
    {
      title: 'Links and mentions',
      align: 'start',
      render: () => (
        <C>
          <TextBlock
            text={[
              { text: 'See ' },
              { text: 'the guide', marks: { link: 'https://example.com' } },
              { text: ', ask ' },
              { text: 'Alex', mention: { kind: 'user', label: 'Alex' } },
              { text: ', open ' },
              { text: 'Roadmap', mention: { kind: 'page', label: 'Roadmap', icon: '🗺️' } },
              { text: ' before ' },
              { text: 'Friday', mention: { kind: 'date', label: 'Friday' } },
              { text: '.' },
            ]}
          />
        </C>
      ),
      code: `<TextBlock
  text={[
    { text: 'See ' },
    { text: 'the guide', marks: { link: 'https://example.com' } },
    { text: ', ask ' },
    { text: 'Alex', mention: { kind: 'user', label: 'Alex' } },
    { text: ', open ' },
    { text: 'Roadmap', mention: { kind: 'page', label: 'Roadmap', icon: '🗺️' } },
    { text: ' before ' },
    { text: 'Friday', mention: { kind: 'date', label: 'Friday' } },
    { text: '.' },
  ]}
/>`,
    },
    {
      title: 'Text colors',
      description: 'Inline `marks.color` colors a run; a `_background` value highlights it.',
      align: 'start',
      render: () => (
        <C>
          <TextBlock
            text={(['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'] as const).flatMap((c, i) => [
              ...(i ? [{ text: ' ' }] : []),
              { text: c, marks: { color: c } },
            ])}
          />
          <TextBlock
            text={(['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'] as const).flatMap((c, i) => [
              ...(i ? [{ text: ' ' }] : []),
              { text: c, marks: { color: `${c}_background` as BlockColor } },
            ])}
          />
        </C>
      ),
      code: `const colors = ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'] as const;

<TextBlock text={colors.flatMap((c, i) => [...(i ? [{ text: ' ' }] : []), { text: c, marks: { color: c } }])} />
<TextBlock text={colors.flatMap((c, i) => [...(i ? [{ text: ' ' }] : []), { text: c, marks: { color: \`\${c}_background\` } }])} />`,
    },
    {
      title: 'Block color',
      align: 'start',
      render: () => (
        <C>
          <TextBlock text={rt('Green text block')} color="green" />
          <TextBlock text={rt('Blue background block')} color="blue_background" />
        </C>
      ),
      code: `<TextBlock text={rt('Green text block')} color="green" />\n<TextBlock text={rt('Blue background block')} color="blue_background" />`,
    },
    {
      title: 'Nested children',
      align: 'start',
      render: () => (
        <C>
          <TextBlock text={rt('Parent paragraph')}>
            <TextBlock text={rt('Child paragraph, indented 24px')} />
          </TextBlock>
        </C>
      ),
      code: `<TextBlock text={rt('Parent paragraph')}>\n  <TextBlock text={rt('Child paragraph, indented 24px')} />\n</TextBlock>`,
    },
  ],
  api: [
    {
      name: 'TextBlock',
      description: 'Based on `<div>` and supports its props (except `children`, which is the nested blocks). Adds:',
      props: [
        ...textContentProps,
        colorProp,
        { name: 'children', type: 'ReactNode', description: 'Nested child blocks, indented 24px.' },
        { name: 'placeholder', type: 'string', default: '" "', description: 'Placeholder passed to a custom `renderLeaf`.' },
      ],
    },
  ],
  sections: [
    a11y([
      'Links render as real `<a href>` elements with `rel="noopener noreferrer"`.',
      'Mentions are non-editable spans; their label is plain text, so screen readers read “@Alex”.',
      'Colored text uses `<c>-text-secondary` tokens; check contrast for long passages of colored text on colored backgrounds.',
    ]),
    usage([
      'Use the Text block for body paragraphs; it is the default block of every page.',
      'Use inline marks (bold, italic, code, links, mentions) for emphasis inside a paragraph rather than separate blocks.',
      'Nest child blocks under a paragraph only for content that belongs to it; use Toggle when it should be collapsible.',
      'Don’t use Text with bold marks as a section title; use Heading instead.',
    ]),
  ],
};

/* ================================================================== HEADING */

function ToggleHeadingDemo() {
  const [open, setOpen] = useState(true);
  return (
    <C>
      <Heading level={2} toggleable open={open} onOpenChange={setOpen} text={rt('Toggle heading 2')}>
        <TextBlock text={rt('Content inside the heading.')} />
      </Heading>
      <Heading level={3} toggleable open text={rt('Empty toggle heading')} />
    </C>
  );
}

const headingPage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Heading',
  description: 'The Heading 1–3 blocks (plus Heading 4) at weight 600, sized in em of the 16px content. Any heading can be a toggle heading.',
  hero: {
    title: 'Heading',
    align: 'start',
    render: () => (
      <C>
        <Heading level={1} text={rt('Heading 1')} />
        <Heading level={2} text={rt('Heading 2')} />
        <Heading level={3} text={rt('Heading 3')} />
        <Heading level={4} text={rt('Heading 4')} />
      </C>
    ),
    code: `import { BlockContent, Heading, rt } from '@krackedui/motion';

<BlockContent>
  <Heading level={1} text={rt('Heading 1')} />
  <Heading level={2} text={rt('Heading 2')} />
  <Heading level={3} text={rt('Heading 3')} />
  <Heading level={4} text={rt('Heading 4')} />
</BlockContent>`,
  },
  install: install('BlockContent, Heading, rt', `<BlockContent>\n  <Heading level={2} text={rt('Section')} />\n</BlockContent>`),
  examples: [
    {
      title: 'Toggle heading',
      description: 'With `toggleable`, a 24px disclosure triangle sits before the text and `children` show when `open`. An open toggle heading without children shows the “Empty toggle” hint, and its triangle is at 50% opacity.',
      align: 'start',
      render: () => <ToggleHeadingDemo />,
      code: `const [open, setOpen] = useState(true);

<Heading level={2} toggleable open={open} onOpenChange={setOpen} text={rt('Toggle heading 2')}>
  <TextBlock text={rt('Content inside the heading.')} />
</Heading>
<Heading level={3} toggleable open text={rt('Empty toggle heading')} />`,
    },
    {
      title: 'Color',
      align: 'start',
      render: () => (
        <C>
          <Heading level={2} color="purple" text={rt('Purple heading')} />
          <Heading level={3} color="yellow_background" text={rt('Highlighted heading')} />
        </C>
      ),
      code: `<Heading level={2} color="purple" text={rt('Purple heading')} />\n<Heading level={3} color="yellow_background" text={rt('Highlighted heading')} />`,
    },
  ],
  api: [
    {
      name: 'Heading',
      description: 'Based on `<div>` and supports its props. Adds:',
      props: [
        { name: 'level', type: ['1', '2', '3', '4'], default: '1', description: '1.875em, 1.5em, 1.25em or 1.125em, line-height 1.3.' },
        ...textContentProps,
        colorProp,
        { name: 'toggleable', type: 'boolean', default: 'false', description: 'Toggle heading: disclosure triangle, children hidden when closed.' },
        { name: 'open', type: 'boolean', description: 'Toggle heading open state.' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
        { name: 'children', type: 'ReactNode', description: 'Toggle heading content (indented 26px).' },
        { name: 'onEmptyClick', type: '() => void', description: 'Click on the “Empty toggle. Click or drop blocks inside.” hint.' },
      ],
    },
    {
      name: 'headingVariants',
      description: '`tv` slots `root`, `pad`, `leaf` with variant `level`, for custom heading markup.',
      props: [{ name: 'level', type: ['1', '2', '3', '4'], default: '1' }],
    },
  ],
  sections: [
    a11y([
      'Each heading is a `role="heading"` with `aria-level` one below its block level (the page title is the h1): Heading 1 is level 2 … Heading 4 is level 5, so the page has a real heading outline.',
      'The toggle triangle is the `DisclosureToggle` button with `aria-expanded`; `Enter` / `Space` toggle it.',
    ]),
    usage([
      'Use Heading 1–3 to structure a page into sections; keep levels in order without skipping.',
      'Use a toggle heading when a long section should be collapsible.',
      'Use Heading 4 sparingly for small sub-sections inside dense pages.',
      'Don’t use headings for emphasis inside running text; use bold marks instead.',
      'Don’t use a heading as the page title; use Page title.',
    ]),
  ],
};

/* ================================================================== LISTS */

const listPage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Bulleted & numbered list',
  description: 'Bulleted and numbered list items. Markers change with nesting depth: • ◦ ▪ for bullets, 1. a. i. for numbers, cycling every three levels.',
  hero: {
    title: 'Lists',
    align: 'start',
    render: () => (
      <C>
        <BulletedListItem text={rt('First item')} spacing={{ bottom: false }} />
        <BulletedListItem text={rt('Second item')} spacing={{ top: false }} />
        <NumberedListItem index={1} text={rt('Step one')} spacing={{ bottom: false }} />
        <NumberedListItem index={2} text={rt('Step two')} spacing={{ top: false }} />
      </C>
    ),
    code: `import { BlockContent, BulletedListItem, NumberedListItem, rt } from '@krackedui/motion';

<BlockContent>
  <BulletedListItem text={rt('First item')} spacing={{ bottom: false }} />
  <BulletedListItem text={rt('Second item')} spacing={{ top: false }} />
  <NumberedListItem index={1} text={rt('Step one')} spacing={{ bottom: false }} />
  <NumberedListItem index={2} text={rt('Step two')} spacing={{ top: false }} />
</BlockContent>`,
  },
  install: install('BlockContent, BulletedListItem, NumberedListItem, rt', `<BlockContent>\n  <BulletedListItem text={rt('Item')} />\n</BlockContent>`),
  examples: [
    {
      title: 'Nesting markers',
      description: 'Pass `depth` for the marker style; nested items go in `children` with `spacing={{ nested: true }}`.',
      align: 'start',
      render: () => (
        <C>
          <BulletedListItem text={rt('Depth 0')}>
            <BulletedListItem depth={1} spacing={{ nested: true }} text={rt('Depth 1')}>
              <BulletedListItem depth={2} spacing={{ nested: true }} text={rt('Depth 2')} />
            </BulletedListItem>
          </BulletedListItem>
          <NumberedListItem index={1} text={rt('Depth 0')}>
            <NumberedListItem depth={1} index={1} spacing={{ nested: true }} text={rt('Depth 1')}>
              <NumberedListItem depth={2} index={1} spacing={{ nested: true }} text={rt('Depth 2')} />
              <NumberedListItem depth={2} index={2} spacing={{ nested: true }} text={rt('Depth 2, second')} />
            </NumberedListItem>
          </NumberedListItem>
        </C>
      ),
      code: `<BulletedListItem text={rt('Depth 0')}>
  <BulletedListItem depth={1} spacing={{ nested: true }} text={rt('Depth 1')}>
    <BulletedListItem depth={2} spacing={{ nested: true }} text={rt('Depth 2')} />
  </BulletedListItem>
</BulletedListItem>
<NumberedListItem index={1} text={rt('Depth 0')}>
  <NumberedListItem depth={1} index={1} spacing={{ nested: true }} text={rt('Depth 1')}>
    <NumberedListItem depth={2} index={1} spacing={{ nested: true }} text={rt('Depth 2')} />
    <NumberedListItem depth={2} index={2} spacing={{ nested: true }} text={rt('Depth 2, second')} />
  </NumberedListItem>
</NumberedListItem>`,
    },
    {
      title: 'From a block tree',
      description: '`BlockRenderer` computes `depth`, `index` and `spacing` for you.',
      align: 'start',
      render: () => (
        <BlockRenderer
          className={content}
          blocks={[
            { id: 'n1', type: 'numbered_list', text: rt('Plan'), children: [{ id: 'n1a', type: 'numbered_list', text: rt('Draft') }, { id: 'n1b', type: 'numbered_list', text: rt('Review') }] },
            { id: 'n2', type: 'numbered_list', text: rt('Build') },
            { id: 'n3', type: 'numbered_list', text: rt('Ship') },
          ]}
        />
      ),
      code: `<BlockRenderer
  blocks={[
    { id: 'n1', type: 'numbered_list', text: rt('Plan'), children: [
      { id: 'n1a', type: 'numbered_list', text: rt('Draft') },
      { id: 'n1b', type: 'numbered_list', text: rt('Review') },
    ] },
    { id: 'n2', type: 'numbered_list', text: rt('Build') },
    { id: 'n3', type: 'numbered_list', text: rt('Ship') },
  ]}
/>`,
    },
  ],
  api: [
    {
      name: 'BulletedListItem',
      description: 'Based on `<div>` and supports its props. Adds:',
      props: [
        ...textContentProps,
        { name: 'depth', type: 'number', default: '0', description: 'Nesting depth: • ◦ ▪ (Arial 1.5em, line-height 1).' },
        { name: 'spacing', type: '{ top?: boolean; bottom?: boolean; nested?: boolean }', description: 'Vertical rhythm: 6px at run edges, 1px between items (`top`/`bottom: false`), 2/0 when `nested`.' },
        colorProp,
        { name: 'children', type: 'ReactNode', description: 'Nested blocks, aligned with the text.' },
      ],
    },
    {
      name: 'NumberedListItem',
      description: 'Based on `<div>` and supports its props. Adds:',
      props: [
        ...textContentProps,
        { name: 'index', type: 'number', default: '1', description: '1-based position in its run: 1. / a. / i. by depth.' },
        { name: 'depth', type: 'number', default: '0', description: 'Nesting depth: picks the marker style (1. → a. → i.).' },
        { name: 'spacing', type: '{ top?: boolean; bottom?: boolean; nested?: boolean }', description: 'List rhythm (see `BulletedListItem`).' },
        colorProp,
        { name: 'children', type: 'ReactNode', description: 'Nested blocks, aligned with the text.' },
      ],
    },
    {
      name: 'bulletFor / numberFor',
      description: 'Marker helpers: `bulletFor(depth)` and `numberFor(index, depth)`.',
      props: [
        { name: 'depth', type: 'number', description: '0-based nesting depth.' },
        { name: 'index', type: 'number', description: '1-based item number.' },
      ],
    },
  ],
  sections: [
    a11y([
      'Markers are decorative (`contentEditable={false}`, in a separate box); the list semantics are visual. Use `role="list"` / `role="listitem"` via props if you need them announced.',
    ]),
    usage([
      'Use bulleted lists for items without an order, numbered lists for steps or rankings.',
      'Nest items for sub-points; markers change per depth automatically (• ◦ ▪, 1. a. i.).',
      'Pass `index` to numbered items when you render them yourself; `BlockRenderer` numbers runs for you.',
      'Don’t use a list for actionable items; use To-do instead.',
    ]),
  ],
};

/* ================================================================== TO-DO */

function TodoDemo() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <C>
      <ToDo text={rt('Write the outline')} checked={a} onCheckedChange={setA} spacing={{ bottom: false }} />
      <ToDo text={rt('Share it for review')} checked={b} onCheckedChange={setB} spacing={{ top: false }} />
    </C>
  );
}

const todoPage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'To-do',
  description: 'The to-do list item: a 16px checkbox; checked items are struck through and faded.',
  hero: {
    title: 'To-do',
    align: 'start',
    render: () => <TodoDemo />,
    code: `import { BlockContent, ToDo, rt } from '@krackedui/motion';

export function TodoDemo() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <BlockContent>
      <ToDo text={rt('Write the outline')} checked={a} onCheckedChange={setA} spacing={{ bottom: false }} />
      <ToDo text={rt('Share it for review')} checked={b} onCheckedChange={setB} spacing={{ top: false }} />
    </BlockContent>
  );
}`,
  },
  install: install('BlockContent, ToDo, rt', `<BlockContent>\n  <ToDo text={rt('Task')} checked onCheckedChange={setChecked} />\n</BlockContent>`),
  examples: [
    {
      title: 'Read-only',
      description: 'Without `onCheckedChange` the checkbox is read-only.',
      align: 'start',
      render: () => (
        <C>
          <ToDo text={rt('Done')} checked spacing={{ bottom: false }} />
          <ToDo text={rt('Not done')} spacing={{ top: false }} />
        </C>
      ),
      code: `<ToDo text={rt('Done')} checked spacing={{ bottom: false }} />\n<ToDo text={rt('Not done')} spacing={{ top: false }} />`,
    },
    {
      title: 'With children',
      align: 'start',
      render: () => (
        <C>
          <ToDo text={rt('Prepare release')}>
            <ToDo spacing={{ nested: true }} checked text={rt('Changelog')} />
            <ToDo spacing={{ nested: true }} text={rt('Announcement')} />
          </ToDo>
        </C>
      ),
      code: `<ToDo text={rt('Prepare release')}>\n  <ToDo spacing={{ nested: true }} checked text={rt('Changelog')} />\n  <ToDo spacing={{ nested: true }} text={rt('Announcement')} />\n</ToDo>`,
    },
  ],
  api: [
    {
      name: 'ToDo',
      description: 'Based on `<div>` and supports its props. Adds:',
      props: [
        ...textContentProps,
        { name: 'checked', type: 'boolean', default: 'false', description: 'Checked: line-through (text-primary at 50%) and opacity .7.' },
        { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'Omit for a read-only checkbox.' },
        { name: 'depth', type: 'number', default: '0', description: 'Nesting depth; accepted for parity with the other list items and does not change the look.' },
        { name: 'spacing', type: '{ top?: boolean; bottom?: boolean; nested?: boolean }', description: 'List rhythm (see Lists).' },
        colorProp,
        { name: 'children', type: 'ReactNode', description: 'Nested blocks.' },
      ],
    },
  ],
  sections: [
    a11y([
      'The box is the `Checkbox` atom (`role="checkbox"`, `aria-checked`, label “To-do”); `Space` toggles it when focused.',
      'Pass a more specific `aria-label` through a custom marker if several to-dos need distinct names.',
    ]),
    usage([
      'Use To-do for actionable items that people check off (checklists, meeting actions).',
      'Pass `onCheckedChange` to make the checkbox interactive; omit it for a read-only checklist.',
      'Don’t use To-do for options in a form; use `Checkbox` instead.',
      'Don’t use To-do for tracked work with owners and dates; use a database instead.',
    ]),
  ],
};

/* ================================================================== TOGGLE */

function ToggleDemo() {
  const [open, setOpen] = useState(true);
  return (
    <C>
      <Toggle text={rt('Click the triangle')} open={open} onOpenChange={setOpen}>
        <TextBlock text={rt('Content inside the toggle.')} />
      </Toggle>
      <Toggle text={rt('Empty toggle')} open />
    </C>
  );
}

const togglePage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Toggle',
  description: 'The toggle list: a disclosure triangle that shows or hides nested blocks. An open toggle with no children shows a clickable “Empty toggle” hint.',
  hero: {
    title: 'Toggle',
    align: 'start',
    render: () => <ToggleDemo />,
    code: `import { BlockContent, TextBlock, Toggle, rt } from '@krackedui/motion';

export function ToggleDemo() {
  const [open, setOpen] = useState(true);
  return (
    <BlockContent>
      <Toggle text={rt('Click the triangle')} open={open} onOpenChange={setOpen}>
        <TextBlock text={rt('Content inside the toggle.')} />
      </Toggle>
      <Toggle text={rt('Empty toggle')} open />
    </BlockContent>
  );
}`,
  },
  install: install('BlockContent, Toggle, rt', `<BlockContent>\n  <Toggle text={rt('Details')} open={open} onOpenChange={setOpen}>…</Toggle>\n</BlockContent>`),
  examples: [
    {
      title: 'Closed',
      align: 'start',
      render: () => (
        <C>
          <Toggle text={rt('Closed toggle')} open={false} spacing={{ bottom: false }} />
          <Toggle text={rt('Another closed toggle')} open={false} spacing={{ top: false }} />
        </C>
      ),
      code: `<Toggle text={rt('Closed toggle')} open={false} spacing={{ bottom: false }} />\n<Toggle text={rt('Another closed toggle')} open={false} spacing={{ top: false }} />`,
    },
  ],
  api: [
    {
      name: 'Toggle',
      description: 'Based on `<div>` and supports its props. Adds:',
      props: [
        ...textContentProps,
        { name: 'open', type: 'boolean', default: 'false', description: 'Show `children`.' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
        { name: 'onEmptyClick', type: '() => void', description: 'Click on the “Empty toggle. Click or drop blocks inside.” hint.' },
        { name: 'depth', type: 'number', default: '0', description: 'Nesting depth; accepted for parity with the other list items and does not change the look.' },
        { name: 'spacing', type: '{ top?: boolean; bottom?: boolean; nested?: boolean }', description: 'List rhythm (see Lists).' },
        colorProp,
        { name: 'children', type: 'ReactNode', description: 'Content shown when open.' },
      ],
    },
  ],
  sections: [
    a11y([
      'The triangle is a `button` with `aria-expanded`; `Enter` / `Space` toggle it.',
      'Hidden content is unmounted while closed, so it is not reachable by keyboard or screen readers.',
    ]),
    usage([
      'Use Toggle to hide secondary detail (FAQs, long notes, optional steps) behind a disclosure.',
      'Control `open` with `onOpenChange` when the state should persist or be shared.',
      'Don’t hide content people need to read first; keep primary content visible.',
      'Don’t use Toggle for navigation or app sections; use `Accordion` or `Tabs` instead.',
    ]),
  ],
};

/* ================================================================== QUOTE */

const quotePage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Quote',
  description: 'The quote block: a 3px bar in the current text color, with text starting 33px in.',
  hero: {
    title: 'Quote',
    align: 'start',
    render: () => (
      <C>
        <Quote text={rt('Make it work, make it right, make it fast.')} />
      </C>
    ),
    code: `import { BlockContent, Quote, rt } from '@krackedui/motion';\n\n<BlockContent>\n  <Quote text={rt('Make it work, make it right, make it fast.')} />\n</BlockContent>`,
  },
  install: install('BlockContent, Quote, rt', `<BlockContent>\n  <Quote text={rt('Quote')} />\n</BlockContent>`),
  examples: [
    {
      title: 'Large',
      description: 'Large quote size (1.2em).',
      align: 'start',
      render: () => (
        <C>
          <Quote large text={rt('A larger quote for emphasis.')} />
        </C>
      ),
      code: `<Quote large text={rt('A larger quote for emphasis.')} />`,
    },
    {
      title: 'Color',
      description: 'The bar uses `currentColor`, so a text color recolors both.',
      align: 'start',
      render: () => (
        <C>
          <Quote color="blue" text={rt('Blue quote')} />
          <Quote color="gray_background" text={rt('Quote on a gray background')} />
        </C>
      ),
      code: `<Quote color="blue" text={rt('Blue quote')} />\n<Quote color="gray_background" text={rt('Quote on a gray background')} />`,
    },
    {
      title: 'With children',
      align: 'start',
      render: () => (
        <C>
          <Quote text={rt('First line of the quote.')}>
            <TextBlock text={rt('A nested paragraph inside the quote.')} />
          </Quote>
        </C>
      ),
      code: `<Quote text={rt('First line of the quote.')}>\n  <TextBlock text={rt('A nested paragraph inside the quote.')} />\n</Quote>`,
    },
  ],
  api: [
    {
      name: 'Quote',
      description: 'Based on `<div>` and supports its props; renders a `<blockquote>`. Adds:',
      props: [
        ...textContentProps,
        colorProp,
        { name: 'large', type: 'boolean', default: 'false', description: '1.2em text.' },
        { name: 'children', type: 'ReactNode', description: 'Blocks inside the quote, under the first line.' },
      ],
    },
  ],
  sections: [
    a11y(['Renders a native `<blockquote>`.', 'Placeholder “Empty quote” when edited.']),
    usage([
      'Use Quote for quoted speech, testimonials or excerpts from another source.',
      'Use the large size for a single pull quote that should stand out.',
      'Don’t use Quote for notes, tips or warnings; use Callout instead.',
    ]),
  ],
};

/* ================================================================== CALLOUT */

const calloutColors = ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'] as const;

const calloutPage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Callout',
  description: 'The callout: an emoji and text in a rounded, tinted box. Defaults to 💡 on gray; any block color works.',
  hero: {
    title: 'Callout',
    align: 'start',
    render: () => (
      <C>
        <Callout text={rt('Callouts draw attention to a tip or warning.')} />
      </C>
    ),
    code: `import { BlockContent, Callout, rt } from '@krackedui/motion';\n\n<BlockContent>\n  <Callout text={rt('Callouts draw attention to a tip or warning.')} />\n</BlockContent>`,
  },
  install: install('BlockContent, Callout, rt', `<BlockContent>\n  <Callout icon="⚠️" color="yellow_background" text={rt('Heads up')} />\n</BlockContent>`),
  examples: [
    {
      title: 'Background colors',
      description: 'Callout backgrounds use the lighter `<c>-bg-primary` tone.',
      align: 'start',
      render: () => (
        <C>
          {calloutColors.map((c) => (
            <Callout key={c} color={`${c}_background`} icon="📌" text={rt(`${c[0].toUpperCase()}${c.slice(1)} background`)} />
          ))}
        </C>
      ),
      code: `const colors = ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'] as const;

{colors.map((c) => (
  <Callout key={c} color={\`\${c}_background\`} icon="📌" text={rt(\`\${c} background\`)} />
))}`,
    },
    {
      title: 'Text color and default',
      description: 'A text color (or `"default"`) drops the fill and draws a 1px border instead.',
      align: 'start',
      render: () => (
        <C>
          <Callout color="default" icon="📝" text={rt('Default: bordered, no fill')} />
          <Callout color="red" icon="🚨" text={rt('Red text, bordered')} />
        </C>
      ),
      code: `<Callout color="default" icon="📝" text={rt('Default: bordered, no fill')} />\n<Callout color="red" icon="🚨" text={rt('Red text, bordered')} />`,
    },
    {
      title: 'With children',
      align: 'start',
      render: () => (
        <C>
          <Callout icon="🧭" color="blue_background" text={rt('Before you start')}>
            <BulletedListItem text={rt('Read the overview')} spacing={{ bottom: false }} />
            <BulletedListItem text={rt('Pick a template')} spacing={{ top: false }} />
          </Callout>
        </C>
      ),
      code: `<Callout icon="🧭" color="blue_background" text={rt('Before you start')}>
  <BulletedListItem text={rt('Read the overview')} spacing={{ bottom: false }} />
  <BulletedListItem text={rt('Pick a template')} spacing={{ top: false }} />
</Callout>`,
    },
  ],
  api: [
    {
      name: 'Callout',
      description: 'Based on `<div>` and supports its props. Adds:',
      props: [
        { name: 'icon', type: 'ReactNode', default: '"💡"', description: 'Emoji string (rendered by `PageIcon`) or any node.' },
        { name: 'color', type: 'BlockColor', default: '"gray_background"', description: '`<c>_background` fills; a text color or `"default"` uses a 1px border.' },
        ...textContentProps,
        { name: 'children', type: 'ReactNode', description: 'Extra blocks under the first line.' },
        { name: 'onIconClick', type: '() => void', description: 'Click on the icon button (for example to open an emoji picker).' },
      ],
    },
    {
      name: 'calloutBgClass',
      description: '`Record<ColorName, string>` of the callout background utilities (`bg-n-<c>-bg-primary`).',
      props: [],
    },
  ],
  sections: [
    a11y([
      'The box has `role="note"` with `aria-roledescription="callout"`.',
      'The icon is a focusable button labeled “Change callout icon”.',
    ]),
    usage([
      'Use Callout to highlight a tip, note or warning inside page content.',
      'Pick an emoji and block color that match the message (for example red for warnings).',
      'Keep callouts short; one or two per section is enough.',
      'Don’t use Callout for system feedback in the app UI; use `Alert` or `Toast` instead.',
    ]),
  ],
};

/* ================================================================== DIVIDER */

const dividerPage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Divider',
  description: 'The divider block: a 1px hairline in a 13px row. Created by typing `---`.',
  hero: {
    title: 'Divider',
    align: 'start',
    render: () => (
      <C>
        <TextBlock text={rt('Above the divider')} />
        <DividerBlock />
        <TextBlock text={rt('Below the divider')} />
      </C>
    ),
    code: `import { BlockContent, DividerBlock, TextBlock, rt } from '@krackedui/motion';

<BlockContent>
  <TextBlock text={rt('Above the divider')} />
  <DividerBlock />
  <TextBlock text={rt('Below the divider')} />
</BlockContent>`,
  },
  install: install('DividerBlock', `<DividerBlock />`),
  api: [
    {
      name: 'DividerBlock',
      description: 'Based on `<div>` and supports all of its props. No extra props.',
      props: [{ name: 'className', type: 'string' }],
    },
  ],
  sections: [
    a11y(['The line has `role="separator"`.', 'The block is not editable (`contentEditable={false}`); in the editor, Backspace from the next block removes it.']),
    usage([
      'Use Divider to separate groups of content within a page when a heading would be too heavy.',
      'Don’t stack dividers or use them between every block; spacing and headings usually suffice.',
      'Don’t use the Divider block in app chrome; use the `Divider` atom instead.',
    ]),
  ],
};

/* ================================================================== CODE */

const codeSample = `function greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet('world'));`;

const codePage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Code',
  description: 'The code block: monospaced text on a tinted card. Hovering shows the language button (top left) and Copy (top right).',
  hero: {
    title: 'Code',
    align: 'start',
    render: () => (
      <C>
        <Code language="JavaScript" text={rt(codeSample)} />
      </C>
    ),
    code: `import { BlockContent, Code, rt } from '@krackedui/motion';

const source = \`function greet(name) {
  return \\\`Hello, \\\${name}!\\\`;
}

console.log(greet('world'));\`;

<BlockContent>
  <Code language="JavaScript" text={rt(source)} />
</BlockContent>`,
  },
  install: install('BlockContent, Code, rt', `<BlockContent>\n  <Code language="TypeScript" text={rt('const a = 1;')} />\n</BlockContent>`),
  examples: [
    {
      title: 'Caption',
      align: 'start',
      render: () => (
        <C>
          <Code language="Shell" text={rt('npm install @krackedui/motion')} caption={rt('Install command')} />
        </C>
      ),
      code: `<Code language="Shell" text={rt('npm install @krackedui/motion')} caption={rt('Install command')} />`,
    },
  ],
  api: [
    {
      name: 'Code',
      description: 'Based on `<div>` and supports its props. Adds:',
      props: [
        { name: 'text', type: 'RichText', description: 'The code (marks are ignored).' },
        { name: 'language', type: 'string', default: '"JavaScript"', description: 'Label of the hover language button.' },
        { name: 'caption', type: 'RichText', description: 'Caption under the card (14/1.4, text-secondary).' },
        { name: 'renderLeaf', type: 'LeafRenderer', description: 'Replace the code leaf (editor).' },
        { name: 'onLanguageClick', type: '() => void', description: 'Click on the language button.' },
      ],
    },
  ],
  sections: [
    a11y([
      'The card has `role="figure"`. Language and Copy are real buttons; they are only visible on hover, so they stay reachable by Tab.',
      'Copy writes the plain text to the clipboard and shows “Copied” for 1.2s.',
      'No syntax highlighting: text is `text-primary`, so color never carries meaning.',
    ]),
    usage([
      'Use the Code block for multi-line code, commands or config that people may copy.',
      'Set the language so readers know what the snippet is; Copy is shown on hover.',
      'Use inline code marks for short identifiers inside a sentence instead of a Code block.',
      'Don’t rely on syntax colors; the block renders plain monospaced text.',
    ]),
  ],
};

/* ================================================================== EQUATION */

const equationPage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Equation',
  description: 'The block equation: centered display math from a TeX expression. The renderer is a light TeX-ish approximation (superscripts, subscripts, fractions, Greek letters and common symbols), with no KaTeX dependency.',
  hero: {
    title: 'Equation',
    align: 'start',
    render: () => (
      <C>
        <Equation expression="E = mc^2" />
      </C>
    ),
    code: `import { BlockContent, Equation } from '@krackedui/motion';\n\n<BlockContent>\n  <Equation expression="E = mc^2" />\n</BlockContent>`,
  },
  install: install('Equation', `<Equation expression="a^2 + b^2 = c^2" />`),
  examples: [
    {
      title: 'Fractions and symbols',
      align: 'start',
      render: () => (
        <C>
          <Equation expression="\sum_{i=1}^{n} x_i = \frac{n(n+1)}{2}" />
          <Equation expression="\alpha + \beta \leq \pi" />
        </C>
      ),
      code: `<Equation expression="\\sum_{i=1}^{n} x_i = \\frac{n(n+1)}{2}" />\n<Equation expression="\\alpha + \\beta \\leq \\pi" />`,
    },
    {
      title: 'Empty',
      align: 'start',
      render: () => (
        <C>
          <Equation />
        </C>
      ),
      code: `<Equation />`,
    },
  ],
  api: [
    {
      name: 'Equation',
      description: 'Based on `<div>` and supports its props. Adds:',
      props: [
        { name: 'expression', type: 'string', default: '""', description: 'TeX source. Empty shows “Add a TeX equation”.' },
        { name: 'editor', type: 'ReactNode', description: 'Slot under the rendering (the editor’s TeX input).' },
        { name: 'onEdit', type: '() => void', description: 'Makes the rendering a button (named “Edit equation …”) that opens the TeX input.' },
      ],
    },
    { name: 'renderTex', description: '`renderTex(src: string): ReactNode[]`: the inline renderer, usable on its own.', props: [] },
  ],
  sections: [
    a11y(['The rendering is visual; add an `aria-label` with a spoken form of the formula for screen readers.', 'With `onEdit` (the editor) the rendering is a button: `Enter`/`Space` or a click opens the TeX input; `Enter` or `Esc` closes it.']),
    usage([
      'Use the Equation block for display math that stands on its own line.',
      'Use inline equations (rich text) for short formulas inside a sentence.',
      'Add an `aria-label` with a spoken form of the formula.',
      'Don’t use it for complex typesetting that needs a full TeX engine; the renderer covers common notation only.',
    ]),
  ],
};

/* ================================================================== IMAGE */

const imagePage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Image',
  description: 'The image block: a centered image with radius 4 and an optional caption. With no `src` it shows the “Add an image” placeholder.',
  hero: {
    title: 'Image',
    align: 'start',
    render: () => (
      <C>
        <ImageBlock src={sampleImage} alt="Abstract landscape" caption={rt('A caption under the image')} />
      </C>
    ),
    code: `import { BlockContent, ImageBlock, rt } from '@krackedui/motion';\n\n<BlockContent>\n  <ImageBlock src="/landscape.png" alt="Abstract landscape" caption={rt('A caption under the image')} />\n</BlockContent>`,
  },
  install: install('ImageBlock', `<ImageBlock src="/photo.jpg" alt="" />`),
  examples: [
    {
      title: 'Width',
      align: 'start',
      render: () => (
        <C>
          <ImageBlock src={sampleImage} alt="Abstract landscape" width={320} />
        </C>
      ),
      code: `<ImageBlock src="/landscape.png" alt="Abstract landscape" width={320} />`,
    },
    {
      title: 'Placeholder',
      align: 'start',
      render: () => (
        <C>
          <ImageBlock />
        </C>
      ),
      code: `const [src, setSrc] = useState<string>();

<ImageBlock src={src} alt="Abstract landscape" onPlaceholderClick={() => setSrc('/landscape.png')} />`,
    },
  ],
  api: [
    {
      name: 'ImageBlock',
      description: 'Based on `<div>` and supports its props. Adds:',
      props: [
        { name: 'src', type: 'string', description: 'Image URL; omit for the placeholder.' },
        { name: 'alt', type: 'string', default: '""' },
        { name: 'caption', type: 'RichText', description: '14/1.4 `text-secondary`, padding 6 2.' },
        { name: 'width', type: 'number', description: 'Width in px (defaults to the full column).' },
        { name: 'captionSlot', type: 'ReactNode', description: 'Replace the caption (editor).' },
        { name: 'onPlaceholderClick', type: '() => void', description: 'Click on “Add an image”.' },
      ],
    },
  ],
  sections: [
    a11y(['Always pass `alt` for meaningful images.', 'The placeholder is a `role="button"` with `tabIndex={0}`.']),
    usage([
      'Use the Image block for figures, screenshots and photos inside page content.',
      'Always provide `alt` text, and a caption when the image needs context.',
      'Show the placeholder (no `src`) only while content is being edited.',
      'Don’t use the Image block for avatars, icons or decorative UI; use `Avatar` or `Icon` instead.',
    ]),
  ],
};

/* ================================================================== BOOKMARK */

const bookmarkPage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Bookmark',
  description: 'The web bookmark: a bordered card with the page title, description and URL, and an optional thumbnail on the right.',
  hero: {
    title: 'Bookmark',
    align: 'start',
    render: () => (
      <C>
        <Bookmark
          url="https://example.com/guide"
          title="Example guide"
          description="A short description of the linked page, clamped to two lines."
          thumbnail={sampleImage}
        />
      </C>
    ),
    code: `import { BlockContent, Bookmark } from '@krackedui/motion';

<BlockContent>
  <Bookmark
    url="https://example.com/guide"
    title="Example guide"
    description="A short description of the linked page, clamped to two lines."
    thumbnail="/thumbnail.png"
  />
</BlockContent>`,
  },
  install: install('Bookmark', `<Bookmark url="https://example.com" title="Example" />`),
  examples: [
    {
      title: 'Minimal',
      description: 'Without a title the hostname is shown.',
      align: 'start',
      render: () => (
        <C>
          <Bookmark url="https://example.com" />
        </C>
      ),
      code: `<Bookmark url="https://example.com" />`,
    },
    {
      title: 'Placeholder',
      align: 'start',
      render: () => (
        <C>
          <Bookmark />
        </C>
      ),
      code: `const [url, setUrl] = useState<string>();

<Bookmark url={url} onPlaceholderClick={() => setUrl(window.prompt('Paste a link') ?? undefined)} />`,
    },
  ],
  api: [
    {
      name: 'Bookmark',
      description: 'Based on `<div>` and supports its props (except `title`). Adds:',
      props: [
        { name: 'url', type: 'string', description: 'Link target; omit for the “Add a web bookmark” placeholder.' },
        { name: 'title', type: 'string', description: 'Defaults to the hostname.' },
        { name: 'description', type: 'string', description: '12/16 `text-secondary`, two lines.' },
        { name: 'thumbnail', type: 'string', description: 'Preview image on the right (hidden below `sm`).' },
        { name: 'favicon', type: 'string', description: '16px icon before the URL (globe icon by default).' },
        { name: 'onPlaceholderClick', type: '() => void' },
      ],
    },
  ],
  sections: [
    a11y(['The card is a real link (`target="_blank"`, `rel="noopener noreferrer"`).', 'Thumbnail and favicon are decorative (`alt=""`).']),
    usage([
      'Use Bookmark to preview an external web page with its title, description and thumbnail.',
      'Use a plain link in text when the preview would distract from the paragraph.',
      'Don’t use Bookmark for links between pages of the same workspace; use Page link instead.',
    ]),
  ],
};

/* ================================================================== SIMPLE TABLE */

const tableRows: RichText[][] = [
  [rt('Name'), rt('Role'), rt('Status')],
  [rt('Alex'), rt('Design'), rt('Active')],
  [rt('Sam'), rt('Engineering'), rt('Away')],
];

const simpleTablePage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Simple table',
  description: 'The simple table block (not a database): a grid of rich-text cells with an optional header row and header column.',
  hero: {
    title: 'Simple table',
    align: 'start',
    render: () => (
      <C>
        <SimpleTable rows={tableRows} />
      </C>
    ),
    code: `import { BlockContent, SimpleTable, rt } from '@krackedui/motion';

const rows = [
  [rt('Name'), rt('Role'), rt('Status')],
  [rt('Alex'), rt('Design'), rt('Active')],
  [rt('Sam'), rt('Engineering'), rt('Away')],
];

<BlockContent>
  <SimpleTable rows={rows} />
</BlockContent>`,
  },
  install: install('SimpleTable, rt', `<SimpleTable rows={[[rt('A'), rt('B')], [rt('1'), rt('2')]]} />`),
  examples: [
    {
      title: 'Header column',
      align: 'start',
      render: () => (
        <C>
          <SimpleTable rows={tableRows} hasHeaderRow hasHeaderColumn />
        </C>
      ),
      code: `const rows = [
  [rt('Name'), rt('Role'), rt('Status')],
  [rt('Alex'), rt('Design'), rt('Active')],
  [rt('Sam'), rt('Engineering'), rt('Away')],
];

<SimpleTable rows={rows} hasHeaderRow hasHeaderColumn />`,
    },
    {
      title: 'No header, custom widths',
      align: 'start',
      render: () => (
        <C>
          <SimpleTable rows={tableRows.slice(1)} hasHeaderRow={false} columnWidths={[160, 200, 120]} />
        </C>
      ),
      code: `const rows = [
  [rt('Alex'), rt('Design'), rt('Active')],
  [rt('Sam'), rt('Engineering'), rt('Away')],
];

<SimpleTable rows={rows} hasHeaderRow={false} columnWidths={[160, 200, 120]} />`,
    },
  ],
  api: [
    {
      name: 'SimpleTable',
      description: 'Based on `<div>` and supports its props. Adds:',
      props: [
        { name: 'rows', type: 'RichText[][]', description: 'Cells by row (required).' },
        { name: 'hasHeaderRow', type: 'boolean', default: 'true', description: 'First row as `th` with the header background, weight 500.' },
        { name: 'hasHeaderColumn', type: 'boolean', default: 'false', description: 'First column as row headers.' },
        { name: 'columnWidths', type: 'number[]', default: '120 each', description: 'Column widths in px.' },
        { name: 'renderCell', type: '(row: number, col: number, className: string) => ReactNode', description: 'Replace a cell’s content (editor).' },
      ],
    },
  ],
  sections: [
    a11y(['A native `<table>`: header cells are `th` with `scope="col"` / `scope="row"`.', 'Wide tables scroll horizontally inside the block.']),
    usage([
      'Use the simple table for small static grids of text (comparisons, specs, schedules).',
      'Turn on the header row and/or header column when the first row or column labels the others.',
      'Don’t use it for records people sort, filter or edit as data; use a database instead.',
    ]),
  ],
};

/* ================================================================== COLUMNS */

const columnsPage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Columns',
  description: 'The column list: 2–5 side-by-side columns separated by 46px gutters, each holding any blocks.',
  hero: {
    title: 'Columns',
    align: 'start',
    render: () => (
      <C>
        <Columns>
          <div className="flex flex-col">
            <Heading level={3} text={rt('Left')} />
            <TextBlock text={rt('First column content.')} />
          </div>
          <div className="flex flex-col">
            <Heading level={3} text={rt('Right')} />
            <TextBlock text={rt('Second column content.')} />
          </div>
        </Columns>
      </C>
    ),
    code: `import { BlockContent, Columns, Heading, TextBlock, rt } from '@krackedui/motion';

<BlockContent>
  <Columns>
    <div className="flex flex-col">
      <Heading level={3} text={rt('Left')} />
      <TextBlock text={rt('First column content.')} />
    </div>
    <div className="flex flex-col">
      <Heading level={3} text={rt('Right')} />
      <TextBlock text={rt('Second column content.')} />
    </div>
  </Columns>
</BlockContent>`,
  },
  install: install('Columns', `<Columns>\n  <div>…</div>\n  <div>…</div>\n</Columns>`),
  examples: [
    {
      title: 'Ratios',
      description: '`ratios` sets each column’s share of the width (sum 1).',
      align: 'start',
      render: () => (
        <C>
          <Columns ratios={[0.7, 0.3]}>
            <Callout color="blue_background" icon="📘" text={rt('70% column')} />
            <Callout color="gray_background" icon="📎" text={rt('30% column')} />
          </Columns>
        </C>
      ),
      code: `<Columns ratios={[0.7, 0.3]}>\n  <Callout color="blue_background" icon="📘" text={rt('70% column')} />\n  <Callout color="gray_background" icon="📎" text={rt('30% column')} />\n</Columns>`,
    },
    {
      title: 'Three columns from a block tree',
      align: 'start',
      render: () => (
        <BlockRenderer
          className={content}
          blocks={[
            {
              id: 'cl',
              type: 'column_list',
              children: ['One', 'Two', 'Three'].map((t, i) => ({ id: `col${i}`, type: 'column' as const, children: [{ id: `ct${i}`, type: 'text' as const, text: rt(t) }] })),
            },
          ]}
        />
      ),
      code: `<BlockRenderer
  blocks={[{
    id: 'cl',
    type: 'column_list',
    children: ['One', 'Two', 'Three'].map((t, i) => ({
      id: \`col\${i}\`,
      type: 'column',
      children: [{ id: \`ct\${i}\`, type: 'text', text: rt(t) }],
    })),
  }]}
/>`,
    },
  ],
  api: [
    {
      name: 'Columns',
      description: 'Based on `<div>` and supports its props. Adds:',
      props: [
        { name: 'children', type: 'ReactNode', description: 'One child per column (2–5, required).' },
        { name: 'ratios', type: 'number[]', default: 'equal', description: 'Width share per column; width = (100% − 46px × (n−1)) × ratio.' },
      ],
    },
  ],
  sections: [
    a11y(['Columns are plain layout; reading order follows the DOM (left to right, then top to bottom).', 'There is no responsive stacking; columns stay side by side.']),
    usage([
      'Use Columns to place related content side by side (comparisons, text next to an image).',
      'Keep to 2–3 columns for text; more columns get narrow quickly.',
      'Columns do not stack on narrow screens; avoid them for content that must read well on phones.',
      'Don’t use Columns for page layout or app chrome; use the layout primitives (`Stack`, `Grid`) instead.',
    ]),
  ],
};

/* ================================================================== TABLE OF CONTENTS */

const tocPage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Table of contents',
  description: 'The table of contents block: links to the page’s headings, indented 24px per level. Inside `BlockRenderer` it collects the headings automatically.',
  hero: {
    title: 'Table of contents',
    align: 'start',
    render: () => (
      <C>
        <TableOfContents
          onItemClick={() => {}}
          items={[
            { id: 'a', level: 1, text: 'Overview' },
            { id: 'b', level: 2, text: 'Goals' },
            { id: 'c', level: 3, text: 'Scope' },
            { id: 'd', level: 2, text: 'Timeline' },
            { id: 'e', level: 1, text: 'Appendix' },
          ]}
        />
      </C>
    ),
    code: `import { BlockContent, TableOfContents } from '@krackedui/motion';

<BlockContent>
  <TableOfContents
    items={[
      { id: 'a', level: 1, text: 'Overview' },
      { id: 'b', level: 2, text: 'Goals' },
      { id: 'c', level: 3, text: 'Scope' },
      { id: 'd', level: 2, text: 'Timeline' },
      { id: 'e', level: 1, text: 'Appendix' },
    ]}
  />
</BlockContent>`,
  },
  install: install('TableOfContents', `<TableOfContents items={collectHeadings(blocks)} />`),
  examples: [
    {
      title: 'Empty',
      align: 'start',
      render: () => (
        <C>
          <TableOfContents items={[]} />
        </C>
      ),
      code: `<TableOfContents items={[]} />`,
    },
  ],
  api: [
    {
      name: 'TableOfContents',
      description: 'Based on `<div>` and supports its props. Adds:',
      props: [
        { name: 'items', type: 'TocItem[]', description: '`{ id, level (1–4), text }` (required). Use `collectHeadings(blocks)`.' },
        { name: 'onItemClick', type: '(id: string) => void', description: 'Default: smooth-scroll to `[data-block-id=<id>]`.' },
      ],
    },
  ],
  sections: [
    a11y(['Each entry is an `<a href="#id">`, so it works with the keyboard and middle-click.']),
    usage([
      'Use Table of contents at the top of long pages with several headings.',
      'Give headings ids (or render inside `BlockRenderer`) so entries link to them.',
      'Don’t use it on short pages with one or two sections.',
    ]),
  ],
};

/* ================================================================== PAGE LINK */

const pageLinkPage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Page link',
  description: 'The sub-page / link-to-page block: page icon plus an underlined 500-weight title.',
  hero: {
    title: 'Page link',
    align: 'start',
    render: () => (
      <C>
        <PageLink icon="🗺️" text={rt('Roadmap')} href="#page-link" />
        <PageLink text={rt('Meeting notes')} href="#page-link" />
        <PageLink empty text={rt('Empty page')} href="#page-link" />
      </C>
    ),
    code: `import { BlockContent, PageLink, rt } from '@krackedui/motion';

<BlockContent>
  <PageLink icon="🗺️" text={rt('Roadmap')} href="/roadmap" />
  <PageLink text={rt('Meeting notes')} href="/notes" />
  <PageLink empty text={rt('Empty page')} href="/empty" />
</BlockContent>`,
  },
  install: install('PageLink, rt', `<PageLink icon="📄" text={rt('Page')} href="/page" />`),
  api: [
    {
      name: 'PageLink',
      description: 'Based on `<div>` and supports its props. Adds:',
      props: [
        { name: 'icon', type: 'string', description: 'Emoji; default page glyph.' },
        { name: 'href', type: 'string', description: 'Link target.' },
        { name: 'empty', type: 'boolean', default: 'false', description: 'Page without content (`pageEmpty` glyph).' },
        ...textContentProps,
      ],
    },
  ],
  sections: [
    a11y(['Renders an `<a>`; give it an `href` so it is focusable.', 'Placeholder “Untitled” when the title is empty.']),
    usage([
      'Use Page link to link to another page as its own block (sub-pages, related pages).',
      'Always pass an `href` so the link is focusable.',
      'Use a mention in rich text when the link belongs inside a sentence.',
      'Don’t use Page link for external URLs; use Bookmark or a text link instead.',
    ]),
  ],
};

/* ================================================================== PAGE TITLE */

const pageTitlePage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Page title',
  description: 'The 40px bold page title at the top of a page, with an optional 78px emoji icon above it.',
  hero: {
    title: 'Page title',
    align: 'start',
    render: () => (
      <div className={content}>
        <PageTitle icon="📒" text={rt('Team handbook')} />
      </div>
    ),
    code: `import { PageTitle, rt } from '@krackedui/motion';\n\n<PageTitle icon="📒" text={rt('Team handbook')} />`,
  },
  install: install('PageTitle, rt', `<PageTitle text={rt('New page')} />`),
  examples: [
    {
      title: 'Without icon',
      align: 'start',
      render: () => (
        <div className={content}>
          <PageTitle text={rt('Release notes')} />
        </div>
      ),
      code: `<PageTitle text={rt('Release notes')} />`,
    },
  ],
  api: [
    {
      name: 'PageTitle',
      description: 'Based on `<div>` and supports its props. Adds:',
      props: [
        { name: 'icon', type: 'string', description: 'Emoji page icon shown above the title (78px).' },
        ...textContentProps,
      ],
    },
  ],
  sections: [
    a11y(['The title is a styled `div`; wrap the text in an `h1` via `renderLeaf` (or add `role="heading" aria-level={1}`) for a document outline.', 'Placeholder “New page” when edited empty. For the full header (cover, hover “Add icon”) use `PageHeader`.']),
    usage([
      'Use Page title once at the top of a page, above its blocks.',
      'Use `PageHeader` instead when the page needs a cover, an icon picker or the hover “Add icon” controls.',
      'Don’t use Page title for section headings; use Heading instead.',
    ]),
  ],
};

/* ================================================================== RICH TEXT VIEW */

const richTextPage: DocPage = {
  eyebrow: eyebrowBlocks,
  title: 'Rich text',
  description: 'Renders a `RichText` value inline: marks, links, inline code, colors, emoji and mentions. Every text block uses it; use it directly inside your own components.',
  hero: {
    title: 'RichTextView',
    align: 'start',
    render: () => (
      <C>
        <p className="m-0 px-2">
          <RichTextView
            value={[
              { text: 'Mixed ' },
              { text: 'bold italic', marks: { bold: true, italic: true } },
              { text: ', ' },
              { text: 'a link', marks: { link: 'https://example.com' } },
              { text: ', ' },
              { text: 'x^2', marks: { equation: true } },
              { text: ', ' },
              { text: 'orange', marks: { color: 'orange' } },
              { text: ' and ' },
              { text: 'Docs', mention: { kind: 'page', label: 'Docs', icon: '📚' } },
              { text: ' 🎉' },
            ]}
          />
        </p>
      </C>
    ),
    code: `import { BlockContent, RichTextView } from '@krackedui/motion';

<BlockContent>
  <p>
    <RichTextView
      value={[
        { text: 'Mixed ' },
        { text: 'bold italic', marks: { bold: true, italic: true } },
        { text: ', ' },
        { text: 'a link', marks: { link: 'https://example.com' } },
        { text: ', ' },
        { text: 'x^2', marks: { equation: true } },
        { text: ', ' },
        { text: 'orange', marks: { color: 'orange' } },
        { text: ' and ' },
        { text: 'Docs', mention: { kind: 'page', label: 'Docs', icon: '📚' } },
        { text: ' 🎉' },
      ]}
    />
  </p>
</BlockContent>`,
  },
  install: install('RichTextView, rt', `<RichTextView value={rt('Hello', { bold: true })} />`),
  sections: [
    {
      title: 'Rich text utilities',
      blocks: [
        'Offset-based helpers used by the editor, exported for your own tooling:',
        {
          list: [
            '`splitRichText(value, offset)` → `[before, after]`',
            '`deleteRange(value, from, to)` removes characters',
            '`applyMarks(value, from, to, patch)` sets marks (`undefined` removes)',
            '`hasMark(value, from, to, mark)` is true when the whole range has the mark',
            '`normalizeRichText(value)` merges equal adjacent runs and drops empty ones',
            '`richTextToHtml(value)` / `parseRichTextDom(el)` round-trip through contenteditable HTML (`data-m` holds marks)',
            '`MentionToken` renders one mention; `inlineCodeClass` is the inline code chip class',
          ],
        },
      ],
    },
    a11y(['Output is inline spans and `<a>` links, so it inherits the surrounding semantics.', 'Emoji are wrapped in an emoji-font span; they are read by their Unicode names.']),
    usage([
      'Use `RichTextView` to render a `RichText` value (marks, colors, links, mentions, inline equations) inside any block or custom UI.',
      'Store text as `RichText` segments rather than HTML so blocks and the editor can share it.',
      'Don’t use it for long-form documents on its own; use `BlockRenderer` for a `Block[]` tree.',
    ]),
  ],
  api: [
    {
      name: 'MentionToken',
      description: 'One non-editable mention, as `RichTextView` renders a span with `mention`: a page (icon + underlined title), a person (@Name) or a date (@Date). Carries `data-mention` so `parseRichTextDom` reads it back.',
      props: [{ name: 'mention', type: 'Mention', description: '`{ kind: "page" | "user" | "date", label, icon? }` (required).' }],
    },
    {
      name: 'RichTextView',
      props: [{ name: 'value', type: 'RichText', description: 'Runs to render.' }],
    },
    {
      name: 'TextSpan',
      description: 'One run of `RichText`.',
      props: [
        { name: 'text', type: 'string', description: 'Required.' },
        { name: 'marks', type: 'TextMarks', description: 'See the Block model page.' },
        { name: 'mention', type: 'Mention', description: 'Renders a non-editable token instead of `text`.' },
      ],
    },
  ],
};

/* ================================================================== EDITOR */

const editorDoc: Block[] = [
  { id: 'e1', type: 'heading_1', text: rt('Try the editor') },
  { id: 'e2', type: 'text', text: [{ text: 'Type ' }, { text: '/', marks: { code: true } }, { text: ' for commands, select text for the toolbar, hover a block for the handle.' }] },
  { id: 'e3', type: 'bulleted_list', text: rt('Press Tab to nest this item') },
  { id: 'e4', type: 'bulleted_list', text: rt('Enter continues the list') },
  { id: 'e5', type: 'to_do', text: rt('Check me'), props: { checked: false } },
  { id: 'e6', type: 'toggle', text: rt('Open this toggle'), props: { open: false }, children: [{ id: 'e6a', type: 'text', text: rt('Nested content') }] },
  { id: 'e7', type: 'text', text: [] },
];

function EditorDemo({ withTitle }: { withTitle?: boolean }) {
  const [doc, setDoc] = useState<Block[]>(editorDoc);
  return (
    <div className="w-full max-w-[640px] ps-14">
      <Editor title={withTitle ? rt('Untitled draft') : undefined} value={doc} onChange={setDoc} />
    </div>
  );
}

const keyRows: [string, string][] = [
  ['Enter', 'Split the block at the caret. Lists, to-dos (unchecked) and toggles (closed) continue their type; everything else continues as Text. At the very start of a non-empty block, inserts an empty block above. In an open toggle with children, the new block becomes its first child.'],
  ['Enter (empty list item)', 'Outdent if nested, otherwise turn the item into Text.'],
  ['Shift+Enter', 'Soft line break inside the block (Enter always does this in a Code block).'],
  ['Backspace (at start)', 'Non-text block → Text; nested block → outdent; previous block is void (divider, image, bookmark, table, equation, TOC, columns) → remove it; otherwise merge into the previous block (its children move up).'],
  ['Delete (at end)', 'Merge the next block into this one.'],
  ['Tab / Shift+Tab', 'Indent into the previous sibling / outdent.'],
  ['↑ / ↓', 'On the first / last line, move to the previous / next block.'],
  ['← / →', 'At the start / end, move to the previous / next block.'],
  ['⌘B / ⌘I / ⌘U', 'Toggle bold / italic / underline on the selection.'],
  ['⌘E', 'Toggle inline code.'],
  ['⌘⇧S (or ⌘⇧X)', 'Toggle strikethrough.'],
  ['⌘D', 'Duplicate the block.'],
  ['/', 'Open the slash menu (at the start of a block or after a space). Typing filters; ↑ ↓ move; Enter or Tab insert; Esc or two spaces close.'],
  ['Title: Enter / ↓', 'Move from the page title to the first block (creates one if empty).'],
  ['Handle: Enter / Space', 'Open the block action menu from the focused ⋮⋮ handle.'],
];

const mdRows: [string, string][] = [
  ['# ', 'Heading 1'],
  ['## ', 'Heading 2'],
  ['### ', 'Heading 3'],
  ['#### ', 'Heading 4'],
  ['- ', 'Bulleted list (also `* ` and `+ `)'],
  ['1. ', 'Numbered list (any number)'],
  ['[] ', 'To-do (also `[ ] `)'],
  ['[x] ', 'Checked to-do'],
  ['> ', 'Toggle list (open)'],
  ['" ', 'Quote'],
  ['```', 'Code block (JavaScript)'],
  ['---', 'Divider, with a new Text block below'],
];

const editorPage: DocPage = {
  eyebrow: eyebrowEditor,
  title: 'Editor',
  description:
    'The full block editor over a `Block[]` document: Enter/Backspace/Tab semantics, markdown shortcuts, the `/` slash menu, the hover `+` and ⋮⋮ handle with the block menu, drag to reorder, and the selection text toolbar.',
  hero: {
    title: 'Editor',
    align: 'start',
    previewClassName: 'min-h-96',
    render: () => <EditorDemo />,
    code: `import { Editor, rt, type Block } from '@krackedui/motion';

const initial: Block[] = [
  { id: 'e1', type: 'heading_1', text: rt('Try the editor') },
  { id: 'e2', type: 'text', text: [{ text: 'Type ' }, { text: '/', marks: { code: true } }, { text: ' for commands, select text for the toolbar, hover a block for the handle.' }] },
  { id: 'e3', type: 'bulleted_list', text: rt('Press Tab to nest this item') },
  { id: 'e4', type: 'bulleted_list', text: rt('Enter continues the list') },
  { id: 'e5', type: 'to_do', text: rt('Check me'), props: { checked: false } },
  { id: 'e6', type: 'toggle', text: rt('Open this toggle'), props: { open: false }, children: [{ id: 'e6a', type: 'text', text: rt('Nested content') }] },
  { id: 'e7', type: 'text', text: [] },
];

export function EditorDemo() {
  const [doc, setDoc] = useState<Block[]>(initial);
  // The hover handle sits 52px left of the blocks: leave room for it.
  return (
    <div className="ps-14">
      <Editor value={doc} onChange={setDoc} />
    </div>
  );
}`,
  },
  install: install('Editor, rt', `<Editor defaultValue={[{ id: '1', type: 'text', text: rt('Start writing…') }]} />`),
  examples: [
    {
      title: 'With a page title',
      description: '`title` renders the 40px page title above the blocks; Enter or ↓ in the title moves into the document. The title is read once (initial value); listen with `onTitleChange`.',
      align: 'start',
      previewClassName: 'min-h-96',
      render: () => <EditorDemo withTitle />,
      code: `const [doc, setDoc] = useState<Block[]>([
  { id: 'e1', type: 'heading_1', text: rt('Try the editor') },
  { id: 'e2', type: 'text', text: [{ text: 'Type ' }, { text: '/', marks: { code: true } }, { text: ' for commands, select text for the toolbar, hover a block for the handle.' }] },
  { id: 'e3', type: 'bulleted_list', text: rt('Press Tab to nest this item') },
  { id: 'e4', type: 'bulleted_list', text: rt('Enter continues the list') },
  { id: 'e5', type: 'to_do', text: rt('Check me'), props: { checked: false } },
  { id: 'e6', type: 'toggle', text: rt('Open this toggle'), props: { open: false }, children: [{ id: 'e6a', type: 'text', text: rt('Nested content') }] },
  { id: 'e7', type: 'text', text: [] },
]);
const [title, setTitle] = useState<RichText>(rt('Untitled draft'));

<div className="w-full max-w-[640px] ps-14">
  <Editor title={title} value={doc} onChange={setDoc} onTitleChange={setTitle} />
</div>`,
    },
    {
      title: 'Uncontrolled, empty',
      description: 'With no value the editor starts with one empty Text block that shows the focused placeholder.',
      align: 'start',
      previewClassName: 'min-h-48',
      render: () => (
        <div className="w-full max-w-[640px] ps-14">
          <Editor />
        </div>
      ),
      code: `<Editor />`,
    },
  ],
  sections: [
    {
      title: 'Keyboard',
      blocks: [{ render: () => <KeyTable head={['Key', 'Behavior']} rows={keyRows} /> }],
    },
    {
      title: 'Markdown shortcuts',
      blocks: [
        'Typed at the start of a Text block, followed by a space (except ```` ``` ```` and `---`). The prefix is removed and the block converts in place, keeping the rest of its text.',
        { render: () => <KeyTable head={['Type', 'Becomes']} rows={mdRows} /> },
      ],
    },
    {
      title: 'Slash menu, handle, drag and toolbar',
      blocks: [
        {
          list: [
            'Slash menu: typing `/` opens `SlashMenu` under the caret (above it if there is no room). Picking an item on an empty block converts it; otherwise a new block is inserted below. Items without an implementation (AI Meeting Notes, HTML, Video, Audio, File) just close the menu.',
            'Hover handle: hovering a block shows `+` and ⋮⋮ 52px to its left, aligned to the first text line. `+` inserts a block below and opens the slash menu; Option/Alt-click inserts above.',
            'Block menu: clicking ⋮⋮ opens `BlockActionMenu` (Turn into, Color, Copy link to block, Duplicate, Delete…) and highlights the block with a blue selection halo.',
            'Drag: pressing ⋮⋮ and moving more than 4px drags the block; a 4px blue indicator shows the drop position (before / after the hovered block).',
            'Text toolbar: selecting text in any block except Code (and the title) shows `TextToolbar` above the selection: marks, link, color, turn into.',
            'Clicking below the last block focuses it, or appends a new Text block.',
          ],
        },
      ],
    },
    a11y([
      'Each block’s text is a `contenteditable` leaf; all editing works from the keyboard (see the table above).',
      'The ⋮⋮ handle is a button labeled “Drag to move, click to open menu”; `Enter` / `Space` open the block menu. Dragging is pointer-only; use the block menu or Tab / Shift+Tab to restructure from the keyboard.',
      'The `+` button is labeled “Click to add below. Option-click to add a block above”.',
      'The slash menu is a `dialog` labeled “Slash commands”; focus stays in the text while ↑ ↓ move the highlight.',
      'The hover handle only appears on mouse hover; keyboard users reach block actions through the slash menu, the shortcuts and the text toolbar.',
    ]),
    usage([
      'Use `Editor` for free-form documents people write and restructure (notes, specs, wiki pages).',
      'Use it controlled (`value` + `onChange`) when you save the document; `defaultValue` for scratch content.',
      'Persist the `Block[]` yourself; undo and redo use the browser’s native editing history only.',
      'Don’t use `Editor` for short single-line or form input; use `TextInput` or `Textarea` instead.',
      'Don’t use it to display content read-only; use `BlockRenderer`.',
    ]),
  ],
  api: [
    {
      name: 'Editor',
      props: [
        { name: 'value', type: 'Block[]', description: 'Controlled document.' },
        { name: 'defaultValue', type: 'Block[]', description: 'Uncontrolled initial document. Default: one empty Text block.' },
        { name: 'onChange', type: '(blocks: Block[]) => void', description: 'Called with the new document after every change.' },
        { name: 'title', type: 'RichText', description: 'Initial page title; shows the 40px title above the blocks when provided.' },
        { name: 'onTitleChange', type: '(title: RichText) => void' },
        { name: 'placeholder', type: 'string', default: 'EDITOR_PLACEHOLDER', description: 'Placeholder of the focused empty Text block (“Press ‘space’ for AI or ‘/’ for commands”).' },
        { name: 'lastEditedBy', type: 'string', default: '"You"', description: 'Shown in the block menu footer.' },
        { name: 'className', type: 'string' },
        { name: 'style', type: 'CSSProperties' },
      ],
    },
    {
      name: 'Utilities',
      description: 'Exported alongside the editor.',
      props: [
        { name: 'newBlock', type: '(kind: BlockKind, text?: RichText) => Block', description: 'A fresh block of a kind (tables get 2×3 cells, columns get one empty Text block each).' },
        { name: 'blockTree', type: 'namespace', description: '`findBlock`, `findLoc`, `insertIn`, `removeIn`, `indentIn`, `outdentIn`, `visibleLeaves`, `allBlocks`, `withNewIds`, `produce`.' },
        { name: 'blockIds', type: '(blocks: Block[]) => string[]', description: 'All block ids, depth-first.' },
        { name: 'EDITOR_PLACEHOLDER', type: 'string' },
      ],
    },
  ],
};

/* ================================================================== SLASH MENU */

function SlashDemo() {
  const [query, setQuery] = useState('h');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const items = slashItems(query);
  return (
    <div className="flex flex-col items-start gap-3">
      <input
        aria-label="Slash query"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setIndex(0); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const n = Math.max(1, items.length);
            setIndex((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + n) % n);
          }
          if (e.key === 'Enter' && items[index]) setPicked(items[index].label);
        }}
        className="h-7 w-[324px] rounded-n-md bg-n-bg-interactive-translucent-a px-2 text-[14px] text-n-text-primary outline-none shadow-[inset_0_0_0_1px_var(--n-border-primary-translucent-a)]"
      />
      <SlashMenu query={query} activeIndex={index} onActiveIndexChange={setIndex} onSelect={(it) => setPicked(it.label)} />
      <div className="text-[12px] text-n-text-tertiary">{picked ? `Selected: ${picked}` : 'Type to filter, ↑ ↓ to move, Enter to pick'}</div>
    </div>
  );
}

const slashMenuPage: DocPage = {
  eyebrow: eyebrowEditor,
  title: 'Slash menu',
  description: 'The “/” command menu: insert or convert blocks. Shown here statically; inside the Editor it opens under the caret when you type `/`.',
  hero: {
    title: 'Slash menu',
    align: 'start',
    previewClassName: 'min-h-[460px]',
    render: () => <SlashMenu activeIndex={0} />,
    code: `import { SlashMenu } from '@krackedui/motion';\n\n<SlashMenu activeIndex={0} />`,
  },
  install: install('SlashMenu', `<SlashMenu query={query} activeIndex={i} onSelect={(item) => insert(item.kind)} />`),
  examples: [
    {
      title: 'Filtered and keyboard driven',
      description: 'The menu is presentational: you own `query` and `activeIndex`. `slashItems(query)` returns the flattened filtered list for ↑ ↓ / Enter handling.',
      align: 'start',
      previewClassName: 'min-h-[520px]',
      render: () => <SlashDemo />,
      code: `export function SlashDemo() {
  const [query, setQuery] = useState('h');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const items = slashItems(query);
  return (
    <div className="flex flex-col items-start gap-3">
      <input
        aria-label="Slash query"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setIndex(0); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const n = Math.max(1, items.length);
            setIndex((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + n) % n);
          }
          if (e.key === 'Enter' && items[index]) setPicked(items[index].label);
        }}
      />
      <SlashMenu query={query} activeIndex={index} onActiveIndexChange={setIndex} onSelect={(item) => setPicked(item.label)} />
      <div className="text-[12px] text-n-text-tertiary">{picked ? \`Selected: \${picked}\` : 'Type to filter, ↑ ↓ to move, Enter to pick'}</div>
    </div>
  );
}`,
    },
    {
      title: 'No results',
      align: 'start',
      render: () => <SlashMenu query="zzz" />,
      code: `<SlashMenu query="zzz" />`,
    },
  ],
  api: [
    {
      name: 'SlashMenu',
      description: 'Based on `<div>` and supports its props (except `onSelect`). Adds:',
      props: [
        { name: 'query', type: 'string', default: '""', description: 'Text typed after “/”; filters labels and keywords.' },
        { name: 'activeIndex', type: 'number', default: '0', description: 'Highlighted row in the filtered, flattened list.' },
        { name: 'onActiveIndexChange', type: '(i: number) => void', description: 'Mouse hover moves the highlight.' },
        { name: 'onSelect', type: '(item: SlashItem) => void' },
        { name: 'onClose', type: '() => void', description: '“Close menu” footer row.' },
        { name: 'groups', type: 'SlashGroup[]', default: 'slashGroups', description: 'Menu content.' },
      ],
    },
    {
      name: 'SlashItem',
      description: 'Items of `slashGroups` (Suggested, Basic blocks, Media, Advanced blocks). `filterSlash(query, groups)` and `slashItems(query, groups)` filter them.',
      props: [
        { name: 'id', type: 'string' },
        { name: 'label', type: 'string' },
        { name: 'icon', type: 'IconName' },
        { name: 'shortcut', type: 'string', description: 'Markdown hint on the right (`#`, `-`, ```` ``` ````…).' },
        { name: 'description', type: 'string', description: 'Muted text after the label.' },
        { name: 'badge', type: 'string', description: 'Blue pill, e.g. “New”.' },
        { name: 'keywords', type: 'string', description: 'Extra search terms.' },
        { name: 'kind', type: 'BlockKind | null', description: '`{ type, props?, columns? }`; `null` = not implemented.' },
      ],
    },
  ],
  sections: [
    a11y([
      'The surface is `role="dialog"` labeled “Slash commands” holding one `listbox` (“Commands”) of labelled `group`s; `aria-activedescendant` names the highlighted option. Mouse-down is prevented so focus stays in the text; the list is also focusable so it can be scrolled and read on its own. With no match a `status` says “No results”.',
      'The highlighted row scrolls into view as `activeIndex` changes.',
      'Keyboard handling (↑ ↓ Enter Tab Esc) belongs to the owner; the Editor does it for you.',
    ]),
    usage([
      '`Editor` opens `SlashMenu` when people type `/`; render it yourself only when building a custom editor.',
      'Use `query` to filter items as people type after the slash.',
      'Don’t use the slash menu as a general command palette; use `CommandPalette` instead.',
    ]),
  ],
};

/* ================================================================== BLOCK ACTION MENU */

const menuBlock: Block = { id: 'menu-demo', type: 'text', text: rt('A paragraph with six words here') };

function StaticBlockMenu() {
  return (
    <MenuSurface width={265} className="flex flex-col">
      <MenuSearch noIcon wrapperClassName="px-3 pb-1 pt-2" placeholder="Search actions…" readOnly />
      <MenuLabel id="block-menu-label" className="mx-1 mt-1">Text</MenuLabel>
      <MenuList aria-labelledby="block-menu-label" className="pt-0">
        <MenuRow icon="arrowSquarePathUpDown" submenu>Turn into</MenuRow>
        <MenuRow icon="blockColor" submenu>Color</MenuRow>
      </MenuList>
      <MenuList aria-label="Block actions" separator>
        <MenuRow icon="link" shortcut="⌘^L">Copy link to block</MenuRow>
        <MenuRow icon="duplicate" shortcut="⌘D">Duplicate</MenuRow>
        <MenuRow icon="arrowTurnUpRight" shortcut="⌘⇧P">Move to</MenuRow>
        <MenuRow icon="trash" shortcut="Del">Delete</MenuRow>
      </MenuList>
      <MenuList aria-label="Review" separator>
        <MenuRow icon="commentPencil" shortcut="⌘⇧M">Comment</MenuRow>
        <MenuRow icon="commentPencil" shortcut="⌘⇧⌥X">Suggest edits</MenuRow>
      </MenuList>
      <MenuList aria-label="AI" separator>
        <MenuRow icon="aiFace" shortcut="⌘J">Ask AI</MenuRow>
      </MenuList>
      <MenuFooter lines={['Last edited by You', 'Today at 9:00 AM', '6 words, 31 characters']} />
    </MenuSurface>
  );
}

function BlockMenuDemo() {
  const [block, setBlock] = useState<Block>(menuBlock);
  const [log, setLog] = useState('Click the handle');
  return (
    <div className="flex w-full max-w-[560px] items-start gap-1">
      <BlockActionMenu
        block={block}
        side="bottom"
        onTurnInto={(k) => { setBlock((b) => ({ ...b, type: k.type, props: k.props })); setLog(`Turned into ${k.type}`); }}
        onColor={(c) => { setBlock((b) => ({ ...b, color: c })); setLog(`Color: ${c}`); }}
        onDuplicate={() => setLog('Duplicate')}
        onDelete={() => setLog('Delete')}
        onCopyLink={() => setLog('Copy link')}
      >
        <DragHandle className="mt-1.5" />
      </BlockActionMenu>
      <div className="flex min-w-0 flex-1 flex-col">
        <BlockRenderer blocks={[block]} />
        <div className="px-2 text-[12px] text-n-text-tertiary">{log}</div>
      </div>
    </div>
  );
}

const blockActionMenuPage: DocPage = {
  eyebrow: eyebrowEditor,
  title: 'Block action menu',
  description: 'The menu that opens from a block’s ⋮⋮ handle: search, Turn into and Color submenus, Copy link, Duplicate, Move to, Delete, Comment, Ask AI, and a “Last edited” footer.',
  hero: {
    title: 'Block action menu (static)',
    description: 'The open state, composed from the static menu parts for display. The real component is a Radix dropdown (next example).',
    align: 'start',
    previewClassName: 'min-h-[520px]',
    render: () => <StaticBlockMenu />,
    code: `// Static rendering of the open menu (for docs and previews).
<MenuSurface width={265} className="flex flex-col">
  <MenuSearch noIcon wrapperClassName="px-3 pb-1 pt-2" placeholder="Search actions…" readOnly />
  <MenuLabel id="block-menu-label" className="mx-1 mt-1">Text</MenuLabel>
  <MenuList aria-labelledby="block-menu-label" className="pt-0">
    <MenuRow icon="arrowSquarePathUpDown" submenu>Turn into</MenuRow>
    <MenuRow icon="blockColor" submenu>Color</MenuRow>
  </MenuList>
  <MenuList aria-label="Block actions" separator>
    <MenuRow icon="link" shortcut="⌘^L">Copy link to block</MenuRow>
    <MenuRow icon="duplicate" shortcut="⌘D">Duplicate</MenuRow>
    <MenuRow icon="arrowTurnUpRight" shortcut="⌘⇧P">Move to</MenuRow>
    <MenuRow icon="trash" shortcut="Del">Delete</MenuRow>
  </MenuList>
  <MenuList aria-label="Review" separator>
    <MenuRow icon="commentPencil" shortcut="⌘⇧M">Comment</MenuRow>
    <MenuRow icon="commentPencil" shortcut="⌘⇧⌥X">Suggest edits</MenuRow>
  </MenuList>
  <MenuList aria-label="AI" separator>
    <MenuRow icon="aiFace" shortcut="⌘J">Ask AI</MenuRow>
  </MenuList>
  <MenuFooter lines={['Last edited by You', 'Today at 9:00 AM', '6 words, 31 characters']} />
</MenuSurface>`,
  },
  install: install(
    'BlockActionMenu, DragHandle',
    `<BlockActionMenu block={block} onTurnInto={convert} onColor={setColor} onDelete={remove}>\n  <DragHandle />\n</BlockActionMenu>`,
  ),
  examples: [
    {
      title: 'Interactive',
      description: 'Click the ⋮⋮ handle. Turn into and Color change the block; typing in the search box filters actions and turn-into targets.',
      align: 'start',
      previewClassName: 'min-h-[480px]',
      render: () => <BlockMenuDemo />,
      code: `export function BlockMenuDemo() {
  const [block, setBlock] = useState<Block>({ id: 'a', type: 'text', text: rt('A paragraph with six words here') });
  const [log, setLog] = useState('Click the handle');
  return (
    <div className="flex w-full max-w-[560px] items-start gap-1">
      <BlockActionMenu
        block={block}
        side="bottom"
        onTurnInto={(k) => { setBlock((b) => ({ ...b, type: k.type, props: k.props })); setLog('Turned into ' + k.type); }}
        onColor={(c) => { setBlock((b) => ({ ...b, color: c })); setLog('Color: ' + c); }}
        onDuplicate={() => setLog('Duplicate')}
        onDelete={() => setLog('Delete')}
        onCopyLink={() => setLog('Copy link')}
      >
        <DragHandle className="mt-1.5" />
      </BlockActionMenu>
      <div className="flex min-w-0 flex-1 flex-col">
        <BlockRenderer blocks={[block]} />
        <div className="px-2 text-[12px] text-n-text-tertiary">{log}</div>
      </div>
    </div>
  );
}`,
    },
    {
      title: 'Color submenu (static)',
      description: '`ColorMenuList` is the Color submenu: “Last used”, then text colors, then background colors.',
      align: 'start',
      previewClassName: 'min-h-[560px]',
      render: () => (
        <MenuSurface width={220} className="max-h-[540px] overflow-y-auto">
          <ColorMenuList value={{ kind: 'text', color: 'default' }} lastUsed={[{ value: { kind: 'background', color: 'yellow' }, shortcut: '⌘⇧H' }]} />
        </MenuSurface>
      ),
      code: `<MenuSurface width={220}>
  <ColorMenuList
    value={{ kind: 'text', color: 'default' }}
    lastUsed={[{ value: { kind: 'background', color: 'yellow' }, shortcut: '⌘⇧H' }]}
  />
</MenuSurface>`,
    },
  ],
  api: [
    {
      name: 'BlockActionMenu',
      description: 'A `Menu.Root` (Radix DropdownMenu) whose trigger is `children`.',
      props: [
        { name: 'block', type: 'Block', description: 'The block (label, turn-into check, color, word count). Required.' },
        { name: 'children', type: 'ReactNode', description: 'The trigger (rendered with `asChild`), usually `DragHandle`. Required.' },
        { name: 'open', type: 'boolean', description: 'Controlled open state.' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
        { name: 'onTurnInto', type: '(kind: BlockKind) => void' },
        { name: 'onColor', type: '(color: BlockColor) => void' },
        { name: 'onCopyLink', type: '() => void' },
        { name: 'onDuplicate', type: '() => void' },
        { name: 'onMoveTo', type: '() => void' },
        { name: 'onDelete', type: '() => void' },
        { name: 'onComment', type: '() => void' },
        { name: 'onSuggestEdits', type: '() => void' },
        { name: 'onAskAI', type: '() => void' },
        { name: 'lastEditedBy', type: 'string', default: '"You"', description: 'Footer line “Last edited by …”.' },
        { name: 'lastEditedAt', type: 'string', default: '"Just now"' },
        { name: 'lastUsedColor', type: 'BlockColor', description: 'Shown as “Last used” (⌘⇧H) in the Color submenu.' },
        { name: 'modal', type: 'boolean', default: 'false' },
        { name: 'side', type: ['"left"', '"right"', '"bottom"', '"top"'], default: '"left"' },
      ],
    },
    {
      name: 'Helpers',
      props: [
        { name: 'blockLabel', type: '(b: Pick<Block, "type" | "props">) => string', description: 'Menu label (“Text”, “Toggle heading 2”…).' },
        { name: 'toColorValue', type: '(c?: BlockColor) => ColorValue', description: 'BlockColor → ColorMenu value.' },
        { name: 'fromColorValue', type: '(v: ColorValue) => BlockColor', description: 'ColorMenu value → BlockColor.' },
      ],
    },
  ],
  sections: [
    a11y([
      'Radix DropdownMenu: `menu` / `menuitem` roles, ↑ ↓ to move, → / ← to open and close submenus, Enter to run, Esc to close.',
      'The search box gets focus on open; typing filters, while ↑ ↓ Enter Esc Tab still reach the menu.',
      'Focus is not returned to the handle on close (`onCloseAutoFocus` prevented), so the caret stays in the document.',
    ]),
    usage([
      '`Editor` opens `BlockActionMenu` from the ⋮⋮ handle; render it yourself only in a custom editor.',
      'Use it for actions on one block (turn into, color, duplicate, delete).',
      'Don’t use it for page-level actions; use `Menu` for the page’s own menu.',
    ]),
  ],
};

/* ================================================================== TURN INTO MENU */

const turnIntoPage: DocPage = {
  eyebrow: eyebrowEditor,
  title: 'Turn into menu',
  description: 'The “Turn into” list: convert a block to another type. The current type is checked. Used as a submenu of the block menu and of the text toolbar.',
  hero: {
    title: 'Turn into menu',
    align: 'start',
    previewClassName: 'min-h-[700px]',
    render: () => <TurnIntoMenu block={{ type: 'text' }} highlightedId="text" className="max-h-none" />,
    code: `import { TurnIntoMenu } from '@krackedui/motion';\n\n<TurnIntoMenu block={{ type: 'text' }} highlightedId="text" />`,
  },
  install: install('TurnIntoMenu', `<TurnIntoMenu block={block} onSelect={(item) => item.kind && convert(item.kind)} />`),
  examples: [
    {
      title: 'Toggle heading checked',
      description: 'Headings compare `toggleable` too, so a toggle heading checks “Toggle heading N”.',
      align: 'start',
      previewClassName: 'min-h-[420px]',
      render: () => <TurnIntoMenu block={{ type: 'heading_2', props: { toggleable: true } }} className="max-h-[400px]" />,
      code: `<TurnIntoMenu block={{ type: 'heading_2', props: { toggleable: true } }} />`,
    },
    {
      title: 'Bare',
      description: '`bare` drops the floating surface, for embedding in another menu.',
      align: 'start',
      render: () => (
        <MenuSurface width={220} className="max-h-[300px] overflow-y-auto">
          <TurnIntoMenu bare block={{ type: 'bulleted_list' }} />
        </MenuSurface>
      ),
      code: `<MenuSurface width={220}>\n  <TurnIntoMenu bare block={{ type: 'bulleted_list' }} />\n</MenuSurface>`,
    },
  ],
  api: [
    {
      name: 'TurnIntoMenu',
      description: 'Based on `<div>` and supports its props (except `onSelect`). Adds:',
      props: [
        { name: 'block', type: 'Pick<Block, "type" | "props">', description: 'The block being converted (gets the checkmark).' },
        { name: 'onSelect', type: '(item: TurnIntoItem) => void', description: '`item.kind` is `null` for “Page in” and “Synced block” (not implemented).' },
        { name: 'highlightedId', type: 'string', description: 'Highlighted row id (static renders).' },
        { name: 'bare', type: 'boolean', default: 'false', description: 'Render without the floating surface.' },
        { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Focus the list on mount (when opened from the keyboard).' },
      ],
    },
    {
      name: 'TurnIntoItem',
      description: 'Entries of `turnIntoItems`; `isKind(block, kind)` decides the checkmark.',
      props: [
        { name: 'id', type: 'string' },
        { name: 'label', type: 'string' },
        { name: 'icon', type: 'IconName' },
        { name: 'kind', type: 'BlockKind | null' },
        { name: 'submenu', type: 'boolean', description: 'Shows a chevron (“Page in”).' },
      ],
    },
  ],
  sections: [
    a11y([
      'The list is a labelled `listbox` and a single tab stop: ↑/↓/Home/End move the highlight (`aria-activedescendant`), Enter/Space pick it. Inside `BlockActionMenu` the same entries are a Radix submenu.',
      'In the text toolbar the list opens from “Normal Text ▸” (`aria-expanded`); opened from the keyboard it takes focus, and Escape closes it and returns focus to the trigger.',
    ]),
    usage([
      'Use the Turn into menu to change a block’s type while keeping its text.',
      'It opens from the block menu and the text toolbar; render it yourself only in a custom editor.',
      'Don’t use it to insert new blocks; that is the slash menu’s job.',
    ]),
  ],
};

/* ================================================================== TEXT TOOLBAR */

function ToolbarDemo() {
  const [marks, setMarks] = useState<Record<string, boolean>>({ bold: true });
  return (
    <TextToolbar
      block={{ type: 'text' }}
      active={marks}
      onMark={(m) => setMarks((s) => ({ ...s, [m]: !s[m] }))}
      onClearFormat={() => setMarks({})}
      onLink={(url) => setMarks((s) => ({ ...s, link: !!url }))}
    />
  );
}

const textToolbarPage: DocPage = {
  eyebrow: eyebrowEditor,
  title: 'Text toolbar',
  description: 'The card that appears over a text selection (a vertical toolbar): block type, color, bold / italic / underline / clear, link / strike / code / equation, Comment, Skills and “Edit with AI”.',
  hero: {
    title: 'Text toolbar',
    align: 'start',
    previewClassName: 'min-h-[380px]',
    render: () => <TextToolbar block={{ type: 'text' }} />,
    code: `import { TextToolbar } from '@krackedui/motion';\n\n<TextToolbar block={{ type: 'text' }} />`,
  },
  install: install('TextToolbar', `<TextToolbar block={block} active={{ bold: true }} onMark={toggleMark} onColor={setColor} />`),
  examples: [
    {
      title: 'Active marks',
      description: 'Buttons toggle; pressed marks show the hover background (`aria-pressed`).',
      align: 'start',
      previewClassName: 'min-h-[380px]',
      render: () => <ToolbarDemo />,
      code: `const [marks, setMarks] = useState<Record<string, boolean>>({ bold: true });

<TextToolbar
  block={{ type: 'text' }}
  active={marks}
  onMark={(m) => setMarks((s) => ({ ...s, [m]: !s[m] }))}
  onClearFormat={() => setMarks({})}
  onLink={(url) => setMarks((s) => ({ ...s, link: !!url }))}
/>`,
    },
    {
      title: 'Color panel open',
      description: '`defaultPanel="color"` opens the color grid (Recently used, Text color, Background color).',
      align: 'start',
      previewClassName: 'min-h-[460px]',
      render: () => <TextToolbar block={{ type: 'text' }} defaultPanel="color" recentColors={['yellow_background']} />,
      code: `<TextToolbar block={{ type: 'text' }} defaultPanel="color" recentColors={['yellow_background']} />`,
    },
    {
      title: 'Turn into panel open',
      description: '“Normal Text ▸” opens the Turn into list beside the card.',
      align: 'start',
      previewClassName: 'min-h-[440px]',
      render: () => <TextToolbar block={{ type: 'heading_2' }} defaultPanel="turn" hideAI />,
      code: `<TextToolbar block={{ type: 'heading_2' }} defaultPanel="turn" hideAI />`,
    },
    {
      title: 'Without AI',
      align: 'start',
      render: () => <TextToolbar block={{ type: 'bulleted_list' }} hideAI />,
      code: `<TextToolbar block={{ type: 'bulleted_list' }} hideAI />`,
    },
  ],
  api: [
    {
      name: 'TextToolbar',
      description: 'Based on `<div>` and supports its props (except `onChange`). Adds:',
      props: [
        { name: 'block', type: 'Pick<Block, "type" | "props">', description: 'Drives the “Normal Text” label and the turn-into check.' },
        { name: 'active', type: 'Partial<Record<ToolbarMark | "link", boolean>>', default: '{}', description: 'Marks fully applied on the selection.' },
        { name: 'color', type: 'BlockColor', description: 'Current text/background color of the selection.' },
        { name: 'recentColors', type: 'BlockColor[]', description: '“Recently used” row of the color grid.' },
        { name: 'onMark', type: '(mark: ToolbarMark) => void', description: '`"bold" | "italic" | "underline" | "strike" | "code" | "equation"`.' },
        { name: 'onClearFormat', type: '() => void' },
        { name: 'onLink', type: '(url: string | null) => void', description: 'URL from the link panel, or `null` to remove an existing link.' },
        { name: 'onColor', type: '(color: BlockColor) => void' },
        { name: 'onTurnInto', type: '(kind: BlockKind) => void' },
        { name: 'onComment', type: '() => void' },
        { name: 'defaultPanel', type: ['"none"', '"color"', '"turn"', '"link"'], default: '"none"', description: 'Panel open initially (static renders).' },
        { name: 'hideAI', type: 'boolean', default: 'false', description: 'Hide Skills and “Edit with AI”.' },
      ],
    },
  ],
  sections: [
    a11y([
      'The card is a `toolbar` named "Text formatting": ←/→/↑/↓ move between its buttons, Home/End jump to the ends. "Normal Text ▸" is a button with `aria-expanded` that opens the Turn into list.',
      'Every icon button has an `aria-label` and `title` (Bold, Italic, Underline, Clear format, Link, Strikethrough, Inline code, Equation) and `aria-pressed` for its mark.',
      'Mouse-down is prevented (except in the link input) so the text selection is kept while clicking.',
      'The link panel input: Enter applies, Esc closes. In the Editor the same marks are on ⌘B / ⌘I / ⌘U / ⌘E / ⌘⇧S.',
    ]),
    usage([
      '`Editor` shows `TextToolbar` over a text selection; render it yourself only in a custom editor.',
      'Use it for inline formatting of the selected text: marks, link, color and turn into.',
      'Don’t show it for code blocks or the page title, where inline marks don’t apply.',
      'Don’t use it as a page toolbar; keep page actions in the topbar.',
    ]),
  ],
};

/* ================================================================== exports */

export const editorPages: Record<string, DocPage> = {
  'blocks/overview': overviewPage,
  'blocks/rich-text': richTextPage,
  'blocks/text': textPage,
  'blocks/heading': headingPage,
  'blocks/list': listPage,
  'blocks/to-do': todoPage,
  'blocks/toggle': togglePage,
  'blocks/quote': quotePage,
  'blocks/callout': calloutPage,
  'blocks/divider': dividerPage,
  'blocks/code': codePage,
  'blocks/equation': equationPage,
  'blocks/image': imagePage,
  'blocks/bookmark': bookmarkPage,
  'blocks/simple-table': simpleTablePage,
  'blocks/columns': columnsPage,
  'blocks/table-of-contents': tocPage,
  'blocks/page-link': pageLinkPage,
  'blocks/page-title': pageTitlePage,
  'blocks/editor': editorPage,
  'blocks/slash-menu': slashMenuPage,
  'blocks/block-action-menu': blockActionMenuPage,
  'blocks/turn-into-menu': turnIntoPage,
  'blocks/text-toolbar': textToolbarPage,
};

export const editorNav: NavGroup[] = [
  {
    title: 'Content blocks',
    items: [
      { slug: 'blocks/overview' },
      { slug: 'blocks/rich-text' },
      { slug: 'blocks/text' },
      { slug: 'blocks/heading' },
      { slug: 'blocks/list', title: 'Lists' },
      { slug: 'blocks/to-do' },
      { slug: 'blocks/toggle' },
      { slug: 'blocks/quote' },
      { slug: 'blocks/callout' },
      { slug: 'blocks/divider' },
      { slug: 'blocks/code' },
      { slug: 'blocks/equation' },
      { slug: 'blocks/image' },
      { slug: 'blocks/bookmark' },
      { slug: 'blocks/simple-table' },
      { slug: 'blocks/columns' },
      { slug: 'blocks/table-of-contents' },
      { slug: 'blocks/page-link' },
      { slug: 'blocks/page-title' },
    ],
  },
  {
    title: 'Editor',
    items: [
      { slug: 'blocks/editor' },
      { slug: 'blocks/slash-menu' },
      { slug: 'blocks/block-action-menu' },
      { slug: 'blocks/turn-into-menu' },
      { slug: 'blocks/text-toolbar' },
    ],
  },
];
