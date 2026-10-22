import { describe, expect, it } from 'vitest';
import { Kbd } from '@system';
import { renderUI, screen } from './utils';

describe('Kbd', () => {
  it('renders the key text in a kbd element', () => {
    renderUI(<p>Press <Kbd>⌘K</Kbd> to search</p>);
    const key = screen.getByText('⌘K');
    expect(key.tagName).toBe('KBD');
  });
});
