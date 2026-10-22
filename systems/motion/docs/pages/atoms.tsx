// Atom pages (Button / IconButton live in ../components.tsx; Theme / Stack / Grid in ./layout.tsx).
// Live previews import straight from @krackedui/motion. Every `code` string is a complete file.
import { useState, type ReactNode } from 'react';
import {
  Avatar,
  AvatarGroup,
  Badge,
  Checkbox,
  DisclosureToggle,
  Divider,
  DragHandle,
  IconButton,
  Kbd,
  Link,
  PageIcon,
  Placeholder,
  Radio,
  RadioGroup,
  SearchInput,
  Shortcut,
  Spinner,
  StatusPill,
  Switch,
  Tag,
  TextInput,
  Textarea,
  Theme,
  Tooltip,
  TooltipBubble,
  motionColors,
  type MotionColor,
} from '@krackedui/motion';
import type { DocPage, InstallStep, NavGroup, Section } from '../../../../apps/docs/lib/types';

/* ------------------------------------------------------------------ helpers */

const PKG = '@krackedui/motion';
const row = 'flex flex-wrap items-center justify-center gap-3';
const field = 'w-full max-w-72';
const eyebrow = 'Components';

/** Indent a JSX fragment by `n` spaces (for code strings). */
const indent = (s: string, n: number) => s.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

/** A complete example file: imports + one exported component returning `jsx` (wrapped in a fragment when it has several roots). */
function snippet(names: string[], fn: string, jsx: string, opts: { hooks?: string; react?: string[]; before?: string } = {}): string {
  const lines: string[] = [];
  if (opts.react?.length) lines.push(`import { ${opts.react.join(', ')} } from 'react';`);
  lines.push(`import { ${[...new Set(names)].sort().join(', ')} } from '${PKG}';`, '');
  if (opts.before) lines.push(opts.before, '');
  const multi = jsx.trim().split('\n').filter((l) => !l.startsWith(' ') && !l.startsWith('</')).length > 1;
  const body = multi ? `<>\n${indent(jsx, 2)}\n</>` : jsx;
  lines.push(`export function ${fn}() {`);
  if (opts.hooks) lines.push(indent(opts.hooks, 2));
  lines.push(`  return (`, indent(body, 4), `  );`, `}`);
  return lines.join('\n');
}

/** Standard install: the package, then the stylesheet + `<Theme>` root around the usage. */
function install(names: string, usage: string): InstallStep[] {
  return [
    { title: 'Install the design system package:', packages: [PKG] },
    {
      title: 'Import the styles once and render inside `<Theme>` (use `appearance="dark"` or `"system"` for other themes):',
      file: {
        filename: '/src/App.tsx',
        lang: 'tsx',
        code: `import '${PKG}/styles.css';\nimport { Theme, ${names} } from '${PKG}';\n\nexport function App() {\n  return (\n    <Theme appearance="light">\n${indent(usage, 6)}\n    </Theme>\n  );\n}`,
      },
    },
  ];
}

/** A dark-theme preview: a nested `<Theme appearance="dark">`. */
function Dark({ children }: { children: ReactNode }) {
  return (
    <Theme appearance="dark" className="flex flex-wrap items-center justify-center gap-3 rounded-n-lg p-6">
      {children}
    </Theme>
  );
}
const darkCode = (names: string[], fn: string, jsx: string) =>
  snippet(['Theme', ...names], fn, `<Theme appearance="dark" className="flex flex-wrap items-center gap-3 p-6">\n${indent(jsx, 2)}\n</Theme>`);

const a11y = (items: string[]): Section => ({ title: 'Accessibility', blocks: [{ list: items }] });
const usage = (use: string[], avoid: string[]): Section => ({
  title: 'Usage',
  blocks: ['Use it to:', { list: use }, 'Don’t use it to:', { list: avoid }],
});

const baseProps = [
  { name: 'className', type: 'string', description: 'Extra classes, merged with the component’s own.' },
];

/* ------------------------------------------------------------------ stateful demos */

function TodoRow({ label, initial = false }: { label: string; initial?: boolean }) {
  const [done, setDone] = useState(initial);
  return <Checkbox checked={done} onCheckedChange={setDone} label={<span className={done ? 'text-n-text-tertiary line-through' : undefined}>{label}</span>} />;
}

function SelectAllDemo() {
  const items = ['Design', 'Engineering', 'Marketing'];
  const [picked, setPicked] = useState<string[]>(['Design']);
  const all = picked.length === items.length ? true : picked.length ? 'indeterminate' : false;
  return (
    <div className="flex flex-col gap-2">
      <Checkbox label="All teams" checked={all} onCheckedChange={(on) => setPicked(on ? items : [])} />
      <div className="flex flex-col gap-2 pl-6">
        {items.map((t) => (
          <Checkbox key={t} label={t} checked={picked.includes(t)} onCheckedChange={(on) => setPicked((p) => (on ? [...p, t] : p.filter((x) => x !== t)))} />
        ))}
      </div>
    </div>
  );
}

function RadioDemo() {
  const [plan, setPlan] = useState('pro');
  return (
    <div className="flex flex-col items-start gap-3">
      <RadioGroup aria-label="Plan" value={plan} onValueChange={setPlan}>
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Plus" />
        <Radio value="team" label="Business" />
      </RadioGroup>
      <span className="text-n-ui text-n-text-secondary">Selected: {plan}</span>
    </div>
  );
}

function SwitchDemo() {
  const [on, setOn] = useState(true);
  return <Switch label={`Available offline (${on ? 'on' : 'off'})`} checked={on} onCheckedChange={setOn} />;
}

function SearchDemo() {
  const [q, setQ] = useState('Design');
  return <SearchInput className={field} aria-label="Search settings" value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} placeholder="Search settings" />;
}

function TagRemoveDemo() {
  const [tags, setTags] = useState<{ label: string; color: MotionColor }[]>([
    { label: 'Design', color: 'purple' },
    { label: 'Research', color: 'green' },
    { label: 'Q3', color: 'orange' },
  ]);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((t) => (
        <Tag key={t.label} color={t.color} onRemove={() => setTags((all) => all.filter((x) => x.label !== t.label))}>
          {t.label}
        </Tag>
      ))}
      {tags.length === 0 && <Placeholder variant="ui">Empty</Placeholder>}
    </div>
  );
}

function ToggleDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex w-full max-w-80 flex-col">
      <div className="flex items-center gap-0.5 text-[16px] leading-6 text-n-text-primary">
        <DisclosureToggle open={open} onOpenChange={setOpen} aria-controls="toggle-demo-content" />
        <span>Meeting notes</span>
      </div>
      {open && <div id="toggle-demo-content" className="pl-[26px] text-[16px] leading-6 text-n-text-secondary">Nested content shows when the toggle is open.</div>}
    </div>
  );
}

const sentenceCase = (c: string) => c[0].toUpperCase() + c.slice(1);

/* ================================================================== FORM */

