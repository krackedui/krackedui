// Docs pages for the forms group: Field, Select, Combobox, NumberInput, Slider, SegmentedControl, Calendar,
// DatePicker, DateRangePicker, FileUpload, plus the "Form patterns" page. Live previews import from the package.
import { useState, type FormEvent, type ReactNode } from 'react';
import {
  Button,
  Calendar,
  Checkbox,
  Combobox,
  DatePicker,
  DateMenu,
  DateRangePicker,
  Field,
  FileUpload,
  NumberInput,
  PopoverSurface,
  SegmentedControl,
  Select,
  Slider,
  Switch,
  TextInput,
  Textarea,
  Theme,
  type DateRange,
} from '@krackedui/motion';
import type { DocPage, Example, InstallStep, NavGroup, PropDef, Section } from '../../../../apps/docs/lib/types';

/* ------------------------------------------------------------------ helpers */

const eyebrow = 'Form';
/** Fixed "today" so previews and screenshots are stable. */
const TODAY = new Date(2026, 9, 21);
const col = 'flex w-full max-w-80 flex-col gap-4';

function install(names: string, usage: string): InstallStep[] {
  return [
    { title: 'Install the design system package:', packages: ['@krackedui/motion'] },
    {
      title: 'Import the styles once and render inside `<Theme>` (use `appearance="dark"` or `"system"` for other themes):',
      file: { filename: '/app/page.tsx', lang: 'tsx', code: `import { ${names} } from '@krackedui/motion';\n\n${usage}` },
    },
  ];
}
const a11y = (items: string[]): Section => ({ title: 'Accessibility', blocks: [{ list: items }] });
const usage = (items: string[]): Section => ({ title: 'Usage', blocks: [{ list: items }] });
const example = (title: string, render: () => ReactNode, code: string, extra?: Partial<Example>): Example => ({ title, render, code, ...extra });

/** Dark-theme preview frame: a nested `<Theme appearance="dark">`, exactly like the example code. */
function Dark({ children }: { children: ReactNode }) {
  return <Theme appearance="dark" className="flex w-full flex-col items-center gap-4 rounded-n-lg p-6">{children}</Theme>;
}

// Props shared by most controls.
const p = {
  invalid: { name: 'invalid', type: 'boolean', default: 'false', description: 'Red ring and `aria-invalid`. Set automatically inside a Field with an `error`.' },
  disabled: { name: 'disabled', type: 'boolean', default: 'false', description: 'Blocks interaction and dims the control (from Field too).' },
  required: { name: 'required', type: 'boolean', default: 'false', description: 'Sets `aria-required` / native `required` (from Field too).' },
  name: { name: 'name', type: 'string', description: 'Form field name for native form submission.' },
  id: { name: 'id', type: 'string', description: 'Control id. Inside a Field it defaults to the id the label points at.' },
  className: { name: 'className', type: 'string', description: 'Merged onto the root with `cn`.' },
  style: { name: 'style', type: 'CSSProperties', description: 'Inline styles on the root.' },
  ariaLabel: { name: 'aria-label', type: 'string', description: 'Accessible name when there is no Field around it.' },
  ariaLabelledBy: { name: 'aria-labelledby', type: 'string', description: 'Id(s) of the element(s) naming the control.' },
  ariaDescribedBy: { name: 'aria-describedby', type: 'string', description: 'Extra description ids, merged with the Field description and error.' },
  size: { name: 'size', type: ['"sm"', '"md"', '"lg"'], default: '"md"', description: '24, 28 or 32px tall, like TextInput.' },
  open: { name: 'open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open: boolean) => void', description: 'Controlled or uncontrolled popover state.' },
  locale: { name: 'locale', type: 'string', default: '"en-US"', description: 'BCP 47 locale for month/weekday names and the date format.' },
  weekStartsOn: { name: 'weekStartsOn', type: ['0', '1'], default: '0', description: '0 = Sunday, 1 = Monday.' },
  today: { name: 'today', type: 'Date', default: 'new Date()', description: '"Today" for the marker; pass a fixed date for static renders.' },
} satisfies Record<string, PropDef>;

/* ================================================================== Field */

function FieldErrorDemo() {
  const [email, setEmail] = useState('ada@');
  const error = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? undefined : 'Enter an email like name@company.com.';
  return (
    <Field className="w-full max-w-80" label="Work email" description="We send the invite here." error={error} required>
      <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
    </Field>
  );
}

const fieldPage: DocPage = {
  eyebrow,
  title: 'Field',
  description: 'Label, description and error around one control. It wires `id`, `aria-describedby`, `aria-invalid` and `aria-required` into the control, so every input in a form is announced correctly.',
  hero: {
    title: 'Field',
    render: () => (
      <Field className="w-full max-w-80" label="Workspace name" description="Shown in the sidebar and in invites.">
        <TextInput defaultValue="Design Team" />
      </Field>
    ),
    code: `import { Field, TextInput } from '@krackedui/motion';

export function WorkspaceNameField() {
  return (
    <Field label="Workspace name" description="Shown in the sidebar and in invites.">
      <TextInput defaultValue="Design Team" />
    </Field>
  );
}`,
  },
  install: install('Field, TextInput', `<Field label="Email" description="We never share it.">\n  <TextInput type="email" />\n</Field>`),
  examples: [
    example('Error', () => <FieldErrorDemo />, `import { useState } from 'react';
import { Field, TextInput } from '@krackedui/motion';

export function EmailField() {
  const [email, setEmail] = useState('ada@');
  const error = /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email) ? undefined : 'Enter an email like name@company.com.';
  return (
    <Field label="Work email" description="We send the invite here." error={error} required>
      <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
    </Field>
  );
}`, { description: 'Passing `error` marks the control invalid (red ring, `aria-invalid`) and adds the message to its description. The message is announced politely when it appears.' }),
    example('Any control', () => (
      <div className={col}>
        <Field label="Plan"><Select options={[{ value: 'free', label: 'Free' }, { value: 'plus', label: 'Plus' }]} defaultValue="plus" /></Field>
        <Field label="Seats" description="Billed monthly."><NumberInput defaultValue={5} min={1} stepper /></Field>
        <Field label="Notes"><Textarea rows={2} placeholder="Anything we should know?" /></Field>
      </div>
    ), `import { Field, NumberInput, Select, Textarea } from '@krackedui/motion';

export function PlanFields() {
  return (
    <>
      <Field label="Plan">
        <Select options={[{ value: 'free', label: 'Free' }, { value: 'plus', label: 'Plus' }]} defaultValue="plus" />
      </Field>
      <Field label="Seats" description="Billed monthly.">
        <NumberInput defaultValue={5} min={1} stepper />
      </Field>
      <Field label="Notes">
        <Textarea rows={2} placeholder="Anything we should know?" />
      </Field>
    </>
  );
}`, { description: 'Every control in the package reads the Field. Other elements (a plain `<input>`, a third-party control) get the same props cloned in.' }),
    example('Hidden label', () => (
      <Field className="w-full max-w-80" label="Search members" hideLabel><TextInput icon="search" placeholder="Search members" /></Field>
    ), `import { Field, TextInput } from '@krackedui/motion';

export function MemberSearch() {
  return (
    <Field label="Search members" hideLabel>
      <TextInput icon="search" placeholder="Search members" />
    </Field>
  );
}`, { description: '`hideLabel` keeps the label as the accessible name but hides it visually; use it only when the purpose is obvious from context.' }),
    example('Disabled', () => (
      <Field className="w-full max-w-80" label="Workspace URL" description="Contact an owner to change it." disabled>
        <TextInput defaultValue="motion.so/design" />
      </Field>
    ), `import { Field, TextInput } from '@krackedui/motion';

export function LockedField() {
  return (
    <Field label="Workspace URL" description="Contact an owner to change it." disabled>
      <TextInput defaultValue="motion.so/design" />
    </Field>
  );
}`),
    example('Dark theme', () => (
      <Dark><Field className="w-full max-w-80" label="Name" error="Name is required." required><TextInput /></Field></Dark>
    ), `import { Field, TextInput, Theme } from '@krackedui/motion';

export function DarkField() {
  return (
    <Theme appearance="dark" className="flex flex-col gap-4 rounded-n-lg p-4">
      <Field label="Name" error="Name is required." required>
        <TextInput />
      </Field>
    </Theme>
  );
}`),
  ],
  api: [
    {
      name: 'Field',
      description: 'A `<div>` (all its props are passed through). Adds:',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Visible label; the control’s accessible name. Required.' },
        { name: 'description', type: 'ReactNode', description: 'Help text under the label, linked with `aria-describedby`.' },
        { name: 'error', type: 'ReactNode', description: 'Error message. Its presence marks the control invalid.' },
        { name: 'required', type: 'boolean', default: 'false', description: 'Adds `aria-required` and a red asterisk.' },
        { name: 'hideLabel', type: 'boolean', default: 'false', description: 'Visually hide the label (still announced).' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control and dims the label.' },
        { name: 'htmlFor', type: 'string', description: 'Use your own control id instead of a generated one.' },
        { name: 'children', type: 'ReactNode', description: 'One control: a Motion control or a native input / select / textarea, directly or inside a layout wrapper.' },
      ],
    },
    {
      name: 'Helpers',
      description: 'For building your own controls that work inside a Field.',
      props: [
        { name: 'useFieldProps(props)', type: '(props) => props', description: 'Merges the Field into a control’s props: `id`, `aria-describedby`, `aria-invalid`, `aria-required`, `invalid`, `required`, `disabled`. Explicit props win.' },
        { name: 'useFieldControl()', type: 'FieldContextValue | null', description: 'The raw wiring (`controlId`, `labelId`, `descriptionId`, `errorId`, `invalid`, `required`, `disabled`), e.g. for `aria-labelledby`.' },
        { name: 'fieldVariants', type: 'tv recipe', description: 'Slots: root, label, required, description, error.' },
      ],
    },
  ],
  sections: [
    a11y([
      'The `<label>` points at the control (`htmlFor`); controls that aren’t labelable (slider thumbs, radio groups, date triggers) use `aria-labelledby` with the label id instead.',
      'Description and error are linked with `aria-describedby`, in that order; the error id is only included while there is an error.',
      'The error sits in an `aria-live="polite"` region, so it is announced when it appears, without stealing focus.',
      'The required asterisk is `aria-hidden`; the control carries `aria-required` instead.',
    ]),
    usage([
      'Do wrap every form control in a Field: it is the only way to get the label, description and error wired correctly.',
      'Do write errors that say how to fix the value ("Enter an email like name@company.com"), not just "Invalid".',
      'Do show errors after the person leaves the field or submits, not on every keystroke.',
      'Don’t use the placeholder as the label; use `hideLabel` only when the purpose is obvious.',
      'Don’t put several controls in one Field; for a group of checkboxes use a fieldset with a legend.',
      'What works as the child: any Motion form control (TextInput, Textarea, SearchInput, NumberInput, Select, Combobox, Checkbox, Switch, RadioGroup, Slider, SegmentedControl, Calendar, DatePicker, DateRangePicker, FileUpload) or a native input / select / textarea, directly or inside a wrapper `<div>`; the label finds it.',
      'Don’t put a Menu (or a Popover with buttons) in a Field to pick a value: menus are for actions. Use Select for a short list and Combobox for a long or searchable one.',
      'For a custom control, pass `htmlFor` and give your control the same `id` (or build it with `useFieldProps`). In development, Field warns in the console when its label names no control.',
    ]),
  ],
};

