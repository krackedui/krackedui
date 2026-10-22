/** KrackedUI wordmark: a cracked square (one shape, many looks) + the name. Decorative mark, text is the name. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-[-0.01em] ${className ?? ''}`}>
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" focusable="false">
        <rect x="1" y="1" width="20" height="20" rx="6" fill="var(--kui-ink)" />
        <path d="M11 4.5 9 9.5l3.2 2.2L10 17.5" fill="none" stroke="var(--kui-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>KrackedUI</span>
    </span>
  );
}
