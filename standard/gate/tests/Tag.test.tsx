import { describe, expect, it, vi } from 'vitest';
import { Tag } from '@system';
import { colors } from '../../contract/src/vocab';
import { renderUI, screen } from './utils';

describe('Tag', () => {
  it('renders in every contract color', () => {
    renderUI(<>{colors.map((c) => <Tag key={c} color={c}>{c}</Tag>)}</>);
    colors.forEach((c) => expect(screen.getByText(c)).toBeInTheDocument());
  });

  it('has no button unless removable', () => {
    renderUI(<Tag>Design</Tag>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('removable: a named remove button that works with mouse and keyboard', async () => {
    const onRemove = vi.fn();
    const { user } = renderUI(<Tag color="blue" size="sm" onRemove={onRemove}>Design</Tag>);
    const remove = screen.getByRole('button', { name: /remove/i });
    expect(remove).toHaveAccessibleName(/Design/);
    await user.click(remove);
    remove.focus();
    await user.keyboard('{Enter}');
    expect(onRemove).toHaveBeenCalledTimes(2);
  });
});
