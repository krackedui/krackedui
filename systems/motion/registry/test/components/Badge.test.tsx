import { describe, expect, it } from 'vitest';
import { Badge } from '@system';
import { renderUI, screen } from '../utils';

describe('Badge', () => {
  it('renders its text for every tone and variant without adding controls', () => {
    const tones = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const;
    const variants = ['soft', 'solid', 'outline'] as const;
    renderUI(<>{tones.flatMap((t) => variants.map((v) => <Badge key={t + v} tone={t} variant={v}>{`${t}-${v}`}</Badge>))}</>);
    for (const t of tones) for (const v of variants) expect(screen.getByText(`${t}-${v}`)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('passes props through', () => {
    renderUI(<Badge id="b" aria-label="3 unread" variant="solid" tone="danger">3</Badge>);
    expect(screen.getByLabelText('3 unread')).toHaveAttribute('id', 'b');
  });
});
