// In-page audits shared by the a11y, responsive and templates checks. Each takes a Playwright page that
// has finished rendering and returns a list of problems ({ rule, message, target }).
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let axeSource;

/**
 * axe-core, WCAG 2.0–2.2 A/AA + best practices. Off: page-level landmark rules (the harness owns the page)
 * and axe's `target-size` (the standard requires 24 px targets on touch devices only; see targetSize()).
 */
export async function axe(page, { context = null } = {}) {
  axeSource ??= await fs.readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
  if (!(await page.evaluate(() => 'axe' in window))) await page.addScriptTag({ content: axeSource });
  const res = await page.evaluate(async (ctxSel) => {
    const r = await window.axe.run(ctxSel ? document.querySelector(ctxSel) : document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
      rules: { region: { enabled: false }, 'landmark-one-main': { enabled: false }, 'page-has-heading-one': { enabled: false }, 'target-size': { enabled: false } },
      resultTypes: ['violations'],
    });
    return r.violations.map((v) => ({ rule: v.id, impact: v.impact, message: v.help, nodes: v.nodes.length, target: v.nodes.slice(0, 3).map((n) => `${n.target.join(' ')}${n.failureSummary ? ` — ${n.failureSummary.split('\n').slice(1, 2).join('').trim()}` : ''}`).join(' | ') }));
  }, context);
  return res;
}

const describeEl = `(el) => {
  const id = el.id ? '#' + el.id : '';
  const role = el.getAttribute('role') ? '[role=' + el.getAttribute('role') + ']' : '';
  const name = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
  return el.tagName.toLowerCase() + id + role + (name ? ' "' + name + '"' : '');
}`;

/**
 * Tab through the page; every focused element must show a visible indicator: an outline (width > 0,
 * non-transparent), or a box-shadow / border-color / outline that differs from its unfocused state, on
 * the element, a pseudo-element, or one of its two nearest ancestors (focus-within rings).
 */
export async function focusVisible(page, { maxStops = 25 } = {}) {
  await page.mouse.move(0, 0);
  // unfocused signature of every focusable element (and its ancestors)
  await page.evaluate(() => {
    const sig = (el) => { const s = getComputedStyle(el); const a = getComputedStyle(el, '::after'); const b = getComputedStyle(el, '::before');
      return [s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.borderColor, a.boxShadow, a.outlineStyle, a.borderColor, b.boxShadow, b.borderColor, b.outlineStyle].join('|'); };
    window.__gateSig = sig;
    window.__gateBase = new Map();
    for (const el of document.querySelectorAll('*')) window.__gateBase.set(el, sig(el));
    // Something already focused at load (an autofocused field in an open popover) shows its focus style in
    // the snapshot: take its baseline (and its ancestors') while blurred, then give focus back.
    const active = document.activeElement;
    if (active && active !== document.body && active instanceof HTMLElement) {
      active.blur();
      for (let n = active, k = 0; n && k < 3; n = n.parentElement, k++) window.__gateBase.set(n, sig(n));
      active.focus({ preventScroll: true });
    }
  });
  const problems = [];
  const seen = new Set();
  for (let i = 0; i < maxStops; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(60);
    const r = await page.evaluate(`(() => {
      const describe = ${describeEl};
      const el = document.activeElement;
      if (!el || el === document.body || el === document.documentElement) return { done: true };
      const key = describe(el) + '@' + Math.round(el.getBoundingClientRect().x) + ',' + Math.round(el.getBoundingClientRect().y);
      const visibleOutline = (s) => s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 && !/rgba\\([^)]*,\\s*0\\)|transparent/.test(s.outlineColor);
      const changed = (n) => window.__gateBase.has(n) && window.__gateBase.get(n) !== window.__gateSig(n);
      let ok = visibleOutline(getComputedStyle(el)) || changed(el);
      let n = el.parentElement;
      for (let k = 0; !ok && n && k < 2; k++, n = n.parentElement) ok = changed(n);
      const rect = el.getBoundingClientRect();
      const hidden = rect.width < 2 || rect.height < 2;
      return { key, ok: ok || hidden, what: describe(el) };
    })()`);
    if (r.done) break;
    if (seen.has(r.key)) break;
    seen.add(r.key);
    if (!r.ok) problems.push({ rule: 'focus-visible', message: 'no visible focus indicator', target: r.what });
  }
  return { problems, stops: seen.size };
}

const INTERACTIVE = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=checkbox], [role=radio], [role=switch], [role=tab], [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=option], [role=slider], [role=combobox], [role=spinbutton], [role=treeitem], [tabindex]:not([tabindex="-1"])';

/**
 * WCAG 2.5.8 target size (24×24) on a touch device. Exempt: inline links inside text, visually hidden
 * elements, disabled controls, and undersized targets whose 24 px circle overlaps no other target
 * (the spacing exception). A control inside a <label> counts the label as its target.
 */
