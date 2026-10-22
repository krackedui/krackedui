// 10. Accessibility: on every docs example (rendered alone from the packed package) and every template
// route: axe-core 0 violations in light and dark; tabbing shows a visible focus indicator on every
// stop; on a touch device (pointer: coarse, 375 px) interactive targets are ≥ 24×24 (WCAG 2.5.8).
import { pool } from '../lib/context.mjs';
import { openExample } from '../lib/consumer.mjs';
import { axe, focusVisible, targetSize } from '../lib/audits.mjs';

export async function auditPage(page, { theme, touch }) {
  const problems = [];
  for (const v of await axe(page)) problems.push({ rule: `axe/${v.rule}`, message: `${v.message} (${v.impact}, ${v.nodes} nodes)`, target: v.target, theme });
  if (theme === 'light' && !touch) for (const p of (await focusVisible(page)).problems) problems.push({ ...p, theme });
  if (touch) { const t = await targetSize(page); for (const p of t.problems) problems.push({ ...p, theme: 'touch 375' }); if (!t.coarse) problems.push({ rule: 'harness', message: '(pointer: coarse) did not match under touch emulation', target: '', theme: 'touch 375' }); }
  return problems;
}

export const contexts = {
  light: { viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' },
  dark: { viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce', colorScheme: 'dark' },
  touch: { viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, reducedMotion: 'reduce' },
};

async function run_(ctx) {
  const app = await ctx.examplesApp();
  const browser = await ctx.browser();
  const details = [];
  const byRule = {};
  const failedExamples = new Set();
  for (const mode of ['light', 'dark', 'touch']) {
    const context = await browser.newContext(contexts[mode]);
    let done = 0;
    await pool(app.examples, 8, async (ex) => {
      const { page, ready, error } = await openExample(context, app, ex, { theme: mode === 'dark' ? 'dark' : 'light' }).catch((e) => ({ page: null, error: e.message }));
      if (page && ready && !error) {
        try {
          for (const p of await auditPage(page, { theme: mode === 'dark' ? 'dark' : 'light', touch: mode === 'touch' })) {
            byRule[p.rule] = (byRule[p.rule] ?? 0) + 1;
            failedExamples.add(ex.name);
            details.push({ where: `${ex.name} (${p.theme})`, message: `${p.rule}: ${p.message}${p.target ? ` — ${p.target}` : ''}` });
          }
        } catch (e) { details.push({ where: `${ex.name} (${mode})`, message: `audit failed: ${e.message.split('\n')[0]}` }); }
      }
      await page?.close();
      if (++done % 100 === 0) ctx.log(`a11y ${mode}: ${done}/${app.examples.length}`);
    });
    await context.close();
  }
  // templates
  const tpl = await (await import('../lib/templates.mjs')).templateAudits(ctx, 'a11y');
  details.push(...tpl.details);
  for (const [k, v] of Object.entries(tpl.byRule)) byRule[k] = (byRule[k] ?? 0) + v;
  const rules = Object.entries(byRule).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ');
  return {
    status: details.length ? 'fail' : 'pass',
    summary: `${app.examples.length - failedExamples.size}/${app.examples.length} examples clean (axe light+dark, focus-visible, 24px targets on touch); ${tpl.pages} template pages${tpl.note ? ` (${tpl.note})` : ''}${rules ? ` — by rule: ${rules}` : ''}`,
    details, data: { byRule },
  };
}
export { run_ as run };