/* ================================================================== Select */

const plans = [
  { value: 'free', label: 'Free', description: 'For individuals' },
  { value: 'plus', label: 'Plus', description: 'For small teams' },
  { value: 'business', label: 'Business', description: 'SSO and advanced permissions' },
  { value: 'enterprise', label: 'Enterprise', description: 'Contact sales', disabled: true },
];

function SelectControlledDemo() {
  const [role, setRole] = useState('member');
  return (
    <div className={col}>
      <Field label="Role">
        <Select value={role} onValueChange={setRole} options={[{ value: 'owner', label: 'Workspace owner' }, { value: 'member', label: 'Member' }, { value: 'guest', label: 'Guest' }]} />
      </Field>
      <p className="text-[12px] text-n-text-secondary">Selected: {role}</p>
    </div>
  );
}

function CategoryFilterDemo() {
  const [category, setCategory] = useState('');
  return (
    <Select
      aria-label="Category"
      className="max-w-60"
      options={[{ value: '', label: 'All categories' }, { value: 'food', label: 'Food & drink' }, { value: 'travel', label: 'Travel' }, { value: 'bills', label: 'Bills' }]}
      value={category}
      onValueChange={setCategory}
    />
  );
}

const selectPage: DocPage = {
  eyebrow,
  title: 'Select',
  description: 'Pick one option from a short list. The trigger looks like a text field; the list is a Motion menu with a check on the selected row and typeahead.',
  hero: {
    title: 'Select',
    render: () => <Field className="w-full max-w-80" label="Plan"><Select options={plans} placeholder="Choose a plan" /></Field>,
    code: `import { Field, Select } from '@krackedui/motion';

const plans = [
  { value: 'free', label: 'Free', description: 'For individuals' },
  { value: 'plus', label: 'Plus', description: 'For small teams' },
  { value: 'business', label: 'Business', description: 'SSO and advanced permissions' },
  { value: 'enterprise', label: 'Enterprise', description: 'Contact sales', disabled: true },
];

export function PlanSelect() {
  return (
    <Field label="Plan">
      <Select options={plans} placeholder="Choose a plan" />
    </Field>
  );
}`,
  },
  install: install('Select', `<Select aria-label="Plan" options={[{ value: 'free', label: 'Free' }, { value: 'plus', label: 'Plus' }]} />`),
  examples: [
    example('Controlled', () => <SelectControlledDemo />, `import { useState } from 'react';
import { Field, Select } from '@krackedui/motion';

export function RoleSelect() {
  const [role, setRole] = useState('member');
  return (
    <Field label="Role">
      <Select
        value={role}
        onValueChange={setRole}
        options={[
          { value: 'owner', label: 'Workspace owner' },
          { value: 'member', label: 'Member' },
          { value: 'guest', label: 'Guest' },
        ]}
      />
    </Field>
  );
}`),
    example('"All" option (empty value)', () => <CategoryFilterDemo />, `import { useState } from 'react';
import { Select } from '@krackedui/motion';

const categories = [
  { value: '', label: 'All categories' },
  { value: 'food', label: 'Food & drink' },
  { value: 'travel', label: 'Travel' },
  { value: 'bills', label: 'Bills' },
];

export function CategoryFilter() {
  const [category, setCategory] = useState('');
  return <Select aria-label="Category" className="max-w-60" options={categories} value={category} onValueChange={setCategory} />;
}`, { description: 'An option with `value: \'\'` works as "no filter": `value=""` shows it and picking it reports `\'\'`.' }),
    example('With icons', () => (
      <Field className="w-full max-w-80" label="Default view">
        <Select defaultValue="board" options={[{ value: 'table', label: 'Table', icon: 'table' }, { value: 'board', label: 'Board', icon: 'board' }, { value: 'timeline', label: 'Timeline', icon: 'timeline' }]} />
      </Field>
    ), `import { Field, Select } from '@krackedui/motion';

export function ViewSelect() {
  return (
    <Field label="Default view">
      <Select
        defaultValue="board"
        options={[
          { value: 'table', label: 'Table', icon: 'table' },
          { value: 'board', label: 'Board', icon: 'board' },
          { value: 'timeline', label: 'Timeline', icon: 'timeline' },
        ]}
      />
    </Field>
  );
}`),
    example('Sizes', () => (
      <div className={col}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Select key={size} size={size} aria-label={`Size ${size}`} defaultValue="plus" options={plans} />
        ))}
      </div>
    ), `import { Select } from '@krackedui/motion';

const options = [{ value: 'free', label: 'Free' }, { value: 'plus', label: 'Plus' }];

export function SelectSizes() {
  return (
    <>
      <Select size="sm" aria-label="Small" defaultValue="plus" options={options} />
      <Select size="md" aria-label="Medium" defaultValue="plus" options={options} />
      <Select size="lg" aria-label="Large" defaultValue="plus" options={options} />
    </>
  );
}`),
    example('Invalid and disabled', () => (
      <div className={col}>
        <Field label="Region" error="Choose where your data is stored."><Select options={[{ value: 'eu', label: 'Europe' }, { value: 'us', label: 'United States' }]} placeholder="Choose a region" /></Field>
        <Field label="Billing currency" disabled><Select defaultValue="usd" options={[{ value: 'usd', label: 'US dollar' }]} /></Field>
      </div>
    ), `import { Field, Select } from '@krackedui/motion';

export function SelectStates() {
  return (
    <>
      <Field label="Region" error="Choose where your data is stored.">
        <Select options={[{ value: 'eu', label: 'Europe' }, { value: 'us', label: 'United States' }]} placeholder="Choose a region" />
      </Field>
      <Field label="Billing currency" disabled>
        <Select defaultValue="usd" options={[{ value: 'usd', label: 'US dollar' }]} />
      </Field>
    </>
  );
}`),
    example('Dark theme', () => <Dark><Select aria-label="Plan" className="max-w-80" defaultValue="plus" options={plans} /></Dark>, `import { Select, Theme } from '@krackedui/motion';

export function DarkSelect() {
  return (
    <Theme appearance="dark" className="flex flex-col gap-4 rounded-n-lg p-4">
      <Select aria-label="Plan" defaultValue="plus" options={[{ value: 'free', label: 'Free' }, { value: 'plus', label: 'Plus' }]} />
    </Theme>
  );
}`),
  ],
  api: [
    {
      name: 'Select',
      description: 'Radix Select. The ref goes to the trigger `<button>`.',
      props: [
        { name: 'options', type: 'ControlOption[]', description: '`{ value, label, icon?, description?, disabled?, textValue? }`. Required. One option may use `value: \'\'` ("All categories", "None"): it is selectable, shows for `value=""`, and reports `\'\'`.' },
        { name: 'value / defaultValue', type: 'string', description: 'Controlled / initial value.' },
        { name: 'onValueChange', type: '(value: string) => void', description: 'Called when an option is picked.' },
        { name: 'placeholder', type: 'string', default: '"Select…"', description: 'Trigger text with no value.' },
        p.size, p.invalid, p.disabled, p.required, p.name,
        { name: 'open', type: 'boolean', description: 'Controlled open state.' },
        { name: 'defaultOpen', type: 'boolean', description: 'Initially open.' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
        p.id, p.className, p.style,
        { name: 'contentClassName', type: 'string', description: 'Class for the floating list.' },
        p.ariaLabel, p.ariaLabelledBy, p.ariaDescribedBy,
      ],
    },
  ],
  sections: [
    a11y([
      'WAI-ARIA listbox (select-only combobox): the trigger is `role="combobox"` with `aria-expanded`; the list is `role="listbox"` with `option`s and `aria-selected`.',
      '`Enter`, `Space`, `↓` or `↑` open the list; `↑` / `↓` move; typing jumps to the first match (typeahead); `Enter` selects; `Escape` closes. Focus returns to the trigger.',
      'Disabled options are skipped and marked `aria-disabled`.',
      'With `name`, a hidden native `<select>` takes part in form submission and validation.',
    ]),
    usage([
      'Use for 3–15 known options where only one can be picked.',
      'Use Combobox for long lists (countries, people) where searching beats scrolling.',
      'Use SegmentedControl or RadioGroup for 2–5 options that should stay visible.',
      'Don’t use it for actions; that’s a Menu.',
    ]),
  ],
};

/* ================================================================== Combobox */

const countries = ['Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'Denmark', 'Finland', 'France', 'Germany', 'Ghana', 'Greece', 'India', 'Ireland', 'Italy', 'Japan', 'Kenya', 'Mexico', 'Netherlands', 'Nigeria', 'Norway', 'Portugal', 'Rwanda', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom', 'United States']
  .map((c) => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c }));

function ComboboxDemo() {
  const [country, setCountry] = useState('');
  return (
    <Field className="w-full max-w-80" label="Country" description={country ? `Selected: ${country}` : 'Where your company is registered.'}>
      <Combobox options={countries} value={country} onValueChange={setCountry} placeholder="Choose a country" searchPlaceholder="Search countries" emptyText="No country matches" />
    </Field>
  );
}

const labelOptions = ['Bug', 'Feature', 'Design', 'Docs', 'Research'].map((l) => ({ value: l.toLowerCase(), label: l }));
function LabelsDemo() {
  const [value, setValue] = useState<string[]>(['bug', 'design']);
  return (
    <Field className="w-full max-w-80" label="Labels" description="Pick all that apply.">
      <Combobox multiple options={labelOptions} value={value} onValueChange={setValue} placeholder="Add labels" searchPlaceholder="Search labels" />
    </Field>
  );
}

