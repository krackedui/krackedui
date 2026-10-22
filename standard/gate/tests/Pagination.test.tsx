import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { Pagination } from '@system';
import { renderUI, screen, within } from './utils';

function Controlled({ initial = 1, pageCount = 10, onChange }: { initial?: number; pageCount?: number; onChange?: (p: number) => void }) {
  const [page, setPage] = useState(initial);
  return <Pagination page={page} pageCount={pageCount} onPageChange={(p) => { setPage(p); onChange?.(p); }} />;
}

describe('Pagination', () => {
  it('is a navigation landmark with a label and marks the current page', () => {
    renderUI(<Controlled initial={3} />);
    const nav = screen.getByRole('navigation', { name: /pagination/i });
    const current = within(nav).getByRole('button', { name: /page 3$/i });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getAllByRole('button').filter((b) => b.getAttribute('aria-current') === 'page')).toHaveLength(1);
  });

  it('shows the first and last page with ellipses for long ranges', () => {
    renderUI(<Controlled initial={5} pageCount={20} />);
    const nav = screen.getByRole('navigation');
    expect(within(nav).getByRole('button', { name: /page 1$/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /page 20$/i })).toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /page 10$/i })).toBeNull();
    expect(nav).toHaveTextContent('…');
  });

  it('previous / next move by one page and are disabled at the ends', async () => {
    const onChange = vi.fn();
    const { user } = renderUI(<Controlled initial={1} pageCount={3} onChange={onChange} />);
    const prev = screen.getByRole('button', { name: /previous/i });
    const next = screen.getByRole('button', { name: /next/i });
    expect(prev).toBeDisabled();
    await user.click(next);
    expect(onChange).toHaveBeenLastCalledWith(2);
    expect(screen.getByRole('button', { name: /page 2$/i })).toHaveAttribute('aria-current', 'page');
    await user.click(next);
    expect(next).toBeDisabled();
    expect(prev).toBeEnabled();
  });

  it('page buttons work from the keyboard', async () => {
    const onChange = vi.fn();
    const { user } = renderUI(<Controlled initial={1} pageCount={5} onChange={onChange} />);
    screen.getByRole('button', { name: /page 4$/i }).focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(4);
    expect(screen.getByRole('button', { name: /page 4$/i })).toHaveAttribute('aria-current', 'page');
  });
});