const checkboxPage: DocPage = {
  eyebrow,
  title: 'Checkbox',
  description: 'A 16px box that fills with the accent and a white check. Supports a label, an indeterminate state, and every form attribute.',
  hero: {
    title: 'Checkbox',
    render: () => (
      <div className="flex flex-col gap-2">
        <TodoRow label="Draft the project brief" initial />
        <TodoRow label="Share with the team" />
      </div>
    ),
    code: snippet(['Checkbox'], 'CheckboxDemo', `<Checkbox label="Draft the project brief" checked={done} onCheckedChange={setDone} />`, {
      react: ['useState'],
      hooks: 'const [done, setDone] = useState(true);',
    }),
  },
  install: install('Checkbox', `<Checkbox label="Remember me" defaultChecked />`),
  examples: [
    {
      title: 'States',
      render: () => (
        <div className={row}>
          <Checkbox label="Unchecked" />
          <Checkbox label="Checked" defaultChecked />
          <Checkbox label="Indeterminate" checked="indeterminate" />
          <Checkbox label="Disabled" disabled />
          <Checkbox label="Invalid" invalid />
        </div>
      ),
      code: snippet(['Checkbox'], 'CheckboxStates', `<Checkbox label="Unchecked" />\n<Checkbox label="Checked" defaultChecked />\n<Checkbox label="Indeterminate" checked="indeterminate" />\n<Checkbox label="Disabled" disabled />\n<Checkbox label="Invalid" invalid />`),
    },
    {
      title: 'Select all',
      description: 'A parent checkbox shows `indeterminate` while only some children are checked.',
      align: 'start',
      render: () => <SelectAllDemo />,
      code: `import { useState } from 'react';\nimport { Checkbox } from '${PKG}';\n\nconst teams = ['Design', 'Engineering', 'Marketing'];\n\nexport function SelectAll() {\n  const [picked, setPicked] = useState<string[]>(['Design']);\n  const all = picked.length === teams.length ? true : picked.length ? 'indeterminate' : false;\n  return (\n    <div className="flex flex-col gap-2">\n      <Checkbox label="All teams" checked={all} onCheckedChange={(on) => setPicked(on ? teams : [])} />\n      {teams.map((t) => (\n        <Checkbox\n          key={t}\n          label={t}\n          checked={picked.includes(t)}\n          onCheckedChange={(on) => setPicked((p) => (on ? [...p, t] : p.filter((x) => x !== t)))}\n        />\n      ))}\n    </div>\n  );\n}`,
    },
    {
      title: 'Size',
      description: '`md` (16px) by default; `sm` (14px) for dense rows such as table cells.',
      render: () => (
        <div className={row}>
          <Checkbox size="sm" defaultChecked aria-label="Small" />
          <Checkbox size="md" defaultChecked aria-label="Medium" />
        </div>
      ),
      code: snippet(['Checkbox'], 'CheckboxSizes', `<Checkbox size="sm" defaultChecked aria-label="Small" />\n<Checkbox size="md" defaultChecked aria-label="Medium" />`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <Checkbox label="Unchecked" />
          <Checkbox label="Checked" defaultChecked />
          <Checkbox label="Disabled" disabled />
        </Dark>
      ),
      code: darkCode(['Checkbox'], 'CheckboxDark', `<Checkbox label="Unchecked" />\n<Checkbox label="Checked" defaultChecked />\n<Checkbox label="Disabled" disabled />`),
    },
  ],
  api: [
    {
      name: 'Checkbox',
      description: 'A native `<input type="checkbox">` drawn over the visual box; the ref and all other `<input>` props (`name`, `value`, `required`, `aria-*`) go to the input. Adds:',
      props: [
        { name: 'checked', type: ['boolean', '"indeterminate"'], description: 'Controlled state. `"indeterminate"` shows a dash.' },
        { name: 'defaultChecked', type: 'boolean', default: 'false', description: 'Initial state when uncontrolled.' },
        { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'Called with the new state.' },
        { name: 'onChange', type: 'ChangeEventHandler<HTMLInputElement>', description: 'Native change event, still fired.' },
        { name: 'label', type: 'ReactNode', description: 'Text next to the box; clicking it toggles. Without it, pass `aria-label` or wrap in Field.' },
        { name: 'invalid', type: 'boolean', default: 'false', description: 'Red border and `aria-invalid`.' },
        { name: 'size', type: ['"sm"', '"md"'], default: '"md"', description: '14px or 16px box.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims to 40% and blocks interaction.' },
        { name: 'className', type: 'string', description: 'Applied to the label (with `label`) or the box.' },
      ],
    },
  ],
  sections: [
    a11y([
      '`Tab` focuses the box; `Space` toggles it. Clicking the label toggles it too.',
      'It is a real checkbox: `checked`, `indeterminate` (announced as “mixed”), `required`, `disabled` and `aria-invalid` reach assistive tech.',
      'The focus ring is drawn around the box. On touch screens the hit area grows to 24×24 without changing the drawing.',
      'Always provide a name: `label`, `aria-label`, or a surrounding Field.',
    ]),
    usage(
      ['pick any number of independent options in a form or list', 'show progress in a to-do list', 'select rows, with an indeterminate “select all”'],
      ['switch a setting on immediately (use Switch)', 'choose exactly one option (use RadioGroup)'],
    ),
  ],
};

