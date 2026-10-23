// Foundation pages generated from Motion's token file (light/dark values per token).
import tokens from '../registry/tokens/motion.tokens.json';
import { Icon, iconNames } from '@krackedui/motion';
import { semanticIconNames } from './semantic-icons';
import type { Block, ColorToken, DocPage, Section, TypeStyle } from '../../../apps/docs/lib/types';

type Tok = { $type: string; $value: unknown; $extensions?: { modes?: { light?: string; dark?: string } } };
type Group = Record<string, Tok>;
const T = tokens as unknown as Record<string, Group>;

const COLOR_FAMILIES = ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red', 'teal'] as const;

function colorTokens(group: Group, varPrefix: string, filter: (name: string) => boolean = () => true): ColorToken[] {
  return Object.entries(group)
    .filter(([name, t]) => t.$type === 'color' && filter(name))
    .map(([name, t]) => {
      const light = t.$extensions?.modes?.light ?? String(t.$value);
      const dark = t.$extensions?.modes?.dark;
      return { name, cssVar: `--n-${varPrefix}${name}`, light, dark };
    });
}

const byPrefix = (prefix: string) => (n: string) => n.startsWith(prefix);

/** Palette: raw scales, one group per hue (single swatch per mode → split light | dark). */
function paletteSections(): Section[] {
  const palette = T.palette;
  const hues = [...new Set(Object.keys(palette).map((k) => k.replace(/-\d+$/, '')))];
  return hues.map((hue) => ({
    title: `Palette · ${hue}`,
    id: `palette-${hue}`,
    blocks: [{ colors: colorTokens(palette, 'palette-', (n) => n.replace(/-\d+$/, '') === hue) }],
  }));
}

function semanticSections(): Section[] {
  const core = T.core;
  const cats: [string, (n: string) => boolean][] = [
    ['Background', byPrefix('bg-')],
    ['Text', byPrefix('text-')],
    ['Icon', byPrefix('icon-')],
    ['Border', byPrefix('border-')],
    ['Button', byPrefix('button-')],
  ];
  const known = (n: string) => cats.some(([, f]) => f(n));
  const sections: Section[] = cats.map(([title, f]) => ({
    title,
    id: `semantic-${title.toLowerCase()}`,
    blocks: [{ colors: colorTokens(core, '', f) }],
  }));
  sections.push({ title: 'Other UI', id: 'semantic-other', blocks: [{ colors: colorTokens(core, '', (n) => !known(n)) }] });
  return sections;
}

function familySections(): Section[] {
  return COLOR_FAMILIES.filter((f) => T[f]).map((fam) => {
    const g = T[fam];
    const blocks: Block[] = [
      { colors: colorTokens(g, `${fam}-`, (n) => !n.endsWith('-a')) },
    ];
    const alpha = colorTokens(g, `${fam}-`, (n) => n.endsWith('-a'));
    if (alpha.length) blocks.push({ title: `${fam} translucent`, colors: alpha, columns: 3 });
    return { title: fam[0].toUpperCase() + fam.slice(1), id: `color-${fam}`, blocks };
  });
}

export const colorPage: DocPage = {
  eyebrow: 'Foundations',
  title: 'Color',
  description: 'Motion color tokens. Each swatch shows the light value on the left and the dark value on the right.',
  wide: true,
  sections: [
    {
      title: 'Contrast',
      id: 'contrast',
      blocks: [
        'Text tokens meet WCAG AA (4.5:1) on the surfaces they are used on, in both themes: `text-secondary`, `text-tertiary` and every palette text color (`<color>-text-secondary`, `<color>-text-accent-primary`, checked on `bg-primary`, `bg-secondary` and the color\'s own tints) are tuned for it, and white text sits on the `*-bg-solid` fills (`blue-bg-solid`, `red-bg-solid`, `green-bg-solid`, `orange-bg-solid`, `gray-bg-solid`) with `text-on-solid`. `text-disabled` is exempt, as WCAG allows.',
      ],
    },
    ...semanticSections(),
    {
      title: 'Tone text',
      id: 'tone-text',
      blocks: [
        'Money and status text by tone: `text-n-text-success` ("+$1,240.00"), `text-n-text-danger` ("Overdue", "−$80.00"), `text-n-text-warning`, `text-n-text-info`. They are aliases of the tuned `green` / `red` / `orange` / `blue` `-text-secondary` colors and pass 4.5:1 on `bg-primary`, `bg-secondary`, `bg-elevated` and the popover background in both themes. From code that takes a `tone`, use the `toneText` map: `<span className={toneText[tone]}>…</span>`.',
        { colors: colorTokens(T.tone ?? {}, '') },
      ],
    },
    { title: 'Solid fills', id: 'solid', blocks: [{ colors: colorTokens(T.solid ?? {}, '') }] },
    ...familySections(),
    ...paletteSections(),
  ],
};

