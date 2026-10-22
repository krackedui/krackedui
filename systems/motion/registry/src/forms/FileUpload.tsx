import { forwardRef, useCallback, useEffect, useId, useRef, useState, type CSSProperties, type DragEvent, type ReactNode } from 'react';
import { tv } from '../lib/tv';
import { Icon } from '../icons/Icon';
import { useFieldControl } from './Field';
import { joinIds, useControllableState } from './internal';

/**
 * FileUpload: a dashed drop zone (border-primary, radius 8, bg-secondary-translucent on drag) with an upload
 * glyph, the label, a hint line and a secondary "Choose files" button; selected files listed below as rows
 * (file glyph, name, size, remove ×). Inferred from the menu row and button measurements; no capture exists.
 */
export const fileUploadVariants = tv({
  slots: {
    root: 'flex w-full min-w-0 flex-col gap-2',
    zone: [
      'flex w-full flex-col items-center justify-center gap-2 rounded-n-lg border border-dashed border-n-border-strong px-4 py-6 text-center',
      'transition-colors duration-[var(--ds-duration-fast)] motion-reduce:transition-none',
    ],
    glyph: 'flex size-8 items-center justify-center rounded-full bg-n-bg-tertiary-translucent-a text-n-icon-secondary',
    label: 'text-[14px] font-medium leading-5 text-n-text-primary',
    description: 'text-[12px] leading-4 text-n-text-secondary',
    button: [
      'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-n-md px-2 text-[14px] font-medium leading-5 text-n-text-primary outline-none',
      'shadow-[inset_0_0_0_1px_var(--n-border-primary)] hover:bg-n-button-hover-bg-a focus-visible:shadow-n-focus-shadow',
      'disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent pointer-coarse:h-9',
    ],
    input: 'sr-only',
    errors: 'flex flex-col gap-0.5 text-[12px] leading-4 text-n-red-text-secondary',
    list: 'flex flex-col gap-px',
    item: 'group/file flex h-9 min-w-0 items-center gap-2 rounded-n-md px-2 hover:bg-n-button-hover-bg-a',
    itemIcon: 'shrink-0 text-n-icon-secondary',
    itemName: 'min-w-0 flex-1 truncate text-[14px] leading-5 text-n-text-primary',
    itemSize: 'shrink-0 text-[12px] leading-4 text-n-text-secondary tabular-nums',
    remove: [
      'flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-n-sm text-n-icon-secondary outline-none',
      'hover:bg-n-button-hover-bg-a hover:text-n-icon-primary focus-visible:shadow-n-focus-shadow pointer-coarse:size-8',
    ],
  },
  variants: {
    dragging: { true: { zone: 'border-n-blue-border-accent-primary bg-n-blue-bg-secondary' } },
    invalid: { true: { zone: 'border-n-red-border-accent-primary' } },
    // Disabled: quieter zone and label, but text keeps AA contrast (the button itself dims to 50%).
    disabled: { true: { zone: 'border-n-border-primary bg-n-bg-secondary-translucent-a', glyph: 'opacity-50', label: 'text-n-text-secondary' } },
  },
});

export interface FileUploadProps {
  /** Accepted types, like the input attribute: ".pdf,image/*". */
  accept?: string;
  multiple?: boolean;
  /** Maximum size per file in bytes. Larger files are rejected with an error message. */
  maxSize?: number;
  /** Maximum number of files (with `multiple`). */
  maxFiles?: number;
  /** Controlled list of files. */
  files?: File[];
  defaultFiles?: File[];
  /** Called with the full list after files are added or removed. */
  onFilesChange?: (files: File[]) => void;
  /** Called with the files that were rejected, and why. */
  onReject?: (rejections: FileRejection[]) => void;
  /** Heading inside the drop zone (default "Drop files here"). */
  label?: ReactNode;
  /** Hint under the label, e.g. "PDF or PNG, up to 5 MB". */
  description?: ReactNode;
  /** Text of the file button (default "Choose files" / "Choose file"). */
  buttonLabel?: string;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  'aria-describedby'?: string;
}

export interface FileRejection { file: File; reason: 'type' | 'size' | 'count'; message: string }

/** "1.2 MB", "820 KB", "12 bytes". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} byte${bytes === 1 ? '' : 's'}`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let n = bytes / 1024;
  let u = 0;
  while (n >= 1024 && u < units.length - 1) { n /= 1024; u += 1; }
  return `${n >= 10 || Number.isInteger(n) ? Math.round(n) : n.toFixed(1)} ${units[u]}`;
}

/** Whether a file matches an `accept` string (extensions, exact MIME types, or "type/*"). */
export function acceptsFile(file: File, accept?: string): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return accept.split(',').map((a) => a.trim().toLowerCase()).filter(Boolean).some((a) => {
    if (a.startsWith('.')) return name.endsWith(a);
    if (a.endsWith('/*')) return type.startsWith(a.slice(0, -1));
    return type === a;
  });
}

const describeAccept = (accept: string) => accept.split(',').map((a) => a.trim()).filter(Boolean).join(', ');

/**
 * FileUpload: a drop zone plus a "Choose files" button (keyboard accessible) with type, size and count
 * validation and a removable file list. Use it for attachments and imports in forms.
 */
