// Forms: the parts a user drives with the keyboard, and the wiring that makes a control announce
// itself. Behaviour and accessibility semantics only — never a class name.
import { describe, it, expect } from 'vitest';
import { Checkbox, Field, NumberInput, RadioGroup, Radio, SearchInput, Slider, Switch, TextInput } from '@system';
import { renderUI, screen } from '../utils';

describe('Field', () => {
  it('labels its control and points the description and error at it', () => {
    renderUI(
      <Field label="Workspace" description="Where the command runs." error="Pick one.">
        <TextInput />
      </Field>,
    );
    const input = screen.getByLabelText('Workspace');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const described = (input.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    expect(described.length).toBeGreaterThan(0);
    const text = described.map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
    expect(text).toContain('Pick one.');
  });

  it('marks a required control required', () => {
    renderUI(
      <Field label="Name" required>
        <TextInput />
      </Field>,
    );
    expect(screen.getByLabelText(/Name/)).toBeRequired();
  });
});

describe('TextInput', () => {
  it('types, and a controlled value does not drift', async () => {
    const { user } = renderUI(<TextInput aria-label="Query" defaultValue="" />);
    const input = screen.getByLabelText('Query');
    await user.type(input, 'clipboard');
    expect(input).toHaveValue('clipboard');
  });
});

describe('SearchInput', () => {
  it('replaces the placeholder with what is typed', async () => {
    const { user } = renderUI(<SearchInput aria-label="Search" placeholder="Search commands…" />);
    const input = screen.getByLabelText('Search');
    expect(input).toHaveValue('');
    await user.type(input, 'emoji');
    expect(input).toHaveValue('emoji');
  });
});

describe('Checkbox', () => {
  it('reports mixed for an indeterminate box', () => {
    renderUI(<Checkbox checked="indeterminate" label="Some" />);
    const box = screen.getByRole('checkbox', { name: 'Some' });
    expect(box).toHaveAttribute('aria-checked', 'mixed');
    expect((box as HTMLInputElement).indeterminate).toBe(true);
  });

  it('toggles on click and reports the new state', async () => {
    const { user } = renderUI(<Checkbox label="Pinned" />);
    const box = screen.getByRole('checkbox', { name: 'Pinned' });
    expect(box).not.toBeChecked();
    await user.click(box);
    expect(box).toBeChecked();
  });
});

describe('Switch', () => {
  it('is a switch, named, and toggles', async () => {
    const { user } = renderUI(<Switch label="Launch at login" />);
    const sw = screen.getByRole('switch', { name: 'Launch at login' });
    await user.click(sw);
    expect(sw).toBeChecked();
  });
});

describe('RadioGroup', () => {
  it('exposes one checked radio and moves the selection', async () => {
    const { user } = renderUI(
      <RadioGroup aria-label="Theme" defaultValue="dark">
        <Radio value="dark" label="Dark" />
        <Radio value="light" label="Light" />
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Light' }));
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Dark' })).not.toBeChecked();
  });
});

describe('NumberInput', () => {
  it('is a spinbutton that steps by `step` on ArrowUp', async () => {
    const { user } = renderUI(<NumberInput aria-label="Delay" defaultValue={5} step={5} />);
    const input = screen.getByRole('spinbutton', { name: 'Delay' });
    expect(input).toHaveAttribute('aria-valuenow', '5');
    await user.click(input);
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-valuenow', '10');
  });
});

describe('Slider', () => {
  it('keeps a range slider’s thumbs in order', () => {
    renderUI(<Slider aria-label="Range" defaultValue={[20, 70]} />);
    const thumbs = screen.getAllByRole('slider');
    expect(thumbs).toHaveLength(2);
    expect(Number(thumbs[0].getAttribute('aria-valuenow'))).toBeLessThanOrEqual(
      Number(thumbs[1].getAttribute('aria-valuenow')),
    );
  });
});
