import { useEffect } from 'react';
import { BlockRenderer, PageTitle, rt, type Block, type RichText } from '@krackedui/motion';

let n = 0;
const id = () => `lab-${++n}`;
const b = (type: Block['type'], text?: string | RichText, extra: Partial<Block> = {}): Block => ({
  id: id(), type, text: typeof text === 'string' ? rt(text) : text, ...extra,
});

/** The captured "DS Sandbox" page (page-content, page-scroll-1..3), as a block tree. */
export const sandboxDoc: Block[] = [
  b('heading_1', 'Heading 1'),
  b('heading_2', 'Heading 2'),
  b('heading_3', 'Heading 3'),
  b('text', [
    { text: 'Plain paragraph with ' },
    { text: 'bold', marks: { bold: true } },
    { text: ', ' },
    { text: 'italic', marks: { italic: true } },
    { text: ', ' },
    { text: 'strikethrough', marks: { strike: true } },
    { text: ', ' },
    { text: 'underline', marks: { underline: true } },
    { text: ', ' },
    { text: 'inline code', marks: { code: true } },
    { text: ' and a ' },
    { text: 'link', marks: { link: 'https://example.com/' } },
    { text: '. This sentence is long enough to wrap onto a second line so we can measure line height and paragraph rhythm in the editor.' },
  ]),
  b('bulleted_list', 'Bulleted item one'),
  b('bulleted_list', 'Bulleted item two', {
    children: [b('bulleted_list', 'Nested bullet', { children: [b('bulleted_list', 'Deeper nested bullet')] })],
  }),
  b('numbered_list', 'Numbered item one'),
  b('numbered_list', 'Numbered item two', { children: [b('numbered_list', 'Nested numbered')] }),
  b('bulleted_list', 'Unchecked to-do'),
  b('bulleted_list', 'Checked to-do'),
  b('toggle', 'Toggle list item', { children: [b('text', 'Hidden content inside the toggle.')] }),
  b('quote', 'A quote block with a short line of quoted text.'),
  b('text', '💡A callout block with an icon and background.'),
  b('text', '📌 An aside callout.'),
  b('divider'),
  b('code', 'function greet(name) {\n  return `Hello, ${name}!`;\n}', { props: { language: 'JavaScript' } }),
  b('table', undefined, {
    props: {
      hasHeaderRow: true,
      rows: [
        [rt('Name'), rt('Role'), rt('Status')],
        [rt('Ada'), rt('Engineer'), rt('Active')],
        [rt('Grace'), rt('Admiral'), rt('Away')],
      ],
    },
  }),
  b('text', 'Final paragraph.'),
  b('to_do', 'Unchecked to-do'),
  b('to_do', 'Checked to-do', { props: { checked: true } }),
  b('callout', 'A callout block with an icon and background.', { props: { icon: '💡' } }),
  b('heading_2', 'Toggle heading', { props: { toggleable: true }, children: [b('text', 'Inside the toggle heading.')] }),
  b('table_of_contents'),
  b('text', 'Tasks'),
];

/** Everything else the block set supports (below the sandbox replica). */
const extras: Block[] = [
  b('divider'),
  b('heading_2', 'More blocks'),
  b('text', [
    { text: 'Colors: ' },
    { text: 'red', marks: { color: 'red' } }, { text: ' ' },
    { text: 'blue', marks: { color: 'blue' } }, { text: ' ' },
    { text: 'green', marks: { color: 'green' } }, { text: ' ' },
    { text: 'yellow bg', marks: { color: 'yellow_background' } }, { text: ' ' },
    { text: 'pink bg', marks: { color: 'pink_background' } },
    { text: '. Mentions: ' },
    { text: 'Roadmap', mention: { kind: 'page', label: 'Roadmap', icon: '🗺️' } }, { text: ' ' },
    { text: 'Ada Lovelace', mention: { kind: 'user', label: 'Ada Lovelace' } }, { text: ' ' },
    { text: 'October 15, 2026', mention: { kind: 'date', label: 'October 15, 2026' } },
    { text: '. Inline equation ' },
    { text: 'E=mc^2', marks: { equation: true } },
    { text: '.' },
  ]),
  b('text', 'A blue block', { color: 'blue' }),
  b('text', 'A yellow background block', { color: 'yellow_background' }),
  b('toggle', 'Open toggle', { props: { open: true }, children: [b('text', 'Child paragraph'), b('to_do', 'Child to-do')] }),
  b('toggle', 'Open empty toggle', { props: { open: true } }),
  b('heading_1', 'Toggle heading 1 (open)', { props: { toggleable: true, open: true }, children: [b('text', 'Content')] }),
  b('heading_3', 'Toggle heading 3', { props: { toggleable: true } }),
  b('bulleted_list', 'Level 1', { children: [b('bulleted_list', 'Level 2', { children: [b('bulleted_list', 'Level 3', { children: [b('bulleted_list', 'Level 4 (wraps to •)')] })] })] }),
  b('numbered_list', 'One', { children: [b('numbered_list', 'a', { children: [b('numbered_list', 'i'), b('numbered_list', 'ii')] }), b('numbered_list', 'b')] }),
  b('callout', 'Blue callout', { color: 'blue_background', props: { icon: 'ℹ️' } }),
  b('callout', 'Default (bordered) callout', { color: 'default', props: { icon: '📌' } }),
  b('quote', 'Red quote', { color: 'red' }),
  b('equation', undefined, { props: { expression: '\\sum_{i=1}^{n} x_i = \\frac{a}{b} + \\alpha^2' } }),
  b('page', 'Sub-page link', { props: { icon: '📘' } }),
  b('page', 'Page without icon'),
  b('image', undefined, { props: { src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200', caption: rt('An image with a caption') } }),
  b('image'),
  b('bookmark', undefined, {
    props: {
      url: 'https://example.com/product', title: 'Example – product page',
      description: 'A new tool that blends your everyday work apps into one. It’s the all-in-one workspace for you and your team.',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
    },
  }),
  b('bookmark'),
  ...[2, 3, 5].map((k) => b('column_list', undefined, {
    children: Array.from({ length: k }, (_, i) => b('column', undefined, { children: [b('text', `Column ${i + 1} of ${k}`), b('to_do', 'Task')] })),
  })),
  b('text', ''),
];

/**
 * Blocks lab: the captured sandbox page laid out at the reference geometry (viewport 1710×1037, sidebar 270,
 * content column x=630 w=720, title top y=372) so it can be pixel-diffed with mirror/page-content.
 * `#/lab/blocks?scroll=N` scrolls the window (page-scroll-* captures).
 */
export default function BlocksLab() {
  useEffect(() => {
    const m = /scroll=(\d+)/.exec(location.hash);
    if (m) setTimeout(() => window.scrollTo(0, Number(m[1])), 50);
  }, []);
  return (
    <div className="pb-[30vh]" style={{ paddingTop: 372, marginLeft: 630, width: 720 }}>
      <PageTitle text={rt('DS Sandbox')} />
      <div className="pt-2">
        <BlockRenderer blocks={sandboxDoc} />
        <BlockRenderer blocks={extras} />
      </div>
    </div>
  );
}