const comboboxPage: DocPage = {
  eyebrow,
  title: 'Combobox',
  description: 'A searchable select for long lists, single or `multiple`. The trigger matches Select; the popover has a search field above a filtered list. Type to filter, arrows to move, Enter to pick.',
  hero: {
    title: 'Combobox',
    render: () => <ComboboxDemo />,
    code: `import { useState } from 'react';
import { Combobox, Field } from '@krackedui/motion';

const countries = ['Argentina', 'Australia', 'Belgium', 'Brazil', 'Canada', 'France', 'Germany', 'Ghana', 'Rwanda']
  .map((c) => ({ value: c.toLowerCase(), label: c }));

export function CountryField() {
  const [country, setCountry] = useState('');
  return (
    <Field label="Country" description="Where your company is registered.">
      <Combobox
        options={countries}
        value={country}
        onValueChange={setCountry}
        placeholder="Choose a country"
        searchPlaceholder="Search countries"
        emptyText="No country matches"
      />
    </Field>
  );
}`,
  },
  install: install('Combobox', `<Combobox aria-label="Owner" options={[{ value: 'ada', label: 'Ada Lovelace' }, { value: 'alan', label: 'Alan Turing' }]} />`),
  examples: [
    example('People', () => (
      <Field className="w-full max-w-80" label="Assignee">
        <Combobox defaultValue="grace" searchPlaceholder="Search people" options={[
          { value: 'ada', label: 'Ada Lovelace', icon: 'user', description: 'Engineering' },
          { value: 'alan', label: 'Alan Turing', icon: 'user', description: 'Research' },
          { value: 'grace', label: 'Grace Hopper', icon: 'user', description: 'Platform' },
          { value: 'katherine', label: 'Katherine Johnson', icon: 'user', description: 'Data' },
        ]} />
      </Field>
    ), `import { Combobox, Field } from '@krackedui/motion';

export function AssigneeField() {
  return (
    <Field label="Assignee">
      <Combobox
        defaultValue="grace"
        searchPlaceholder="Search people"
        options={[
          { value: 'ada', label: 'Ada Lovelace', icon: 'user', description: 'Engineering' },
          { value: 'alan', label: 'Alan Turing', icon: 'user', description: 'Research' },
          { value: 'grace', label: 'Grace Hopper', icon: 'user', description: 'Platform' },
          { value: 'katherine', label: 'Katherine Johnson', icon: 'user', description: 'Data' },
        ]}
      />
    </Field>
  );
}`, { description: 'Options can carry an icon and a second line. Filtering matches the label text, ignoring case and accents.' }),
    example('Invalid and disabled', () => (
      <div className={col}>
        <Field label="Project" error="Pick a project to file this under."><Combobox options={countries.slice(0, 5)} placeholder="Choose a project" /></Field>
        <Field label="Team" disabled><Combobox options={countries.slice(0, 5)} defaultValue="austria" /></Field>
      </div>
    ), `import { Combobox, Field } from '@krackedui/motion';

const projects = [{ value: 'web', label: 'Website' }, { value: 'app', label: 'Mobile app' }];

export function ComboboxStates() {
  return (
    <>
      <Field label="Project" error="Pick a project to file this under.">
        <Combobox options={projects} placeholder="Choose a project" />
      </Field>
      <Field label="Team" disabled>
        <Combobox options={projects} defaultValue="web" />
      </Field>
    </>
  );
}`),
    example('Multiple', () => <LabelsDemo />, `import { useState } from 'react';
import { Combobox, Field } from '@krackedui/motion';

const labels = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'design', label: 'Design' },
  { value: 'docs', label: 'Docs' },
  { value: 'research', label: 'Research' },
];

export function LabelsField() {
  const [value, setValue] = useState<string[]>(['bug', 'design']);
  return (
    <Field label="Labels" description="Pick all that apply.">
      <Combobox multiple options={labels} value={value} onValueChange={setValue} placeholder="Add labels" searchPlaceholder="Search labels" />
    </Field>
  );
}`, { description: '`multiple` (Motion extra): `value` is a `string[]`, chips show the selection, Enter or a click toggles an option and keeps the list open, Backspace in the empty search removes the last one.' }),
    example('Dark theme', () => <Dark><Combobox aria-label="Country" className="max-w-80" options={countries} defaultValue="rwanda" /></Dark>, `import { Combobox, Theme } from '@krackedui/motion';

export function DarkCombobox() {
  return (
    <Theme appearance="dark" className="flex flex-col gap-4 rounded-n-lg p-4">
      <Combobox aria-label="Country" options={[{ value: 'rw', label: 'Rwanda' }, { value: 'gh', label: 'Ghana' }]} defaultValue="rw" />
    </Theme>
  );
}`),
  ],
  api: [
    {
      name: 'Combobox',
      description: 'The ref goes to the trigger `<button>`.',
      props: [
        { name: 'options', type: 'ControlOption[]', description: 'Same shape as Select options. Required.' },
        { name: 'multiple', type: 'boolean', default: 'false', description: 'Motion extra: pick several values. Changes `value` / `defaultValue` to `string[]` and `onValueChange` to `(value: string[]) => void`.' },
        { name: 'value / defaultValue', type: ['string', 'string[]'], description: 'Controlled / initial value (`string[]` with `multiple`).' },
        { name: 'onValueChange', type: ['(value: string) => void', '(value: string[]) => void'], description: 'Called with the new value (the full list with `multiple`).' },
        { name: 'placeholder', type: 'string', default: '"Select…"', description: 'Trigger text with no value.' },
        { name: 'searchPlaceholder', type: 'string', default: '"Search…"', description: 'Search field placeholder and accessible name.' },
        { name: 'emptyText', type: 'ReactNode', default: '"No results"', description: 'Shown when nothing matches.' },
        { name: 'filter', type: '(option, query) => boolean', description: 'Custom matcher. Default: case/accent-insensitive "contains".' },
        p.size, p.invalid, p.disabled, p.required, p.name,
        { name: 'open', type: 'boolean', description: 'Controlled open state.' },
        { name: 'defaultOpen', type: 'boolean' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
        p.id, p.className, p.style,
        { name: 'contentClassName', type: 'string', description: 'Class for the popover.' },
        p.ariaLabel, p.ariaLabelledBy, p.ariaDescribedBy,
      ],
    },
  ],
  sections: [
    a11y([
      'The trigger is a button with `aria-haspopup="dialog"` and `aria-expanded`; opening moves focus into the search field. It differs from Select on purpose (APG): Select\'s trigger is a select-only `combobox` because its popup is the listbox itself, while here the popup holds its own `combobox` search field, and two nested comboboxes would be ambiguous. The current value is the trigger\'s description, so it is announced after the label.',
      'The search field is `role="combobox"` with `aria-autocomplete="list"`, `aria-controls` (the listbox) and `aria-activedescendant` (the highlighted option), so focus stays in the field while arrows move.',
      '`↓` / `↑` move (wrapping, skipping disabled), `Page Up/Down` jump 10, `Enter` picks, `Escape` closes; focus returns to the trigger. The result count is announced politely.',
      'Typing a letter on the closed trigger opens it with that letter as the search.',
      'With `multiple`: the listbox has `aria-multiselectable="true"` and each option `aria-selected`; `Enter` (or a click) toggles the highlighted option and keeps the list open; `Backspace` in the empty search (or `Backspace` / `Delete` on the trigger) removes the last value. The trigger is described by "Bug, Design selected" (the chips are hidden from assistive tech).',
    ]),
    usage([
      'Use for long lists (15+) where people know what they are looking for.',
      'Use Select for short lists; scrolling a few options is faster than typing.',
      'Don’t use it to create free-text values; it only picks from `options`.',
      'Use `multiple` for labels, tags, assignees; for 2–6 independent on/off options use Checkboxes.',
    ]),
  ],
};

/* ================================================================== NumberInput */

function NumberCurrencyDemo() {
  const [amount, setAmount] = useState<number | null>(1250);
  return (
    <Field className="w-full max-w-80" label="Amount" description={`Value: ${amount ?? 'empty'}`}>
      <NumberInput value={amount} onValueChange={setAmount} min={0} format={{ style: 'currency', currency: 'USD' }} align="end" />
    </Field>
  );
}

const numberInputPage: DocPage = {
  eyebrow,
  title: 'Number Input',
  description: 'A numeric field with min / max / step, arrow-key stepping and Intl formatting (currency, percent, units) when it isn’t being edited. Accepts localized input like "1.234,5".',
  hero: {
    title: 'Number Input',
    render: () => <NumberCurrencyDemo />,
    code: `import { useState } from 'react';
import { Field, NumberInput } from '@krackedui/motion';

export function AmountField() {
  const [amount, setAmount] = useState<number | null>(1250);
  return (
    <Field label="Amount">
      <NumberInput value={amount} onValueChange={setAmount} min={0} format={{ style: 'currency', currency: 'USD' }} align="end" />
    </Field>
  );
}`,
  },
  install: install('NumberInput', `<NumberInput aria-label="Quantity" defaultValue={1} min={1} max={99} stepper />`),
  examples: [
    example('Stepper', () => (
      <Field className="w-full max-w-80" label="Seats" description="Between 1 and 50."><NumberInput defaultValue={5} min={1} max={50} stepper /></Field>
    ), `import { Field, NumberInput } from '@krackedui/motion';

export function SeatsField() {
  return (
    <Field label="Seats" description="Between 1 and 50.">
      <NumberInput defaultValue={5} min={1} max={50} stepper />
    </Field>
  );
}`, { description: 'The stepper buttons are for pointers; keyboard users use the arrow keys (Shift for ×10).' }),
    example('Percent', () => (
      <Field className="w-full max-w-80" label="Discount"><NumberInput defaultValue={0.15} min={0} max={1} format={{ style: 'percent', maximumFractionDigits: 1 }} /></Field>
    ), `import { Field, NumberInput } from '@krackedui/motion';

export function DiscountField() {
  return (
    <Field label="Discount">
      <NumberInput defaultValue={0.15} min={0} max={1} format={{ style: 'percent', maximumFractionDigits: 1 }} />
    </Field>
  );
}`, { description: 'The value is a fraction (0.15); people see and type percent (15).' }),
    example('Locale and unit', () => (
      <div className={col}>
        <Field label="Betrag"><NumberInput locale="de-DE" defaultValue={1234.5} format={{ style: 'currency', currency: 'EUR' }} /></Field>
        <Field label="Width"><NumberInput defaultValue={720} step={10} trailing="px" /></Field>
      </div>
    ), `import { Field, NumberInput } from '@krackedui/motion';

export function LocalizedNumbers() {
  return (
    <>
      <Field label="Betrag">
        <NumberInput locale="de-DE" defaultValue={1234.5} format={{ style: 'currency', currency: 'EUR' }} />
      </Field>
      <Field label="Width">
        <NumberInput defaultValue={720} step={10} trailing="px" />
      </Field>
    </>
  );
}`),
    example('Invalid and disabled', () => (
      <div className={col}>
        <Field label="Budget" error="The budget must be at least $100."><NumberInput defaultValue={40} format={{ style: 'currency', currency: 'USD' }} /></Field>
        <Field label="Limit" disabled><NumberInput defaultValue={10} /></Field>
      </div>
    ), `import { Field, NumberInput } from '@krackedui/motion';

export function NumberStates() {
  return (
    <>
      <Field label="Budget" error="The budget must be at least $100.">
        <NumberInput defaultValue={40} format={{ style: 'currency', currency: 'USD' }} />
      </Field>
      <Field label="Limit" disabled>
        <NumberInput defaultValue={10} />
      </Field>
    </>
  );
}`),
    example('Dark theme', () => <Dark><NumberInput aria-label="Quantity" className="max-w-80" defaultValue={3} stepper /></Dark>, `import { NumberInput, Theme } from '@krackedui/motion';

export function DarkNumber() {
  return (
    <Theme appearance="dark" className="flex flex-col gap-4 rounded-n-lg p-4">
      <NumberInput aria-label="Quantity" defaultValue={3} stepper />
    </Theme>
  );
}`),
  ],
  api: [
    {
      name: 'NumberInput',
      description: 'A text `<input role="spinbutton">` (not `type="number"`, so formatting and localized input work). The ref goes to the input; other input attributes (`autoFocus`, `aria-*`, `data-*`, `onKeyDown`, which can `preventDefault()` the built-in stepping) are passed to it.',
      props: [
        { name: 'value / defaultValue', type: 'number | null', description: 'Controlled / initial value; `null` = empty.' },
        { name: 'onValueChange', type: '(value: number | null) => void', description: 'Called with the parsed, clamped value on blur, Enter, arrow keys and stepper clicks.' },
        { name: 'min / max', type: 'number', description: 'Bounds; typed values are clamped.' },
        { name: 'step', type: 'number', default: '1', description: 'Arrow / stepper increment. Shift+Arrow and Page Up/Down step ×10.' },
        { name: 'format', type: 'Intl.NumberFormatOptions', description: 'Display format when not editing (currency, percent, decimals, units).' },
        { name: 'locale', type: 'string', default: '"en-US"', description: 'Locale for formatting and parsing.' },
        { name: 'placeholder', type: 'string' },
        p.size,
        { name: 'stepper', type: 'boolean', default: 'false', description: 'Show increment / decrement buttons.' },
        { name: 'align', type: ['"start"', '"end"'], default: '"start"', description: 'Text alignment; `end` for amounts.' },
        { name: 'icon', type: 'IconName', description: 'Leading 16px icon.' },
        { name: 'trailing', type: 'ReactNode', description: 'Content after the number (a unit).' },
        p.invalid, p.disabled, p.required,
        { name: 'readOnly', type: 'boolean', default: 'false' },
        { name: 'name', type: 'string', description: 'A hidden input carries the raw number for forms.' },
        p.id, p.className, p.style,
        { name: 'onFocus / onBlur', type: '(event: FocusEvent<HTMLInputElement>) => void' },
        p.ariaLabel, p.ariaLabelledBy, p.ariaDescribedBy,
      ],
    },
    { name: 'Helpers', props: [{ name: 'parseLocaleNumber(text, locale?)', type: '(text: string, locale?: string) => number | null', description: 'Parses localized input; `null` for empty, `NaN` for junk.' }] },
  ],
  sections: [
    a11y([
      'WAI-ARIA spinbutton: `role="spinbutton"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (the formatted value, e.g. "$1,250.00").',
      '`↑` / `↓` step, `Shift` + arrows or `Page Up` / `Page Down` step ×10, `Home` / `End` jump to min / max. `Enter` commits typed text.',
      'The stepper buttons are labelled "Increase" / "Decrease" and kept out of the Tab order (the keys do the same).',
      '`inputmode` brings up the numeric keyboard on phones.',
    ]),
    usage([
      'Use for quantities, amounts and percentages that people adjust or type.',
      'Use TextInput for numbers that aren’t quantities (phone, card, ZIP codes).',
      'Use Slider when the position matters more than the exact value.',
      'Don’t format while typing; formatting is applied on blur.',
    ]),
  ],
};

/* ================================================================== Slider */

function SliderRangeDemo() {
  const [range, setRange] = useState([200, 800]);
  return (
    <Field className="w-full max-w-80" label="Price" description={`$${range[0]} – $${range[1]}`}>
      <Slider value={range} onValueChange={setRange} min={0} max={1000} step={10} formatValue={(v) => `$${v}`} />
    </Field>
  );
}

const sliderPage: DocPage = {
  eyebrow,
  title: 'Slider',
  description: 'Pick a number or a range by dragging or with the arrow keys. A 4px track, accent range and white thumbs; thumbs grow on touch screens.',
  hero: {
    title: 'Slider',
    render: () => <div className="w-full max-w-80"><Slider label="Volume" defaultValue={[60]} /></div>,
    code: `import { Slider } from '@krackedui/motion';

export function VolumeSlider() {
  return <Slider label="Volume" defaultValue={[60]} />;
}`,
  },
  install: install('Slider', `<Slider label="Volume" defaultValue={[50]} />`),
  examples: [
    example('Range', () => <SliderRangeDemo />, `import { useState } from 'react';
import { Field, Slider } from '@krackedui/motion';

export function PriceRange() {
  const [range, setRange] = useState([200, 800]);
  return (
    <Field label="Price" description={\`$\${range[0]} – $\${range[1]}\`}>
      <Slider value={range} onValueChange={setRange} min={0} max={1000} step={10} formatValue={(v) => \`$\${v}\`} />
    </Field>
  );
}`, { description: 'Two values make a range; each thumb is named "minimum" / "maximum".' }),
    example('Step and disabled', () => (
      <div className={col}>
        <Slider label="Zoom" defaultValue={[100]} min={50} max={200} step={25} />
        <Slider label="Locked" defaultValue={[30]} disabled />
      </div>
    ), `import { Slider } from '@krackedui/motion';

export function SliderStates() {
  return (
    <>
      <Slider label="Zoom" defaultValue={[100]} min={50} max={200} step={25} />
      <Slider label="Locked" defaultValue={[30]} disabled />
    </>
  );
}`),
    example('Dark theme', () => <Dark><div className="w-full max-w-80"><Slider label="Opacity" defaultValue={[40]} /></div></Dark>, `import { Slider, Theme } from '@krackedui/motion';

export function DarkSlider() {
  return (
    <Theme appearance="dark" className="flex flex-col gap-4 rounded-n-lg p-4">
      <Slider label="Opacity" defaultValue={[40]} />
    </Theme>
  );
}`),
  ],
  api: [
    {
      name: 'Slider',
      description: 'Radix Slider. The ref goes to the root `<span>`.',
      props: [
        { name: 'value / defaultValue', type: 'number[]', default: '[min]', description: 'One value, or two for a range.' },
        { name: 'onValueChange', type: '(value: number[]) => void', description: 'Called while dragging / on each key step.' },
        { name: 'onValueCommit', type: '(value: number[]) => void', description: 'Called when the thumb is released.' },
        { name: 'min / max', type: 'number', default: '0 / 100' },
        { name: 'step', type: 'number', default: '1' },
        { name: 'minStepsBetweenThumbs', type: 'number', description: 'Smallest gap between range thumbs, in steps.' },
        p.disabled, p.invalid,
        { name: 'label', type: 'string', description: 'Accessible name when there is no Field around it.' },
        { name: 'formatValue', type: '(value: number) => string', description: 'Human text for screen readers (`aria-valuetext`).' },
        { name: 'orientation', type: ['"horizontal"', '"vertical"'], default: '"horizontal"' },
        { name: 'name', type: 'string', description: 'One hidden input per thumb.' },
        p.id, p.className, p.style, p.ariaDescribedBy,
      ],
    },
  ],
  sections: [
    a11y([
      'WAI-ARIA slider: each thumb is `role="slider"` with `aria-valuenow/min/max`, and `aria-valuetext` from `formatValue`.',
      '`←` / `↓` and `→` / `↑` step, `Page Up` / `Page Down` step ×10, `Home` / `End` jump to min / max.',
      'Thumbs are named by `label` or by the surrounding Field label; range thumbs add "minimum" / "maximum".',
      'Thumbs get a 24px hit area on touch screens (`pointer: coarse`).',
    ]),
    usage([
      'Use for settings where position matters more than the exact number (volume, zoom, price filters).',
      'Pair with a visible value or a NumberInput when the exact number matters.',
      'Don’t use for values with a huge range; small steps become impossible to hit.',
    ]),
  ],
};

/* ================================================================== SegmentedControl */

function SegmentedDemo() {
  const [align, setAlign] = useState('left');
  return (
    <SegmentedControl aria-label="Alignment" value={align} onValueChange={setAlign} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} />
  );
}

