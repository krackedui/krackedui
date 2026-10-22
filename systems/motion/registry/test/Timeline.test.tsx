import { describe, expect, it, vi } from 'vitest';
import { Timeline, type TimelineItem } from '@system';
import { renderUI, screen } from '../../../../standard/gate/tests/utils';

const d = (iso: string) => new Date(`${iso}T00:00:00`);
const items: TimelineItem[] = [
  { id: 'p', label: 'Website relaunch', start: d('2026-09-07'), end: d('2026-11-27'), group: true },
  { id: 't1', label: 'Design pricing page', meta: 'WEB-12', start: d('2026-10-06'), end: d('2026-10-24'), color: 'blue', description: 'In progress' },
];

describe('Timeline', () => {
  it('is a named scroll region with one labelled bar per item and a today marker', () => {
    renderUI(<Timeline items={items} today={d('2026-10-21')} label="Roadmap" />);
    expect(screen.getByRole('region', { name: 'Roadmap' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'WEB-12 Design pricing page: Oct 6 to Oct 24, In progress' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Website relaunch: Sep 7 to Nov 27/ })).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('Enter opens a bar', async () => {
    const onOpen = vi.fn();
    const { user } = renderUI(<Timeline items={items} today={d('2026-10-21')} onOpen={onOpen} />);
    screen.getByRole('button', { name: /Design pricing page/ }).focus();
    await user.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledWith(items[1]);
  });

  it('← / → move a bar by a day (Shift: a week), call onChange and announce; group rows do not move', async () => {
    const onChange = vi.fn();
    const { user } = renderUI(<Timeline items={items} today={d('2026-10-21')} onChange={onChange} />);
    const bar = screen.getByRole('button', { name: /Design pricing page/ });
    expect(bar).toHaveAccessibleDescription(/Left and right arrows move by a day/);
    bar.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith({ id: 't1', start: d('2026-10-07'), end: d('2026-10-25') });
    expect(screen.getByRole('status')).toHaveTextContent('Moved Design pricing page to Oct 7 – Oct 25.');
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    expect(onChange).toHaveBeenLastCalledWith({ id: 't1', start: d('2026-09-29'), end: d('2026-10-17') });
    onChange.mockClear();
    screen.getByRole('button', { name: /Website relaunch/ }).focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('without onChange bars are not movable', async () => {
    const { user } = renderUI(<Timeline items={items} today={d('2026-10-21')} />);
    const bar = screen.getByRole('button', { name: /Design pricing page/ });
    expect(bar).not.toHaveAttribute('aria-describedby');
    bar.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('status')).toHaveTextContent('');
  });
});