export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
  { accept, multiple = false, maxSize, maxFiles, files: filesProp, defaultFiles = [], onFilesChange, onReject, label = 'Drop files here', description,
    buttonLabel, invalid: invalidProp, disabled: disabledProp, required: requiredProp, name, id, className, style, 'aria-describedby': describedBy }, ref,
) {
  const field = useFieldControl();
  const invalid = invalidProp ?? field?.invalid ?? false;
  const disabled = disabledProp ?? field?.disabled ?? false;
  const required = requiredProp ?? field?.required ?? false;
  const [files, setFiles] = useControllableState<File[]>(filesProp, defaultFiles, onFilesChange);
  const [errors, setErrors] = useState<FileRejection[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const uid = useId();
  const labelId = `${uid}-label`;
  const descriptionId = `${uid}-description`;
  const errorsId = `${uid}-errors`;
  const s = fileUploadVariants({ dragging, invalid: invalid || errors.length > 0, disabled });

  // Keep the native input's FileList in sync so a surrounding <form> submits the listed files.
  const filesRef = useRef(files);
  filesRef.current = files;
  const syncInput = useCallback(() => {
    const input = inputRef.current;
    if (!input || !name || typeof DataTransfer === 'undefined') return;
    const dt = new DataTransfer();
    for (const f of filesRef.current) dt.items.add(f);
    input.files = dt.files;
  }, [name]);
  useEffect(syncInput, [files, syncInput]);

  const add = (incoming: File[]) => {
    if (disabled || !incoming.length) return;
    const rejected: FileRejection[] = [];
    const ok: File[] = [];
    for (const file of multiple ? incoming : incoming.slice(0, 1)) {
      if (!acceptsFile(file, accept)) rejected.push({ file, reason: 'type', message: `${file.name}: this file type isn’t accepted${accept ? ` (use ${describeAccept(accept)})` : ''}.` });
      else if (maxSize !== undefined && file.size > maxSize) rejected.push({ file, reason: 'size', message: `${file.name} is ${formatBytes(file.size)}; the limit is ${formatBytes(maxSize)}.` });
      else ok.push(file);
    }
    if (!multiple && incoming.length > 1) for (const file of incoming.slice(1)) rejected.push({ file, reason: 'count', message: `${file.name}: only one file can be added.` });
    let next = multiple ? [...files, ...ok] : ok.length ? ok : files;
    if (multiple && maxFiles !== undefined && next.length > maxFiles) {
      for (const file of next.slice(maxFiles)) rejected.push({ file, reason: 'count', message: `${file.name}: at most ${maxFiles} file${maxFiles === 1 ? '' : 's'} can be added.` });
      next = next.slice(0, maxFiles);
    }
    setErrors(rejected);
    if (rejected.length) onReject?.(rejected);
    if (ok.length) setFiles(next);
  };
  const remove = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    setErrors([]);
    buttonRef.current?.focus();
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    add(Array.from(e.dataTransfer?.files ?? []));
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !dragging) setDragging(true);
  };

  return (
    <div ref={ref} className={s.root({ className })} style={style}>
      <div
        className={s.zone()}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false); }}
        onDrop={onDrop}
      >
        <span className={s.glyph()} aria-hidden="true"><Icon name="arrowInCircleUp" size={20} /></span>
        <div className="flex flex-col gap-0.5">
          <span id={labelId} className={s.label()}>{label}</span>
          {description && <span id={descriptionId} className={s.description()}>{description}</span>}
        </div>
        <button
          ref={buttonRef}
          type="button"
          id={id ?? field?.controlId}
          disabled={disabled}
          className={s.button()}
          aria-labelledby={field ? joinIds(`${uid}-button`, field.labelId) : undefined}
          aria-describedby={joinIds(field?.descriptionId, description ? descriptionId : undefined, field?.invalid ? field.errorId : undefined, errors.length ? errorsId : undefined, describedBy)}
          onClick={() => inputRef.current?.click()}
        >
          <Icon name="paperClip" size={16} className="text-n-icon-secondary" />
          <span id={`${uid}-button`}>{buttonLabel ?? (multiple ? 'Choose files' : 'Choose file')}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          tabIndex={-1}
          aria-hidden="true"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          required={required && files.length === 0}
          name={name}
          className={s.input()}
          onChange={(e) => { add(Array.from(e.target.files ?? [])); e.target.value = ''; syncInput(); }}
        />
      </div>
      <div id={errorsId} role="alert" className={s.errors()}>
        {errors.map((r, i) => <p key={`${r.file.name}-${i}`}>{r.message}</p>)}
      </div>
      {files.length > 0 && (
        <ul aria-label={multiple ? 'Selected files' : 'Selected file'} className={s.list()}>
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}-${f.lastModified}-${i}`} className={s.item()}>
              <Icon name="pageEmpty" size={16} className={s.itemIcon()} />
              <span className={s.itemName()} title={f.name}>{f.name}</span>
              <span className={s.itemSize()}>{formatBytes(f.size)}</span>
              <button type="button" aria-label={`Remove ${f.name}`} className={s.remove()} onClick={() => remove(i)} disabled={disabled}>
                <Icon name="xMarkSmall" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
