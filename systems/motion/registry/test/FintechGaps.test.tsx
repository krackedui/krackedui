import { describe, expect, it, vi } from 'vitest';
import { AppFrame, LineChart, NumberInput, PageHeader, PageLayout, SegmentedControl, Sheet, ToastProvider, Topbar, useToast } from '@system';
import { renderUI, screen, waitFor } from './utils';

describe('PageLayout variant="app"', () => {
  it('renders a main landmark with a compact PageHeader (title, description, actions)', () => {
    renderUI(
      <PageLayout variant="app" header={<PageHeader title="Overview" description="All accounts" actions={<button type="button">Export</button>} />}>
        <p>Body</p>
      </PageLayout>,
    );
    const heading = screen.getByRole('heading', { level: 1, name: 'Overview' });
    expect(heading.className).toContain('text-[24px]');
    // the description sits with the title, before the actions
    const description = screen.getByText('All accounts');
    const action = screen.getByRole('button', { name: 'Export' });
    expect(description.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('main')).toContainElement(screen.getByText('Body'));
  });

  it('keeps the document title size outside the app variant', () => {
    renderUI(<PageLayout header={<PageHeader title="Notes" />}><p>Body</p></PageLayout>);
    expect(screen.getByRole('heading', { level: 1, name: 'Notes' }).className).toContain('sm:text-[40px]');
  });
});

describe('LineChart zeroBaseline', () => {
  const data = [{ day: 'Mon', balance: 412_000 }, { day: 'Tue', balance: 431_000 }, { day: 'Wed', balance: 455_000 }];
  const ticks = () => [...document.querySelectorAll('svg text')].map((t) => t.textContent);

  it('starts the value axis at zero by default', () => {
    renderUI(<LineChart label="Balance" data={data} index="day" series={[{ key: 'balance', label: 'Balance' }]} />);
    expect(ticks()).toContain('0');
  });

  it('hugs the data when zeroBaseline is false', () => {
    renderUI(<LineChart label="Balance" data={data} index="day" zeroBaseline={false} series={[{ key: 'balance', label: 'Balance' }]} />);
    expect(ticks()).not.toContain('0');
  });
});

describe('SegmentedControl widths', () => {
  it('sizes segments to their labels unless full', () => {
    const options = [{ value: '6', label: '6 months' }, { value: '12', label: '12 months' }];
    const { rerender } = renderUI(<SegmentedControl aria-label="Range" options={options} defaultValue="6" />);
    expect(screen.getByRole('radio', { name: '12 months' }).className).not.toMatch(/(^|\s)flex-1(\s|$)/);
    rerender(<SegmentedControl aria-label="Range" options={options} defaultValue="6" full />);
    expect(screen.getByRole('radio', { name: '12 months' }).className).toMatch(/(^|\s)flex-1(\s|$)/);
  });
});

describe('AppFrame stacking', () => {
  it('is its own stacking context so overlays portalled to <body> sit above the topbar and sidebar', () => {
    const { container } = renderUI(<AppFrame topbar={<Topbar />}><p>Page</p></AppFrame>);
    expect(container.querySelector('.motion-app-inner')?.className).toMatch(/(^|\s)isolate(\s|$)/);
  });
});

function SheetWithToast() {
  const { toast } = useToast();
  return (
    <Sheet.Root defaultOpen>
      <Sheet.Content>
        <Sheet.Title>Transaction</Sheet.Title>
        <button type="button" onClick={() => toast({ message: 'Saved', duration: 0 })}>Save</button>
      </Sheet.Content>
    </Sheet.Root>
  );
}

describe('Escape with a toast on screen', () => {
  it('still closes the open sheet (the toast layer no longer swallows it)', async () => {
    const { user } = renderUI(<ToastProvider><SheetWithToast /></ToastProvider>);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Saved')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('NumberInput replacing a fully selected value', () => {
  it('re-selects the edit text on focus, so typing replaces the amount instead of appending', async () => {
    const onValueChange = vi.fn();
    const { user } = renderUI(<NumberInput aria-label="Amount" defaultValue={999999} format={{ style: 'currency', currency: 'USD' }} onValueChange={onValueChange} />);
    const input = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Amount' });
    input.setSelectionRange(0, input.value.length); // what Tab focus does in browsers
    input.focus();
    await user.keyboard('1250.5');
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(1250.5);
  });
});