const segmentedControlPage: DocPage = {
  eyebrow,
  title: 'Segmented Control',
  description: 'A small set of exclusive options shown inline, from view settings and layout pickers. The selected surface slides between segments.',
  hero: {
    title: 'Segmented Control',
    render: () => <SegmentedDemo />,
    code: `import { useState } from 'react';
import { SegmentedControl } from '@krackedui/motion';

export function AlignmentControl() {
  const [align, setAlign] = useState('left');
  return (
    <SegmentedControl
      aria-label="Alignment"
      value={align}
      onValueChange={setAlign}
      options={[
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ]}
    />
  );
}`,
  },
  install: install('SegmentedControl', `<SegmentedControl aria-label="Range" options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} />`),
  examples: [
    example('Sizes', () => (
      <div className="flex flex-col items-center gap-3">
        <SegmentedControl aria-label="Small" size="sm" options={[{ value: 'a', label: 'Small' }, { value: 'b', label: '24px' }]} />
        <SegmentedControl aria-label="Medium" size="md" options={[{ value: 'a', label: 'Medium' }, { value: 'b', label: '28px' }]} />
        <SegmentedControl aria-label="Large" size="lg" options={[{ value: 'a', label: 'Large' }, { value: 'b', label: '32px' }]} />
      </div>
    ), `import { SegmentedControl } from '@krackedui/motion';

export function SegmentedSizes() {
  return (
    <>
      <SegmentedControl aria-label="Small" size="sm" options={[{ value: 'a', label: 'Small' }, { value: 'b', label: '24px' }]} />
      <SegmentedControl aria-label="Medium" size="md" options={[{ value: 'a', label: 'Medium' }, { value: 'b', label: '28px' }]} />
      <SegmentedControl aria-label="Large" size="lg" options={[{ value: 'a', label: 'Large' }, { value: 'b', label: '32px' }]} />
    </>
  );
}`),
    example('Icons', () => (
      <div className="flex flex-col items-center gap-3">
        <SegmentedControl aria-label="Layout" size="md" defaultValue="board" options={[{ value: 'table', icon: 'table', label: 'Table' }, { value: 'board', icon: 'board', label: 'Board' }, { value: 'list', icon: 'list', label: 'List' }]} />
        <SegmentedControl aria-label="Layout (icons only)" size="md" options={[{ value: 'table', icon: 'table', 'aria-label': 'Table' }, { value: 'board', icon: 'board', 'aria-label': 'Board' }, { value: 'list', icon: 'list', 'aria-label': 'List' }]} />
      </div>
    ), `import { SegmentedControl } from '@krackedui/motion';

export function LayoutControl() {
  return (
    <>
      <SegmentedControl
        aria-label="Layout"
        size="md"
        defaultValue="board"
        options={[
          { value: 'table', icon: 'table', label: 'Table' },
          { value: 'board', icon: 'board', label: 'Board' },
          { value: 'list', icon: 'list', label: 'List' },
        ]}
      />
      <SegmentedControl
        aria-label="Layout (icons only)"
        size="md"
        options={[
          { value: 'table', icon: 'table', 'aria-label': 'Table' },
          { value: 'board', icon: 'board', 'aria-label': 'Board' },
          { value: 'list', icon: 'list', 'aria-label': 'List' },
        ]}
      />
    </>
  );
}`, { description: 'Icon-only segments need an `aria-label` (also used as the tooltip title).' }),
    example('Full width, disabled option, in a Field', () => (
      <Field className="w-full max-w-80" label="Font"><SegmentedControl full options={[{ value: 'default', label: 'Default' }, { value: 'serif', label: 'Serif' }, { value: 'mono', label: 'Mono', disabled: true }]} /></Field>
    ), `import { Field, SegmentedControl } from '@krackedui/motion';

export function FontControl() {
  return (
    <Field label="Font">
      <SegmentedControl
        full
        options={[
          { value: 'default', label: 'Default' },
          { value: 'serif', label: 'Serif' },
          { value: 'mono', label: 'Mono', disabled: true },
        ]}
      />
    </Field>
  );
}`),
    example('Dark theme', () => <Dark><SegmentedControl aria-label="Range" size="md" defaultValue="month" options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'year', label: 'Year' }]} /></Dark>, `import { SegmentedControl, Theme } from '@krackedui/motion';

export function DarkSegmented() {
  return (
    <Theme appearance="dark" className="flex flex-col gap-4 rounded-n-lg p-4">
      <SegmentedControl aria-label="Range" size="md" defaultValue="month" options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'year', label: 'Year' }]} />
    </Theme>
  );
}`),
  ],
  api: [
    {
      name: 'SegmentedControl',
      description: 'Radix `RadioGroup.Root` (all its props except `orientation` / `dir`). Adds:',
      props: [
        { name: 'options', type: 'SegmentedOption[]', description: '`{ value, label?, icon?, description?, disabled?, aria-label? }`. Required.' },
        { name: 'value / defaultValue', type: 'string', default: 'first enabled option', description: 'Controlled / initial value.' },
        { name: 'onValueChange', type: '(value: string) => void', description: 'Never called with an empty value.' },
        { name: 'size', type: ['"sm"', '"md"', '"lg"'], default: '"sm"', description: 'Segment height 24, 28 or 32px.' },
        { name: 'full', type: 'boolean', default: 'false', description: 'Stretch to the container; segments share the width.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable every segment.' },
      ],
    },
  ],
  sections: [
    a11y([
      'WAI-ARIA radio group: `role="radiogroup"` with `role="radio"` segments and `aria-checked`. Name it with `aria-label` or a Field.',
      '`Tab` focuses the selected segment; `←` / `→` move and select (wrapping, skipping disabled).',
      'The sliding indicator is decorative (`aria-hidden`) and doesn’t move under reduced motion.',
      'Segments are at least 24px tall on touch screens.',
    ]),
    usage([
      'Use for 2–5 short, exclusive options that change a view or a setting immediately.',
      'Use Tabs when each option shows a different panel of content.',
      'Use Select when there are more options or labels are long.',
    ]),
  ],
};

