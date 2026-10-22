import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { SegmentedControl } from '@system';
import { renderUI, screen } from './utils';

const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

describe('SegmentedControl', () => {
  it('is a radio group with one checked option', () => {
    renderUI(<SegmentedControl aria-label="Range" options={options} defaultValue="week" />);
    expect(screen.getByRole('radiogroup', { name: 'Range' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Week' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Day' })).not.toBeChecked();
  });

  it('Tab focuses the checked option; arrows move and select (wrapping)', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<SegmentedControl aria-label="Range" options={options} defaultValue="week" onValueChange={onValueChange} />);
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Month' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Month' })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith('month');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Day' })).toBeChecked();
    await user.keyboard('{ArrowLeft}');
    expect(onValueChange).toHaveBeenLastCalledWith('month');
  });

  it('selects on click and supports controlled value', async () => {
    function Demo() {
      const [v, setV] = useState('day');
      return (
        <>
          <SegmentedControl aria-label="Range" options={options} value={v} onValueChange={setV} />
          <output data-testid="out">{v}</output>
        </>
      );
    }
    const { user } = renderUI(<Demo />);
    await user.click(screen.getByRole('radio', { name: 'Month' }));
    expect(screen.getByTestId('out')).toHaveTextContent('month');
    expect(screen.getByRole('radio', { name: 'Month' })).toBeChecked();
  });

  it('skips disabled options', async () => {
    const { user } = renderUI(
      <SegmentedControl aria-label="Range" defaultValue="day" options={[options[0], { ...options[1], disabled: true }, options[2]]} />,
    );
    expect(screen.getByRole('radio', { name: 'Week' })).toBeDisabled();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Month' })).toBeChecked();
  });
});
