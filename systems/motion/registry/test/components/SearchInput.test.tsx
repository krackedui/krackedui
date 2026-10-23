import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SearchInput } from '@system';
import { renderUI, screen } from '../utils';

describe('SearchInput', () => {
  it('is a searchbox; the clear button appears with text and clears it', async () => {
    const onClear = vi.fn();
    const { user } = renderUI(<SearchInput aria-label="Search pages" onClear={onClear} />);
    const box = screen.getByRole('searchbox', { name: 'Search pages' });
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    await user.type(box, 'road');
    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect(box).toHaveValue('');
    expect(box).toHaveFocus();
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('Escape clears the text', async () => {
    const { user } = renderUI(<SearchInput aria-label="Filter" defaultValue="abc" />);
    const box = screen.getByRole('searchbox', { name: 'Filter' });
    box.focus();
    await user.keyboard('{Escape}');
    expect(box).toHaveValue('');
  });

  it('controlled: onClear resets the value', async () => {
    function Controlled() {
      const [q, setQ] = useState('design');
      return <SearchInput aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} />;
    }
    const { user } = renderUI(<Controlled />);
    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('');
  });

  it('exposes invalid, required, disabled and name', () => {
    renderUI(<SearchInput aria-label="Search" invalid required disabled name="q" size="lg" />);
    const box = screen.getByRole('searchbox', { name: 'Search' });
    expect(box).toBeInvalid();
    expect(box).toBeRequired();
    expect(box).toBeDisabled();
    expect(box).toHaveAttribute('name', 'q');
  });
});
