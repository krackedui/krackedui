import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Combobox, Field } from '@system';
import { renderUI, screen, within } from '../../../../standard/gate/tests/utils';

const labels = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'design', label: 'Design' },
  { value: 'docs', label: 'Docs', disabled: true },
];

function Controlled({ onChange }: { onChange?: (v: string[]) => void }) {
  const [value, setValue] = useState<string[]>(['bug']);
  return (
    <Field label="Labels">
      <Combobox multiple options={labels} value={value} onValueChange={(v) => { setValue(v); onChange?.(v); }} placeholder="Add labels" searchPlaceholder="Search labels" name="labels" />
    </Field>
  );
}

describe('Combobox (multiple)', () => {
  it('shows the selection on the trigger and describes it to assistive tech', () => {
    renderUI(<Controlled />);
    const trigger = screen.getByRole('button', { name: 'Labels' });
    expect(trigger).toHaveTextContent('Bug');
    expect(trigger).toHaveAccessibleDescription('Bug selected');
  });

  it('is a multiselectable listbox; Enter toggles the active option and keeps the list open', async () => {
    const onChange = vi.fn();
    const { user } = renderUI(<Controlled onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Labels' }));
    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    expect(within(listbox).getByRole('option', { name: 'Bug' })).toHaveAttribute('aria-selected', 'true');
    const search = screen.getByRole('combobox', { name: 'Search labels' });
    expect(search).toHaveFocus();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['bug', 'feature']);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(within(listbox).getByRole('option', { name: 'Feature' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowUp}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['feature']);
  });

  it('toggles on click, skips disabled options and filters by typing', async () => {
    const onChange = vi.fn();
    const { user } = renderUI(<Controlled onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Labels' }));
    await user.click(screen.getByRole('option', { name: 'Design' }));
    expect(onChange).toHaveBeenLastCalledWith(['bug', 'design']);
    await user.click(screen.getByRole('option', { name: 'Docs' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    await user.type(screen.getByRole('combobox', { name: 'Search labels' }), 'fea');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['bug', 'design', 'feature']);
  });

  it('removes the last value with Backspace in the empty search, and closes with Escape', async () => {
    const onChange = vi.fn();
    const { user } = renderUI(<Controlled onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: 'Labels' });
    await user.click(trigger);
    await user.keyboard('{Backspace}');
    expect(onChange).toHaveBeenLastCalledWith([]);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAccessibleDescription('None selected');
    expect(trigger).toHaveTextContent('Add labels');
  });

  it('submits one form value per selected option', () => {
    const { container } = renderUI(<Combobox multiple aria-label="Tags" options={labels} defaultValue={['bug', 'design']} name="tags" />);
    const inputs = [...container.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="tags"]')];
    expect(inputs.map((i) => i.value)).toEqual(['bug', 'design']);
  });

  it('works uncontrolled with defaultValue', async () => {
    const { user } = renderUI(<Combobox multiple aria-label="Tags" options={labels} defaultValue={['design']} />);
    const trigger = screen.getByRole('button', { name: 'Tags' });
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Bug' }));
    expect(trigger).toHaveAccessibleDescription('Design, Bug selected');
  });
});
