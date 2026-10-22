import type { CSSProperties } from 'react';
import { cn } from '../lib/cn';
import { colorClass } from './colors';
import type { Mention, RichText as RichTextValue, TextMarks, TextSpan } from './types';

/*
 * Inline formatting, measured in page-content (the sandbox paragraph):
 * - bold: weight 600; italic; strike: line-through
 * - underline: thickness .05em, offset 10%, color inherit
 * - inline code: mono, 85%, line-height normal, padding .2em .4em, radius 4, bottom .065em,
 *   bg bg-interactive-translucent-a, color red-text-secondary
 * - link: color inherit, inner span underline .05em in opaque-link-decoration-color-a, opacity .7
 */
export const inlineCodeClass =
  'relative bottom-[0.065em] rounded-n-sm bg-n-bg-interactive-translucent-a px-[0.4em] py-[0.2em] font-mono text-[85%] leading-normal text-[var(--n-palette-red-600)] dark:text-n-red-icon-secondary'; // AA on the tint (capture: red-text-secondary, 4.2:1)
const linkInnerStyle: CSSProperties = {
  textDecorationLine: 'underline',
  textDecorationThickness: '0.05em',
  textDecorationColor: 'var(--n-opaque-link-decoration-color-a)',
  textUnderlineOffset: '10%',
  opacity: 0.7,
};

function markClass(m: TextMarks = {}): string {
  return cn(m.bold && 'font-semibold', m.italic && 'italic', m.equation && 'px-0.5 font-serif italic', colorClass(m.color), m.color?.endsWith('_background') && 'rounded-[3px]');
}
function markStyle(m: TextMarks = {}): CSSProperties | undefined {
  const lines = [m.underline && 'underline', m.strike && 'line-through'].filter(Boolean);
  if (!lines.length) return undefined;
  return { textDecorationLine: lines.join(' '), textDecorationThickness: m.underline ? '0.05em' : undefined, textUnderlineOffset: m.underline ? '10%' : undefined };
}

const mentionClass = {
  page: 'cursor-pointer font-medium',
  user: 'text-n-text-secondary',
  date: 'text-n-text-secondary',
};

/** One mention token: page (icon + underlined title), user (@Name) or date (@Date). */
export function MentionToken({ mention }: { mention: Mention }) {
  if (mention.kind === 'page') {
    return (
      <span className={mentionClass.page} contentEditable={false} data-mention={JSON.stringify(mention)}>
        <span className="mr-[0.15em] font-normal">{mention.icon ?? '📄'}</span>
        <span className="border-b border-n-border-primary-translucent-a">{mention.label}</span>
      </span>
    );
  }
  return (
    <span className={mentionClass[mention.kind]} contentEditable={false} data-mention={JSON.stringify(mention)}>
      <span className="opacity-60">@</span>{mention.label}
    </span>
  );
}

/** Emoji runs get the emoji font span (`white-space:nowrap; font-family: Apple Color Emoji…`), which also sets the taller emoji line box (41px text block). */
const EMOJI_RE = /(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*\uFE0F?)/u;
export const emojiFont = '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
function withEmoji(text: string) {
  if (!EMOJI_RE.test(text)) return text;
  return text.split(EMOJI_RE).map((part, i) => (i % 2 ? <span key={i} className="whitespace-nowrap" style={{ fontFamily: emojiFont }}>{part}</span> : part));
}
function emojiHtml(text: string) {
  return text.split(EMOJI_RE).map((part, i) => (i % 2 ? `<span class="whitespace-nowrap" style="font-family:${esc(emojiFont)}">${esc(part)}</span>` : esc(part))).join('');
}

function Span({ span }: { span: TextSpan }) {
  if (span.mention) return <MentionToken mention={span.mention} />;
  const m = span.marks ?? {};
  let node = (
    <span className={cn(markClass(m), m.code && inlineCodeClass) || undefined} style={markStyle(m)} spellCheck={m.code ? false : undefined}>
      {withEmoji(span.text)}
    </span>
  );
  if (m.link) {
    node = (
      <a href={m.link} className="cursor-pointer text-inherit no-underline" rel="noopener noreferrer">
        <span style={linkInnerStyle}>{node}</span>
      </a>
    );
  }
  return node;
}

export interface RichTextProps {
  value?: RichTextValue;
}
/** Renders rich text (marks, links, inline code, colors, mentions). */
export function RichTextView({ value }: RichTextProps) {
  return <>{(value ?? []).map((s, i) => <Span key={i} span={s} />)}</>;
}

/* ---------- HTML serialization for contenteditable leaves (used by the editor) ---------- */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const styleStr = (s?: CSSProperties) =>
  s ? Object.entries(s).filter(([, v]) => v !== undefined).map(([k, v]) => `${k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}:${v}`).join(';') : '';

