import { useState, type ReactNode } from 'react';
import {
  Calendar, Combobox, DatePicker, DateRangePicker, Field, FileUpload, NumberInput, SegmentedControl, Select, Slider, TextInput,
  type DateRange,
} from '@krackedui/motion';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6 break-inside-avoid">
      <h2 className="mb-2 text-[12px] font-medium leading-[14.4px] text-n-text-secondary">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

const TODAY = new Date(2026, 9, 21);
const options = [
  { value: 'free', label: 'Free', description: 'For individuals' },
  { value: 'plus', label: 'Plus', description: 'For small teams' },
  { value: 'business', label: 'Business' },
  { value: 'enterprise', label: 'Enterprise', disabled: true },
];
const people = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Katherine Johnson', 'Margaret Hamilton', 'Radia Perlman'].map((n) => ({ value: n.toLowerCase(), label: n, icon: 'user' as const }));

export default function Forms() {
  const [plan, setPlan] = useState('plus');
  const [owner, setOwner] = useState('');
  const [amount, setAmount] = useState<number | null>(1250);
  const [range, setRange] = useState<number[]>([20, 80]);
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 30));
  const [period, setPeriod] = useState<DateRange>({ from: new Date(2026, 9, 5), to: new Date(2026, 9, 12) });
  const [seg, setSeg] = useState('week');

  return (
    <div className="columns-1 gap-10 px-4 py-6 text-[14px] sm:px-8 md:columns-2 xl:columns-3">
      <Section title="Field + TextInput">
        <Field label="Workspace name" description="Shown in the sidebar."><TextInput defaultValue="Design Team" /></Field>
        <Field label="Email" error="Enter a valid email." required><TextInput defaultValue="ada@" /></Field>
        <Field label="Locked" disabled><TextInput defaultValue="motion.so/design" /></Field>
      </Section>
      <Section title="Select">
        <Field label="Plan"><Select options={options} value={plan} onValueChange={setPlan} /></Field>
        <Select aria-label="Small" size="sm" options={options} placeholder="Small" />
        <Select aria-label="Large" size="lg" options={options} placeholder="Large" />
        <Field label="Region" error="Choose a region."><Select options={options} /></Field>
      </Section>
      <Section title="Combobox">
        <Field label="Owner"><Combobox options={people} value={owner} onValueChange={setOwner} searchPlaceholder="Search people" /></Field>
        <Combobox aria-label="Disabled" disabled options={people} defaultValue="ada lovelace" />
      </Section>
      <Section title="NumberInput">
        <Field label="Amount"><NumberInput value={amount} onValueChange={setAmount} format={{ style: 'currency', currency: 'USD' }} align="end" /></Field>
        <Field label="Seats"><NumberInput defaultValue={5} min={1} max={50} stepper /></Field>
        <Field label="Discount" error="At most 50%."><NumberInput defaultValue={0.6} format={{ style: 'percent' }} /></Field>
      </Section>
      <Section title="Slider">
        <Slider label="Volume" defaultValue={[60]} />
        <Field label="Price range"><Slider value={range} onValueChange={setRange} /></Field>
        <Slider label="Disabled" defaultValue={[30]} disabled />
      </Section>
      <Section title="SegmentedControl">
        <SegmentedControl aria-label="Range" value={seg} onValueChange={setSeg} options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} />
        <SegmentedControl aria-label="View" size="md" options={[{ value: 'table', icon: 'table', label: 'Table' }, { value: 'board', icon: 'board', label: 'Board' }]} />
        <SegmentedControl aria-label="Large" size="lg" full options={[{ value: 'a', label: 'Left' }, { value: 'b', label: 'Center' }, { value: 'c', label: 'Right', disabled: true }]} />
      </Section>
      <Section title="Calendar">
        <div className="self-start rounded-n-lg shadow-[0_0_0_1px_var(--n-border-primary)]">
          <Calendar today={TODAY} defaultValue={new Date(2026, 9, 14)} min={new Date(2026, 9, 3)} />
        </div>
      </Section>
      <Section title="DatePicker / DateRangePicker">
        <Field label="Due date"><DatePicker value={date} onValueChange={setDate} today={TODAY} /></Field>
        <Field label="Period">
          <DateRangePicker value={period} onValueChange={setPeriod} today={TODAY} presets={[
            { label: 'Last 7 days', range: { from: new Date(2026, 9, 15), to: TODAY } },
            { label: 'This month', range: { from: new Date(2026, 9, 1), to: new Date(2026, 9, 31) } },
          ]} />
        </Field>
        <Field label="Invalid" error="Pick a date."><DatePicker today={TODAY} /></Field>
      </Section>
      <Section title="FileUpload">
        <Field label="Attachments"><FileUpload multiple accept=".pdf,image/*" maxSize={5 * 1024 * 1024} description="PDF or images, up to 5 MB" /></Field>
      </Section>
    </div>
  );
}