/* ================================================================== Calendar */

function CalendarDemo() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 14));
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-n-lg shadow-[0_0_0_1px_var(--n-border-primary)]">
        <Calendar value={date} onValueChange={setDate} today={TODAY} />
      </div>
      <p className="text-[12px] text-n-text-secondary">{date ? date.toDateString() : 'No date'}</p>
    </div>
  );
}

const calendarPage: DocPage = {
  eyebrow,
  title: 'Calendar',
  description: 'An inline month grid for picking one date: month caption with Today and arrows, 32px day cells, accent selection and a red today marker.',
  hero: {
    title: 'Calendar',
    render: () => <CalendarDemo />,
    code: `import { useState } from 'react';
import { Calendar } from '@krackedui/motion';

export function PublishDate() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 14));
  return <Calendar value={date} onValueChange={setDate} />;
}`,
  },
  install: install('Calendar', `<Calendar aria-label="Publish date" />`),
  examples: [
    example('Min and max', () => (
      <Calendar aria-label="Delivery day" today={TODAY} defaultValue={new Date(2026, 9, 23)} min={new Date(2026, 9, 21)} max={new Date(2026, 10, 15)} />
    ), `import { Calendar } from '@krackedui/motion';

export function DeliveryDay() {
  return (
    <Calendar
      aria-label="Delivery day"
      defaultValue={new Date(2026, 9, 23)}
      min={new Date(2026, 9, 21)}
      max={new Date(2026, 10, 15)}
    />
  );
}`, { description: 'Days outside the range are struck through and can’t be picked; keyboard focus stays inside.' }),
    example('Week starts on Monday, other locale', () => <Calendar aria-label="Datum" today={TODAY} locale="de-DE" weekStartsOn={1} showTodayButton={false} />, `import { Calendar } from '@krackedui/motion';

export function GermanCalendar() {
  return <Calendar aria-label="Datum" locale="de-DE" weekStartsOn={1} showTodayButton={false} />;
}`),
    example('Dark theme', () => <Dark><Calendar aria-label="Date" today={TODAY} defaultValue={new Date(2026, 9, 9)} /></Dark>, `import { Calendar, Theme } from '@krackedui/motion';

export function DarkCalendar() {
  return (
    <Theme appearance="dark" className="flex flex-col gap-4 rounded-n-lg p-4">
      <Calendar aria-label="Date" defaultValue={new Date(2026, 9, 9)} />
    </Theme>
  );
}`),
  ],
  api: [
    {
      name: 'Calendar',
      description: 'A `<div role="group">` with a caption and a `<table role="grid">`. The ref goes to the root.',
      props: [
        { name: 'value / defaultValue', type: 'Date | null', description: 'Controlled / initial date.' },
        { name: 'onValueChange', type: '(value: Date | null) => void', description: 'Called with the picked day (local midnight).' },
        { name: 'min / max', type: 'Date', description: 'Selectable range (inclusive).' },
        { name: 'defaultMonth', type: 'Date', default: 'value ?? today', description: 'Month shown first.' },
        { name: 'onMonthChange', type: '(month: Date) => void', description: 'Called with the first day of the visible month.' },
        p.today, p.locale, p.weekStartsOn,
        { name: 'showTodayButton', type: 'boolean', default: 'true', description: 'The "Today" button in the caption.' },
        { name: 'showOutsideDays', type: 'boolean', default: 'true', description: 'Dimmed days of the neighbouring months.' },
        { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Focus the selected (or today’s) day on mount.' },
        p.id, p.className, p.style,
        { name: 'aria-label', type: 'string', default: '"Calendar"', description: 'Name of the group when there is no Field.' },
        p.ariaDescribedBy,
      ],
    },
    { name: 'calendarVariants', description: 'Slots: root, months, month, caption, title, navGroup, today, nav, grid, head, cell, day, todayDot.', props: [] },
  ],
  sections: [
    a11y([
      'WAI-ARIA date grid: `role="grid"` labelled by the month caption, weekday `columnheader`s with full names (`abbr`), and `gridcell`s with `aria-selected`.',
      'One day is tabbable (roving tabindex). `←` `→` move a day, `↑` `↓` a week, `Home` / `End` to the start / end of the week, `Page Up` / `Page Down` a month (`Shift`: a year). `Enter` / `Space` select.',
      'Each day button is named with the full date ("Wednesday, October 21, 2026"); today has `aria-current="date"`; out-of-range days are `aria-disabled`.',
      'The month caption is a polite live region, so month changes are announced.',
    ]),
    usage([
      'Use when the calendar is the main content (scheduling, booking panels).',
      'Use DatePicker for a date field in a form; it opens this calendar in a popover.',
      'Use DateRangePicker for start/end periods.',
    ]),
  ],
};

/* ================================================================== DatePicker */

function DatePickerDemo() {
  const [due, setDue] = useState<Date | null>(new Date(2026, 9, 30));
  return (
    <Field className="w-full max-w-80" label="Due date" description="Reminders go out the day before.">
      <DatePicker value={due} onValueChange={setDue} today={TODAY} />
    </Field>
  );
}

const datePickerPage: DocPage = {
  eyebrow,
  title: 'Date Picker',
  description: 'A date form field: a TextInput-style trigger showing the date that opens a Calendar in a popover. Clearable, with min / max.',
  links: [{ label: 'Date Menu (database property menu)', href: '/motion/ui/date-menu' }],
  hero: {
    title: 'Date Picker',
    render: () => <DatePickerDemo />,
    code: `import { useState } from 'react';
import { DatePicker, Field } from '@krackedui/motion';

export function DueDateField() {
  const [due, setDue] = useState<Date | null>(new Date(2026, 9, 30));
  return (
    <Field label="Due date" description="Reminders go out the day before.">
      <DatePicker value={due} onValueChange={setDue} />
    </Field>
  );
}`,
  },
  install: install('DatePicker', `<DatePicker aria-label="Start date" />`),
  examples: [
    example('Placeholder, min and max', () => (
      <Field className="w-full max-w-80" label="Start date" description="Within the next 30 days.">
        <DatePicker placeholder="Choose a start date" min={TODAY} max={new Date(2026, 10, 20)} today={TODAY} />
      </Field>
    ), `import { DatePicker, Field } from '@krackedui/motion';

export function StartDateField() {
  const today = new Date();
  const in30Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
  return (
    <Field label="Start date" description="Within the next 30 days.">
      <DatePicker placeholder="Choose a start date" min={today} max={in30Days} />
    </Field>
  );
}`),
    example('Custom format', () => (
      <Field className="w-full max-w-80" label="Birthday"><DatePicker defaultValue={new Date(1990, 4, 17)} formatValue={(d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} today={TODAY} /></Field>
    ), `import { DatePicker, Field } from '@krackedui/motion';

export function BirthdayField() {
  return (
    <Field label="Birthday">
      <DatePicker
        defaultValue={new Date(1990, 4, 17)}
        formatValue={(d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      />
    </Field>
  );
}`),
    example('Sizes and states', () => (
      <div className={col}>
        <DatePicker aria-label="Small" size="sm" defaultValue={TODAY} today={TODAY} />
        <DatePicker aria-label="Large" size="lg" defaultValue={TODAY} today={TODAY} />
        <Field label="Invoice date" error="Pick the date on the invoice."><DatePicker today={TODAY} /></Field>
        <Field label="Created" disabled><DatePicker defaultValue={TODAY} today={TODAY} /></Field>
      </div>
    ), `import { DatePicker, Field } from '@krackedui/motion';

export function DatePickerStates() {
  return (
    <>
      <DatePicker aria-label="Small" size="sm" defaultValue={new Date()} />
      <DatePicker aria-label="Large" size="lg" defaultValue={new Date()} />
      <Field label="Invoice date" error="Pick the date on the invoice.">
        <DatePicker />
      </Field>
      <Field label="Created" disabled>
        <DatePicker defaultValue={new Date()} />
      </Field>
    </>
  );
}`),
    example('Dark theme', () => <Dark><DatePicker aria-label="Date" className="max-w-80" defaultValue={TODAY} today={TODAY} /></Dark>, `import { DatePicker, Theme } from '@krackedui/motion';

export function DarkDatePicker() {
  return (
    <Theme appearance="dark" className="flex flex-col gap-4 rounded-n-lg p-4">
      <DatePicker aria-label="Date" defaultValue={new Date()} />
    </Theme>
  );
}`),
  ],
  api: [
    {
      name: 'DatePicker',
      description: 'The ref goes to the trigger `<button>`.',
      props: [
        { name: 'value / defaultValue', type: 'Date | null', description: 'Controlled / initial date.' },
        { name: 'onValueChange', type: '(value: Date | null) => void', description: 'Picked day, or `null` when cleared.' },
        { name: 'placeholder', type: 'string', default: '"Pick a date"' },
        { name: 'min / max', type: 'Date', description: 'Selectable range.' },
        p.size,
        { name: 'clearable', type: 'boolean', default: 'true', description: 'Show the clear (×) button when there is a value.' },
        { name: 'formatValue', type: '(date: Date) => string', default: '"Oct 21, 2026"', description: 'Trigger text for a date.' },
        p.locale, p.weekStartsOn, p.today,
        { name: 'open', type: 'boolean', description: 'Controlled open state.' },
        { name: 'defaultOpen', type: 'boolean' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
        p.invalid, p.disabled, p.required,
        { name: 'name', type: 'string', description: 'A hidden input carries `yyyy-mm-dd`.' },
        p.id, p.className, p.style, p.ariaLabel, p.ariaDescribedBy,
      ],
    },
  ],
  sections: [
    a11y([
      'The trigger is a button with `aria-haspopup="dialog"` and `aria-expanded`, named by the Field label plus the current date.',
      'Opening moves focus to the selected day (or today) in the calendar grid; all Calendar keys apply. `Enter` picks and closes; `Escape` closes. Focus returns to the trigger.',
      'The popover is a dialog named "Choose date". The clear button is labelled "Clear date" and returns focus to the trigger.',
    ]),
    usage([
      'Use for a single date in a form (due date, start date, birthday).',
      'Use DateRangePicker for periods and Calendar for an always-visible month.',
      'Use Date Menu inside database date properties (it adds end date, time and reminders).',
    ]),
  ],
};

/* ================================================================== DateRangePicker */

const day = (offset: number) => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + offset);
const rangePresets = [
  { label: 'Today', range: { from: day(0), to: day(0) } },
  { label: 'Last 7 days', range: { from: day(-6), to: day(0) } },
  { label: 'Last 30 days', range: { from: day(-29), to: day(0) } },
  { label: 'This month', range: { from: new Date(2026, 9, 1), to: new Date(2026, 9, 31) } },
];

function FilterBarDemo() {
  const [range, setRange] = useState<DateRange>(rangePresets[1].range);
  const [status, setStatus] = useState('all');
  return (
    <div className="flex w-full flex-wrap items-end gap-2">
      <DateRangePicker aria-label="Period" className="w-full sm:w-72" value={range} onValueChange={setRange} presets={rangePresets} today={TODAY} />
      <Select aria-label="Status" className="w-full sm:w-36" value={status} onValueChange={setStatus} options={[{ value: 'all', label: 'All statuses' }, { value: 'paid', label: 'Paid' }, { value: 'due', label: 'Due' }]} />
    </div>
  );
}

const dateRangePickerPage: DocPage = {
  eyebrow,
  title: 'Date Range Picker',
  description: 'A start/end date field with quick presets. Two months side by side on wide screens, one under 640px; the range previews as you hover or move with the keyboard.',
  hero: {
    title: 'Date Range Picker',
    render: () => <FilterBarDemo />,
    code: `import { useState } from 'react';
import { DateRangePicker, Select, type DateRange } from '@krackedui/motion';

const today = new Date();
const daysAgo = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);
const presets = [
  { label: 'Today', range: { from: daysAgo(0), to: daysAgo(0) } },
  { label: 'Last 7 days', range: { from: daysAgo(6), to: daysAgo(0) } },
  { label: 'Last 30 days', range: { from: daysAgo(29), to: daysAgo(0) } },
];

export function InvoiceFilters() {
  const [range, setRange] = useState<DateRange>(presets[1].range);
  const [status, setStatus] = useState('all');
  return (
    <div className="flex flex-wrap items-end gap-2">
      <DateRangePicker aria-label="Period" className="w-full sm:w-72" value={range} onValueChange={setRange} presets={presets} />
      <Select
        aria-label="Status"
        className="w-full sm:w-36"
        value={status}
        onValueChange={setStatus}
        options={[{ value: 'all', label: 'All statuses' }, { value: 'paid', label: 'Paid' }, { value: 'due', label: 'Due' }]}
      />
    </div>
  );
}`,
  },
  install: install('DateRangePicker', `<DateRangePicker aria-label="Period" />`),
  examples: [
    example('In a Field, with min', () => (
      <Field className="w-full max-w-80" label="Trip dates" description="Check-in from today.">
        <DateRangePicker min={TODAY} today={TODAY} placeholder="Check-in – check-out" />
      </Field>
    ), `import { DateRangePicker, Field } from '@krackedui/motion';

export function TripDates() {
  return (
    <Field label="Trip dates" description="Check-in from today.">
      <DateRangePicker min={new Date()} placeholder="Check-in – check-out" />
    </Field>
  );
}`),
    example('Invalid and disabled', () => (
      <div className={col}>
        <Field label="Report period" error="Choose a period of 90 days or less."><DateRangePicker today={TODAY} defaultValue={{ from: new Date(2026, 0, 1), to: new Date(2026, 9, 1) }} /></Field>
        <Field label="Billing period" disabled><DateRangePicker today={TODAY} defaultValue={{ from: new Date(2026, 9, 1), to: new Date(2026, 9, 31) }} /></Field>
      </div>
    ), `import { DateRangePicker, Field } from '@krackedui/motion';

export function RangeStates() {
  return (
    <>
      <Field label="Report period" error="Choose a period of 90 days or less.">
        <DateRangePicker defaultValue={{ from: new Date(2026, 0, 1), to: new Date(2026, 9, 1) }} />
      </Field>
      <Field label="Billing period" disabled>
        <DateRangePicker defaultValue={{ from: new Date(2026, 9, 1), to: new Date(2026, 9, 31) }} />
      </Field>
    </>
  );
}`),
    example('Dark theme', () => <Dark><DateRangePicker aria-label="Period" className="max-w-80" today={TODAY} presets={rangePresets} defaultValue={rangePresets[2].range} /></Dark>, `import { DateRangePicker, Theme } from '@krackedui/motion';

export function DarkRange() {
  return (
    <Theme appearance="dark" className="flex flex-col gap-4 rounded-n-lg p-4">
      <DateRangePicker aria-label="Period" defaultValue={{ from: new Date(2026, 9, 1), to: new Date(2026, 9, 14) }} />
    </Theme>
  );
}`),
  ],
  api: [
    {
      name: 'DateRangePicker',
      description: 'The ref goes to the trigger `<button>`.',
      props: [
        { name: 'value / defaultValue', type: 'DateRange', default: '{ from: null, to: null }', description: '`{ from: Date | null; to: Date | null }`.' },
        { name: 'onValueChange', type: '(value: DateRange) => void', description: 'Called with a complete range, a preset, or an empty range when cleared.' },
        { name: 'placeholder', type: 'string', default: '"Pick a date range"' },
        { name: 'min / max', type: 'Date', description: 'Selectable range.' },
        { name: 'presets', type: '{ label: string; range: DateRange }[]', description: 'Quick ranges beside (desktop) or above (phone) the calendar.' },
        p.size,
        { name: 'clearable', type: 'boolean', default: 'true' },
        p.locale, p.weekStartsOn, p.today,
        { name: 'open', type: 'boolean', description: 'Controlled open state.' },
        { name: 'defaultOpen', type: 'boolean' },
        { name: 'onOpenChange', type: '(open: boolean) => void' },
        p.invalid, p.disabled, p.required,
        { name: 'name', type: 'string', description: 'Hidden inputs `<name>.from` and `<name>.to` carry `yyyy-mm-dd`.' },
        p.id, p.className, p.style, p.ariaLabel, p.ariaDescribedBy,
      ],
    },
  ],
  sections: [
    a11y([
      'The trigger is a button with `aria-haspopup="dialog"`; the popover is a dialog named "Choose dates".',
      'Each month is a date grid with the Calendar keys; moving past the last visible month scrolls the months.',
      'First `Enter` / click sets the start, the second sets the end (in either order) and closes; a polite status line says "Pick an end date" in between.',
      'Presets are toggle buttons (`aria-pressed` for the active one).',
    ]),
    usage([
      'Use for report periods, filters and bookings.',
      'Offer presets for the common ranges; most people never open the grid.',
      'Don’t use two DatePickers for a period; the range preview prevents end-before-start mistakes.',
    ]),
  ],
};

/* ================================================================== FileUpload */

const fileUploadPage: DocPage = {
  eyebrow,
  title: 'File Upload',
  description: 'A drop zone plus a "Choose files" button, with type, size and count validation and a removable file list.',
  hero: {
    title: 'File Upload',
    render: () => (
      <Field className="w-full max-w-96" label="Attachments">
        <FileUpload multiple accept=".pdf,image/*" maxSize={5 * 1024 * 1024} label="Drop files here" description="PDF or images, up to 5 MB each" />
      </Field>
    ),
    code: `import { Field, FileUpload } from '@krackedui/motion';

export function Attachments() {
  return (
    <Field label="Attachments">
      <FileUpload
        multiple
        accept=".pdf,image/*"
        maxSize={5 * 1024 * 1024}
        label="Drop files here"
        description="PDF or images, up to 5 MB each"
        onFilesChange={(files) => console.log(files)}
      />
    </Field>
  );
}`,
  },
  install: install('FileUpload', `<FileUpload accept=".csv" description="CSV, up to 10 MB" maxSize={10 * 1024 * 1024} />`),
  examples: [
    example('Single file', () => (
      <Field className="w-full max-w-96" label="Workspace logo" description="Square PNG or SVG works best.">
        <FileUpload accept="image/png,image/svg+xml" maxSize={1024 * 1024} buttonLabel="Upload logo" label="Drop an image" description="PNG or SVG, up to 1 MB" />
      </Field>
    ), `import { Field, FileUpload } from '@krackedui/motion';

export function LogoUpload() {
  return (
    <Field label="Workspace logo" description="Square PNG or SVG works best.">
      <FileUpload accept="image/png,image/svg+xml" maxSize={1024 * 1024} buttonLabel="Upload logo" label="Drop an image" description="PNG or SVG, up to 1 MB" />
    </Field>
  );
}`, { description: 'Without `multiple`, a new file replaces the current one.' }),
    example('Invalid and disabled', () => (
      <div className="flex w-full max-w-96 flex-col gap-4">
        <Field label="Contract" error="Upload the signed contract." required><FileUpload accept=".pdf" label="Drop the PDF here" /></Field>
        <Field label="Import" disabled><FileUpload accept=".csv" label="Imports are paused" /></Field>
      </div>
    ), `import { Field, FileUpload } from '@krackedui/motion';

export function UploadStates() {
  return (
    <>
      <Field label="Contract" error="Upload the signed contract." required>
        <FileUpload accept=".pdf" label="Drop the PDF here" />
      </Field>
      <Field label="Import" disabled>
        <FileUpload accept=".csv" label="Imports are paused" />
      </Field>
    </>
  );
}`),
    example('Dark theme', () => <Dark><FileUpload className="max-w-96" multiple description="Any file, up to 10 MB" maxSize={10 * 1024 * 1024} /></Dark>, `import { FileUpload, Theme } from '@krackedui/motion';

export function DarkUpload() {
  return (
    <Theme appearance="dark" className="flex flex-col gap-4 rounded-n-lg p-4">
      <FileUpload multiple description="Any file, up to 10 MB" maxSize={10 * 1024 * 1024} />
    </Theme>
  );
}`),
  ],
  api: [
    {
      name: 'FileUpload',
      description: 'A `<div>`; the ref goes to the root. A native `<input type="file">` does the picking.',
      props: [
        { name: 'accept', type: 'string', description: 'Like the input attribute: `".pdf,image/*"`. Other files are rejected with a message.' },
        { name: 'multiple', type: 'boolean', default: 'false', description: 'Allow several files (appended to the list).' },
        { name: 'maxSize', type: 'number', description: 'Max bytes per file.' },
        { name: 'maxFiles', type: 'number', description: 'Max number of files with `multiple`.' },
        { name: 'files / defaultFiles', type: 'File[]', description: 'Controlled / initial list.' },
        { name: 'onFilesChange', type: '(files: File[]) => void', description: 'The full list after adding or removing.' },
        { name: 'onReject', type: '(rejections: FileRejection[]) => void', description: '`{ file, reason: "type" | "size" | "count", message }` for each rejected file.' },
        { name: 'label', type: 'ReactNode', default: '"Drop files here"', description: 'Heading inside the zone.' },
        { name: 'description', type: 'ReactNode', description: 'Hint, e.g. "PDF, up to 5 MB".' },
        { name: 'buttonLabel', type: 'string', default: '"Choose files" / "Choose file"' },
        p.invalid, p.disabled, p.required,
        { name: 'name', type: 'string', description: 'The native input carries the listed files in a form.' },
        { name: 'id', type: 'string', description: 'Id of the file button (the Field label points at it).' },
        p.className, p.style, p.ariaDescribedBy,
      ],
    },
    { name: 'Helpers', props: [
      { name: 'formatBytes(bytes)', type: '(bytes: number) => string', description: '"1.2 MB".' },
      { name: 'acceptsFile(file, accept?)', type: '(file: File, accept?: string) => boolean', description: 'The `accept` matcher.' },
    ] },
  ],
  sections: [
    a11y([
      '"Choose files" is a real button (Tab, Enter, Space) that opens the system file dialog; dropping is a pointer shortcut, never the only way.',
      'Rejections are written to a `role="alert"` region and linked to the button with `aria-describedby`; the button gets `aria-invalid`.',
      'Each listed file has a "Remove <name>" button; removing returns focus to the file button.',
    ]),
    usage([
      'Use for attachments, imports and avatars inside forms.',
      'Say the accepted types and size limit in `description`, before people pick a file.',
      'Don’t rely on client checks alone; validate on the server too.',
    ]),
  ],
};

/* ================================================================== Form patterns */

interface PaymentErrors { name?: string; amount?: string; method?: string; date?: string; terms?: string }

function PaymentForm() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [method, setMethod] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [category, setCategory] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<PaymentErrors>({});
  const [sent, setSent] = useState<string | null>(null);

  const validate = (): PaymentErrors => ({
    name: name.trim() ? undefined : 'Enter who you are paying.',
    amount: amount === null ? 'Enter an amount.' : amount < 1 ? 'The minimum payment is $1.00.' : undefined,
    method: method ? undefined : 'Choose how to pay.',
    date: date ? undefined : 'Choose when to send it.',
    terms: terms ? undefined : 'Confirm the payment details.',
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) { setSent(null); return; }
    setSent(`Scheduled ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount ?? 0)} to ${name}.`);
  };

  return (
    <form noValidate onSubmit={submit} className="flex w-full max-w-md flex-col gap-4 rounded-n-lg p-4 shadow-[0_0_0_1px_var(--n-border-primary)]">
      <Field label="Payee" error={errors.name} required><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." autoComplete="organization" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount" error={errors.amount} required>
          <NumberInput value={amount} onValueChange={setAmount} min={0} format={{ style: 'currency', currency: 'USD' }} placeholder="$0.00" align="end" />
        </Field>
        <Field label="Send on" error={errors.date} required><DatePicker value={date} onValueChange={setDate} min={TODAY} today={TODAY} /></Field>
      </div>
      <Field label="Pay with" error={errors.method} required>
        <Select value={method} onValueChange={setMethod} placeholder="Choose an account" options={[
          { value: 'checking', label: 'Checking ••4821', icon: 'bank' },
          { value: 'card', label: 'Visa ••1094', icon: 'creditCard' },
        ]} />
      </Field>
      <Field label="Category" description="Optional; helps your accountant.">
        <Combobox value={category} onValueChange={setCategory} placeholder="Choose a category" searchPlaceholder="Search categories" options={[
          { value: 'software', label: 'Software' }, { value: 'contractors', label: 'Contractors' }, { value: 'travel', label: 'Travel' },
          { value: 'office', label: 'Office' }, { value: 'marketing', label: 'Marketing' }, { value: 'utilities', label: 'Utilities' },
        ]} />
      </Field>
      <Switch label="Repeat every month" checked={recurring} onCheckedChange={setRecurring} />
      <Field label="Confirmation" hideLabel error={errors.terms}>
        <Checkbox label="I checked the payee and amount" checked={terms} onCheckedChange={setTerms} />
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" variant="primary">Schedule payment</Button>
        <Button type="reset" variant="ghost" onClick={() => { setName(''); setAmount(null); setMethod(''); setDate(null); setCategory(''); setTerms(false); setErrors({}); setSent(null); }}>Reset</Button>
      </div>
      <p role="status" className="text-[14px] leading-5 text-n-green-text-secondary">{sent}</p>
    </form>
  );
}

const paymentFormCode = `import { useState, type FormEvent } from 'react';
import { Button, Checkbox, Combobox, DatePicker, Field, NumberInput, Select, Switch, TextInput } from '@krackedui/motion';

interface Errors { name?: string; amount?: string; method?: string; date?: string; terms?: string }

export function PaymentForm() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [method, setMethod] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [category, setCategory] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {
      name: name.trim() ? undefined : 'Enter who you are paying.',
      amount: amount === null ? 'Enter an amount.' : amount < 1 ? 'The minimum payment is $1.00.' : undefined,
      method: method ? undefined : 'Choose how to pay.',
      date: date ? undefined : 'Choose when to send it.',
      terms: terms ? undefined : 'Confirm the payment details.',
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return setSent(null);
    setSent(\`Scheduled \${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount ?? 0)} to \${name}.\`);
  };

  return (
    <form noValidate onSubmit={submit} className="flex max-w-md flex-col gap-4">
      <Field label="Payee" error={errors.name} required>
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." autoComplete="organization" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount" error={errors.amount} required>
          <NumberInput value={amount} onValueChange={setAmount} min={0} format={{ style: 'currency', currency: 'USD' }} placeholder="$0.00" align="end" />
        </Field>
        <Field label="Send on" error={errors.date} required>
          <DatePicker value={date} onValueChange={setDate} min={new Date()} />
        </Field>
      </div>
      <Field label="Pay with" error={errors.method} required>
        <Select
          value={method}
          onValueChange={setMethod}
          placeholder="Choose an account"
          options={[
            { value: 'checking', label: 'Checking ••4821', icon: 'bank' },
            { value: 'card', label: 'Visa ••1094', icon: 'creditCard' },
          ]}
        />
      </Field>
      <Field label="Category" description="Optional; helps your accountant.">
        <Combobox
          value={category}
          onValueChange={setCategory}
          placeholder="Choose a category"
          searchPlaceholder="Search categories"
          options={[{ value: 'software', label: 'Software' }, { value: 'contractors', label: 'Contractors' }, { value: 'travel', label: 'Travel' }]}
        />
      </Field>
      <Switch label="Repeat every month" checked={recurring} onCheckedChange={setRecurring} />
      <Field label="Confirmation" hideLabel error={errors.terms}>
        <Checkbox label="I checked the payee and amount" checked={terms} onCheckedChange={setTerms} />
      </Field>
      <Button type="submit" variant="primary">Schedule payment</Button>
      <p role="status">{sent}</p>
    </form>
  );
}`;

const formPatternsPage: DocPage = {
  eyebrow: 'Patterns',
  title: 'Form Patterns',
  description: 'A complete payment form built only from the package: Field around every control, validation on submit, errors that say how to fix the value, and a status message on success.',
  hero: { title: 'Payment form', render: () => <PaymentForm />, code: paymentFormCode, align: 'start' },
  sections: [
    {
      title: 'Validation',
      blocks: [{
        list: [
          'Validate on submit (and optionally on blur); don’t show errors while someone is still typing.',
          'Pass each message to its Field `error`: the control turns red, gets `aria-invalid`, and the message is announced and added to its description.',
          'Write errors as instructions ("Enter an amount", "The minimum payment is $1.00").',
          'Keep the submit button enabled; disabled buttons don’t explain what is missing.',
          'Use `noValidate` on the form when you show your own messages, so the browser’s bubbles don’t compete.',
        ],
      }],
    },
    {
      title: 'Layout',
      blocks: [{
        list: [
          'One column by default; pair short related fields (amount + date) in a `sm:grid-cols-2` grid so they stack on phones.',
          'Labels above controls, 16px between fields, primary action at the bottom left.',
          'Mark required fields with `required` (asterisk + `aria-required`), or mark the optional ones in the description, not both.',
        ],
      }],
    },
    a11y([
      'Every control has a visible label from Field; the checkbox brings its own label, so its Field hides the label and only supplies the error.',
      'Errors live in polite live regions; the success message is a `role="status"` region.',
      'The whole form works with the keyboard: Tab between fields, the pickers follow their WAI-ARIA patterns, Enter submits.',
    ]),
    usage([
      'Use this structure for settings, checkout, invite and create forms.',
      'For filter bars, skip Fields and give each control an `aria-label` (see Date Range Picker).',
    ]),
  ],
};

/* ================================================================== DateMenu */

function DateMenuDemo() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 12));
  return <PopoverSurface width={248}><DateMenu value={date} onChange={setDate} today={TODAY} /></PopoverSurface>;
}

