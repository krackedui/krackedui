'use client';

import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon } from '../foundations/icon';
import { IconButton } from '../actions/actions';
import { useFieldControl } from './field';

export interface FileUploadProps {
  className?: string;
  style?: CSSProperties;
  id?: string;
  accept?: string;
  multiple?: boolean;
  /** Bytes. A larger file is rejected and the reason is shown rather than swallowed. */
  maxSize?: number;
  onFilesChange?: (files: File[]) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  invalid?: boolean;
}

const KB = 1024;
function size(bytes: number): string {
  if (bytes < KB) return `${bytes} B`;
  if (bytes < KB * KB) return `${Math.round(bytes / KB)} KB`;
  return `${(bytes / (KB * KB)).toFixed(1)} MB`;
}

/**
 * A drop zone that is also a button.
 *
 * Dragging is the shortcut, not the mechanism: the whole thing is a real `<input type="file">`
 * behind a label, so it works from the keyboard and with a screen reader, and the drop target is an
 * enhancement on top. Rejections are shown, never silent.
 */
export function FileUpload({
  className, style, id, accept, multiple, maxSize, onFilesChange, label = 'Add files',
  description, disabled, invalid,
}: FileUploadProps) {
  const field = useFieldControl();
  const uid = useId();
  const inputId = id ?? field?.controlId ?? uid;
  const errorId = `${uid}-error`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [over, setOver] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);

  const accepted = (incoming: File[]) => {
    const ok: File[] = [];
    const bad: string[] = [];
    for (const f of incoming) {
      if (maxSize && f.size > maxSize) bad.push(`${f.name} is ${size(f.size)}, over the ${size(maxSize)} limit`);
      else ok.push(f);
    }
    setRejected(bad);
    return ok;
  };

  const take = (incoming: File[]) => {
    const ok = accepted(incoming);
    const next = multiple ? [...files, ...ok] : ok.slice(0, 1);
    setFiles(next);
    onFilesChange?.(next);
  };

  const remove = (name: string) => {
    const next = files.filter((f) => f.name !== name);
    setFiles(next);
    onFilesChange?.(next);
  };

  return (
    <div className={cn('bay-upload', className)} style={style}>
      <div
        className="bay-upload__zone"
        data-over={over ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          setOver(false);
          take([...e.dataTransfer.files]);
        }}
      >
        <Icon name="upload" size={18} className="bay-upload__icon" />
        <label className="bay-upload__label" htmlFor={inputId}>
          {label}
        </label>
        {description && <span className="bay-upload__description">{description}</span>}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="bay-sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-invalid={invalid || field?.invalid || rejected.length > 0 || undefined}
          aria-describedby={[field?.describedBy, rejected.length ? errorId : null].filter(Boolean).join(' ') || undefined}
          onChange={(e) => {
            take([...(e.target.files ?? [])]);
            e.target.value = '';
          }}
        />
      </div>
      {rejected.length > 0 && (
        <ul id={errorId} className="bay-upload__errors">
          {rejected.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <ul className="bay-upload__files">
          {files.map((f) => (
            <li key={f.name} className="bay-upload__file">
              <Icon name="file" size={14} />
              <span className="bay-upload__fileName">{f.name}</span>
              <span className="bay-upload__fileSize">{size(f.size)}</span>
              <IconButton icon="close" label={`Remove ${f.name}`} size="sm" onClick={() => remove(f.name)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
