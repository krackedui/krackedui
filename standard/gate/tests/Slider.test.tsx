import { describe, expect, it, vi } from 'vitest';
import { Field, Slider } from '@system';
import { renderUI, screen } from './utils';

describe('Slider', () => {
  it('renders a named slider with value semantics', () => {
    renderUI(<Slider label="Volume" defaultValue={[40]} min={0} max={100} />);
    const thumb = screen.getByRole('slider', { name: 'Volume' });
    expect(thumb).toHaveAttribute('aria-valuenow', '40');
    expect(thumb).toHaveAttribute('aria-valuemin', '0');
    expect(thumb).toHaveAttribute('aria-valuemax', '100');
  });

  it('moves with arrow keys, Page Up/Down and Home/End', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<Slider label="Volume" defaultValue={[40]} step={5} onValueChange={onValueChange} />);
    const thumb = screen.getByRole('slider', { name: 'Volume' });
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenLastCalledWith([45]);
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(onValueChange).toHaveBeenLastCalledWith([35]);
    await user.keyboard('{End}');
    expect(thumb).toHaveAttribute('aria-valuenow', '100');
    await user.keyboard('{Home}');
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
  });

  it('supports a range with two named thumbs', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<Slider label="Price" defaultValue={[20, 80]} onValueChange={onValueChange} />);
    const thumbs = screen.getAllByRole('slider');
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0]).toHaveAccessibleName(/Price/);
    expect(thumbs[1]).toHaveAccessibleName(/Price/);
    expect(thumbs[0]).not.toHaveAccessibleName(thumbs[1].getAttribute('aria-label') ?? '');
    thumbs[1].focus();
    await user.keyboard('{ArrowLeft}');
    expect(onValueChange).toHaveBeenLastCalledWith([20, 79]);
  });

  it('takes its name from a Field and respects controlled value and disabled', () => {
    renderUI(<Field label="Opacity" description="Percent."><Slider value={[30]} disabled /></Field>);
    const thumb = screen.getByRole('slider', { name: 'Opacity' });
    expect(thumb).toHaveAttribute('aria-valuenow', '30');
    expect(thumb).toHaveAccessibleDescription('Percent.');
    expect(thumb).toHaveAttribute('data-disabled');
  });
});