const dateMenuPage: DocPage = {
  eyebrow: 'Pickers',
  title: 'Date Menu',
  description: 'The date property menu from database views: a typed date field, a month grid, then End date / Date format / Include time / Remind rows and Clear. For a date form field, use Date Picker.',
  links: [{ label: 'Date Picker (form field)', href: '/motion/ui/date-picker' }],
  hero: {
    title: 'Date Menu',
    render: () => <DateMenuDemo />,
    code: `import { useState } from 'react';
import { DateMenu, PopoverSurface } from '@krackedui/motion';

export function DatePropertyMenu() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 12));
  return (
    <PopoverSurface width={248}>
      <DateMenu value={date} onChange={setDate} />
    </PopoverSurface>
  );
}`,
  },
  install: install('DateMenu, Popover', `<Popover.Root>\n  <Popover.Trigger>Set date</Popover.Trigger>\n  <Popover.Content width={248}>\n    <DateMenu />\n  </Popover.Content>\n</Popover.Root>`),
  examples: [
    example('Calendar only', () => <PopoverSurface width={248}><DateMenu value={new Date(2026, 9, 12)} today={TODAY} showOptions={false} /></PopoverSurface>, `import { DateMenu, PopoverSurface } from '@krackedui/motion';

export function DateMenuCalendarOnly() {
  return (
    <PopoverSurface width={248}>
      <DateMenu value={new Date(2026, 9, 12)} showOptions={false} />
    </PopoverSurface>
  );
}`),
    example('Options on', () => <PopoverSurface width={248}><DateMenu value={new Date(2026, 9, 20)} today={TODAY} endDate includeTime dateFormatLabel="Relative" remindLabel="1 day before" /></PopoverSurface>, `import { DateMenu, PopoverSurface } from '@krackedui/motion';

export function DateMenuOptions() {
  return (
    <PopoverSurface width={248}>
      <DateMenu value={new Date(2026, 9, 20)} endDate includeTime dateFormatLabel="Relative" remindLabel="1 day before" />
    </PopoverSurface>
  );
}`),
  ],
  api: [
    {
      name: 'DateMenu',
      description: 'A `<div>` (all its props except `onChange`); popover content only: wrap it in `Popover.Content width={248}` or `PopoverSurface width={248}`. Adds:',
      props: [
        { name: 'value', type: 'Date | null', description: 'Selected day.' },
        { name: 'onChange', type: '(d: Date | null) => void', description: 'Day click, typed date, or `null` from Clear.' },
        { name: 'today', type: 'Date', default: 'new Date()', description: 'Pass a fixed date for static renders.' },
        { name: 'defaultMonth', type: 'Date', default: 'value ?? today', description: 'Initially displayed month.' },
        { name: 'showOptions', type: 'boolean', default: 'true', description: 'Option rows plus Clear / Learn sections.' },
        { name: 'dateFormatLabel', type: 'ReactNode', default: '"Full date"' },
        { name: 'remindLabel', type: 'ReactNode', default: '"None"' },
        { name: 'endDate', type: 'boolean', default: 'false', description: 'Initial End date switch.' },
        { name: 'onEndDateChange', type: '(v: boolean) => void' },
        { name: 'includeTime', type: 'boolean', default: 'false', description: 'Initial Include time switch.' },
        { name: 'onIncludeTimeChange', type: '(v: boolean) => void' },
        { name: 'onDateFormatClick', type: '() => void', description: 'Makes "Date format" actionable (open your format submenu). Without it the row only shows the value.' },
        { name: 'onRemindClick', type: '() => void', description: 'Makes "Remind" actionable (open your reminder submenu). Without it the row only shows the value.' },
        { name: 'onLearnClick', type: '() => void', description: 'Makes "Learn about reminders" actionable.' },
        { name: 'highlightedRow', type: ['"learn"', '"clear"'], description: 'Force a footer row highlighted (static renders).' },
      ],
    },
    { name: 'Helpers', props: [{ name: 'formatDisplayDate(d)', type: '(d: Date) => string', description: '"Oct 12, 2026".' }, { name: 'dateMenuVariants', type: 'tv recipe', description: 'Slots: field, caption, title, today, nav, grid, head, cell, day; `state: default | outside | selected | today`.' }] },
  ],
  sections: [
    a11y([
      'Day buttons are named with the full date and use `aria-pressed` for the selected day; previous / next month buttons are labelled. Tab moves through the days (no arrow-key grid; use Calendar or DatePicker when keyboard date entry matters).',
      'The date field is labelled "Date"; Enter or blur commits a typed date.',
      'Option rows sit in labelled listboxes ("Date options", "Clear date", "Help"). End date and Include time are `role="option"` rows with `aria-checked`; every actionable row is a Tab stop and Enter or Space activates it. Date format, Remind and Learn are actionable only when you pass their `on…Click` handler.',
      'The month caption is a polite live region, so the new month is announced after previous / next.',
    ]),
    usage([
      'Use inside database date properties and other inline date menus.',
      'Use DatePicker for a date field in a form, and Calendar for an always-visible month.',
    ]),
  ],
};