const typeStyles: TypeStyle[] = Object.entries(T.typography).map(([name, t]) => {
  const v = t.$value as { fontSize: string; lineHeight: string; fontWeight: number; letterSpacing?: string };
  return {
    name: `${name}`,
    fontFamily: name.startsWith('code') ? 'var(--n-font-code)' : 'var(--n-font-sans)',
    fontSize: v.fontSize,
    lineHeight: v.lineHeight,
    fontWeight: v.fontWeight,
    letterSpacing: v.letterSpacing,
    sample: name.startsWith('code') ? 'const page = await client.pages.retrieve(id);' : undefined,
  };
});

const fontTokens = Object.entries(T.font).map(([name, t]) => `\`${name}\`: ${String(t.$value)}`);

export const typographyPage: DocPage = {
  eyebrow: 'Foundations',
  title: 'Typography',
  description: 'Text styles used across Motion, from page titles to captions and code. Utilities: `text-n-<style>` (e.g. `text-n-ui`).',
  wide: true,
  sections: [
    { blocks: [{ type: typeStyles }] },
    { title: 'Font families', id: 'font-families', blocks: [{ list: fontTokens }] },
  ],
};

const core = new Set<string>(semanticIconNames);

export const iconsPage: DocPage = {
  eyebrow: 'Foundations',
  title: 'Icons',
  description: `${iconNames.length} icons drawn from Lucide (ISC), rendered with <Icon name="…" />. The ${semanticIconNames.length} portable names work in every KrackedUI system.`,
  install: [
    { title: 'Install the design system package:', packages: ['@krackedui/motion'] },
    {
      title: 'Render an icon by name:',
      file: { filename: '/src/Example.tsx', lang: 'tsx', code: `import { Icon } from '@krackedui/motion';\n\nexport function Example() {\n  return <Icon name="plus" size={20} />;\n}` },
    },
  ],
  examples: [
    {
      title: 'Decorative and labelled',
      description: 'Without `label` an icon is hidden from assistive tech; with it, it is an image with that name.',
      render: () => (
        <div className="flex items-center gap-3 text-n-text-primary">
          <Icon name="calendar" />
          <Icon name="warning" label="Warning" className="text-n-red-text-secondary" />
        </div>
      ),
      code: `import { Icon } from '@krackedui/motion';\n\nexport function Icons() {\n  return (\n    <>\n      <Icon name="calendar" />\n      <Icon name="warning" label="Warning" />\n    </>\n  );\n}`,
    },
  ],
  api: [
    {
      name: 'Icon',
      description: 'An inline `<svg>` (stroke = `currentColor`); supports all SVG props.',
      props: [
        { name: 'name', type: 'IconName', description: 'A portable name (`plus`, `close`, `chevronDown`…) or a Motion extra.' },
        { name: 'size', type: 'number', default: '20', description: 'Rendered size in px (16 for `*Small` names).' },
        { name: 'label', type: 'string', description: 'Accessible name; without it the icon is decorative (`aria-hidden`).' },
      ],
    },
  ],
  sections: [
    {
      title: 'Portable names',
      id: 'portable',
      blocks: [
        'Use the simple names when you can: they read better in code and in prompts.',
        { icons: semanticIconNames.map((name) => ({ name, render: () => <Icon name={name} size={20} /> })) },
      ],
    },
    {
      title: 'All icons',
      id: 'all',
      blocks: [{ icons: iconNames.filter((n) => !core.has(n)).map((name) => ({ name, render: () => <Icon name={name} size={20} /> })) }],
    },
    {
      title: 'Accessibility',
      blocks: [{ list: ['Icons are decorative by default. Give `label` only when the icon means something on its own (a status icon without text).', 'Icon-only controls get their name from the control (IconButton `label`), not the icon.', 'Icons inherit the text color; meaningful icons need 3:1 contrast against the background.'] }],
    },
    {
      title: 'Usage',
      blocks: ['Use it to:', { list: ['reinforce a label in buttons, menus and navigation', 'show a status next to text'] }, 'Don’t use it to:', { list: ['replace text for uncommon actions', 'draw illustrations (icons are 24×24 strokes)'] }],
    },
  ],
};

