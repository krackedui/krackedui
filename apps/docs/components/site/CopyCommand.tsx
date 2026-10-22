'use client';
import { useState } from 'react';

/** A terminal command with a copy button. */
export function CopyCommand({ command, className }: { command: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: the command is still selectable */
    }
  };
  return (
    <div className={`flex min-w-0 items-center gap-3 rounded-xl border border-[var(--kui-border)] bg-[var(--kui-code-bg)] py-2 pl-4 pr-2 text-[var(--kui-code-text)] ${className ?? ''}`}>
      <span aria-hidden="true" className="kui-code select-none text-[var(--kui-accent)]">$</span>
      <code tabIndex={0} aria-label={`Command: ${command}`} className="kui-code min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-[13px] leading-6 [scrollbar-width:none]">{command}</code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[var(--kui-code-text)] transition-colors hover:bg-white/10"
      >
        {copied ? 'Copied' : 'Copy'}
        <span className="sr-only"> command</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">{copied ? 'Command copied' : ''}</span>
    </div>
  );
}
