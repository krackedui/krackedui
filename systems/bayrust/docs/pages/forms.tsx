// Forms: the field wrapper, the text inputs, the choice controls and the slider.
import type { DocPage, NavGroup } from '../../../../apps/docs/lib/types';
import {
  Checkbox, Field, NumberInput, Radio, RadioGroup, SearchInput, SegmentedControl, Select, Slider,
  Stack, Switch, Textarea, TextInput,
} from '@krackedui/bayrust';
import { a11y, install, usage } from './helpers';

const fieldPage: DocPage = {
  eyebrow: 'Forms',
  title: 'Field',
  description: 'The wrapper that gives a control its label, its description and its error — and wires all three together.',
  hero: {
    title: 'Field',
    align: 'start',
    render: () => (
      <div style={{ width: '100%', maxWidth: 280 }}>
        <Field label="Workspace" description="Where the command runs.">
          <TextInput placeholder="Personal" />
        </Field>
      </div>
    ),
    code: `<Field label="Workspace" description="Where the command runs.">
  <TextInput placeholder="Personal" />
</Field>`,
  },
  install,
  sections: [
    usage([
      'Every control a user types into belongs in a `Field`. A bare input with a `<p>` above it is not labelled.',
      '`hideLabel` keeps the label for assistive tech while removing it visually — for a search box whose purpose is obvious.',
    ]),
    a11y([
      'Generates the control’s id and points the label at it, so a click on the label focuses the control.',
      '`description` and `error` are both joined into `aria-describedby`, so both are read.',
      '`error` also sets `aria-invalid` on the control.',
      '`required` marks the control required rather than only drawing an asterisk.',
    ]),
  ],
  examples: [
    {
      title: 'With an error',
      align: 'start',
      render: () => (
        <div style={{ width: '100%', maxWidth: 280 }}>
          <Field label="Name" error="Pick a name that is not taken." required>
            <TextInput defaultValue="clipboard" />
          </Field>
        </div>
      ),
      code: `<Field label="Name" error="Pick a name that is not taken." required>
  <TextInput defaultValue="clipboard" />
</Field>`,
    },
  ],
  api: [
    {
      name: 'Field',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Required.' },
        { name: 'description', type: 'ReactNode' },
        { name: 'error', type: 'ReactNode', description: 'Sets aria-invalid and is announced.' },
        { name: 'required', type: 'boolean' },
        { name: 'hideLabel', type: 'boolean', description: 'Visually hidden, still announced.' },
      ],
    },
  ],
};