const tokenTable = (rows: [string, string, string][]) => ({
  render: () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-left text-n-ui text-n-text-primary">
        <thead>
          <tr className="border-b border-n-border-primary text-n-text-secondary">
            <th className="py-2 pr-4 font-medium">Token</th>
            <th className="py-2 pr-4 font-medium">Value</th>
            <th className="py-2 font-medium">Preview</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, value, preview]) => (
            <tr key={name} className="border-b border-n-border-secondary">
              <td className="py-2 pr-4 font-mono text-[13px]">{name}</td>
              <td className="py-2 pr-4 text-n-text-secondary">{value}</td>
              <td className="py-2"><span className={preview} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
});

const SPACE: [number, string][] = [[0, '0px'], [1, '4px'], [2, '8px'], [3, '12px'], [4, '16px'], [5, '20px'], [6, '24px'], [8, '32px'], [10, '40px'], [12, '48px'], [16, '64px']];
const SPACE_W: Record<number, string> = { 0: 'w-0', 1: 'w-1', 2: 'w-2', 3: 'w-3', 4: 'w-4', 5: 'w-5', 6: 'w-6', 8: 'w-8', 10: 'w-10', 12: 'w-12', 16: 'w-16' };

export const spacingPage: DocPage = {
  eyebrow: 'Foundations',
  title: 'Spacing',
  description: 'A 4px scale. Stack and Grid `gap` take the step number (`gap={4}` = 16px); `--ds-space-<n>` holds the same values.',
  wide: true,
  sections: [
    { blocks: [tokenTable(SPACE.map(([n, px]) => [`--ds-space-${n} · gap={${n}}`, px, `block h-3 rounded-n-xs bg-n-blue-bg-solid ${SPACE_W[n]}`]))] },
    { title: 'In code', id: 'code', blocks: [{ code: { filename: '/src/Layout.tsx', lang: 'tsx', code: `import { Stack } from '@krackedui/motion';\n\nexport function Layout() {\n  return <Stack gap={{ base: 2, md: 4 }}>…</Stack>;\n}` } }] },
  ],
};

const RADII: [string, string, string][] = [
  ['--n-radius-xs · rounded-n-xs', '3px', 'block size-10 rounded-n-xs bg-n-bg-tertiary shadow-n-shadow-outline-sm'],
  ['--n-radius-sm · rounded-n-sm', '4px', 'block size-10 rounded-n-sm bg-n-bg-tertiary shadow-n-shadow-outline-sm'],
  ['--n-radius-md · rounded-n-md', '6px', 'block size-10 rounded-n-md bg-n-bg-tertiary shadow-n-shadow-outline-sm'],
  ['--n-radius-lg · rounded-n-lg', '8px', 'block size-10 rounded-n-lg bg-n-bg-tertiary shadow-n-shadow-outline-sm'],
  ['--n-radius-xl · rounded-n-xl', '10px', 'block size-10 rounded-n-xl bg-n-bg-tertiary shadow-n-shadow-outline-sm'],
  ['--n-radius-2xl · rounded-n-2xl', '12px', 'block size-10 rounded-n-2xl bg-n-bg-tertiary shadow-n-shadow-outline-sm'],
  ['--n-radius-3xl · rounded-n-3xl', '14px', 'block size-10 rounded-n-3xl bg-n-bg-tertiary shadow-n-shadow-outline-sm'],
  ['--n-radius-full · rounded-n-full', '9999px', 'block size-10 rounded-n-full bg-n-bg-tertiary shadow-n-shadow-outline-sm'],
];

