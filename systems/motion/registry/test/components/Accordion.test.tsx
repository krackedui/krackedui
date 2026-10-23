import { describe, expect, it, vi } from 'vitest';
import { Accordion } from '@system';
import { renderUI, screen } from '../utils';

function Faq(props: { type?: 'single' | 'multiple'; onValueChange?: (v: string | string[]) => void; defaultValue?: string }) {
  const items = (
    <>
      <Accordion.Item value="fees"><Accordion.Trigger>What are the fees?</Accordion.Trigger><Accordion.Content>No monthly fees.</Accordion.Content></Accordion.Item>
      <Accordion.Item value="limits"><Accordion.Trigger>What are the limits?</Accordion.Trigger><Accordion.Content>$10,000 per day.</Accordion.Content></Accordion.Item>
      <Accordion.Item value="closed" disabled><Accordion.Trigger>Closed accounts</Accordion.Trigger><Accordion.Content>Contact support.</Accordion.Content></Accordion.Item>
      <Accordion.Item value="cards"><Accordion.Trigger>Virtual cards</Accordion.Trigger><Accordion.Content>Unlimited.</Accordion.Content></Accordion.Item>
    </>
  );
  return props.type === 'multiple'
    ? <Accordion.Root type="multiple" onValueChange={props.onValueChange}>{items}</Accordion.Root>
    : <Accordion.Root type="single" collapsible defaultValue={props.defaultValue} onValueChange={props.onValueChange}>{items}</Accordion.Root>;
}

describe('Accordion', () => {
  it('triggers are buttons inside headings with aria-expanded and aria-controls', () => {
    renderUI(<Faq defaultValue="fees" />);
    const fees = screen.getByRole('button', { name: 'What are the fees?' });
    expect(fees.closest('[role="heading"], h1, h2, h3, h4, h5, h6')).not.toBeNull();
    expect(fees).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'What are the limits?' })).toHaveAttribute('aria-expanded', 'false');
    const panel = document.getElementById(fees.getAttribute('aria-controls') ?? '');
    expect(panel).toHaveTextContent('No monthly fees.');
    expect(screen.getByRole('region', { name: 'What are the fees?' })).toBeInTheDocument();
  });

  it('Enter / Space toggle; single mode closes the other item', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<Faq defaultValue="fees" onValueChange={onValueChange} />);
    const limits = screen.getByRole('button', { name: 'What are the limits?' });
    limits.focus();
    await user.keyboard('{Enter}');
    expect(limits).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'What are the fees?' })).toHaveAttribute('aria-expanded', 'false');
    expect(onValueChange).toHaveBeenLastCalledWith('limits');
    await user.keyboard(' ');
    expect(limits).toHaveAttribute('aria-expanded', 'false');
    expect(onValueChange).toHaveBeenLastCalledWith('');
  });

  it('arrow keys, Home and End move focus between triggers, skipping disabled ones', async () => {
    const { user } = renderUI(<Faq />);
    const [fees, limits, closed, cards] = screen.getAllByRole('button');
    expect(closed).toBeDisabled();
    fees?.focus();
    await user.keyboard('{ArrowDown}');
    expect(limits).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(cards).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(limits).toHaveFocus();
    await user.keyboard('{End}');
    expect(cards).toHaveFocus();
    await user.keyboard('{Home}');
    expect(fees).toHaveFocus();
  });

  it('multiple mode keeps several items open', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<Faq type="multiple" onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: 'What are the fees?' }));
    await user.click(screen.getByRole('button', { name: 'What are the limits?' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['fees', 'limits']);
    expect(screen.getByRole('button', { name: 'What are the fees?' })).toHaveAttribute('aria-expanded', 'true');
  });
});
