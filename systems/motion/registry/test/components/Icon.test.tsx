import { describe, expect, it } from 'vitest';
import { semanticIconNames } from '../../../docs/semantic-icons';
import { Icon } from '@system';
import { renderUI, screen } from '../utils';

describe('Icon', () => {
  it('is decorative (hidden from assistive tech) without a label', () => {
    const { container } = renderUI(<Icon name="plus" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('is an image with an accessible name when labelled', () => {
    renderUI(<Icon name="warning" label="Warning" />);
    expect(screen.getByRole('img', { name: 'Warning' })).toBeInTheDocument();
  });

  it('renders every core icon name at the requested size', () => {
    const { container } = renderUI(<>{semanticIconNames.map((n) => <Icon key={n} name={n} size={18} />)}</>);
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(semanticIconNames.length);
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute('width', '18');
      expect(svg.innerHTML.length).toBeGreaterThan(0);
    });
  });
});