const radioPage: DocPage = {
  eyebrow,
  title: 'Radio Group',
  description: 'Mutually exclusive options. Each Radio is a 16px ring that fills with the accent and a white dot when selected.',
  hero: {
    title: 'Radio Group',
    render: () => <RadioDemo />,
    code: snippet(['Radio', 'RadioGroup'], 'PlanPicker', `<RadioGroup aria-label="Plan" value={plan} onValueChange={setPlan}>\n  <Radio value="free" label="Free" />\n  <Radio value="pro" label="Plus" />\n  <Radio value="team" label="Business" />\n</RadioGroup>`, {
      react: ['useState'],
      hooks: `const [plan, setPlan] = useState('pro');`,
    }),
  },
  install: install('Radio, RadioGroup', `<RadioGroup aria-label="Plan" defaultValue="free">\n  <Radio value="free" label="Free" />\n  <Radio value="pro" label="Plus" />\n</RadioGroup>`),
  examples: [
    {
      title: 'Horizontal',
      render: () => (
        <RadioGroup aria-label="Density" defaultValue="compact" orientation="horizontal">
          <Radio value="compact" label="Compact" />
          <Radio value="comfortable" label="Comfortable" />
        </RadioGroup>
      ),
      code: snippet(['Radio', 'RadioGroup'], 'DensityPicker', `<RadioGroup aria-label="Density" defaultValue="compact" orientation="horizontal">\n  <Radio value="compact" label="Compact" />\n  <Radio value="comfortable" label="Comfortable" />\n</RadioGroup>`),
    },
    {
      title: 'Disabled',
      description: 'Disable one option, or the whole group with `disabled` on RadioGroup.',
      render: () => (
        <RadioGroup aria-label="Export format" defaultValue="md">
          <Radio value="md" label="Markdown" />
          <Radio value="pdf" label="PDF" />
          <Radio value="html" label="HTML (unavailable)" disabled />
        </RadioGroup>
      ),
      code: snippet(['Radio', 'RadioGroup'], 'ExportFormat', `<RadioGroup aria-label="Export format" defaultValue="md">\n  <Radio value="md" label="Markdown" />\n  <Radio value="pdf" label="PDF" />\n  <Radio value="html" label="HTML (unavailable)" disabled />\n</RadioGroup>`),
    },
    {
      title: 'Size',
      render: () => (
        <RadioGroup aria-label="Size" defaultValue="a" orientation="horizontal">
          <Radio size="sm" value="a" label="Small" />
          <Radio size="md" value="b" label="Medium" />
        </RadioGroup>
      ),
      code: snippet(['Radio', 'RadioGroup'], 'RadioSizes', `<RadioGroup aria-label="Size" defaultValue="a" orientation="horizontal">\n  <Radio size="sm" value="a" label="Small" />\n  <Radio size="md" value="b" label="Medium" />\n</RadioGroup>`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <RadioGroup aria-label="Theme" defaultValue="dark" orientation="horizontal">
            <Radio value="light" label="Light" />
            <Radio value="dark" label="Dark" />
          </RadioGroup>
        </Dark>
      ),
      code: darkCode(['Radio', 'RadioGroup'], 'RadioDark', `<RadioGroup aria-label="Theme" defaultValue="dark" orientation="horizontal">\n  <Radio value="light" label="Light" />\n  <Radio value="dark" label="Dark" />\n</RadioGroup>`),
    },
  ],
  api: [
    {
      name: 'RadioGroup',
      description: 'Radix RadioGroup root (a `<div role="radiogroup">`); supports all of its props. Adds:',
      props: [
        { name: 'value', type: 'string', description: 'Controlled selected value.' },
        { name: 'defaultValue', type: 'string', description: 'Initial value when uncontrolled.' },
        { name: 'onValueChange', type: '(value: string) => void', description: 'Called when the selection changes.' },
        { name: 'orientation', type: ['"vertical"', '"horizontal"'], default: '"vertical"', description: 'Layout and arrow-key direction.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every option.' },
        { name: 'name', type: 'string', description: 'Form field name.' },
        { name: 'required', type: 'boolean', default: 'false', description: 'A value is required in forms.' },
      ],
    },
    {
      name: 'Radio',
      description: 'One option (Radix RadioGroup.Item, a `<button role="radio">`). Adds:',
      props: [
        { name: 'value', type: 'string', description: 'The option’s value (required).' },
        { name: 'label', type: 'ReactNode', description: 'Text next to the ring; clicking it selects. Without it, pass `aria-label`.' },
        { name: 'size', type: ['"sm"', '"md"'], default: '"md"', description: '14px or 16px ring.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'This option cannot be selected.' },
        { name: 'className', type: 'string', description: 'Applied to the label (with `label`) or the button.' },
      ],
    },
  ],
  sections: [
    a11y([
      '`Tab` enters the group on the selected radio (one Tab stop); `Tab` again leaves it.',
      '`↑` / `↓` (vertical) or `←` / `→` (horizontal) move to the next option and select it; disabled options are skipped. `Space` selects the focused option.',
      'Name the group with `aria-label` or `aria-labelledby` (or a Field); each Radio is named by its `label`.',
      'On touch screens each radio’s hit area is 24×24.',
    ]),
    usage(
      ['choose exactly one of 2–6 options that should all stay visible', 'settings forms where the options need a description'],
      ['long lists (use Select or Combobox)', 'switching views inline in a toolbar (use SegmentedControl)', 'independent options (use Checkbox)'],
    ),
  ],
};

const switchPage: DocPage = {
  eyebrow,
  title: 'Switch',
  description: 'On/off toggle for settings that apply immediately: a 30×18 pill track with a white knob.',
  hero: {
    title: 'Switch',
    render: () => <SwitchDemo />,
    code: snippet(['Switch'], 'OfflineSwitch', `<Switch label="Available offline" checked={on} onCheckedChange={setOn} />`, {
      react: ['useState'],
      hooks: 'const [on, setOn] = useState(true);',
    }),
  },
  install: install('Switch', `<Switch label="Notifications" defaultChecked />`),
  examples: [
    {
      title: 'States',
      render: () => (
        <div className="flex flex-col items-start gap-3">
          <Switch label="Off" />
          <Switch label="On" defaultChecked />
          <Switch label="Disabled" disabled />
          <Switch label="Disabled on" disabled defaultChecked />
          <Switch label="Invalid" invalid />
        </div>
      ),
      code: snippet(['Switch'], 'SwitchStates', `<Switch label="Off" />\n<Switch label="On" defaultChecked />\n<Switch label="Disabled" disabled />\n<Switch label="Disabled on" disabled defaultChecked />\n<Switch label="Invalid" invalid />`),
    },
    {
      title: 'Size',
      description: '`sm` (24×14) for dense rows.',
      render: () => (
        <div className={row}>
          <Switch size="sm" defaultChecked aria-label="Small" />
          <Switch size="md" defaultChecked aria-label="Medium" />
        </div>
      ),
      code: snippet(['Switch'], 'SwitchSizes', `<Switch size="sm" defaultChecked aria-label="Small" />\n<Switch size="md" defaultChecked aria-label="Medium" />`),
    },
    {
      title: 'Settings row',
      align: 'start',
      render: () => (
        <div className="flex w-full max-w-96 items-center justify-between gap-4">
          <div>
            <div id="lock-label" className="text-n-ui text-n-text-primary">Lock page</div>
            <div className="text-[12px] leading-4 text-n-text-secondary">Prevent accidental edits.</div>
          </div>
          <Switch aria-labelledby="lock-label" />
        </div>
      ),
      code: snippet(['Switch'], 'LockRow', `<div className="flex items-center justify-between gap-4">\n  <div>\n    <div id="lock-label">Lock page</div>\n    <div className="text-n-text-secondary">Prevent accidental edits.</div>\n  </div>\n  <Switch aria-labelledby="lock-label" />\n</div>`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <Switch aria-label="Off" />
          <Switch aria-label="On" defaultChecked />
        </Dark>
      ),
      code: darkCode(['Switch'], 'SwitchDark', `<Switch aria-label="Off" />\n<Switch aria-label="On" defaultChecked />`),
    },
  ],
  api: [
    {
      name: 'Switch',
      description: 'Radix Switch (a `<button role="switch">`); supports all of its props. Adds:',
      props: [
        { name: 'checked', type: 'boolean', description: 'Controlled state.' },
        { name: 'defaultChecked', type: 'boolean', default: 'false', description: 'Initial state when uncontrolled.' },
        { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'Called with the new state.' },
        { name: 'label', type: 'ReactNode', description: 'Text next to the switch; clicking it toggles.' },
        { name: 'invalid', type: 'boolean', default: 'false', description: 'Red outline and `aria-invalid`.' },
        { name: 'size', type: ['"sm"', '"md"'], default: '"md"', description: '24×14 or 30×18 track.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims and blocks interaction.' },
        { name: 'name', type: 'string', description: 'Form field name (a hidden input is rendered inside forms).' },
        { name: 'required', type: 'boolean', default: 'false', description: 'Required in forms.' },
        { name: 'className', type: 'string', description: 'Applied to the label (with `label`) or the switch.' },
      ],
    },
  ],
  sections: [
    a11y([
      '`Tab` focuses the switch; `Space` and `Enter` toggle it. State is announced through `role="switch"` + `aria-checked`.',
      'Name it with `label`, `aria-label` or `aria-labelledby`.',
      'The button is 24px tall on touch screens; the track keeps its size. The knob does not animate with reduced motion.',
    ]),
    usage(
      ['turn a setting on or off with an immediate effect', 'settings lists and preference panels'],
      ['choices that are submitted later with a form (use Checkbox)', 'choosing between two named options (use RadioGroup or SegmentedControl)'],
    ),
  ],
};

const inputApi = (extra: { name: string; type: string | string[]; default?: string; description: string }[]) => [
  { name: 'invalid', type: 'boolean', default: 'false', description: 'Red ring and `aria-invalid`. Field sets it from its `error`.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims the field and blocks input.' },
  { name: 'required', type: 'boolean', default: 'false', description: 'Native `required`.' },
  { name: 'name', type: 'string', description: 'Form field name.' },
  ...extra,
];

const textInputPage: DocPage = {
  eyebrow,
  title: 'Text Input',
  description: 'Single-line field: a translucent grey box with a hairline ring that turns blue on focus and red when invalid. Optional leading icon and trailing content.',
  hero: {
    title: 'Text Input',
    render: () => <TextInput className={field} aria-label="Workspace name" placeholder="Acme Inc." />,
    code: snippet(['TextInput'], 'NameInput', `<TextInput aria-label="Workspace name" placeholder="Acme Inc." />`),
  },
  install: install('TextInput', `<TextInput aria-label="Email" type="email" placeholder="you@example.com" />`),
  examples: [
    {
      title: 'Size',
      render: () => (
        <div className="flex w-full max-w-72 flex-col gap-3">
          <TextInput size="sm" aria-label="Small" placeholder="Small (24px)" />
          <TextInput size="md" aria-label="Medium" placeholder="Medium (28px)" />
          <TextInput size="lg" aria-label="Large" placeholder="Large (32px)" />
        </div>
      ),
      code: snippet(['TextInput'], 'InputSizes', `<TextInput size="sm" aria-label="Small" placeholder="Small (24px)" />\n<TextInput size="md" aria-label="Medium" placeholder="Medium (28px)" />\n<TextInput size="lg" aria-label="Large" placeholder="Large (32px)" />`),
    },
    {
      title: 'Icon and trailing content',
      render: () => (
        <div className="flex w-full max-w-72 flex-col gap-3">
          <TextInput icon="mail" aria-label="Invite by email" placeholder="Invite by email" />
          <TextInput aria-label="Price" defaultValue="12" trailing={<span className="text-n-ui text-n-text-secondary">USD</span>} />
        </div>
      ),
      code: snippet(['TextInput'], 'InputAdornments', `<TextInput icon="mail" aria-label="Invite by email" placeholder="Invite by email" />\n<TextInput aria-label="Price" defaultValue="12" trailing={<span className="text-n-text-secondary">USD</span>} />`),
    },
    {
      title: 'States',
      render: () => (
        <div className="flex w-full max-w-72 flex-col gap-3">
          <TextInput aria-label="Invalid email" invalid defaultValue="ada@" />
          <TextInput aria-label="Disabled" disabled defaultValue="Read only" />
        </div>
      ),
      code: snippet(['TextInput'], 'InputStates', `<TextInput aria-label="Invalid email" invalid defaultValue="ada@" />\n<TextInput aria-label="Disabled" disabled defaultValue="Read only" />`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <TextInput className={field} icon="search" aria-label="Filter" placeholder="Filter…" />
        </Dark>
      ),
      code: darkCode(['TextInput'], 'InputDark', `<TextInput icon="search" aria-label="Filter" placeholder="Filter…" />`),
    },
  ],
  api: [
    {
      name: 'TextInput',
      description: 'The ref and all other `<input>` props go to the `<input>`; `className` / `style` style the box. Adds:',
      props: inputApi([
        { name: 'size', type: ['"sm"', '"md"', '"lg"'], default: '"md"', description: '24, 28 or 32px tall (at least 32px on touch screens).' },
        { name: 'icon', type: 'IconName', description: 'Leading icon.' },
        { name: 'trailing', type: 'ReactNode', description: 'Content at the end: unit, shortcut or button.' },
        { name: 'inputClassName', type: 'string', description: 'Classes for the `<input>` itself.' },
      ]),
    },
  ],
  sections: [
    a11y([
      'A native `<input>`: every keyboard behaviour is the browser’s. The ring on the box shows focus.',
      'It has no visible label of its own: wrap it in Field (which wires `id`, `aria-describedby` and `aria-invalid`) or pass `aria-label`. A placeholder is not a label.',
      '`invalid` sets `aria-invalid`; describe the error in text (Field’s `error`), not only by color.',
    ]),
    usage(['short free text: names, emails, URLs, amounts with a unit', 'inline filters (or SearchInput)'], ['long text (use Textarea)', 'picking from known values (use Select / Combobox)', 'numbers with steppers (use NumberInput)']),
  ],
};

const textareaPage: DocPage = {
  eyebrow,
  title: 'Textarea',
  description: 'Multi-line field with the Text Input surface (14/20 text), resizable vertically.',
  hero: {
    title: 'Textarea',
    render: () => <Textarea className="w-full max-w-80" aria-label="Feedback" placeholder="Share your thoughts…" />,
    code: snippet(['Textarea'], 'FeedbackField', `<Textarea aria-label="Feedback" placeholder="Share your thoughts…" />`),
  },
  install: install('Textarea', `<Textarea aria-label="Notes" rows={4} />`),
  examples: [
    {
      title: 'Rows',
      render: () => <Textarea className="w-full max-w-80" rows={6} aria-label="Description" defaultValue={'Line one\nLine two'} />,
      code: snippet(['Textarea'], 'TallTextarea', `<Textarea rows={6} aria-label="Description" defaultValue={'Line one\\nLine two'} />`),
    },
    {
      title: 'States',
      render: () => (
        <div className="flex w-full max-w-80 flex-col gap-3">
          <Textarea invalid aria-label="Invalid" defaultValue="Too short" />
          <Textarea disabled aria-label="Disabled" defaultValue="Read only" />
        </div>
      ),
      code: snippet(['Textarea'], 'TextareaStates', `<Textarea invalid aria-label="Invalid" defaultValue="Too short" />\n<Textarea disabled aria-label="Disabled" defaultValue="Read only" />`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <Textarea className="w-full max-w-80" aria-label="Notes" placeholder="Write a note…" />
        </Dark>
      ),
      code: darkCode(['Textarea'], 'TextareaDark', `<Textarea aria-label="Notes" placeholder="Write a note…" />`),
    },
  ],
  api: [
    {
      name: 'Textarea',
      description: 'A `<textarea>`; supports all of its props. Adds:',
      props: [
        { name: 'invalid', type: 'boolean', default: 'false', description: 'Red ring and `aria-invalid`.' },
        { name: 'rows', type: 'number', default: '3', description: 'Visible lines.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims the field and blocks input.' },
        { name: 'required', type: 'boolean', default: 'false', description: 'Native `required`.' },
        { name: 'name', type: 'string', description: 'Form field name.' },
      ],
    },
  ],
  sections: [
    a11y(['A native `<textarea>`: `Enter` adds a line, `Tab` leaves the field.', 'Name it with Field or `aria-label`; the blue ring shows focus.']),
    usage(['comments, descriptions and other multi-line text'], ['single values (use TextInput)', 'rich text (use the Editor)']),
  ],
};

const searchInputPage: DocPage = {
  eyebrow,
  title: 'Search Input',
  description: 'Search field with a leading magnifier and a clear button that appears once there is text. Escape clears too.',
  hero: {
    title: 'Search Input',
    render: () => <SearchDemo />,
    code: snippet(['SearchInput'], 'SettingsSearch', `<SearchInput\n  aria-label="Search settings"\n  value={query}\n  onChange={(e) => setQuery(e.target.value)}\n  onClear={() => setQuery('')}\n  placeholder="Search settings"\n/>`, {
      react: ['useState'],
      hooks: `const [query, setQuery] = useState('Design');`,
    }),
  },
  install: install('SearchInput', `<SearchInput aria-label="Search" placeholder="Search" />`),
  examples: [
    {
      title: 'Uncontrolled',
      description: 'Without `value` the field clears itself.',
      render: () => <SearchInput className={field} aria-label="Filter pages" defaultValue="Roadmap" placeholder="Filter pages" />,
      code: snippet(['SearchInput'], 'FilterPages', `<SearchInput aria-label="Filter pages" defaultValue="Roadmap" placeholder="Filter pages" />`),
    },
    {
      title: 'Size',
      render: () => (
        <div className="flex w-full max-w-72 flex-col gap-3">
          <SearchInput size="sm" aria-label="Small search" />
          <SearchInput size="md" aria-label="Medium search" />
          <SearchInput size="lg" aria-label="Large search" />
        </div>
      ),
      code: snippet(['SearchInput'], 'SearchSizes', `<SearchInput size="sm" aria-label="Small search" />\n<SearchInput size="md" aria-label="Medium search" />\n<SearchInput size="lg" aria-label="Large search" />`),
    },
    {
      title: 'Bare',
      description: 'The unboxed header field of a search dialog.',
      render: () => <SearchInput variant="bare" className="max-w-96" aria-label="Search workspace" placeholder="Search or ask a question" />,
      code: snippet(['SearchInput'], 'DialogSearch', `<SearchInput variant="bare" aria-label="Search workspace" placeholder="Search or ask a question" />`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <SearchInput className={field} aria-label="Search" defaultValue="Tasks" />
        </Dark>
      ),
      code: darkCode(['SearchInput'], 'SearchDark', `<SearchInput aria-label="Search" defaultValue="Tasks" />`),
    },
  ],
  api: [
    {
      name: 'SearchInput',
      description: 'An `<input type="search">` in the TextInput box; supports every TextInput prop except `icon` and `type`. Adds:',
      props: inputApi([
        { name: 'onClear', type: '() => void', description: 'Called after the clear button or Escape empties the field. Controlled fields reset `value` here (the button only shows when it is set).' },
        { name: 'clearLabel', type: 'string', default: '"Clear search"', description: 'Accessible name of the clear button.' },
        { name: 'variant', type: ['"field"', '"bare"'], default: '"field"', description: 'Boxed field or unboxed dialog header.' },
        { name: 'size', type: ['"sm"', '"md"', '"lg"'], default: '"md"', description: 'Height of the `field` variant.' },
        { name: 'placeholder', type: 'string', default: '"Search"', description: 'Hint text.' },
        { name: 'trailing', type: 'ReactNode', description: 'Content after the clear button.' },
        { name: 'inputClassName', type: 'string', description: 'Classes for the `<input>`.' },
      ]),
    },
  ],
  sections: [
    a11y([
      '`role="searchbox"`. `Escape` clears a non-empty field (and does not close the surrounding dialog); an empty field lets Escape through.',
      'The clear button is a real button (“Clear search”), reachable with `Tab`; focus returns to the field after clearing.',
      'Name the field with `aria-label` or Field.',
    ]),
    usage(['filter a list, table, menu or settings page as you type', 'the query field of a search dialog (`variant="bare"`)'], ['general text entry (use TextInput)']),
  ],
};

/* ================================================================== DISPLAY */

const kbdPage: DocPage = {
  eyebrow,
  title: 'Kbd',
  description: 'Keyboard key or shortcut chip, like “⌘K” next to Search. `Shortcut` is the plain text variant used at the end of menu rows.',
  hero: {
    title: 'Kbd',
    render: () => (
      <p className="text-n-ui text-n-text-primary">
        Press <Kbd>⌘K</Kbd> to search
      </p>
    ),
    code: snippet(['Kbd'], 'SearchHint', `<p>\n  Press <Kbd>⌘K</Kbd> to search\n</p>`),
  },
  install: install('Kbd', `<Kbd>⌘K</Kbd>`),
  examples: [
    {
      title: 'Keys',
      render: () => (
        <div className={row}>
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>Enter</Kbd>
          <Kbd>Esc</Kbd>
          <Kbd>⌘⇧L</Kbd>
        </div>
      ),
      code: snippet(['Kbd'], 'Keys', `<Kbd>⌘</Kbd>\n<Kbd>⇧</Kbd>\n<Kbd>Enter</Kbd>\n<Kbd>Esc</Kbd>\n<Kbd>⌘⇧L</Kbd>`),
    },
    {
      title: 'Menu shortcut',
      render: () => (
        <div className="flex w-60 items-center justify-between text-n-ui text-n-text-primary">
          <span>Copy link</span>
          <Shortcut>⌘⌥L</Shortcut>
        </div>
      ),
      code: snippet(['Shortcut'], 'MenuShortcut', `<div className="flex items-center justify-between">\n  <span>Copy link</span>\n  <Shortcut>⌘⌥L</Shortcut>\n</div>`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <Kbd>⌘K</Kbd>
          <Shortcut>⌘⌥L</Shortcut>
        </Dark>
      ),
      code: darkCode(['Kbd', 'Shortcut'], 'KbdDark', `<Kbd>⌘K</Kbd>\n<Shortcut>⌘⌥L</Shortcut>`),
    },
  ],
  api: [
    { name: 'Kbd', description: 'A `<kbd>` element; supports all of its props.', props: baseProps },
    { name: 'Shortcut', description: 'A `<span>` with tertiary 12px text; supports all of its props.', props: baseProps },
  ],
  sections: [
    a11y(['Static text in a `<kbd>` element; screen readers read the characters. Spell out keys that symbols may not convey (e.g. `aria-label="Command K"`) where it matters.']),
    usage(['show the shortcut of an action next to it, in tooltips, menus and help text'], ['as a button (it is not interactive)', 'for tags or statuses (use Tag / Badge)']),
  ],
};

const tones = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const;

const badgePage: DocPage = {
  eyebrow,
  title: 'Badge',
  description: 'Small status or count label: six tones in soft, solid and outline variants, all at 4.5:1 contrast or more.',
  hero: {
    title: 'Badge',
    render: () => (
      <div className={row}>
        <Badge tone="accent">New</Badge>
        <Badge>Beta</Badge>
        <Badge variant="solid" tone="danger">3</Badge>
      </div>
    ),
    code: snippet(['Badge'], 'BadgeDemo', `<Badge tone="accent">New</Badge>\n<Badge>Beta</Badge>\n<Badge variant="solid" tone="danger">3</Badge>`),
  },
  install: install('Badge', `<Badge tone="accent">New</Badge>`),
  examples: [
    {
      title: 'Tones',
      render: () => <div className={row}>{tones.map((t) => <Badge key={t} tone={t}>{sentenceCase(t)}</Badge>)}</div>,
      code: snippet(['Badge'], 'BadgeTones', tones.map((t) => `<Badge tone="${t}">${sentenceCase(t)}</Badge>`).join('\n')),
    },
    {
      title: 'Variants',
      render: () => (
        <div className="flex flex-col items-center gap-3">
          {(['soft', 'solid', 'outline'] as const).map((v) => (
            <div key={v} className={row}>{tones.map((t) => <Badge key={t} variant={v} tone={t}>{sentenceCase(t)}</Badge>)}</div>
          ))}
        </div>
      ),
      code: snippet(['Badge'], 'BadgeVariants', `<Badge variant="soft" tone="success">Active</Badge>\n<Badge variant="solid" tone="success">Active</Badge>\n<Badge variant="outline" tone="success">Active</Badge>`),
    },
    {
      title: 'Count',
      description: 'A count badge is `variant="solid" tone="danger"`. Give the number context with `aria-label`.',
      render: () => (
        <div className="flex h-[30px] w-60 items-center gap-2 rounded-n-md px-2 text-n-ui text-n-text-secondary">
          <span className="flex-1">Inbox</span>
          <Badge variant="solid" tone="danger" aria-label="4 unread">4</Badge>
        </div>
      ),
      code: snippet(['Badge'], 'InboxCount', `<div className="flex items-center gap-2">\n  <span className="flex-1">Inbox</span>\n  <Badge variant="solid" tone="danger" aria-label="4 unread">4</Badge>\n</div>`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <Badge tone="accent">New</Badge>
          <Badge tone="success">Done</Badge>
          <Badge variant="solid" tone="danger">3</Badge>
          <Badge variant="outline" tone="warning">Due</Badge>
        </Dark>
      ),
      code: darkCode(['Badge'], 'BadgeDark', `<Badge tone="accent">New</Badge>\n<Badge tone="success">Done</Badge>\n<Badge variant="solid" tone="danger">3</Badge>\n<Badge variant="outline" tone="warning">Due</Badge>`),
    },
  ],
  api: [
    {
      name: 'Badge',
      description: 'A `<span>`; supports all of its props. Adds:',
      props: [
        { name: 'tone', type: tones.map((t) => `"${t}"`), default: '"neutral"', description: 'Meaning: neutral = gray, accent / info = blue, success = green, warning = yellow / orange, danger = red.' },
        { name: 'variant', type: ['"soft"', '"solid"', '"outline"'], default: '"soft"', description: 'Tinted fill, solid fill with white text, or a ring.' },
      ],
    },
  ],
  sections: [
    a11y(['Static text: the words carry the meaning, color only reinforces it.', 'For counts, add `aria-label` (“4 unread”) so the number is understandable on its own.']),
    usage(['mark something as new, beta or changed', 'show a status or an unread count next to a title or nav item'], ['user-defined categories (use Tag)', 'actions (use Button)', 'long text (use Alert or Callout)']),
  ],
};

const tagPage: DocPage = {
  eyebrow,
  title: 'Tag',
  description: 'Colored label for user-defined categories in the ten palette colors, with an optional remove button.',
  hero: {
    title: 'Tag',
    render: () => <TagRemoveDemo />,
    code: `import { useState } from 'react';\nimport { Tag } from '${PKG}';\n\nexport function TagEditor() {\n  const [tags, setTags] = useState(['Design', 'Research', 'Q3']);\n  return (\n    <div className="flex flex-wrap gap-1.5">\n      {tags.map((t) => (\n        <Tag key={t} color="purple" onRemove={() => setTags((all) => all.filter((x) => x !== t))}>\n          {t}\n        </Tag>\n      ))}\n    </div>\n  );\n}`,
  },
  install: install('Tag', `<Tag color="green">Research</Tag>`),
  examples: [
    {
      title: 'Colors',
      description: '`default` plus the ten palette colors (`motionColors`).',
      render: () => <div className={`${row} max-w-[520px]`}>{motionColors.map((c) => <Tag key={c} color={c}>{sentenceCase(c)}</Tag>)}</div>,
      code: snippet(['Tag', 'motionColors'], 'TagColors', `<div className="flex flex-wrap gap-2">\n  {motionColors.map((c) => (\n    <Tag key={c} color={c}>\n      {c}\n    </Tag>\n  ))}\n</div>`),
    },
    {
      title: 'Size',
      render: () => (
        <div className={row}>
          <Tag size="sm" color="blue">Small</Tag>
          <Tag size="md" color="blue">Medium</Tag>
        </div>
      ),
      code: snippet(['Tag'], 'TagSizes', `<Tag size="sm" color="blue">Small</Tag>\n<Tag size="md" color="blue">Medium</Tag>`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          {(['gray', 'orange', 'green', 'blue', 'pink'] as const).map((c) => <Tag key={c} color={c}>{sentenceCase(c)}</Tag>)}
        </Dark>
      ),
      code: darkCode(['Tag'], 'TagDark', `<Tag color="gray">Gray</Tag>\n<Tag color="orange">Orange</Tag>\n<Tag color="green">Green</Tag>`),
    },
  ],
  api: [
    {
      name: 'Tag',
      description: 'A `<span>`; supports all of its props. Adds:',
      props: [
        { name: 'color', type: ['"default"', 'Color'], default: '"default"', description: 'Neutral grey or one of the palette colors: gray, brown, orange, yellow, green, teal, blue, purple, pink, red.' },
        { name: 'size', type: ['"sm"', '"md"'], default: '"md"', description: '18px or 20px tall.' },
        { name: 'onRemove', type: '(event: MouseEvent<HTMLButtonElement>) => void', description: 'Shows the × button and is called when it is pressed.' },
        { name: 'removeLabel', type: 'string', default: '"Remove <text>"', description: 'Accessible name of the remove button.' },
      ],
    },
    { name: 'motionColors', description: '`readonly MotionColor[]`: `default` and the ten palette colors, in menu order.', props: [] },
  ],
  sections: [
    a11y(['The tag is static text. The remove button is a separate, named button (“Remove Design”) reached with `Tab` and pressed with `Enter` / `Space`; it is 24×24 on touch screens.', 'Long labels truncate; pass `title` when the full text matters.']),
    usage(['show categories, labels or select-option values the user created', 'edit a multi-value field with removable tags'], ['system statuses or counts (use Badge or StatusPill)', 'filters that toggle (use a Button or SegmentedControl)']),
  ],
};

const statusPillPage: DocPage = {
  eyebrow,
  title: 'Status Pill',
  description: 'A colored dot and label on a rounded tint, with shortcuts for the default groups: not started, in progress, done.',
  hero: {
    title: 'Status Pill',
    render: () => (
      <div className={row}>
        <StatusPill color="not-started">Not started</StatusPill>
        <StatusPill color="in-progress">In progress</StatusPill>
        <StatusPill color="done">Done</StatusPill>
      </div>
    ),
    code: snippet(['StatusPill'], 'StatusDemo', `<StatusPill color="not-started">Not started</StatusPill>\n<StatusPill color="in-progress">In progress</StatusPill>\n<StatusPill color="done">Done</StatusPill>`),
  },
  install: install('StatusPill', `<StatusPill color="in-progress">In progress</StatusPill>`),
  examples: [
    {
      title: 'Colors',
      render: () => <div className={`${row} max-w-[520px]`}>{motionColors.map((c) => <StatusPill key={c} color={c}>{sentenceCase(c)}</StatusPill>)}</div>,
      code: snippet(['StatusPill', 'motionColors'], 'StatusColors', `<div className="flex flex-wrap gap-2">\n  {motionColors.map((c) => (\n    <StatusPill key={c} color={c}>\n      {c}\n    </StatusPill>\n  ))}\n</div>`),
    },
    {
      title: 'Size',
      render: () => (
        <div className={row}>
          <StatusPill size="sm" color="in-progress">In progress</StatusPill>
          <StatusPill size="md" color="in-progress">In progress</StatusPill>
        </div>
      ),
      code: snippet(['StatusPill'], 'StatusSizes', `<StatusPill size="sm" color="in-progress">In progress</StatusPill>\n<StatusPill size="md" color="in-progress">In progress</StatusPill>`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <StatusPill color="not-started">Not started</StatusPill>
          <StatusPill color="in-progress">In progress</StatusPill>
          <StatusPill color="done">Done</StatusPill>
        </Dark>
      ),
      code: darkCode(['StatusPill'], 'StatusDark', `<StatusPill color="not-started">Not started</StatusPill>\n<StatusPill color="in-progress">In progress</StatusPill>\n<StatusPill color="done">Done</StatusPill>`),
    },
  ],
  api: [
    {
      name: 'StatusPill',
      description: 'A `<span>`; supports all of its props. Adds:',
      props: [
        { name: 'color', type: ['MotionColor', '"not-started"', '"in-progress"', '"done"'], default: '"gray"', description: 'A palette color or a default group (gray / blue / green).' },
        { name: 'size', type: ['"sm"', '"md"'], default: '"md"', description: '18px or 20px tall.' },
      ],
    },
    { name: 'statusColors', description: 'The default groups: `not-started` → `gray`, `in-progress` → `blue`, `done` → `green`.', props: [] },
  ],
  sections: [
    a11y(['Static text; the dot is decorative and the label carries the meaning.', 'Long labels truncate; add `title` when the full status may be hidden.']),
    usage(['show a workflow status in tables, boards and lists'], ['short system labels like “New” (use Badge)', 'categories (use Tag)']),
  ],
};

const avatarSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const IMG = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23d3e5ef'/%3E%3Ccircle cx='16' cy='13' r='6' fill='%235e87c9'/%3E%3Crect x='6' y='22' width='20' height='12' rx='6' fill='%235e87c9'/%3E%3C/svg%3E";

const avatarPage: DocPage = {
  eyebrow,
  title: 'Avatar',
  description: 'Person or workspace picture with an initial fallback: rounded squares for workspaces, circles for people.',
  hero: {
    title: 'Avatar',
    render: () => (
      <div className={row}>
        <Avatar name="Design Team" size="xl" />
        <Avatar name="Ada Lovelace" shape="user" size="xl" />
      </div>
    ),
    code: snippet(['Avatar'], 'AvatarDemo', `<Avatar name="Design Team" size="xl" />\n<Avatar name="Ada Lovelace" shape="user" size="xl" />`),
  },
  install: install('Avatar', `<Avatar name="Ada Lovelace" shape="user" />`),
  examples: [
    {
      title: 'Size',
      render: () => (
        <div className="flex flex-col items-center gap-3">
          <div className={row}>{avatarSizes.map((s) => <Avatar key={s} name="Design Team" size={s} />)}</div>
          <div className={row}>{avatarSizes.map((s) => <Avatar key={s} name="Ada Lovelace" shape="user" size={s} />)}</div>
        </div>
      ),
      code: snippet(['Avatar'], 'AvatarSizes', avatarSizes.map((s) => `<Avatar name="Ada Lovelace" shape="user" size="${s}" />`).join('\n')),
    },
    {
      title: 'Image',
      render: () => (
        <div className={row}>
          <Avatar name="Grace Hopper" shape="user" size="xl" src={IMG} />
          <Avatar name="Design Team" size="xl" src={IMG} />
        </div>
      ),
      code: snippet(['Avatar'], 'AvatarImages', `<Avatar name="Grace Hopper" shape="user" size="xl" src="/avatars/grace.png" />\n<Avatar name="Design Team" size="xl" src="/workspace-logo.png" />`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <Avatar name="Design Team" size="lg" />
          <Avatar name="Ada Lovelace" shape="user" size="lg" />
        </Dark>
      ),
      code: darkCode(['Avatar'], 'AvatarDark', `<Avatar name="Design Team" size="lg" />\n<Avatar name="Ada Lovelace" shape="user" size="lg" />`),
    },
  ],
  api: [
    {
      name: 'Avatar',
      description: 'A `<span>`; supports all of its props. Adds:',
      props: [
        { name: 'name', type: 'string', description: 'Accessible name and the initial. Without it the avatar is decorative.' },
        { name: 'src', type: 'string', description: 'Picture URL; fills the shape.' },
        { name: 'size', type: ['"xs"', '"sm"', '"md"', '"lg"', '"xl"', '16', '20', '24', '28', '32'], default: '"sm"', description: '16, 20, 24, 28 or 32px.' },
        { name: 'shape', type: ['"workspace"', '"user"'], default: '"workspace"', description: 'Rounded square or circle.' },
      ],
    },
  ],
  sections: [
    a11y(['With `name`: `role="img"` named after the person. Without: hidden from assistive tech (use it only next to a visible name).', 'The picture itself has empty alt text; the name is on the avatar.']),
    usage(['identify a person or workspace in lists, menus, comments and headers'], ['decorative illustrations', 'buttons on their own (wrap in a Button with a label instead)']),
  ],
};

const avatarGroupPage: DocPage = {
  eyebrow,
  title: 'Avatar Group',
  description: 'Overlapping facepile; extra people collapse into a “+N” chip.',
  hero: {
    title: 'Avatar Group',
    render: () => (
      <AvatarGroup max={3}>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Linus Torvalds" />
        <Avatar name="Margaret Hamilton" />
        <Avatar name="Alan Turing" />
      </AvatarGroup>
    ),
    code: snippet(['Avatar', 'AvatarGroup'], 'Collaborators', `<AvatarGroup max={3}>\n  <Avatar name="Ada Lovelace" />\n  <Avatar name="Grace Hopper" />\n  <Avatar name="Linus Torvalds" />\n  <Avatar name="Margaret Hamilton" />\n  <Avatar name="Alan Turing" />\n</AvatarGroup>`),
  },
  install: install('Avatar, AvatarGroup', `<AvatarGroup max={3}>\n  <Avatar name="Ada" />\n  <Avatar name="Grace" />\n</AvatarGroup>`),
  examples: [
    {
      title: 'Size',
      render: () => (
        <div className="flex flex-col items-center gap-3">
          {avatarSizes.map((s) => (
            <AvatarGroup key={s} size={s}>
              <Avatar name="Ada" />
              <Avatar name="Grace" />
              <Avatar name="Linus" />
            </AvatarGroup>
          ))}
        </div>
      ),
      code: snippet(['Avatar', 'AvatarGroup'], 'GroupSizes', `<AvatarGroup size="xl">\n  <Avatar name="Ada" />\n  <Avatar name="Grace" />\n  <Avatar name="Linus" />\n</AvatarGroup>`),
    },
    {
      title: 'Workspaces',
      description: 'Children default to the circular `user` shape; set `shape` to keep squares.',
      render: () => (
        <AvatarGroup size="lg">
          <Avatar name="Design Team" shape="workspace" />
          <Avatar name="Engineering" shape="workspace" />
        </AvatarGroup>
      ),
      code: snippet(['Avatar', 'AvatarGroup'], 'WorkspaceGroup', `<AvatarGroup size="lg">\n  <Avatar name="Design Team" shape="workspace" />\n  <Avatar name="Engineering" shape="workspace" />\n</AvatarGroup>`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <AvatarGroup max={2}>
            <Avatar name="Ada" />
            <Avatar name="Grace" />
            <Avatar name="Linus" />
          </AvatarGroup>
        </Dark>
      ),
      code: darkCode(['Avatar', 'AvatarGroup'], 'GroupDark', `<AvatarGroup max={2}>\n  <Avatar name="Ada" />\n  <Avatar name="Grace" />\n  <Avatar name="Linus" />\n</AvatarGroup>`),
    },
  ],
  api: [
    {
      name: 'AvatarGroup',
      description: 'A `<div role="group">`; supports all of its props. Adds:',
      props: [
        { name: 'max', type: 'number', default: '4', description: 'Avatars shown before the “+N” chip.' },
        { name: 'size', type: ['"xs"', '"sm"', '"md"', '"lg"', '"xl"', '16', '20', '24', '28', '32'], default: '"md"', description: 'Size applied to every avatar.' },
      ],
    },
  ],
  sections: [
    a11y(['A `group`; each avatar is an image named after its person, and the chip is named “N more”.', 'Add `aria-label` to the group (“Collaborators”) when its purpose is not clear from context.']),
    usage(['show who is on a page, project or thread at a glance'], ['a full member list (use a list with names)']),
  ],
};

const pageIconPage: DocPage = {
  eyebrow,
  title: 'Page Icon',
  description: 'A page’s icon: emoji, icon or image, with the default page glyph when none is set. Sized for sidebar rows, table cells, callouts and page titles.',
  hero: {
    title: 'Page Icon',
    render: () => (
      <div className={row}>
        <PageIcon />
        <PageIcon emoji="📘" />
        <PageIcon icon="book" />
      </div>
    ),
    code: snippet(['PageIcon'], 'PageIconDemo', `<PageIcon />\n<PageIcon emoji="📘" />\n<PageIcon icon="book" />`),
  },
  install: install('PageIcon', `<PageIcon emoji="🚀" size={20} />`),
  examples: [
    {
      title: 'Sources',
      render: () => (
        <div className={row}>
          <PageIcon size={24} />
          <PageIcon size={24} empty />
          <PageIcon size={24} emoji="🎯" />
          <PageIcon size={24} icon="calendar" />
          <PageIcon size={24} src={IMG} />
        </div>
      ),
      code: snippet(['PageIcon'], 'PageIconSources', `<PageIcon size={24} />\n<PageIcon size={24} empty />\n<PageIcon size={24} emoji="🎯" />\n<PageIcon size={24} icon="calendar" />\n<PageIcon size={24} src="/icons/custom.png" />`),
    },
    {
      title: 'Size',
      render: () => (
        <div className={row}>
          {([16, 18, 20, 22, 24, 78] as const).map((s) => <PageIcon key={s} size={s} emoji="📄" />)}
        </div>
      ),
      code: snippet(['PageIcon'], 'PageIconSizes', `<PageIcon size={16} emoji="📄" />\n<PageIcon size={24} emoji="📄" />\n<PageIcon size={78} emoji="📄" />`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <PageIcon />
          <PageIcon empty />
          <PageIcon icon="book" />
        </Dark>
      ),
      code: darkCode(['PageIcon'], 'PageIconDark', `<PageIcon />\n<PageIcon empty />\n<PageIcon icon="book" />`),
    },
  ],
  api: [
    {
      name: 'PageIcon',
      description: 'A `<span>`; supports all of its props. Precedence: `emoji`, then `src`, then `icon`, then the default glyph. Adds:',
      props: [
        { name: 'emoji', type: 'string', description: 'Emoji character.' },
        { name: 'icon', type: 'IconName', description: 'An icon instead of the page glyph.' },
        { name: 'src', type: 'string', description: 'Custom image URL.' },
        { name: 'size', type: ['16', '18', '20', '22', '24', '78'], default: '20', description: 'Box size in px.' },
        { name: 'empty', type: 'boolean', default: 'false', description: 'Use the empty-page glyph.' },
        { name: 'interactive', type: 'boolean', default: 'false', description: 'Hover background, for an icon that opens a picker (wrap it in a button).' },
      ],
    },
  ],
  sections: [
    a11y(['Decorative by default (it sits next to the page title). Pass `aria-label` to make it an image with a name.', '`interactive` only changes styling; put it inside a `<button>` with a label when it opens a picker.']),
    usage(['show a page’s icon in navigation, tables, links and titles'], ['general UI icons (use Icon)', 'people (use Avatar)']),
  ],
};

const dividerPage: DocPage = {
  eyebrow,
  title: 'Divider',
  description: 'Hairline separator, horizontal or vertical. `block` adds the spacing of a divider in a document.',
  hero: {
    title: 'Divider',
    render: () => <div className="w-full max-w-80"><Divider /></div>,
    code: snippet(['Divider'], 'DividerDemo', `<Divider />`),
  },
  install: install('Divider', `<Divider />`),
  examples: [
    {
      title: 'Divider block',
      render: () => (
        <div className="w-full max-w-80 text-n-body text-n-text-primary">
          <p>Above the divider.</p>
          <Divider block />
          <p>Below the divider.</p>
        </div>
      ),
      code: snippet(['Divider'], 'DividerBlock', `<p>Above the divider.</p>\n<Divider block />\n<p>Below the divider.</p>`),
    },
    {
      title: 'Vertical',
      render: () => (
        <div className="flex h-6 items-center gap-3 text-n-ui text-n-text-primary">
          <span>Share</span>
          <Divider orientation="vertical" />
          <span>Publish</span>
        </div>
      ),
      code: snippet(['Divider'], 'VerticalDivider', `<div className="flex h-6 items-center gap-3">\n  <span>Share</span>\n  <Divider orientation="vertical" />\n  <span>Publish</span>\n</div>`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <div className="w-60"><Divider block /></div>
        </Dark>
      ),
      code: darkCode(['Divider'], 'DividerDark', `<Divider block />`),
    },
  ],
  api: [
    {
      name: 'Divider',
      description: 'A `<div role="separator">`; supports all of its props. Adds:',
      props: [
        { name: 'orientation', type: ['"horizontal"', '"vertical"'], default: '"horizontal"', description: 'Line direction; also sets `aria-orientation`.' },
        { name: 'block', type: 'boolean', default: 'false', description: 'Wrap the line in a 13px row with 8px side padding.' },
      ],
    },
  ],
  sections: [
    a11y(['`role="separator"` with `aria-orientation`; not focusable. Purely visual spacing does not need a Divider: use Stack gaps.']),
    usage(['separate groups in menus, toolbars and documents'], ['adding space between items (use Stack `gap`)', 'framing a section (use a Card or border)']),
  ],
};

const spinnerPage: DocPage = {
  eyebrow,
  title: 'Spinner',
  description: 'Loading indicator: a thin ring with a spinning arc. Announced as a status (“Loading” by default).',
  hero: {
    title: 'Spinner',
    render: () => <Spinner size="lg" />,
    code: snippet(['Spinner'], 'SpinnerDemo', `<Spinner size="lg" />`),
  },
  install: install('Spinner', `<Spinner label="Loading pages" />`),
  examples: [
    {
      title: 'Size',
      render: () => (
        <div className={row}>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      ),
      code: snippet(['Spinner'], 'SpinnerSizes', `<Spinner size="sm" />\n<Spinner size="md" />\n<Spinner size="lg" />`),
    },
    {
      title: 'Inline loading row',
      render: () => (
        <div className="flex items-center gap-2 text-n-ui text-n-text-secondary">
          <Spinner label="Loading pages" />
          <span aria-hidden>Loading pages…</span>
        </div>
      ),
      code: snippet(['Spinner'], 'LoadingRow', `<div className="flex items-center gap-2 text-n-text-secondary">\n  <Spinner label="Loading pages" />\n  <span aria-hidden>Loading pages…</span>\n</div>`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <Spinner size="lg" />
        </Dark>
      ),
      code: darkCode(['Spinner'], 'SpinnerDark', `<Spinner size="lg" />`),
    },
  ],
  api: [
    {
      name: 'Spinner',
      description: 'A `<span role="status">`; supports all of its props. Adds:',
      props: [
        { name: 'size', type: ['"sm"', '"md"', '"lg"', 'number'], default: '"md"', description: '12, 16, 20px or any px value.' },
        { name: 'label', type: 'string', default: '"Loading"', description: 'Text announced to screen readers.' },
      ],
    },
  ],
  sections: [
    a11y(['`role="status"` with visually hidden text, so the wait is announced politely.', 'The ring rotates slower with reduced motion (it conveys state, so it keeps moving).', 'For buttons, use Button `loading` instead.']),
    usage(['waits of a second or more inside a region or control'], ['loading page content with a known layout (use Skeleton)', 'progress with a known amount (use Progress)']),
  ],
};

const placeholderPage: DocPage = {
  eyebrow,
  title: 'Placeholder',
  description: 'Hint text for empty content: “Empty” values, untitled pages and blank blocks.',
  hero: {
    title: 'Placeholder',
    render: () => <Placeholder variant="ui">Empty</Placeholder>,
    code: snippet(['Placeholder'], 'PlaceholderDemo', `<Placeholder variant="ui">Empty</Placeholder>`),
  },
  install: install('Placeholder', `<Placeholder variant="ui">Empty</Placeholder>`),
  examples: [
    {
      title: 'Variants',
      render: () => (
        <div className="flex flex-col items-start gap-2">
          <Placeholder variant="ui">Empty</Placeholder>
          <Placeholder variant="block" className="text-n-body">Type something…</Placeholder>
          <Placeholder variant="title" className="text-n-h1">New page</Placeholder>
        </div>
      ),
      code: snippet(['Placeholder'], 'PlaceholderVariants', `<Placeholder variant="ui">Empty</Placeholder>\n<Placeholder variant="block">Type something…</Placeholder>\n<Placeholder variant="title">New page</Placeholder>`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <Placeholder variant="ui">Empty</Placeholder>
        </Dark>
      ),
      code: darkCode(['Placeholder'], 'PlaceholderDark', `<Placeholder variant="ui">Empty</Placeholder>`),
    },
  ],
  api: [
    {
      name: 'Placeholder',
      description: 'A `<span>`; supports all of its props. Adds:',
      props: [{ name: 'variant', type: ['"block"', '"title"', '"ui"'], default: '"block"', description: 'Block text, page title, or 14px UI text color and size.' }],
    },
  ],
  sections: [
    a11y(['Read as normal text (“Empty”), which is what an empty value should say. The `title` variant is lighter and meant for large text only.']),
    usage(['show that a value or page has no content yet'], ['input hints (use the field’s `placeholder`)', 'loading states (use Skeleton)']),
  ],
};

const tooltipPage: DocPage = {
  eyebrow,
  title: 'Tooltip',
  description: 'Short hint on hover and keyboard focus, with an optional shortcut line. Dark in both themes.',
  hero: {
    title: 'Tooltip',
    render: () => (
      <Tooltip content="Add to favorites">
        <IconButton icon="star" label="Favorite" />
      </Tooltip>
    ),
    code: snippet(['IconButton', 'Tooltip'], 'TooltipDemo', `<Tooltip content="Add to favorites">\n  <IconButton icon="star" label="Favorite" />\n</Tooltip>`),
  },
  install: install('IconButton, Tooltip', `<Tooltip content="Share">\n  <IconButton icon="share" label="Share" />\n</Tooltip>`),
  examples: [
    {
      title: 'With shortcut',
      render: () => (
        <Tooltip content="Close sidebar" shortcut="⌘\">
          <IconButton icon="sidebar" label="Close sidebar" />
        </Tooltip>
      ),
      code: snippet(['IconButton', 'Tooltip'], 'ShortcutTooltip', `<Tooltip content="Close sidebar" shortcut="⌘\\">\n  <IconButton icon="sidebar" label="Close sidebar" />\n</Tooltip>`),
    },
    {
      title: 'Side',
      render: () => (
        <div className={row}>
          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
            <Tooltip key={side} side={side} content={`On the ${side}`}>
              <IconButton variant="secondary" icon="info" label={`Tooltip on the ${side}`} />
            </Tooltip>
          ))}
        </div>
      ),
      code: snippet(['IconButton', 'Tooltip'], 'TooltipSides', `<Tooltip side="top" content="On the top">\n  <IconButton variant="secondary" icon="info" label="Tooltip on the top" />\n</Tooltip>\n<Tooltip side="right" content="On the right">\n  <IconButton variant="secondary" icon="info" label="Tooltip on the right" />\n</Tooltip>`),
    },
    {
      title: 'Bubble',
      description: 'The static surface, for composition and documentation.',
      render: () => (
        <div className={row}>
          <TooltipBubble role="none">Add to favorites</TooltipBubble>
          <TooltipBubble role="none" shortcut="⌘⇧L">Copy link</TooltipBubble>
        </div>
      ),
      code: snippet(['TooltipBubble'], 'Bubbles', `<TooltipBubble>Add to favorites</TooltipBubble>\n<TooltipBubble shortcut="⌘⇧L">Copy link</TooltipBubble>`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <Tooltip content="Updates">
            <IconButton icon="bell" label="Updates" />
          </Tooltip>
          <TooltipBubble role="none">Updates</TooltipBubble>
        </Dark>
      ),
      code: darkCode(['IconButton', 'Tooltip'], 'TooltipDark', `<Tooltip content="Updates">\n  <IconButton icon="bell" label="Updates" />\n</Tooltip>`),
    },
  ],
  api: [
    {
      name: 'Tooltip',
      description: 'Radix Tooltip; extra props go to `Tooltip.Content`. The child must be one focusable element (it becomes the trigger). Adds:',
      props: [
        { name: 'content', type: 'ReactNode', description: 'Tooltip text (required).' },
        { name: 'shortcut', type: 'ReactNode', description: 'Second line, e.g. “⌘⇧L”.' },
        { name: 'side', type: ['"top"', '"right"', '"bottom"', '"left"'], default: '"bottom"', description: 'Preferred side; flips to stay on screen.' },
        { name: 'sideOffset', type: 'number', default: '6', description: 'Distance from the trigger in px.' },
        { name: 'delayDuration', type: 'number', default: '400', description: 'Hover delay in ms.' },
        { name: 'open', type: 'boolean', description: 'Controlled open state.' },
        { name: 'defaultOpen', type: 'boolean', description: 'Initial open state.' },
        { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when it opens or closes.' },
      ],
    },
    {
      name: 'TooltipBubble',
      description: 'The static surface (`<div role="tooltip">`). Adds:',
      props: [{ name: 'shortcut', type: 'ReactNode', description: 'Second line.' }],
    },
    { name: 'TooltipProvider', description: 'Radix `Tooltip.Provider`: share one delay across many tooltips (optional; each Tooltip has its own).', props: [] },
  ],
  sections: [
    a11y([
      'Opens on hover and on keyboard focus of the trigger; `Escape` closes it and focus stays on the trigger.',
      'The text is linked to the trigger with `aria-describedby`, so it is read after the trigger’s name.',
      'Never put links, buttons or essential information in a tooltip; it is not reachable on touch screens.',
    ]),
    usage(['name an icon-only control', 'show a keyboard shortcut'], ['long explanations or interactive content (use Popover)', 'disabled buttons (they cannot receive focus; explain the reason in text)']),
  ],
};

