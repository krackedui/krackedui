// 11. Responsive: every docs example (alone, from the packed package) and every template route at
// 320/375/768/1024/1440 px: no page-level horizontal scroll, nothing extending past the viewport
// unless an ancestor clips or scrolls it, no nowrap text overflowing its box.
// Each example loads twice: on a touch phone at the widths < 768 and on desktop for the rest, resizing
// the viewport between widths (layout, media queries and resize observers follow the resize).
import { pool } from '../lib/context.mjs';
import { openExample } from '../lib/consumer.mjs';
import { overflow } from '../lib/audits.mjs';
import { responsiveWidths } from '../lib/settings.mjs';

async function run_(ctx) {
  const app = await ctx.examplesApp();
  const browser = await ctx.browser();
  const details = [];
  const byWidth = {};
  const failed = new Set();
  const groups = [
    [responsiveWidths.filter((w) => w < 768), { hasTouch: true, isMobile: true }],
    [responsiveWidths.filter((w) => w >= 768), {}],
  ].filter(([ws]) => ws.length);
  for (const [widths, opts] of groups) {
    const context = await browser.newContext({ viewport: { width: widths[0], height: 900 }, reducedMotion: 'reduce', ...opts });
    let done = 0;
    await pool(app.examples, 8, async (ex) => {
      const { page, ready, error } = await openExample(context, app, ex);
      try {
        if (!ready || error) return; // reported by the install check
        for (const [i, width] of widths.entries()) {
          if (i > 0) { await page.setViewportSize({ width, height: 900 }); await page.waitForTimeout(150); }
          for (const p of await overflow(page, width)) {
            byWidth[width] = (byWidth[width] ?? 0) + 1;
            failed.add(ex.name);
            details.push({ where: `${ex.name} @${width}`, message: `${p.rule}: ${p.message} — ${p.target}` });
          }
        }
      } catch (e) {
        details.push({ where: ex.name, message: `audit failed: ${e.message.split('\n')[0]}` });
      } finally {
        await page.close();
      }
      if (++done % 100 === 0) ctx.log(`responsive ${widths.join('/')}: ${done}/${app.examples.length}`);
    });
    await context.close();
  }
  const tpl = await (await import('../lib/templates.mjs')).templateAudits(ctx, 'responsive');
  details.push(...tpl.details);
  return {
    status: details.length ? 'fail' : 'pass',
    summary: `${app.examples.length - failed.size}/${app.examples.length} examples fit at ${responsiveWidths.join('/')} px (problems by width: ${responsiveWidths.map((w) => `${w}:${byWidth[w] ?? 0}`).join(', ')}); ${tpl.pages} template pages${tpl.note ? ` (${tpl.note})` : ''}`,
    details, data: { byWidth },
  };
}
export { run_ as run };
