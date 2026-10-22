import { describe, expect, it, vi } from 'vitest';
import { Button } from '@system';
import { renderUI, screen } from './utils';

describe('Button', () => {
  it('is a button named by its text, type="button" by default', () => {
    renderUI(<Button variant="primary" icon="plus">New page</Button>);
    const button = screen.getByRole('button', { name: 'New page' });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('activates with click, Enter and Space', async () => {
    const onClick = vi.fn();
    const { user } = renderUI(<Button onClick={onClick}>Save</Button>);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.tab();
    await user.tab({ shift: true });
    screen.getByRole('button', { name: 'Save' }).focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('is reachable with Tab', async () => {
    const { user } = renderUI(<Button>Save</Button>);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
  });

  it('does not fire when disabled', async () => {
    const onClick = vi.fn();
    const { user } = renderUI(<Button disabled onClick={onClick}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading: keeps the name, sets aria-busy and blocks clicks and submits', async () => {
    const onClick = vi.fn();
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    const { user } = renderUI(
      <form onSubmit={onSubmit}>
        <Button type="submit" loading onClick={onClick}>Save</Button>
      </form>,
    );
    const button = screen.getByRole('button', { name: /Save/ });
    expect(button).toHaveAttribute('aria-busy', 'true');
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits forms with type="submit"', async () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    const { user } = renderUI(<form onSubmit={onSubmit}><Button type="submit">Send</Button></form>);
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders as a link with asChild (no nested button)', () => {
    renderUI(<Button asChild variant="secondary"><a href="/settings">Settings</a></Button>);
    const link = screen.getByRole('link', { name: 'Settings' });
    expect(link).toHaveAttribute('href', '/settings');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