const linkPage: DocPage = {
  eyebrow,
  title: 'Link',
  description: 'Text link: inline in running text, accent for UI links, subtle for secondary links. `external` opens a new tab safely.',
  hero: {
    title: 'Link',
    render: () => (
      <p className="text-n-body text-n-text-primary">
        Read the <Link href="#guide">getting started guide</Link> first.
      </p>
    ),
    code: snippet(['Link'], 'LinkDemo', `<p>\n  Read the <Link href="/guide">getting started guide</Link> first.\n</p>`),
  },
  install: install('Link', `<Link href="/docs">Documentation</Link>`),
  examples: [
    {
      title: 'Variants',
      render: () => (
        <div className={row}>
          <Link href="#inline">Inline link</Link>
          <Link variant="accent" href="#accent">Upgrade plan</Link>
          <Link variant="subtle" href="#subtle">Learn more</Link>
        </div>
      ),
      code: snippet(['Link'], 'LinkVariants', `<Link href="/page">Inline link</Link>\n<Link variant="accent" href="/upgrade">Upgrade plan</Link>\n<Link variant="subtle" href="/help">Learn more</Link>`),
    },
    {
      title: 'External',
      render: () => <Link variant="accent" href="https://example.com" external>Status page</Link>,
      code: snippet(['Link'], 'ExternalLink', `<Link variant="accent" href="https://example.com" external>\n  Status page\n</Link>`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <Link href="#inline">Inline link</Link>
          <Link variant="accent" href="#accent">Upgrade plan</Link>
          <Link variant="subtle" href="#subtle">Learn more</Link>
        </Dark>
      ),
      code: darkCode(['Link'], 'LinkDark', `<Link href="/page">Inline link</Link>\n<Link variant="accent" href="/upgrade">Upgrade plan</Link>`),
    },
  ],
  api: [
    {
      name: 'Link',
      description: 'An `<a>`; supports all of its props. Adds:',
      props: [
        { name: 'href', type: 'string', description: 'Destination.' },
        { name: 'variant', type: ['"inline"', '"accent"', '"subtle"'], default: '"inline"', description: 'Underlined inherited color, accent blue, or secondary text.' },
        { name: 'external', type: 'boolean', default: 'false', description: '`target="_blank"`, `rel="noreferrer"`, an arrow icon and “(opens in a new tab)” for screen readers.' },
        { name: 'asChild', type: 'boolean', default: 'false', description: 'Style your router’s link component instead of `<a>`.' },
      ],
    },
  ],
  sections: [
    a11y(['A native link: `Tab` focuses it, `Enter` follows it; the focus ring is drawn around the text.', 'External links announce that they open a new tab.', 'Link text should make sense on its own (“Pricing”, not “click here”).']),
    usage(['navigate to another page or site', 'inline references in text'], ['actions that change data (use Button)', 'a link styled as a button (use Button `asChild`)']),
  ],
};

