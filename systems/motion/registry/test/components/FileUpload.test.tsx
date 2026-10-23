import { describe, expect, it, vi } from 'vitest';
import { FileUpload } from '@system';
import { fireEvent, renderUI, screen } from '../utils';

const file = (name: string, size: number, type: string) => {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
};
const fileInput = (container: HTMLElement) => container.querySelector<HTMLInputElement>('input[type="file"]')!;

describe('FileUpload', () => {
  it('has a keyboard-reachable file button', async () => {
    const { user } = renderUI(<FileUpload multiple />);
    await user.tab();
    expect(screen.getByRole('button', { name: /Choose files/ })).toHaveFocus();
  });

  it('adds chosen files to a list and calls onFilesChange', async () => {
    const onFilesChange = vi.fn();
    const { user, container } = renderUI(<FileUpload multiple onFilesChange={onFilesChange} />);
    const a = file('report.pdf', 2048, 'application/pdf');
    await user.upload(fileInput(container), a);
    expect(onFilesChange).toHaveBeenLastCalledWith([a]);
    expect(screen.getByRole('list', { name: 'Selected files' })).toHaveTextContent('report.pdf');
  });

  it('rejects wrong types and oversized files with a clear message', () => {
    const onFilesChange = vi.fn();
    const { container } = renderUI(<FileUpload multiple accept=".pdf,image/*" maxSize={1024 * 1024} onFilesChange={onFilesChange} />);
    const bad = file('virus.exe', 10, 'application/octet-stream');
    const big = file('photo.png', 5 * 1024 * 1024, 'image/png');
    const ok = file('scan.png', 1000, 'image/png');
    fireEvent.change(fileInput(container), { target: { files: [bad, big, ok] } });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/virus\.exe.*type/);
    expect(alert).toHaveTextContent(/photo\.png.*5 MB.*1 MB/);
    expect(onFilesChange).toHaveBeenLastCalledWith([ok]);
    expect(screen.getByRole('button', { name: /Choose files/ })).toHaveAccessibleDescription(/virus\.exe/);
  });

  it('accepts dropped files', () => {
    const onFilesChange = vi.fn();
    renderUI(<FileUpload onFilesChange={onFilesChange} label="Drop a CSV" />);
    const zone = screen.getByText('Drop a CSV').closest('div')!.parentElement!;
    const f = file('data.csv', 100, 'text/csv');
    fireEvent.drop(zone, { dataTransfer: { files: [f] } });
    expect(onFilesChange).toHaveBeenLastCalledWith([f]);
  });

  it('removes a file with its remove button', async () => {
    const a = file('a.txt', 1, 'text/plain');
    const b = file('b.txt', 1, 'text/plain');
    const onFilesChange = vi.fn();
    const { user } = renderUI(<FileUpload multiple defaultFiles={[a, b]} onFilesChange={onFilesChange} />);
    await user.click(screen.getByRole('button', { name: 'Remove a.txt' }));
    expect(onFilesChange).toHaveBeenLastCalledWith([b]);
    expect(screen.queryByText('a.txt')).not.toBeInTheDocument();
  });

  it('replaces the file when not multiple, and can be disabled', async () => {
    const onFilesChange = vi.fn();
    const { user, container } = renderUI(<FileUpload onFilesChange={onFilesChange} />);
    const a = file('a.txt', 1, 'text/plain');
    const b = file('b.txt', 1, 'text/plain');
    await user.upload(fileInput(container), a);
    await user.upload(fileInput(container), b);
    expect(onFilesChange).toHaveBeenLastCalledWith([b]);
    renderUI(<FileUpload disabled buttonLabel="Upload logo" />);
    expect(screen.getByRole('button', { name: 'Upload logo' })).toBeDisabled();
  });
});
