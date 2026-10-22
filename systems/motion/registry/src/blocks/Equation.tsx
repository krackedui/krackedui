import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Tiny TeX-ish renderer: ^{..}/_{..} → sup/sub, \frac{a}{b}, common Greek letters & symbols. */
export function renderTex(src: string): ReactNode[] {
  const sym: Record<string, string> = {
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', theta: 'θ', lambda: 'λ', mu: 'μ', pi: 'π', sigma: 'σ', phi: 'φ', omega: 'ω',
    Delta: 'Δ', Sigma: 'Σ', Omega: 'Ω', sum: '∑', int: '∫', infty: '∞', cdot: '·', times: '×', pm: '±', leq: '≤', geq: '≥', neq: '≠', to: '→', approx: '≈', sqrt: '√',
  };
  const out: ReactNode[] = [];
  let i = 0;
  let k = 0;
  const group = (): string => {
    if (src[i] === '{') {
      let depth = 1; let j = i + 1;
      while (j < src.length && depth) { if (src[j] === '{') depth++; else if (src[j] === '}') depth--; j++; }
      const g = src.slice(i + 1, j - 1); i = j; return g;
    }
    return src[i++] ?? '';
  };
  while (i < src.length) {
    const ch = src[i];
    if (ch === '^' || ch === '_') { i++; const g = group(); const Tag = ch === '^' ? 'sup' : 'sub'; out.push(<Tag key={k++}>{renderTex(g)}</Tag>); continue; }
    if (ch === '\\') {
      const m = /^\\([a-zA-Z]+)/.exec(src.slice(i));
      if (m) {
        i += m[0].length;
        if (m[1] === 'frac') {
          const a = group(); const b = group();
          out.push(
            <span key={k++} className="mx-0.5 inline-flex flex-col items-center align-middle text-[0.85em] leading-[1.1]">
              <span className="border-b border-current px-0.5">{renderTex(a)}</span><span className="px-0.5">{renderTex(b)}</span>
            </span>,
          );
        } else {
          const greek = /^[a-z]+$/.test(m[1]) && !['sum', 'int', 'infty', 'cdot', 'times', 'pm', 'leq', 'geq', 'neq', 'to', 'approx', 'sqrt'].includes(m[1]);
          out.push(<span key={k++} className={greek ? undefined : 'not-italic'}>{sym[m[1]] ?? m[1]}</span>);
        }
        continue;
      }
    }
    if (/[0-9=+\-()[\]]/.test(ch)) { out.push(<span key={k++} className="not-italic">{ch === '-' ? '−' : ch}</span>); i++; continue; }
    out.push(ch); i++;
  }
  return out;
}

export interface EquationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** TeX source. */
  expression?: string;
  /** Editor slot shown under the rendering while editing. */
  editor?: ReactNode;
  /** Makes the rendering a button that opens the TeX input (editor). */
  onEdit?: () => void;
}

/**
 * Block equation (display math): centered, padding 8, KaTeX-like serif ~1.21em.
 * Rendering is a lightweight approximation (no KaTeX dependency).
 */
export const Equation = forwardRef<HTMLDivElement, EquationProps>(function Equation({ expression = '', editor, onEdit, className, ...props }, ref) {
  const rendering = expression ? (
    <span className="font-serif text-[1.21em] italic leading-[1.6]">{renderTex(expression)}</span>
  ) : (
    <span className="flex items-center gap-2 text-n-text-tertiary"><span className="font-serif text-[1.2em]">√x</span>Add a TeX equation</span>
  );
  const surface = 'flex w-full justify-center rounded-n-sm px-2 py-1';
  return (
    <div ref={ref} className={cn('w-full p-2', className)} {...props}>
      {onEdit ? (
        <button type="button" contentEditable={false} onClick={onEdit} aria-label={expression ? `Edit equation ${expression}` : 'Add a TeX equation'}
          className={cn(surface, 'cursor-pointer text-inherit hover:bg-n-bg-interactive-translucent-a')}>
          {rendering}
        </button>
      ) : (
        <div className={surface} contentEditable={false}>{rendering}</div>
      )}
      {editor}
    </div>
  );
});