export const radiusPage: DocPage = {
  eyebrow: 'Foundations',
  title: 'Radius',
  description: 'Small radii keep Motion quiet: 4–6px for controls, 8px for popovers and cards. `--ds-radius-*` maps onto the same scale.',
  wide: true,
  sections: [{ blocks: [tokenTable(RADII)] }],
};

const SHADOWS: [string, string, string][] = [
  ['--n-shadow-outline-sm · shadow-n-shadow-outline-sm', 'Hairline + soft drop: inputs, chips', 'block size-12 rounded-n-lg bg-n-bg-elevated shadow-n-shadow-outline-sm'],
  ['--n-shadow-outline-md · shadow-n-shadow-outline-md', 'Cards, raised surfaces', 'block size-12 rounded-n-lg bg-n-bg-elevated shadow-n-shadow-outline-md'],
  ['--n-shadow-outline-lg · shadow-n-shadow-outline-lg', 'Menus, popovers (`--ds-shadow-popover`)', 'block size-12 rounded-n-lg bg-n-bg-elevated shadow-n-shadow-outline-lg'],
  ['--n-focus-shadow · shadow-n-focus-shadow', 'Keyboard focus ring', 'block size-12 rounded-n-lg bg-n-bg-elevated shadow-n-focus-shadow'],
];

export const shadowsPage: DocPage = {
  eyebrow: 'Foundations',
  title: 'Shadows',
  description: 'Shadows combine a hairline outline with a soft drop, so surfaces read in both themes. Dark mode uses stronger values automatically.',
  wide: true,
  sections: [{ blocks: [tokenTable(SHADOWS)] }],
};

const MOTION: [string, string, string][] = [
  ['--ds-motion-duration-fast', '100ms: hovers, small state changes', 'block h-3 w-6 rounded-n-xs bg-n-blue-bg-solid'],
  ['--ds-motion-duration-base', '200ms: overlays in, switches, indicators', 'block h-3 w-12 rounded-n-xs bg-n-blue-bg-solid'],
  ['--ds-motion-duration-slow', '300ms: sheets, sidebars, accordions', 'block h-3 w-18 rounded-n-xs bg-n-blue-bg-solid'],
  ['--ds-motion-easing-standard', 'ease: exits and simple fades', 'block h-3 w-3 rounded-n-full bg-n-gray-bg-solid'],
  ['--ds-motion-easing-emphasized', 'cubic-bezier(0.2, 0, 0, 1): entrances', 'block h-3 w-3 rounded-n-full bg-n-gray-bg-solid'],
];

export const motionPage: DocPage = {
  eyebrow: 'Foundations',
  title: 'Motion',
  description: 'Durations and easings for animation. Overlays fade and slide in and out; with reduced motion, nothing slides or scales.',
  wide: true,
  sections: [
    { blocks: [tokenTable(MOTION)] },
    {
      title: 'Reduced motion',
      id: 'reduced-motion',
      blocks: ['Under `prefers-reduced-motion: reduce`, Motion replaces slides and scales with an instant change or a short fade. Use the tokens in your own transitions and add `motion-reduce:` variants:', { code: { filename: '/src/styles.css', lang: 'css', code: `.panel {\n  transition: transform var(--ds-motion-duration-base) var(--ds-motion-easing-emphasized);\n}\n@media (prefers-reduced-motion: reduce) {\n  .panel { transition: none; }\n}` } }],
    },
  ],
};