const inputPage: DocPage = {
  eyebrow: 'Forms',
  title: 'Text inputs',
  description: 'TextInput, Textarea, SearchInput and NumberInput.',
  hero: {
    title: 'Text inputs',
    align: 'start',
    render: () => (
      <Stack gap={10} style={{ width: '100%', maxWidth: 280 }}>
        <TextInput aria-label="Name" placeholder="Snippet name" />
        <SearchInput aria-label="Search" placeholder="Search commands…" />
        <NumberInput aria-label="Delay" defaultValue={200} step={50} />
        <Textarea aria-label="Body" placeholder="Expansion…" rows={3} />
      </Stack>
    ),
    code: `<Stack gap={10} style={{ width: '100%', maxWidth: 280 }}>
  <TextInput aria-label="Name" placeholder="Snippet name" />
  <SearchInput aria-label="Search" placeholder="Search commands…" />
  <NumberInput aria-label="Delay" defaultValue={200} step={50} />
  <Textarea aria-label="Body" placeholder="Expansion…" rows={3} />
</Stack>`,
  },
  install,
  sections: [
    a11y([
      '`NumberInput` is a `spinbutton`: ArrowUp and ArrowDown step by `step`, and it reports `aria-valuenow`.',
      '`SearchInput` clears with its own button, which has a name; `onClear` tells you when.',
      'A placeholder is never a label. Wrap the control in a `Field`, or give it an `aria-label`.',
    ]),
  ],
  examples: [
    {
      title: 'With a leading icon',
      align: 'start',
      render: () => (
        <div style={{ width: '100%', maxWidth: 280 }}>
          <TextInput aria-label="Website" icon="globe" placeholder="example.com" />
        </div>
      ),
      code: `<TextInput aria-label="Website" icon="globe" placeholder="example.com" />`,
    },
    {
      title: 'Sizes',
      align: 'start',
      render: () => (
        <Stack gap={8} style={{ width: '100%', maxWidth: 280 }}>
          <TextInput aria-label="Small" size="sm" placeholder="Small" />
          <TextInput aria-label="Medium" size="md" placeholder="Medium" />
          <TextInput aria-label="Large" size="lg" placeholder="Large" />
        </Stack>
      ),
      code: `<Stack gap={8} style={{ width: '100%', maxWidth: 280 }}>
  <TextInput aria-label="Small" size="sm" placeholder="Small" />
  <TextInput aria-label="Medium" size="md" placeholder="Medium" />
  <TextInput aria-label="Large" size="lg" placeholder="Large" />
</Stack>`,
    },
  ],
  api: [
    {
      name: 'TextInput',
      props: [
        { name: 'size', type: ['"sm"', '"md"', '"lg"'], default: '"md"' },
        { name: 'type', type: ['"text"', '"email"', '"password"', '"url"', '"tel"', '"number"', '"search"'], default: '"text"' },
        { name: 'icon', type: 'IconName', description: 'Leading icon.' },
        { name: 'trailing', type: 'ReactNode', description: 'Content pinned to the right inside the control.' },
        { name: 'invalid', type: 'boolean' },
      ],
    },
    { name: 'SearchInput', props: [{ name: 'onClear', type: '() => void', description: 'Called by the clear button.' }, { name: 'size', type: ['"sm"', '"md"', '"lg"'] }] },
    { name: 'NumberInput', props: [{ name: 'step', type: 'number', default: '1' }, { name: 'min', type: 'number' }, { name: 'max', type: 'number' }] },
  ],
};

