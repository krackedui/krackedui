import { describe, expect, it, vi } from 'vitest';
import { Textarea } from '@system';
import { renderUI, screen } from './utils';

describe('Textarea', () => {
  it('is a multi-line textbox', async () => {
    const onChange = vi.fn();
    const { user } = renderUI(<Textarea aria-label="Notes" rows={4} onChange={onChange} />);
    const box = screen.getByRole('textbox', { name: 'Notes' });
    expect(box).toHaveAttribute('rows', '4');
    await user.type(box, 'a{Enter}b');
    expect(box).toHaveValue('a\nb');
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('exposes invalid, required, disabled and name', () => {
    renderUI(<Textarea aria-label="Notes" invalid required disabled name="notes" defaultValue="x" />);
    const box = screen.getByRole('textbox', { name: 'Notes' });
    expect(box).toBeInvalid();
    expect(box).toBeRequired();
    expect(box).toBeDisabled();
    expect(box).toHaveAttribute('name', 'notes');
  });
});
