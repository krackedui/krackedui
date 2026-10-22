import { describe, expect, it } from 'vitest';
import { Avatar } from '@system';
import { renderUI, screen } from './utils';

describe('Avatar', () => {
  it('is an image named after the person, with an initial fallback', () => {
    renderUI(<Avatar name="Ada Lovelace" size="lg" />);
    const img = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(img).toHaveTextContent('A');
  });

  it('accepts every contract size and a picture', () => {
    renderUI(<>{(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => <Avatar key={s} size={s} name={`User ${s}`} src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />)}</>);
    expect(screen.getAllByRole('img', { name: /User/ })).toHaveLength(5);
  });

  it('is decorative without a name', () => {
    renderUI(<Avatar />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
