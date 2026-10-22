import { describe, expect, it } from 'vitest';
import { Grid } from '@system';
import { renderUI, screen } from './utils';

describe('Grid', () => {
  it('renders every cell and passes props through', () => {
    renderUI(<Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} role="list" aria-label="Stats">{['a', 'b', 'c'].map((x) => <div role="listitem" key={x}>{x}</div>)}</Grid>);
    expect(screen.getByRole('list', { name: 'Stats' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('renders as the child element with asChild', () => {
    renderUI(<Grid asChild columns={3}><ul aria-label="Cards"><li>One</li></ul></Grid>);
    expect(screen.getByRole('list', { name: 'Cards' })).toBeInTheDocument();
  });
});
