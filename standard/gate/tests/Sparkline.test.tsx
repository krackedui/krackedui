import { describe, expect, it } from 'vitest';
import { Sparkline } from '@system';
import { renderUI, screen } from './utils';

describe('Sparkline', () => {
  it('is an image named by its label and described by its values', () => {
    renderUI(<Sparkline label="Balance, last 6 weeks" data={[3, 5, 4, 8, 7, 9]} tone="success" width={96} height={24} />);
    const img = screen.getByRole('img', { name: 'Balance, last 6 weeks' });
    expect(img).toHaveAccessibleDescription(/3, 5, 4, 8, 7, 9/);
  });

  it('is not a tab stop (decorative inline trend)', async () => {
    const { user } = renderUI(<><Sparkline label="Trend" data={[1, 2]} /><button type="button">after</button></>);
    await user.tab();
    expect(screen.getByRole('button', { name: 'after' })).toHaveFocus();
  });
});