const disclosureTogglePage: DocPage = {
  eyebrow,
  title: 'Disclosure Toggle',
  description: 'The ▸ triangle of toggle blocks and tree rows: rotates down when open.',
  hero: {
    title: 'Disclosure Toggle',
    render: () => <ToggleDemo />,
    code: snippet(['DisclosureToggle'], 'ToggleBlock', `<div className="flex items-center gap-0.5">\n  <DisclosureToggle open={open} onOpenChange={setOpen} aria-controls="notes" />\n  <span>Meeting notes</span>\n</div>\n{open && <div id="notes">Nested content</div>}`, {
      react: ['useState'],
      hooks: 'const [open, setOpen] = useState(true);',
    }),
  },
  install: install('DisclosureToggle', `<DisclosureToggle open onOpenChange={() => {}} />`),
  examples: [
    {
      title: 'Size',
      render: () => (
        <div className={row}>
          <DisclosureToggle size="sm" />
          <DisclosureToggle size="md" open />
        </div>
      ),
      code: snippet(['DisclosureToggle'], 'ToggleSizes', `<DisclosureToggle size="sm" />\n<DisclosureToggle size="md" open />`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <DisclosureToggle />
          <DisclosureToggle open />
        </Dark>
      ),
      code: darkCode(['DisclosureToggle'], 'ToggleDark', `<DisclosureToggle />\n<DisclosureToggle open />`),
    },
  ],
  api: [
    {
      name: 'DisclosureToggle',
      description: 'A `<button>`; supports all of its props. Adds:',
      props: [
        { name: 'open', type: 'boolean', default: 'false', description: 'Expanded state (controlled).' },
        { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called with the next state on click.' },
        { name: 'size', type: ['"sm"', '"md"'], default: '"md"', description: '20px or 24px button.' },
      ],
    },
  ],
  sections: [
    a11y(['A button with `aria-expanded` and the name “Open” / “Close”; `Enter` / `Space` toggle it. Point `aria-controls` at the content it shows.', '24×24 on touch screens.']),
    usage(['collapse nested content in trees and toggle blocks'], ['whole collapsible sections with a header (use Accordion)']),
  ],
};

const dragHandlePage: DocPage = {
  eyebrow,
  title: 'Drag Handle',
  description: 'The six-dot handle beside a block or row: drag to move, click to open the block menu.',
  hero: {
    title: 'Drag Handle',
    render: () => <DragHandle />,
    code: snippet(['DragHandle'], 'DragHandleDemo', `<DragHandle />`),
  },
  install: install('DragHandle', `<DragHandle onClick={() => {}} />`),
  examples: [
    {
      title: 'Size',
      render: () => (
        <div className={row}>
          <DragHandle size="sm" />
          <DragHandle size="md" />
        </div>
      ),
      code: snippet(['DragHandle'], 'DragHandleSizes', `<DragHandle size="sm" />\n<DragHandle size="md" />`),
    },
    {
      title: 'Dark theme',
      render: () => (
        <Dark>
          <DragHandle />
        </Dark>
      ),
      code: darkCode(['DragHandle'], 'DragHandleDark', `<DragHandle />`),
    },
  ],
  api: [
    {
      name: 'DragHandle',
      description: 'A `<button>` named “Drag to move, click to open menu”; supports all of its props. Adds:',
      props: [{ name: 'size', type: ['"sm"', '"md"'], default: '"md"', description: '16×20 or 18×24 (24×24 on touch screens).' }],
    },
  ],
  sections: [
    a11y(['A button: `Enter` / `Space` fire `onClick`, so open the block menu there and offer keyboard “Move up / down” items in it; dragging alone is not keyboard accessible.']),
    usage(['reorder blocks and rows, with a menu for keyboard users'], ['as the only way to reorder (always add menu actions)']),
  ],
};

/** Shared page helpers for the other pages this group owns (components.tsx, layout.tsx). */
export const docHelpers = { PKG, snippet, install, Dark, darkCode, a11y, usage, indent };

export const atomPages: Record<string, DocPage> = {
  'ui/checkbox': checkboxPage,
  'ui/radio-group': radioPage,
  'ui/switch': switchPage,
  'ui/text-input': textInputPage,
  'ui/textarea': textareaPage,
  'ui/search-input': searchInputPage,
  'ui/kbd': kbdPage,
  'ui/badge': badgePage,
  'ui/tag': tagPage,
  'ui/status-pill': statusPillPage,
  'ui/avatar': avatarPage,
  'ui/avatar-group': avatarGroupPage,
  'ui/page-icon': pageIconPage,
  'ui/divider': dividerPage,
  'ui/spinner': spinnerPage,
  'ui/placeholder': placeholderPage,
  'ui/tooltip': tooltipPage,
  'ui/link': linkPage,
  'ui/disclosure-toggle': disclosureTogglePage,
  'ui/drag-handle': dragHandlePage,
};

/** Nav groups for the "All Components" section (merged with the other groups by title). */
export const atomNav: NavGroup[] = [
  { title: 'Actions', items: [{ slug: 'ui/link' }, { slug: 'ui/disclosure-toggle' }, { slug: 'ui/drag-handle' }] },
  {
    title: 'Form',
    items: [
      { slug: 'ui/checkbox' },
      { slug: 'ui/radio-group' },
      { slug: 'ui/switch' },
      { slug: 'ui/text-input' },
      { slug: 'ui/textarea' },
      { slug: 'ui/search-input' },
    ],
  },
  {
    title: 'Displaying Data',
    items: [
      { slug: 'ui/avatar' },
      { slug: 'ui/avatar-group' },
      { slug: 'ui/badge' },
      { slug: 'ui/tag' },
      { slug: 'ui/status-pill' },
      { slug: 'ui/page-icon' },
      { slug: 'ui/kbd' },
    ],
  },
  { title: 'Feedback', items: [{ slug: 'ui/spinner' }, { slug: 'ui/placeholder' }] },
  { title: 'Overlays', items: [{ slug: 'ui/tooltip' }] },
];