const choicePage: DocPage = {
  eyebrow: 'Forms',
  title: 'Choice controls',
  description: 'Checkbox, RadioGroup, Switch, SegmentedControl and Select.',
  hero: {
    title: 'Choice controls',
    align: 'start',
    render: () => (
      <Stack gap={12} style={{ width: '100%', maxWidth: 280 }}>
        <Checkbox label="Launch at login" defaultChecked />
        <Switch label="Use the menu bar icon" defaultChecked />
        <RadioGroup aria-label="Appearance" defaultValue="dark">
          <Radio value="dark" label="Dark" />
          <Radio value="light" label="Light" />
        </RadioGroup>
      </Stack>
    ),
    code: `<Stack gap={12} style={{ width: '100%', maxWidth: 280 }}>
  <Checkbox label="Launch at login" defaultChecked />
  <Switch label="Use the menu bar icon" defaultChecked />
  <RadioGroup aria-label="Appearance" defaultValue="dark">
    <Radio value="dark" label="Dark" />
    <Radio value="light" label="Light" />
  </RadioGroup>
</Stack>`,
  },
  install,
  sections: [
    usage([
      'A `Switch` takes effect immediately. A `Checkbox` is a value you submit. That is the whole difference.',
      '`SegmentedControl` is for two to four options that fit on one line; past that, use `Select`.',
    ]),
    a11y([
      'A tri-state checkbox reports `aria-checked="mixed"` and sets the DOM `indeterminate` property.',
      '`Switch` has the `switch` role, so it is announced as on or off rather than checked.',
      '`Select` is the platform’s own `<select>`: its listbox, keyboard handling and mobile picker come free.',
    ]),
  ],
  examples: [
    {
      title: 'Indeterminate',
      align: 'start',
      render: () => <Checkbox label="Some commands enabled" checked="indeterminate" />,
      code: `<Checkbox label="Some commands enabled" checked="indeterminate" />`,
    },
    {
      title: 'Segmented control',
      align: 'start',
      render: () => (
        <SegmentedControl
          aria-label="View"
          defaultValue="list"
          options={[
            { value: 'list', label: 'List' },
            { value: 'grid', label: 'Grid' },
          ]}
        />
      ),
      code: `<SegmentedControl
  aria-label="View"
  defaultValue="list"
  options={[
    { value: 'list', label: 'List' },
    { value: 'grid', label: 'Grid' },
  ]}
/>`,
    },
    {
      title: 'Select',
      align: 'start',
      render: () => (
        <div style={{ width: '100%', maxWidth: 280 }}>
          <Field label="Window mode">
            <Select
              options={[
                { value: 'compact', label: 'Compact' },
                { value: 'full', label: 'Full' },
              ]}
              defaultValue="compact"
            />
          </Field>
        </div>
      ),
      code: `<Field label="Window mode">
  <Select
    options={[
      { value: 'compact', label: 'Compact' },
      { value: 'full', label: 'Full' },
    ]}
    defaultValue="compact"
  />
</Field>`,
    },
  ],
  api: [
    { name: 'Checkbox', props: [{ name: 'checked', type: 'boolean | "indeterminate"' }, { name: 'defaultChecked', type: 'boolean' }, { name: 'onCheckedChange', type: '(checked: boolean) => void' }, { name: 'label', type: 'ReactNode' }] },
    { name: 'Switch', props: [{ name: 'checked', type: 'boolean' }, { name: 'onCheckedChange', type: '(checked: boolean) => void' }, { name: 'label', type: 'ReactNode' }, { name: 'size', type: ['"sm"', '"md"'] }] },
    { name: 'Select', props: [{ name: 'options', type: 'Option[]', description: 'Required.' }, { name: 'value', type: 'string' }, { name: 'onValueChange', type: '(value: string) => void' }, { name: 'placeholder', type: 'string' }] },
  ],
};

const sliderPage: DocPage = {
  eyebrow: 'Forms',
  title: 'Slider',
  description: 'One thumb for a value, two for a range. Each thumb is a real range input, so the keyboard works.',
  hero: {
    title: 'Slider',
    align: 'start',
    render: () => (
      <Stack gap={16} style={{ width: '100%', maxWidth: 280 }}>
        <Slider label="Opacity" defaultValue={[60]} />
        <Slider label="Range" defaultValue={[20, 70]} />
      </Stack>
    ),
    code: `<Stack gap={16} style={{ width: '100%', maxWidth: 280 }}>
  <Slider label="Opacity" defaultValue={[60]} />
  <Slider label="Range" defaultValue={[20, 70]} />
</Stack>`,
  },
  install,
  sections: [
    a11y([
      'Each thumb is an `<input type="range">`, so it gets the `slider` role, arrow keys, Home and End, and a live announcement for free.',
      'A range keeps its thumbs ordered: pushing the lower one past the upper clamps it instead of crossing over.',
    ]),
  ],
  api: [
    {
      name: 'Slider',
      props: [
        { name: 'value', type: 'number[]', description: 'One entry for a value, two for a range.' },
        { name: 'defaultValue', type: 'number[]' },
        { name: 'onValueChange', type: '(value: number[]) => void' },
        { name: 'min', type: 'number', default: '0' },
        { name: 'max', type: 'number', default: '100' },
        { name: 'step', type: 'number', default: '1' },
        { name: 'label', type: 'string' },
      ],
    },
  ],
};

export const formPages: Record<string, DocPage> = {
  field: fieldPage,
  'text-inputs': inputPage,
  'choice-controls': choicePage,
  slider: sliderPage,
};

export const formNav: NavGroup = {
  title: 'Forms',
  items: [{ slug: 'field' }, { slug: 'text-inputs' }, { slug: 'choice-controls' }, { slug: 'slider' }],
};