export async function targetSize(page, { min = 24 } = {}) {
  return page.evaluate(`(() => {
    const describe = ${describeEl};
    const MIN = ${min};
    const els = [...document.querySelectorAll(${JSON.stringify(INTERACTIVE)})];
    const visible = (el) => {
      if (el.closest('[aria-hidden="true"], [inert]')) return false;
      const s = getComputedStyle(el);
      if (s.visibility === 'hidden' || s.display === 'none' || parseFloat(s.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) return false;
      if (s.clip === 'rect(0px, 0px, 0px, 0px)' || s.clipPath === 'inset(50%)') return false;
      return true;
    };
    const inlineLink = (el) => {
      if (el.tagName !== 'A' || getComputedStyle(el).display !== 'inline') return false;
      const block = el.parentElement;
      if (!block) return false;
      const text = [...block.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('');
      return text.length > 0;
    };
    const targets = [];
    for (const el of els) {
      if (!visible(el) || el.disabled || el.getAttribute('aria-disabled') === 'true') continue;
      if (els.some((o) => o !== el && o.contains(el) && visible(o))) continue; // nested: the outer one is the target
      const label = el.closest('label');
      const r = (label && label.contains(el) ? label : el).getBoundingClientRect();
      targets.push({ el, r, inline: inlineLink(el) });
    }
    const out = [];
    const small = targets.filter((t) => !t.inline && (t.r.width < MIN - 0.5 || t.r.height < MIN - 0.5));
    for (const t of small) {
      const cx = t.r.x + t.r.width / 2, cy = t.r.y + t.r.height / 2;
      const hitsRect = targets.some((o) => o !== t && (() => {
        const nx = Math.max(o.r.left, Math.min(cx, o.r.right)), ny = Math.max(o.r.top, Math.min(cy, o.r.bottom));
        return (nx - cx) ** 2 + (ny - cy) ** 2 < (MIN / 2) ** 2;
      })());
      const hitsCircle = small.some((o) => o !== t && Math.hypot(o.r.x + o.r.width / 2 - cx, o.r.y + o.r.height / 2 - cy) < MIN);
      if (hitsRect || hitsCircle) out.push({ rule: 'target-size', message: Math.round(t.r.width) + '×' + Math.round(t.r.height) + ' px (< ' + MIN + '×' + MIN + ') and too close to another target', target: describe(t.el) });
    }
    return { problems: out, targets: targets.length, coarse: matchMedia('(pointer: coarse)').matches };
  })()`);
}

/**
 * Horizontal overflow at the current viewport width: page-level scroll, visible elements extending past
 * the viewport (unless an ancestor clips or scrolls them), and nowrap text overflowing its own box.
 */
export async function overflow(page, width) {
  // Compare with the configured width: mobile emulation zooms out to fit wide content, which would
  // otherwise widen innerWidth and hide the overflow.
  const out = await page.evaluate(`(() => {
    const describe = ${describeEl};
    const W = ${Number(width) || 0} || window.innerWidth;
    const out = [];
    const se = document.scrollingElement;
    if (se.scrollWidth > W + 1) out.push({ rule: 'page-overflow', message: 'page scrolls horizontally: scrollWidth ' + se.scrollWidth + ' > ' + W, target: 'document' });
    const clips = (el) => { const s = getComputedStyle(el); return /auto|hidden|scroll|clip/.test(s.overflowX) || /auto|hidden|scroll|clip/.test(s.overflow); };
    const clippedByAncestor = (el) => { for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) if (clips(n)) return true; return false; };
    const shown = (el) => {
      const s = getComputedStyle(el);
      if (s.visibility === 'hidden' || s.display === 'none' || parseFloat(s.opacity) === 0) return false;
      if (s.clip === 'rect(0px, 0px, 0px, 0px)' || s.clipPath === 'inset(50%)' || el.closest('[aria-hidden="true"][style*="position: absolute"]')) return false;
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    };
    const reported = [];
    for (const el of document.body.querySelectorAll('*')) {
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
      if (reported.some((p) => p.contains(el))) continue;
      const r = el.getBoundingClientRect();
      if ((r.right > W + 1 || r.left < -1) && shown(el) && !clippedByAncestor(el)) {
        reported.push(el);
        out.push({ rule: 'off-screen', message: 'extends past the viewport (' + Math.round(r.left) + '…' + Math.round(r.right) + ' of ' + W + ')', target: describe(el) });
        continue;
      }
      const s = getComputedStyle(el);
      if (s.overflowX === 'visible' && /nowrap|pre$/.test(s.whiteSpace) && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0 && shown(el) && !clippedByAncestor(el)
        && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) {
        reported.push(el);
        out.push({ rule: 'text-overflow', message: 'text overflows its box (' + el.scrollWidth + ' > ' + el.clientWidth + ')', target: describe(el) });
      }
    }
    return out;
  })()`);
  // identical hits (e.g. one decoration repeated in every row) are reported once, with a count
  const seen = new Map();
  for (const p of out) { const k = `${p.rule}|${p.message}|${p.target}`; const hit = seen.get(k); if (hit) hit.count++; else seen.set(k, { ...p, count: 1 }); }
  return [...seen.values()].map((p) => (p.count > 1 ? { ...p, message: `${p.message} (×${p.count})` } : p));
}
