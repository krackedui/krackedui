import { describe, expect, it } from 'vitest';
import { Spinner } from '@system';
import { renderUI, screen } from '../utils';

describe('Spinner', () => {
  it('is a status announced as "Loading" by default', () => {
    renderUI(<Spinner />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });

  it('announces a custom label at every size', () => {
    renderUI(<>{(['sm', 'md', 'lg'] as const).map((s) => <Spinner key={s} size={s} label={`Saving ${s}`} />)}</>);
    expect(screen.getAllByRole('status').map((n) => n.textContent)).toEqual(['Saving sm', 'Saving md', 'Saving lg']);
  });
});