/** Serialize rich text to HTML with `data-m` (marks JSON) on every run, so it can be parsed back. */
export function richTextToHtml(value?: RichTextValue): string {
  return (value ?? [])
    .map((span) => {
      if (span.mention) {
        const m = span.mention;
        const inner = m.kind === 'page'
          ? `<span class="mr-[0.15em] font-normal">${esc(m.icon ?? '📄')}</span><span class="border-b border-n-border-primary-translucent-a">${esc(m.label)}</span>`
          : `<span class="opacity-60">@</span>${esc(m.label)}`;
        return `<span contenteditable="false" class="${mentionClass[m.kind]}" data-mention="${esc(JSON.stringify(m))}">${inner}</span>`;
      }
      const m = span.marks ?? {};
      const cls = cn(markClass(m), m.code && inlineCodeClass);
      const st = styleStr(m.link ? { ...markStyle(m), ...linkInnerStyle } : markStyle(m));
      const data = Object.keys(m).length ? ` data-m="${esc(JSON.stringify(m))}"` : '';
      return `<span${data}${cls ? ` class="${cls}"` : ''}${st ? ` style="${st}"` : ''}>${emojiHtml(span.text)}</span>`;
    })
    .join('');
}

const sameMarks = (a?: TextMarks, b?: TextMarks) => JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});

/** Merge adjacent runs with identical marks and drop empty runs. */
export function normalizeRichText(value: RichTextValue): RichTextValue {
  const out: RichTextValue = [];
  for (const s of value) {
    if (!s.mention && !s.text) continue;
    const last = out[out.length - 1];
    if (last && !last.mention && !s.mention && sameMarks(last.marks, s.marks)) last.text += s.text;
    else out.push(s.marks && Object.keys(s.marks).length ? { ...s, marks: { ...s.marks } } : { text: s.text, ...(s.mention ? { mention: s.mention } : {}) });
  }
  return out;
}

/** Read a `data-mention` attribute back into a Mention (null when it is not one). */
function readMention(raw: string): Mention | null {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return null; }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const { kind, label, icon } = parsed as Record<string, unknown>;
  if ((kind !== 'page' && kind !== 'user' && kind !== 'date') || typeof label !== 'string') return null;
  return typeof icon === 'string' ? { kind, label, icon } : { kind, label };
}

/** Parse a contenteditable leaf back into rich text (reads `data-m` / `data-mention`). */
export function parseRichTextDom(root: HTMLElement): RichTextValue {
  const out: RichTextValue = [];
  const walk = (node: Node, marks: TextMarks | undefined) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = (node.textContent ?? '').replace(/\u200B/g, '');
      if (t) out.push(marks ? { text: t, marks } : { text: t });
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    const mention = node.dataset.mention ? readMention(node.dataset.mention) : null;
    if (mention) {
      out.push({ text: node.textContent ?? '', mention });
      return;
    }
    if (node.tagName === 'BR') {
      if (node !== root.lastChild) out.push(marks ? { text: '\n', marks } : { text: '\n' });
      return;
    }
    const own = node.dataset.m ? (JSON.parse(node.dataset.m) as TextMarks) : undefined;
    const next = own ? { ...(marks ?? {}), ...own } : marks;
    const isBlockEl = node !== root && (node.tagName === 'DIV' || node.tagName === 'P');
    if (isBlockEl && out.length && !out[out.length - 1].text.endsWith('\n')) out.push({ text: '\n' });
    node.childNodes.forEach((c) => walk(c, next));
  };
  root.childNodes.forEach((c) => walk(c, undefined));
  return normalizeRichText(out);
}

/* ---------- rich text operations (offset based) ---------- */

/** Split rich text at a character offset. */
export function splitRichText(value: RichTextValue, offset: number): [RichTextValue, RichTextValue] {
  const a: RichTextValue = [];
  const b: RichTextValue = [];
  let pos = 0;
  for (const s of value) {
    const end = pos + s.text.length;
    if (end <= offset) a.push(s);
    else if (pos >= offset) b.push(s);
    else if (s.mention) b.push(s);
    else {
      a.push({ ...s, text: s.text.slice(0, offset - pos) });
      b.push({ ...s, text: s.text.slice(offset - pos) });
    }
    pos = end;
  }
  return [normalizeRichText(a), normalizeRichText(b)];
}

/** Remove characters [from, to). */
export function deleteRange(value: RichTextValue, from: number, to: number): RichTextValue {
  const [a] = splitRichText(value, from);
  const [, c] = splitRichText(value, to);
  return normalizeRichText([...a, ...c]);
}

/** Apply a mark change over [from, to). `patch` keys set to undefined remove the mark. */
export function applyMarks(value: RichTextValue, from: number, to: number, patch: Partial<TextMarks>): RichTextValue {
  const [a, rest] = splitRichText(value, from);
  const [b, c] = splitRichText(rest, to - from);
  const mid = b.map((s) => {
    if (s.mention) return s;
    const marks: TextMarks = { ...(s.marks ?? {}), ...patch };
    (Object.keys(marks) as (keyof TextMarks)[]).forEach((k) => (marks[k] === undefined || marks[k] === false) && delete marks[k]);
    return { text: s.text, ...(Object.keys(marks).length ? { marks } : {}) };
  });
  return normalizeRichText([...a, ...mid, ...c]);
}

/** True when every character in [from, to) has `mark` set. */
export function hasMark(value: RichTextValue, from: number, to: number, mark: keyof TextMarks): boolean {
  const [, rest] = splitRichText(value, from);
  const [b] = splitRichText(rest, to - from);
  return b.length > 0 && b.every((s) => !!s.marks?.[mark]);
}
