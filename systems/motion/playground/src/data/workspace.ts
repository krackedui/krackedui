// Sample workspace for the Motion demo app: a page tree whose content exercises every block,
// plus database pages. Kept in localStorage after the first edit (see store.ts).
import type { Block, RichText } from '@krackedui/motion';

let n = 0;
const id = () => `seed-${++n}`;
const t = (text: string): RichText => [{ text }];
const b = (type: Block['type'], text?: string | RichText, extra: Partial<Block> = {}): Block => ({
  id: id(),
  type,
  ...(text !== undefined ? { text: typeof text === 'string' ? t(text) : text } : {}),
  ...extra,
});

export interface PageNode {
  id: string;
  title: string;
  icon?: string;
  cover?: string;
  /** 'page' renders blocks; 'database' renders a full-page database. */
  kind: 'page' | 'database';
  blocks: Block[];
  children: PageNode[];
  fullWidth?: boolean;
}

const sandbox: Block[] = [
  b('heading_1', 'Heading 1'),
  b('heading_2', 'Heading 2'),
  b('heading_3', 'Heading 3'),
  b('text', [
    { text: 'Plain paragraph with ' }, { text: 'bold', marks: { bold: true } }, { text: ', ' },
    { text: 'italic', marks: { italic: true } }, { text: ', ' }, { text: 'strikethrough', marks: { strike: true } }, { text: ', ' },
    { text: 'underline', marks: { underline: true } }, { text: ', ' }, { text: 'inline code', marks: { code: true } },
    { text: ' and a ' }, { text: 'link', marks: { link: 'https://example.com' } },
    { text: '. This sentence is long enough to wrap onto a second line so we can measure line height and paragraph rhythm in the editor.' },
  ]),
  b('bulleted_list', 'Bulleted item one'),
  b('bulleted_list', 'Bulleted item two', { children: [b('bulleted_list', 'Nested bullet', { children: [b('bulleted_list', 'Deeper nested bullet')] })] }),
  b('numbered_list', 'Numbered item one'),
  b('numbered_list', 'Numbered item two', { children: [b('numbered_list', 'Nested numbered')] }),
  b('to_do', 'Unchecked to-do'),
  b('to_do', 'Checked to-do', { props: { checked: true } }),
  b('toggle', 'Toggle list item', { children: [b('text', 'Hidden content inside the toggle.')] }),
  b('quote', 'A quote block with a short line of quoted text.'),
  b('callout', 'A callout block with an icon and background.', { props: { icon: '💡' }, color: 'gray_background' }),
  b('divider'),
  b('code', 'function greet(name) {\n  return `Hello, ${name}!`;\n}', { props: { language: 'JavaScript' } }),
  b('table', undefined, {
    props: {
      hasHeaderRow: true,
      rows: [[t('Name'), t('Role'), t('Status')], [t('Ada'), t('Engineer'), t('Active')], [t('Grace'), t('Admiral'), t('Away')]],
    },
  }),
  b('heading_2', 'Toggle heading', { props: { toggleable: true, open: false }, children: [b('text', 'Inside a toggle heading.')] }),
  b('table_of_contents'),
  b('text', 'Final paragraph.'),
];

const gettingStarted: Block[] = [
  b('text', [{ text: '👋 Welcome to Motion. Every element on this page comes from ' }, { text: '@krackedui/motion', marks: { code: true } }, { text: '.' }]),
  b('heading_2', 'The basics'),
  b('to_do', 'Click anywhere and just start typing'),
  b('to_do', [{ text: 'Hit ' }, { text: '/', marks: { code: true } }, { text: ' to see all the types of content you can add' }]),
  b('to_do', 'Highlight any text, and use the menu that pops up to style your writing however you like'),
  b('to_do', [{ text: 'See the ' }, { text: '⋮⋮', marks: { bold: true } }, { text: ' to the left of this checkbox on hover? Click and drag to move this line' }]),
  b('to_do', 'Click the + New page button at the bottom of your sidebar to add a new page', { props: { checked: true } }),
  b('callout', 'Markdown shortcuts work too: try "# " for a heading, "- " for a list, "[] " for a to-do.', { props: { icon: '⌨️' }, color: 'blue_background' }),
  b('heading_2', 'Columns'),
  b('column_list', undefined, {
    children: [
      b('column', undefined, { props: { ratio: 0.5 }, children: [b('heading_3', 'Left'), b('text', 'Columns let you lay blocks side by side.')] }),
      b('column', undefined, { props: { ratio: 0.5 }, children: [b('heading_3', 'Right'), b('quote', 'Drag a block next to another to create columns.')] }),
    ],
  }),
  b('bookmark', undefined, { props: { url: 'https://example.com', title: 'Example Domain', description: 'This domain is for use in illustrative examples.' } }),
  b('equation', undefined, { props: { expression: 'E = mc^2' } }),
];

const meetingNotes: Block[] = [
  b('callout', 'Weekly design sync. Decisions go at the top.', { props: { icon: '🗓️' }, color: 'yellow_background' }),
  b('heading_2', 'Decisions'),
  b('bulleted_list', 'Ship the token pipeline first, components second'),
  b('bulleted_list', 'Docs follow the AlignUI layout exactly'),
  b('heading_2', 'Action items'),
  b('to_do', 'Capture the remaining hover states'),
  b('to_do', 'Review the board view against the capture', { props: { checked: true } }),
  b('heading_2', 'Notes'),
  b('toggle', 'Discussion', { children: [b('text', 'We compared the rebuilt sidebar against the mirror and the diff was under 2%.')] }),
];

let pageSeq = 0;
const page = (title: string, icon: string | undefined, blocks: Block[], children: PageNode[] = [], extra: Partial<PageNode> = {}): PageNode => ({
  id: `page-${++pageSeq}`, title, icon, kind: 'page', blocks, children, ...extra,
});

/** Local cover (gradient covers are CSS-like; no network needed). */
export const COVER = 'gradient:linear-gradient(120deg, #f6d365 0%, #fda085 45%, #c3cfe2 100%)';

export function seedWorkspace(): PageNode[] {
  return [
    page('Getting Started', '👋', gettingStarted),
    page('DS Sandbox', undefined, sandbox, [{ id: 'db-tasks', title: 'Tasks', kind: 'database', blocks: [], children: [] }], { cover: COVER }),
    page('Meeting notes', '🗓️', meetingNotes, [page('Design sync, Oct 15', '📝', meetingNotes.slice(1))]),
    page('Projects', '🚀', [], [], { kind: 'database', fullWidth: true }),
    page('Reading list', '📚', [b('text', 'Things worth reading.')]),
  ];
}
