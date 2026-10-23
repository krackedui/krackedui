import { describe, expect, it } from 'vitest';
import { Divider } from '@system';
import { renderUI, screen } from '../utils';

describe('Divider', () => {
  it('is a horizontal separator by default', () => {
    renderUI(<Divider />);
    const sep = screen.getByRole('separator');
    expect(sep.getAttribute('aria-orientation') ?? 'horizontal').toBe('horizontal');
  });

  it('exposes a vertical orientation', () => {
    renderUI(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });
});
