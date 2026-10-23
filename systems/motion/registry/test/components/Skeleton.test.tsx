import { describe, expect, it } from 'vitest';
import { Skeleton } from '@system';
import { renderUI, screen } from '../utils';

describe('Skeleton', () => {
  it('is hidden from assistive technology', () => {
    renderUI(<Skeleton data-testid="block" width={120} height={16} radius="md" />);
    expect(screen.getByTestId('block')).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies width and height (numbers are px)', () => {
    renderUI(<Skeleton data-testid="block" width={120} height="2rem" />);
    expect(screen.getByTestId('block')).toHaveStyle({ width: '120px', height: '2rem' });
  });

  it('renders N text lines', () => {
    renderUI(<Skeleton data-testid="lines" lines={3} />);
    expect(screen.getByTestId('lines').children).toHaveLength(3);
  });
});
