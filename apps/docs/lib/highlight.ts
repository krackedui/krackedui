// Synchronous Shiki highlighter (JS regex engine) so code renders identically on server and client.
// Colors are CSS variables (see globals.css) so light/dark swap without re-highlighting.
import { createHighlighterCoreSync, type ThemeRegistration } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import tsx from 'shiki/langs/tsx.mjs';
import ts from 'shiki/langs/typescript.mjs';
import bash from 'shiki/langs/bash.mjs';
import css from 'shiki/langs/css.mjs';
import json from 'shiki/langs/json.mjs';

const theme: ThemeRegistration = {
  name: 'docs',
  type: 'light',
  colors: { 'editor.foreground': 'var(--code-fg)', 'editor.background': 'transparent' },
  fg: 'var(--code-fg)',
  bg: 'transparent',
  settings: [
    { settings: { foreground: 'var(--code-fg)' } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: 'var(--code-comment)' } },
    {
      scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.operator', 'keyword.control',
        'punctuation.separator.key-value', 'string.unquoted.argument.shell', 'constant.other.option'],
      settings: { foreground: 'var(--code-keyword)' },
    },
    { scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'], settings: { foreground: 'var(--code-string)' } },
    {
      scope: ['variable.other.constant', 'constant.language.import-export-all', 'entity.name.tag', 'support.class.component',
        'entity.name.type', 'constant.numeric', 'constant.language', 'support.type.property-name.css'],
      settings: { foreground: 'var(--code-fn)' },
    },
    { scope: ['entity.name.function', 'support.function', 'entity.name.command', 'meta.tag.attributes entity.other.attribute-name', 'entity.other.attribute-name'], settings: { foreground: 'var(--code-pink)' } },
    { scope: ['variable.other.readwrite', 'variable.other.object', 'meta.object-literal.key', 'punctuation'], settings: { foreground: 'var(--code-fg)' } },
  ],
};

let highlighter: ReturnType<typeof createHighlighterCoreSync> | null = null;
function get() {
  highlighter ??= createHighlighterCoreSync({
    themes: [theme],
    langs: [tsx, ts, bash, css, json],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

const cache = new Map<string, string>();
export function highlight(code: string, lang: string = 'tsx'): string {
  const key = lang + '\u0000' + code;
  const hit = cache.get(key);
  if (hit) return hit;
  // tokenizeTimeLimit: 0 = no per-line time limit. With Shiki's default (500 ms) a line that takes too
  // long is cut off and the rest emitted uncolored, so the output would depend on machine load (the first
  // call compiles the grammar's regexes lazily); server and client could then disagree during hydration.
  // Our snippets are short and trusted, so full tokenization is cheap and always deterministic.
  const html = get().codeToHtml(code.replace(/\n$/, ''), { lang, theme: 'docs', tokenizeTimeLimit: 0 });
  cache.set(key, html);
  return html;
}
