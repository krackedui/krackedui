import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Radio, RadioGroup } from '@system';
import { renderUI, screen } from '../utils';

function Plans(props: Partial<Parameters<typeof RadioGroup>[0]>) {
  return (
    <RadioGroup aria-label="Plan" {...props}>
      <Radio value="free" label="Free" />
      <Radio value="pro" label="Pro" />
      <Radio value="team" label="Team" disabled />
      <Radio value="ent" label="Enterprise" />
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('is a radiogroup of radios; one Tab stop on the selected radio', async () => {
    const { user } = renderUI(<><Plans defaultValue="pro" /><button type="button">After</button></>);
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Pro' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('arrow keys move and select, skipping disabled options', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<Plans defaultValue="pro" onValueChange={onValueChange} />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Enterprise' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Enterprise' })).toBeChecked();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith('pro');
  });

  it('is controlled with value + onValueChange', async () => {
    function Controlled() {
      const [v, setV] = useState('free');
      return <><Plans value={v} onValueChange={setV} /><output>{v}</output></>;
    }
    const { user } = renderUI(<Controlled />);
    await user.click(screen.getByText('Enterprise'));
    expect(screen.getByRole('status')).toHaveTextContent('ent');
    expect(screen.getByRole('radio', { name: 'Enterprise' })).toBeChecked();
  });

  it('accepts orientation and disables every radio with disabled', () => {
    renderUI(<Plans orientation="horizontal" disabled name="plan" />);
    screen.getAllByRole('radio').forEach((r) => expect(r).toBeDisabled());
  });
});

describe('Radio', () => {
  it('is named by its label and selects on click and Space', async () => {
    const { user } = renderUI(<Plans />);
    await user.click(screen.getByRole('radio', { name: 'Free' }));
    expect(screen.getByRole('radio', { name: 'Free' })).toBeChecked();
    screen.getByRole('radio', { name: 'Pro' }).focus();
    await user.keyboard(' ');
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Free' })).not.toBeChecked();
  });

  it('a disabled radio cannot be selected', async () => {
    const { user } = renderUI(<Plans />);
    await user.click(screen.getByRole('radio', { name: 'Team' }));
    expect(screen.getByRole('radio', { name: 'Team' })).not.toBeChecked();
  });
});
