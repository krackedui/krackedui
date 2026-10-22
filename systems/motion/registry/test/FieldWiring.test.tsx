import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import {
  Calendar, Checkbox, Combobox, DatePicker, DateRangePicker, Field, FileUpload, Menu, NumberInput, Radio, RadioGroup, SearchInput,
  SegmentedControl, Select, Slider, Switch, Textarea, TextInput,
} from '@system';
import { renderUI, screen } from '../../../../standard/gate/tests/utils';

afterEach(() => vi.restoreAllMocks());

describe('Field (Motion wiring)', () => {
  it('labels a native input inside a wrapper and links the description and error', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    renderUI(
      <Field label="Email" description="We never share it." error="Enter an email.">
        <div className="flex gap-2"><input type="email" id="email-input" /></div>
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAccessibleDescription(/We never share it\..*Enter an email\./);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(warn).not.toHaveBeenCalled();
  });

  it('labels a native input without an id inside a wrapper', () => {
    renderUI(<Field label="Nickname"><span><input /></span></Field>);
    expect(screen.getByRole('textbox', { name: 'Nickname' })).toBeInTheDocument();
  });

  it('wires a Motion control inside a wrapper or a fragment without duplicating its id', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { container } = renderUI(
      <>
        <Field label="Name"><div className="flex"><TextInput /></div></Field>
        <Field label="Plan"><><Select options={[{ value: 'free', label: 'Free' }]} /></></Field>
      </>,
    );
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(container.querySelectorAll(`[id="${input.id}"]`)).toHaveLength(1);
    expect(screen.getByRole('combobox', { name: 'Plan' })).toBeInTheDocument();
    expect(error).not.toHaveBeenCalled();
  });

  it('warns in development when there is no control to label, naming what works', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    renderUI(<Field label="Mystery value"><span>Just text</span></Field>);
    expect(warn).toHaveBeenCalledTimes(1);
    const message = String(warn.mock.calls[0][0]);
    expect(message).toContain('<Field label="Mystery value">');
    expect(message).toMatch(/TextInput.*Select.*Combobox/);
    expect(message).toContain('htmlFor');
  });

  it('warns when it labels a menu button and points to Select / Combobox', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    renderUI(
      <Field label="Status picker">
        <Menu.Root>
          <Menu.Trigger>Choose</Menu.Trigger>
          <Menu.Content><Menu.Item>Done</Menu.Item></Menu.Content>
        </Menu.Root>
      </Field>,
    );
    expect(warn.mock.calls.some((c) => /menu button.*Select or Combobox/.test(String(c[0])))).toBe(true);
  });

  const opts = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }];
  const controls: [string, ReactElement][] = [
    ['TextInput', <TextInput key="x" />], ['Textarea', <Textarea key="x" />], ['SearchInput', <SearchInput key="x" />],
    ['NumberInput', <NumberInput key="x" />], ['Select', <Select key="x" options={opts} />], ['Combobox', <Combobox key="x" options={opts} />],
    ['Checkbox', <Checkbox key="x" />], ['Switch', <Switch key="x" />],
    ['RadioGroup', <RadioGroup key="x"><Radio value="a" label="A" /><Radio value="b" label="B" /></RadioGroup>],
    ['Slider', <Slider key="x" defaultValue={[10]} />], ['SegmentedControl', <SegmentedControl key="x" options={opts} />],
    ['Calendar', <Calendar key="x" />], ['DatePicker', <DatePicker key="x" />], ['DateRangePicker', <DateRangePicker key="x" />],
    ['FileUpload', <FileUpload key="x" />],
  ];
  it.each(controls)('wires %s without a warning, also inside a wrapper', (name, control) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    renderUI(<><Field label={`${name} direct`}>{control}</Field><Field label={`${name} wrapped`}><div>{control}</div></Field></>);
    expect(warn).not.toHaveBeenCalled();
    for (const which of ['direct', 'wrapped']) expect(screen.getAllByLabelText(`${name} ${which}`).length).toBeGreaterThan(0);
  });
});