/* ================================================================== exports */

export const formsPages: Record<string, DocPage> = {
  'ui/field': fieldPage,
  'ui/select': selectPage,
  'ui/combobox': comboboxPage,
  'ui/number-input': numberInputPage,
  'ui/slider': sliderPage,
  'ui/segmented-control': segmentedControlPage,
  'ui/calendar': calendarPage,
  'ui/date-picker': datePickerPage,
  'ui/date-range-picker': dateRangePickerPage,
  'ui/file-upload': fileUploadPage,
  'ui/form-patterns': formPatternsPage,
  'ui/date-menu': dateMenuPage,
};

/** Appended to the atoms' "Form" group by mergeNav (same title). */
export const formsNav: NavGroup[] = [
  {
    title: 'Form',
    items: [
      { slug: 'ui/field' },
      { slug: 'ui/select' },
      { slug: 'ui/combobox' },
      { slug: 'ui/number-input' },
      { slug: 'ui/slider' },
      { slug: 'ui/segmented-control' },
      { slug: 'ui/calendar' },
      { slug: 'ui/date-picker' },
      { slug: 'ui/date-range-picker' },
      { slug: 'ui/file-upload' },
      { slug: 'ui/form-patterns' },
    ],
  },
  // The database date property menu sits with the other pickers (merged by title).
  { title: 'Pickers', items: [{ slug: 'ui/date-menu' }] },
];

