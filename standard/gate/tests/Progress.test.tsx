import { describe, expect, it } from 'vitest';
import { Progress } from '@system';
import { renderUI, screen } from './utils';

describe('Progress', () => {
  it('is a progressbar named by its label with value, min and max', () => {
    renderUI(<Progress label="Budget used" value={62} />);
    const bar = screen.getByRole('progressbar', { name: 'Budget used' });
    expect(bar).toHaveAttribute('aria-valuenow', '62');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('supports a custom max and clamps out-of-range values', () => {
    renderUI(<Progress aria-label="Upload" value={150} max={120} tone="success" size="sm" />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveAttribute('aria-valuemax', '120');
    expect(bar).toHaveAttribute('aria-valuenow', '120');
  });

  it('tones render without changing semantics', () => {
    renderUI(<>{(['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const).map((t) => <Progress key={t} aria-label={t} value={40} tone={t} />)}</>);
    expect(screen.getAllByRole('progressbar')).toHaveLength(6);
  });
});
